'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{collectRunObjects}=require('../tools/cloud-storage-acceptance.cjs');
test('live fixture cleanup reconciles saved objects after failed metadata read and refuses unknown generations',()=>{
 const name='clientPortal/crm4-cloud-synthetic/shared/document.txt',report={runId:'crm4-cloud-synthetic',mutations:[{kind:'governed-synthetic-upload',resource:name}]},obj={name,generation:'1234',metadata:{crm4ActorUid:'crm4-cloud-synthetic-administrator'}},map=new Map();
 collectRunObjects(report,{items:[obj]},map);assert.equal(map.get(name),'1234');
 for(const patch of [{generation:undefined},{metadata:{crm4ActorUid:'other'}},{name:'clientPortal/foreign/shared/file.txt'},{name:'clientPortal/crm4-cloud-synthetic/shared/unknown.txt'}])assert.throws(()=>collectRunObjects(report,{items:[{...obj,...patch}]},new Map()));
 assert.throws(()=>collectRunObjects(report,{items:[obj],nextPageToken:'more'},new Map()));
});
