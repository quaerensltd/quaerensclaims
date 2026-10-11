export * from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import * as sdk from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
if (!['localhost','127.0.0.1','[::1]'].includes(location.hostname)) throw new Error('CRM4 local only');
const connected=new WeakSet();
export function getFirestore(...args){const value=sdk.getFirestore(...args);if(value.app.options.projectId!=='demo-quaerens-crm4')throw new Error('CRM4 project mismatch');if(!connected.has(value)){sdk.connectFirestoreEmulator(value,'127.0.0.1',8080);connected.add(value);}return value;}
