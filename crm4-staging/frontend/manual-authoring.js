import { requireCrm2, bindLogout, db, functions, roleRoutes } from '/crm4-platform.js';
import { collection, getDocs, query, orderBy } from '/__crm4/sdk/10.8.0/firestore.js';
import { httpsCallable } from '/__crm4/sdk/10.8.0/functions.js';
const {user,membership}=await requireCrm2();bindLogout();
document.querySelector('a[href="/manager-dashboard.html"]').href=roleRoutes[membership.role]||'/crm4-login.html';
const form=document.getElementById('form'),preview=document.getElementById('preview'),result=document.getElementById('result'),params=new URLSearchParams(location.search);
let assessmentId=params.get('assessmentId')||'',revision=0,state='DRAFT',busy=false;
/* ORIGINAL_PRESENTATION_HELPERS */
const bridge=data=>httpsCallable(functions,'crm4ManualAssessment')(data).then(r=>r.data);
const cases=await getDocs(query(collection(db,'crm4Leads'),orderBy('updatedAt','desc')));
for(const item of cases.docs){const option=document.createElement('option');option.value=item.id;option.textContent=`${item.data().reference||'CRM4'} — ${item.data().clientName||'Unnamed client'}`;option.dataset.client=item.data().clientName||'';document.getElementById('caseId').append(option);}
document.getElementById('caseId').value=params.get('caseId')||'';
document.getElementById('caseId').addEventListener('change',()=>{form.elements.clientName.value=form.elements.caseId.selectedOptions[0]?.dataset.client||'';updatePreview();});
form.elements.assessmentRoute.value='spray-foam';form.elements.assessmentRoute.querySelector('[value=solar]').disabled=true;
form.elements.status.disabled=true;
const controls=document.createElement('div');controls.className='full grid';
controls.innerHTML='<p id="manualIdentity" aria-live="polite"></p><p>Governed manual Spray Foam route. Solar authoring is unavailable in this preserved contract. No legacy records are migrated.</p><button type="button" class="btn" id="submitReview">Submit for review</button><fieldset id="reviewChecks"><legend>Independent approval checklist</legend>'+['identity','facts','calculations','evidence','wording'].map(k=>`<label><input type="checkbox" data-review="${k}"> ${k}</label>`).join('')+'</fieldset><button type="button" class="btn" id="approveManual">Approve reviewed version</button><button type="button" class="btn" id="generateManual">Generate governed documents</button><button type="button" class="btn" id="issueManual">Issue (local capture only)</button><button type="button" class="btn" id="correctManual">Start correction revision</button>';
result.before(controls);result.setAttribute('role','status');
document.getElementById('reviewChecks').className='checks';
function renderState(){
 form.elements.status.replaceChildren(new Option(state,state));
 document.getElementById('caseId').disabled=!!assessmentId;form.elements.assessmentRoute.disabled=!!assessmentId;
 document.getElementById('save').disabled=busy||state!=='DRAFT';
 for(const [id,allowed]of Object.entries({submitReview:assessmentId&&state==='DRAFT',approveManual:state==='UNDER REVIEW',generateManual:state==='APPROVED',issueManual:state==='APPROVED',correctManual:state==='ISSUED'}))document.getElementById(id).disabled=busy||!allowed;
}
async function refresh(){
 const {assessment:a}=await bridge({action:'get',id:assessmentId});revision=a.revision;state=a.status;populate(a.structuredIntake?.manualForm||{});
 form.elements.caseId.value=a.crmLink.caseRef;
 document.getElementById('manualIdentity').textContent=`${a.qarReference} | ${a.status} | Revision ${a.revision} | Version ${a.currentVersion}`;
 history.replaceState(null,'',`?caseId=${encodeURIComponent(a.crmLink.caseRef)}&assessmentId=${encodeURIComponent(assessmentId)}`);renderState();
}
async function run(fn){if(busy)return;busy=true;result.textContent='Working…';renderState();try{await fn();result.textContent='Saved / action completed.';}catch(e){result.textContent=e.message;}finally{busy=false;renderState();}}
form.addEventListener('submit',e=>{e.preventDefault();run(async()=>{
 const data=values();data.caseId=form.elements.caseId.value;
 const saved=await bridge({action:assessmentId?'save':'create',id:assessmentId||undefined,leadId:data.caseId,revision,category:form.elements.assessmentRoute.value,form:data});
 assessmentId=saved.id||assessmentId;await refresh();
});});
document.getElementById('submitReview').onclick=()=>run(async()=>{await bridge({action:'submit',id:assessmentId,revision});await refresh();});
document.getElementById('correctManual').onclick=()=>run(async()=>{await bridge({action:'correct',id:assessmentId,revision});await refresh();});
for(const [id,name]of Object.entries({approveManual:'frameworkBAssessmentApprove',generateManual:'frameworkBAssessmentGenerateDocuments',issueManual:'frameworkBAssessmentIssue'}))document.getElementById(id).onclick=()=>run(async()=>{
 const checklist=Object.fromEntries([...document.querySelectorAll('[data-review]')].map(e=>[e.dataset.review,e.checked]));
 await httpsCallable(functions,name)({id:assessmentId,expectedRevision:revision,checklist});await refresh();
});
document.getElementById('rtf').onclick=()=>{const text=report(values()).replace(/\\/g,'\\\\').replace(/[{}]/g,'').replace(/\n/g,'\\par\n');const url=URL.createObjectURL(new Blob(['{\\rtf1\\ansi '+text+'}'],{type:'application/rtf'}));const a=document.createElement('a');a.href=url;a.download='quaerens-crm4-draft-assessment.rtf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
document.getElementById('print').onclick=()=>window.print();
if(assessmentId){try{await refresh();}catch(e){state='UNAVAILABLE';result.textContent=e.message;}}
else{form.elements.caseId.dispatchEvent(new Event('change'));}
renderState();updatePreview();
