/* Prepínanie podstránok v prototype. Prehliadač artefaktov nedovolí prejsť na iný súbor,
   preto router podstránku stiahne (fetch) a vymení obsah aktuálnej stránky: štýly, telo aj skripty.
   Skripty podstránky bežia zabalené v bloku { }, aby sa ich const nebili s predchádzajúcou stránkou.
   Vo WordPresse toto netreba, tam sú to obyčajné odkazy. */
(function(){
 if(window.CR_ROUTER)return;window.CR_ROUTER=true;
 const origAdd=window.addEventListener.bind(window);
 let tracked=[];
 const internal=a=>{const h=a.getAttribute("href")||"";const m=h.match(/^([\w-]+\.html)(?:#([\w.~-]*))?$/);return m?{file:m[1],hash:m[2]||""}:null};

 /* zachytávame na window vo fáze capture, skôr než prehliadač artefaktov spracuje odkaz po svojom */
 origAdd("click",e=>{
  const a=e.target.closest&&e.target.closest("a[href]");if(!a||a.target==="_blank")return;
  const r=internal(a);if(!r)return;
  e.preventDefault();e.stopImmediatePropagation();go(r.file,r.hash);
 },true);

 async function go(file,hash){
  let html;
  try{html=await fetch(file).then(r=>{if(!r.ok)throw 0;return r.text()})}catch(e){location.href=file+(hash?"#"+hash:"");return}
  const doc=new DOMParser().parseFromString(html,"text/html");

  /* listenery na window z predchádzajúcej podstránky preč */
  tracked.forEach(([t,f,o])=>window.removeEventListener(t,f,o));tracked=[];

  document.querySelectorAll("style,link[rel=stylesheet]").forEach(n=>n.remove());
  doc.querySelectorAll("style,link[rel=stylesheet]").forEach(n=>document.head.appendChild(document.importNode(n,true)));
  if(doc.title)document.title=doc.title;

  const scripts=[...doc.querySelectorAll("script")];scripts.forEach(s=>s.remove());
  doc.querySelectorAll("title,meta").forEach(n=>n.remove());
  document.body.replaceChildren(...[...doc.body.childNodes].map(n=>document.importNode(n,true)));
  history.replaceState(null,"",location.pathname+location.search+(hash?"#"+hash:""));
  scrollTo(0,0);

  let code="";
  for(const s of scripts){
   const src=s.getAttribute("src");
   if(src){if(/router\.js$/.test(src))continue;code+=await fetch(src).then(r=>r.text())+"\n;\n"}
   else code+=s.textContent+"\n;\n";
  }
  window.addEventListener=(t,f,o)=>{tracked.push([t,f,o]);origAdd(t,f,o)};
  try{const el=document.createElement("script");el.textContent="{\n"+code+"\n}";document.body.appendChild(el)}
  finally{window.addEventListener=origAdd}
  if(hash){const t=document.getElementById(hash);if(t)requestAnimationFrame(()=>t.scrollIntoView())}
 }
})();
