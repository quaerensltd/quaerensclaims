'use strict';
// This is a preparation adapter, NOT an alternative grant of platformAdmin.
// It uses a revocation-checked Firebase token, never an IAM identity or a caller
// supplied claims object. No credentials or claims are minted by this module.
async function createOwner({auth,handler,idToken,expectedActorUid}){
 if(!expectedActorUid||typeof idToken!=='string')throw Error('Named existing bootstrap actor required');
 const token=await auth.verifyIdToken(idToken,true);
 if(token.uid!==expectedActorUid||token.aud!=='quaerens-crm4-spain-test'||token.iss!=='https://securetoken.google.com/quaerens-crm4-spain-test'||token.platformAdmin!==true)throw Error('Verified project-local platformAdmin required');
 return handler({auth:{uid:token.uid,token},data:{email:'owner@crm4.example.test',displayName:'CRM4 Synthetic Owner',role:'administrator',workspaceId:'CRM4',active:true}});
}
module.exports={createOwner};
