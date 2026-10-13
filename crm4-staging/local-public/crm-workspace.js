import {resolveActor} from "/crm4-staff-capabilities.js";
import { doc, getDoc } from "/__crm4/sdk/10.8.0/firestore.js";

const CRM4_ROLE_TO_CRM_ROLE=Object.freeze({lister:"staff",manager:"manager",closer:"closer",processing:"processing",administrator:"admin"});
const ROLE_ROUTES=Object.freeze({staff:"/staff-dashboard.html",manager:"/manager-dashboard.html",closer:"/closer-dashboard.html",admin:"/manager-dashboard.html",processing:"/case-action-engine.html"});
const CRM3_ROLE_ROUTES=Object.freeze({lister:"/crm3-lister.html",manager:"/crm3-manager.html",closer:"/crm3-closer.html",processing:"/crm3-processing.html",administrator:"/crm3-dashboard.html"});
const CRM4_COLLECTIONS=Object.freeze({leadAssignments:"crm4Leads",claimSubmissions:"crm4Leads",closerAssignments:"crm4Leads",assessments:"crm4Assessments",clientTimeline:"crm4Activities",agendaItems:"crm4Activities",sentEmails:"crm4Activities",agreementRecords:"crm4Activities",staffAttendance:"crm4Attendance"});
const CRM3_COLLECTIONS=Object.freeze({leadAssignments:"crm3Leads",claimSubmissions:"crm3Leads",closerAssignments:"crm3Leads",assessments:"crm3Assessments",clientTimeline:"crm3Audit",agendaItems:"crm3AgendaAppointments",sentEmails:"crm3Audit",agreementRecords:"crm3Audit",staffAttendance:"crm3Attendance"});

export async function resolveCrmWorkspace(db,user){
  if(!user)throw new Error("Authentication required");
  const crm4Snap=await getDoc(doc(db,"crm4Memberships",user.uid));
  if(crm4Snap.exists()){
    const membership=crm4Snap.data();
    if(membership.active!==true||membership.workspaceId!=="CRM4")throw new Error("CRM4 workspace access is inactive");
    const capabilities=resolveActor(user.uid,membership).roles;
    const role=CRM4_ROLE_TO_CRM_ROLE[membership.role];
    if(!role)throw new Error("Unsupported CRM4 role");
    return Object.freeze({workspaceId:"CRM4",workspaceLabel:"CRM4 Spain",capabilities,countryCode:"UK",language:"en",locale:"en-GB",currency:"GBP",currencySymbol:"£",role,membershipRole:membership.role,userData:Object.freeze({...membership,role,admin:membership.role==="administrator"}),internetLeads:false,processing:membership.role==="processing"||membership.role==="administrator",assessments:["solar","nl-solar","spray-foam"]});
  }
  throw new Error("Active CRM4 membership required; other workspaces are not available here");
  const crm3Snap=await getDoc(doc(db,"crm3Memberships",user.uid));
  if(crm3Snap.exists()){
    const membership=crm3Snap.data(),role=membership.role;
    if(membership.active!==true||membership.workspaceId!=="CRM3"||membership.country!=="NL")throw new Error("CRM3 workspace access is inactive");
    if(!CRM3_ROLE_ROUTES[role])throw new Error("Unsupported CRM3 role");
    return Object.freeze({workspaceId:"CRM3",workspaceLabel:"CRM3 Nederland",countryCode:"NL",language:"nl",locale:"nl-NL",currency:"EUR",currencySymbol:"€",role,membershipRole:role,userData:Object.freeze({...membership,role,admin:role==="administrator"}),internetLeads:false,processing:role==="processing"||role==="administrator",assessments:["nl-solar"]});
  }
  const crmSnap=await getDoc(doc(db,"users",user.uid));
  if(!crmSnap.exists())throw new Error("No CRM profile found");
  const userData=crmSnap.data(),role=userData.admin===true?"admin":userData.role;
  return Object.freeze({workspaceId:"CRM",workspaceLabel:"CRM",role,userData:Object.freeze({...userData,workspaceId:userData.workspaceId||"CRM"}),internetLeads:true,processing:true,assessments:[]});
}

export function crmRouteFor(context){return context?.workspaceId==="CRM3"?(CRM3_ROLE_ROUTES[context.role]||"/login.html"):(ROLE_ROUTES[context.role]||"/login.html")}
export function crmCollection(context,legacyName){return context.workspaceId==="CRM4"?(CRM4_COLLECTIONS[legacyName]||null):context.workspaceId==="CRM3"?(CRM3_COLLECTIONS[legacyName]||null):legacyName}
export function isCrm2(context){return context?.workspaceId==="CRM4"}
export function isCrm3(context){return context?.workspaceId==="CRM3"}
export function crmActivityType(context,legacyName){return isCrm2(context)?legacyName:null}
export function workspaceWrite(context,legacyName,data){return isCrm2(context)&&CRM4_COLLECTIONS[legacyName]==="crm4Activities"?{...data,workspaceId:"CRM4",activityType:legacyName}:data}

