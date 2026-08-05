const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const failures = [];
const pass = message => console.log(`PASS: ${message}`);
const assert = (condition, message) => condition ? pass(message) : failures.push(message);

const html = read("public/intake-gateway.html");
const css = read("public/intake-gateway.css");
const js = read("public/intake-gateway.js");
const admin = read("public/admin-centre.html");
const login = read("public/login.html");
const functions = read("functions/index.js");
const rules = read("firestore.rules");
const firebase = read("firebase.json");
const vercel = read("vercel.json");
const implementation = read("docs/platform/intake-gateway/quaerens-intake-gateway-v1-implementation.md");

assert(html.includes('meta name="robots" content="noindex, nofollow"'), "Gateway route is noindex");
assert(admin.includes('href="/intake-gateway.html"') && admin.includes("Quaerens Intake Gateway"), "Admin Centre exposes the internal Gateway route");
assert(login.includes('requested === "/intake-gateway.html"') && login.includes("platformAdmin"), "Existing login safely returns authorised platform admins to the Gateway");
assert(js.includes("onAuthStateChanged") && js.includes("token.claims.platformAdmin !== true"), "Gateway reuses authentication and enforces platformAdmin visibility");
assert(functions.includes("exports.gatewaySubmitPreparedCase") && functions.includes("exports.gatewayAdminListPreparedCases") && functions.includes("exports.gatewayAdminUpdatePreparedCase"), "Prepared Case intake and protected internal callable functions exist");
assert(functions.includes("guidedSupportConsent !== true") && functions.includes("guidedSupportConsentAt"), "Prepared Case intake requires explicit Guided Support consent");
assert(functions.includes('status: "new"') && functions.includes('assignmentStatus: "unassigned"'), "Public intake cannot choose status or assignment");
assert(functions.includes('"ready-for-assignment"') && functions.includes("GATEWAY_V1_DESTINATIONS"), "Manual assignment stops at the approved Version 1 terminal state");
assert(functions.includes("crmRecordCreated: false"), "Audit and callable response affirm that no CRM record is created");
assert(rules.includes("match /intakeGatewayPreparedCases/{caseId}") && rules.includes("allow read, write: if false"), "Firestore blocks direct browser access to Gateway records");

["New Prepared Cases", "Awaiting Review", "Awaiting Qualification", "Awaiting Assignment", "Average Pack Quality", "Average Evidence Readiness"].forEach(label => assert(js.includes(label), `Dashboard includes ${label}`));
["Airbnb", "Section 75", "Holiday Compensation", "Flight Delay", "Car Finance", "Train", "Parking", "Cruise", "Lost Luggage", "Energy", "Gym"].forEach(builder => assert(js.includes(builder), `Queue configuration includes ${builder}`));
["frameworkFilter", "builderFilter", "statusFilter", "commercialFilter", "countryFilter", "priorityFilter", "assignmentFilter"].forEach(id => assert(html.includes(`id="${id}"`), `Filter exists: ${id}`));
["Executive Summary", "Complaint Pack", "Timeline", "Evidence Schedule", "Financial Schedule", "Complaint Letter", "Cover Email", "Supporting Documents", "Internal Notes", "Assignment"].forEach(section => assert(js.includes(section) || html.includes(section), `Prepared Case viewer includes ${section}`));
["review", "approve", "decline", "request-more-information", "assign-later", "add-note", "ready-for-assignment"].forEach(action => assert(functions.includes(`"${action}"`), `Backend allow-lists ${action}`));
assert(css.includes("@media (max-width: 900px)") && css.includes("@media (max-width: 640px)"), "Tablet and mobile responsive layouts exist");
assert(css.includes("prefers-reduced-motion") && css.includes(":focus-visible"), "Reduced motion and visible keyboard focus are supported");
assert(firebase.includes('"source": "/intake-gateway*.html"') && firebase.includes("no-store, max-age=0"), "Gateway route has internal cache and indexing controls");
assert(vercel.includes('"source": "/intake-gateway.html"') && vercel.includes("noindex, nofollow"), "Vercel applies internal cache and indexing controls");
assert(implementation.includes("Version 1") && implementation.includes("Ready for Assignment"), "Version 1 implementation is documented");

const gatewaySurface = `${html}\n${css}\n${js}`;
assert(!/collection\s*\([^)]*,\s*["'](?:claims|crm2Leads|users|clientFiles)/i.test(gatewaySurface), "Gateway browser code does not access operational CRM collections");
assert(!/addDoc|setDoc|updateDoc|deleteDoc/.test(js), "Gateway browser code cannot write Firestore directly");

if (failures.length) {
  console.error("\nFramework C Version 1 validation failed:");
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("\nQuaerens Intake Gateway Version 1 static validation passed.");
