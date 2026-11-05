import json, sys, tempfile, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import zostav

class TestPredpona(unittest.TestCase):
    def test_jednoduche(self):
        self.assertEqual(zostav.predpona_css(".a{color:red}", "v-x"), "#v-x .a{color:red}")

    def test_zoznam(self):
        self.assertEqual(zostav.predpona_css(".a, .b>p{x:1}", "v-x"), "#v-x .a,#v-x .b>p{x:1}")

    def test_koren_vynechany(self):
        self.assertEqual(zostav.predpona_css(":root{--a:1}\nhtml{x:1}\nbody::before{y:2}\nhtml,.c{z:3}", "v-x"), "#v-x .c{z:3}")

    def test_media(self):
        out = zostav.predpona_css("@media(max-width:800px){.a{x:1}body{y:1}}", "v-x")
        self.assertIn("@media(max-width:800px){", out)
        self.assertIn("#v-x .a{x:1}", out)
        self.assertNotIn("body", out)

    def test_komentar(self):
        self.assertEqual(zostav.predpona_css("/* {x} */.a{x:1}", "v-x"), "#v-x .a{x:1}")

class TestZostav(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.ciel = Path(cls.tmp.name)
        cls.weby = zostav.zostav(cls.ciel)
        cls.stranky = zostav.nacitaj(zostav.KOREN / "stranky" / "stranky.json")
        cls.adresy = zostav.nacitaj(zostav.KOREN / "weby.json")

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def html(self, web, vystup="index.html"):
        return (self.weby[web] / vystup).read_text(encoding="utf-8")

    def test_tri_weby(self):
        self.assertEqual(set(self.weby), {"klub", "hreben", "umirak"})
        folder_names = {p.name for p in self.weby["klub"].parent.iterdir() if p.is_dir()}
        self.assertEqual(folder_names, {"cergovrun.sk", "behhrebenomcergova.cergovrun.sk", "cergovskyumirak.cergovrun.sk"})

    def test_samostatne(self):
        for web, folder in self.weby.items():
            self.assertTrue((folder / "spolocne" / "styly.css").exists())
            self.assertTrue((folder / "spolocne" / "obsah.js").exists())
            self.assertTrue((folder / "spolocne" / "mapa.js").exists())
            self.assertTrue((folder / "data" / "preteky.json").exists())
            self.assertFalse((folder / "spolocne" / "ram.html").exists())

    def test_ziadne_znacky(self):
        for web in self.weby:
            for s in self.stranky[web]["stranky"]:
                text = self.html(web, s["vystup"])
                self.assertNotIn("{{", text)
                self.assertIn(f'data-web="{web}"', text)

    def test_odkazy_podla_webov(self):
        self.assertIn(self.adresy["hreben"]["adresa"], self.html("klub", "index.html"))
        self.assertIn(self.adresy["umirak"]["adresa"], self.html("klub", "index.html"))
        self.assertIn(self.adresy["klub"]["adresa"] + "novinky/", self.html("hreben", "index.html"))
        self.assertNotIn('href="#pretek-', self.html("klub"))

    def test_base_v_podpriecinku(self):
        self.assertIn('<base href="../">', self.html("klub", "novinky/index.html"))
        self.assertNotIn("<base", self.html("klub"))

    def test_css_uzavrete(self):
        text = self.weby["hreben"] / "stranky" / "pretek" / "pretek.css"
        for line in text.read_text(encoding="utf-8").splitlines():
            if line and not line.startswith("@") and line != "}":
                self.assertTrue(line.startswith("#v-pretek "))

    def test_iny_web_na_subdomene(self):
        with tempfile.TemporaryDirectory() as d:
            w = json.loads(json.dumps(self.adresy))
            w["hreben"]["adresa"] = "https://behhrebenomcergova.cergovrun.sk/"
            out = zostav.zostav(Path(d), weby=w)
            text = (out["klub"] / "index.html").read_text(encoding="utf-8")
            self.assertIn("https://behhrebenomcergova.cergovrun.sk/", text)
            self.assertNotIn(self.adresy["hreben"]["adresa"], text)

    def test_nahlad(self):
        with tempfile.TemporaryDirectory() as d:
            out = zostav.zostav(Path(d), nahlad=True)
            text = (out["klub"] / "index.html").read_text(encoding="utf-8")
            for web in ("klub", "hreben", "umirak"):
                self.assertIn(f'http://localhost:{self.stranky[web]["nahlad"]}/', text)

if __name__ == "__main__":
    unittest.main()
