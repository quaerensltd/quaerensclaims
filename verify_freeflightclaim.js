const fs=require('fs');
const p='C:/Users/CasaT/quaerensclaims/public/freeflightclaim.html';
const html=fs.readFileSync(p,'utf8');
const count=(re)=>(html.match(re)||[]).length;
const checks={
  h1: count(/<h1\b/gi),
  sectionsOpen: count(/<section\b/gi),
  sectionsClose: count(/<\/section>/gi),
  footerOpen: count(/<footer\b/gi),
  footerClose: count(/<\/footer>/gi),
  scriptsOpen: count(/<script\b/gi),
  scriptsClose: count(/<\/script>/gi),
  sectionWrapStyle: html.includes('.section-wrap {'),
  cardGridStyle: html.includes('.card-grid {'),
  featureCardStyle: html.includes('.feature-card {'),
  depth: count(/data-seo-depth="true"/g),
  related: count(/data-seo-related="true"/g),
  visibleFaq: count(/data-seo-visible-faq="true"/g),
  faqListener: html.includes("querySelectorAll('.faq-button')") || html.includes('querySelectorAll(".faq-button")'),
  badMojibake: /[âÂ]/.test(html)
};
console.log(JSON.stringify(checks,null,2));
