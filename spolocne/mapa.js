/* Spoločná grafika trás: projekcia pozadia, kreslenie trás a vrcholov do pozadia, výškový profil a mapa trate. */

/* Projekcia: lon/lat -> súradnice viewBoxu 1000 × 765 (1 jednotka ≈ 25 m) */
const LON0=20.90,LON1=21.24,LAT0=49.10,LAT1=49.27;
const KX=72.7,KY=111.2,W=1000,H=765;
const SX=W/((LON1-LON0)*KX);
const px=lon=>(lon-LON0)*KX*SX, py=lat=>(LAT1-lat)*KY*SX;

/* Vrstevnice sú predpočítaný obrázok vrstevnice.svg (vrstevnice-gen.html), tu sa kreslia len trasy a vrcholy */
const routeD=t=>t.map((p,i)=>(i?"L":"M")+px(p[2]).toFixed(1)+" "+py(p[1]).toFixed(1)).join("");
/* 5 najvyšších vrcholov na trase hlavného preteku, oficiálne výšky; poloha = najvyšší bod GPX pri vrchole (odhad) */
const PEAKS=[[7.105,"MINČOL","1 157",-6],[22.742,"VEĽKÁ JAVORINA","1 098",-6],[30.897,"LYSÁ","1 068",14],[10.266,"DVORISKÁ","1 057",-6],[20.35,"SOLISKO","1 057",14]];
const startDot=(t,c)=>`<circle class="${c}" cx="${px(t[0][2]).toFixed(1)}" cy="${py(t[0][1]).toFixed(1)}" r="3"/>`;
/* pozadie: hlavný pretek (výkladná skriňa) výrazne, druhý tlmene */
function pozadie(hlavna,druha){
 document.getElementById("rHreben").setAttribute("d",routeD(hlavna));
 document.getElementById("rUmirak").setAttribute("d",routeD(druha));
 for(const [id,c] of [["rHreben","ghost ghost-h"],["rUmirak","ghost ghost-u"]]){const r=document.getElementById(id),g=r.cloneNode();g.removeAttribute("id");g.removeAttribute("pathLength");g.setAttribute("class",c);r.after(g)}
 document.getElementById("peaks").innerHTML=startDot(hlavna,"start")+startDot(druha,"start2")+PEAKS.map(([km,name,h,dy])=>{const p=hlavna.reduce((b,q)=>Math.abs(q[0]-km)<Math.abs(b[0]-km)?q:b);return `<circle class="peak" cx="${px(p[2]).toFixed(1)}" cy="${py(p[1]).toFixed(1)}" r="3.2"/><text class="peakt" x="${(px(p[2])+8).toFixed(1)}" y="${(py(p[1])+dy).toFixed(1)}">${name} ${h} M</text>`}).join("");
}

/* Výškové profily, spoločná mierka 400–1 200 m */
function profile(el,t){
 const km=t[t.length-1][0],E0=400,E1=1200;
 const X=k=>k/km*1000,Y=e=>(1-(e-E0)/(E1-E0))*100;
 const line=t.map((p,i)=>(i?"L":"M")+X(p[0]).toFixed(1)+" "+Y(p[3]).toFixed(2)).join("");
 const mx=t.reduce((m,p)=>p[3]>m[3]?p:m);
 let g="";for(const e of [600,800,1000])g+=`<div class="g" style="top:${Y(e)}%"><span>${e.toLocaleString("sk")} m</span></div>`;
 el.innerHTML=g+`<svg viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true"><path class="area" d="${line}L1000 100L0 100Z"/><path class="ln" pathLength="1" d="${line}"/></svg>`+
  `<div class="top" style="left:${X(mx[0])/10}%;top:${Y(mx[3])}%">${mx[3].toLocaleString("sk")} m</div>`+
  `<div class="kms"><span>0 km</span><span>${Math.round(km/2)} km</span><span>${km.toFixed(1).replace(".",",")} km</span></div>`;
 el.setAttribute("role","img");el.setAttribute("aria-label",`Výškový profil, ${km.toFixed(1)} km, najvyšší bod ${mx[3]} m`);
}

/* Mapa trate pre detail preteku. Body trás sú v data/trate.json: [km, lat, lon, výška m] z GPX na ZASRUN. */

/* Mapa okolo zvolenej trate: projekcia do viewBoxu širokého 1000 a vrstevnice po 20 m.
   Terén je ilustračný (odvodený z výšok na všetkých tratiach v allTracks + šum), nie presný model reliéfu. */
function buildMap(track,allTracks=[track],padLat=.012,padLon=.018){
 const KX=72.7,KY=111.2,W=1000;
 const lats=track.map(p=>p[1]),lons=track.map(p=>p[2]);
 const LAT0=Math.min(...lats)-padLat,LAT1=Math.max(...lats)+padLat;
 let LON0=Math.min(...lons)-padLon,LON1=Math.max(...lons)+padLon;
 /* mapa aspoň 1,6 : 1 na šírku, inak by sa vysoká trať (Umirak) zmenšila na nečitateľnú */
 const kmW=(LON1-LON0)*KX,kmH=(LAT1-LAT0)*KY;
 if(kmW<kmH*1.6){const ext=(kmH*1.6-kmW)/2/KX;LON0-=ext;LON1+=ext}
 const S=W/((LON1-LON0)*KX),H=(LAT1-LAT0)*KY*S;
 const px=lon=>(lon-LON0)*KX*S,py=lat=>(LAT1-lat)*KY*S;
 const hash=(i,j)=>{let h=i*374761393+j*668265263;h=(h^(h>>>13))*1274126177;return((h^(h>>>16))>>>0)/4294967295};
 const noise=(x,y)=>{const i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
  const a=hash(i,j),b=hash(i+1,j),c=hash(i,j+1),d=hash(i+1,j+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v};
 const fbm=(x,y)=>noise(x,y)*.6+noise(x*2.1+7,y*2.1+3)*.28+noise(x*4.3+1,y*4.3+9)*.12;
 /* všetko v km, aby terén vyzeral rovnako pri každej mierke */
 const KLON=LON=>(LON-20.90)*KX,KLAT=LAT=>(49.27-LAT)*KY;
 const PTS=allTracks.flat().map(p=>[KLON(p[2]),KLAT(p[1]),p[3]]);
 const NX=170,CW=W/(NX-1),NY=Math.ceil(H/CW)+1;
 const field=new Float32Array(NX*NY);
 for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){
  const xk=KLON(LON0+i*CW/S/KX),yk=KLAT(LAT1-j*CW/S/KY);
  const wx=xk+(fbm(xk/2.22,yk/2.22)-.5)*1.73,wy=yk+(fbm(xk/2.22+20,yk/2.22+11)-.5)*1.73;
  let h=420+fbm(xk/3.46,yk/3.46)*80;
  const slope=(3.6+fbm(xk/1.48,yk/1.48)*2.4)*40.46;
  for(const p of PTS){const v=p[2]-Math.hypot(wx-p[0],wy-p[1])*slope;if(v>h)h=v}
  field[j*NX+i]=h+(fbm(xk/.54,yk/.54)-.5)*22;
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
 return {W,H,px,py,minor,major};
}
