"""Vytiahne JSON bloky <script type="application/json" id="data-…"> z HTML do samostatných súborov data/*.json."""
import argparse
import json
import re
from pathlib import Path

BLOK = re.compile(r'<script type="application/json" id="data-([a-z0-9_-]+)">(.*?)</script>', re.S)


def najdi_bloky(html: str) -> dict[str, str]:
    """Vráti {meno: text bloku} v poradí, v akom sú v HTML."""
    return {meno: text.strip() for meno, text in BLOK.findall(html)}


def vycisti(text: str) -> str:
    """Nahradí escape <\\/ (potrebný len vnútri <script>) obyčajným </. Hodnota JSON sa nemení."""
    return text.replace("<\\/", "</")


def vytiahni(html_cesta: Path, ciel: Path) -> list[Path]:
    """Zapíše každý blok do ciel/<meno>.json a vráti zoznam zapísaných súborov."""
    html = Path(html_cesta).read_text(encoding="utf-8")
    ciel = Path(ciel)
    ciel.mkdir(parents=True, exist_ok=True)
    zapisane = []
    for meno, text in najdi_bloky(html).items():
        cisty = vycisti(text)
        if json.loads(cisty) != json.loads(text):
            raise ValueError(meno)
        subor = ciel / f"{meno}.json"
        subor.write_text(cisty + "\n", encoding="utf-8", newline="\n")
        zapisane.append(subor)
    return zapisane


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("html", nargs="?", default="index.html")
    ap.add_argument("--ciel", default="data")
    a = ap.parse_args()
    for s in vytiahni(Path(a.html), Path(a.ciel)):
        print(f"{s}  {s.stat().st_size} B")


if __name__ == "__main__":
    main()
