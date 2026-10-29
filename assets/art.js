/* Original paper-cutout vector artwork. Coordinates are rig-local, not sprites
   copied from a reference. Every moving part has a stable joint/pivot. */
(function(){
  'use strict';
  const ink='#202e37',paper='#b9c3ba';
  const paths={
    bucket:'M-43-76 Q-42-80-37-79 L41-79 Q46-79 44-73 L33-5 Q31 2 23 3 L-24 3 Q-33 2-34-5Z',
    head:'M-48-113 C-52-136-32-153-5-153 C22-157 46-144 49-123 C55-105 45-84 22-79 C5-74-18-78-33-86 C-46-91-53-101-48-113Z',
    cream:'M-30-112 Q-14-125 0-115 Q16-127 31-113 C47-94 24-78 1-80 C-25-79-45-96-30-112Z',
    earL:'M-42-131 Q-52-148-44-171 Q-27-171-16-145Z',
    earR:'M17-146 Q31-171 44-170 Q51-151 43-129Z',
    tree:'M-97-18 C-134-25-127-67-103-76 C-126-108-91-137-64-124 C-61-164-10-171 9-143 C37-177 78-149 77-122 C114-129 139-96 116-70 C148-46 124-12 96-13 C68 14 33 0 17-5 C-9 18-43 6-53-7 C-68 9-90 2-97-18Z',
    shrub:'M-87 0 Q-110-34-74-40 Q-78-67-48-67 Q-28-93-5-68 Q22-93 41-67 Q82-75 81-41 Q114-28 88 0Z'
  };
  const cache=new Map();function path(c,d,fill,stroke=ink,width=3,paperEdge=false){let p=cache.get(d);if(!p){p=new Path2D(d);if(cache.size>=512)cache.delete(cache.keys().next().value);cache.set(d,p);}if(paperEdge){c.strokeStyle=paper;c.lineWidth=width+5;c.stroke(p);}if(fill){c.fillStyle=fill;c.fill(p);}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke(p);}}
  function ellipse(c,x,y,rx,ry,fill,stroke=null,lw=2){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.lineWidth=lw;c.strokeStyle=stroke;c.stroke();}}
  function line(c,d,color=ink,width=2){path(c,d,null,color,width);}
  function star(c,x,y,r,color,rotation=0){c.save();c.translate(x,y);c.rotate(rotation);path(c,`M0 ${-r} L${r*.3} ${-r*.3} L${r} 0 L${r*.3} ${r*.3} L0 ${r} L${-r*.3} ${r*.3} L${-r} 0 L${-r*.3} ${-r*.3}Z`,color,null);c.restore();}
  function flower(c,x,y,s=1,color='#fff5d5'){c.save();c.translate(x,y);c.scale(s,s);for(let i=0;i<5;i++){c.save();c.rotate(i*Math.PI*2/5);ellipse(c,0,-6,3.9,5.2,color);c.restore();}ellipse(c,0,0,3.6,3.6,'#e6af42');c.restore();}
  function cat(c,{time=0,state='idle',vy=0,land=0,impact=0,death=0,balloon=0,scale=1,x=0,y=0}={}){
    c.save();c.translate(x,y);c.scale(scale,scale);c.lineJoin='round';c.lineCap='round';
    let tilt=state==='jumping'?(vy>0?-.12:.12):Math.sin(time*11)*.022;
    if(state==='idle')tilt=Math.sin(time*1.9)*.018;
    if(state==='collision')tilt=-Math.min(.88,death*2.9);
    c.rotate(tilt);let squash=state==='landing'?Math.sin(Math.min(1,land/.17)*Math.PI)*(.12+impact*.10):0;c.scale(1+squash,1-squash);
    // Balloon and harness share Cookie's transform, so ropes stay tied to the rim.
    if(balloon>0){
      const knot=-185-12*balloon,sway=Math.sin(time*3)*3;
      line(c,`M-37-62Q-32-140 ${sway} ${knot}M37-62Q32-140 ${sway} ${knot}`,'#e5d5b3',2.5);
      c.save();c.translate(sway,knot);c.scale(balloon,balloon);
      ellipse(c,0,-55,43,55,'#bf685c',ink,3.5);path(c,'M0-110C-22-100-22-25 0 0C22-25 22-100 0-110Z','#d48c70',null);
      ellipse(c,-19,-77,7,17,'#edb596');path(c,'M0 0-6 9H6Z','#c37a65',ink,2);line(c,'M-26-18Q0-5 26-18','#e5b996',2);
      c.restore();
    }
    // Handle is behind the bucket and never substitutes for legs or wheels.
    path(c,'M-41-62 C-68-54-66-20-34-15 M41-62 C68-54 66-20 34-15',null,'#617d77',5);
    path(c,'M-41-62 C-64-54-63-23-34-18 M41-62 C64-54 63-23 34-18',null,'#d6e5d3',2);
    const bob=state==='running'?Math.sin(time*11)*1.5:Math.sin(time*2.7)*1.1;
    c.save();c.translate(0,bob);
    let twitch=Math.max(0,Math.sin(time*1.31)-.96)*2.7;
    c.save();c.translate(-26,-143);c.rotate(-twitch);c.translate(26,143);path(c,paths.earL,'#292b29',ink,3,true);path(c,'M-39-139-40-161-25-145Z','#e98c79',null);c.restore();
    c.save();c.translate(29,-143);c.rotate(twitch*.7);c.translate(-29,143);path(c,paths.earR,'#292b29',ink,3,true);path(c,'M27-144 40-160 39-138Z','#e98c79',null);c.restore();
    path(c,paths.head,'#292b29',ink,3.4,true);
    // Cookie's asymmetric calico markings, matched to the supplied photo.
    path(c,'M-48-112 L-37-117 -32-109 -23-113 -17-105 -6-109 2-90 -9-79 Q-38-80-48-101Z','#f8eed9',null);
    path(c,'M16-111 28-114 31-108 43-112 49-104 Q45-85 22-80L4-84 2-104Z','#d99a4e',null);
    path(c,'M-11-144-6-148-3-139 1-146 4-137 9-141 11-128 8-120 12-109 9-97-4-98-10-109-8-123Z','#e6a459',null);
    path(c,'M-6-99Q2-91 13-97L25-85Q3-73-22-83L-18-98Z','#fff0d4',null);
    path(c,'M-30-146-27-152-25-147-22-151-21-143Z M23-146 25-153 29-149 34-150 30-142Z','#c48a4a',null);
    line(c,'M-45-111-35-108M35-103 46-107M34-97 44-100','#ae723c',2);
    const blink=(time%4.7>4.5)||(time%7.3>7.13);const air=state==='jumping';
    if(state==='collision'){
      line(c,'M-24-121-13-110M-24-110-13-121M14-121 25-110M14-110 25-121','#f5da83',3);
      ellipse(c,2,-96,6,7,'#6a493b');path(c,'M0-93Q6-96 6-89Q1-85 0-93','#e99487',null);
    }else if(blink&&!air){line(c,'M-28-116Q-19-111-10-116M11-116Q20-111 29-116','#d9bd67',3);}
    else{for(const ex of [-19,21]){ellipse(c,ex,-116,10,air?12:8.5,'#d7c36c','#171f20',1.5);ellipse(c,ex+1,-116,4.5,air?10:7.5,'#172422');ellipse(c,ex-1,-119,2,2.3,'#fff9dd');}if(!air){line(c,'M-30-125-9-121M11-121 31-125','#292b29',4);}}
    if(state!=='collision'){path(c,'M-4-104Q1-107 6-104L1-99Z','#c57565',ink,1.5);if(air)ellipse(c,1,-92,3.5,5.5,'#6c4d3d');else line(c,'M1-99V-96Q-5-89-10-96M1-96Q6-89 12-96',ink,1.7);}
    line(c,'M-37-102-58-107M-38-97-58-96M38-102 58-107M38-97 59-96','#5d6045',1.5);
    c.restore();
    path(c,paths.bucket,'#92afa6',ink,3.4,true);
    path(c,'M-36-71-26-9Q-4-2 15-7L21-70Z','#b6cbc0',null);
    path(c,'M29-72 23-5 31-6 41-73Z','#718f87',null);
    line(c,'M-31-58-25-17','#e7ede0',4);line(c,'M-22-8Q0-3 22-8','#607f76',2);
    path(c,'M-45-79Q0-86 45-79L44-70Q0-64-45-71Z','#c5d5cb',ink,3,true);
    line(c,'M-37-76Q0-81 35-76','#f1f2dc',2);
    ellipse(c,-37,-62,3,3,'#dce3d1',ink,1);ellipse(c,37,-62,3,3,'#dce3d1',ink,1);
    // Cookie's name tag stays attached through every animation.
    c.save();c.translate(3,-39);c.rotate(-.10);path(c,'M-25-13 25-13 25 13-25 13Z','#f3df99','#637a6b',1.5);c.fillStyle='#34362c';c.font='bold 13px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('Cookie',0,1);c.restore();
    // Paws overlap the rim; neither ever detaches from its anchor.
    const paw=airLift(state,vy,time);
    for(const side of[-1,1]){c.save();c.translate(side*26,-76+paw*(side===1?.8:1));c.rotate(side*.08);path(c,'M-10-5C-13-18 12-19 12-5L11 4Q0 13-10 4Z','#fff0d0',ink,2.6,true);line(c,'M-3 1V5M4 1V5','#bd9b72',1.3);c.restore();}
    c.restore();
  }
  function airLift(state,vy,t){return state==='jumping'?-3:state==='running'?Math.sin(t*11+.4)*1.7:Math.sin(t*2)*.6;}
  function tree(c,x,y,s=1,variant=0){c.save();c.translate(x,y);c.scale(s,s);c.lineJoin='round';c.lineCap='round';path(c,'M-14 0-10-105 8-111 17 0Z','#b8905c','#536548',3,true);line(c,'M-1-12 1-88M0-54-25-77M2-69 28-92','#866d49',3);c.save();c.translate(0,-122);path(c,paths.tree,variant?'#91b96b':'#739d61','#4e704a',3,true);path(c,'M-99-64Q-110-97-77-100Q-67-142-26-132Q-7-150 10-132Q-45-116-41-83Q-63-60-99-64Z',variant?'#adc67a':'#92b575',null);line(c,'M-83-30Q-53-6-31-26M33-30Q58-11 81-35','#587d4e',2);for(let i=0;i<7;i++){let xx=Math.sin(i*7+variant)*83,yy=-35-Math.abs(Math.cos(i*9))*82;path(c,`M${xx} ${yy}q7-13 15-5q-5 11-15 5`,'#c9d594',null);}c.restore();c.restore();}
  function shrub(c,x,y,s=1,color='#719750'){c.save();c.translate(x,y);c.scale(s,s);path(c,paths.shrub,color,'#557346',2,true);line(c,'M-53-30q7-10 14-3M-10-49q7-10 14-3M39-27q7-10 14-3','#b3c479',3);c.restore();}
  function obstacle(c,o,y,time=0){
    c.save();c.translate(o.x,y);c.lineJoin='round';c.lineCap='round';
    if(o.overhead){
      const bottom=o.bottom??160;
      for(const x of[o.w*.18,o.w*.82]){line(c,`M${x}-${bottom+o.h}V-420`,'#657d86',2.5);for(let k=bottom+o.h+9;k<420;k+=18)line(c,`M${x-3}-${k}h6`,'#a3b7b9',1);}
      c.fillStyle='#e8d5b8';c.font='bold 10px monospace';c.textAlign='center';c.fillText('STAY LOW',o.w/2,-bottom-o.h-12);
      c.translate(0,-bottom);c.scale(o.w/100,o.h/100);
      if(o.kind==='signal_arm'){
        path(c,'M0-94H91L100-72V-18L90-5H0Z','#c9c7ad',ink,3,true);
        for(let x=10;x<88;x+=24)path(c,`M${x}-91h12l-9 82H${x-12}Z`,'#a9594f',null);
        ellipse(c,10,-50,9,22,'#344550','#182d36',2);ellipse(c,10,-50,3,8,'#bac5bd');
      }else if(o.kind==='hanging_sign'){
        path(c,'M0-94Q0-100 7-100H93Q100-100 100-94V-6Q100 0 93 0H7Q0 0 0-6Z','#283348','#bea18b',3,true);
        line(c,'M7-84H93V-16H7Z','#d27679',2);c.fillStyle='#eaa08e';c.font='bold 28px monospace';c.textAlign='center';c.fillText('OPEN',50,-39);
      }else if(o.kind==='crane_load'){
        path(c,'M0-94H100V-3H0Z','#b89568',ink,3,true);for(let x=12;x<100;x+=19)line(c,`M${x}-90V-8`,'#7e6954',2);
        for(let x=5;x<=95;x+=30){line(c,`M${x}-94l15 90M${x+15}-94l-15 90`,'#3c565d',3);}path(c,'M-3-10H103V0H-3Z','#5c6c68',ink,2);
      }else{
        path(c,'M5-99H95V-21L86 0 73-19 60 0 47-19 34 0 21-19 9 0 5-21Z','#83918e',ink,3,true);
        path(c,'M6-88H94V-55H6Z','#d19760',null);for(let x=12;x<95;x+=24)path(c,`M${x}-88h12l-14 33H${x-14}Z`,'#3d474b',null);for(let x=17;x<90;x+=30)ellipse(c,x,-37,4,8,'#273d45');
      }
      c.restore();return;
    }
    ellipse(c,o.w/2,3,o.w*.56,7,'#071b2a66');c.scale(o.w/100,o.h/100);
    const body='#82979a',dark='#304b55',rust='#b6825e',bright='#d9b485';
    if(o.kind==='cable_spool'){
      ellipse(c,62,-50,35,47,'#997553',ink,3,true);path(c,'M25-80H66V-17H25Z',dark,ink,3);
      for(let yy=-75;yy<-20;yy+=7)line(c,`M28 ${yy}H65`,'#5e797d',3);
      ellipse(c,33,-50,31,49,'#c49c70',ink,3);ellipse(c,33,-50,23,37,'#ab8059','#775c48',2);ellipse(c,33,-50,8,13,dark,ink,2);
      for(let a=0;a<6;a++){let an=a*Math.PI/3;ellipse(c,33+Math.cos(an)*19,-50+Math.sin(an)*29,2,3,'#5a5147');}
      line(c,'M57-16q29 16 39-3','#4e676b',4);
    }else if(o.kind==='track_buffer'){
      path(c,'M0-10H100V0H0ZM12-10V-85H29V-10M71-10V-85H88V-10',body,ink,3,true);
      path(c,'M3-97H97V-52H3Z','#b46c50',ink,3,true);line(c,'M8-89H92','#e1b187',3);
      for(const x of[25,75]){ellipse(c,x,-71,16,22,dark,ink,2);ellipse(c,x,-72,10,14,'#64797d',ink,2);}
      line(c,'M29-12 71-50M71-12 29-50','#627979',5);
    }else if(o.kind==='scrap_heap'){
      path(c,'M1-3 8-41 24-46 18-78 41-98 61-57 78-72 96-32 100-3Z','#647779',ink,3,true);
      path(c,'M18-77 40-96 60-56 38-40Z',rust,ink,2);line(c,'M24-72 40-85 49-60','#e2b28a',2);
      path(c,'M8-38 35-49 56-7 13-4Z','#9baba5',ink,2);path(c,'M52-25 75-65 95-31 86-5Z','#4a6670',ink,2);
      ellipse(c,68,-20,12,13,'#263f4a','#b7ad91',3);line(c,'M14-17l21 6M75-45l11 10','#d3c2a3',2);
    }else if(o.kind==='roof_vent'){
      path(c,'M4-5H96V0H4ZM18-7V-56H79V-7Z',dark,ink,3,true);
      path(c,'M26-56V-79Q26-99 47-99H80V-74H60V-56Z',body,ink,3,true);path(c,'M73-100H91V-72H73Z','#a6b4ad',ink,2);
      line(c,'M33-59V-77Q33-90 47-90H69','#d1d5bd',3);for(let yy=-46;yy<-12;yy+=9)line(c,`M28 ${yy}H69`,'#93aaa8',2);
    }else if(o.kind==='ac_unit'){
      path(c,'M3-95H97V-5H3Z','#91a39f',ink,3,true);path(c,'M0-100H100V-89H0ZM7-6H20V0H7ZM81-6H94V0H81Z',dark,ink,2);
      for(let yy=-77;yy<-14;yy+=10)line(c,`M11 ${yy}H34`,'#415f67',3);
      ellipse(c,66,-49,27,34,dark,ink,2);c.save();c.translate(66,-49);c.rotate(time*2);for(let i=0;i<4;i++){c.rotate(Math.PI/2);path(c,'M0-4Q-15-29 2-27Q13-17 6-3Z','#708b8e','#abc0b7',1);}c.restore();ellipse(c,66,-49,5,7,'#b6c9bf');
    }else if(o.kind==='dish_base'){
      path(c,'M6-5H92V0H6ZM40-8 48-59H60L71-8Z',dark,ink,3,true);
      path(c,'M9-97Q49-19 96-67Q66-9 33-39Q12-58 9-97Z','#a9b5af',ink,3,true);line(c,'M13-93Q52-34 90-66','#d5d9c2',3);
      line(c,'M48-53 74-100','#617c82',4);ellipse(c,75,-96,5,4,'#d7a477');
    }else if(o.kind==='mooring'){
      path(c,'M5-8H95V0H5ZM29-8V-66H72V-8Z','#466776',ink,3,true);path(c,'M12-96Q50-104 89-96V-67Q48-58 12-67Z','#819da1',ink,3,true);
      line(c,'M31-49Q63-61 80-37Q84-18 62-15M28-43Q59-55 76-33Q78-24 65-22','#c8ac7a',5);line(c,'M23-88H80','#cad2ba',3);
    }else if(o.kind==='rope_reel'){
      path(c,'M4-8H96V0H4ZM13-8V-65H23V-8M77-8V-65H87V-8',rust,ink,3,true);
      ellipse(c,70,-52,28,46,dark,ink,3);path(c,'M26-88H69V-17H26Z','#bca16b',ink,2);for(let xx=30;xx<70;xx+=7)line(c,`M${xx}-85q-9 37 0 64`,'#6f7156',3);
      ellipse(c,30,-53,25,45,'#8f6e53',ink,3);ellipse(c,30,-53,16,32,'#c6ad7b','#695a49',2);ellipse(c,30,-53,5,10,dark);line(c,'M49-18q30 15 48 5','#c6ad7b',4);
    }else if(o.kind==='lobster_pots'){
      for(const [x,yy,ww,hh] of[[0,0,60,58],[55,0,45,58],[18,-56,58,43]]){path(c,`M${x} ${yy}v-${hh-10}q${ww/2}-${20} ${ww} 0V${yy}Z`,'#526b65',ink,2.5,true);for(let j=1;j<4;j++)line(c,`M${x+ww*j/4} ${yy-3}v-${hh-8}`,'#b7aa7b',1.5);for(let k=12;k<hh-6;k+=12)line(c,`M${x+3} ${yy-k}h${ww-6}`,'#b7aa7b',1.5);}
    }else if(o.kind==='flywheel'){
      c.save();c.translate(50,-50);c.rotate(time*2.8);let d='';for(let i=0;i<40;i++){const a=i*Math.PI/20,r=i%4<2?48:40;d+=(i?'L':'M')+Math.cos(a)*r+' '+Math.sin(a)*r;}path(c,d+'Z','#b6aea0',ink,3,true);ellipse(c,0,0,31,31,dark,'#d5a16f',3);for(let i=0;i<6;i++){c.rotate(Math.PI/3);line(c,'M0-7V-29','#859695',8);}ellipse(c,0,0,11,11,'#d3a175',ink,2);c.restore();
    }else if(o.kind==='pipe_bundle'){
      path(c,'M0-8H100V0H0Z',dark,ink,3);for(const [x,yy,r] of[[25,-28,24],[75,-28,24],[50,-71,27]]){ellipse(c,x,yy,r,r,'#8aa2a1',ink,3,true);ellipse(c,x,yy,r-7,r-7,'#253f49','#c6b48b',2);line(c,`M${x-r+5} ${yy-5}q1-${r-8} ${r-6}-${r-8}`,'#d0d4b9',2);}line(c,'M6-26Q13-95 50-100Q86-95 94-26','#a07856',3);
    }else if(o.kind==='hot_mold'){
      path(c,'M7-88H93V-6H7Z','#5b6261',ink,3,true);path(c,'M0-99H100V-72H0Z','#83928c',ink,3);path(c,'M13-93H87V-80H13Z','#ec9a5f','#6f4f42',2);
      for(let x=19;x<90;x+=22){line(c,`M${x}-60v37`,'#333e43',5);ellipse(c,x,-12,3,4,'#bba17f');}
      c.globalAlpha=.2+.1*Math.sin(time*3);ellipse(c,50,-86,33,8,'#ffbc69');c.globalAlpha=1;
    }
    c.restore();
  }
  window.PaperArt={path,ellipse,line,star,flower,cat,tree,shrub,obstacle,ink,paper};
})();

