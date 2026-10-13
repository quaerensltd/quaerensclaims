'use strict';
const fs=require('node:fs'),path=require('node:path');
function adaptManualPage(text){
 if(!text.includes('<title>CRM4 Assessment Builder | Quaerens</title>'))return text;
 if(text.includes('data-manual-bridge'))return text;
 const helpers=text.slice(text.indexOf('function values()'),text.indexOf('const closerStatuses')).replace('const data = Object.fromEntries(new FormData(form).entries());','const data = Object.fromEntries(new FormData(form).entries()); data.assessmentRoute=form.elements.assessmentRoute.value; data.caseId=form.elements.caseId.value;');
 if(!helpers.includes('function report('))throw Error('Manual source contract changed');
 const script=fs.readFileSync(path.join(__dirname,'../frontend/manual-authoring.js'),'utf8').replace('/* ORIGINAL_PRESENTATION_HELPERS */',helpers);
 return text.replace(/<script type="module">[\s\S]*?<\/script>/,()=>'<script type="module" data-manual-bridge>\n'+script+'\n</script>');
}
module.exports={adaptManualPage};
