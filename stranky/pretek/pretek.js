/* Detail preteku. Jedna šablóna pre všetky preteky: ktorý pretek sa zobrazí, určuje data-web stránky
   (kľúč vo weby.json = slug v data/preteky.json). Prepínač vedie na weby ostatných pretekov. */
(function(){

/* Obsah pretekov je v data/preteky.json (načíta obsah.js). Tu ho len prevedieme do tvaru, s ktorým pracuje vykresľovanie. */
let RACES={},KONTAKT=null,VSETKY_TRATE=[];
const zPreteku=(p,T)=>({
 name:p.nazov,kicker:p.podnadpis,tagline:p.popis,logo:p.logo,track:T[p.trasa],reg:p.registracia,gpx:p.gpx,status:p.stav,
 stats:p.cisla.map(c=>[c.hodnota,c.popis]),
 certs:[...(p.itra?[[`<span class="itra">iTRA <b>${p.itra}</b></span>`,`${p.itra} ITRA body`,"za dobehnutie do cieľa"]]:[]),
        ...(p.liga?[[`<img class="ssa" src="spolocne/grafika/logo-ssa-svetle.png" width="90" height="36" alt="Slovenská skyrunningová asociácia">`,esc(p.liga),"pretek je súčasťou ligy"]]:[])],
 aids:p.obcerstvovacky.map(a=>[a.km_trasy,a.nazov,a.popis]),
 pts:p.body_na_mape.map(a=>[a.km_trasy,a.nazov,a.strana||undefined]),
 start:p.start,finish:p.ciel,
 prop:p.propozicie.map(r=>[r.nazov,r.hodnota]),date:datumSk(p.datum),
 harm:p.harmonogram.map(h=>[h.cas,h.popis]),trans:p.doprava.map(r=>[r.nazov,r.hodnota]),
 recs:{m:[p.rekordy.muzi.cas,p.rekordy.muzi.meno,p.rekordy.muzi.klub,p.rekordy.muzi.rok],z:[p.rekordy.zeny.cas,p.rekordy.zeny.meno,p.rekordy.zeny.klub,p.rekordy.zeny.rok]},
 arch:p.archiv.map(a=>[a.rocnik,datumSk(a.datum),a.v_cieli,[a.vitaz.meno,a.vitaz.cas],[a.vitazka.meno,a.vitazka.cas],a.vysledky]),
 orgs:p.organizatori.map(o=>[o.nazov,o.rola])
});const $=id=>document.getElementById(id);
const fmt=n=>n.toLocaleString("sk",{maximumFractionDigits:1});
let R,M,idx=0;

function render(key){
 R=RACES[key];
 document.title=R.name+" · Čergovrun";
 $("switch").innerHTML=Object.keys(RACES).map(k=>`<a href="${esc(odkaz(k))}" role="tab" aria-current="${k===key}">${esc(RACES[k].name)}</a>`).join("");
 $("name").innerHTML=R.logo?`<img src="${esc(R.logo)}" alt="${esc(R.name)}">`:esc(R.name);$("name").classList.toggle("haslogo",!!R.logo);
 $("kicker").textContent=R.kicker;$("tagline").textContent=R.tagline;$("status").textContent=R.status;
 $("reg").href=R.reg;$("gpx").href=R.gpx;
 $("certs").innerHTML=(R.certs||[]).map(c=>`<div class="cert">${c[0]}<span><strong>${c[1]}</strong>${c[2]}</span></div>`).join("");
 $("stats").innerHTML=R.stats.map(s=>`<div><b>${s[0]}</b><span>${s[1]}</span></div>`).join("");

 /* mapa */
 const t=R.track;M=buildMap(t,VSETKY_TRATE);
 const d=t.map((p,i)=>(i?"L":"M")+M.px(p[2]).toFixed(1)+" "+M.py(p[1]).toFixed(1)).join("");
 const at=km=>t.reduce((b,p)=>Math.abs(p[0]-km)<Math.abs(b[0]-km)?p:b);
 const lab=(p,txt,dx=12,dy=5,side)=>{const x=M.px(p[2]),anchor=side||(x>M.W*.75?"end":"start");return `<text x="${(x+(anchor==="end"?-dx:dx)).toFixed(1)}" y="${(M.py(p[1])+dy).toFixed(1)}" text-anchor="${anchor}">${txt}</text>`};
 let marks="";
 R.aids.forEach((a,n)=>{const p=at(a[0]);marks+=`<g class="aid"><circle cx="${M.px(p[2]).toFixed(1)}" cy="${M.py(p[1]).toFixed(1)}" r="7"/>${lab(p,(n+1)+" · "+a[1])}</g>`});
 R.pts.forEach(a=>{const p=at(a[0]);marks+=`<g class="pt"><circle cx="${M.px(p[2]).toFixed(1)}" cy="${M.py(p[1]).toFixed(1)}" r="5"/>${lab(p,a[1],10,-10,a[2])}</g>`});
 const s=t[0],f=t[t.length-1];
 marks+=`<g class="pt"><circle cx="${M.px(s[2]).toFixed(1)}" cy="${M.py(s[1]).toFixed(1)}" r="6"/>${lab(s,R.start,12,18)}</g>`;
 if(R.finish)marks+=`<g class="pt"><circle cx="${M.px(f[2]).toFixed(1)}" cy="${M.py(f[1]).toFixed(1)}" r="6"/>${lab(f,R.finish,12,18)}</g>`;
 $("map").setAttribute("viewBox",`0 0 ${M.W} ${M.H.toFixed(0)}`);
 $("map").innerHTML=`<path class="minor" d="${M.minor}"/><path class="major" d="${M.major}"/><path class="halo" d="${d}"/><path class="trk" d="${d}"/>${marks}<circle class="cur" id="cur" r="8"/>`;

 /* profil */
 const km=f[0],E0=400,E1=1200,X=k=>k/km*1000,Y=e=>(1-(e-E0)/(E1-E0))*100;
 const line=t.map((p,i)=>(i?"L":"M")+X(p[0]).toFixed(1)+" "+Y(p[3]).toFixed(2)).join("");
 let g="";for(const e of [600,800,1000])g+=`<div class="g" style="top:${Y(e)}%"><span>${fmt(e)} m</span></div>`;
 R.aids.forEach((a,n)=>{const l=X(at(a[0])[0])/10;g+=`<div class="aidl${l>80?" r":""}" style="left:${l}%"><span>${n+1} · ${a[1]}</span></div>`});
 $("prof").innerHTML=g+`<svg viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true"><path class="area" d="${line}L1000 100L0 100Z"/><path class="ln" d="${line}"/></svg><div class="curl" id="curl"></div><div class="kms"><span>0 km</span><span>${Math.round(km/2)} km</span><span>${fmt(km)} km</span></div>`;
 $("aids").innerHTML=R.aids.map((a,n)=>`<div><b>${n+1}</b><span><strong>${a[1]}</strong>${a[2]}</span></div>`).join("");
 $("pos").max=t.length-1;setIdx(0);

 /* info */
 const dl=a=>a.map(r=>`<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join("");
 $("prop").innerHTML=dl(R.prop);$("trans").innerHTML=dl(R.trans);
 $("hdate").textContent="Ročník 2026 · "+R.date;
 $("harm").innerHTML=R.harm.map(h=>`<div><b>${h[0]}</b><span>${h[1]}</span></div>`).join("");
 const rc=(r,l)=>`<div class="rec"><span class="lab">${l}</span><b>${r[0]}</b><span><strong>${r[1]}</strong> · ${r[2]} · ${r[3]}</span></div>`;
 $("recs").innerHTML=rc(R.recs.m,"Muži")+rc(R.recs.z,"Ženy");
 $("arch").innerHTML=R.arch.map(a=>`<tr><td class="y">${a[0]}</td><td>${a[1]}</td><td>${a[2]}</td><td>${a[3][0]}<small>${a[3][1]}</small></td><td>${a[4][0]}<small>${a[4][1]}</small></td><td>${a[5]?`<a href="${esc(a[5])}">Výsledky</a>`:""}</td></tr>`).join("");
 $("orgs").innerHTML=R.orgs.map(o=>`<div><b>${o[0]}</b><span>${o[1]}</span></div>`).join("")+`<div class="empty">Miesto pre partnerov ${new Date().getFullYear()+1}</div>`;
 $("contact").textContent=KONTAKT?`Kontakt: ${KONTAKT.meno} · ${KONTAKT.telefon}`:"";
}

function setIdx(i){
 const t=R.track;idx=Math.max(0,Math.min(t.length-1,i));const p=t[idx];
 const c=$("cur");c.setAttribute("cx",M.px(p[2]).toFixed(1));c.setAttribute("cy",M.py(p[1]).toFixed(1));
 $("curl").style.left=(p[0]/t[t.length-1][0]*100)+"%";
 $("read").innerHTML=`<b>${fmt(p[0])} km</b>${fmt(p[3])} m n. m.`;
 $("pos").value=idx;
}
function nearestKm(km){const t=R.track;let b=0;for(let i=1;i<t.length;i++)if(Math.abs(t[i][0]-km)<Math.abs(t[b][0]-km))b=i;return b}
$("prof").addEventListener("pointermove",e=>{if(!R)return;const r=$("prof").getBoundingClientRect();const k=(e.clientX-r.left)/r.width*R.track[R.track.length-1][0];setIdx(nearestKm(k))});
$("prof").addEventListener("pointerdown",e=>{$("prof").setPointerCapture(e.pointerId)});
$("map").addEventListener("pointermove",e=>{if(!R)return;
 const svg=$("map"),pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const q=pt.matrixTransform(svg.getScreenCTM().inverse());
 let b=0,bd=1e9;R.track.forEach((p,i)=>{const d=Math.hypot(M.px(p[2])-q.x,M.py(p[1])-q.y);if(d<bd){bd=d;b=i}});
 if(bd<80)setIdx(b);
});
$("pos").addEventListener("input",e=>{if(R)setIdx(+e.target.value)});

Promise.all([obsah("preteky"),obsah("trate"),obsah("klub")]).then(([P,T,K])=>{
 /* hlavný pretek (výkladná skriňa) ide prvý */
 P.slice().sort((a,b)=>(b.hlavny?1:0)-(a.hlavny?1:0)).forEach(p=>RACES[p.slug]=zPreteku(p,T));
 KONTAKT=K.kontakt;VSETKY_TRATE=Object.values(T).filter(Array.isArray);
 if(!RACES[WEB])throw new Error("Pretek "+WEB+" nie je v preteky.json");
 render(WEB);kotva();
});

})();
