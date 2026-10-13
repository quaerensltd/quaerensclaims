'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
test('CRM4 review package includes pinned assets and only isolated runtime dependencies',()=>{
 const report=require('../release/verify-source.cjs').verifySource();
 assert.equal(report.deployable,false);assert(report.files.length>100);
 assert(report.files.some(f=>f.path.endsWith('client-information-brochure-en-2026-08-13.pdf')));
 assert(report.files.some(f=>f.path==='tools/local-handlers.cjs'));
 for(const file of report.files)assert(!/(^|\/)(\.env|node_modules|public|functions|\.git)(\/|$)/.test(file.path));
 assert(!report.files.some(f=>/materialize|inventory|synthetic-fixtures/.test(f.path)));
});
