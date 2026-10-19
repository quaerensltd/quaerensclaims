'use strict';
// Coordinates existing security boundaries; contains no account or membership implementation.
async function run(a){let started=false,success=false;try{
 await a.preflight();await a.browserReady(); // Private IAP login precedes the ceremony clock.
 started=true;await a.startWatcher();await a.waitReady();await a.independentVerify();
 await a.waitArmed();await a.assertReady();
 const bootstrap=await a.privateBootstrap();await a.assertReady();
 const owner=await a.governedOwner(bootstrap);await a.waitRevoked();
 await a.verifyRevoked(bootstrap,owner);await a.browserRevocation();
 await a.privateOwnerPassword(owner);await a.ownerLogin(owner);
 await a.finalAcceptance(bootstrap,owner);await a.finish(true);success=true;return {pass:true};
 }finally{if(!success){try{if(started)await a.contain();}finally{await a.finish(false);}}}}
module.exports={run};
