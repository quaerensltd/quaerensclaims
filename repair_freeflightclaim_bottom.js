const fs = require('fs');
const path = 'C:/Users/CasaT/quaerensclaims/public/freeflightclaim.html';
let html = fs.readFileSync(path, 'utf8');
const sharedStyles = `
    .section-wrap {
      max-width: 1180px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .info-box {
      background: #ffffff;
      padding: 1.75rem 1.5rem;
      margin: 1.5rem auto;
      border-radius: 18px;
      max-width: 1100px;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
      font-size: 1.05rem;
      line-height: 1.7;
      color: #111827;
      border: 1px solid #e5e7eb;
    }

    .soft-blue {
      background: linear-gradient(180deg, #eff6ff 0%, #f8fbff 100%);
      border: 1px solid #bfdbfe;
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.25rem;
    }

    .feature-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 1.25rem;
      box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      border-color: #60a5fa;
      box-shadow: 0 12px 28px rgba(37, 99, 235, 0.12);
    }

    .guidance-card-action {
      display: inline-block;
      margin-top: 0.9rem;
      color: #1d4ed8;
      font-weight: 800;
    }

    .faq-item {
      border: 1px solid #dbeafe;
      border-radius: 14px;
      background: #ffffff;
      overflow: hidden;
    }

    .faq-button {
      width: 100%;
      text-align: left;
      padding: 1rem 1.1rem;
      font-weight: 800;
      background: #ffffff;
      border: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #0f172a;
    }

    .faq-content {
      display: none;
      padding: 0 1.1rem 1rem 1.1rem;
      color: #374151;
      line-height: 1.7;
    }

    .faq-item.active .faq-content {
      display: block;
    }

    .faq-icon {
      font-size: 1.25rem;
      color: #2563eb;
      margin-left: 1rem;
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .info-box {
        padding: 1.35rem 1rem;
        border-radius: 16px;
      }

      .card-grid {
        grid-template-columns: 1fr;
      }
    }
`;
if (!html.includes('.section-wrap {')) {
  html = html.replace('    .goog-te-gadget { font-size: 0 !important; }\n', '    .goog-te-gadget { font-size: 0 !important; }\n' + sharedStyles);
}
html = html.replace('<section class="section-wrap py-6">\n    <div class="info-box soft-blue fade-up">\n      <p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">Flight claim guidance hub</p>', '<section class="section-wrap py-6" data-seo-depth="true">\n    <div class="info-box soft-blue fade-up">\n      <p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">Flight claim guidance hub</p>');
fs.writeFileSync(path, html, 'utf8');
console.log('freeflightclaim styles repaired');
