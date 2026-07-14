const fs = require("fs");
const path = require("path");

const file = path.join("C:", "Users", "CasaT", "exitmytimeshares-live", "docs", "full-service.html");
let html = fs.readFileSync(file, "utf8");

const styleNeedle = `    .step-badge{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9999px;background:#dbeafe;color:#1d4ed8;font-weight:800;margin-bottom:.75rem;}`;
const styleAdd = `${styleNeedle}
    .full-service-price-banner{background:#1e40af;color:#fff;text-align:center;border-radius:28px;padding:3rem 1.5rem;box-shadow:0 18px 42px rgba(30,64,175,.22);}
    .full-service-price-banner .eyebrow{font-size:.88rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#bfdbfe;margin-bottom:.85rem;}
    .full-service-price-banner h2{font-size:clamp(2rem,4vw,3.2rem);line-height:1.08;font-weight:800;margin:0 0 1rem;color:#fff;}
    .full-service-price-banner .price-line{font-size:clamp(1.35rem,2.6vw,2.35rem);font-weight:800;color:#fff;margin:.75rem 0;}
    .full-service-price-banner p{max-width:760px;margin:.75rem auto 0;color:#dbeafe;font-size:1.08rem;line-height:1.65;}
    .full-service-price-banner .small-note{font-size:.9rem;color:#bfdbfe;}`;

if (!html.includes(".full-service-price-banner")) {
  html = html.replace(styleNeedle, styleAdd);
}

const section = `  <section class="section-wrap py-6">
    <div class="full-service-price-banner">
      <p class="eyebrow">Full-service support</p>
      <h2>Full-Service Timeshare Exit Help</h2>
      <div class="price-line">Prices starting from US$3,000 / £2,210 / €2,556</div>
      <p>For a full-service case, pricing starts from the amounts above per week or points package, depending on the resort, contract position, documents available and the amount of support required.</p>
      <p class="small-note">Final pricing is confirmed after the initial review, before any full-service work begins.</p>
    </div>
  </section>

`;

const formNeedle = `  <section id="full-service-form" class="section-wrap py-6">`;
if (!html.includes("Prices starting from US$3,000")) {
  html = html.replace(formNeedle, section + formNeedle);
}

fs.writeFileSync(file, html, "utf8");
console.log(`Updated ${file}`);
