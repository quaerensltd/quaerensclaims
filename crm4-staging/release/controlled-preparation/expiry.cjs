'use strict';
const crypto=require('node:crypto');
const expected={firestore:'f5980594f7b268f25bba66cfa018c4d1f5e5398f25307d44c01e2d20e26a5b70',storage:'704066c28fda7b2868d3d5d68c4df3e386774a4e392c2ba8cb0a9a35eb6b6e61'};
function expiryRules(kind,input,startUtc,endUtc){
 const source=input.replace(/\r\n/g,'\n');
 if(crypto.createHash('sha256').update(source).digest('hex')!==expected[kind])throw Error('Rule source drift');
 const a=Date.parse(startUtc),b=Date.parse(endUtc);
 if(!Number.isFinite(a)||b-a!==604800000||new Date(a).toISOString()!==startUtc||new Date(b).toISOString()!==endUtc)throw Error('Exact 168-hour UTC window required');
 const predicate=`request.time >= timestamp.value('${startUtc}') && request.time < timestamp.value('${endUtc}')`;
 let count=0;const output=source.replace(/allow\s+([^:;]+):\s*if\s+([^;]+);/g,(_all,verbs,expression)=>{count++;return `allow ${verbs}: if (${predicate}) && (${expression.trim()});`;});
 if(count!==(kind==='firestore'?9:3))throw Error('Unexpected allow-path count '+count);
 return {kind,startUtc,endUtc,allowPaths:count,sourceSha256:expected[kind],output,sha256:crypto.createHash('sha256').update(output).digest('hex')};
}
module.exports={expiryRules};
