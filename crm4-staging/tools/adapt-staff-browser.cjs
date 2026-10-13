'use strict';
const fs=require('node:fs'),path=require('node:path');
function browserCapabilities(){return fs.readFileSync(path.join(__dirname,'staff-capabilities.cjs'),'utf8').replace('module.exports={resolveActor,hasRole,assertOwnedLead,auditIdentity};','export {resolveActor,hasRole,assertOwnedLead,auditIdentity};');}
function adaptStaffBrowser(text){
 if(text.includes('export async function requireCrm2(allowedRoles)')){
  text='import {resolveActor} from "/crm4-staff-capabilities.js";\n'+text;
  text=text.replace('if (allowedRoles && !allowedRoles.includes(membership.role))','if (allowedRoles && !allowedRoles.some(role=>resolveActor(user.uid,membership).roles.includes(role)))');
 }
 if(text.includes('export async function resolveCrmWorkspace(db,user)')){
  text='import {resolveActor} from "/crm4-staff-capabilities.js";\n'+text;
  text+='\nexport function membershipHasCapability(member,role){try{return resolveActor("membership",member).roles.includes(role)}catch{return false}}\n';
  text=text.replace('const role=CRM4_ROLE_TO_CRM_ROLE[membership.role];','const capabilities=resolveActor(user.uid,membership).roles;\n    const role=CRM4_ROLE_TO_CRM_ROLE[membership.role];');
  text=text.replace('workspaceLabel:"CRM4",countryCode:', 'workspaceLabel:"CRM4 Spain",capabilities,countryCode:');
  text=text.replace('  const crm3Snap=await getDoc', '  throw new Error("Active CRM4 membership required; other workspaces are not available here");\n  const crm3Snap=await getDoc');
  text=text.replace('  if(!isCrm2(context))return;', `  if(!isCrm2(context))return;
  if(context.capabilities?.includes('lister')&&context.capabilities?.includes('closer')&&!document.querySelector('[data-staff-capabilities]')){
    const nav=document.createElement('nav');nav.dataset.staffCapabilities='';nav.setAttribute('aria-label','CRM4 staff workspaces');nav.style.cssText='display:flex;gap:1rem;padding:.75rem 1rem;background:#eef2ff';nav.innerHTML='<a href="/staff-dashboard.html">Lister workspace</a><a href="/closer-dashboard.html">Closer workspace</a>';document.querySelector('header')?.appendChild(nav);
  }`);
 }
 text=text.replace('if (userData.role !== "closer" && userData.role !== "manager"', 'if (!context.capabilities?.includes("closer") && userData.role !== "closer" && userData.role !== "manager"');
 text=text.replace('if (userData.role !== "staff" && userData.role !== "manager"', 'if (!context.capabilities?.includes("lister") && userData.role !== "staff" && userData.role !== "manager"');
 if(text.includes('user.role === "closer"')&&text.includes('resolveCrmWorkspace,')){
  text=text.replace('resolveCrmWorkspace,','resolveCrmWorkspace, membershipHasCapability,');
  text=text.replaceAll('user.role === "closer"','membershipHasCapability(user,"closer")');
 }
 if(text.includes('function membershipRoleSelect(member)')){
  text=text.replace('for (const role of CRM4_ADMIN_ROLES)', 'for (const role of [...CRM4_ADMIN_ROLES,"lister_closer"])');
  text=text.replace('option.textContent = role.charAt(0).toUpperCase() + role.slice(1);', 'option.textContent = role === "lister_closer" ? "Lister + Closer" : role.charAt(0).toUpperCase() + role.slice(1);');
  text=text.replace('option.selected = member.role === role;', 'option.selected = (member.roles?.length === 2 && member.roles.includes("lister") && member.roles.includes("closer") ? "lister_closer" : member.role) === role;');
  text=text.replace('role:roleSelect.value, active:activeSelect.value', 'role:roleSelect.value === "lister_closer" ? "lister" : roleSelect.value, ...(roleSelect.value === "lister_closer" ? {roles:["lister","closer"]} : {}), active:activeSelect.value');
 }
 if(text.includes('You do not have access to agreements.'))text=text.replace('if (!allowedRoles.includes(role))', 'if (!currentContext.capabilities?.includes("closer") && !allowedRoles.includes(role))');
 return text;
}
module.exports={browserCapabilities,adaptStaffBrowser};
