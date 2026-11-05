/* Novinky: zoznam a článok na jednej stránke, článok vyberá kotva novinky/#<slug> */
(function(){
const curHash=()=>decodeURIComponent(location.hash.slice(1));
const clanok=slug=>esc(odkaz("klub","novinky/#"+slug));

/* Články sú v data/novinky.json (načíta obsah.js). Najnovšie prvé, ukážkové na konci. */
let POSTS=[];
const zClanku=c=>({slug:c.slug,date:datumSk(c.datum,"Ukážka"),cat:c.kategoria,img:c.obrazok,alt:c.obrazok_popis,sample:c.ukazka,title:c.nazov,perex:c.perex,body:c.obsah});
const view=document.getElementById("view");
let cat="Všetko";
const ph=p=>p.img?`<div class="ph"><img src="${p.img}" alt="${p.alt}"></div>`:`<div class="ph topo" role="img" aria-label="Bez fotky"></div>`;
const meta=p=>`<span class="lab">${p.date} · ${p.cat}</span>${p.sample?'<span class="tag">ukážka</span>':""}`;

function archive(){
 document.title="Čergovrun novinky";
 const list=POSTS.filter(p=>cat==="Všetko"||p.cat===cat);
 const cats=["Všetko",...new Set(POSTS.map(p=>p.cat))];
 const [first,...rest]=list;
 view.innerHTML=`<div class="head"><h1>Novinky</h1><div class="filters" role="group" aria-label="Kategória">${cats.map(c=>`<button type="button" aria-pressed="${c===cat}">${c}</button>`).join("")}</div></div>`+
  (first?`<a class="lead" href="${clanok(first.slug)}">${ph(first)}<div><div>${meta(first)}</div><h2>${first.title}</h2><p>${first.perex}</p><span class="more">Čítať ďalej</span></div></a>`:`<p class="empty">V tejto kategórii zatiaľ nič nie je.</p>`)+
  (rest.length?`<div class="grid">${rest.map(p=>`<a class="card" href="${clanok(p.slug)}">${ph(p)}<div>${meta(p)}</div><h3>${p.title}</h3><p>${p.perex}</p></a>`).join("")}</div>`:"");
 view.querySelectorAll(".filters button").forEach(b=>b.addEventListener("click",()=>{cat=b.textContent;archive()}));
}
function single(p){
 document.title=p.title+" · Čergovrun";
 const others=POSTS.filter(x=>x!==p).slice(0,3);
 view.innerHTML=`<article class="post"><a class="back" href="${clanok("")}">← Všetky novinky</a><h1>${p.title}</h1><div class="meta">${meta(p)}</div>${ph(p)}
  <div class="body"><p class="perex">${p.perex}</p>${p.body}</div></article>
  <div class="related"><span class="lab">Ďalšie novinky</span><div class="grid">${others.map(o=>`<a class="card" href="${clanok(o.slug)}">${ph(o)}<div>${meta(o)}</div><h3>${o.title}</h3></a>`).join("")}</div></div>`;
}
function route(){const s=curHash();const p=POSTS.find(x=>x.slug===s);p?single(p):archive();scrollTo(0,0)}
obsah("novinky").then(N=>{
 POSTS=N.slice().sort((a,b)=>(a.ukazka-b.ukazka)||(b.datum||"").localeCompare(a.datum||"")).map(zClanku);
 addEventListener("hashchange",route);route();
});
})();
