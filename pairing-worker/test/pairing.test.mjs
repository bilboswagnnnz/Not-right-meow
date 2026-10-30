import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, createHash, webcrypto } from 'node:crypto';
import worker from '../src/index.js';

globalThis.crypto ||= webcrypto;
const origin = 'https://bilboswagnnnz.github.io';
const b64 = value => Buffer.from(value).toString('base64url');
const secret = () => b64(randomBytes(32));
const id = () => b64(randomBytes(16));
const verifier = value => createHash('sha256').update(value).digest('base64url');
const phoneKey = b64(Buffer.concat([Buffer.from([4]),randomBytes(64)]));

function fakeDB(){
 const sessions=new Map();
 return {
  sessions,
  prepare(sql){
   return {
    bind(...params){
     const cmd={
      async run(){
       if(sql.startsWith('DELETE')){for(const [k,row] of sessions)if(row.expires_at<params[0])sessions.delete(k);return {meta:{changes:0}};}
       if(sql.startsWith('INSERT')){if(sessions.has(params[0]))throw new Error('UNIQUE constraint failed');
        sessions.set(params[0],{id:params[0],verifier:params[1],state:'pending',created_at:params[2],expires_at:params[3],payload:null});
        return {meta:{changes:1}};}
       if(sql.includes("SET state = 'approved'")){
        const row=sessions.get(params[1]);if(!row||row.state!=='pending'||row.expires_at<=params[2])return {meta:{changes:0}};
        row.payload=params[0];row.state='approved';return {meta:{changes:1}};}
       if(sql.includes("SET state = 'cancelled'")){
        const row=sessions.get(params[0]);if(row&&row.verifier===params[1]){row.state='cancelled';row.payload=null;}
        return {meta:{changes:1}};}
       if(sql.includes('SET payload = NULL')){const row=sessions.get(params[0]);if(row)row.payload=null;return {meta:{changes:1}};}
       throw new Error('Unhandled run: '+sql);
      },
      async first(){
       if(sql==='SELECT 1')return {'1':1};
       if(sql.startsWith('SELECT state')){const row=sessions.get(params[0]);return row?.verifier===params[1]?{state:row.state,expires_at:row.expires_at}:null;}
       if(sql.includes("SET state = 'consumed'")){
        const row=sessions.get(params[0]);
        if(!row||row.verifier!==params[1]||row.state!=='approved'||row.expires_at<=params[2])return null;
        row.state='consumed';return {payload:row.payload};
       }
       throw new Error('Unhandled first: '+sql);
      }
     };return cmd;
    },
    async first(){if(sql==='SELECT 1')return {'1':1};throw new Error('Unexpected '+sql);}
   };
  }
 };
}
async function call(db,path,{method='GET',body,auth,requestOrigin=origin}={}){
 const headers={Origin:requestOrigin};
 if(body)headers['Content-Type']='application/json';
 if(auth)headers.Authorization='Bearer '+auth;
 const req=new Request('https://pair.example.workers.dev'+path,{method,headers,body:body?JSON.stringify(body):undefined});
 const res=await worker.fetch(req,{DB:db,ALLOWED_ORIGIN:origin});
 return {status:res.status,data:await res.json(),headers:res.headers};
}
test('encrypted payload is delivered only once to the PC claim secret',async()=>{
 const db=fakeDB(),sessionId=id(),pcSecret=secret();
 const start=await call(db,'/api/pair/start',{method:'POST',body:{id:sessionId,verifier:verifier(pcSecret)}});
 assert.equal(start.status,201);
 assert.equal(start.headers.get('Access-Control-Allow-Origin'),origin);
 const pending=await call(db,'/api/pair/status?id='+sessionId,{auth:pcSecret});
 assert.equal(pending.data.state,'pending');
 const malformed=await call(db,'/api/pair/approve',{method:'POST',body:{id:sessionId,phoneKey:'bad'}});
 assert.equal(malformed.status,400);
 const encrypted={phoneKey,iv:b64(randomBytes(12)),ciphertext:b64(randomBytes(96))};
 const approved=await call(db,'/api/pair/approve',{method:'POST',body:{id:sessionId,...encrypted}});
 assert.equal(approved.status,200);
 const unauthorized=await call(db,'/api/pair/status?id='+sessionId,{auth:secret()});
 assert.equal(unauthorized.status,404);
 const first=await call(db,'/api/pair/status?id='+sessionId,{auth:pcSecret});
 assert.equal(first.data.state,'approved');
 assert.deepEqual({phoneKey:first.data.phoneKey,iv:first.data.iv,ciphertext:first.data.ciphertext},encrypted);
 assert.equal(db.sessions.get(sessionId).payload,null);
 assert.equal((await call(db,'/api/pair/status?id='+sessionId,{auth:pcSecret})).status,410);
 assert.equal((await call(db,'/api/pair/approve',{method:'POST',body:{id:sessionId,...encrypted}})).status,410);
});
test('cancel and expiry prevent approval',async()=>{
 const db=fakeDB(),sessionId=id(),pcSecret=secret();
 await call(db,'/api/pair/start',{method:'POST',body:{id:sessionId,verifier:verifier(pcSecret)}});
 assert.equal((await call(db,'/api/pair/cancel',{method:'POST',auth:pcSecret,body:{id:sessionId}})).status,200);
 assert.equal((await call(db,'/api/pair/status?id='+sessionId,{auth:pcSecret})).status,410);
 const second=id(),other=secret();
 await call(db,'/api/pair/start',{method:'POST',body:{id:second,verifier:verifier(other)}});
 db.sessions.get(second).expires_at=0;
 assert.equal((await call(db,'/api/pair/status?id='+second,{auth:other})).status,410);
 assert.equal((await call(db,'/api/pair/approve',{method:'POST',body:{id:second,phoneKey,iv:b64(randomBytes(12)),ciphertext:b64(randomBytes(96))}})).status,410);
});
test('restricts browser origins and validates session IDs',async()=>{
 const db=fakeDB();
 assert.equal((await call(db,'/api/pair/start',{method:'POST',requestOrigin:'https://other.example',body:{id:id(),verifier:verifier(secret())}})).status,403);
 assert.equal((await call(db,'/api/pair/start',{method:'POST',body:{id:'abc',verifier:verifier(secret())}})).status,400);
 assert.equal((await call(db,'/api/pair/health')).data.ok,true);
});
