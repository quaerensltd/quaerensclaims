'use strict';
const assert=require('assert/strict');
// Only the approved Google user email is canonicalised; all other fields stay exact.
function verifyOwnerBinding(actual,expected){const rows=structuredClone(actual);for(const b of rows)for(let i=0;i<(b.members||[]).length;i++){const m=b.members[i];if(m.startsWith('user:')&&/^brusseljeroen@gmail\.com$/i.test(m.slice(5)))b.members[i]='user:brusseljeroen@gmail.com';}assert.deepEqual(rows,expected);}
module.exports={verifyOwnerBinding};
