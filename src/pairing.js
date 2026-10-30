/* Optional one-time, encrypted phone-to-PC QR linking. Existing recovery codes stay available. */
(function(){
 'use strict';
 const ID_RE=/^[A-Za-z0-9_-]{22}$/;
 const PUB_RE=/^[A-Za-z0-9_-]{87}$/;
 const encoder=new TextEncoder(),decoder=new TextDecoder();
 const $=id=>document.getElementById(id);
 function encode(bytes){
  let value='';for(const n of new Uint8Array(bytes))value+=String.fromCharCode(n);
  return btoa(value).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 }
 function decode(value){
  const binary=atob(value.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-value.length%4)%4));
  return Uint8Array.from(binary,c=>c.charCodeAt(0));
 }
 function random(n){const b=new Uint8Array(n);crypto.getRandomValues(b);return encode(b);}
 function errorText(e){return e?.message||'Something went wrong. Try again.';}
 async function hash(value){return encode(await crypto.subtle.digest('SHA-256',encoder.encode(value)));}
 class NRMPairing {
  constructor(board){
   this.board=board;this.api=(window.NRM_PAIRING_API||'').replace(/\/+$/,'');
   this.pc=$('pair-pc-dialog');this.phone=$('pair-phone-dialog');
   this.pcStatus=$('pair-pc-status');this.phoneStatus=$('pair-phone-status');
   this.fromWelcome=false;this.active=null;this.timer=null;this.busy=false;this.generation=0;
   $('welcome-qr').onclick=()=>this.openPC(true);
   $('leaderboard-qr').onclick=()=>this.openPC(false);
   $('pair-pc-close').onclick=()=>this.pc.close();
   $('pair-phone-close').onclick=()=>this.phone.close();
   $('pair-phone-approve').onclick=()=>this.approveOnPhone();
   this.pc.addEventListener('close',()=>{
    this.stop();if(this.fromWelcome&&!this.board.hasName()&&!this.board.welcome.open)this.board.welcome.showModal();
    this.fromWelcome=false;
   });
   this.phone.addEventListener('close',()=>{
    if(!this.board.hasName()&&!this.board.welcome.open)this.board.welcome.showModal();
   });
  }
  async call(path,{method='GET',body,secret}={}){
   if(!this.api)throw new Error('Quick Link needs its secure pairing service configured. Recovery codes still work.');
   const controller=new AbortController(),id=setTimeout(()=>controller.abort(),9000);
   try{
    const r=await fetch(this.api+path,{method,mode:'cors',cache:'no-store',credentials:'omit',signal:controller.signal,
     headers:{...(secret?{Authorization:'Bearer '+secret}:{}),...(body?{'Content-Type':'application/json'}:{})},
     body:body?JSON.stringify(body):undefined});
    const d=await r.json();
    if(!r.ok)throw new Error(d.error||'Pairing service unavailable.');
    return d;
   }catch(e){
    if(e.name==='AbortError'||e instanceof TypeError)throw new Error('Could not reach pairing service. Try again later.');
    throw e;
   }finally{clearTimeout(id);}
  }
  async openPC(fromWelcome){
   // Stale polling/requests must never import an old approved identity.
   this.stop();this.fromWelcome=fromWelcome;
   if(this.board.welcome.open)this.board.welcome.close();
   if(this.board.dialog.open)this.board.dialog.close();
   if(!this.pc.open)this.pc.showModal();
   $('pair-qr').hidden=true;$('pair-url').value='';
   this.pcStatus.textContent='Preparing a secure, one-time link…';
   if(!this.api){this.pcStatus.textContent='QR Quick Link needs a small pairing service to be deployed first. Use the recovery code for now.';return;}
   if(!globalThis.qrcode||!crypto.subtle){this.pcStatus.textContent='This browser cannot generate a secure QR link.';return;}
   const generation=++this.generation;
   try{
    const keys=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},false,['deriveKey']);
    const id=random(16),secret=random(32),verifier=await hash(secret),pub=encode(await crypto.subtle.exportKey('raw',keys.publicKey));
    const started=await this.call('/api/pair/start',{method:'POST',body:{id,verifier}});
    if(generation!==this.generation||!this.pc.open){
     this.call('/api/pair/cancel',{method:'POST',body:{id},secret}).catch(()=>{});
     return;
    }
    const target=new URL(location.href);
    target.searchParams.delete('qa');target.searchParams.delete('fast');
    target.searchParams.set('pair',id);target.searchParams.set('key',pub);
    target.hash='';
    const qr=qrcode(0,'M');qr.addData(target.toString());qr.make();
    $('pair-qr').src=qr.createDataURL(5,4);$('pair-qr').hidden=false;
    $('pair-url').value=target.toString();
    this.active={id,secret,keys,expiresAt:started.expiresAt};
    this.pcStatus.textContent='Scan with your phone camera, then approve on your phone. Expires in 2 minutes.';
    this.timer=setInterval(()=>this.poll(generation),1800);
    this.poll(generation);
   }catch(e){if(generation===this.generation)this.pcStatus.textContent=errorText(e);}
  }
  stop(){
   this.generation++;
   if(this.timer){clearInterval(this.timer);this.timer=null;}
   const old=this.active;this.active=null;this.busy=false;
   if(old)this.call('/api/pair/cancel',{method:'POST',body:{id:old.id},secret:old.secret}).catch(()=>{});
  }
  async poll(generation){
   const link=this.active;
   if(!link||this.busy||generation!==this.generation)return;
   if(Date.now()>link.expiresAt){
    this.pcStatus.textContent='QR link expired. Close this screen and start another.';
    this.stop();return;
   }
   this.busy=true;
   try{
    const d=await this.call('/api/pair/status?id='+encodeURIComponent(link.id),{secret:link.secret});
    if(!this.active||this.active!==link||generation!==this.generation)return;
    if(d.state!=='approved')return;
    if(!PUB_RE.test(d.phoneKey||''))throw new Error('Invalid phone key.');
    const phonePublic=await crypto.subtle.importKey('raw',decode(d.phoneKey),{name:'ECDH',namedCurve:'P-256'},false,[]);
    const aes=await crypto.subtle.deriveKey({name:'ECDH',public:phonePublic},link.keys.privateKey,
      {name:'AES-GCM',length:256},false,['decrypt']);
    const plaintext=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(d.iv),additionalData:encoder.encode(link.id)},
      aes,decode(d.ciphertext));
    const profile=JSON.parse(decoder.decode(plaintext));
    if(profile.sessionId!==link.id||!/^[a-f0-9]{64}$/.test(profile.token||'')||
       !/^[A-Za-z0-9][A-Za-z0-9 _-]{2,17}$/.test(profile.nickname||''))
      throw new Error('Approval did not contain a valid player identity.');
    if(!this.board.adoptLinkedProfile({token:profile.token,nickname:profile.nickname})) {
      this.pcStatus.textContent='Link cancelled. Your current player was kept.';this.stop();return;
    }
    const fromWelcome=this.fromWelcome,ready=this.board.onReady;
    this.fromWelcome=false;this.stop();
    this.pcStatus.textContent='Linked to '+profile.nickname+'! Your leaderboard best will sync.';
    setTimeout(()=>{if(this.pc.open)this.pc.close();if(fromWelcome){this.board.onReady=null;ready?.();}},750);
   }catch(e){
    if(!this.active||generation!==this.generation)return;
    this.pcStatus.textContent=errorText(e)+ ' Close and retry if the link was already approved.';
    this.stop();
   }finally{this.busy=false;}
  }
  handleIncoming(){
   const url=new URL(location.href),id=url.searchParams.get('pair'),pub=url.searchParams.get('key');
   if(!id&&!pub)return false;
   url.searchParams.delete('pair');url.searchParams.delete('key');
   history.replaceState(null,'',url.pathname+url.search+url.hash);
   this.incoming=ID_RE.test(id||'')&&PUB_RE.test(pub||'')?{id,pub}:null;
   $('pair-phone-user').textContent=this.board.hasName()?'Share '+this.board.profile.nickname+' with your PC?':'No player account saved in this browser.';
   $('pair-phone-approve').disabled=!this.incoming||!this.board.hasName()||!this.api;
   this.phoneStatus.textContent=!this.incoming?'Invalid or incomplete QR link.':!this.api?'Quick Link is not configured yet.':!this.board.hasName()?'Open this link in the same phone browser where you play the game.':'This gives the PC access to your player identity and leaderboard score. Only approve a PC you trust.';
   this.phone.showModal();
   return true;
  }
  async approveOnPhone(){
   if(!this.incoming||!this.board.hasName()||!this.api)return;
   const {id,pub}=this.incoming,approve=$('pair-phone-approve');
   approve.disabled=true;this.phoneStatus.textContent='Encrypting your player identity for the PC…';
   try{
    const pcPublic=await crypto.subtle.importKey('raw',decode(pub),{name:'ECDH',namedCurve:'P-256'},false,[]);
    const keys=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},false,['deriveKey']);
    const aes=await crypto.subtle.deriveKey({name:'ECDH',public:pcPublic},keys.privateKey,
      {name:'AES-GCM',length:256},false,['encrypt']);
    const iv=crypto.getRandomValues(new Uint8Array(12));
    const payload=encoder.encode(JSON.stringify({sessionId:id,token:this.board.profile.token,nickname:this.board.profile.nickname}));
    const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode(id)},aes,payload);
    const phoneKey=encode(await crypto.subtle.exportKey('raw',keys.publicKey));
    await this.call('/api/pair/approve',{method:'POST',body:{id,phoneKey,iv:encode(iv),ciphertext:encode(ciphertext)}});
    this.phoneStatus.textContent='Approved! Return to the PC; it should link automatically.';
   }catch(e){
    this.phoneStatus.textContent=errorText(e);
    approve.disabled=false;
   }
  }
 }
 window.NRMPairing=NRMPairing;
})();
