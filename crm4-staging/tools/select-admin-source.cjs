'use strict';
// Select declarations without executing the monolithic deployed entrypoint.
// Only these reviewed Admin exports may be selected. Dependencies are resolved
// lexically; runtime services are explicitly injected by the emulator boundary.
const acorn=require('acorn'), scope=require('eslint-scope');
const names=new Set(['crm2AdminCreateUser','crm2AdminUpdateMembership','crm2AdminSendPasswordSetupEmail','crm2AdminProvisionExistingProcessing']);
const injected=new Set(['admin','db','onCall','HttpsError','resend','resendApiKeySecret','FieldValue','process','exports','require']);
const intrinsic=new Set(['String','Number','Boolean','Object','Array','Set','Map','Date','JSON','Math','Error','Promise','Buffer','console','undefined']);
function free(text) {
  const ast=acorn.parse(text,{ecmaVersion:2022,ranges:true});
  return scope.analyze(ast,{ecmaVersion:2022,sourceType:'script'}).globalScope.through.map(r=>r.identifier.name);
}
function select(source,name) {
  if(!names.has(name))throw Error('Unreviewed Admin export');
  const ast=acorn.parse(source,{ecmaVersion:2022,ranges:true}), declarations=new Map();
  for(const n of ast.body) {
    if(n.type==='FunctionDeclaration')declarations.set(n.id.name,n);
    if(n.type==='VariableDeclaration')for(const d of n.declarations) {
      if(d.id.type==='Identifier')declarations.set(d.id.name,n);
      if(d.id.type==='ObjectPattern')for(const p of d.id.properties)if(p.value?.type==='Identifier')declarations.set(p.value.name,n);
    }
  }
  const target=ast.body.find(n=>n.type==='ExpressionStatement' && n.expression.type==='AssignmentExpression' && n.expression.left.object?.name==='exports' && n.expression.left.property?.name===name);
  if(!target)throw Error('Exact export missing');
  const selected=new Set([target]);
  // Resolve each declaration separately so nested locals are not mistaken for dependencies.
  const queue=[target];
  while(queue.length) {
    const node=queue.shift();
    for(const ref of free(source.slice(node.start,node.end))) {
      if(injected.has(ref)||intrinsic.has(ref))continue;
      const dep=declarations.get(ref); if(!dep)throw Error('Unresolved Admin dependency: '+ref);
      if(!selected.has(dep)){selected.add(dep);queue.push(dep);}
    }
  }
  return [...selected].sort((a,b)=>a.start-b.start).map(n=>source.slice(n.start,n.end)).join('\n');
}
module.exports={select};
