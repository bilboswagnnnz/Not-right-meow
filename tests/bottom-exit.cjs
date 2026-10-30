const assert=require('node:assert/strict');
const {Game,C,FLIGHT,rng}=require('../src/core.js');
function air(y){const g=new Game(rng(17));g.start();g.mode='flying';g.balloon=1;g.flightBase=100;g.surfaceY=260;g.grounded=false;g.gates=[];g.y=100+y;g.vy=0;return g;}
for(const y of [0,-5,-85,-145,FLIGHT.viewportBottom-FLIGHT.visualHeight+1]){const g=air(y);g.update(C.step);assert.equal(g.phase,'playing','visible character survives at '+y);}
const g=air(-145);g.jump();g.update(C.step);assert.equal(g.phase,'playing');assert(g.vy>0,'can recover while partially off screen');
const gone=air(FLIGHT.viewportBottom-FLIGHT.visualHeight-1);gone.update(C.step);assert.equal(gone.phase,'dying','whole character below viewport dies');
const hazard=air(-100);hazard.gates=[{x:290,w:100,low:120,high:400}];hazard.update(C.step);assert.equal(hazard.phase,'dying','lower obstacle still collides');
console.log('PASS: old floor harmless, partially visible character survives and can recover, whole-character exit dies, lower obstacles remain solid.');
