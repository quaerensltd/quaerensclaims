const fs = require("node:fs");
const { initializeTestEnvironment, assertFails, assertSucceeds } = require("@firebase/rules-unit-testing");
const { doc, getDoc, setDoc, updateDoc, Timestamp } = require("firebase/firestore");

const projectId = "quaerensclaims-crm2-test";
const now = Timestamp.fromDate(new Date("2026-08-03T12:00:00Z"));
const member = (uid, role) => ({ uid, role, active:true, workspaceId:"CRM2", workspaceAccess:["CRM2"], displayName:role });
const lead = (uid, overrides={}) => ({ workspaceId:"CRM2", workspaceLabel:"CRM2", sourceWorkspace:"CRM2", source:"manual_crm2", clientName:"Security Test", telephone:"", email:"", issue:"Solar PV / Renewable Energy", notes:"", preferredContactTime:"", assignedUserName:"", assignedUserId:"", status:"new", reference:"CRM2-TEST", createdBy:uid, createdByName:"Test", createdAt:now, updatedAt:now, audit:[], ...overrides });
const assessment = (uid, caseId, route="solar", overrides={}) => ({ workspaceId:"CRM2", workspaceLabel:"CRM2", sourceWorkspace:"CRM2", caseId, assessmentRoute:route, status:"draft", clientName:"Security Test", reference:"CRM2-TEST", flags:[], createdBy:uid, createdByName:"Test", createdAt:now, updatedAt:now, audit:[], ...overrides });
const activity = (uid, type="agendaItems", overrides={}) => ({ workspaceId:"CRM2", activityType:type, ownerUid:uid, createdByUid:uid, clientKey:"crm2Leads:approved-case", source:"crm2Leads", sourceId:"approved-case", status:"open", createdAt:now, updatedAt:now, ...overrides });

