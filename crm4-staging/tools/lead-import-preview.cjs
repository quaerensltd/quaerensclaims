'use strict';
// Offline CRM4 CSV adapter. No SDK, network, database writes or import execution.
const crypto=require('node:crypto');
const {resolveActor,hasRole}=require('./staff-capabilities.cjs');
const columns=['sourceRowId','forename','surname','email','telephone','claimType','referralSource','referralSourceOther','assigneeUid','workspaceId','addressLine1','addressLine2','town','county','postcode','notes'];
const limits={sourceRowId:100,forename:100,surname:100,email:320,telephone:60,claimType:60,referralSource:60,referralSourceOther:160,assigneeUid:180,workspaceId:4,addressLine1:160,addressLine2:160,town:100,county:100,postcode:16,notes:1200};
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function parseCsv(input){
 if(typeof input!=='string'||Buffer.byteLength(input)>2*1024*1024||input.includes('\0'))throw Error('CSV must be UTF-8 text, at most 2 MiB, without NUL');
 const text=input.replace(/^\uFEFF/,''),rows=[];let row=[],field='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;}}else field+=c;continue;}
 if(c==='"'){if(field||closed)throw Error('Malformed CSV quote');quoted=true;continue;}
 if(c===','||c==='\n'||c==='\r'){row.push(field);field='';closed=false;if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(x=>x!==''))rows.push(row);row=[];if(rows.length>2001)throw Error('Maximum 2000 data rows');}continue;}
 if(closed)throw Error('Unexpected text after closing quote');field+=c;
 }
 if(quoted)throw Error('Unclosed CSV quote');if(field||row.length||closed){row.push(field);rows.push(row);}if(rows.length>2001)throw Error('Maximum 2000 data rows');
 const header=rows.shift();if(!header||new Set(header).size!==header.length||header.some(x=>!columns.includes(x)))throw Error('Unknown or duplicate CSV columns');
 for(const name of ['sourceRowId','forename','surname','assigneeUid'])if(!header.includes(name))throw Error('Missing column '+name);
 return rows.map((cells,index)=>{if(cells.length!==header.length)throw Error('Column count mismatch on data row '+(index+1));return Object.fromEntries(header.map((h,i)=>[h,cells[i].trim()]));});
}
function phone(value){let raw=value.trim().replace(/[ ().-]/g,'');if(!raw)return '';if(raw.startsWith('00'))raw='+'+raw.slice(2);if(/^[6789]\d{8}$/.test(raw))raw='+34'+raw;if(!/^\+[1-9]\d{7,14}$/.test(raw)||raw.startsWith('+34')&&!/^\+34[6789]\d{8}$/.test(raw))throw Error('Use a valid +country number or nine-digit Spanish number');return raw;}
function preview(csv,{batchId,staff,existing=[],existingRevision='not-verified'}={}){
 if(!/^[A-Za-z0-9_-]{16,100}$/.test(batchId||''))throw Error('Stable batch reference required');
 if(!Array.isArray(staff)||staff.length!==2||new Set(staff.map(x=>x.uid)).size!==2)throw Error('Exactly two distinct staff required');
 const actors=new Map(staff.map(s=>{const a=resolveActor(s.uid,s);if(!hasRole(a,'lister')||!hasRole(a,'closer'))throw Error('Active CRM4 dual-role staff required');return [s.uid,a];}));
 const contacts=new Set();for(const lead of existing){if(lead.workspaceId!=='CRM4'||[lead.sourceWorkspace,lead.crmLink?.workspaceId].some(x=>x&&x!=='CRM4'))throw Error('Existing inventory crosses workspaces');if(lead.emailNormalized||lead.email)contacts.add('email:'+(lead.emailNormalized||lead.email).trim().toLowerCase());if(lead.telephoneNormalized||lead.telephone)contacts.add('phone:'+phone(lead.telephoneNormalized||lead.telephone));}
 const ids=new Set(),seen=new Set(),rows=parseCsv(csv).map((row,index)=>{const result={row:index+2,sourceRowId:row.sourceRowId,status:'rejected',reasons:[]};try{
  for(const [k,v]of Object.entries(row)){if(v.length>limits[k])throw Error('Field too long: '+k);if(k!=='telephone'&&/^[=+@\-\t\r]/.test(v))throw Error('Formula-like field: '+k);}
  if(!/^[A-Za-z0-9_-]{1,100}$/.test(row.sourceRowId||''))throw Error('sourceRowId required');if(ids.has(row.sourceRowId))throw Error('Repeated sourceRowId');ids.add(row.sourceRowId);
  if(!row.forename||!row.surname)throw Error('Forename and surname required');if(row.workspaceId&&row.workspaceId!=='CRM4')throw Error('CRM4 workspace required');if(!actors.has(row.assigneeUid))throw Error('Assignee is not one of the two approved staff');
  const telephone=phone(row.telephone||''),email=(row.email||'').toLowerCase();if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Invalid email');if(!telephone&&!email)throw Error('Email or telephone required');
  const claimType=row.claimType||'foam_insulation';if(!['foam_insulation','solar_support'].includes(claimType))throw Error('Unsupported existing claim route');const referralSource=row.referralSource||'other';if(!['existing_client_referral','partner_referral','direct_enquiry','professional_referral','other'].includes(referralSource))throw Error('Invalid referral source');if(referralSource==='other'&&!row.referralSourceOther)throw Error('Actual referral source description required');
  const keys=[email&&'email:'+email,telephone&&'phone:'+telephone].filter(Boolean);const duplicate=keys.some(k=>seen.has(k)||contacts.has(k));keys.forEach(k=>seen.add(k));if(duplicate)return {...result,status:'duplicate',reasons:['Matching email or telephone; review, never overwrite']};
  const data={...row,email,telephone,claimType,referralSource};delete data.sourceRowId;delete data.assigneeUid;delete data.workspaceId;data.requestId='crm4import_'+sha(JSON.stringify({batchId,rowId:row.sourceRowId,assigneeUid:row.assigneeUid,data})).slice(0,64);
  return {...result,status:'accepted',reasons:[],workspaceId:'CRM4',assigneeUid:row.assigneeUid,handler:'crm4ListerCreateReferralLead',data};
 }catch(e){result.reasons.push(e.message);return result;}});
 const counts={accepted:0,rejected:0,duplicate:0};for(const r of rows)counts[r.status]++;
 return {schemaVersion:1,batchId,csvSha256:sha(csv),previewHash:sha(JSON.stringify({batchId,staff,existingRevision,rows})),existingRevision,counts,rows,cloudWritesPerformed:false,executionAuthorized:false,duplicateCheckFinal:false};
}
module.exports={parseCsv,phone,preview};
if(require.main===module){const fs=require('node:fs');const [csv,context]=process.argv.slice(2);if(!csv||!context)throw Error('Usage: node lead-import-preview.cjs INPUT.csv CONTEXT.json');const p=preview(fs.readFileSync(csv,'utf8'),JSON.parse(fs.readFileSync(context,'utf8')));console.log(JSON.stringify({...p,rows:p.rows.map(({data,...r})=>r)},null,2));}
