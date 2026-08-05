"use strict";
const fs=require("fs"),path=require("path"),root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8"),html=read("public/freeflightclaim.html"),runtime=read("public/airbnb-complaint-pack-v3.js"),css=read("public/complaint-builder/styles/framework-v1-builder.css"),config=read("public/complaint-builder/config/framework-a-categories-v1.4.js"),adapter=read("public/complaint-builder/adapters/framework-a-flight-adapter.js"),compensation=read("public/builders/flight/flight.compensation.js"),metrics=read("public/complaint-builder/metrics/framework-a-metrics-config.js");
let passed=0;const check=(condition,label)=>{if(!condition)throw new Error(label);passed++};
[
 [html.includes('canonical" href="https://www.quaerens.co.uk/freeflightclaim.html"'),"canonical preserved"],
 [html.includes('data-qcb-builder="flight" data-qcb-version="4"'),"Flight registered on shared runtime"],
 [html.includes("qcb-framework-v1 qcb-airbnb-builder"),"shared Framework shell"],
 [html.includes("qcb-airbnb-shell")&&html.includes("qcb-airbnb-stage")&&html.includes("qcb-airbnb-preview"),"shared DOM contract"],
 [!html.includes('id="legacy-flight-builder"')&&!html.includes("application/x-obsolete")&&!html.includes('id="flight-tool-legacy"'),"legacy DOM and runtime removed"],
 [html.includes("framework-a-categories-v1.4.js")&&html.includes("airbnb-complaint-pack-v3.js?v=1.4.0"),"single v1.4 runtime path"],
 [html.includes("applicant-details.js"),"Applicant Details inherited"],
 [runtime.includes("complaintPackReference")&&html.includes("12-page pack"),"QCP identity and 12-page pack"],
 [runtime.includes("frameworkVersion: window.QCBFrameworkACategories.version"),"v1.4 metadata inherited"],
 [runtime.includes("help-the-next-person.js"),"Help the Next Person inherited"],
 [runtime.includes("framework-a-metrics.js")&&metrics.includes('"flight-claim"'),"anonymous metrics inherited"],
 [config.includes('flight: {')&&config.includes('metricsId: "flight-claim"'),"declarative Flight configuration"],
 [config.includes("Boarding pass")&&config.includes("Cancellation notice")&&config.includes("Alternative travel"),"Flight evidence catalogue"],
 [adapter.includes('"/api/flight-lookup"')&&adapter.includes("cloudfunctions.net/lookupFlight"),"protected lookup and fallback"],
 [adapter.includes("Manual entry is always available")||html.includes("Manual entry is always available"),"manual correction path"],
 [adapter.includes("QCBFFlight?.compensation")&&adapter.includes("engine.analyse")&&!adapter.includes("distanceKm <= 1500"),"shared compensation-engine adapter"],
 [compensation.includes("function compensationAmount")&&compensation.includes("const band = currency === \"EUR\" ? [250, 400, 600] : [220, 350, 520]"),"protected UK261 and EC261 guidance bands"],
 [runtime.includes("FREE FLIGHT CLAIM COMPLAINT PACK")&&runtime.includes("Flight and Journey Summary"),"Flight document configuration"],
 [runtime.includes("Formal flight disruption complaint")&&runtime.includes("Flight complaint file"),"Flight wording"],
 [runtime.includes("CAA-approved Alternative Dispute Resolution")&&runtime.includes("UK261, EC261"),"official guidance"],
 [html.includes("does not submit complaints automatically")&&html.includes("does not guarantee compensation"),"cautious public wording"],
 [html.includes('role="progressbar"')&&html.includes('aria-live="polite"')&&html.includes('aria-label="Builder steps"'),"shared accessibility semantics"],
 [css.includes("@media(max-width:1200px)")&&css.includes("@media(max-width:760px)")&&css.includes("@media(max-width:420px)"),"desktop tablet and mobile responsive rules"],
 [adapter.includes("Gateway handoff not available here")&&!html.includes('addDoc('),"Framework C boundary preserved"],
 [!html.includes('/builders/flight/flight.documents.js')&&!html.includes('/builders/flight/flight.page.js')&&!html.includes('/builders/flight/flight.evidence.js'),"no active duplicate Flight engines"],
 [!html.includes('collection(db, "internet')&&!html.includes("addDoc(collection"),"no direct CRM or intake writes"]
].forEach(([condition,label])=>check(condition,label));
const titles=["Flight Claim Complaint File","Executive Summary","Flight and Journey Summary","Chronology","Supporting Evidence","Financial Impact","Formal Complaint Letter","Cover Email","Submission Checklist","Response Tracker","Official Guidance & Routes","Quaerens Notes"];
titles.forEach(title=>check(runtime.includes(title),`document page: ${title}`));
console.log(`Flight Framework A v1.4 static checks passed (${passed}/${passed}).`);
