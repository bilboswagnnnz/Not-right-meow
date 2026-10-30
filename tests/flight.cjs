const assert=require('node:assert/strict');
const {Game,C,FLIGHT,rng}=require('../src/core.js'),{pilot}=require('./pilot.js');
let runs=0,airClears=0;const kinds=new Set();
for(let seed=1;seed<=80;seed++){
 const g=new Game(rng(seed));g.start();let launches=0,returns=0,lastAir=null;const seen=new Set(),route=[];
 for(let n=0;n<100000&&g.score<310&&g.phase==='playing';n++){
  pilot(g);g.update(C.step);
  for(const e of g.drainEvents()){
   if(e.type==='launch'){launches++;assert.equal(g.score,launches===1?50:200);assert(g.platforms.at(-1).takeoff);assert.equal(g.mode,'launch');assert.equal(g.jump(),false);}
   if(e.type==='return'){returns++;assert.equal(g.score,returns*150);assert(g.grounded);assert.equal(g.balloon,0);}
  }
  if(g.mode==='flying'){
   for(const o of g.gates)if(!seen.has(g.flightStart+':'+o.index)){seen.add(g.flightStart+':'+o.index);kinds.add(o.kind);if(g.flightStart===50)route.push({...o,relativeLow:o.low-g.flightBase});assert(o.high-o.low>=180);if(o.index>0&&lastAir)assert.notEqual(o.kind,lastAir);lastAir=o.kind;}
  }
  if(g.mode==='launch'||g.mode==='landing'||g.mode==='flying'){
   if(n%173===0){g.pause();const frozen=JSON.stringify(g);g.update(.1);assert.equal(JSON.stringify(g),frozen);g.resume();}
  }
 }
 assert.equal(g.phase,'playing',`seed ${seed} died at ${g.score}`);assert.equal(g.score,310);assert.equal(launches,2);assert.equal(returns,2);airClears+=100;runs++;
 assert.equal(route.length,50);
 assert(route.some(o=>o.relativeLow<30),'route reaches the bottom');
 assert(route.some(o=>o.relativeLow>315),'route reaches the top');
 assert(route.some(o=>o.high-o.low<=190),'route includes tight passages');
 assert(route.some(o=>o.high-o.low>=290),'route includes recovery openings');
 const changes=route.slice(1).map((o,j)=>o.relativeLow-route[j].relativeLow);
 assert(changes.filter(d=>d>100).length>=8,'multiple substantial climbs');
 assert(changes.filter(d=>d< -100).length>=8,'multiple substantial drops');
 assert(new Set(route.map(o=>Math.round(o.high-o.low))).size>=10,'varied aperture widths');
 assert(route.some(o=>o.transferSeconds<1)&&route.some(o=>o.transferSeconds>1.8),'short sprints and longer transfers');
}
// Controlled collision probes of the actual flight update, both sides and world bounds.
function airborne(){const g=new Game(rng(17));g.start();for(let n=0;g.mode!=='flying'&&n<20000;n++){pilot(g);g.update(C.step);g.drainEvents();}assert.equal(g.mode,'flying');return g;}
for(const where of ['top','bottom','ceiling','floor']){const g=airborne(),o=g.gates[0];o.x=290;g.vy=0;g.y=where==='top'?o.high-FLIGHT.bodyHeight+5:where==='bottom'?o.low-FLIGHT.bottomInset-5:where==='ceiling'?g.flightBase+FLIGHT.ceiling: g.flightBase+FLIGHT.viewportBottom-FLIGHT.visualHeight-5;if(['floor','ceiling'].includes(where))g.gates=[];g.update(C.step);assert.equal(g.phase,'dying',where+' collision');g.start();assert.equal(g.mode,'running');assert.equal(g.score,0);assert.equal(g.balloon,0);}
const g=airborne();assert(g.jump());assert(!g.jump(),'same instant flap blocked');g.update(.13);assert(g.jump(),'new airborne press lifts');assert.equal(g.vy,FLIGHT.lift);
console.log(JSON.stringify({passed:true,runs,airClears,flightTypes:[...kinds],transitions:'50→flight→100→fall→150→ground; 200→flight→250→fall→300→ground',collisionProbes:4}));
