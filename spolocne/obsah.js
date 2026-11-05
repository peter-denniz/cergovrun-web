/* Jediné miesto, odkiaľ web berie obsah. Stránky nevedia, kto obsah spravuje.
   Dnes: JSON súbory v data/ (ak je blok vložený priamo do stránky ako <script type="application/json" id="data-…">, použije sa ten).
   Neskôr: redakcia (WordPress REST API alebo vlastný jednoduchý CRUD) vráti rovnaké JSON a zmení sa len OBSAH_ZDROJ.
   Štruktúra každého súboru je popísaná v data/README.md. */
const OBSAH_ZDROJ = "data/";
const _obsahCache = {};
function obsah(meno) {
 if (!_obsahCache[meno]) {
  const vlozene = document.getElementById("data-" + meno);
  _obsahCache[meno] = vlozene
   ? Promise.resolve(JSON.parse(vlozene.textContent))
   : fetch(OBSAH_ZDROJ + meno + ".json").then(r => { if (!r.ok) throw new Error("Obsah " + meno + ": " + r.status); return r.json() });
 }
 return _obsahCache[meno];
}
/* "2026-10-24" -> "24. 10. 2026"; prázdny dátum vráti náhradný text */
function datumSk(iso, nahrada = "") {
 if (!iso) return nahrada;
 const [r, m, d] = iso.slice(0, 10).split("-").map(Number);
 return `${d}. ${m}. ${r}`;
}
/* text z obsahu do HTML (obsah článkov je už HTML, ostatné polia sú čistý text) */
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/* Adresy webov sú vo weby.json (zostav.py ich vloží do stránky ako data-weby). Klub, každý pretek = jeden web.
   odkaz("klub", "novinky/") -> "https://cergovrun.sk/novinky/"; prechod na subdoménu = zmena adresy vo weby.json. */
const WEBY = JSON.parse(document.getElementById("data-weby").textContent);
const WEB = document.documentElement.dataset.web;
function odkaz(web, cesta = "") {
 if (!WEBY[web]) throw new Error("Neznámy web: " + web);
 return WEBY[web].adresa + cesta;
}
