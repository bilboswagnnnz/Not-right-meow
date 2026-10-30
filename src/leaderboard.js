/* Shared automatic best scores. The browser token identifies this installation, not a person. */
(function(){
 'use strict';
 const API='https://not-right-meow-scores.rareboot37.chatgpt.site/api/leaderboard';
 const KEY='not-right-meow.leaderboard.v1', VERSION='skyline-flight-v4';
 class Leaderboard {
  constructor(pause){
   this.welcome=document.getElementById('welcome-dialog');
   this.pause=pause;this.profile={};this.current=null;this.pending=null;this.loading=false;
   this.dialog=document.getElementById('leaderboard-dialog');
   this.message=document.getElementById('leaderboard-message');
   this.status=document.getElementById('online-status');
   try{this.profile=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{}
   if(!/^[a-f0-9]{64}$/.test(this.profile.token||''))this.profile={};
   document.getElementById('welcome-profile').onsubmit=e=>{e.preventDefault();this.saveWelcome();};
   document.getElementById('nickname').value=this.profile.nickname||'';
   document.getElementById('top-three').onclick=()=>this.open();
   this.refresh();
   setInterval(()=>{if(!document.hidden&&!document.getElementById('title-screen').hidden)this.refresh();},30000);
   document.getElementById('leaderboard-open').onclick=()=>this.open();
   document.getElementById('leaderboard-over').onclick=()=>this.open();
   document.getElementById('leaderboard-close').onclick=()=>this.dialog.close();
   document.getElementById('leaderboard-refresh').onclick=()=>this.refresh();
   document.getElementById('leaderboard-profile').onsubmit=e=>{e.preventDefault();this.saveProfile();};
   document.getElementById('score-retry').onclick=()=>this.submit(this.pending);
   this.dialog.addEventListener('close',()=>this.returnFocus?.focus({preventScroll:true}));
   this.dialog.addEventListener('click',e=>{if(e.target===this.dialog){const r=this.dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)this.dialog.close();}});
  }
  hasName(){return /^[A-Za-z0-9][A-Za-z0-9 _-]{2,17}$/.test(this.profile.nickname||'');}
  askName(onReady){
   if(this.hasName())return false;
   this.onReady=onReady;
   if(!this.welcome.open)this.welcome.showModal();
   document.getElementById('welcome-name').focus();
   return true;
  }
  saveWelcome(){
   const nickname=document.getElementById('welcome-name').value.trim().replace(/ +/g,' ');
   if(!/^[A-Za-z0-9][A-Za-z0-9 _-]{2,17}$/.test(nickname)){document.getElementById('welcome-error').textContent='Use 3–18 letters, numbers, spaces, _ or -.';return;}
   document.getElementById('nickname').value=nickname;
   this.saveProfile();
   if(!this.hasName()){document.getElementById('welcome-error').textContent=this.message.textContent;return;}
   this.welcome.close();
   const ready=this.onReady;this.onReady=null;ready?.();
  }
  async request(method='GET',body){
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
   try{
    const response=await fetch(API,{method,mode:'cors',credentials:'omit',cache:'no-store',signal:controller.signal,
     headers:{...(this.profile.token?{Authorization:'Bearer '+this.profile.token}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||'Leaderboard unavailable. Try again.');
    return data;
   }catch(e){if(e.name==='AbortError'||e instanceof TypeError)throw new Error('Could not connect. Check your connection and try again.');throw e;}
   finally{clearTimeout(timer);}
  }
  open(){this.pause();this.returnFocus=document.activeElement;this.dialog.showModal();this.refresh();}
  saveProfile(){
   const nickname=document.getElementById('nickname').value.trim().replace(/ +/g,' ');
   if(!/^[A-Za-z0-9][A-Za-z0-9 _-]{2,17}$/.test(nickname)){this.message.textContent='Use 3–18 letters, numbers, spaces, _ or -.';return;}
   let token=this.profile.token;
   if(!token){const bytes=new Uint8Array(32);crypto.getRandomValues(bytes);token=Array.from(bytes,x=>x.toString(16).padStart(2,'0')).join('');}
   const next={nickname,token};
   try{localStorage.setItem(KEY,JSON.stringify(next));this.profile=next;this.message.textContent='Saved. Your best score posts automatically.';}
   catch{this.message.textContent='Browser storage is blocked. Allow site storage to join the leaderboard.';}
  }
  async refresh(){
   if(this.loading)return;this.loading=true;
   const button=document.getElementById('leaderboard-refresh');button.disabled=true;
   this.message.textContent='Loading scores…';
   try{this.render(await this.request());this.message.textContent='Live scores · Top 100 · Highest score first';}
   catch(e){this.message.textContent=e.message;if(!this.hasScores)document.getElementById('top-three-rows').textContent='Scores unavailable · Tap to retry';}
   finally{this.loading=false;button.disabled=false;}
  }
  render(data){
   const body=document.getElementById('leaderboard-rows');body.replaceChildren();
   if(!data.entries.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=3;td.className='board-empty';td.textContent='The skyline is yours. Be the first to post a score.';tr.append(td);body.append(tr);}
   this.hasScores=true;
   const podium=document.getElementById('top-three-rows');podium.replaceChildren();
   const badge=()=>{const span=document.createElement('span');span.className='champion-badge';span.textContent='C';span.setAttribute('aria-label','World Champion');return span;};
   for(const row of data.entries){
    const champion=row.rank===1,tr=document.createElement('tr');if(data.me?.rank===row.rank)tr.classList.add('is-you');if(champion)tr.classList.add('world-champion');
    const rank=document.createElement('td');rank.textContent=String(row.rank).padStart(2,'0');if(champion)rank.append(' ',badge());
    const player=document.createElement('td');player.textContent=row.nickname+' · '+row.tag+(data.me?.rank===row.rank?' (you)':'');
    if(champion){const title=document.createElement('small');title.className='champion-title';title.textContent='WORLD CHAMPION';player.append(title);}
    const score=document.createElement('td');score.textContent=String(row.score);tr.append(rank,player,score);body.append(tr);
    if(row.rank<=3){const line=document.createElement('span');line.className='podium-row';const number=document.createElement('span');number.textContent=String(row.rank);if(champion)number.append(badge());const name=document.createElement('span');name.className='podium-name';name.textContent=row.nickname;const best=document.createElement('strong');best.textContent=row.score;line.append(number,name,best);podium.append(line);}
   }
   for(let i=data.entries.length+1;i<=3;i++){const line=document.createElement('span');line.className='podium-row vacant';line.textContent=i+'  ·  Place open';podium.append(line);}
   document.getElementById('leaderboard-me').textContent=data.me?`YOUR BEST ${data.me.best} · WORLD RANK #${data.me.rank}`:'Your first posted score earns your place.';
  }
  beginRun(){
   const job={ready:null,runId:null,error:null,score:0,elapsed:0,busy:false};this.current=job;this.pending=null;
   document.getElementById('score-retry').hidden=true;
   if(!this.hasName()||!this.profile.token){this.status.textContent='Enter your leaderboard name before playing.';return;}
   if(new URLSearchParams(location.search).has('qa')){this.status.textContent='Practice / QA runs are not submitted.';return;}
   this.status.textContent='Connecting this run to the leaderboard…';
   job.ready=this.request('POST',{action:'start',nickname:this.profile.nickname,version:VERSION}).then(d=>{job.runId=d.runId;if(this.current===job)this.status.textContent='Online run · Your score will post automatically.';}).catch(e=>{job.error=e.message;if(this.current===job)this.status.textContent='Local run only. '+e.message;});
  }
  async finishRun(score,elapsed){
   const job=this.current;if(!job?.ready)return;
   job.score=score;job.elapsed=elapsed;await job.ready;
   if(this.current!==job)return;
   if(!job.runId){this.status.textContent='Score saved on this device only. '+(job.error||'');return;}
   if(score<1){this.status.textContent='Clear a platform to post your first point.';return;}
   this.pending=job;await this.submit(job);
  }
  async submit(job){
   if(!job||job.busy)return;job.busy=true;
   const retry=document.getElementById('score-retry');retry.hidden=true;
   this.status.textContent='Posting score…';
   try{
    const data=await this.request('POST',{action:'finish',runId:job.runId,score:job.score,elapsed:job.elapsed});
    if(this.current===job){this.render(data);this.status.textContent=`Posted ${job.score} · Your best ${data.me.best} · World rank #${data.me.rank}`;this.pending=null;}
   }catch(e){if(this.current===job){this.status.textContent=e.message+' Your local best is safe.';retry.hidden=false;}}
   finally{job.busy=false;}
  }
 }
 window.NRMLeaderboard=Leaderboard;
})();
