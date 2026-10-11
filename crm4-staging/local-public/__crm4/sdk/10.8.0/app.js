export * from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import * as sdk from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
if (!['localhost','127.0.0.1','[::1]'].includes(location.hostname)) throw new Error('CRM4 local only');
export function initializeApp(){return sdk.getApps().find(a=>a.name==='[DEFAULT]')||sdk.initializeApp({projectId:'demo-quaerens-crm4',apiKey:'demo-emulator-only',authDomain:'localhost',storageBucket:'demo-quaerens-crm4.appspot.com'});}
