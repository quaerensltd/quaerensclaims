const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'public', 'section75support.html');
let text = fs.readFileSync(file, 'utf8');
text = text.replace(/\s+$/g, '\n');
fs.writeFileSync(file, text, 'utf8');
console.log('Trimmed section75support.html EOF.');
