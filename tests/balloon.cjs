const assert=require('node:assert/strict'),{Game,C,FLIGHT,rng}=require('../src/core.js'),{pilot}=require('./pilot.js');
function air(){const g=new Game(rng(17));g.start();for(let n=0;n<16000&&g.mode!=='flying';n++){pilot(g);g.update(C.step);g.drainEvents();}assert.equal(g.mode,'flying');return g;}
for(const location of ['gate','ceiling']){
 const g=air(),o=g.gates[0];o.x=275;g.vy=0;
 const edge=location==='gate'?o.high:g.flightBase+FLIGHT.ceiling;if(location==='ceiling')g.gates=[];
 g.y=edge-FLIGHT.bodyHeight-5;assert(g.y+210>edge,'Balloon crosses boundary');g.update(C.step);assert.equal(g.phase,'playing','Balloon-only overlap safe');
 g.y=edge-FLIGHT.bodyHeight+5;g.vy=0;g.update(C.step);assert.equal(g.phase,'dying','Cat overlap collides');
}
console.log('PASS: balloon ignored at gate and ceiling; Cookie still collides.');
