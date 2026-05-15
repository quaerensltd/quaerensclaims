const fs=require('fs');
const html=fs.readFileSync('C:/Users/CasaT/quaerensclaims/public/indexnewtest.html','utf8');
const c=(re)=>(html.match(re)||[]).length;
console.log(JSON.stringify({h1:c(/<h1\b/gi),sectionsOpen:c(/<section\b/gi),sectionsClose:c(/<\/section>/gi),headerOpen:c(/<header\b/gi),headerClose:c(/<\/header>/gi),footerOpen:c(/<footer\b/gi),footerClose:c(/<\/footer>/gi),callback:html.includes('Request a call back'),contact:html.includes('Speak to one of our expert intake consultants'),badMojibake:/[âÂ]/.test(html)},null,2));
