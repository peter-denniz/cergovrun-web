import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import vytiahni_css as vc

HTML = ('<!doctype html><html><head><style>:root{color-scheme:light}body{margin:0}</style></head><body>\n'
        '<style>\n/* komentár {} */\n.a{color:red}\n@media (max-width:700px){.b{x:1}}\n</style>\n<p>t</p>\n'
        '<template id="css-pretek">\n:root{--x:1}\n.c{y:2}\n</template>\n')


class TestVytiahniCss(unittest.TestCase):
    def test_hlavny(self):
        css = vc.hlavny_styl(HTML)
        self.assertNotIn("color-scheme:light", css)
        self.assertIn(".a{color:red}", css)
        self.assertEqual(vc.pocet_pravidiel(css), 3)

    def test_sablony(self):
        s = vc.sablony(HTML)
        self.assertEqual(list(s), ["pretek"])
        self.assertEqual(vc.pocet_pravidiel(s["pretek"]), 2)

    def test_vytiahni(self):
        with tempfile.TemporaryDirectory() as d:
            vstup = Path(d) / "vstup.html"
            vstup.write_text(HTML, encoding="utf-8")
            vc.vytiahni(vstup, Path(d))
            self.assertEqual((Path(d) / "spolocne/styly.css").read_text(encoding="utf-8"), vc.hlavny_styl(HTML))
            self.assertEqual((Path(d) / "stranky/pretek/pretek.css").read_text(encoding="utf-8"), vc.sablony(HTML)["pretek"])

    def test_realny_subor(self):
        cesta = Path(__file__).resolve().parent.parent / "index.html"
        if not cesta.exists():
            self.skipTest("index.html už nie je")
        html = cesta.read_text(encoding="utf-8")
        povodne = {"hlavny": vc.hlavny_styl(html), **vc.sablony(html)}
        with tempfile.TemporaryDirectory() as d:
            subory = vc.vytiahni(cesta, Path(d))
            self.assertEqual(set(subory), {"hlavny", "pretek", "novinky", "klub"})
            for meno, s in subory.items():
                n = vc.pocet_pravidiel(s.read_text(encoding="utf-8"))
                self.assertEqual(n, vc.pocet_pravidiel(povodne[meno]))
                self.assertGreater(n, 10)
        self.assertNotIn("color-scheme:light", povodne["hlavny"])


if __name__ == "__main__":
    unittest.main()
