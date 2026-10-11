export * from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import * as sdk from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
if (!['localhost','127.0.0.1','[::1]'].includes(location.hostname)) throw new Error('CRM4 local only');
const connected=new WeakSet();
export function getStorage(...args){const value=sdk.getStorage(...args);if(value.app.options.projectId!=='demo-quaerens-crm4')throw new Error('CRM4 project mismatch');if(!connected.has(value)){sdk.connectStorageEmulator(value,'127.0.0.1',9199);connected.add(value);}return value;}
