# Čergovrun – návrh webu

Prototyp nového webu bežeckého klubu Čergovrun (cergovrun.sk). Statické HTML, CSS a JS bez buildu.

Zdroj: Claude artifact https://claude.ai/artifact/55AdyS9bwSesESB9aYZYx5

## Stránky
- `index.html` – úvod: preteky, novinky, výzvy, galéria (obsah je vložený ako JSON v `<script type="application/json" id="data-…">`)
- `pretek.html` – detail preteku (Beh hrebeňom Čergova, Čergovský umirak)
- `novinky.html` – archív noviniek a šablóna článku
- `klub.html` – o klube, kontakt, 2 % dane

## Súbory
- `trate.js` – trasy pretekov z GPX (ZASRUN), zredukované na `[km, šírka, dĺžka, výška]`
- `pozadie.js` – vrstevnice a kreslenie trás v pozadí podstránok
- `router.js` – prepínanie podstránok v prehliadači artefaktov; na bežnom hostingu stačia obyčajné odkazy
- `vrstevnice.svg`, `logo-hreben.svg`, `logo-ssa-svetle.png`, `galeria/` – grafika a fotky

## Spustenie
Otvor `index.html` cez lokálny server (kvôli `fetch` v routeri), napr.:

```
python -m http.server 8000
```

a choď na http://localhost:8000
