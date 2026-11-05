# Čergovrun – návrh webu

Prototyp nového webu bežeckého klubu Čergovrun (cergovrun.sk). Statické HTML, CSS a JS; obsah je v JSON súboroch.
Klub a každý pretek sú samostatné weby, aby preteky mohli bežať na vlastných subdoménach.


## Štruktúra
- `weby.json` – adresa každého webu (`klub`, `hreben`, `umirak`). Všetky odkazy medzi webmi sa tvoria z neho:
  v HTML značkou `{{odkaz web cesta}}`, v JS funkciou `odkaz(web, cesta)`. Presun preteku na subdoménu = zmena jednej adresy.
- `data/` – obsah (preteky, trate, novinky, galéria, klub, výbehy), popis polí v `data/README.md`.
- `spolocne/` – rám stránky (`ram.html`: pozadie, hlavička), `styly.css`, `obsah.js` (načítanie obsahu, `odkaz()`),
  `mapa.js` (projekcia, trasy v pozadí, výškový profil, mapa trate), `ram.js` (menu, pozadie), `grafika/`.
- `stranky/klub/` – úvod, novinky, o klube. `stranky/pretek/` – jedna šablóna pre všetky preteky;
  ktorý pretek sa zobrazí, určuje kľúč webu (= `slug` v `data/preteky.json`).
- `stranky/stranky.json` – ktoré stránky tvoria ktorý web, priečinok v `dist/` a port náhľadu.
- `galeria/` – fotky (kopírujú sa len na web klubu).
- `nastroje/` – skripty a testy (nižšie).

CSS podstránok sa pri zostavení uzavrie pod obal stránky (`#v-pretek …`), presne ako to predtým robil `scopeCss()`.

## Zostavenie a náhľad
```
python nastroje/zostav.py
```
vytvorí `dist/cergovrun.sk/`, `dist/behhrebenomcergova.cergovrun.sk/` a `dist/cergovskyumirak.cergovrun.sk/`.
Každý priečinok je samostatný (spoločné súbory aj dáta), subdoména naň môže ukazovať priamo.

```
python nastroje/nahlad.py
```
zostaví weby s lokálnymi adresami do `dist/_nahlad/` a servíruje ich na http://localhost:8000 (klub),
:8001 (Beh hrebeňom) a :8002 (Umirak).

### Náhľad na Netlify
https://cergovrun.netlify.app/ je jeden web: klub na koreni, preteky v `/beh-hrebenom-cergova/` a `/cergovsky-umirak/`
(adresy vo `weby.netlify.json`). Netlify ho zostaví podľa `netlify.toml`; lokálne to isté urobí
```
python nastroje/zostav.py --adresy weby.netlify.json --spoj --ciel dist/netlify
```
a výsledok je v `dist/netlify/cergovrun.netlify.app/`.

Testy nástrojov:
```
python -m unittest discover -s nastroje -p "test_*.py"
```

`nastroje/vytiahni_data.py` a `nastroje/vytiahni_css.py` sú jednorazové skripty, ktoré rozdelili pôvodný `index.html`
(v histórii gitu) na `data/*.json` a CSS súbory.
