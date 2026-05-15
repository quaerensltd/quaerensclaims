const fs = require('fs');
const path = 'C:/Users/CasaT/quaerensclaims/public/freeflightclaim.html';
let html = fs.readFileSync(path, 'utf8');
const faqScript = `

    document.querySelectorAll('.faq-button').forEach((button) => {
      button.addEventListener('click', () => {
        const item = button.parentElement;
        const icon = button.querySelector('.faq-icon');
        const isActive = item.classList.contains('active');

        document.querySelectorAll('.faq-item').forEach((faq) => {
          faq.classList.remove('active');
          const faqIcon = faq.querySelector('.faq-icon');
          if (faqIcon) faqIcon.textContent = '+';
        });

        if (!isActive) {
          item.classList.add('active');
          if (icon) icon.textContent = '−';
        }
      });
    });
`;
if (!html.includes("querySelectorAll('.faq-button')")) {
  html = html.replace('    const scrollBtn = document.getElementById("scrollTopBtn");\n', faqScript + '\n    const scrollBtn = document.getElementById("scrollTopBtn");\n');
}
fs.writeFileSync(path, html, 'utf8');
console.log('faq listener added');
