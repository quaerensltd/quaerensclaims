'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{select}=require('../tools/select-admin-source.cjs');
test('Admin selection retains exact lexical contract without executing unrelated entrypoint',()=>{
  const text='throw Error("production init"); const ROLES=new Set(["manager"]); function check(r){if(!ROLES.has(r.data.role))throw new HttpsError("denied");} exports.crm2AdminUpdateMembership=onCall(r=>{check(r);return db;}); exports.unrelated=onCall(()=>fetch("https://production"));';
  const chosen=select(text,'crm2AdminUpdateMembership');
  assert(chosen.includes('const ROLES'));assert(chosen.includes('function check'));assert(!chosen.includes('production'));assert(!chosen.includes('unrelated'));
  assert.throws(()=>select(text,'unrelated'),/Unreviewed/);
  assert.throws(()=>select('exports.crm2AdminCreateUser=onCall(()=>unknownDependency());','crm2AdminCreateUser'),/Unresolved/);
});
