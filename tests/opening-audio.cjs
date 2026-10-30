const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function setup({reject=false,missing=false}={}){
 const timeouts=new Map();let sequence=0;
 const gain=()=>({value:1,cancelScheduledValues(){},setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;},setTargetAtTime(v){this.value=v;}});
 const node=()=>({gain:gain(),connect(){},disconnect(){}});
 class Context{constructor(){this.state='running';this.currentTime=0;this.destination={};}createGain(){return node();}createDynamicsCompressor(){return node();}createMediaElementSource(){return node();}resume(){this.state='running';return Promise.resolve();}}
 class Media{constructor(){if(missing)throw Error('no media');this.paused=true;this.currentTime=0;this.duration=230;this.listeners={};}addEventListener(name,fn){this.listeners[name]=fn;}play(){if(reject)return Promise.reject(Object.assign(Error('blocked'),{name:'NotAllowedError'}));this.paused=false;this.listeners.playing?.();return Promise.resolve();}pause(){this.paused=true;}}
 const context={window:{AudioContext:Context},Audio:Media,Promise,setInterval(){},setTimeout(fn){timeouts.set(++sequence,fn);return sequence;},clearTimeout(id){timeouts.delete(id);}};
 vm.createContext(context);vm.runInContext(fs.readFileSync('src/audio.js','utf8'),context);
 const engine=new context.window.AudioEngine();engine.tone=()=>{};engine.noise=()=>{};
 return {engine,timeouts};
}
test('opening excludes original music, preserves position on pause/mute/retry, then transitions once',async()=>{
 const {engine:e}=setup();e.setPlaying(true);await e.unlock();e.tick();
 assert.equal(e.intro.paused,false);assert.equal(e.step,0);
 e.intro.currentTime=42;e.setPlaying(false);assert.equal(e.intro.paused,true);
 e.setPlaying(true);await e.unlock();assert.equal(e.intro.currentTime,42);
 e.setMusic(false);assert.equal(e.intro.paused,true);e.setMusic(true);await Promise.resolve();assert.equal(e.intro.currentTime,42);
 e.intro.listeners.ended();e.tick();assert.equal(e.introDone,true);assert.ok(e.step>0);
 e.setPlaying(false);e.setPlaying(true);assert.equal(e.intro.paused,true);
});
test('file error and stalled loading fall back to original music',async()=>{
 for(const mode of ['error','waiting']){const {engine:e,timeouts}=setup();e.setPlaying(true);await e.unlock();e.intro.listeners[mode]();if(mode==='waiting'){assert.equal(timeouts.size,1);[...timeouts.values()][0]();}e.tick();assert.equal(e.introDone,true);assert.ok(e.step>0);}
});
test('unsupported or blocked media cannot break original audio',async()=>{
 for(const option of [{reject:true},{missing:true}]){const {engine:e}=setup(option);e.setPlaying(true);await e.unlock();await Promise.resolve();e.tick();assert.equal(e.introDone,true);assert.ok(e.step>0);}
});
test('muted startup waits for music control and pause cancels timeout',async()=>{
 const {engine:e,timeouts}=setup();e.music=false;e.setPlaying(true);await e.unlock();assert.equal(e.intro.paused,true);assert.equal(e.introDone,false);
 e.setMusic(true);await Promise.resolve();assert.equal(e.intro.paused,false);e.intro.listeners.waiting();e.setPlaying(false);assert.equal(timeouts.size,0);
});
