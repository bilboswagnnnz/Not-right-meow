/* Test driver only; never loaded by index.html. Uses the same jump action as players. */
(function(root){
function wantsJump(g,offset=0){
 if(g.mode==='flying'){
  const o=g.gates.find(o=>!o.scored),target=o?o.low+13:g.flightBase+210;
  return g.y<target&&(g.vy<0||(target-g.y>35&&g.vy<125));
 }
 if(g.mode!=='running'||!g.grounded)return false;
 const p=g.platforms.find(p=>Math.abs(p.h-g.y)<.01&&p.x<318&&p.x+p.w>282);
 return !!p&&p.x+p.w-300<=(p.kind==='crate_stack'?18:26)+g.speed*offset;
}
function wantsSteer(g){if(g.mode!=='falling')return 0;const row=g.fallRows.find(r=>!r.scored);if(!row)return 0;const error=row.center-g.fallX-g.fallVx*.13;return Math.abs(error)<9?0:Math.sign(error);}
const api={wantsJump,wantsSteer,pilot:(g,offset=0)=>{if(wantsJump(g,offset))g.jump();if(g.mode==='falling')g.steer(wantsSteer(g));}};
root.NRMTest=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
