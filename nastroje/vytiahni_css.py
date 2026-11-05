"""Vytiahne CSS z prototypu index.html: hlavný <style> a šablóny <template id="css-…"> do samostatných súborov.
Obal artefaktu na prvom riadku (<style>:root{color-scheme:light…}) sa vynechá."""
import argparse
import re
from pathlib import Path

HLAVNY = re.compile(r"^<style>\n(.*?)^</style>$", re.S | re.M)
SABLONA = re.compile(r'^<template id="css-([a-z0-9_-]+)">\n(.*?)^</template>$', re.S | re.M)
KOMENTAR = re.compile(r"/\*.*?\*/", re.S)

CIELE = {
    "hlavny": "spolocne/styly.css",
    "pretek": "stranky/pretek/pretek.css",
    "novinky": "stranky/klub/novinky.css",
    "klub": "stranky/klub/klub.css",
}


def hlavny_styl(html: str) -> str:
    m = HLAVNY.search(html)
    if not m:
        raise ValueError("hlavný <style> sa nenašiel")
    return m.group(1)


def sablony(html: str) -> dict[str, str]:
    return {meno: css for meno, css in SABLONA.findall(html)}


def pocet_pravidiel(css: str) -> int:
    """Počet uzatváracích zátvoriek mimo komentárov (pravidlá aj @media bloky)."""
    return KOMENTAR.sub("", css).count("}")


def vytiahni(html_cesta: Path, koren: Path) -> dict[str, Path]:
    html = Path(html_cesta).read_text(encoding="utf-8")
    css = {"hlavny": hlavny_styl(html), **sablony(html)}
    vystup = {}
    for meno, text in css.items():
        ciel = Path(koren) / CIELE.get(meno, f"stranky/{meno}.css")
        ciel.parent.mkdir(parents=True, exist_ok=True)
        ciel.write_text(text, encoding="utf-8", newline="\n")
        vystup[meno] = ciel
    return vystup


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("html", nargs="?", default="index.html")
    ap.add_argument("--koren", default=".")
    a = ap.parse_args()
    for meno, s in vytiahni(Path(a.html), Path(a.koren)).items():
        print(f"{meno:8} {s}  {pocet_pravidiel(s.read_text(encoding='utf-8'))} pravidiel")


if __name__ == "__main__":
    main()
