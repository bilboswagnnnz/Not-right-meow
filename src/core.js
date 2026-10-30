/* Deterministic rooftop runner: the route itself is the obstacle. */
(function(root){
'use strict';
const C=Object.freeze({width:1280,height:720,ground:580,playerX:300,gravity:2400,jumpVelocity:820,initialSpeed:470,maxSpeed:860,step:1/120});
const FLIGHT=Object.freeze({gravity:800,lift:270,bodyHeight:110,halfWidth:26,bottomInset:6,visualHeight:140,viewportBottom:-85,ceiling:560});
// Shared geometry: renderer and collision checks use these exact visible solids.
function airSolids(o){return [{x:o.x,y:o.low-1600,w:o.w,h:1600},{x:o.x,y:o.high,w:o.w,h:1600}];}
function airBody(g){return {x:C.playerX-FLIGHT.halfWidth,y:g.y+FLIGHT.bottomInset,w:FLIGHT.halfWidth*2,h:FLIGHT.bodyHeight-FLIGHT.bottomInset};}
function flightCamera(g){return g.flightBase+60;}
function flightVisible(g){return C.ground+flightCamera(g)-5-FLIGHT.visualHeight-g.y<=C.height;}
const FALL=Object.freeze({left:120,right:1160,anchorY:300,bodyHeight:116,halfWidth:27,maxVx:560,accel:2400,brake:3000});
function fallRects(row,distance){return row.blocks.map(b=>({x:b.x,y:row.depth-distance+(b.offset||0),w:b.w,h:b.h}));}
const BIOMES=['RAIL YARD','ROOFTOPS','HARBOR','FOUNDRY'];
// Each chapter is a different traversal, not a bag of ground obstacles.
// [surface, change in elevation]; widths and gaps are tuned below.
const CHAPTERS=[
 {name:'ROOFTOP ESCAPE',biome:1,steps:[['roof',48],['crate_stack',56],['crate_stack',-32],['roof',-56],['crane',64],['beam',32],['beam',-48],['beam',48],['roof',-64]]},
 {name:'THE LIFT',biome:2,steps:[['container',32],['crate_stack',56],['crate_stack',-48],['crane',64],['beam',56],['beam',-32],['gantry',48],['container',-80]]},
 {name:'SKYBRIDGE',biome:1,steps:[['roof',32],['bridge',0],['scaffold',-64],['scaffold',56],['roof',48],['duct',-32]]},
 {name:'STEELWORKS',biome:3,steps:[['gantry',48],['beam',-64],['beam',56],['crate_stack',32],['crate_stack',-56],['duct',56],['gantry',-48],['scaffold',48],['roof',-32]]},
 {name:'WATER TOWERS',biome:1,steps:[['tower',56],['roof',-80],['tower',64],['bridge',-32],['roof',48]]},
 {name:'DRY DOCK',biome:2,steps:[['container',-48],['crate_stack',56],['crate_stack',32],['container',-32],['crane',48],['beam',-64],['beam',32],['gantry',56],['container',-48]]},
 {name:'THE DESCENT',biome:3,steps:[['scaffold',-64],['duct',-48],['gantry',56],['beam',48],['bridge',-64],['roof',48]]},
 {name:'NIGHT EXPRESS',biome:0,steps:[['gantry',32],['bridge',0],['tower',56],['beam',-48],['crane',48],['roof',-64]]}
];
// Flight phrases specify bottom height, opening size and preferred clear travel time.
// Heights are relative to the airspace floor, not the preceding gate.
const AIR_PHRASES=[
 {name:'RAPID CLIMB',steps:[[40,225,.95],[175,205,.95],[315,205,.95]]},
 {name:'DIVE STEPS',steps:[[325,205,1],[190,190,.9],[22,205,.9]]},
 {name:'SWITCHBACK',steps:[[65,215,.95],[260,210,.95],[75,195,.95],[310,215,1]]},
 {name:'THE NEEDLE',steps:[[155,310,1.05],[195,185,.88],[140,295,.95]]},
 {name:'LOW PASS',steps:[[18,190,.9],[100,225,.95],[25,185,.9]]},
 {name:'HIGH WIRE',steps:[[295,225,.95],[340,190,.9],[260,245,.95]]},
 {name:'SPLIT S',steps:[[300,220,1],[55,225,.9],[245,195,.95],[25,235,.9]]}
];
const PACE=['WARMUP','MOMENTUM','OVERTIME','REDLINE'];
function speedAt(t){const knee=(760-C.initialSpeed)/5.5;return t<=knee?C.initialSpeed+t*5.5:Math.min(C.maxSpeed,760+(t-knee)*.8);}
function travelAt(t){const knee=(760-C.initialSpeed)/5.5,tail=Math.max(0,t-knee),ramp=Math.min(t,knee),slow=Math.min(tail,125);return C.initialSpeed*ramp+2.75*ramp*ramp+760*slow+.4*slow*slow+C.maxSpeed*Math.max(0,tail-125);}
function arrivalAfter(elapsed,distance){let lo=0,hi=Math.max(0,distance)/C.initialSpeed+1;for(let i=0;i<24;i++){const mid=(lo+hi)/2;if(travelAt(elapsed+mid)-travelAt(elapsed)<distance)lo=mid;else hi=mid;}return(lo+hi)/2;}
function paceAt(t){return t<20?0:t<55?1:t<100?2:3;}
function rng(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
class Game{
 constructor(random=Math.random){this.random=random;this.best=0;this.phase='title';this.reset();this.phase='title';}
 reset(){
  this.fallRows=[];this.fallX=640;this.fallVx=0;this.steerInput=0;this.fallDistance=0;this.fallPassed=0;this.fallSpawned=0;this.fallStart=100;this.mode='running';this.modeTime=0;this.groundEnd=50;this.flightStart=50;this.flightPassed=0;this.flightSpawned=0;this.gates=[];this.balloon=0;this.flightBase=0;this.flightBag=[];this.airPhraseBag=[];this.airSteps=[];this.lastAirPhrase=-1;this.lastFlightKind='';this.flapTime=1;this.score=0;this.elapsed=0;this.pace=0;this.landStrength=0;this.distance=0;this.speed=C.initialSpeed;this.y=180;this.surfaceY=180;this.vy=0;this.animation='running';this.animTime=0;this.landTime=0;this.deathTime=0;this.deathY=0;this.deathVy=0;this.grounded=true;this.events=[];this.newBest=false;
  this.biome=1;this.routeIndex=0;this.chapter='ROOFTOP ESCAPE';this.chapterId=0;this.chapterBag=[];this.lastChapter=0;this.nextSerial=1;this.generatedChapters=[];
  this.obstacles=[];this.platforms=[{kind:'roof',x:-500,w:1450,h:180,biome:1,chapter:0,name:this.chapter,serial:0,scored:true,variant:0}];
  this.hitKind='gap';this.hitOverhead=false;this.appendChapter(0);
 }
 start(){this.reset();this.phase='playing';this.events.push({type:'start'});}
 jump(){if(this.phase!=='playing')return false;if(this.mode==='flying'){if(this.flapTime<.12)return false;this.flapTime=0;this.vy=FLIGHT.lift;this.animation='jumping';this.animTime=0;this.events.push({type:'flap',y:this.y});return true;}if(this.mode!=='running'||!this.grounded)return false;this.grounded=false;this.vy=C.jumpVelocity;this.animation='jumping';this.animTime=0;this.events.push({type:'jump',y:this.y});return true;}
 steer(direction){this.steerInput=Math.max(-1,Math.min(1,direction));}
 pause(){if(this.phase==='playing'){this.steerInput=0;this.phase='paused';return true;}return false;}
 resume(){if(this.phase==='paused'){this.phase='playing';return true;}return false;}
 chooseChapter(){
  if(!this.chapterBag.length){this.chapterBag=CHAPTERS.map((_,i)=>i).filter(i=>i!==this.lastChapter);for(let i=this.chapterBag.length-1;i>0;i--){let j=Math.floor(this.random()*(i+1));[this.chapterBag[i],this.chapterBag[j]]=[this.chapterBag[j],this.chapterBag[i]];}}
  return this.chapterBag.pop();
 }
 appendChapter(id){
  const spec=CHAPTERS[id];this.lastChapter=id;this.generatedChapters.push(id);if(this.generatedChapters.length>16)this.generatedChapters.shift();
  let prev=this.platforms[this.platforms.length-1];
  for(const [surface,rise] of spec.steps){
   if(this.nextSerial>this.groundEnd)return;
   const kind=this.nextSerial===this.groundEnd?'roof':surface;
   // Spacing uses the predicted speed on arrival, including acceleration.
   const arrival=Math.max(0,(prev.x+prev.w-C.playerX)/this.speed),speed=Math.min(760,this.speed+arrival*5.5);
   let h=prev.h+rise;if(h>440)h=prev.h-Math.abs(rise);if(h<160)h=prev.h+Math.abs(rise);h=Math.max(160,Math.min(440,h));
   const tight=kind==='crate_stack',pressure=Math.min(1,this.nextSerial/32);
   // Platform widths no longer grow with speed. Even roofs are short targets.
   const widths={roof:[210,35,42],bridge:[224,40,34],crane:[188,28,34],gantry:[174,24,30],container:[192,32,36],tower:[160,24,28],duct:[158,24,28],beam:[134,20,24],scaffold:[138,20,24]};
   const band=widths[kind];
   let w=tight?Math.round(152-pressure*30+this.random()*14):Math.round(band[0]-band[1]*pressure+this.random()*band[2]);
   // Keep the approved opening exactly intact; late-run targets contract further.
   const late=Math.min(1,Math.max(0,(this.elapsed+arrival-60)/90));
   w=Math.max(100,Math.round(w*(1-late*.10)));
   if(this.nextSerial===this.groundEnd)w=320;
   // Every transfer is placed from its fixed-step flight time. A short cap
   // offers little time on the ground, but the next jump is always reachable.
   const v=C.jumpVelocity-C.gravity*C.step/2,flight=(v+Math.sqrt(v*v-2*C.gravity*(h-prev.h)))/C.gravity;
   const lead=prev.kind==='crate_stack'?18:26;
   const landing=w*(.27+this.random()*.06);
   const launch=this.elapsed+arrivalAfter(this.elapsed,Math.max(0,prev.x+prev.w-C.playerX-lead));
   const gap=this.elapsed+arrival<50?Math.round(speed*flight+2.75*flight*flight-lead-landing):Math.round(travelAt(launch+flight)-travelAt(launch)-lead-landing);
   const p={kind,x:prev.x+prev.w+gap,w,h,biome:spec.biome,chapter:id,name:spec.name,serial:this.nextSerial++,scored:false,variant:this.random(),gap};
   p.takeoff=this.nextSerial-1===this.groundEnd;p.rigH=kind==='beam'?(prev.rigH||prev.h+332):h+332;this.platforms.push(p);prev=p;
  }
 }
 land(p){
  this.landStrength=Math.min(1,Math.abs(this.vy)/1100);const material=p.kind==='crate_stack'?'wood':['roof','tower'].includes(p.kind)?'masonry':'metal';
  this.y=p.h;this.surfaceY=p.h;this.vy=0;this.grounded=true;this.animation='landing';this.animTime=0;this.landTime=.17;this.events.push({type:'land',y:this.y,material,strength:this.landStrength});
  if(!p.scored){p.scored=true;this.score++;this.events.push({type:'score',score:this.score,y:this.y});}
  if(this.chapterId!==p.chapter){this.chapterId=p.chapter;this.chapter=p.name;this.biome=p.biome;this.routeIndex++;this.events.push({type:'biome',biome:this.biome,name:p.name});}
  if(this.score===this.groundEnd)this.beginFlight(p);
 }
 beginFlight(p){
  this.mode='launch';this.modeTime=0;this.flightStart=this.score;this.flightPassed=0;this.flightSpawned=0;this.gates=[];this.flightBag=[];this.airPhraseBag=[];this.airSteps=[];this.lastAirPhrase=-1;this.lastFlightKind='';this.flightBase=p.h-120;this.launchY=this.y;this.surfaceY=this.flightBase+160;this.grounded=false;this.animation='jumping';this.vy=0;this.balloon=0;this.chapter='BALLOON DEPARTURE';this.platforms=this.platforms.filter(q=>q.serial<=p.serial);this.events.push({type:'launch',name:'BALLOON UP — TAP SPACE TO FLY',y:this.y});
 }
 appendFlightGate(){
  if(this.flightSpawned>=50)return;
  if(!this.flightBag.length){this.flightBag=['bridge','cargo','antenna','steel'];for(let i=3;i>0;i--){const j=Math.floor(this.random()*(i+1));[this.flightBag[i],this.flightBag[j]]=[this.flightBag[j],this.flightBag[i]];}if(this.flightBag[3]===this.lastFlightKind)[this.flightBag[0],this.flightBag[3]]=[this.flightBag[3],this.flightBag[0]];}
  const i=this.flightSpawned++,kind=this.flightBag.pop();this.lastFlightKind=kind;
  const prev=this.gates[this.gates.length-1];
  let spec,maneuver;
  if(i<6){spec=[[150,270,1.3],[225,235,1.1],[320,215,1.05],[180,265,1.1],[22,215,1.05],[125,300,1.2]][i];maneuver='FIRST SWITCHBACK';}
  else{
   if(!this.airSteps.length){
    if(!this.airPhraseBag.length){this.airPhraseBag=AIR_PHRASES.map((_,j)=>j).filter(j=>j!==this.lastAirPhrase);for(let j=this.airPhraseBag.length-1;j>0;j--){const k=Math.floor(this.random()*(j+1));[this.airPhraseBag[j],this.airPhraseBag[k]]=[this.airPhraseBag[k],this.airPhraseBag[j]];}}
    const id=this.airPhraseBag.pop();this.lastAirPhrase=id;this.airSteps=AIR_PHRASES[id].steps.map(step=>({step,name:AIR_PHRASES[id].name}));
   }
   const next=this.airSteps.shift();spec=next.step;maneuver=next.name;
  }
  const pressure=Math.min(1,i/40),gap=Math.max(180,Math.round(spec[1]-pressure*5+(i<6?0:(this.random()-.5)*10)));
  const offset=Math.max(16,Math.min(FLIGHT.ceiling-gap-16,spec[0]+(i<6?0:(this.random()-.5)*18)));
  const low=this.flightBase+offset,w=kind==='bridge'?110:kind==='cargo'?92:kind==='steel'?78:64;
  const delta=prev?low-prev.low:0;
  // Reserve time for the cat to leave the preceding solid face before changing lanes.
  // Climbs allow a repeated-tap ascent; dives allow an initial upward impulse to decay.
  const changeTime=delta>0?delta/175+.45:(270+Math.sqrt(270*270+1600*Math.abs(delta)))/800+.22;
  const seconds=Math.max(spec[2]-.10*pressure,Math.abs(delta)>45?changeTime:.82)+this.random()*.14;
  const arrivalSpeed=330+Math.min(80,i*1.6)+Math.min(40,Math.floor(this.flightStart/100)*15);
  const x=prev?prev.x+prev.w+arrivalSpeed*seconds:1320;
  this.gates.push({kind,x,w,low,high:low+gap,index:i,scored:false,maneuver,direction:delta>55?'CLIMB':delta<-55?'DROP':'THREAD',transferSeconds:seconds});

 }
 updateAir(dt,travel){
  this.modeTime+=dt;this.flapTime+=dt;
  for(const p of this.platforms)p.x-=travel;
  this.platforms=this.platforms.filter(p=>p.x+p.w>-160);
  if(this.mode==='launch'){
   this.balloon=Math.min(1,this.modeTime/.65);const q=Math.min(1,this.modeTime/1.15),smooth=q*q*(3-2*q);this.y=this.launchY+(this.flightBase+235-this.launchY)*smooth;
   if(q===1){this.mode='flying';this.modeTime=0;this.vy=80;this.chapter='UNDER THE BRIDGES';this.biome=2;this.platforms=[];this.appendFlightGate();this.events.push({type:'flight',name:'FLIGHT 1 / 50 — TAP TO LIFT, RELEASE TO DROP'});}return;
  }
  if(this.mode==='landing'){
   const q=Math.min(1,this.modeTime/1.85),smooth=q*q*(3-2*q);this.y=this.launchY+(this.returnRoof.h-this.launchY)*smooth;this.vy=0;this.balloon=1-Math.max(0,(q-.6)/.4);
   if(q===1){this.mode='running';this.balloon=0;this.groundEnd=this.score+50;this.nextSerial=this.score+1;this.chapterId=-1;this.land(this.returnRoof);this.appendChapter(this.chooseChapter());this.events.push({type:'return',name:'BACK ON THE ROOFS — SPACE TO JUMP'});}return;
  }
  this.vy-=FLIGHT.gravity*dt;this.y+=this.vy*dt;
  const chapterIndex=Math.floor(this.flightPassed/13),names=['UNDER THE BRIDGES','CRANE AIRSPACE','ANTENNA ALLEY','THE LAST SPAN'];
  if(this.chapter!==names[chapterIndex]){this.chapter=names[chapterIndex];this.biome=[2,3,1,2][chapterIndex];this.events.push({type:'airchapter',name:this.chapter});}
  for(const o of this.gates){
   o.x-=travel;
   if(airSolids(o).some(s=>overlap(airBody(this),s))){this.die({kind:o.kind});return;}
   if(!o.scored&&o.x+o.w<C.playerX-FLIGHT.halfWidth){o.scored=true;this.flightPassed++;this.score++;this.events.push({type:'score',score:this.score,y:this.y});}
  }
  // Flight camera settles at base+60; character anchor is 5 px above its feet.
  // Screen bottom is therefore base-85. Allow the entire tilted character
  // (140 px conservative visual extent, no balloon) to leave before dying.
  if(!flightVisible(this)||this.y+FLIGHT.bodyHeight>this.flightBase+FLIGHT.ceiling){this.die({kind:'airspace'});return;}
  this.gates=this.gates.filter(o=>o.x+o.w>-160);
  if(this.flightPassed===50){this.beginFall();return;}
  const last=this.gates[this.gates.length-1];if(!last||last.x+last.w<1700)this.appendFlightGate();
 }
 beginFall(){
  this.mode='drop';this.modeTime=0;this.fallStart=this.score;this.fallPassed=0;this.fallSpawned=0;this.fallRows=[];this.fallDistance=0;this.fallX=640;this.fallVx=0;this.steerInput=0;this.dropY=C.ground-this.y-5+flightCamera(this);this.balloon=0;this.gates=[];this.platforms=[];this.chapter='THE DROP';this.events.push({type:'drop',name:'BALLOON POPPED — HOLD LEFT / RIGHT TO SLIDE'});
 }
 appendFallRow(){
  if(this.fallSpawned>=50)return;
  const i=this.fallSpawned++,deep=i>=25,pressure=Math.min(1,i/49),cycle=Math.min(3,Math.floor(this.fallStart/150));
  const widths=deep?[240,205,285,220,330,195]:[380,330,410,300,360,290];
  const gap=widths[i%widths.length]-cycle*8;
  // Shuffle complete traversals, with no duplicate phrase at a boundary.
  if(!this.fallSteps?.length||i===0){
   const phrases=[[270,610,960,630],[970,650,290,580],[620,300,900,620],[310,940,650,280]];
   let pick=Math.floor(this.random()*phrases.length);if(pick===this.lastFallPhrase)pick=(pick+1)%phrases.length;
   this.lastFallPhrase=pick;this.fallSteps=phrases[pick].slice();
  }
  let center=this.fallSteps.shift()+(this.random()-.5)*36;
  center=Math.max(FALL.left+gap/2+12,Math.min(FALL.right-gap/2-12,center));
  if(i===0)center=640;
  const previous=this.fallRows.at(-1),kind=deep?['beam','cargo','split','floor'][i%4]:['floor','beam','floor','split'][i%4];
  const h=kind==='cargo'?94:kind==='floor'?44:30;
  const speed=260+i*2.6+cycle*12;
  // Include full body clearance, acceleration, reversal, and an extra reaction buffer.
  const delta=previous?Math.abs(center-previous.center):0;
  const spacing=Math.max(340,speed*(delta/460+.52)+FALL.bodyHeight+(previous?.height||44));
  const depth=previous?previous.depth+spacing:this.fallDistance+910;
  const left=center-gap/2,right=center+gap/2;
  const blocks=kind==='cargo'?[{x:Math.max(80,left-240),w:Math.min(240,left-80),h},{x:right,w:Math.min(240,1200-right),h}]:[{x:80,w:left-80,h},{x:right,w:1200-right,h}];
  if(kind==='split')blocks[1].offset=42;
  this.fallRows.push({index:i,depth,center,gap,kind,height:h+(kind==='split'?42:0),blocks,scored:false,deep});
 }
 updateFall(dt){
  this.modeTime+=dt;
  if(this.mode==='drop'){
   if(this.modeTime>=1.8){this.mode='falling';this.modeTime=0;this.chapter='BROKEN FLOORS';this.appendFallRow();this.events.push({type:'fall',name:'FREEFALL — HOLD ← / → OR A / D'});}return;
  }
  if(this.mode==='fall-exit'){
   if(this.modeTime>=1.8){this.mode='running';this.modeTime=0;this.groundEnd=this.score+50;this.nextSerial=this.score+1;this.chapterId=-1;this.y=240;this.surfaceY=240;this.vy=0;this.grounded=true;this.balloon=0;this.platforms=[{kind:'roof',x:-300,w:1000,h:240,biome:1,chapter:-2,name:'ROOFTOP RETURN',serial:this.score,scored:true,recovery:true,variant:0}];this.land(this.platforms[0]);this.appendChapter(this.chooseChapter());this.events.push({type:'return',name:'BACK ON THE ROOFS — SPACE TO JUMP'});}return;
  }
  this.chapter=this.fallPassed<25?'BROKEN FLOORS':'DEEP SHAFT';this.biome=this.fallPassed<25?1:2;
  const goal=this.steerInput*FALL.maxVx,rate=(this.steerInput?FALL.accel:FALL.brake)*dt;
  this.fallVx+=Math.max(-rate,Math.min(rate,goal-this.fallVx));this.fallX+=this.fallVx*dt;
  if(this.fallX<FALL.left||this.fallX>FALL.right){this.fallX=Math.max(FALL.left,Math.min(FALL.right,this.fallX));this.fallVx=0;}
  this.speed=260+this.fallPassed*2.6+Math.min(3,Math.floor(this.fallStart/150))*12;this.fallDistance+=this.speed*dt;
  const body={x:this.fallX-FALL.halfWidth,y:FALL.anchorY-FALL.bodyHeight,w:FALL.halfWidth*2,h:FALL.bodyHeight-5};
  for(const row of this.fallRows){
   if(fallRects(row,this.fallDistance).some(r=>overlap(body,r))){this.die({kind:row.kind});return;}
   if(!row.scored&&row.depth+row.height-this.fallDistance<body.y){row.scored=true;this.fallPassed++;this.score++;this.events.push({type:'score',score:this.score,y:this.y});if(this.fallPassed===25)this.events.push({type:'fall',name:'DEEP SHAFT — WATCH THE SUSPENDED CARGO'});}
  }
  this.fallRows=this.fallRows.filter(r=>r.depth+r.height-this.fallDistance>-160);
  if(this.fallPassed===50){this.mode='fall-exit';this.modeTime=0;this.exitX=this.fallX;this.steerInput=0;this.fallRows=[];this.chapter='THE ESCAPE CHUTE';this.events.push({type:'approach',name:'50 DROPS CLEARED — ROOFTOPS AHEAD'});return;}
  const last=this.fallRows.at(-1);if(!last||last.depth-this.fallDistance<1500)this.appendFallRow();
 }
 die(o){if(this.phase!=='playing')return;this.phase='dying';this.animation='collision';this.animTime=0;this.deathTime=0;this.deathY=this.y;this.deathVy=300;this.hitKind=o.kind;this.newBest=this.newBest||this.score>this.best;this.best=Math.max(this.best,this.score);this.events.push({type:'collision',kind:o.kind,y:this.y});}
 update(dt){
  if(this.phase==='title'){this.animTime+=dt;return;}
  if(this.phase==='dying'){this.deathTime+=dt;this.animTime+=dt;this.deathVy-=1200*dt;this.deathY+=this.deathVy*dt;if(this.deathTime>=.4){this.phase='gameover';this.events.push({type:'gameover'});}return;}
  if(this.phase!=='playing')return;
  this.elapsed+=dt;this.animTime+=dt;this.speed=this.mode==='flying'?330+Math.min(80,this.flightPassed*1.6)+Math.min(40,Math.floor(this.flightStart/100)*15):this.mode==='launch'?180:this.mode==='landing'?300:speedAt(this.elapsed);const pace=paceAt(this.elapsed);if(pace!==this.pace){this.pace=pace;this.events.push({type:'pace',name:PACE[pace]});}const travel=this.speed*dt;this.distance+=travel;
  if(['drop','falling','fall-exit'].includes(this.mode)){this.updateFall(dt);return;}
  if(this.mode!=='running'){this.updateAir(dt,travel);return;}
  for(const p of this.platforms)p.x-=travel;
  const supported=this.platforms.some(p=>Math.abs(p.h-this.y)<.01&&p.x<C.playerX+18&&p.x+p.w>C.playerX-18);
  if(this.grounded&&!supported){this.grounded=false;this.animation='jumping';}
  if(!this.grounded){
   const oldY=this.y;this.vy-=C.gravity*dt;this.y+=this.vy*dt;
   if(this.vy<=0){const surfaces=this.platforms.filter(p=>p.x<C.playerX+18&&p.x+p.w>C.playerX-18&&oldY>=p.h-.001&&this.y<=p.h).sort((a,b)=>b.h-a.h);if(surfaces.length){this.land(surfaces[0]);if(this.mode!=='running')return;}}
  }
  if(this.landTime>0){this.landTime-=dt;if(this.landTime<=0&&this.grounded){this.animation='running';this.animTime=0;}}
  for(const p of this.platforms){
   // Building faces are solid; suspended steel only occupies its visible slab.
   const depth=['roof','container','tower','crate_stack'].includes(p.kind)?1000:30;
   if(C.playerX+25>p.x+5&&C.playerX-25<p.x+p.w-5&&this.y<p.h-3&&this.y+130>p.h-depth){this.die(p);return;}
  }
  if(this.y<this.surfaceY-240||this.y<0){this.die({kind:'gap'});return;}
  this.platforms=this.platforms.filter(p=>p.x+p.w>-160);
  if(this.nextSerial<=this.groundEnd&&this.platforms[this.platforms.length-1].x+this.platforms[this.platforms.length-1].w<2200)this.appendChapter(this.chooseChapter());
 }
 drainEvents(){return this.events.splice(0);}
}
  // Smooth weather is atmospheric only. It never modifies physics or collision.
  function weatherAt(seconds){
    const presets=[{label:'CLEAR DUSK',rain:0,fog:0,storm:0,wind:.15},{label:'RAIN',rain:.65,fog:.08,storm:0,wind:.45},{label:'FOG',rain:.08,fog:1,storm:0,wind:.22},{label:'STORM',rain:1,fog:.17,storm:1,wind:1}];
    const durations=[10,16,14,16];let t=((seconds%56)+56)%56,i=0;
    while(t>=durations[i]&&i<3){t-=durations[i];i++;}
    const a=presets[(i+3)%4],b=presets[i],fade=Math.min(1,t/4),v=fade*fade*(3-2*fade);
    // First visit opens in clear weather, not the tail of a previous storm.
    const prev=seconds<10?presets[0]:a;
    return {label:v<.5?prev.label:b.label,rain:prev.rain+(b.rain-prev.rain)*v,fog:prev.fog+(b.fog-prev.fog)*v,storm:prev.storm+(b.storm-prev.storm)*v,wind:prev.wind+(b.wind-prev.wind)*v};
  }
const API={C,FLIGHT,FALL,airSolids,airBody,flightCamera,flightVisible,fallRects,AIR_PHRASES,BIOMES,CHAPTERS,PACE,speedAt,travelAt,paceAt,Game,rng,overlap,weatherAt};root.NRM=API;if(typeof module!=='undefined')module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
