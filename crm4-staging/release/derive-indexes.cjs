'use strict';
const fs=require('node:fs'),path=require('node:path');
function deriveIndexes(){
 const root=path.resolve(__dirname,'..'),indexes=new Map(),evidence=[];
 function scan(file){const source=fs.readFileSync(file,'utf8'),constants=new Map([...source.matchAll(/\b(?:const|let)\s+(\w+)\s*=\s*["']([^"']+)["']/g)].map(m=>[m[1],m[2]]));
  for(const match of source.matchAll(/\.collection\(\s*(?:["']([^"']+)["']|(\w+))\s*\)((?:\s*\.(?:where|orderBy|limit)\([^;\n]*?\))*)/g)){
   const group=match[1]||constants.get(match[2]);if(!group)continue;
   const fields=new Map();for(const w of match[3].matchAll(/\.where\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']/g))fields.set(w[1],w[2].startsWith('array-contains')?{fieldPath:w[1],arrayConfig:'CONTAINS'}:{fieldPath:w[1],order:'ASCENDING'});
   for(const o of match[3].matchAll(/\.orderBy\(\s*["']([^"']+)["']\s*(?:,\s*["']([^"']+)["'])?/g))fields.set(o[1],{fieldPath:o[1],order:o[2]==='desc'?'DESCENDING':'ASCENDING'});
   if(fields.size<2)continue;const row={collectionGroup:group,queryScope:'COLLECTION',fields:[...fields.values()]};const key=JSON.stringify(row);indexes.set(key,row);evidence.push({source:path.relative(root,file).replaceAll('\\','/'),collection:group,fields:[...fields.keys()]});
  }
 }
 function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(/\.(js|cjs)$/.test(entry.name))scan(file);}}
 walk(path.join(root,'backend-sources'));walk(path.join(root,'tools'));
 const result={indexes:[...indexes.values()].sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))),fieldOverrides:[]};
 return {result,evidence,limitations:['Literal chained backend queries only; dynamic query builders and modular browser queries require cloud failed-precondition acceptance.','Firestore emulator does not certify production index sufficiency.']};
}
module.exports={deriveIndexes};
if(require.main===module){const data=deriveIndexes();fs.writeFileSync(path.join(__dirname,'firestore.indexes.json'),JSON.stringify(data.result,null,2)+'\n');fs.writeFileSync(path.join(__dirname,'query-index-evidence.json'),JSON.stringify({evidence:data.evidence,limitations:data.limitations},null,2)+'\n');console.log(data.result.indexes.length+' candidate composite indexes');}
