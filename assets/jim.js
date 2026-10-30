/* Original jointed Classic Jim artwork. Wings, handle and balloon are decorative.
   The shared game model exclusively owns collisions and movement. */
(function(){
'use strict';
const A=PaperArt,ink='#162430',aqua='#78d6e3',blue='#3d91c6';
const wing=new Path2D('M-31-95 C-43-120-70-123-79-102 Q-84-91-73-93 Q-71-82-63-88 Q-56-79-49-88Z');
const glitter=Array.from({length:100},(_,i)=>({x:-82+((i*37)%53),y:-120+((i*19)%40),r:i%5===0?.85:.42}));
A.jim=function(c,{time=0,state='idle',vy=0,land=0,impact=0,death=0,balloon=0,scale=1,x=0,y=0}={}){
 c.save();c.translate(x,y);c.scale(scale,scale);c.lineJoin='round';c.lineCap='round';
 const air=state==='jumping',crash=state==='collision',moving=state==='running';
 c.rotate(crash?-Math.min(.85,death*2.9):air?(vy>0?-.10:.10):Math.sin(time*(moving?11:2))*(moving?.018:.009));
 const squash=state==='landing'?Math.sin(Math.min(1,land/.17)*Math.PI)*(.10+impact*.08):0;
 c.scale(1+squash,1-squash);
 if(balloon>0){const knot=-196,sway=Math.sin(time*3)*3;A.line(c,`M-44-36Q-41-145 ${sway} ${knot}M44-36Q40-145 ${sway} ${knot}`,'#e5d5b3',2);c.save();c.translate(sway,knot);c.scale(balloon,balloon);A.ellipse(c,0,-55,43,55,'#bf685c',ink,3);A.path(c,'M0-110C-22-100-22-25 0 0C22-25 22-100 0-110Z','#d48c70',null);A.ellipse(c,-19,-77,7,17,'#edb596');A.path(c,'M0 0-6 9H6Z','#c37a65',ink,2);c.restore();}
 // Pull handle stays attached to the wagon, behind Jim.
 A.line(c,'M44-15L65-65',ink,6);A.line(c,'M44-15L65-65','#69727c',2.5);
 A.path(c,'M60-75 77-68 73-58 56-65Z','#303643',ink,3);A.line(c,'M62-69 70-66','#9ca5ad',2);
 A.ellipse(c,0,-65,52,10,'#771d2a',ink,2.5);
 c.save();c.translate(0,Math.sin(time*(moving?11:2.7))*(moving?1.4:.65));
 // One visible soft glitter wing, rooted on the back of his left silhouette.
 c.save();c.translate(-32,-96);c.rotate(Math.sin(time*(air||balloon?12:3))*(air||balloon?.15:.035));c.translate(32,96);
 c.fillStyle='#b9b5cb';c.strokeStyle=ink;c.lineWidth=2.5;c.fill(wing);c.stroke(wing);
 c.save();c.clip(wing);for(const p of glitter){c.globalAlpha=.4+.45*Math.sin(time*2+p.x)**2;A.ellipse(c,p.x,p.y,p.r,p.r,'#fff9ff');}c.globalAlpha=1;for(const [sx,sy] of[[-66,-104],[-54,-98],[-70,-95]])A.star(c,sx,sy,1.6+.45*Math.sin(time*3+sx),'#fff');c.restore();A.line(c,'M-74-104Q-63-118-43-101','#e2deeb',1);c.restore();
 A.path(c,'M-32-90Q-47-73-39-41Q0-31 39-42Q45-72 30-91Z',aqua,ink,2.7);
 // Ears and horns behind the head.
 const twitch=Math.max(0,Math.sin(time*1.4)-.97)*2;
 c.save();c.translate(-35,-133);c.rotate(-twitch);A.path(c,'M0 0Q-31-4-25-24Q-21-34 1-14Z',aqua,ink,2.5);A.path(c,'M-4-7Q-24-10-20-22Q-16-26-4-12Z',blue,null);c.restore();
 A.path(c,'M32-135Q55-164 59-145Q60-130 42-126Z',aqua,ink,2.5);A.path(c,'M39-137Q53-153 53-143Q53-136 43-132Z',blue,null);
 A.path(c,'M-29-145Q-34-174-22-168Q-16-164-16-148Z','#34373e',ink,2.5);A.path(c,'M20-149Q22-176 31-164L34-142Z','#34373e',ink,2.5);
 A.path(c,'M-6-150Q-5-158-13-164Q-23-179-10-178Q10-175 11-149Z','#49b1dc',ink,2.5);
 A.path(c,'M-44-114C-47-141-26-156 0-156C28-156 45-138 45-111Q45-81 4-78Q-38-77-44-114Z',aqua,ink,2.8);
 A.path(c,'M-39-122Q-37-146-12-150Q-30-140-30-124Z','#a1e9ed',null);
 const blink=time%4.7>4.51&&!air;
 for(const ex of[-22,23]){if(crash)A.line(c,`M${ex-6}-125l10 11m-10 0 10-11`,ink,2.5);else if(blink)A.line(c,`M${ex-7}-119q7 6 14 0`,ink,2.4);else{A.ellipse(c,ex,-121,9,air?12:10,'#101b20',ink,1.5);A.ellipse(c,ex-3,-117,2.4,2.6,'#fff');A.star(c,ex+3,-126,2.2,'#fff');A.line(c,`M${ex-6}-114q6 6 12-1`,'#b5f0ef',1);}}
 A.ellipse(c,1,-98,33,22,'#e1e2e8',ink,2.5);
 A.line(c,'M-22-105q0-5 4-6M23-105q0-5-4-6',blue,2.5);
 if(air||crash){A.ellipse(c,1,-91,crash?6:10,7,'#292034');A.ellipse(c,3,-87,5,2.7,'#ef8d9e');}else A.line(c,'M-20-95Q0-76 22-95',ink,2);
 c.restore();
 // Red wagon, broad cream name, black wheels with silver hubs.
 c.save();c.translate(0,6);c.scale(1,1.55);
 A.path(c,'M-52-44Q0-37 52-44L44-15Q0-5-43-15Z','#cb263c',ink,3);
 A.path(c,'M-46-38Q0-31 45-38L41-29Q0-21-42-28Z','#e43b49',null);
 A.path(c,'M-54-47Q0-37 54-47L53-40Q0-30-53-40Z','#f0444b',ink,2.5);
 A.line(c,'M-47-44Q0-37 46-44','#ff9791',1.5);
 c.fillStyle='#fff0ca';c.font='900 16px Arial';c.textAlign='center';c.restore();c.fillStyle='#fff0ca';c.font='900 18px Arial';c.textAlign='center';c.fillText('JIM',0,-24);
 for(const wx of[-33,34]){c.save();c.translate(wx,-9);A.ellipse(c,0,0,12,12,'#232630',ink,2.5);A.ellipse(c,0,0,8,8,'#cbd0d6','#505865',1.5);if(moving)c.rotate(time*15);else if(air)c.rotate(time*7);A.line(c,'M0-6V6M-6 0H6','#f3f3ed',1);A.ellipse(c,0,0,3.2,3.2,'#ed3346',ink,1);c.restore();}
 const bounce=moving?Math.sin(time*11+.4):air?-1.3:Math.sin(time*2)*.35;
 for(const sx of[-25,25]){c.save();c.translate(sx,-65+bounce);A.path(c,'M-11-4Q-14-16-5-17Q8-18 12-5L10 3Q0 9-10 3Z',aqua,ink,2.3);A.path(c,'M-9-2Q0-11 10-2L9 4Q0 9-9 3Z','#283345',ink,1.5);A.line(c,'M0 0V5','#526178',1);c.restore();}
 c.restore();
};
})();
