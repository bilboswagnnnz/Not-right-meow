/* Original 100 BPM electronic / seasonal 84 BPM haunted loop, synthesized locally in Web Audio.
   All voices are local; no samples, external music, downloads or dependencies. */
(function(){
'use strict';
class AudioEngine{
 constructor(){this.halloween=!!window.Halloween?.active;this.ctx=null;this.sfx=true;this.music=true;this.playing=false;this.notes=[];this.step=0;this.next=0;this.failed=false;}
 async unlock(){try{if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=.48;const comp=this.ctx.createDynamicsCompressor();this.master.connect(comp);comp.connect(this.ctx.destination);this.timer=setInterval(()=>this.tick(),25);}if(this.ctx.state==='suspended')await this.ctx.resume();return this.ctx.state==='running';}catch(e){this.failed=true;return false;}}
 track(o,g,music,extra=[]){const n={o,g,music};this.notes.push(n);o.onended=()=>{o.disconnect();g.disconnect();extra.forEach(x=>x.disconnect());const i=this.notes.indexOf(n);if(i>=0)this.notes.splice(i,1);};}
 tone(freq,duration,type='sine',volume=.12,when=null,end=null,music=false){if(!this.ctx||this.ctx.state!=='running')return;const now=when??this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain(),f=this.ctx.createBiquadFilter();o.type=type;o.frequency.setValueAtTime(freq,now);if(end)o.frequency.exponentialRampToValueAtTime(end,now+duration);f.type='lowpass';f.frequency.value=music?900:2600;g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(volume,now+.006);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(f);f.connect(g);g.connect(this.master);o.start(now);o.stop(now+duration+.02);this.track(o,g,music,[f]);}
 noise(duration=.1,volume=.08,when=null,cutoff=650,music=false){if(!this.ctx||this.ctx.state!=='running')return;const now=when??this.ctx.currentTime,b=this.ctx.createBuffer(1,Math.ceil(this.ctx.sampleRate*duration),this.ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1);const o=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();o.buffer=b;f.type=cutoff>2000?'highpass':'lowpass';f.frequency.value=cutoff;g.gain.setValueAtTime(volume,now);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(f);f.connect(g);g.connect(this.master);o.start(now);o.stop(now+duration+.02);this.track(o,g,music,[f]);}
 effect(name,event={}){if(!this.sfx)return;switch(name){case'closecall':this.noise(.12,.045,null,3400);this.tone(880,.13,'sine',.045,null,1320);break;case'drop':this.noise(.12,.12,null,1800);this.tone(480,.35,'sine',.07,null,90);break;case'fall':this.noise(.35,.035,null,900);break;case'launch':this.noise(.6,.06,null,1200);this.tone(130,.65,'sine',.09,null,430);break;case'flap':this.noise(.09,.07,null,1100);this.tone(210,.12,'sine',.07,null,300);break;case'approach':case'return':this.tone(420,.18,'triangle',.08,null,280);break;case'jump':this.tone(170,.10,'triangle',.19,null,360);this.tone(740,.045,'sine',.035,null,420);this.noise(.045,.06);break;
 case'land':{const strength=.6+(event.strength||0)*.4;this.tone(90,.085,'sine',.18*strength,null,40);
 if(event.material==='metal'){this.tone(390,.12,'sine',.06*strength,null,310);this.tone(815,.075,'sine',.025*strength);this.noise(.035,.055, null,3200);}
 else if(event.material==='wood'){this.tone(170,.065,'triangle',.09*strength,null,105);this.noise(.07,.075*strength,null,1100);}
 else this.noise(.09,.075*strength,null,500);break;}case'score':this.tone(640,.065,'sine',.10);break;case'collision':this.tone(150,.25,'sawtooth',.12,null,35);this.tone(610,.22,'sine',.055,null,190);this.noise(.19,.16);break;case'pace':this.tone(280,.10,'triangle',.07,null,420);break;case'menu':this.tone(300,.045,'triangle',.1);break;}}
 setPlaying(v){if(v===this.playing)return;this.playing=v;if(v){this.next=this.ctx?this.ctx.currentTime+.06:0;this.step=0;}else this.stopMusic();}
 stopMusic(){if(!this.ctx)return;for(const n of this.notes.filter(n=>n.music)){try{n.g.gain.cancelScheduledValues(this.ctx.currentTime);n.g.gain.setTargetAtTime(.0001,this.ctx.currentTime,.012);n.o.stop(this.ctx.currentTime+.05);}catch(e){}}}
 setMusic(v){this.music=v;if(!v)this.stopMusic();else this.next=this.ctx?this.ctx.currentTime+.05:0;}
 tick(){if(!this.playing||!this.music||!this.ctx||this.ctx.state!=='running')return;const hz=n=>440*2**((n-69)/12);if(this.next<this.ctx.currentTime-.2)this.next=this.ctx.currentTime+.03;
 while(this.next<this.ctx.currentTime+.12){const i=this.step%64,j=i%16,t=this.next,root=[33,33,29,31][Math.floor(i/16)];
  if(this.halloween){
   // D minor → Bb → G minor → A. Bells, low organ, muted heartbeat; no borrowed melody.
   const base=[38,34,31,33][Math.floor(i/16)];
   if(j===0){for(const n of [base+12,base+19,base+24+(i>=48?1:0)])this.tone(hz(n),2.4,'triangle',.025,t,null,true);this.tone(hz(base-12),1.7,'sine',.12,t,null,true);}
   if(j===0||j===3)this.tone(74,.22,'sine',j===0?.15:.08,t,35,true);
   const melody=[74,null,null,77,null,null,81,null,80,null,77,null,73,null,null,69];
   const note=melody[j];if(note!==null){const f=hz(note+(Math.floor(i/16)===2?-5:0));this.tone(f,.9,'sine',.055,t,null,true);this.tone(f*2.76,.45,'sine',.012,t,null,true);this.tone(f,.65,'sine',.013,t+.23,null,true);}
   if(j===12)this.tone(hz(base+36),.65,'sine',.018,t,hz(base+37),true);
   if(j===8)this.noise(.45,.018,t,1400,true);
  }else{
  if([0,6,10].includes(j))this.tone(120,.16,'sine',.33,t,39,true);
  if(j===8){this.noise(.12,.09,t,1800,true);this.tone(155,.10,'triangle',.07,t,null,true);}
  if(j%2===0)this.noise(.035,j%4===0?.025:.016,t,6500,true);
  if([0,3,6,10,14].includes(j))this.tone(hz(root+(j===14?7:0)),.21,'triangle',.13,t,null,true);
  if(j===0)for(const n of [root+24,root+31,root+34])this.tone(hz(n),1.1,'sine',.018,t,null,true);
  if(i===28||i===60)this.tone(hz(root+36),.36,'triangle',.022,t,null,true);
  }
  this.next+=this.halloween?60/84/4:.15;this.step++;
 }
 }
}
window.AudioEngine=AudioEngine;
})();

