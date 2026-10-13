'use strict';
// Add the workspace predicate to existing CRM4 lead queries, without replacing UI/workflows.
function scopeQueries(text){
 let changed=false;
 const names='(?:currentLeadCollection|leadCollection|assignmentCollection|["\\\']crm4Leads["\\\'])';
 text=text.replace(new RegExp('query\\(collection\\(db,\\s*('+names+')\\),(?!\\s*where\\(["\\\']workspaceId)','g'),match=>{changed=true;return match+'where("workspaceId","==","CRM4"),';});
 text=text.replace(/getDocs\(collection\(db,\s*([A-Za-z_$][\w$.]*)\)\)/g,(_,name)=>{changed=true;return 'getDocs('+name+' === "crm4Leads" ? query(collection(db,'+name+'),where("workspaceId","==","CRM4")) : collection(db,'+name+'))';});
 if(changed)text=text.replace(/import\s*\{([^}]+)\}\s*from\s*(["'])(\/__crm4\/sdk\/[^"']+\/firestore\.js)\2/g,(all,bindings,quote,url)=>{
  const additions=['query','where'].filter(name=>!new RegExp('\\b'+name+'\\b').test(bindings));
  return 'import {'+bindings+(additions.length?', '+additions.join(', '):'')+'} from '+quote+url+quote;
 });
 return text;
}
module.exports={scopeQueries};
