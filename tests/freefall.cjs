const assert=require('node:assert/strict'),{Game,C,FALL,rng,fallRects,overlap}=require('../src/core.js'),{pilot}=require('./pilot.js');
let rows=0;const kinds=new Set(),widths=new Set();
for(let seed=1;seed<=120;seed++){
 const g=new Game(rng(seed));g.start();g.score=100+(seed%4)*150;const target=g.score+50;g.y=300;g.beginFall();
 const seen=new Set();let nextControl=0;
 for(let n=0;n<30000&&g.mode!=='running'&&g.phase==='playing';n++){
  // 100ms control cadence exercises reaction/momentum, rather than perfect per-step input.
  if(n>=nextControl){pilot(g);nextControl=n+12;}g.update(C.step);g.drainEvents();
  for(const r of g.fallRows)if(!seen.has(r.index)){seen.add(r.index);kinds.add(r.kind);widths.add(r.gap);assert(r.gap>=171);rows++;}
 }
 assert.equal(g.phase,'playing','seed '+seed+' at '+g.score);assert.equal(g.score,target);assert.equal(g.mode,'running');assert(g.grounded);assert.equal(g.balloon,0);assert.equal(seen.size,50);
}
function falling(){const g=new Game(rng(1));g.start();g.score=100;g.beginFall();g.updateFall(1.8);return g;}
let g=falling();g.steer(1);for(let i=0;i<30;i++)g.update(C.step);assert(g.fallX>640);assert(g.fallVx>0);g.steer(-1);for(let i=0;i<60;i++)g.update(C.step);assert(g.fallVx<0,'reversal');g.steer(0);for(let i=0;i<30;i++)g.update(C.step);assert.equal(g.fallVx,0,'release brakes');
g.pause();let frozen=JSON.stringify(g);g.update(1);assert.equal(JSON.stringify(g),frozen);g.resume();
g=falling();const r=g.fallRows[0];g.fallDistance=r.depth-250;g.fallX=r.blocks[0].x+60;g.update(C.step);assert.equal(g.phase,'dying','visible floor kills');g.start();assert.equal(g.mode,'running');assert.equal(g.fallRows.length,0);assert.equal(g.steerInput,0);
g=falling();g.fallRows=[];g.fallSpawned=50;g.steer(-1);for(let i=0;i<400;i++)g.update(C.step);assert.equal(g.fallX,FALL.left);assert.equal(g.phase,'playing','side clamps are safe');
console.log(JSON.stringify({passed:true,seeds:120,clearedRows:rows,types:[...kinds],gapWidths:[...widths],controls:'momentum/reversal/brake/pause/restart/side bounds'}));
