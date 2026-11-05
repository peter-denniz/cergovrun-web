/* Spoločný rám každej stránky: mobilné menu, pozadie s trasami a skok na kotvu po načítaní obsahu */
/* mobilné menu: burger otvorí a zavrie riadok s odkazmi, klik na odkaz ho zavrie */
const hlavicka=document.querySelector("header.top"),burger=hlavicka.querySelector(".burger");
const menu=o=>{hlavicka.classList.toggle("open",o);burger.setAttribute("aria-expanded",o)};
burger.addEventListener("click",()=>menu(!hlavicka.classList.contains("open")));
hlavicka.querySelectorAll("nav a").forEach(a=>a.addEventListener("click",()=>menu(false)));
/* úplne hore sú trasy celé, pri scrollovaní sa kreslia od štartu */
addEventListener("scroll",()=>document.getElementById("topoWrap").classList.toggle("scrolled",scrollY>4),{passive:true});
/* pozadie: hlavný pretek (výkladná skriňa) výrazne, druhý tlmene */
Promise.all([obsah("trate"),obsah("preteky")]).then(([T,P])=>{
 const preteky=P.slice().sort((a,b)=>(b.hlavny?1:0)-(a.hlavny?1:0));
 pozadie(T[preteky[0].trasa],T[(preteky[1]||preteky[0]).trasa]);
});
/* Obsah sa dopĺňa z JSON až po načítaní, preto prehliadač skočí na #kotvu skôr, než je stránka hotová.
   Stránka zavolá kotva(), keď vykreslí obsah. */
function kotva(){
 const id=decodeURIComponent(location.hash.slice(1)),el=id&&document.getElementById(id);
 if(el)requestAnimationFrame(()=>el.scrollIntoView());
}
