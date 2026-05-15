const fs = require('fs');
const h = fs.readFileSync('public/indexnewtest2.html','utf8');
const checks = {
  h1: (h.match(/<h1\b/g) || []).length,
  sectionsOpen: (h.match(/<section\b/g) || []).length,
  sectionsClose: (h.match(/<\/section>/g) || []).length,
  noindex: h.includes('noindex, nofollow'),
  callback: h.includes('id="request-callback"'),
  contact: h.includes('soft-contact-strip'),
  title: /<title>Quaerens \| Free DIY Tools & Guided Dispute Support<\/title>/.test(h),
  visibleTestLine: h.includes('Test page only: submissions are not connected'),
  badMojibake: /[âÂ]/.test(h)
};
console.log(JSON.stringify(checks,null,2));
