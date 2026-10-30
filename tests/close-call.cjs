const assert=require('node:assert/strict');
const {Game,C,FLIGHT,FALL,rng}=require('../src/core.js');
const fresh=()=>{const g=new Game(rng(17));g.start();g.drainEvents();return g;};
const close=g=>g.drainEvents().filter(e=>e.type==='closecall');
function air(clearance,upper=false){
 const g=fresh();Object.assign(g,{mode:'flying',flightBase:0,flightStart:50,flightSpawned:50,platforms:[],y:upper?400-FLIGHT.bodyHeight-clearance:100+clearance-FLIGHT.bottomInset});
 g.gates=[{x:280,w:64,low:100,high:400,scored:false,kind:'steel'}];
 let count=0;for(let i=0;i<80&&g.phase==='playing';i++){g.vy=FLIGHT.gravity*C.step;g.update(C.step);count+=close(g).length;if(i===0)assert.equal(count,0,'Do not celebrate before clearing the gate');}
 return {g,count};
}
assert.equal(air(5).count,1,'Low close pass');
assert.equal(air(5,true).count,1,'High close pass');
assert.equal(air(30,true).count,0,'High comfortable pass');
assert.equal(air(10).count,1,'Threshold pass');
assert.equal(air(11).count,0,'Comfortable clearance');
assert.equal(air(-1).count,0,'Collision is not a near miss');
function fall(clearance,split=false){
 const g=fresh();Object.assign(g,{mode:'falling',fallSpawned:50,fallX:640,fallDistance:0,score:100});
 const left=640-FALL.halfWidth-clearance;
 g.fallRows=[{depth:310,height:split?72:30,kind:'beam',blocks:[{x:80,w:left-80,h:30},{x:850,w:350,h:30,offset:split?42:0}],scored:false}];
 let count=0;for(let i=0;i<140&&g.phase==='playing';i++){g.update(C.step);const n=close(g).length;if(n)assert.ok(g.fallRows[0].scored,'Wait for the entire row to clear');count+=n;}
 return count;
}
assert.equal(fall(5),1);assert.equal(fall(5,true),1);assert.equal(fall(30),0);assert.equal(fall(-1),0);
function roof(edge){
 const g=fresh();Object.assign(g,{grounded:false,y:200.1,vy:-100,surfaceY:200,nextSerial:51});
 // Movement this step is about 3.92 px; land with this much foot support.
 g.platforms=[{x:C.playerX+18-edge+3.917,w:200,h:200,kind:'roof',scored:false,chapter:0,serial:1}];
 g.update(C.step);return {g,n:close(g).length};
}
assert.equal(roof(5).n,1);assert.equal(roof(30).n,0);assert.equal(roof(-5).n,0);
const g=fresh();g.closeCall(5);g.closeCall(3);assert.equal(close(g).length,1,'Cooldown');
g.elapsed+=.7;g.closeCall(5);assert.equal(close(g).length,1);g.start();g.drainEvents();g.closeCall(5);assert.equal(close(g).length,1,'Reset cooldown');
g.pause();g.closeCall(1);assert.equal(close(g).length,0,'Paused');
console.log('Close-call detection: rooftop edges, air gaps, split fall rows, safe passes, collisions, cooldown and reset passed.');
