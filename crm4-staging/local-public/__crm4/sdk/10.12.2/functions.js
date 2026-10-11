export * from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";
import * as sdk from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";
if (!['localhost','127.0.0.1','[::1]'].includes(location.hostname)) throw new Error('CRM4 local only');
const connected=new WeakSet();
export function getFunctions(...args){const value=sdk.getFunctions(...args);if(value.app.options.projectId!=='demo-quaerens-crm4')throw new Error('CRM4 project mismatch');if(!connected.has(value)){sdk.connectFunctionsEmulator(value,'127.0.0.1',5001);connected.add(value);}return value;}
