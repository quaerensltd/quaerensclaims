const fs = require('fs');
for (const f of ['public/index.html','public/category-property.html','public/category-travel.html']) {
  const s = fs.readFileSync(f, 'utf8');
  console.log('\n===== ' + f + ' =====');
  for (const p of ['<nav','free-tools','Finance','card-grid','About Quaerens','footer']) {
    const i = s.indexOf(p);
    console.log('--- ' + p + ' ' + i + ' ---');
    console.log(s.slice(Math.max(0, i - 350), i + 1200));
  }
}
