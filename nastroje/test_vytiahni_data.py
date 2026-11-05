import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import vytiahni_data as vd

HTML = r'''<p>x</p>
<script type="application/json" id="data-a">{"x": "Čergov <\/p>", "n": [1,2]}</script>
<script>const a = 1;</script>
<script type="application/json" id="data-b">[1, {"y": null}]
</script>
'''


class TestVytiahniData(unittest.TestCase):
    def test_najdi_bloky(self):
        self.assertEqual(list(vd.najdi_bloky(HTML)), ["a", "b"])

    def test_vytiahni(self):
        with tempfile.TemporaryDirectory() as d:
            vstup = Path(d) / "vstup.html"
            vstup.write_text(HTML, encoding="utf-8")
            out = Path(d) / "out"
            vd.vytiahni(vstup, out)
            bloky = vd.najdi_bloky(HTML)
            for meno in ("a", "b"):
                with open(out / f"{meno}.json", encoding="utf-8") as f:
                    self.assertEqual(json.load(f), json.loads(bloky[meno]))
            text = (out / "a.json").read_text(encoding="utf-8")
            self.assertIn("Čergov </p>", text)
            self.assertNotIn("<\\/", text)

    def test_realny_subor(self):
        cesta = Path(__file__).resolve().parent.parent / "index.html"
        if not cesta.exists():
            self.skipTest("index.html už nie je")
        bloky = vd.najdi_bloky(cesta.read_text(encoding="utf-8"))
        with tempfile.TemporaryDirectory() as d:
            vd.vytiahni(cesta, Path(d))
            self.assertEqual(set(bloky), {"galeria", "klub", "novinky", "preteky", "trate", "vybehy"})
            for meno, text in bloky.items():
                with open(Path(d) / f"{meno}.json", encoding="utf-8") as f:
                    self.assertEqual(json.load(f), json.loads(text))


if __name__ == "__main__":
    unittest.main()
