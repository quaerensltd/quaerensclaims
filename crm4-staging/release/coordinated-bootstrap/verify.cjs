'use strict';
// Separate OS process; no password, account creation, or inherited token cache.
const fs=require('fs'),assert=require('assert/strict'),ctx=require('./context.cjs'),w=require('../managed-rehearsal/bootstrap-watcher.cjs');
async function verify(file,hash){const a=ctx.load(file,hash),r=ctx.reader(a),receipt=w.receiptPath(a);await r.guard();const users=await r.auth.listUsers(1);assert.equal(users.users.length,0);assert(!users.pageToken);assert.equal((await r.members()).length,0);const ack=w.acknowledge(receipt,hash);return {pass:true,verifiedAt:ack.verifiedAt};}
if(require.main===module)verify(...process.argv.slice(2)).then(r=>console.log(JSON.stringify(r))).catch(()=>{console.log('{"pass":false}');process.exitCode=1;});
module.exports={verify};
