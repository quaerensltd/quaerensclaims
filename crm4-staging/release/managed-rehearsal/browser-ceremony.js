/* Local operator snippet. NOT a hosted asset. No automatic execution. */
async function crm4PrivateCeremony(approval) {
 const origin='https://crm4-spain-test-558324850479.europe-west1.run.app';
 if(location.origin!==origin||approval?.executionApproved!==true||approval.project!=='quaerens-crm4-spain-test'||!approval.bootstrapUid||!approval.ownerApprovalReference||!Number.isFinite(Date.parse(approval.endUtc))||Date.now()>=Date.parse(approval.endUtc))throw Error('CEREMONY_NOT_APPROVED');
 const apps=await import('/__crm4/sdk/10.8.0/app.js'),sdk=await import('/__crm4/sdk/10.8.0/auth.js');
 // Use a named secondary app so normal login membership redirects cannot
 // interfere with the temporary administrator, which has NO membership.
 const raw=await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
 const original=apps.initializeApp();if(original.options.projectId!==approval.project)throw Error('WRONG_PROJECT');
 const app=raw.initializeApp(original.options,'crm4-private-bootstrap-'+crypto.randomUUID());
 const auth=sdk.getAuth(app);await sdk.setPersistence(auth,sdk.inMemoryPersistence);
 const box=document.createElement('section'),input=document.createElement('input'),button=document.createElement('button'),status=document.createElement('p');
 input.type='password';input.autocomplete='off';input.setAttribute('aria-label','Temporary bootstrap password');button.textContent='Run approved governed owner creation';box.append(input,button,status);document.body.prepend(box);
 let token,user,closed=false;
 const close=async()=>{closed=true;input.value='';token=undefined;user=undefined;await sdk.signOut(auth);await raw.deleteApp(app);box.remove();};
 const timer=setTimeout(()=>{close().catch(()=>{});},Math.max(0,Date.parse(approval.endUtc)-Date.now()));
 button.onclick=async()=>{button.disabled=true;try{if(closed||Date.now()>=Date.parse(approval.endUtc))throw Error();const credential=await sdk.signInWithEmailAndPassword(auth,'bootstrap@crm4.example.test',input.value);input.value='';user=credential.user;const result=await user.getIdTokenResult(true);if(user.uid!==approval.bootstrapUid||result.claims.platformAdmin!==true||result.claims.aud!==approval.project||result.claims.iss!=='https://securetoken.google.com/'+approval.project)throw Error();token=await user.getIdToken();const r=await fetch('/__crm4/call/crm4AdminCreateUser',{method:'POST',redirect:'error',headers:{'Content-Type':'application/json','x-crm4-id-token':token},body:JSON.stringify({data:{email:'owner@crm4.example.test',displayName:'CRM4 Synthetic Owner',role:'administrator',workspaceId:'CRM4',active:true}})});if(!r.ok)throw Error();const body=await r.json();if(!body.result?.uid||body.result.uid===user.uid)throw Error();status.textContent='Creation completed. Operator must immediately revoke and disable bootstrap, then run Verify revocation.';}catch{input.value='';status.textContent='STOP: ceremony failed. Operator must revoke and disable bootstrap now.';}};
 const verify=document.createElement('button');verify.textContent='Verify revocation';box.append(verify);verify.onclick=async()=>{try{if(!token)throw Error();const r=await fetch('/__crm4/call/crm4AdminCreateUser',{method:'POST',redirect:'error',headers:{'Content-Type':'application/json','x-crm4-id-token':token},body:JSON.stringify({data:{email:'owner@crm4.example.test',displayName:'CRM4 Synthetic Owner',role:'administrator',workspaceId:'CRM4',active:true}})});if(r.status!==401)throw Error();let denied=false;try{await user.getIdToken(true);}catch{denied=true;}if(!denied)throw Error();status.textContent='PASS: retained token and refresh denied.';clearTimeout(timer);await close();}catch{status.textContent='STOP: revocation not verified; operator containment required.';}};
 return {close}; // No token, password or Auth object is returned.
}
if(typeof module!=='undefined')module.exports={crm4PrivateCeremony};
