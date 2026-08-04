import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const CRM2_ROLE_TO_CRM_ROLE=Object.freeze({lister:"staff",manager:"manager",closer:"closer",administrator:"admin"});
const ROLE_ROUTES=Object.freeze({staff:"/staff-dashboard.html",manager:"/manager-dashboard.html",closer:"/closer-dashboard.html",admin:"/manager-dashboard.html",processing:"/processing-dashboard.html"});
const CRM2_COLLECTIONS=Object.freeze({leadAssignments:"crm2Leads",claimSubmissions:"crm2Leads",closerAssignments:"crm2Leads",assessments:"crm2Assessments",clientTimeline:"crm2Activities",agendaItems:"crm2Activities",sentEmails:"crm2Activities",agreementRecords:"crm2Activities",staffAttendance:"crm2Attendance"});

export async function resolveCrmWorkspace(db,user){
  if(!user)throw new Error("Authentication required");
  const crm2Snap=await getDoc(doc(db,"crm2Memberships",user.uid));
  if(crm2Snap.exists()){
    const membership=crm2Snap.data();
    if(membership.active!==true||membership.workspaceId!=="CRM2")throw new Error("CRM2 workspace access is inactive");
    const role=CRM2_ROLE_TO_CRM_ROLE[membership.role];
    if(!role)throw new Error("Unsupported CRM2 role");
    return Object.freeze({workspaceId:"CRM2",workspaceLabel:"CRM2",role,membershipRole:membership.role,userData:Object.freeze({...membership,role,admin:membership.role==="administrator"}),internetLeads:false,processing:false,assessments:["solar","spray-foam"]});
  }
  const crmSnap=await getDoc(doc(db,"users",user.uid));
  if(!crmSnap.exists())throw new Error("No CRM profile found");
  const userData=crmSnap.data(),role=userData.admin===true?"admin":userData.role;
  return Object.freeze({workspaceId:"CRM",workspaceLabel:"CRM",role,userData:Object.freeze({...userData,workspaceId:userData.workspaceId||"CRM"}),internetLeads:true,processing:true,assessments:[]});
}

export function crmRouteFor(context){return ROLE_ROUTES[context.role]||"/login.html"}
export function crmCollection(context,legacyName){return context.workspaceId==="CRM2"?(CRM2_COLLECTIONS[legacyName]||null):legacyName}
export function isCrm2(context){return context?.workspaceId==="CRM2"}
export function crmActivityType(context,legacyName){return isCrm2(context)?legacyName:null}
export function workspaceWrite(context,legacyName,data){return isCrm2(context)&&CRM2_COLLECTIONS[legacyName]==="crm2Activities"?{...data,workspaceId:"CRM2",activityType:legacyName}:data}

export function normalizeCrmRecord(context,id,data){
  if(!isCrm2(context))return{id,...data};
  const name=data.clientName||[data.forename,data.surname].filter(Boolean).join(" "),assignedUid=data.assignedToUid||data.assignedUserId||"",assignedName=data.assignedToName||data.assignedUserName||"";
  return{id,...data,clientName:name,forename:data.forename||String(name).split(/\s+/)[0]||"",surname:data.surname||String(name).split(/\s+/).slice(1).join(" "),claimType:data.claimType||data.issue||"CRM2",campaign:data.campaign||"manual_crm2",leadStatus:data.leadStatus||data.status||"new",assignedToUid:assignedUid,assignedToName:assignedName,lastUpdatedAt:data.lastUpdatedAt||data.updatedAt,sourceLeadId:data.sourceLeadId||id,closer:data.closer||{uid:assignedUid,name:assignedName},client:data.client||{firstName:String(name).split(/\s+/)[0]||"",secondName:String(name).split(/\s+/).slice(1).join(" "),mobile:data.mobile||data.telephone||"",email:data.email||""}};
}

export function applyWorkspaceChrome(context){
  document.documentElement.dataset.crmWorkspace=context.workspaceId;
  if(!isCrm2(context))return;
  const heading=document.querySelector("header h1");
  if(heading&&!heading.parentElement.querySelector("[data-workspace-badge]")){const badge=document.createElement("span");badge.dataset.workspaceBadge="";badge.textContent="CRM2";badge.style.cssText="display:inline-flex;margin-left:.65rem;padding:.25rem .55rem;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:.75rem;font-weight:800;vertical-align:middle";heading.appendChild(badge)}
  document.querySelectorAll('a[href*="processing"]').forEach(link=>disableWorkspaceLink(link,"Processing is disabled for CRM2 — Integration Pending."));
  document.querySelectorAll('a[href*="dialer.html"]').forEach(link=>disableWorkspaceLink(link,"Dialler is disabled for CRM2 until call transport and callback writes are workspace-isolated."));
  document.querySelectorAll('a[href*="client-intake-portal.html"]').forEach(link=>disableWorkspaceLink(link,"Automatic and public client intake is not available in CRM2. Create or upload leads through the shared CRM instead."));
  document.querySelectorAll('a[href*="client-portal-admin.html"],a[href*="client-portal.html"]').forEach(link=>disableWorkspaceLink(link,"The CRM1 client portal is not available from the CRM2 workspace."));
  document.querySelectorAll('a[href*="internet"]').forEach(link=>link.remove());
}

function disableWorkspaceLink(link,reason){link.dataset.workspaceDisabled="true";link.setAttribute("aria-disabled","true");link.setAttribute("title",reason);link.style.cssText+=";opacity:.55;cursor:not-allowed";link.addEventListener("click",event=>{event.preventDefault();showWorkspaceMessage(reason)})}
function showWorkspaceMessage(reason){let panel=document.querySelector("[data-workspace-message]");if(!panel){panel=document.createElement("div");panel.dataset.workspaceMessage="";panel.setAttribute("role","status");panel.style.cssText="position:fixed;right:1rem;bottom:1rem;z-index:99999;max-width:30rem;padding:1rem 1.25rem;border-radius:1rem;background:#0f172a;color:#fff;box-shadow:0 18px 45px rgba(15,23,42,.3);font:600 14px/1.45 Arial,sans-serif";document.body.appendChild(panel)}panel.textContent=reason;panel.hidden=false;clearTimeout(panel._hideTimer);panel._hideTimer=setTimeout(()=>{panel.hidden=true},6000)}
