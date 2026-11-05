/* O klube: príbeh, spoločné výbehy, členstvo, 2 % dane a podpora */
(function(){
/* Obsah stránky je v data/klub.json a data/vybehy.json (načíta obsah.js) */
const DNI=["Ne","Po","Ut","St","Št","Pi","So"],MES=["jan","feb","mar","apr","máj","jún","júl","aug","sep","okt","nov","dec"];
Promise.all([obsah("klub"),obsah("vybehy"),obsah("preteky")]).then(([K,V,P])=>{
 const $k=id=>document.getElementById(id);
 $k("kUvod").textContent=K.uvod;
 $k("kCisla").innerHTML=[[K.zalozenie.slice(0,4),"vznik klubu"],[K.clenovia,"členov"],[P.length,"preteky ročne"]].map(c=>`<div><b>${esc(c[0])}</b><span class="lab">${c[1]}</span></div>`).join("");
 const F=K.fotka;
 $k("kFotka").innerHTML=F&&F.subor?`<img src="${esc(F.subor)}" alt="${esc(F.popis)}"><figcaption><span>${esc(F.titulok)}</span>${F.ukazka?"<span>Ukážka · nahradíme klubovou fotkou</span>":""}</figcaption>`:"";
 $k("kFotka").hidden=!(F&&F.subor);
 $k("kOd").textContent="od "+datumSk(K.zalozenie);
 $k("kPribeh").innerHTML=`<p class="story">${esc(K.nazov)} vzniklo ${datumSk(K.zalozenie)}.</p>`+
  (K.pribeh?`<div class="txt">${K.pribeh}</div>`:`<div class="todo"><b>Príbeh dopíše Lukáš.</b> Ako to celé začalo, kto bol pri tom a prečo práve Čergov. Pár odsekov, kľudne aj s historkou z prvého výbehu.</div>`);
 /* najbližšie výbehy: len budúce, zoradené podľa času */
 const dnes=new Date().toISOString().slice(0,10);
 const bud=V.filter(v=>v.zaciatok.slice(0,10)>=dnes).sort((a,b)=>a.zaciatok.localeCompare(b.zaciatok)).slice(0,4);
 $k("kVybehyLab").innerHTML="Najbližšie"+(bud.some(v=>v.ukazka)?' <span class="tag">ukážka</span>':"");
 $k("kVybehy").innerHTML=bud.length?bud.map(v=>{const d=new Date(v.zaciatok),det=[`${DNI[d.getDay()]} ${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`,v.miesto,v.km?v.km+" km":"",v.stupanie?"+"+v.stupanie+" m":"",v.poznamka].filter(Boolean).join(" · ");
  return `<a class="ev" href="${esc(v.odkaz||K.odkazy.strava)}"><span class="d"><b>${d.getDate()}</b>${MES[d.getMonth()]}</span><span><strong>${esc(v.nazov)}</strong><small>${esc(det)}</small></span></a>`}).join(""):`<p class="txt">Najbližší výbeh zatiaľ nie je v pláne. Sleduj Strava klub.</p>`;
 $k("kOdkazy").innerHTML=`<a class="cta strava" href="${esc(K.odkazy.strava)}">Strava klub</a><a class="ghost" href="${esc(K.odkazy.facebook)}">Facebook</a>`;
 $k("kPoslanie").textContent=K.poslanie;
 const C=K.kontakt;
 $k("kKontakt").innerHTML=`<div><span class="lab">Kontakt</span><b>${esc(C.meno)}</b><span></span></div><div><span class="lab">Telefón</span><b id="tel">${esc(C.telefon)}</b><button type="button" data-copy="tel">Kopírovať</button></div><div><span class="lab">E-mail</span><b id="mail">${esc(C.email)}</b><button type="button" data-copy="mail">Kopírovať</button></div>`;
 $k("kIco").innerHTML=K.ico?`<b>${esc(K.ico)}</b>`:'<b>doplníme</b> <span class="tag">chýba</span>';
 /* podpora: ak je nahraný originálny obrázok tabule, použije sa ten, inak prepis */
 const S=K.podpora||[];$k("podpora").hidden=!S.length;
 $k("podpora").innerHTML=S.map(s=>`<div class="shead"><h2>Podporili nás</h2><span class="lab">${esc(s.program)} ${s.rok}</span></div>
  <div class="two"><p class="txt">Projekt ${esc(s.projekt.split(":")[0])} je podporený z rozpočtu ${esc(s.poskytovatel.replace("Prešovský samosprávny kraj","Prešovského samosprávneho kraja"))}. Ďakujeme.</p>
  ${s.tabula?`<img class="psk-img" src="${esc(s.tabula)}" alt="Tabuľa podpory: ${esc(s.projekt)}, prijímateľ ${esc(s.prijimatel)}, dotácia ${esc(s.dotacia)}">`:
  `<figure class="psk" role="img" aria-label="Tabuľa podpory ${esc(s.poskytovatel)}: ${esc(s.projekt)}, prijímateľ ${esc(s.prijimatel)}, dotácia ${esc(s.dotacia)}">
   <div class="psk-top"><div class="psk-kraj"><span class="psk-erb">erb PSK</span><b>PREŠOVSKÝ<br>SAMOSPRÁVNY<br>KRAJ</b></div><div class="psk-vyzva"><b>VÝZVA</b><b>POSLANCOV</b><b>PSK</b><b class="rok">${s.rok}</b></div></div>
   <small>Názov projektu</small><strong>${esc(s.projekt)}</strong><small>Prijímateľ podpory</small><strong>${esc(s.prijimatel)}</strong><small>Výška dotácie</small><strong>${esc(s.dotacia)}</strong>
   <p>Projekt podporený z rozpočtu ${esc(s.poskytovatel.replace("Prešovský samosprávny kraj","Prešovského samosprávneho kraja"))}.</p></figure>`}</div>`).join("");
 kopirovanie();
 kotva();
});
/* Kopírovanie kontaktu; keď schránka nefunguje, aspoň označí text */
function kopirovanie(){document.querySelectorAll("[data-copy]").forEach(b=>b.addEventListener("click",()=>{
 const el=document.getElementById(b.dataset.copy);
 const done=()=>{b.textContent="Skopírované";setTimeout(()=>b.textContent="Kopírovať",1600)};
 const select=()=>{const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r)};
 try{navigator.clipboard.writeText(el.textContent).then(done,select)}catch(e){select()}
}))}
})();
