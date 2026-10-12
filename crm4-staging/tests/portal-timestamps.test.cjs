'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('cloned portal renders callable timestamp shapes, epoch zero and ISO without inventing invalid dates',()=>{
 const source=fs.readFileSync(require('node:path').join(__dirname,'../local-public/client-portal.html'),'utf8');
 const fn=source.match(/function stamp\(v\) \{[\s\S]*?\n      \}/)[0];
 const stamp=vm.runInNewContext('('+fn+')');
 assert(stamp({_seconds:1700000000}).includes('2023'));
 assert.equal(stamp({_seconds:1700000000}),stamp({seconds:1700000000}));
 assert(stamp({seconds:0}).includes('1970'));
 assert(stamp('2024-01-01T00:00:00Z').includes('2024'));
 assert.equal(stamp('not-a-date'),'');
});
