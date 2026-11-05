"""Poskladá samostatné weby do dist/<priecinok>/ podľa weby.json a stranky/stranky.json.
Každý priečinok obsahuje všetko, čo potrebuje (spoločné súbory, dáta, stránky), aby naň mohla ukazovať subdoména.

  python nastroje/zostav.py            # adresy z weby.json
  python nastroje/zostav.py --nahlad   # adresy http://localhost:<port>/ pre nastroje/nahlad.py
  python nastroje/zostav.py --adresy weby.netlify.json --spoj --ciel dist/netlify
                                       # iné adresy; weby na jednej doméne spojí do jedného priečinka
"""
import argparse
import html
import json
import re
import shutil
from pathlib import Path
from urllib.parse import urlsplit

KOREN = Path(__file__).resolve().parent.parent
ZNACKA = re.compile(r"\{\{([^{}]*)\}\}")
KOMENTAR = re.compile(r"/\*.*?\*/", re.S)
# selektory, ktoré v podstránke nesmú platiť (premenné a základ berie stránka zo spoločných štýlov)
KORENOVE = re.compile(r"^(:root|html|body)\b")


def nacitaj(cesta: Path):
    return json.loads(Path(cesta).read_text(encoding="utf-8"))


def adresy_nahladu(weby: dict, stranky: dict) -> dict:
    """Kópia weby.json s lokálnymi adresami http://localhost:<port>/."""
    return {k: {**v, "adresa": f"http://localhost:{stranky[k]['nahlad']}/"} for k, v in weby.items()}


# ---------- CSS: uzavretie pod obal stránky (to isté, čo v prototype robilo scopeCss) ----------

def _blok(css: str, i: int) -> int:
    """Index za zátvorkou }, ktorá uzatvára blok otvorený na css[i] == '{'."""
    hlbka = 0
    for j in range(i, len(css)):
        if css[j] == "{":
            hlbka += 1
        elif css[j] == "}":
            hlbka -= 1
            if hlbka == 0:
                return j + 1
    raise ValueError("neuzavretý blok v CSS")


def predpona_css(css: str, rozsah: str) -> str:
    """Každému selektoru pridá predponu `#rozsah `. Selektory :root/html/body vynechá (pravidlo bez selektora zmizne).
    Do @media a @supports vojde, @keyframes a ostatné @pravidlá nechá tak."""
    css = KOMENTAR.sub("", css)
    von, i = [], 0
    while True:
        z = css.find("{", i)
        if z < 0:
            zvysok = css[i:].strip()
            if zvysok:
                von.append(zvysok)  # napr. @import; bez bloku
            break
        hlava, koniec = css[i:z].strip(), _blok(css, z)
        telo = css[z + 1:koniec - 1]
        if hlava.startswith("@media") or hlava.startswith("@supports"):
            vnutro = predpona_css(telo, rozsah)
            if vnutro:
                von.append(f"{hlava}{{\n{vnutro}\n}}")
        elif hlava.startswith("@"):
            von.append(f"{hlava}{{{telo}}}")
        else:
            selektory = [s.strip() for s in hlava.split(",")]
            nove = [f"#{rozsah} {s}" for s in selektory if s and not KORENOVE.match(s)]
            if nove:
                von.append(f"{','.join(nove)}{{{telo.strip()}}}")
        i = koniec
    return "\n".join(von)


# ---------- HTML ----------

def dopln(text: str, hodnoty: dict, weby: dict) -> str:
    """Nahradí {{meno}} hodnotou a {{odkaz web cesta}} adresou z weby.json. Neznáma značka = chyba."""
    def nahrad(m):
        casti = m.group(1).strip().split(" ", 2)
        if casti[0] == "odkaz":
            web = casti[1] if len(casti) > 1 else ""
            if web not in weby:
                raise KeyError(f"neznámy web v odkaze: {m.group(0)}")
            return html.escape(weby[web]["adresa"] + (casti[2] if len(casti) > 2 else ""))
        if len(casti) == 1 and casti[0] in hodnoty:
            return hodnoty[casti[0]]
        raise KeyError(f"neznáma značka: {m.group(0)}")
    return ZNACKA.sub(nahrad, text)


def stranka(ram: str, web: str, s: dict, weby: dict, zdroj: Path) -> str:
    hlbka = s["vystup"].count("/")
    weby_json = json.dumps(weby, ensure_ascii=False).replace("</", "<\\/")
    obsah = (zdroj / "stranky" / s["sablona"]).read_text(encoding="utf-8")
    hodnoty = {
        "web": web,
        "titul": html.escape(s["titul"]),
        # stránka v podpriečinku (novinky/) berie spoločné súbory a dáta z koreňa webu
        "base": f'<base href="{"../" * hlbka}">\n' if hlbka else "",
        "css": "".join(f'<link rel="stylesheet" href="stranky/{c}">\n' for c in s.get("css", [])),
        "obsah": dopln(obsah, {}, weby),
        "weby": weby_json,
        "skripty": "".join(f'<script src="stranky/{j}"></script>\n' for j in s.get("js", [])),
    }
    return dopln(ram, hodnoty, weby)


