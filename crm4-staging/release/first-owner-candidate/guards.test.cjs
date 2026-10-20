"use strict";
const test=require('node:test'),assert=require('node:assert/strict');
const {provision,PROJECT,EMAIL,OPERATOR}=require('./provision.cjs');
const good={initialOwnerExceptionApproved:true,project:PROJECT,email:EMAIL,operator:OPERATOR};
for(const [name,change]of [['unapproved',{initialOwnerExceptionApproved:false}],['wrong project',{project:'crm2'}],['wrong operator',{operator:'other@example.test'}],['wrong identity',{email:'bootstrap@crm4.example.test'}]])test(name+' rejects before IO',async()=>{let touched=false;await assert.rejects(provision({approval:{...good,...change},password:'Local-only-123456789012345',guard:async()=>{touched=true;}}));assert(!touched);});
test('expired scope rejects before IO',async()=>{await assert.rejects(provision({approval:good,password:'Local-only-123456789012345',now:()=>Date.parse('2026-10-24T09:00:00Z')}));});
const {createRestDb}=require('./firestore-rest.cjs');
test('REST adapter rejects other projects and origins',()=>{assert.throws(()=>createRestDb({project:'crm2'}));assert.throws(()=>createRestDb({project:PROJECT,origin:'https://example.test'}));});
test('REST adapter denies cross-CRM collections',()=>{const db=createRestDb({project:PROJECT,request:()=>{throw Error('must not send');}});for(const name of ['crm2Memberships','crm3Memberships','crm5Memberships'])assert.throws(()=>db.collection(name));});
