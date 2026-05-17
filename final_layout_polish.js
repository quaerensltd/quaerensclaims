const fs = require('fs');
const path = require('path');
const pub = path.join(process.cwd(), 'public');
const polishCss = `
<style id="quaerens-final-layout-polish">
  .service-card .flex.items-start.justify-between.gap-3,
  .service-card .card-title-row {
    display: block !important;
    min-width: 0 !important;
    padding-right: 5.8rem !important;
  }
  .service-card h3,
  .service-card p,
  .review-panel-head h2,
  .section-head h2 {
    word-break: normal !important;
    overflow-wrap: normal !important;
    hyphens: none !important;
  }
  .service-card h3 {
    white-space: normal !important;
    line-height: 1.16 !important;
  }
  .service-card span {
    max-width: 5.2rem !important;
    text-align: center !important;
    line-height: 1.1 !important;
  }
  .service-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)) !important;
  }
  .review-panel .service-grid,
  .diy-panel .service-grid {
    align-items: stretch !important;
  }
  .hero .btn,
  .hero-actions,
  .hero .flex.flex-wrap {
    position: relative !important;
    z-index: 5 !important;
  }
  .trust-row,
  .proof-grid {
    clear: both !important;
  }
  .footer .brand-tagline,
  .footer-logo-tagline {
    display: none !important;
  }
  @media (min-width: 1120px) {
    .service-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    }
  }
  @media (max-width: 760px) {
    .service-grid {
      grid-template-columns: 1fr !important;
    }
    .service-card {
      grid-template-columns: 64px minmax(0, 1fr) !important;
    }
    .service-card .flex.items-start.justify-between.gap-3,
    .service-card .card-title-row {
      padding-right: 5.4rem !important;
    }
  }
</style>`;
function upsert(file){
  const p = path.join(pub, file);
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(/\n?<style id="quaerens-final-layout-polish">[\s\S]*?<\/style>/i, '');
  s = s.replace(/\s*<p[^>]*>\s*Clear support when complaints get complicated\.\s*<\/p>/gi, '');
  if (!s.includes('</head>')) throw new Error(file + ' has no </head>');
  s = s.replace('</head>', polishCss + '\n</head>');
  fs.writeFileSync(p, s, 'utf8');
  console.log('patched', file);
}
[
 'index.html',
 'category-free-tools.html',
 'category-travel.html',
 'category-finance.html',
 'category-property.html',
 'category-digital.html',
 'category-letters-escalation.html',
 'category-international.html'
].forEach(upsert);
