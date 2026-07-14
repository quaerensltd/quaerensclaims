const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'public', 'foam-insulation.html');
let text = fs.readFileSync(file, 'utf8');
text = text.replace(/^\uFEFF/, '');
text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
text = text
  .split('\n')
  .map((line) => line.replace(/[ \t]+$/g, ''))
  .join('\n');
fs.writeFileSync(file, text, 'utf8');
console.log('Normalised foam-insulation.html whitespace.');
