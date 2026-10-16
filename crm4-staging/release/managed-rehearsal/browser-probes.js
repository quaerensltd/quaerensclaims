/* Execute only in the approved same-origin private browser, after separate
 * rehearsal approval. No secret input via arguments: password uses form. */
async function crm4PrepareExpiryProbes(a) {
 const binding=await crm4VerifyFixtureBinding(a);
 const origin='https://crm4-spain-test-558324850479.europe-west1.run.app';
 if(location.origin!==origin||a?.executionApproved!==true||a.project!=='quaerens-crm4-spain-test'||!Number.isFinite(Date.parse(a.endUtc))||Date.now()>=Date.parse(a.endUtc)||a.canaryId!==binding.leadId||!a.objectPath?.startsWith('clientPortal/'+binding.caseId+'/'))throw Error('PROBES_NOT_APPROVED');
 const sdk=await import('/__crm4/sdk/10.8.0/auth.js'),as=await import('/__crm4/sdk/10.8.0/app.js'),f=await import('/__crm4/sdk/10.8.0/firestore.js');
 const raw=await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');const base=as.initializeApp();if(base.options.projectId!==a.project)throw Error('PROJECT_DRIFT');const app=raw.initializeApp(base.options,'crm4-expiry-'+crypto.randomUUID()),auth=sdk.getAuth(app);await sdk.setPersistence(auth,sdk.inMemoryPersistence);
 const root=document.createElement('section'),password=document.createElement('input'),start=document.createElement('button'),output=document.createElement('pre');password.type='password';password.autocomplete='off';start.textContent='Arm approved synthetic expiry probes';root.append(password,start,output);document.body.prepend(root);
 let token,off,initial=false,leak=false;const receipts=[];const record=(name,state)=>{receipts.push({name,state,at:new Date().toISOString()});output.textContent=JSON.stringify(receipts,null,2);};const deny=r=>r.status===401||r.status===403;const read=(url)=>fetch(url,{headers:{Authorization:'Bearer '+token},redirect:'manual',cache:'no-store'});
 start.onclick=async()=>{start.disabled=true;try{const u=(await sdk.signInWithEmailAndPassword(auth,'owner@crm4.example.test',password.value)).user;password.value='';if(u.uid!==a.ownerUid)throw Error();token=await u.getIdToken();const db=f.getFirestore(app),ref=f.doc(db,'crm4Leads',a.canaryId);off=f.onSnapshot(ref,snap=>{if(!snap.metadata.fromCache){initial=true;if(snap.data()?.rehearsalCanary===a.canaryValue){leak=true;record('listener-canary',{fromCache:false,receivedAt:Date.now(),canary:a.canaryValue});}else record('listener-initial',{fromCache:false,at:Date.now()});}},error=>record('listener-terminal',{code:error.code,at:Date.now()}));
 const baselineDoc=await read('https://firestore.googleapis.com/v1/projects/'+a.project+'/databases/(default)/documents/crm4Leads/'+a.canaryId);if(!baselineDoc.ok)throw Error();if(!a.existingObjectPath?.startsWith('clientPortal/'+binding.caseId+'/'))throw Error();const baselineObject=await read('https://firebasestorage.googleapis.com/v0/b/'+a.project+'.firebasestorage.app/o/'+encodeURIComponent(a.existingObjectPath)+'?alt=media');if(!deny(baselineObject))throw Error();record('direct-storage-baseline','DENIED_AS_DESIGNED');record('armed','WAITING_FOR_DEADLINE');await new Promise(r=>setTimeout(r,Math.max(0,Date.parse(a.endUtc)-Date.now()+1000)));
 const firestoreUrl='https://firestore.googleapis.com/v1/projects/'+a.project+'/databases/(default)/documents/crm4Leads/'+a.canaryId;record('retained-firestore-token',deny(await read(firestoreUrl))?'PASS':'FAIL');
 const objectUrl='https://firebasestorage.googleapis.com/v0/b/'+a.project+'.firebasestorage.app/o/'+encodeURIComponent(a.existingObjectPath)+'?alt=media';record('retained-storage-token',deny(await read(objectUrl))?'DENIED_BOTH_BEFORE_AND_AFTER_NOT_EXPIRY_PROOF':'FAIL');
 // Native IAP normally returns a denial; redirect to sign-in is not proof of
 // exact policy enforcement and is deliberately INCONCLUSIVE.
 const iap=await fetch('/crm4-login.html',{redirect:'manual',cache:'no-store'});record('iap-session',deny(iap)?'NEEDS_NATIVE_IAP_DENIAL_EVIDENCE':'INCONCLUSIVE');
 if(a.documentTicketPath&&/^\/__crm4\/document\/[a-f0-9]{64}$/.test(a.documentTicketPath)){const doc=await fetch(a.documentTicketPath,{redirect:'manual',cache:'no-store'});record('document-ticket',deny(doc)?'PASS':'FAIL');}else record('document-ticket','INCONCLUSIVE');
 // Separate approved operator performs the canary update after deadline.
 await new Promise(r=>setTimeout(r,15000));record('firestore-listener',!initial?'INCONCLUSIVE':leak?'FAIL':'NEEDS_CONFIRMED_CANARY_WRITE_RECEIPT');record('managed-result','PENDING_OPERATOR_AUDIT_RESTART_AND_CONTAINMENT');
 }catch{password.value='';record('probe-run','FAIL_CONTAIN_NOW');}finally{off?.();token=undefined;await sdk.signOut(auth);await raw.deleteApp(app);}};
 return {receipts:()=>structuredClone(receipts),close:()=>{password.value='';off?.();token=undefined;root.remove();}};
}
if(typeof module!=='undefined')module.exports={crm4PrepareExpiryProbes};
