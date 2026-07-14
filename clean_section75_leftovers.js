const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'public', 'section75support.html');
let html = fs.readFileSync(file, 'utf8');

const badStart = html.indexOf('\nl?type=Section%2075%20Support');
const footerStart = html.indexOf('<footer', badStart);
if (badStart !== -1 && footerStart !== -1) {
  html = html.slice(0, badStart) + '\n  ' + html.slice(footerStart);
}

html = html
  .replace(/<button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full transition">Request Call Back<\/button>/g, '<button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full transition">Request My Free Initial Assessment</button>')
  .replace(/button\.textContent = "Request Call Back";/g, 'button.textContent = "Request My Free Initial Assessment";');

html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').map((line) => line.replace(/[ \t]+$/g, '')).join('\n');
fs.writeFileSync(file, html, 'utf8');
console.log('Cleaned Section 75 leftover legacy block.');
