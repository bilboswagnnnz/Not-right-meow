(function(){
  'use strict';
  const $=id=>document.getElementById(id),canvas=$('game'),stage=$('stage');
  const game=new NRM.Game(new URLSearchParams(location.search).has('qa')?NRM.rng(17):Math.random),renderer=new Renderer(canvas),audio=new AudioEngine();
  let character='cookie',characterChosen=false,pendingCharacterStart=null;
  try{const stored=localStorage.getItem('not-right-meow.character.v1');if(['cookie','jim'].includes(stored)){character=stored;characterChosen=true;}}catch(e){}
  let committedCharacter=character;
  renderer.character=character;
  const STORE='not-right-meow.skyline-flight.v4';let saved={},storageOK=true;
  try{saved=JSON.parse(localStorage.getItem(STORE)||localStorage.getItem('not-right-meow.skyline.v3')||'{}')||{};}catch(e){storageOK=false;}
  game.best=Number.isFinite(saved.best)?Math.max(0,Math.floor(saved.best)):0;audio.sfx=saved.sfx!==false;audio.music=saved.music!==false;
  const leaderboard=new NRMLeaderboard(
    ()=>{if(game.phase==='playing')pause();},
    {
      onIdentityChanged:()=>{game.best=0;game.newBest=false;save();syncUI();},
      onRemoteBest:best=>{
        if(Number.isSafeInteger(best)&&best>=0&&best>game.best){
          game.best=best;save();syncUI();
        }
      }
    }
  );
  const steerKeys=new Set(),steerPointers=new Map();
  function steering(){const left=steerKeys.has('ArrowLeft')||steerKeys.has('KeyA')||[...steerPointers.values()].includes(-1),right=steerKeys.has('ArrowRight')||steerKeys.has('KeyD')||[...steerPointers.values()].includes(1);game.steer(Number(right)-Number(left));$('slide-left').classList.toggle('held',left);$('slide-right').classList.toggle('held',right);}
  function clearSteering(){steerKeys.clear();steerPointers.clear();steering();}
  let last=0,accumulator=0,uiPhase='',lastScore=-1,toastUntil=0,fullscreenBusy=false;
  function save(){try{localStorage.setItem(STORE,JSON.stringify({best:game.best,sfx:audio.sfx,music:audio.music}));}catch(e){if(storageOK)toast('Best score is kept for this session only.');storageOK=false;}}
  function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');toastUntil=performance.now()+2800;}
  async function unlock(){if(!await audio.unlock())toast('Audio unavailable. The game is still ready to play.');audio.setPlaying(game.phase==='playing');}
  function start(jump=false){clearSteering();if(leaderboard.askName(()=>start(jump)))return;if(!characterChosen){openCharacters(()=>start(jump));return;}game.start();leaderboard.beginRun();renderer.particles=[];renderer.rings=[];renderer.closeCallLife=0;renderer.camera=game.surfaceY-100;accumulator=0;unlock();audio.effect('menu');if(jump)game.jump();syncUI();canvas.focus({preventScroll:true});}
  function updateCharacter(){
    renderer.character=character;canvas.setAttribute('aria-label',(character==='jim'?'Jim in a red wagon':'Cookie in a bucket')+' runner. Space or click to jump; after 50 points, tap to fly; after 100, hold left/right or A/D to slide. P to pause.');$('character-name').textContent=character.toUpperCase();
    $('character-confirm').textContent='PLAY AS '+character.toUpperCase()+' →';
    document.querySelectorAll('[data-character]').forEach(b=>{const active=b.dataset.character===character;b.setAttribute('aria-pressed',String(active));b.querySelector('.selection-mark').textContent=active?'SELECTED':'SELECT';});
  }
  function openCharacters(callback=null){pendingCharacterStart=callback;updateCharacter();$('character-dialog').showModal();}
  function closeCharacters(){pendingCharacterStart=null;character=committedCharacter;updateCharacter();$('character-dialog').close();}
  $('character-open').onclick=()=>openCharacters(()=>start());$('character-over').onclick=()=>openCharacters(()=>start());$('character-close').onclick=closeCharacters;
  $('character-dialog').addEventListener('cancel',()=>{pendingCharacterStart=null;character=committedCharacter;updateCharacter();});
  document.querySelectorAll('[data-character]').forEach(b=>b.onclick=()=>{character=b.dataset.character;updateCharacter();});
  $('character-confirm').onclick=()=>{characterChosen=true;committedCharacter=character;try{localStorage.setItem('not-right-meow.character.v1',character);}catch(e){}const callback=pendingCharacterStart;pendingCharacterStart=null;$('character-dialog').close();updateCharacter();if(callback)callback();};
  function drawCharacters(now){if(!$('character-dialog').open)return;for(const id of ['cookie','jim']){const cv=$(id+'-preview'),c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);PaperArt.ellipse(c,180,263,76,9,'#070d1a66');(id==='jim'?PaperArt.jim:PaperArt.cat)(c,{x:180,y:252,scale:1.25,time:renderer.reduced?0:now/1000,state:'idle'});}}
  updateCharacter();
  function action(){if(game.phase==='title'||game.phase==='gameover')start(true);else if(game.phase==='paused')pause();else if(game.phase==='playing')game.jump();}
  function pause(){clearSteering();if(game.phase==='playing'){game.pause();audio.setPlaying(false);$('resume').focus({preventScroll:true});}else if(game.phase==='paused'){game.resume();unlock();canvas.focus({preventScroll:true});}accumulator=0;syncUI();}
  function syncUI(){
    const phase=game.phase;if(phase!==uiPhase){uiPhase=phase;$('top-three').hidden=phase!=='title';$('scoreboard').hidden=phase==='title';$('title-screen').hidden=phase!=='title';$('pause-screen').hidden=phase!=='paused';$('over-screen').hidden=phase!=='gameover';$('pause').disabled=!['playing','paused'].includes(phase);$('pause').setAttribute('aria-label',phase==='paused'?'Resume game':'Pause game');$('pause').title=phase==='paused'?'Resume (P / Esc)':'Pause (P / Esc)';$('place-label').textContent=game.speed>670?'OVERTIME':'DUSK RUN';if(phase==='gameover'){$('final-score').textContent=game.score;$('final-best').textContent=game.best;$('over-eyebrow').textContent=game.newBest?'A NEW PERSONAL BEST!':'RUN ENDED';$('quip').textContent=game.mode==='falling'?'Hold left or right to slide. Line up before the next opening.':game.mode==='flying'?(game.hitKind==='airspace'?(game.y<game.flightBase?'The whole character left the screen. Tap earlier to recover.':'You reached the ceiling. Release to drop.'):'You hit a '+game.hitKind+' column. Keep the character inside the opening.'):game.hitKind==='gap'?'The street is a long way down. Jump from the edge.':'Catch the top. Avoid the face.';$('accessibility-status').textContent=`Run over. Score ${game.score}. Personal best ${game.best}. Press Space to restart.`;$('restart').focus({preventScroll:true});}}
    $('pace-hud').hidden=game.phase==='title';$('pace-label').textContent=NRM.PACE[game.pace];$('pace-fill').style.width=Math.min(100,game.elapsed/178*100)+'%';$('run-clock').textContent=Math.floor(game.elapsed/60)+':'+String(Math.floor(game.elapsed%60)).padStart(2,'0');
    const falling=['drop','falling','fall-exit'].includes(game.mode);$('fall-controls').hidden=!falling||game.phase!=='playing';$('stage').classList.toggle('freefall',falling);
    $('place-label').textContent=(falling?game.chapter+' · '+game.fallPassed+'/50 DROPS':game.mode==='flying'?game.chapter+' · '+game.flightPassed+'/50 AIR':game.chapter)+' · '+(renderer.weather?.label||'CLEAR DUSK')+' / '+(game.speed/NRM.C.initialSpeed).toFixed(2)+'×';
    if(lastScore!==game.score){lastScore=game.score;$('score').textContent=game.score;}$('best').textContent=Math.max(game.best,game.score);$('sound').setAttribute('aria-pressed',String(audio.sfx));$('music').setAttribute('aria-pressed',String(audio.music));$('run-tip').hidden=game.phase!=='playing'||(game.elapsed>6&&game.mode==='running');$('run-tip').textContent=falling?(game.mode==='drop'?'BALLOON POPPED · Get ready to slide':game.mode==='fall-exit'?'ESCAPE CHUTE · Rooftops ahead':'HOLD ← / → OR A / D · Release to brake'):game.mode==='flying'?'SPACE / CLICK · Tap to lift. Release to drop.':game.mode==='launch'?'BALLOON INFLATING · Get ready to tap Space':game.mode==='landing'?'LANDING AUTOMATICALLY · Rooftop jumps resume next':'SPACE · Jump near the edge. Land before jumping again.';
  }
  function events(){for(const e of game.drainEvents()){if(e.type==='closecall'&&game.phase!=='playing')continue;renderer.emit(e);audio.effect(e.type,e);if(['launch','flight','approach','return','airchapter','drop','fall'].includes(e.type)){toast(e.name);$('accessibility-status').textContent=e.name;}if(e.type==='pace')toast(e.name+' — PACE INCREASING');if(e.type==='platforms'&&game.score<7)toast('Chain your jumps. Land before jumping again.');if(e.type==='gate'&&game.score<8)toast('Hanging hazard ahead. Stay low.');if(e.type==='biome')toast(e.name);if(e.type==='return')renderer.camera=game.surfaceY-100;if(e.type==='drop')clearSteering();if(e.type==='collision'){clearSteering();audio.setPlaying(false);save();leaderboard.finishRun(game.score,game.elapsed);}if(e.type==='score'&&e.score>game.best){game.best=game.score;game.newBest=true;save();}if(e.type==='score'&&e.score%10===0)toast(`${e.score} CLEARED — KEEP GOING`);}}
  const qa=new URLSearchParams(location.search).has('qa');
  // Explicit QA URLs can accelerate fixed simulation steps; normal play always runs at 1×.
  const qaRate=qa&&new URLSearchParams(location.search).has('fast')?6:1;
  function frame(now){if(!last)last=now;let dt=Math.min((now-last)/1000,.25);last=now;accumulator+=dt*qaRate;while(accumulator>=NRM.C.step){if(qa)document.dispatchEvent(new Event('nrm-before-step'));game.update(NRM.C.step);accumulator-=NRM.C.step;}events();audio.tick();renderer.draw(game,dt);drawCharacters(now);syncUI();if(now>toastUntil)$('toast').classList.remove('visible');requestAnimationFrame(frame);}
  function toggleSound(){unlock();audio.sfx=!audio.sfx;audio.effect('menu');save();syncUI();}
  function toggleMusic(){unlock();audio.setMusic(!audio.music);save();syncUI();}
  async function fullscreen(){if(fullscreenBusy)return;fullscreenBusy=true;try{if(document.fullscreenElement)await document.exitFullscreen();else if(stage.requestFullscreen)await stage.requestFullscreen();else toast('Fullscreen is unavailable in this browser.');}catch(e){toast('Fullscreen is blocked here. Open the game in its own tab.');}finally{fullscreenBusy=false;}}
  $('start').addEventListener('click',()=>start());$('restart').addEventListener('click',()=>start());$('resume').addEventListener('click',pause);$('pause').addEventListener('click',pause);$('sound').addEventListener('click',toggleSound);$('music').addEventListener('click',toggleMusic);$('fullscreen').addEventListener('click',fullscreen);
  canvas.addEventListener('pointerdown',e=>{if(e.button===0){e.preventDefault();canvas.focus({preventScroll:true});unlock();action();}});
  document.addEventListener('keydown',e=>{if($('character-dialog').open||document.getElementById('welcome-dialog').open||document.getElementById('leaderboard-dialog').open||document.getElementById('recovery-dialog').open||e.target.closest?.('input,textarea,select,[contenteditable]'))return;if(e.ctrlKey||e.metaKey||e.altKey)return;if(['ArrowLeft','ArrowRight','KeyA','KeyD'].includes(e.code)&&['drop','falling'].includes(game.mode)){e.preventDefault();if(game.phase==='playing'){steerKeys.add(e.code);steering();}return;}if(e.code==='Space'){e.preventDefault();if(e.repeat)return;action();}else if(!e.repeat&&(e.code==='KeyP'||e.code==='Escape')){e.preventDefault();pause();}else if(!e.repeat&&e.code==='KeyM'){toggleSound();}else if(!e.repeat&&e.code==='KeyF'){e.preventDefault();fullscreen();}});
  document.addEventListener('keyup',e=>{if(steerKeys.delete(e.code)){e.preventDefault();steering();}});
  for(const [id,direction] of [['slide-left',-1],['slide-right',1]]){
    const b=$(id);b.addEventListener('pointerdown',e=>{if(game.phase!=='playing'||e.button!==0)return;e.preventDefault();b.setPointerCapture(e.pointerId);steerPointers.set(e.pointerId,direction);steering();unlock();});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,e=>{steerPointers.delete(e.pointerId);steering();});
    b.addEventListener('contextmenu',e=>e.preventDefault());
  }
  function backgroundPause(){clearSteering();if(game.phase==='playing'){game.pause();audio.setPlaying(false);accumulator=0;syncUI();}}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)backgroundPause();last=0;});window.addEventListener('blur',backgroundPause);
  window.addEventListener('resize',()=>renderer.resize());document.addEventListener('fullscreenchange',()=>{$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Enter fullscreen');requestAnimationFrame(()=>renderer.resize());});
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>renderer.resize()).observe(stage);
  if(!storageOK)toast('Storage unavailable: scores last for this session.');syncUI();requestAnimationFrame(frame);leaderboard.askName(()=>start());
  // Read-only diagnostics support the built-in QA page without gameplay cheats.
  window.NotRightMeow=Object.freeze({snapshot:()=>({character,fallX:game.fallX,fallVx:game.fallVx,fallDistance:game.fallDistance,fallPassed:game.fallPassed,fallRows:game.fallRows.map(r=>({...r,blocks:r.blocks.map(b=>({...b}))})),steerInput:game.steerInput,hitKind:game.hitKind,camera:renderer.camera,phase:game.phase,mode:game.mode,modeTime:game.modeTime,balloon:game.balloon,flightPassed:game.flightPassed,flightBase:game.flightBase,gates:game.gates.map(o=>({...o})),vy:game.vy,elapsed:game.elapsed,pace:game.pace,landingRings:renderer.rings.length,score:game.score,best:game.best,y:game.y,speed:game.speed,animation:game.animation,grounded:game.grounded,weather:renderer.weather,biome:game.biome,chapter:game.chapter,chapterId:game.chapterId,routeIndex:game.routeIndex,surfaceY:game.surfaceY,scene:renderer.scene,platforms:game.platforms.map(p=>({...p})),obstacles:game.obstacles.map(o=>({...o})),audio:{theme:audio.halloween?'halloween':'after-hours',state:audio.ctx?.state??'locked',sfx:audio.sfx,music:audio.music,voices:audio.notes.length,musicVoices:audio.notes.filter(n=>n.music).length,beat:audio.step}})});
})();

