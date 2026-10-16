async function crm4VerifyFixtureBinding(a){
 const b=a?.fixtureBinding;if(!b||b.version!==1||b.project!=='quaerens-crm4-spain-test'||b.projectNumber!=='558324850479'||!/^[-A-Za-z0-9_]{1,128}$/.test(b.leadId)||b.caseId!=='crm4-'+b.leadId||b.ownerUid!==b.actorUid||b.auditActorUid!==b.actorUid||b.auditAction!=='manual_referral_lead_created'||b.clientEmail!=='portal-client@crm4.example.test'||!Number.isFinite(Date.parse(b.createdAt)))throw Error('UNBOUND_FIXTURE');
 const bytes=new TextEncoder().encode(JSON.stringify(b)),digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');if(digest!==a.fixtureBindingHash)throw Error('FIXTURE_HASH_DRIFT');return b;
}
if(typeof module!=='undefined')module.exports={crm4VerifyFixtureBinding};
