/* Pozadie podstránok: rovnaké vrstevnice Čergova a kreslenie oboch trás pri scrollovaní ako na úvodnej stránke.
   Potrebuje trate.js (HREBEN, UMIRAK). Pohyb je čisté CSS (scroll-driven animations). */
(function(){
const css=`
.topo{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.topo svg{position:absolute;inset:0;width:100%;height:100%;transform-origin:50% 50%;transform:scale(.92);will-change:transform}
.topo path{vector-effect:non-scaling-stroke}
.topo .minor{stroke:var(--ink);stroke-opacity:.07;stroke-width:.6;fill:none}
.topo .major{stroke:var(--ink);stroke-opacity:.16;stroke-width:.9;fill:none}
.topo .route,.topo .route2{vector-effect:none;fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1 2;stroke-dashoffset:0}
.topo .route{stroke:var(--lime);stroke-width:2.2}
.topo .route2{stroke:var(--ink);stroke-opacity:.7;stroke-width:1.6}
.topo .start{fill:none;stroke:var(--lime);stroke-width:1.5}
.topo .start2{fill:none;stroke:var(--ink);stroke-opacity:.8;stroke-width:1.5}
.topo .peak{fill:var(--lime)}
.topo .peakt{fill:var(--ink);fill-opacity:.7;font:500 9px var(--body);letter-spacing:.12em}
.veil{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(120% 80% at 70% 40%,transparent 0%,var(--bg) 85%);opacity:.55}
main,footer,body>div.wrap{position:relative;z-index:1}
@supports (animation-timeline: scroll()){
 @media (prefers-reduced-motion:no-preference){
  .topo svg{animation:topoDrift linear both;animation-timeline:scroll(root block)}
  @keyframes topoDrift{0%{transform:scale(.92)}50%{transform:translate3d(-1.5%,-2%,0) rotate(-3deg) scale(.94)}100%{transform:rotate(-1.5deg) scale(.9)}}
  .topo .route{animation:topoDraw linear both;animation-timeline:scroll(root block);animation-range:0% 95%}
  .topo .route2{animation:topoDraw linear both;animation-timeline:scroll(root block);animation-range:0% 87%}
  @keyframes topoDraw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
  .veil{animation:topoVeil linear both;animation-timeline:scroll(root block)}
  @keyframes topoVeil{from{opacity:.35}to{opacity:.5}}
 }
}`;
const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

const LON0=20.90,LON1=21.24,LAT1=49.27,KX=72.7,KY=111.2,W=1000,H=765;
const SX=W/((LON1-LON0)*KX);
const px=lon=>(lon-LON0)*KX*SX,py=lat=>(LAT1-lat)*KY*SX;
const hash=(i,j)=>{let h=i*374761393+j*668265263;h=(h^(h>>>13))*1274126177;return((h^(h>>>16))>>>0)/4294967295};
const noise=(x,y)=>{const i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
 const a=hash(i,j),b=hash(i+1,j),c=hash(i,j+1),d=hash(i+1,j+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v};
const fbm=(x,y)=>noise(x,y)*.6+noise(x*2.1+7,y*2.1+3)*.28+noise(x*4.3+1,y*4.3+9)*.12;
const PTS=[...HREBEN,...UMIRAK].map(p=>[px(p[2]),py(p[1]),p[3]]);
const NX=210,NY=161,CW=W/(NX-1),field=new Float32Array(NX*NY);
for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){
 const x=i*CW,y=j*CW;
 const wx=x+(fbm(x/90,y/90)-.5)*70,wy=y+(fbm(x/90+20,y/90+11)-.5)*70;
 let h=420+fbm(x/140,y/140)*80;
 const slope=3.6+fbm(x/60,y/60)*2.4;
 for(const p of PTS){const v=p[2]-Math.hypot(wx-p[0],wy-p[1])*slope;if(v>h)h=v}
 field[j*NX+i]=h+(fbm(x/22,y/22)-.5)*22;
}
const CASES=[[],[[3,2]],[[2,1]],[[3,1]],[[0,1]],[[3,0],[2,1]],[[0,2]],[[3,0]],[[3,0]],[[0,2]],[[3,2],[0,1]],[[0,1]],[[3,1]],[[2,1]],[[3,2]],[]];
let minor="",major="";
for(let L=440;L<=1160;L+=20){
 let s="";
 for(let j=0;j<NY-1;j++)for(let i=0;i<NX-1;i++){
  const a=field[j*NX+i],b=field[j*NX+i+1],c=field[(j+1)*NX+i+1],d=field[(j+1)*NX+i];
  const k=(a>L?8:0)|(b>L?4:0)|(c>L?2:0)|(d>L?1:0);
  if(k===0||k===15)continue;
  const e=n=>n===0?[i+(L-a)/(b-a),j]:n===1?[i+1,j+(L-b)/(c-b)]:n===2?[i+(L-d)/(c-d),j+1]:[i,j+(L-a)/(d-a)];
  for(const [m,n] of CASES[k]){const p=e(m),q=e(n);s+=`M${(p[0]*CW).toFixed(1)} ${(p[1]*CW).toFixed(1)}L${(q[0]*CW).toFixed(1)} ${(q[1]*CW).toFixed(1)}`}
 }
 if(L%100===0)major+=s;else minor+=s;
}
const routeD=t=>t.map((p,i)=>(i?"L":"M")+px(p[2]).toFixed(1)+" "+py(p[1]).toFixed(1)).join("");
const dot=(t,c)=>`<circle class="${c}" cx="${px(t[0][2]).toFixed(1)}" cy="${py(t[0][1]).toFixed(1)}" r="3"/>`;
const peak=HREBEN.reduce((m,p)=>p[3]>m[3]?p:m);
const wrap=document.createElement("div");wrap.className="topo";wrap.setAttribute("aria-hidden","true");
wrap.innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><path class="minor" d="${minor}"/><path class="major" d="${major}"/>`+
 `<path class="route2" pathLength="1" d="${routeD(UMIRAK)}"/><path class="route" pathLength="1" d="${routeD(HREBEN)}"/>`+
 dot(HREBEN,"start")+dot(UMIRAK,"start2")+
 `<circle class="peak" cx="${px(peak[2])}" cy="${py(peak[1])}" r="3.2"/><text class="peakt" x="${px(peak[2])+8}" y="${py(peak[1])-6}">1 160 M</text></svg>`;
const veil=document.createElement("div");veil.className="veil";veil.setAttribute("aria-hidden","true");
document.body.prepend(veil);document.body.prepend(wrap);
})();
