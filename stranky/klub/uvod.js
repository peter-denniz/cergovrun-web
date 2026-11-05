/* Úvod klubu: preteky, novinky a galéria z data/*.json (načíta obsah.js) */
(function(){
const kartaPreteku=p=>{const k=p.karta,z=k.zvyraznenie,znak=[p.itra?"ITRA "+p.itra:"",p.liga].filter(Boolean).join(" · ");return `<article class="race${p.hlavny?" main":""}">
 <div class="meta"><span class="lab">${esc(p.mesiac)}</span><span>${esc(p.miesto)}</span>${znak?`<span>${esc(znak)}</span>`:""}</div>
 <h3>${esc(p.nazov)}</h3>
 <div class="stats">${k.cisla.map(c=>`<div><b>${esc(c.hodnota)}</b><span>${esc(c.popis)}</span></div>`).join("")}</div>
 <div class="prof" id="prof-${p.slug}"></div>
 <div class="win"><span>${esc(z.nadpis)} · <b>${esc(z.meno)}</b>, ${esc(z.doplnok)}</span><span><b>${esc(z.cas)}</b> · ${esc(z.tempo)}</span></div>
 <div class="acts"><a class="cta" href="${esc(odkaz(p.slug))}">Detail preteku</a><a class="ghost" href="${esc(k.vysledky.url)}">Výsledky ${k.vysledky.rok}</a><a class="ghost" href="${esc(p.gpx)}">GPX trate</a></div>
</article>`};
Promise.all([obsah("trate"),obsah("preteky"),obsah("novinky"),obsah("galeria")]).then(([T,P,N,G])=>{
 const preteky=P.slice().sort((a,b)=>(b.hlavny?1:0)-(a.hlavny?1:0));
 document.getElementById("uPreteky").innerHTML=preteky.map(kartaPreteku).join("");
 preteky.forEach(p=>profile(document.getElementById("prof-"+p.slug),T[p.trasa]));
 const nove=N.slice().sort((a,b)=>(a.ukazka-b.ukazka)||(b.datum||"").localeCompare(a.datum||"")).slice(0,3);
 document.getElementById("uNovinky").innerHTML=nove.map(c=>`<a href="${esc(odkaz("klub","novinky/#"+c.slug))}"><span class="lab">${datumSk(c.datum,"Ukážka")} · ${esc(c.kategoria)}</span><h3>${esc(c.nazov)}</h3><p>${esc(c.perex)}</p></a>`).join("");
 document.getElementById("uGaleriaNazov").textContent=G.nazov;
 document.getElementById("uGaleria").innerHTML=G.fotky.slice(0,5).map(f=>`<figure><img src="${esc(f.subor)}" alt="${esc(f.popis)}"${f.vyrez?` style="object-position:${esc(f.vyrez)}"`:""} loading="lazy"><figcaption>${esc(f.titulok)}</figcaption></figure>`).join("");
 kotva();
});

/* Prototyp: pripojenie Stravy zatiaľ nefunguje, tlačidlo len vysvetlí ďalší krok */
document.querySelectorAll(".strava").forEach(b=>b.addEventListener("click",()=>{
 const n=b.nextElementSibling;if(n)n.textContent="V prototype je pripojenie len naznačené. Na ostrom webe ťa tlačidlo presmeruje na Stravu, kde dáš súhlas. Jedno pripojenie platí pre obe výzvy.";
}));
})();