def zostav(ciel: Path = KOREN / "dist", nahlad: bool = False, zdroj: Path = KOREN, weby: dict | None = None) -> dict:
    """Zostaví všetky weby. Vráti {kľúč webu: priečinok}."""
    zdroj, ciel = Path(zdroj), Path(ciel)
    stranky = nacitaj(zdroj / "stranky" / "stranky.json")
    weby = weby if weby is not None else nacitaj(zdroj / "weby.json")
    if nahlad:
        weby = adresy_nahladu(weby, stranky)
    ram = (zdroj / "spolocne" / "ram.html").read_text(encoding="utf-8")
    hotove = {}
    for web, conf in stranky.items():
        if web.startswith("_"):
            continue
        if web not in weby:
            raise KeyError(f"web {web} nie je vo weby.json")
        von = ciel / conf["priecinok"]
        if von.exists():
            shutil.rmtree(von)
        shutil.copytree(zdroj / "spolocne", von / "spolocne", ignore=shutil.ignore_patterns("ram.html"))
        shutil.copytree(zdroj / "data", von / "data", ignore=shutil.ignore_patterns("README.md"))
        for p in conf.get("subory", []):
            shutil.copytree(zdroj / p, von / p)
        for s in conf["stranky"]:
            for c in s.get("css", []):
                css = (zdroj / "stranky" / c).read_text(encoding="utf-8")
                if s.get("rozsah"):
                    css = predpona_css(css, s["rozsah"]) + "\n"
                zapis(von / "stranky" / c, css)
            for j in s.get("js", []):
                zapis(von / "stranky" / j, (zdroj / "stranky" / j).read_text(encoding="utf-8"))
            zapis(von / s["vystup"], stranka(ram, web, s, weby, zdroj))
        hotove[web] = von
    return hotove


def zapis(cesta: Path, text: str):
    cesta.parent.mkdir(parents=True, exist_ok=True)
    cesta.write_text(text, encoding="utf-8", newline="\n")


def spoj(hotove: dict, weby: dict, ciel: Path) -> dict:
    """Weby na rovnakej doméne poskladá do jedného priečinka ciel/<doména>/ podľa ciest v adresách
    (napr. klub na /, pretek na /beh-hrebenom-cergova/). Vráti {doména: priečinok}."""
    domeny = {}
    for web, priecinok in hotove.items():
        adresa = urlsplit(weby[web]["adresa"])
        domeny.setdefault(adresa.netloc, []).append((adresa.path.strip("/"), priecinok))
    von = {}
    for domena, casti in domeny.items():
        spolu = Path(ciel) / domena.replace(":", "_")
        if spolu.exists():
            shutil.rmtree(spolu)
        # najprv koreň, potom hlbšie cesty; zhodný súbor z dvoch webov je chyba
        for cesta, priecinok in sorted(casti, key=lambda c: c[0].count("/") + bool(c[0])):
            if (spolu / cesta).exists() and cesta and any((spolu / cesta).iterdir()):
                raise FileExistsError(f"{domena}/{cesta} už obsadil iný web")
            shutil.copytree(priecinok, spolu / cesta, dirs_exist_ok=True)
        von[domena] = spolu
    return von


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--ciel", default=str(KOREN / "dist"))
    ap.add_argument("--nahlad", action="store_true", help="adresy webov na localhost (pre nahlad.py)")
    ap.add_argument("--adresy", help="iný súbor s adresami namiesto weby.json (napr. weby.netlify.json)")
    ap.add_argument("--spoj", action="store_true", help="weby na jednej doméne spojí do ciel/<doména>/")
    a = ap.parse_args()
    weby = nacitaj(KOREN / a.adresy) if a.adresy else None
    ciel = Path(a.ciel)
    hotove = zostav(ciel / "_weby" if a.spoj else ciel, a.nahlad, weby=weby)
    if a.spoj:
        weby = weby or nacitaj(KOREN / "weby.json")
        for domena, von in spoj(hotove, weby, ciel).items():
            print(f"{domena:30} {von}")
        shutil.rmtree(ciel / "_weby")
        return
    for web, von in hotove.items():
        print(f"{web:8} {von}")


if __name__ == "__main__":
    main()
