const assert=require('node:assert/strict');const{Game,C,CHAPTERS,rng,weatherAt}=require('../src/core.js');
let checks=0;const ok=(x,msg)=>{assert(x,msg);checks++;};
const step=(g,n)=>{for(let i=0;i<n;i++){g.update(C.step);g.drainEvents();}};
const {pilot}=require('./pilot.js');
let g=new Game(rng(1));g.start();ok(g.y===180&&g.grounded,'starts on actual rooftop');ok(g.jump(),'roof jump');ok(!g.jump(),'no double jump');step(g,85);ok(g.grounded&&g.y===180,'lands on same roof');g.pause();const frozen=JSON.stringify(g);step(g,100);ok(JSON.stringify(g)===frozen,'pause freezes entire simulation');g.resume();step(g,1);ok(g.elapsed>85*C.step,'resume');
g.start();step(g,1000);ok(g.phase==='gameover','missed gap ends run; no safe ground');g.best=12;g.start();ok(g.best===12&&g.score===0&&g.y===180,'restart');
let total=0,kinds=new Set(),chapters=new Set(),max=0;
for(const offset of[-.015,0,.015])for(let seed=1;seed<=40;seed++){
 g=new Game(rng(seed));g.start();let lastSerial=0,transfers=0;
 for(let n=0;g.phase==='playing'&&g.score<300&&n<50000;n++){
  pilot(g,offset);g.update(C.step);g.drainEvents();
  if(g.grounded){kinds.add(g.platforms.find(p=>p.x<318&&p.x+p.w>282&&p.h===g.y)?.kind);if(g.chapterId>=0)chapters.add(g.chapterId);max=Math.max(max,g.y);}
 }
 ok(g.score>=300,`seed ${seed} offset ${offset} score ${g.score} hit ${g.hitKind}, y ${g.y}`);total+=g.score;
 ok(require('../src/core.js').speedAt(g.elapsed)===C.maxSpeed,'reaches running speed cap');
 const history=g.generatedChapters;for(let i=1;i<history.length;i++)ok(history[i]!==history[i-1],'no adjacent chapter repeat');
}
ok(chapters.size===CHAPTERS.length,'all eight chapters played');ok(kinds.size===10,'all ten architecture types landed');ok(max>350,'route climbs far above street');
// Actual collision geometry: a roof face is solid; the space under a beam is empty.
for(const kind of['roof','beam']){g=new Game();g.start();g.platforms=[{kind,x:270,w:400,h:400,scored:true}];g.y=180;g.surfaceY=400;g.grounded=false;g.update(C.step);ok(kind==='roof'?g.phase==='dying':g.phase==='playing','visible surface collision '+kind);}
for(const [t,name]of[[0,'CLEAR DUSK'],[16,'RAIN'],[32,'FOG'],[46,'STORM'],[62,'CLEAR DUSK']])ok(weatherAt(t).label===name,'weather '+name);
for(let t=0;t<180;t+=.03){const a=weatherAt(t),b=weatherAt(t+.03);for(const key of['rain','fog','storm','wind'])assert(a[key]>=0&&a[key]<=1&&Math.abs(a[key]-b[key])<.013);}
console.log(JSON.stringify({passed:true,checks,combinedClears:total,seeds:40,timingOffsetsMs:[-15,0,15],chapters:[...chapters],surfaces:[...kinds],highestLanding:max},null,2));

// Validate every crate cap is truly narrow and can be missed with poor timing.
let crateVisits=0;
for(let seed=1;seed<=10;seed++){
 const g=new Game(rng(seed));g.start();const seen=new Set();
 for(let i=0;i<18000&&g.score<80&&g.phase==='playing';i++){
  for(const p of g.platforms){if(p.serial>0&&!p.takeoff&&!p.recovery)assert(p.w<=258,'No generated platform is a long runway');}
  for(const p of g.platforms)if(p.kind==='crate_stack'&&!seen.has(p.serial)){seen.add(p.serial);assert(p.w>=109&&p.w<=166);crateVisits++;}
  pilot(g);g.update(C.step);g.drainEvents();
 }
 assert(g.score>=80);
}
const miss=new Game(rng(17));miss.start();
for(let i=0;i<3000&&miss.phase==='playing';i++){
 const p=miss.platforms.find(p=>p.h===miss.y&&p.x<318&&p.x+p.w>282);
 if(miss.grounded&&p&&p.x+p.w-300<=(p.kind==='crate_stack'?18:26)+(miss.score===1?150:0))miss.jump();
 miss.update(C.step);miss.drainEvents();
}
assert.notEqual(miss.phase,'playing','An early jump into a narrow cap must fail');
console.log('Crate checks passed: '+crateVisits+' caps, all 109–166 px; poorly timed approach fails.');

const {speedAt,travelAt,paceAt}=require('../src/core.js');
for(let t=0;t<=50;t+=.25)assert.equal(speedAt(t),470+t*5.5,'approved opening speed retained');
assert(speedAt(90)>speedAt(60));assert(speedAt(150)>speedAt(90));assert.equal(speedAt(180),860);assert.equal(speedAt(10000),860);
assert.deepEqual([0,20,55,100].map(paceAt),[0,1,2,3]);
for(let t=0;t<210;t+=.125)assert(Math.abs((travelAt(t+.001)-travelAt(t))/.001-speedAt(t))<.01,'continuous distance function');
const materials=new Set();const impact=new Game(rng(9));impact.start();
for(let i=0;i<12000&&impact.score<70;i++){pilot(impact);impact.update(C.step);for(const e of impact.drainEvents())if(e.type==='land'){materials.add(e.material);assert(e.strength>=0&&e.strength<=1);}}
assert.deepEqual([...materials].sort(),['masonry','metal','wood']);
console.log('Late progression to 860 px/s, four pace stages, continuous travel and three landing materials passed.');
