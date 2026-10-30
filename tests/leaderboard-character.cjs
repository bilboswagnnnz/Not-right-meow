const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function setup(){
 const drawings=[];
 const art={
  cat:(context,opts)=>drawings.push({character:'cookie',opts}),
  jim:(context,opts)=>drawings.push({character:'jim',opts}),
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
   getContext(){return {save(){},restore(){}};}
  };
 }
 const document={
  createElement:node,
  getElementById:id=>{
   if(!elements.has(id))elements.set(id,node('div'));
   return elements.get(id);
  }
 };
 const window={PaperArt:art};
 const context={window,PaperArt:art,document,location:{search:''},URLSearchParams};
 vm.createContext(context);
 vm.runInContext(fs.readFileSync('src/leaderboard.js','utf8'),context);
 const board=Object.create(window.NRMLeaderboard.prototype);
 board.status=document.getElementById('online-status');
 board.message=document.getElementById('leaderboard-message');
 return {board,document,drawings};
}

test('sticker is the actual selected character artwork with no background',()=>{
 const {board,drawings}=setup();
 const cookie=board.characterPortrait('cookie');
 const jim=board.characterPortrait('jim');
 assert.equal(cookie.className,'leaderboard-character');
 assert.equal(jim.className,'leaderboard-character');
 assert.equal(cookie.children[0].tagName,'canvas');
 assert.equal(jim.children[0].tagName,'canvas');
 assert.deepEqual(drawings.map(d=>d.character),['cookie','jim']);
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

test('run sends locked-in character to both start and finish',async()=>{
 const {board}=setup();
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
