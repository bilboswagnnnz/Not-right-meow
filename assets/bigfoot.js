/* Bigfoot's approved recliner artwork, shared by the picker and game.
   Movement and collisions remain owned by the shared game model. */
(function(){
'use strict';
const A=PaperArt,sprite=new Image();
let spritePlacement=null;
A.bigfootStatus='loading';
A.bigfootReady=new Promise(resolve=>{
 sprite.onload=()=>{
  // Measure transparent padding once; draw the entire image so no wheel is clipped.
  const w=sprite.naturalWidth,h=sprite.naturalHeight;
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;
  const cx=cv.getContext('2d',{willReadFrequently:true});cx.drawImage(sprite,0,0);
  let left=w,top=h,right=-1,bottom=-1;
  try{
   const pixels=cx.getImageData(0,0,w,h).data;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    if(pixels[(y*w+x)*4+3]===0)continue;
    left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
   }
  }catch(e){left=0;top=0;right=w-1;bottom=h-1;}
  if(right<left){left=0;top=0;right=w-1;bottom=h-1;}
  const unit=175/(bottom-top+1);
  spritePlacement={x:-(left+right+1)*.5*unit,y:-(bottom+1)*unit,w:w*unit,h:h*unit};
  A.bigfootStatus='ready';resolve(true);
 };
 sprite.onerror=()=>{A.bigfootStatus='error';resolve(false);};
});
sprite.src=new URL('./bigfoot.png',document.currentScript.src).href;
A.bigfoot=function(c,{time=0,state='idle',vy=0,land=0,impact=0,death=0,balloon=0,scale=1,x=0,y=0}={}){
 if(A.bigfootStatus!=='ready')return;
 c.save();c.translate(x,y);c.scale(scale,scale);
 const air=state==='jumping',crash=state==='collision',moving=state==='running';
 c.rotate(crash?-Math.min(.85,death*2.9):air?(vy>0?-.10:.10):Math.sin(time*(moving?11:2))*(moving?.012:.006));
 const squash=state==='landing'?Math.sin(Math.min(1,land/.17)*Math.PI)*(.07+impact*.05):0;
 c.scale(1+squash,1-squash);
 if(balloon>0){
  const knot=-196,sway=Math.sin(time*3)*3;
  A.line(c,`M-52-38Q-55-145 ${sway} ${knot}M52-38Q55-145 ${sway} ${knot}`,'#e5d5b3',2);
  c.save();c.translate(sway,knot);c.scale(balloon,balloon);
  A.ellipse(c,0,-55,43,55,'#bf685c','#162430',3);
  A.path(c,'M0-110C-22-100-22-25 0 0C22-25 22-100 0-110Z','#d48c70',null);
  A.ellipse(c,-19,-77,7,17,'#edb596');
  A.path(c,'M0 0-6 9H6Z','#c37a65','#162430',2);c.restore();
 }
 // Full source image, aligned to the lowest visible wheel pixel.
 const p=spritePlacement;c.drawImage(sprite,p.x,p.y,p.w,p.h);
 c.restore();
};
})();
