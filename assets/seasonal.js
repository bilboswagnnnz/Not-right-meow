/* Original Halloween cut-paper decorations. Cosmetic only: never touches the game model. */
(function(root){
'use strict';
const isActive=(date=new Date())=>date>=new Date(2026,9,1)&&date<new Date(2026,10,2);
const active=isActive(),A=()=>root.PaperArt;
function ghost(c,x,y,s,t,alpha=.45){
 const a=A();c.save();c.translate(x,y+Math.sin(t*1.3+x)*9);c.rotate(Math.sin(t*.8+x)*.07);c.scale(s,s);c.globalAlpha*=alpha;
 a.path(c,'M-25 25V-6C-25-43 26-43 26-6v32q-10-12-18 0-8-12-16 0-8-12-17-1Z','#cfddd4','#8c9dba',2);
 a.ellipse(c,-9,-8,4,7,'#25263b');a.ellipse(c,9,-8,4,7,'#25263b');a.ellipse(c,0,8,4,5,'#4c4565');c.restore();
}
function witch(c,x,y,s,t){
 const a=A();c.save();c.translate(x,y+Math.sin(t*.6)*8);c.scale(s,s);
 a.line(c,'M-58 26L65 8','#ae875e',5);
 a.path(c,'M-54 18l-29-1 10 12-7 15 33-15Z','#a97e50','#272336',3);
 for(let i=0;i<4;i++)a.line(c,`M-75 ${20+i*6}l22 ${4-i*2}`,'#6b5060',1.5);
 a.path(c,'M-27 15q17-19 19-32l22 4q-1 13 21 27l-14 7-11-8-6 11-12-6-17 6Z','#211e32','#6e577c',2);
 a.path(c,'M3-25q13-14 19-2l-1 7 9 5-12 4-1 9-14-8Z','#8e9b83','#272136',2);
 a.path(c,'M-13-25l14-9 4-28 12 16 1 13 17 6Z','#211e32','#8e6b84',2);
 a.line(c,'M0-35l17 2','#c88751',4);a.line(c,'M8-3l20 7 9 6M2 17l14 18 13-1','#2a223a',7);a.ellipse(c,18,-23,1.5,1.5,'#f1d094');c.restore();
}
function pumpkin(c,x,y,s){
 const a=A();c.save();c.translate(x,y);c.scale(s,s);
 a.ellipse(c,0,5,39,8,'#10152388');a.path(c,'M-4-43l2-13 9-3-2 17Z','#758367','#242638',3);
 a.ellipse(c,-15,-20,20,25,'#bd592d','#302539',3);a.ellipse(c,15,-20,20,25,'#c56731','#302539',3);a.ellipse(c,0,-20,21,27,'#e0833c','#673e38',2);
 c.save();c.shadowColor='#eab978';c.shadowBlur=12;a.path(c,'M-23-24l12-9 5 12Z M6-21l5-12 12 9Z M-21-10l9 3 5-4 6 6 8-6 6 4 9-3q-22 29-43 0Z','#f6c378',null);c.restore();c.restore();
}
function backdrop(c,d,t,title,reduced){
 if(!active)return;const a=A(),clock=reduced?0:t;c.save();
 c.fillStyle='#311b4525';c.fillRect(0,0,1280,720);
 // Keep the far-sky silhouettes muted; all solid gameplay surfaces render afterward.
 c.globalAlpha=title?.9:.55;
 witch(c,title?985:((1100-clock*22-d*.025)%1580+1580)%1580-150,title?155:190,title?.85:.63,clock);
 c.globalAlpha=1;
 ghost(c,title?735:((950-d*.13-clock*9)%1510+1510)%1510-100,title?320:335,title?1.15:.7,clock,title?.65:.3);
 ghost(c,title?1140:((1450-d*.09+clock*8)%1590+1590)%1590-100,title?390:270,title?.8:.55,clock+3,title?.5:.24);
 // A loose flock of bats in the distant upper sky.
 c.globalAlpha=title?.65:.32;
 for(let i=0;i<4;i++){const x=title?790+i*43:((i*67+670-d*.055-clock*13)%1600+1600)%1600-100,y=title?185+i%2*24:120+i%3*20,f=Math.sin(clock*5+i)*5;
 a.path(c,`M${x-17} ${y-7-f}q8 1 12 7l5-4 5 4q6-8 14-7l-8 13-9-1-2 5-3-5-8 1Z`,'#211d34',null);}
 c.restore();
}
function title(c,t,reduced){
 if(!active)return;const a=A();c.save();
 a.ellipse(c,884,580,177,23,'#17132399');pumpkin(c,1075,579,1.4);pumpkin(c,740,586,.8);
 // Web in the upper corner, away from title and controls.
 c.globalAlpha=.4;for(let i=0;i<5;i++){const q=i*Math.PI/8;a.line(c,`M1280 0L${1280-Math.cos(q)*180} ${Math.sin(q)*180}`,'#baaac7',1);}
 for(const r of [45,85,130,175]){c.beginPath();c.arc(1280,0,r,Math.PI/2,Math.PI);c.strokeStyle='#baaac7';c.lineWidth=1;c.stroke();}c.globalAlpha=1;
 const sy=224+(reduced?0:Math.sin(t*.65)*7);a.line(c,`M1183 30V${sy}`,'#aa95b180',1);a.ellipse(c,1183,sy+7,7,9,'#292136');for(let i=0;i<3;i++)a.line(c,`M1178 ${sy+i*5}l-9-5-3 8M1188 ${sy+i*5}l9-5 3 8`,'#8d738f',1.5);
 c.restore();
}
root.Halloween=Object.freeze({active,isActive,backdrop,title});
if(active&&root.document){document.documentElement.classList.add('halloween');document.title='Not Right Meow — Halloween After Hours';
 const set=(sel,text)=>{const el=document.querySelector(sel);if(el)el.textContent=text;};
 set('.edition','HALLOWEEN / AFTER HOURS');set('.header-note','Nine lives. One haunted night.');set('.title-copy .eyebrow','HALLOWEEN SPECIAL · OCTOBER 2026');
 const copy=document.querySelector('.title-copy p');if(copy)copy.innerHTML='Cookie. One bucket. A haunted skyline.<br>Keep moving. They’re right behind you.';
 set('.season-tag','AFTER HOURS / HALLOWEEN SPECIAL');
}
})(typeof globalThis!=='undefined'?globalThis:this);