export function normalizeCrmRecord(context,id,data){
  if(!isCrm2(context)&&!isCrm3(context))return{id,...data};
  const name=data.clientName||[data.forename||data.firstName,data.surname||data.lastName].filter(Boolean).join(" "),assignedUid=data.assignedToUid||data.assignedUserId||data.assignedListerUid||"",assignedName=data.assignedToName||data.assignedUserName||data.assignedListerName||"";
  return{id,...data,clientName:name,forename:data.forename||data.firstName||String(name).split(/\s+/)[0]||"",surname:data.surname||data.lastName||String(name).split(/\s+/).slice(1).join(" "),claimType:data.claimType||data.route||data.issue||(isCrm3(context)?"nl-solar":"CRM4"),campaign:data.campaign||data.source||(isCrm3(context)?"crm3":"manual_crm4"),leadStatus:data.leadStatus||data.status||"new",assignedToUid:assignedUid,assignedToName:assignedName,lastUpdatedAt:data.lastUpdatedAt||data.updatedAt,sourceLeadId:data.sourceLeadId||id,closer:data.closer||{uid:assignedUid,name:assignedName},client:data.client||{firstName:String(name).split(/\s+/)[0]||"",secondName:String(name).split(/\s+/).slice(1).join(" "),mobile:data.mobile||data.telephone||"",email:data.email||""}};
}

export function applyWorkspaceChrome(context){
  document.documentElement.dataset.crmWorkspace=context.workspaceId;
  if(isCrm3(context)){
    document.documentElement.lang="nl";
    const heading=document.querySelector("header h1");
    if(heading&&!heading.parentElement.querySelector("[data-workspace-badge]")){const badge=document.createElement("span");badge.dataset.workspaceBadge="";badge.textContent="CRM3 NL";badge.style.cssText="display:inline-flex;margin-left:.65rem;padding:.25rem .55rem;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:.75rem;font-weight:800;vertical-align:middle";heading.appendChild(badge)}
    return;
  }
  if(!isCrm2(context))return;
  if(context.capabilities?.includes('lister')&&context.capabilities?.includes('closer')&&!document.querySelector('[data-staff-capabilities]')){
    const nav=document.createElement('nav');nav.dataset.staffCapabilities='';nav.setAttribute('aria-label','CRM4 staff workspaces');nav.style.cssText='display:flex;gap:1rem;padding:.75rem 1rem;background:#eef2ff';nav.innerHTML='<a href="/staff-dashboard.html">Lister workspace</a><a href="/closer-dashboard.html">Closer workspace</a>';document.querySelector('header')?.appendChild(nav);
  }
  const heading=document.querySelector("header h1");
  if(heading&&!heading.parentElement.querySelector("[data-workspace-badge]")){const badge=document.createElement("span");badge.dataset.workspaceBadge="";badge.textContent="CRM4";badge.style.cssText="display:inline-flex;margin-left:.65rem;padding:.25rem .55rem;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:.75rem;font-weight:800;vertical-align:middle";heading.appendChild(badge)}
  document.querySelectorAll('a[href*="processing"]').forEach(link=>disableWorkspaceLink(link,"Processing is disabled for CRM4 — Integration Pending."));
  document.querySelectorAll('a[href*="dialer.html"]').forEach(link=>disableWorkspaceLink(link,"Dialler is disabled for CRM4 until call transport and callback writes are workspace-isolated."));
  document.querySelectorAll('a[href*="client-intake-portal.html"]').forEach(link=>disableWorkspaceLink(link,"Automatic and public client intake is not available in CRM4. Create or upload leads through the shared CRM instead."));
  document.querySelectorAll('a[href*="client-portal-admin.html"],a[href*="client-portal.html"]').forEach(link=>disableWorkspaceLink(link,"The CRM1 client portal is not available from the CRM4 workspace."));
  document.querySelectorAll('a[href*="internet"]').forEach(link=>link.remove());
}

function disableWorkspaceLink(link,reason){link.dataset.workspaceDisabled="true";link.setAttribute("aria-disabled","true");link.setAttribute("title",reason);link.style.cssText+=";opacity:.55;cursor:not-allowed";link.addEventListener("click",event=>{event.preventDefault();showWorkspaceMessage(reason)})}
function showWorkspaceMessage(reason){let panel=document.querySelector("[data-workspace-message]");if(!panel){panel=document.createElement("div");panel.dataset.workspaceMessage="";panel.setAttribute("role","status");panel.style.cssText="position:fixed;right:1rem;bottom:1rem;z-index:99999;max-width:30rem;padding:1rem 1.25rem;border-radius:1rem;background:#0f172a;color:#fff;box-shadow:0 18px 45px rgba(15,23,42,.3);font:600 14px/1.45 Arial,sans-serif";document.body.appendChild(panel)}panel.textContent=reason;panel.hidden=false;clearTimeout(panel._hideTimer);panel._hideTimer=setTimeout(()=>{panel.hidden=true},6000)}

export function membershipHasCapability(member,role){try{return resolveActor("membership",member).roles.includes(role)}catch{return false}}
