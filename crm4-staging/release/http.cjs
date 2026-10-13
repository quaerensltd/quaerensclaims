'use strict';
const fs=require('node:fs'),path=require('node:path');
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.webp':'image/webp'};
function createCloudHandler({runtime,verifyIap,webRoot,manifest,csp}){
 const origin=runtime.config.origin,allowed=new Set(manifest.files);
 return async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Robots-Tag','noindex, nofollow');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Security-Policy',csp);
  const reply=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(body));};
  try{
   let iap;try{iap=await verifyIap(req.headers['x-goog-iap-jwt-assertion']);}catch{return reply(403,{error:{status:'PERMISSION_DENIED',message:'Private tester access required'}});}
   if(req.headers.origin&&req.headers.origin!==origin)return reply(403,{error:{status:'PERMISSION_DENIED'}});
   const pathname=new URL(req.url,origin).pathname;
   const download=/^\/__crm4\/document\/([a-f0-9]{64})$/.exec(pathname);
   if(download&&req.method==='GET'){
    try{const bytes=await runtime.documents.download(download[1],iap);res.writeHead(200,{'Content-Type':'application/octet-stream','Content-Disposition':'attachment; filename="crm4-document"'});return res.end(bytes);}catch{return reply(403,{error:{status:'PERMISSION_DENIED'}});}
   }
   const callable=/^\/__crm4\/call\/([A-Za-z0-9]+)$/.exec(pathname);
   if(callable){
    if(req.method!=='POST')return reply(405,{error:{status:'INVALID_ARGUMENT'}});
    if(req.headers.origin!==origin||!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return reply(403,{error:{status:'PERMISSION_DENIED'}});
    if(!Object.hasOwn(runtime.handlers,callable[1]))return reply(404,{error:{status:'NOT_FOUND'}});
    let decoded;try{const token=req.headers['x-crm4-id-token'];if(typeof token!=='string'||token.length>16000)throw Error();decoded=await runtime.auth.verifyIdToken(token,true);if(decoded.aud!==runtime.config.projectId||decoded.iss!=='https://securetoken.google.com/'+runtime.config.projectId)throw Error();}catch{return reply(401,{error:{status:'UNAUTHENTICATED'}});}
    let size=0,chunks=[],limit=callable[1]==='portalStaffUploadDocument'?21037056:callable[1]==='crm4CloserSendAgreement'?9500000:65536;
    for await(const chunk of req){size+=chunk.length;if(size>limit)return reply(413,{error:{status:'RESOURCE_EXHAUSTED'}});chunks.push(chunk);}
    let parsed;try{parsed=JSON.parse(Buffer.concat(chunks));}catch{return reply(400,{error:{status:'INVALID_ARGUMENT'}});}
    if(!parsed||typeof parsed!=='object'||Array.isArray(parsed)||Object.keys(parsed).some(k=>k!=='data'))return reply(400,{error:{status:'INVALID_ARGUMENT'}});
    try{
     const result=await runtime.documents.withActor({uid:decoded.uid,iapSub:iap.sub},()=>runtime.handlers[callable[1]]({data:parsed.data,auth:{uid:decoded.uid,token:decoded}}));
     return reply(200,{result});
    }catch(error){const codes={'invalid-argument':400,'unauthenticated':401,'permission-denied':403,'not-found':404,'failed-precondition':400,'already-exists':409,'aborted':409,'resource-exhausted':429,'unavailable':503,'data-loss':500};const code=Object.hasOwn(codes,error.code)?error.code:'internal';return reply(codes[code]||500,{error:{status:code.replaceAll('-','_').toUpperCase(),message:code==='internal'?'Operation failed':error.message}});}
   }
   if(!['GET','HEAD'].includes(req.method))return reply(405,{error:{status:'INVALID_ARGUMENT'}});
   let name;try{name=decodeURIComponent(pathname==='/'?'/crm4-login.html':pathname).slice(1);}catch{return reply(400,{error:{status:'INVALID_ARGUMENT'}});}
   if(!allowed.has(name)||name.includes('..')||name.includes('\\'))return reply(404,{error:{status:'NOT_FOUND'}});
   const full=path.join(webRoot,name),real=fs.realpathSync(full);if(!real.startsWith(path.resolve(webRoot)+path.sep))return reply(404,{error:{status:'NOT_FOUND'}});
   res.writeHead(200,{'Content-Type':(mime[path.extname(name)]||'application/octet-stream')+'; charset=utf-8'});if(req.method==='HEAD')return res.end();fs.createReadStream(full).on('error',()=>res.destroy()).pipe(res);
  }catch{return reply(500,{error:{status:'INTERNAL',message:'Operation failed'}});}
 };
}
module.exports={createCloudHandler};
