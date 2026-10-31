const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function setup(enableCharacterMetadata=false){
 const drawings=[];
 const art={
  cat:(context,opts)=>drawings.push({character:'cookie',opts}),
  jim:(context,opts)=>drawings.push({character:'jim',opts}),
  bigfoot:(context,opts)=>drawings.push({character:'bigfoot',opts}),
  bigfootStatus:'ready',
 };
 const elements=new Map();
 function node(tag){
  return {
   tagName:tag,
   className:'',
   children:[],
   attributes:{},
   textContent:'',
   append(...children){this.children.push(...children);},
   setAttribute(key,value){this.attributes[key]=value;},
   getContext(){return {clearRect(){},save(){},restore(){}};}
  };
 }
 const document={
  createElement:node,
  getElementById:id=>{
   if(!elements.has(id))elements.set(id,node('div'));
   return elements.get(id);
  }
 };
 const window={PaperArt:art,NRM_ENABLE_CHARACTER_METADATA:enableCharacterMetadata};
 const context={window,PaperArt:art,document,location:{search:''},URLSearchParams};
 vm.createContext(context);
 vm.runInContext(fs.readFileSync('src/leaderboard.js','utf8'),context);
 const board=Object.create(window.NRMLeaderboard.prototype);
 board.status=document.getElementById('online-status');
 board.message=document.getElementById('leaderboard-message');
 return {board,document,drawings,art};
}

test('sticker is the actual selected character artwork with no background',()=>{
 const {board,drawings}=setup();
 const cookie=board.characterPortrait('cookie');
 const jim=board.characterPortrait('jim');
 const bigfoot=board.characterPortrait('bigfoot');
 assert.equal(bigfoot.attributes['aria-label'],'Best score achieved with Bigfoot');
 assert.equal(bigfoot.children[0].tagName,'canvas');
 assert.equal(cookie.className,'leaderboard-character');
 assert.equal(jim.className,'leaderboard-character');
 assert.equal(cookie.children[0].tagName,'canvas');
 assert.equal(jim.children[0].tagName,'canvas');
 assert.deepEqual(drawings.map(d=>d.character),['cookie','jim','bigfoot']);
 assert.equal(board.characterPortrait(null),null);
 assert.equal(board.characterPortrait('other'),null);
});

test('character is read only from best-score metadata, never latest run',()=>{
 const {board}=setup();
 assert.equal(board.bestScoreCharacter({bestCharacter:'cookie',character:'jim'}),'cookie');
 assert.equal(board.bestScoreCharacter({best_character:'jim',character:'cookie'}),'jim');
 assert.equal(board.bestScoreCharacter({character:'jim'}),null);
 assert.equal(board.bestScoreCharacter({}),null);
});

test('run sends locked-in character to both start and finish when API supports it',async()=>{
 const {board}=setup(true);
 board.profile={nickname:'Valid Player',token:'a'.repeat(64)};
 board.current=null;
 const captured=[];
 board.request=async (method,body)=>{
  captured.push({method,body});
  return body.action==='start'?{runId:'r-1'}:{me:{best:12,rank:1},entries:[]};
 };
 board.render=()=>{};
 board.beginRun('jim');
 await board.current.ready;
 await board.finishRun(12,20);
 assert.deepEqual(captured.map(v=>v.body.character),['jim','jim']);
 assert.deepEqual(captured.map(v=>v.body.action),['start','finish']);
});

test('without server support score submission stays in legacy format',async()=>{
 const {board}=setup(false);
 board.profile={nickname:'Player One',token:'b'.repeat(64)};
 const captured=[];
 board.request=async (method,body)=>{
  captured.push(body);
  return body.action==='start'?{runId:'r-2'}:{me:{best:9,rank:3},entries:[]};
 };
 board.render=()=>{};
 board.beginRun('cookie');
 await board.current.ready;
 await board.finishRun(9,15);
 assert.equal(captured.length,2);
 assert.equal('character' in captured[0],false);
 assert.equal('character' in captured[1],false);
});


test('Bigfoot sticker waits for sprite loading without drawing a different character',async()=>{
 const {board,drawings,art}=setup();
 let ready;
 art.bigfootStatus='loading';art.bigfootReady=new Promise(resolve=>{ready=resolve;});
 const sticker=board.characterPortrait('bigfoot');
 assert.equal(sticker.children[0].tagName,'canvas');assert.equal(drawings.length,0);
 art.bigfootStatus='ready';ready(true);await Promise.resolve();
 assert.deepEqual(drawings.map(d=>d.character),['bigfoot']);
});
test('Bigfoot remains the recorded character from start through score submission',async()=>{
 const {board}=setup(true);
 board.profile={nickname:'Bigfoot Player',token:'c'.repeat(64)};
 const captured=[];
 board.request=async(method,body)=>{captured.push(body);return body.action==='start'?{runId:'bf-1'}:{me:{best:18,rank:1,bestCharacter:'bigfoot'},entries:[]};};
 board.render=()=>{};
 board.beginRun('bigfoot');await board.current.ready;await board.finishRun(18,25);
 assert.deepEqual(captured.map(v=>v.character),['bigfoot','bigfoot']);
 assert.equal(board.bestScoreCharacter({bestCharacter:'bigfoot',character:'cookie'}),'bigfoot');
});
