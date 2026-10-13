'use strict';
// Reviewed compatibility extension over immutable, hash-verified CRM4 source bundles.
// It changes capability predicates only; no membership/UID rewriting or alternate workflow.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),Module=require('node:module');
const cache=new Map();
function extend(source,kind){
 const once=(old,next)=>{if(source.split(old).length!==2)throw Error('CRM4 authority hook drift: '+kind);source=source.replace(old,next);};
 const prelude=`const crm4Capabilities=require('../../tools/staff-capabilities.cjs');
const crm4MemberRoles=member=>{try{return crm4Capabilities.resolveActor('membership',member).roles}catch{return []}};
const crm4MemberHas=(member,role)=>crm4MemberRoles(member).includes(role);
const crm4ActorHas=(actor,role)=>(actor.roles||[actor.role]).includes(role);
`;
 if(kind==='crm4OperationalFlow.js'){
  once('!roles.includes(member.data().role)','!roles.some(role=>crm4MemberHas(member.data(),role))');
  once('return { uid: request.auth.uid, role: member.data().role,','return { uid: request.auth.uid, roles: crm4MemberRoles(member.data()), role: member.data().role,');
  source=source.replaceAll('assigned.data().role === "closer"','crm4MemberHas(assigned.data(),"closer")').replaceAll('closerSnap.data().role !== "closer"','!crm4MemberHas(closerSnap.data(),"closer")');
  // Agenda uses the union of owned records, never the global supervisor branch.
  source=source.replace('const appointments = who.role === "lister" ?', 'const appointments = who.roles.length === 2 ? all.filter(item=>item.originatingListerUid===who.uid||item.assignedCloserUid===who.uid) : who.role === "lister" ?');
  source=source.replace('const visibleCallbacks = who.role === "lister" ?', 'const visibleCallbacks = who.roles.length === 2 ? callbacks.filter(item=>["lister-callback","closer-callback"].includes(item.type)&&item.staffUid===who.uid) : who.role === "lister" ?');
  source=source.replace('scope: who.role === "lister" ?', 'scope: who.roles.length === 2 ? "INDIVIDUAL_LISTER_AND_CLOSER" : who.role === "lister" ?');
  source=source.replaceAll('actorRole: linked.who.role,','actorRole: linked.who.role, actorRoles: linked.who.roles, actionCapability: crm4ActorHas(linked.who,"closer") ? "closer" : linked.who.role,');
  source=source.replace(/\b(linked\.who|who)\.role (===|!==) "(lister|closer)"/g,(_,actor,op,role)=>(op==='!=='?'!':'')+'crm4ActorHas('+actor+',"'+role+'")');
 }else if(kind==='crm4ManualReferral.js'){
  once('member.role !== "lister"','!crm4MemberHas(member,"lister")');
 }else if(kind==='crm4AdministrationOnboarding.js'){
  once('if (!roles.includes(actor.role) && !actor.supervisor)', 'actor.roles = crm4MemberRoles(data);\n  if (!roles.some(role=>actor.roles.includes(role)) && !actor.supervisor)');
  source=source.replaceAll('actor.role === "closer"','crm4ActorHas(actor,"closer")');
 }else throw Error('Unsupported CRM4 compatibility module');
 return '"use strict";\n'+prelude+source;
}
function loadStaffModule(name,kind){
 if(!/^[A-Za-z0-9]+$/.test(name))throw Error('Invalid callable package');
 const file=path.resolve(__dirname,'../backend-sources',name,kind),key=name+'/'+kind;
 if(cache.has(key))return cache.get(key);
 const manifest=JSON.parse(fs.readFileSync(path.join(path.dirname(file),'source-manifest.json'))),record=manifest.records.find(r=>r.target===kind),source=fs.readFileSync(file,'utf8');
 if(!record||crypto.createHash('sha256').update(source).digest('hex')!==record.cloneSha256)throw Error('Pinned CRM4 source drift');
 const mod=new Module(file,module);mod.filename=file;mod.paths=Module._nodeModulePaths(path.dirname(file));mod._compile(extend(source,kind),file);cache.set(key,mod.exports);return mod.exports;
}
module.exports={loadStaffModule,extend};