(async () => {
  const env = await initializeTestEnvironment({ projectId, firestore:{ rules:fs.readFileSync("firestore.rules","utf8") } });
  try {
    await env.withSecurityRulesDisabled(async context => {
      const db = context.firestore();
      for (const [uid,role] of [["lister","lister"],["manager","manager"],["closer","closer"],["admin","administrator"]]) await setDoc(doc(db,"crm2Memberships",uid),member(uid,role));
      await setDoc(doc(db,"crm2Leads","new-case"),lead("lister"));
      await setDoc(doc(db,"crm2Leads","approved-case"),lead("lister",{status:"approved"}));
      await setDoc(doc(db,"crm2Assessments","solar-existing"),assessment("lister","approved-case","solar"));
    });

    const unauth = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(unauth,"crm2Memberships","lister")));
    await assertFails(getDoc(doc(unauth,"crm2Leads","new-case")));
    await assertFails(getDoc(doc(unauth,"crm2Assessments","solar-existing")));
    await assertFails(setDoc(doc(unauth,"crm2Leads","unauth-create"),lead("none")));

    const crm = env.authenticatedContext("crm-user").firestore();
    await assertFails(getDoc(doc(crm,"crm2Memberships","lister")));
    await assertFails(getDoc(doc(crm,"crm2Leads","new-case")));
    await assertFails(getDoc(doc(crm,"crm2Assessments","solar-existing")));
    await assertFails(setDoc(doc(crm,"crm2Leads","crm-create"),lead("crm-user")));
    await assertSucceeds(getDoc(doc(crm,"leadAssignments","legacy-crm-record")));

    const lister = env.authenticatedContext("lister").firestore();
    await assertSucceeds(getDoc(doc(lister,"crm2Memberships","lister")));
    await assertFails(getDoc(doc(lister,"crm2Memberships","manager")));
    await assertSucceeds(setDoc(doc(lister,"crm2Leads","lister-create"),lead("lister")));
    await assertFails(setDoc(doc(lister,"crm2Leads","bad-workspace"),lead("lister",{workspaceId:"CRM"})));
    await assertFails(setDoc(doc(lister,"crm2Leads","bad-source"),lead("lister",{source:"internet"})));
    await assertFails(setDoc(doc(lister,"crm2Leads","bad-creator"),lead("manager")));
    await assertFails(updateDoc(doc(lister,"crm2Leads","new-case"),{status:"approved"}));
    await assertFails(updateDoc(doc(lister,"crm2Leads","new-case"),{workspaceId:"CRM"}));
    await assertFails(updateDoc(doc(lister,"crm2Leads","new-case"),{source:"changed"}));
    await assertFails(updateDoc(doc(lister,"crm2Leads","new-case"),{createdBy:"manager"}));
    await assertFails(setDoc(doc(lister,"crm2Memberships","lister"),member("lister","administrator")));
    await assertFails(getDoc(doc(lister,"leadAssignments","legacy-crm-record")));

    const manager = env.authenticatedContext("manager").firestore();
    await assertSucceeds(getDoc(doc(manager,"crm2Memberships","lister")));
    await assertSucceeds(getDoc(doc(manager,"crm2Leads","new-case")));
    for (const status of ["information-requested","awaiting-manager-review","approved","rejected"]) {
      await env.withSecurityRulesDisabled(async context => setDoc(doc(context.firestore(),"crm2Leads",`manager-${status}`),lead("lister",{status:"awaiting-manager-review"})));
      await assertSucceeds(updateDoc(doc(manager,"crm2Leads",`manager-${status}`),{status,updatedAt:now}));
    }
    await assertFails(updateDoc(doc(manager,"crm2Leads","new-case"),{workspaceId:"CRM"}));
    await assertFails(updateDoc(doc(manager,"crm2Leads","new-case"),{source:"changed"}));
    await assertFails(updateDoc(doc(manager,"crm2Leads","new-case"),{createdBy:"manager"}));
    await assertFails(setDoc(doc(manager,"crm2Memberships","manager"),member("manager","administrator")));
    await assertFails(getDoc(doc(manager,"leadAssignments","legacy-crm-record")));

    const closer = env.authenticatedContext("closer").firestore();
    await assertFails(getDoc(doc(closer,"crm2Leads","new-case")));
    await assertSucceeds(getDoc(doc(closer,"crm2Leads","approved-case")));
    await assertSucceeds(updateDoc(doc(closer,"crm2Leads","approved-case"),{status:"closer-assigned",updatedAt:now}));
    await assertFails(updateDoc(doc(closer,"crm2Leads","approved-case"),{workspaceId:"CRM"}));
    await assertFails(setDoc(doc(closer,"crm2Memberships","closer"),member("closer","administrator")));
    await assertFails(getDoc(doc(closer,"leadAssignments","legacy-crm-record")));

    const admin = env.authenticatedContext("admin",{platformAdmin:true}).firestore();
    await assertSucceeds(getDoc(doc(admin,"crm2Leads","new-case")));
    await assertSucceeds(updateDoc(doc(admin,"crm2Leads","new-case"),{status:"approved",updatedAt:now}));
    await assertFails(updateDoc(doc(admin,"crm2Leads","new-case"),{workspaceId:"CRM"}));
    await assertFails(setDoc(doc(admin,"crm2Memberships","self-made"),member("self-made","administrator")));

    await assertSucceeds(setDoc(doc(lister,"crm2Assessments","solar-create"),assessment("lister","approved-case","solar")));
    await assertSucceeds(setDoc(doc(lister,"crm2Assessments","foam-create"),assessment("lister","approved-case","spray-foam")));
    await assertFails(setDoc(doc(lister,"crm2Assessments","missing-case"),assessment("lister","guessed-case","solar")));
    await assertFails(setDoc(doc(lister,"crm2Assessments","cross-workspace"),assessment("lister","approved-case","solar",{workspaceId:"CRM"})));
    await assertFails(updateDoc(doc(lister,"crm2Assessments","solar-create"),{workspaceId:"CRM"}));
    await assertFails(updateDoc(doc(lister,"crm2Assessments","solar-create"),{caseId:"new-case"}));
    await assertFails(updateDoc(doc(lister,"crm2Assessments","solar-create"),{createdBy:"manager"}));
    await assertFails(getDoc(doc(crm,"crm2Assessments","solar-create")));
    await assertSucceeds(getDoc(doc(closer,"crm2Assessments","solar-existing")));
    await assertSucceeds(setDoc(doc(lister,"crm2Activities","agenda-create"),activity("lister")));
    await assertSucceeds(getDoc(doc(manager,"crm2Activities","agenda-create")));
    await assertSucceeds(updateDoc(doc(lister,"crm2Activities","agenda-create"),{status:"completed",updatedAt:now}));
    await assertFails(setDoc(doc(lister,"crm2Activities","bad-activity-workspace"),activity("lister","agendaItems",{workspaceId:"CRM"})));
    await assertFails(setDoc(doc(lister,"crm2Activities","bad-activity-type"),activity("lister","processingCases")));
    await assertFails(getDoc(doc(crm,"crm2Activities","agenda-create")));
    await assertSucceeds(setDoc(doc(lister,"crm2Attendance","lister_2026-08-04"),{workspaceId:"CRM2",uid:"lister",date:"2026-08-04",isOnline:true}));
    await assertSucceeds(getDoc(doc(manager,"crm2Attendance","lister_2026-08-04")));
    await assertFails(setDoc(doc(lister,"crm2Attendance","manager_2026-08-04"),{workspaceId:"CRM2",uid:"manager",date:"2026-08-04",isOnline:true}));
    await assertFails(setDoc(doc(lister,"crm2Attendance","bad-workspace"),{workspaceId:"CRM",uid:"lister",date:"2026-08-04"}));
    await assertFails(getDoc(doc(crm,"crm2Attendance","lister_2026-08-04")));
    console.log("CRM2 Firestore security matrix passed.");
  } finally { await env.cleanup(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