// Playable architecture. Every highlighted top is an actual landing surface.
PaperArt.platform=function(c,p,ground,time=0){
 const A=PaperArt,w=p.w,yy=ground-p.h,ink='#172733';c.save();c.translate(p.x,yy);c.lineJoin='round';
 const steel=['beam','crane','gantry','crate_stack'].includes(p.kind),top=steel?'#e7b56e':p.kind==='container'?'#9fcac0':'#c3b6ca';
 if(p.kind==='roof'){
  const shade=p.variant>.5?'#393446':'#344351';A.path(c,`M0 0H${w}V1000H0Z`,shade,ink,4);
  A.path(c,`M8 27H${w-8}v19H8Z`,'#242c3c',null);
  for(let y=78;y<1000;y+=86)for(let x=24;x<w-32;x+=68){A.path(c,`M${x} ${y}h30v44h-30Z`,'#182a38','#5e6170',2);if((Math.floor(x/68)+Math.floor(y/86)+Math.floor(p.variant*7))%3){c.fillStyle='#c59c7155';c.fillRect(x+3,y+3,24,38);}A.line(c,`M${x+15} ${y}v44`,'#354351',2);}
  A.line(c,`M${w-15} 50V1000`,'#66717c',4);c.fillStyle='#a2a0ac';c.font='bold 13px monospace';c.fillText('BLOCK '+String(p.serial+1).padStart(2,'0'),22,65);
 }else if(p.kind==='crate_stack'){
  // Crates alternate forward/back in depth; only the amber cap is the top.
  // Dark offset boxes occupy the rear depth plane; amber marks the front cap.
  for(let y=26;y<850;y+=84){
   const bx=w*.55,bw=w*.72;
   A.path(c,`M${bx} ${y}l18-14h${bw}v68l-18 14H${bx}Z`,'#3c4143',ink,3);
   A.path(c,`M${bx} ${y}h${bw}v68H${bx}Z`,'#635b4c',ink,2);
   A.line(c,`M${bx+6} ${y+7}l${bw-12} 54m-${bw-12} 0 ${bw-12}-54`,'#817157',4);
  }
  A.path(c,`M0 0H${w}V950H0Z`,'#403a36',ink,3);
  for(let y=0;y<850;y+=70){
   const back=(Math.floor(y/70)+p.serial)%2===0,dx=back?14:0,ww=w-dx;
   A.path(c,`M${dx} ${y+12}l14-12H${w}v58l-14 12H${dx}Z`,back?'#685747':'#9b7954',ink,3);
   A.path(c,`M${dx} ${y+12}h${ww-14}v58H${dx}Z`,back?'#85684b':'#ad865b',ink,2);
   A.line(c,`M${dx+8} ${y+20}l${ww-30} 42m-${ww-30} 0 ${ww-30}-42`,'#cfaa73',5);
   A.line(c,`M${w-14} ${y+12}l14-12M${w-14} ${y+12}v58`,'#4c4339',3);
   for(const x of[dx+5,w-20])for(const yy of[y+17,y+64])A.ellipse(c,x,yy,2,2,'#333c40');
  }
  A.path(c,`M0-3H${w}V9H0Z`,'#e6b36a',ink,2);
  c.fillStyle='#ebcf98';c.font='bold 11px monospace';c.textAlign='center';c.fillText('NARROW',w/2,39);
 }else if(p.kind==='container'){
  for(let y=0;y<900;y+=110){const color=['#436e71','#805c53','#4d6574'][(Math.floor(y/110)+p.serial)%3];A.path(c,`M0 ${y}H${w}v106H0Z`,color,ink,4);for(let x=15;x<w-10;x+=27)A.line(c,`M${x} ${y+11}v84`,'#172f3e66',4);c.fillStyle='#c7c5b5';c.font='bold 12px monospace';c.fillText('N R M  /  '+p.serial,26,y+40);}
 }else if(p.kind==='tower'){
  A.path(c,`M8 15H${w-8}V154Q${w/2} 182 8 154Z`,'#52616d',ink,4);for(let x=22;x<w;x+=25)A.line(c,`M${x} 21V151`,'#334451',2);A.line(c,`M11 48H${w-11}M11 127H${w-11}`,'#a1947b',6);
  for(const x of[25,w-25])A.line(c,`M${x} 170v800`,'#263845',12);for(let y=170;y<900;y+=150)A.line(c,`M25 ${y}l${w-50} 150m-${w-50} 0 ${w-50}-150`,'#536573',5);
  c.fillStyle='#ddd2b4';c.font='bold 20px monospace';c.textAlign='center';c.fillText('WATER',w/2,99);
 }else{
  if(p.kind==='crane'||p.kind==='gantry'){
   const mast=w*.3;
   A.path(c,`M${mast-25} 24V950h50V24Z`,'#b18c4e',ink,4);
   for(let y=35;y<900;y+=75)A.line(c,`M${mast-21} ${y}l42 75m-42 0 42-75`,'#493f35',4);
   A.path(c,`M${mast-25} 0V-356h50V0Z`,'#b18c4e',ink,4);
   for(let y=-348;y<0;y+=55)A.line(c,`M${mast-21} ${y}l42 55m-42 0 42-55`,'#4c4439',3);
   A.path(c,`M-60-356H${w+1500}v24H-60Z`,'#b89b65',ink,3);
   for(let x=-40;x<w+1500;x+=65)A.line(c,`M${x}-352l32 16 33-16`,'#504937',3);
   A.path(c,`M${mast+27}-93h88v67h-88Z`,'#d7ae69',ink,3);A.path(c,`M${mast+35}-85h68v35h-68Z`,'#577381',ink,2);A.line(c,`M${mast+69}-85v35`,'#c9be9f',3);
  }
  if(p.kind==='beam'){
   const cableTop=-(p.rigH-p.h);
   A.path(c,`M-${p.gap+10} ${cableTop-24}H${w+20}v24H-${p.gap+10}Z`,'#ac8d58',ink,3);
   for(let x=-p.gap;x<w;x+=65)A.line(c,`M${x} ${cableTop-20}l32 16 33-16`,'#554832',3);
   for(const x of[w*.2,w*.8]){A.line(c,`M${x} ${cableTop}V-30`,'#bac5bb',2.5);A.ellipse(c,x,cableTop+5,7,7,'#d5ab6a',ink,2);A.line(c,`M${x}-30l-15 27m15-27 15 27`,'#91a8aa',3);}
  }
  if(p.kind==='scaffold'||p.kind==='gantry'||p.kind==='bridge'){
   for(const x of[12,w-12])A.line(c,`M${x} 30V950`,'#45616c',9);
   for(let y=40;y<900;y+=100)A.line(c,`M14 ${y}l${w-28} 100m-${w-28} 0 ${w-28}-100`,'#344954',4);
  }
  if(p.kind==='duct'){
   A.path(c,`M5 12H${w-5}V80H5Z`,'#798b90',ink,4);for(let x=25;x<w;x+=62){A.line(c,`M${x} 16v58`,'#b9c4be',4);A.line(c,`M${x+5} 17v56`,'#485f6b',2);}A.line(c,`M32 82v800M${w-32} 82v800`,'#364b57',8);
  }
  A.path(c,`M0 0H${w}V28H0Z`,p.kind==='beam'?'#95724f':'#60737c',ink,3);
  A.line(c,`M5 15H${w-5}`,'#253a46',5);for(let x=15;x<w;x+=45)A.ellipse(c,x,15,3,3,'#b3b4a5');
  if(p.kind==='bridge'){for(let x=12;x<w;x+=38)A.line(c,`M${x} 3v6`,'#172f3c',3);}
 }
 A.path(c,`M-3-2H${w+3}V7H-3Z`,top,ink,2);A.line(c,`M1-3H${w-1}`,'#f0dfba',2);
 // A clear edge marker teaches the takeoff point without hiding the gap.
 for(let x=w-44;x<w-5;x+=12)A.line(c,`M${x} 0l-6 6`,'#3e4145',3);
 if(p.serial>0&&p.kind!=='crate_stack'){c.fillStyle='#dfd4bc';c.font='bold 11px monospace';c.textAlign='left';c.fillText(p.kind==='beam'?'SUSPENDED':p.kind.toUpperCase(),12,23);}
 c.restore();
};
