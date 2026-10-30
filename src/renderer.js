(function(){
  'use strict';
  const A=PaperArt,{C}=NRM;
  class Renderer{
    constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.billboardImage=new Image();this.billboardImage.src=new URL("./assets/tori-billboard.jpg?v=tori-2",document.baseURI).href;this.billboardAnchor=null;this.billboardLastDistance=0;this.time=0;this.particles=[];this.rings=[];this.shake=0;this.closeCallLife=0;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.grain=this.makeGrain();this.resize();}
    resize(){const r=this.canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);}
    makeGrain(){const tile=document.createElement('canvas');tile.width=tile.height=192;const c=tile.getContext('2d'),r=NRM.rng(12);for(let i=0;i<1800;i++){c.fillStyle=i%2?'rgba(71,75,42,.045)':'rgba(255,253,222,.11)';c.fillRect(r()*192,r()*192,1+r(),1+r());}return this.c.createPattern(tile,'repeat');}
    emit(event){if(event.type==='closecall')this.closeCallLife=.28;if(event.type==='collision')this.closeCallLife=0;const r=Math.random;if(event.type==='land'){this.rings.push({x:C.playerX,y:C.ground-event.y,life:.20,max:.20,strength:event.strength||0,color:event.material==='metal'?'#dce4c7':event.material==='wood'?'#d6ae79':'#9ab8bd'});}if(event.type==='collision')this.shake=this.reduced?0:.25;if(['jump','land','collision','score'].includes(event.type)){let n=event.type==='collision'?14:event.type==='score'?7:8;for(let i=0;i<n;i++)this.particles.push({x:event.type==='score'?C.playerX+20:C.playerX+(r()-.5)*60,y:event.type==='score'?C.ground-(event.y||0)-155:C.ground-(event.y||0)-8,vx:(r()-.6)*150,vy:-35-r()*100,life:.4+r()*.35,max:.8,size:3+r()*7,type:event.type,color:event.type==='land'?(event.material==='metal'?['#e9bf7a','#e8e5c6'][i%2]:event.material==='wood'?'#cba16d':'#a7b7ba'):['#f8df9b','#fcf3da','#d9e8a0','#ed9a5d'][i%4]});}}
    sky(c,d,t){
      const grad=c.createLinearGradient(0,0,0,580);grad.addColorStop(0,'#1c263c');grad.addColorStop(.52,'#566079');grad.addColorStop(1,'#b18a79');c.fillStyle=grad;c.fillRect(0,0,1280,720);
      // Layered paper silhouettes: dusk over an abandoned waterside rail yard.
      A.ellipse(c,1030,152,42,42,'#d6d0ba');A.ellipse(c,1015,139,40,40,'#424e68');
      for(let i=0;i<24;i++){const x=(i*193+73)%1280,y=55+(i*61)%206;c.globalAlpha=.18+.25*Math.sin(i+t*.3)**2;A.ellipse(c,x,y,1,1,'#ecddd1');}c.globalAlpha=1;
      for(let i=-1;i<5;i++){let x=i*370-(d*.06+t*3)%370;A.path(c,`M${x} 249q45-27 100-15l40-9 79 19 68 3-21 8H${x}Z`,'#4b526852',null);}
      for(let i=-1;i<5;i++){let x=i*410-(d*.12%410);A.path(c,`M${x-80} 485L${x+80} 304 ${x+165} 367 ${x+259} 319 ${x+430} 480Z`,'#4b5267','#626477',1.5);}
      for(let i=-1;i<15;i++){let x=i*116-(d*.22%116),h=50+((i+20)*37%105);A.path(c,`M${x} 480V${480-h}h68v${h}Z`,'#323f51',null);for(let j=0;j<3;j++){if((i+j)%3)A.path(c,`M${x+14+j*15} ${500-h}h5v8h-5Z`,'#bd9b7349',null);}}
      // Irregular wind-bent trees retain the cut-paper style without toy-like foliage.
      for(let i=-1;i<10;i++){let x=i*191-(d*.37%191),h=90+((i+12)*31%75);A.path(c,`M${x-3} 550V${550-h}h7v${h}Z`,'#273e46',null);for(let j=0;j<3;j++){let yy=550-h+j*30,ww=30+j*14;A.path(c,`M${x} ${yy-25}L${x+ww} ${yy+47} ${x+8} ${yy+36} ${x-ww} ${yy+46}Z`,'#2d484d','#3c555b',1);}}
      A.path(c,'M0 546Q210 516 420 541T810 539T1280 530V600H0Z','#293f44',null);
      for(let i=-1;i<4;i++){const x=i*580-(d*.5%580);A.path(c,`M${x} 566V303h7v263Z`,'#26343d','#536069',1.5);A.line(c,`M${x+3} 315q290 72 580 0`,'#29323f',2);A.line(c,`M${x+3} 340h35v23`,'#33434c',4);c.save();c.shadowColor='#e5a673';c.shadowBlur=14;A.path(c,`M${x+29} 363h19l5 8h-30Z`,'#d4a77d',null);c.restore();}
      for(let i=0;i<22;i++){const x=((i*79-d*.65)%1390+1390)%1390-40;A.line(c,`M${x} 573l-6-17m6 17 8-23`,'#4b6560',2);}
    }
    ground(c,d){
      c.fillStyle='#192b32';c.fillRect(0,580,1280,140);c.fillStyle='#556469';c.fillRect(0,580,1280,43);c.fillStyle='#84958c';c.fillRect(0,580,1280,4);
      A.line(c,'M0 624H1280','#0f222c',4);
      for(let i=-1;i<20;i++){const x=i*86-(d%86);A.line(c,`M${x} 587l-9 17 17 11`,'#414f55',2);A.line(c,`M${x+35} 580l4-5 7 5`,'#769381',2);}
      for(let i=-1;i<7;i++){const x=i*240-(d*1.05%240);A.path(c,`M${x} 653h111v5H${x}Z`,'#31464d',null);A.line(c,`M${x+135} 686l-7-18m7 18 10-23`,'#37564f',2);}
    }
    district(c,d,t,b){
      if(b===0){this.sky(c,d,t);this.ground(c,d);return;}
      const palettes=[null,['#29223c','#69566e','#ba8280'],['#152d40','#376773','#8caa9b'],['#271f2b','#635055','#bb7754']];
      const [top,mid,bottom]=palettes[b],grad=c.createLinearGradient(0,0,0,580);grad.addColorStop(0,top);grad.addColorStop(.6,mid);grad.addColorStop(1,bottom);c.fillStyle=grad;c.fillRect(0,0,1280,720);
      A.ellipse(c,b===2?960:1050,150,36,36,b===3?'#e8b37f':'#d8cfb7');
      for(let i=-1;i<6;i++){const x=i*320-(d*.08+t*4)%320;A.path(c,`M${x} 231q70-31 120-17l90-12 100 29Z`,b===3?'#69545b':'#6e819147',null);}
      if(b===1){
        // High rooftops: layered skyline, different rooflines, neon and water towers.
        for(let layer=0;layer<2;layer++)for(let i=-1;i<10;i++){const x=i*175-(d*(.10+layer*.12)%175),h=80+((i+13)*47%170),yy=490+layer*40;c.fillStyle=layer?'#352d45':'#4c405c';c.fillRect(x,yy-h,133,h+90);A.path(c,`M${x-5} ${yy-h}l16-13h80l42 13Z`,layer?'#2b293b':'#54465e',null);for(let col=0;col<4;col++)for(let row=0;row<4;row++){if((i+row+col)%3){c.fillStyle=(i+row)%2?'#b18e7a66':'#928c9e44';c.fillRect(x+13+col*28,yy-h+23+row*29,9,14);}}}
        for(let i=-1;i<4;i++){const x=i*490-(d*.44%490);A.line(c,`M${x} 551V302h6v249M${x+6} 320q230 55 490 0`,'#292839',3);A.path(c,`M${x+64} 486V355h82v131Z`,'#514c57','#282b3b',3);A.path(c,`M${x+57} 356l48-23 49 23Z`,'#8c7576','#282b3b',3);A.line(c,`M${x+71} 486v61m65-61v61M${x+71} 489l65 58m0-58-65 58`,'#252b3c',4);A.path(c,`M${x+239} 401h112v43H${x+239}Z`,'#282e42','#9e707b',2);c.fillStyle='#d18e99';c.font='bold 18px monospace';c.fillText(['MIDNIGHT','NORTH','24 / 7','HOTEL'][(i+4)%4],x+250,428);}
        c.fillStyle='#2a2737';c.fillRect(0,575,1280,145);c.fillStyle='#82727a';c.fillRect(0,580,1280,16);A.line(c,'M0 580H1280','#c0aaa0',3);
        for(let yy=619;yy<720;yy+=30){A.line(c,`M0 ${yy}H1280`,'#453a4b',2);for(let i=-1;i<20;i++){const x=i*84-(d%84)+(yy%2)*42;A.line(c,`M${x} ${yy-29}v29`,'#453a4b',2);}}
      }else if(b===2){
        // Harbor: horizon water, ships, moving reflections, cranes and timber pier.
        c.fillStyle='#274e60';c.fillRect(0,399,1280,181);
        for(let i=0;i<28;i++){const x=((i*133-d*.11+t*10)%1400+1400)%1400-60,yy=414+i%8*21;A.line(c,`M${x} ${yy}h${25+i%4*17}`,'#6a95944d',2);}
        for(let i=-1;i<5;i++){const x=i*390-(d*.19%390);A.path(c,`M${x} 417h260l-29 34H${x+27}Z`,'#253e51','#547078',2);A.path(c,`M${x+26} 378h156v39H${x+26}Z`,'#776e65','#314453',2);A.path(c,`M${x+169} 358h49v59H${x+169}Z`,'#a6a294','#314453',2);for(let j=0;j<3;j++)A.path(c,`M${x+175+j*13} 366h7v10h-7Z`,'#345767',null);A.line(c,`M${x+203} 357V303`,'#2a4351',3);}
        for(let i=-1;i<4;i++){const x=i*540-(d*.38%540);A.path(c,`M${x} 565V290h12v275Z`,'#365866','#274351',3);A.line(c,`M${x+6} 305l160-100 80 34M${x+6} 305l160-69 80 3M${x+166} 211v245`,'#466775',5);A.line(c,`M${x+166} 451v17q-1 16 12 7`,'#aab9a6',3);A.path(c,`M${x+270} 496h160v70H${x+270}Z`,'#6e7b6d','#304c54',3);for(let j=0;j<8;j++)A.line(c,`M${x+282+j*18} 500v62`,'#4b615b',2);}
        c.fillStyle='#2c4147';c.fillRect(0,580,1280,140);c.fillStyle='#997d59';c.fillRect(0,580,1280,35);A.line(c,'M0 580H1280','#d3b885',3);
        for(let i=-1;i<34;i++){const x=i*41-(d%41);A.line(c,`M${x} 583v30`,'#514e43',2);A.ellipse(c,x+9,590,2,2,'#454f49');}
        for(let i=-1;i<8;i++){const x=i*210-(d%210);A.path(c,`M${x} 615h24v105H${x}Z`,'#6c5d48','#2d3c40',3);A.line(c,`M${x+20} 622l190 96`,'#7a664e',6);}
      }else{
        // Foundry: smoky chimneys, pipe bridges, furnace windows and a grated track.
        for(let i=-1;i<8;i++){const x=i*217-(d*.14%217),h=125+((i+10)*31%100);A.path(c,`M${x} 530V${530-h}h110v${h}Z`,'#4e3e47',null);A.path(c,`M${x+20} ${530-h}v-76h24v76Z`,'#463b45',null);for(let j=0;j<4;j++){const xx=x+31+Math.sin(t*.13+j)*12,yy=530-h-90-j*24;A.ellipse(c,xx,yy,18+j*7,17+j*5,'#51414e44');}}
        for(let i=-1;i<4;i++){const x=i*470-(d*.37%470);A.path(c,`M${x} 560V369l65-49 65 49 65-49 65 49v191Z`,'#352f38','#70504c',2);for(let k=0;k<3;k++){const xx=x+19+k*82;A.path(c,`M${xx} 477q0-27 28-27t28 27v62H${xx}Z`,'#cf8559','#4f4643',4);A.line(c,`M${xx+28} 452v85m-25-40h50`,'#483e3d',4);}A.line(c,`M${x+286} 562V261h87v301`,'#3a4247',16);A.line(c,`M${x+286} 562V261h87v301`,'#8a7868',7);}
        c.fillStyle='#302e33';c.fillRect(0,580,1280,140);c.fillStyle='#6b6560';c.fillRect(0,580,1280,37);A.line(c,'M0 580H1280','#d9af7f',3);
        for(let i=-1;i<60;i++){const x=i*25-(d%25);A.line(c,`M${x} 587l-10 23`,'#333c42',7);}for(let i=-1;i<7;i++){const x=i*226-(d%226);A.path(c,`M${x} 642h132v30H${x}Z`,'#a26c46','#232e35',3);for(let j=0;j<6;j++)A.line(c,`M${x+8+j*22} 645v23`,'#352f31',7);}
      }
    }
    sceneLayers(c,d,t,target,dt,frozen){
      if(this.scene===undefined){this.scene=target;this.fromScene=target;this.sceneBlend=1;}
      if(target!==this.scene){this.fromScene=this.scene;this.scene=target;this.sceneBlend=0;}
      if(!frozen)this.sceneBlend=Math.min(1,this.sceneBlend+dt/1.6);
      if(this.sceneBlend>=1){this.district(c,d,t,target);return;}
      if(!this.sceneCanvas){this.sceneCanvas=document.createElement('canvas');this.sceneCanvas.width=1280;this.sceneCanvas.height=720;this.sceneContext=this.sceneCanvas.getContext('2d');}
      this.district(c,d,t,this.fromScene);this.district(this.sceneContext,d,t,target);
      c.save();c.globalAlpha=this.sceneBlend*this.sceneBlend*(3-2*this.sceneBlend);c.drawImage(this.sceneCanvas,0,0);c.restore();
    }
    weatherBack(c,w,t){
      c.save();
      // The atmospheric layers sit behind every playable surface and hazard.
      c.fillStyle=`rgba(9,23,41,${w.rain*.12+w.storm*.18})`;c.fillRect(0,0,1280,580);
      for(let i=-1;i<5;i++){let x=i*410-(t*(9+w.wind*22)%410);c.globalAlpha=w.rain*.30+w.storm*.28;A.path(c,`M${x-80} 105q110-68 200-23l80-14 140 54H${x-80}Z`,'#233143',null);}
      c.globalAlpha=1;
      for(let i=0;i<3;i++){let y=340+i*72+Math.sin(t*.14+i)*17;const mist=c.createLinearGradient(0,y-68,0,y+68);mist.addColorStop(0,'#b1c7cd00');mist.addColorStop(.5,`rgba(177,199,205,${w.fog*(.20+i*.045)})`);mist.addColorStop(1,'#b1c7cd00');c.fillStyle=mist;c.fillRect(0,y-68,1280,136);}
      const beat=t%13;
      // One subdued glow per 13 seconds of storm; disabled for reduced motion.
      if(!this.reduced&&w.storm>.6&&beat>3&&beat<3.6){c.globalAlpha=(1-(beat-3)/.6)*w.storm*.22;c.fillStyle='#d0dbe6';c.fillRect(0,0,1280,580);}
      c.restore();
    }
    weatherFront(c,w,t){
      if(w.rain<.01)return;c.save();c.strokeStyle='#b2ced9';c.lineWidth=1;
      const count=this.reduced?40:105,wind=w.wind*15;
      c.globalAlpha=w.rain*.32;c.beginPath();
      for(let i=0;i<count;i++){const y=((i*127+t*(this.reduced?220:570))%700)-20;const x=((i*197-t*(30+w.wind*85))%1450+1450)%1450-80;c.moveTo(x,y);c.lineTo(x-wind,y+12+w.rain*12);}c.stroke();
      c.globalAlpha=w.rain*.18;for(let i=0;i<16;i++){const x=(i*97+31)%1280,age=(t*1.7+i*.31)%1;A.line(c,`M${x-age*7} ${605+i%3*7}q${age*7} -3 ${age*14} 0`,'#c5d8db',1);}
      c.restore();
    }
    airGate(c,o,g){
      const top=C.ground-o.high,bottom=C.ground-o.low,x=o.x,w=o.w;
      c.save();c.lineJoin='round';
      const colors={bridge:['#6a7981','#364754'],cargo:['#947353','#4b4540'],antenna:['#637c87','#30434f'],steel:['#858379','#40464c']},[light,dark]=colors[o.kind];
      // The solid faces match the collision rectangles; only the illuminated opening is safe.
      c.fillStyle=dark;c.strokeStyle='#93a7ad';c.lineWidth=2;
      for(const solid of NRM.airSolids(o)){const yy=C.ground-solid.y-solid.h;c.fillRect(solid.x,yy,solid.w,solid.h);c.strokeRect(solid.x,yy,solid.w,solid.h);}
      // Keep the full lower columns readable all the way to the viewport edge.
      for(let yy=bottom+24;yy<bottom+1600;yy+=60){A.line(c,`M${x+6} ${yy}h${w-12}`,'#b1b6a866',2);}
      if(o.kind==='bridge'){
        for(const y of [top-45,bottom+10]){c.fillStyle=light;c.fillRect(x+3,y,w-6,32);A.line(c,`M${x+6} ${y+4}l${w-12} 24m0-24-${w-12} 24`,'#243945',3);}
        for(let y=bottom+60;y<bottom+500;y+=46)A.line(c,`M${x+8} ${y}h${w-16}`,'#74838b',2);
      }else if(o.kind==='cargo'){
        for(const y of [top-98,bottom+8]){A.path(c,`M${x+5} ${y}h${w-10}v88h-${w-10}Z`,light,'#342f2e',3);A.line(c,`M${x+10} ${y+7}l${w-20} 74m0-74-${w-20} 74`,'#d0ac7f',4);}
        A.line(c,`M${x+15} ${top-100}v-600m${w-30} 0v600`,'#a5adb0',3);
      }else if(o.kind==='antenna'){
        for(let y=top-400;y<top-12;y+=32){A.line(c,`M${x+6} ${y}h${w-12}m-${w-12} 0l${w-12} 27`,'#99adb0',2);}
        for(let y=bottom+12;y<bottom+430;y+=32)A.line(c,`M${x+6} ${y}l${w-12} 27m0-27-${w-12} 27`,'#99adb0',2);
        A.ellipse(c,x+w/2,top-20,6,6,'#ee9b75');A.ellipse(c,x+w/2,bottom+20,6,6,'#ee9b75');
      }else{
        for(const y of [top-75,bottom+10]){c.fillStyle=light;c.fillRect(x+5,y,w-10,65);for(let j=0;j<3;j++)A.ellipse(c,x+w/2,y+10+j*22,3,3,'#283a42');}
      }
      // Hazard stripes stop exactly at the gap boundary.
      for(const y of [top-8,bottom]){c.fillStyle='#ddb179';c.fillRect(x,y,w,8);for(let xx=x;xx<x+w-8;xx+=20)A.line(c,`M${xx+2} ${y+1}l7 6`,'#263a43',3);}
      c.fillStyle='#c8d9ce';c.font='bold 11px monospace';c.textAlign='center';c.fillText(String(o.index+1).padStart(2,'0')+' / 50',x+w/2,top+20);
      // Small route signs preview the required move without obscuring the opening.
      if(!o.scored&&o.direction&&o.direction!=='THREAD'){
        const cy=(top+bottom)/2,up=o.direction==='CLIMB';
        c.strokeStyle='#d9bd8c';c.lineWidth=3;c.beginPath();
        c.moveTo(x-26,cy+(up?10:-10));c.lineTo(x-26,cy+(up?-10:10));
        c.moveTo(x-32,cy+(up?-4:4));c.lineTo(x-26,cy+(up?-10:10));c.lineTo(x-20,cy+(up?-4:4));c.stroke();
      }
      c.restore();
    }
    billboardX(g){
      if(g.distance<this.billboardLastDistance||g.score===0)this.billboardAnchor=null;
      this.billboardLastDistance=g.distance;
      if(this.billboardAnchor===null&&g.mode==='running'&&g.score>=44&&g.score<=46)this.billboardAnchor=g.distance;
      if(this.billboardAnchor===null)return null;
      const x=1280-(g.distance-this.billboardAnchor)*.50;
      return x < -440 ? null : x;
    }
    billboard(c,g){
      const x=this.billboardX(g);if(x===null||!this.billboardImage.complete||!this.billboardImage.naturalWidth)return;
      const y=190,w=320,h=w*this.billboardImage.naturalHeight/this.billboardImage.naturalWidth;
      c.save();c.fillStyle='#1a2b39';c.fillRect(x-35,y+h+78,w+70,260);
      for(const offset of [55,w-65]){c.fillStyle='#14232e';c.fillRect(x+offset,y+h,12,80);c.strokeStyle='#49606c';c.lineWidth=3;c.strokeRect(x+offset,y+h,12,80);}
      c.fillStyle='#101a24';c.fillRect(x-9,y-9,w+18,h+18);c.strokeStyle='#4c606c';c.lineWidth=3;c.strokeRect(x-9,y-9,w+18,h+18);
      c.drawImage(this.billboardImage,x,y,w,h);
      // Two top-mounted floodlights cast warm, downward fans over the poster.
      for(const offset of [72,w-72]){
        const lx=x+offset,ly=y-29;
        c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
        const wash=c.createLinearGradient(0,y,0,y+h);
        wash.addColorStop(0,'#ffe6ab60');wash.addColorStop(.48,'#ffe6ab24');wash.addColorStop(1,'#ffe6ab00');
        c.fillStyle=wash;c.beginPath();c.moveTo(lx-12,ly+8);c.lineTo(lx+12,ly+8);c.lineTo(lx+112,y+h);c.lineTo(lx-112,y+h);c.closePath();c.fill();c.restore();
        // Short visible beam between each lamp and the billboard's top edge.
        const beam=c.createLinearGradient(0,ly+8,0,y+4);beam.addColorStop(0,'#ffe6ab55');beam.addColorStop(1,'#ffe6ab16');
        c.fillStyle=beam;c.beginPath();c.moveTo(lx-10,ly+8);c.lineTo(lx+10,ly+8);c.lineTo(lx+22,y);c.lineTo(lx-22,y);c.closePath();c.fill();
        c.strokeStyle='#16232d';c.lineWidth=6;c.beginPath();c.moveTo(lx-19,y-9);c.lineTo(lx-19,ly-12);c.lineTo(lx,ly-12);c.lineTo(lx,ly);c.stroke();
        c.strokeStyle='#82919a';c.lineWidth=2;c.beginPath();c.moveTo(lx-19,y-9);c.lineTo(lx-19,ly-12);c.lineTo(lx,ly-12);c.stroke();
        c.fillStyle='#263b49';c.strokeStyle='#91a0a7';c.lineWidth=2;c.beginPath();c.moveTo(lx-13,ly-5);c.lineTo(lx+13,ly-5);c.lineTo(lx+21,ly+7);c.lineTo(lx-21,ly+7);c.closePath();c.fill();c.stroke();
        c.save();c.shadowColor='#ffe1a0';c.shadowBlur=12;A.ellipse(c,lx,ly+8,17,4,'#ffedbf');c.restore();
      }
      c.restore();
    }
    fallScene(c,g,t){
      const {FALL}=NRM,deep=g.fallPassed>=25||g.mode==='fall-exit',d=g.fallDistance;
      const grad=c.createLinearGradient(0,0,0,720);grad.addColorStop(0,deep?'#122634':'#332a44');grad.addColorStop(1,deep?'#244957':'#72606b');c.fillStyle=grad;c.fillRect(0,0,1280,720);
      // Three vertical parallax layers: skyline, service walls, close steel columns.
      for(let layer=0;layer<2;layer++){
        const offset=(d*(.12+layer*.14))%280;
        for(let col=0;col<8;col++){const x=col*180-35+(layer?40:0);c.fillStyle=layer?'#20333c88':'#20233777';c.fillRect(x,0,126,720);
          for(let j=-1;j<5;j++){const y=j*280-offset+col%3*30;c.fillStyle=deep?'#8bb5a025':'#cbaa9140';for(let k=0;k<3;k++)c.fillRect(x+20+k*30,y+35,10,23);A.line(c,`M${x} ${y+90}h126`,'#b3b4b41b',2);}
        }
      }
      for(const x of [0,1200]){c.fillStyle=deep?'#172e39':'#2b2939';c.fillRect(x,0,80,720);A.line(c,`M${x+78} 0V720`,'#6a8990',3);}
      for(const x of [94,1176]){c.fillStyle='#182b35';c.fillRect(x,0,10,720);A.line(c,`M${x+3} 0V720`,'#6c8286',2);}
      for(let i=-1;i<6;i++){
        const y=i*180-(d*.65%180);for(const x of [16,1216]){A.path(c,`M${x} ${y}h48v110h-48Z`,'#344650','#162631',3);A.line(c,`M${x+4} ${y+4}l40 102m0-102-40 102`,'#52666f',3);}
        if(deep){A.line(c,`M1110 ${y-60}v130q0 20 20 20h60`,'#0f2632',14);A.line(c,`M1110 ${y-60}v130q0 20 20 20h60`,'#476773',7);}
        for(const x of [105,1175]){c.save();c.shadowBlur=12;c.shadowColor='#efad6b';A.ellipse(c,x,y+80,4,7,'#e5ad76');c.restore();}
      }
      // Wind streaks are scenery only and remain behind the solid obstacles.
      c.globalAlpha=.22;for(let i=0;i<20;i++){let x=160+(i*173)%950,y=(i*113-t*340)%800;if(y<0)y+=800;A.line(c,`M${x} ${y}v-26`,'#bfd0d4',1);}c.globalAlpha=1;
      for(const row of g.fallRows){
        for(const b of NRM.fallRects(row,d)){
          if(b.y>760||b.y+b.h< -80)continue;
          const {x,y,w,h}=b;
          if(row.kind==='cargo'){
            // Ropes are thin decorative lines. Only the outlined crate is solid.
            A.line(c,`M${x+22} ${y}v-110m${w-44} 0v110`,'#779095',2);
            A.path(c,`M${x} ${y}h${w}v${h}h-${w}Z`,'#8e684b','#152631',4);
            A.path(c,`M${x+7} ${y+7}h${w-14}v${h-14}h-${w-14}Z`,'#a57e54','#d2b17c',2);
            A.line(c,`M${x+10} ${y+10}l${w-20} ${h-20}m0-${h-20}-${w-20} ${h-20}`,'#dfba7e',6);
          }else{
            c.fillStyle=row.kind==='floor'?'#879092':'#5e7e8d';c.fillRect(x,y,w,h);c.strokeStyle='#132733';c.lineWidth=4;c.strokeRect(x,y,w,h);
            c.fillStyle=row.kind==='floor'?'#bac2b6':'#97b5ba';c.fillRect(x+2,y+2,w-4,5);
            if(row.kind==='floor'){for(let xx=x+35;xx<x+w;xx+=85)A.line(c,`M${xx} ${y+8}l-8 12 16 12`,'#53636c',2);}
            else{for(let xx=x+16;xx<x+w-35;xx+=72){A.line(c,`M${xx} ${y+8}l45 ${h-15}m0-${h-15}-45 ${h-15}`,'#283e4c',3);A.ellipse(c,xx,y+h/2,2,2,'#d4cec0');}}
          }
          // Danger edge is drawn inside the exact collider, never outside it.
          c.fillStyle='#e4b379';c.fillRect(x,y,w,5);for(let xx=x+4;xx<x+w-8;xx+=22){c.fillStyle='#25323c';c.fillRect(xx,y,8,5);}
          const edge=x<row.center?x+w:x;A.line(c,`M${edge} ${y+3}v${h-6}`,'#ffe0a6',3);
        }
        const y=row.depth-d;if(y>345&&y<690&&!row.scored){c.fillStyle='#d3d9cf';c.textAlign='center';c.font='bold 11px monospace';c.fillText(String(row.index+1).padStart(2,'0')+' / 50',row.center,y-15);}
      }
      // Preview the next offscreen opening before a large lateral transfer.
      const upcoming=g.fallRows.find(row=>!row.scored&&row.depth-g.fallDistance>FALL.anchorY+100);
      if(g.mode==='falling'&&upcoming&&upcoming.depth-d>735){
        c.save();c.strokeStyle='#a3d2cd';c.lineWidth=2;c.setLineDash([7,5]);
        const left=upcoming.center-upcoming.gap/2,right=upcoming.center+upcoming.gap/2;
        A.line(c,`M${left} 685v-17h${right-left}v17`,'#a3d2cd',2);c.setLineDash([]);
        c.fillStyle='#c9e4dc';c.font='bold 11px monospace';c.textAlign='center';c.fillText('NEXT OPENING',upcoming.center,655);c.restore();
      }
      let x=g.fallX,y=FALL.anchorY;
      if(g.mode==='drop'){
        const q=Math.min(1,g.modeTime/1.8),ease=q*q*(3-2*q);x=300+340*ease;y=g.dropY+(FALL.anchorY-g.dropY)*ease;
        // A loose balloon fragment and curling string explain the change of mode.
        const bx=300+q*120,by=g.dropY-190-q*260;A.line(c,`M${bx} ${by}q25 35-5 65`,'#e6d0ab',2);A.path(c,`M${bx} ${by}l-20-10 8-21 13 11 16-8 7 22Z`,'#c87a6b','#26333b',2);
      }
      if(g.mode==='fall-exit'){
        const q=Math.min(1,g.modeTime/1.8),ease=q*q*(3-2*q);x=g.exitX+(300-g.exitX)*ease;y=300+175*ease;
        A.path(c,'M1080 340Q1060 615 400 610H0V665H400Q1130 660 1140 340Z','#617d87','#1a303d',5);
        A.line(c,'M1080 340Q1060 615 400 610H0','#d2bf92',5);
        if(q>.7){c.save();c.globalAlpha=(q-.7)/.3;this.district(c,g.distance,t,1);c.fillStyle='#56666d';c.fillRect(0,480,750,240);A.line(c,'M0 480H750','#d2c0a0',6);c.restore();}
      }
      const dying=g.phase==='dying'||g.phase==='gameover';
      if(dying)y+=g.deathTime*120;
      c.save();c.translate(x,y);c.rotate(Math.max(-.17,Math.min(.17,g.fallVx/3200)));
      (this.character==='jim'?A.jim:A.cat)(c,{x:0,y:0,time:t,state:dying?'collision':'jumping',vy:-80,death:g.deathTime,scale:.78});c.restore();
      if(dying)for(let i=0;i<3;i++){let a=t*3+i*2.1;A.star(c,x+Math.cos(a)*40,y-155+Math.sin(a)*10,6,'#ffdf77',a);}
      c.fillStyle='#bad3d080';c.font='bold 12px monospace';c.textAlign='center';c.fillText(deep?'SECTOR 02 / DEEP SHAFT':'SECTOR 01 / BROKEN FLOORS',640,135);
    }
    closeCallGlow(c,g){
      if(this.closeCallLife<=0||!['playing','paused'].includes(g.phase)||!['running','flying','falling'].includes(g.mode))return;
      const falling=g.mode==='falling',x=falling?g.fallX:C.playerX;
      const y=falling?NRM.FALL.anchorY-62:C.ground-g.y-65+(this.camera||0);
      const age=1-this.closeCallLife/.28,spread=this.reduced?0:age*12;
      c.save();c.globalAlpha=(1-age)*.75;c.strokeStyle='#ffe1a0';c.lineWidth=2;c.lineCap='round';
      // Short glints at the character's sides; never cover the next obstacle.
      for(const side of [-1,1]){const sx=x+side*(46+spread);c.beginPath();c.moveTo(sx-side*4,y-12);c.lineTo(sx+side*3,y-20);c.moveTo(sx,y);c.lineTo(sx+side*10,y-2);c.stroke();}
      c.restore();
    }
    draw(g,dt){
      const frozen=g.phase==='paused';if(!frozen){this.closeCallLife=Math.max(0,this.closeCallLife-dt);this.time+=dt;for(const ring of this.rings){ring.life-=dt;if(g.phase==='playing')ring.x-=g.speed*dt;}this.rings=this.rings.filter(r=>r.life>0);for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=240*dt;p.life-=dt;}this.particles=this.particles.filter(p=>p.life>0);this.shake=Math.max(0,this.shake-dt);}
      const t=this.time,c=this.c,isTitle=g.phase==='title',d=isTitle?t*23:g.distance;
      c.setTransform(this.canvas.width/1280,0,0,this.canvas.height/720,0,0);c.save();if(this.shake>0)c.translate(Math.sin(t*130)*this.shake*16,Math.cos(t*180)*this.shake*9);
      this.weather=NRM.weatherAt(t);
      if(['drop','falling','fall-exit'].includes(g.mode)&&!isTitle){this.fallScene(c,g,t);this.closeCallGlow(c,g);c.globalAlpha=.18;c.fillStyle=this.grain;c.fillRect(0,0,1280,720);c.globalAlpha=1;c.restore();return;}
      this.weather=NRM.weatherAt(t);c.fillStyle=['#1c263c','#29223c','#152d40','#271f2b'][g.biome||0];c.fillRect(0,0,1280,720);c.save();if(!isTitle)c.translate(0,140);this.sceneLayers(c,d,t,g.biome||0,dt,frozen);c.restore();this.weatherBack(c,this.weather,t);
      if(window.Halloween)Halloween.backdrop(c,d,t,isTitle,this.reduced);
      if(!isTitle)this.billboard(c,g);
      if(isTitle){
        // Hero is drawn with the same jointed artwork used during gameplay.
        A.ellipse(c,866,576,123,16,'#3b562b30');(this.character==='jim'?A.jim:A.cat)(c,{x:866,y:572,scale:1.85,time:t,state:'idle'});
        if(window.Halloween)Halloween.title(c,t,this.reduced);
        c.save();c.fillStyle='#91a9ad';c.font='11px monospace';c.textAlign='center';c.fillText((this.character==='jim'?'JIM':'COOKIE')+' / NO BRAKES',866,622);c.restore();
      }else{
        if(this.camera===undefined||g.elapsed===0)this.camera=g.surfaceY-100;
        if(g.mode==='flying')this.camera=NRM.flightCamera(g);else if(!frozen)this.camera+=(g.surfaceY-100-this.camera)*(1-Math.exp(-dt*5));
        c.save();c.translate(0,this.camera);
        for(const p of g.platforms||[])if(p.x<1500&&p.x+p.w>-200){A.platform(c,p,C.ground,t);if(p.takeoff){c.fillStyle='#e9c38b';c.font='bold 15px monospace';c.fillText(p.serial+' / BALLOON DEPARTURE',p.x+12,C.ground-p.h+40);}}
        for(const o of g.gates||[])if(o.x<1500&&o.x+o.w>-160)this.airGate(c,o,g);
        for(const o of g.obstacles)A.obstacle(c,o,C.ground,t);
        if(g.mode==='flying'){const ceil=C.ground-g.flightBase-NRM.FLIGHT.ceiling;A.line(c,`M0 ${ceil}H1280`,'#c7996799',2);}


        const dying=g.phase==='dying'||g.phase==='gameover',jumpY=dying?g.deathY:g.y;
        const under=(g.platforms||[]).filter(p=>p.x<C.playerX&&p.x+p.w>C.playerX&&p.h<=jumpY+1).reduce((h,p)=>Math.max(h,p.h),0);
        A.ellipse(c,C.playerX,C.ground-under+3,Math.max(19,47-(jumpY-under)*.12),6,'#3b51273a');
        (this.character==='jim'?A.jim:A.cat)(c,{x:C.playerX-(dying?Math.min(22,g.deathTime*30):0),y:C.ground-jumpY-5,time:t,state:dying?'collision':g.animation,vy:g.vy,land:g.landTime,impact:g.landStrength,death:g.deathTime,balloon:g.balloon,scale:1-.28*g.balloon});
        if(dying){for(let i=0;i<3;i++){let a=t*3+i*2.094;A.star(c,C.playerX+Math.cos(a)*51,C.ground-jumpY-187+Math.sin(a)*12,7,'#ffdf77',a);}}
        c.restore();
      }
      c.save();if(!isTitle)c.translate(0,this.camera||0);
      if(!this.reduced)for(const r of this.rings){const age=1-r.life/r.max;c.globalAlpha=(1-age)*.65;c.strokeStyle=r.color;c.lineWidth=2;c.beginPath();c.ellipse(r.x,r.y+3,20+age*(28+r.strength*16),3+age*4,0,0,Math.PI*2);c.stroke();}c.globalAlpha=1;
      for(const p of this.particles){c.globalAlpha=Math.max(0,p.life/p.max);if(p.type==='score')A.star(c,p.x,p.y,p.size,p.color,t*2);else A.ellipse(c,p.x,p.y,p.size,p.size*.6,p.color);}c.globalAlpha=1;
      c.restore();this.weatherFront(c,this.weather,t);this.closeCallGlow(c,g);
      c.globalAlpha=.23;c.fillStyle=this.grain;c.fillRect(0,0,1280,720);c.globalAlpha=1;c.restore();
    }
  }
  window.Renderer=Renderer;
})();

