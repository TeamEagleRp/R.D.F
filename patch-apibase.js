// Patch frontend JS to prefix API calls with window.API_BASE
const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'public/js/app.js'),
  path.join(__dirname, 'public/js/login.js'),
  path.join(__dirname, 'public/members.html'),
];

const PREFIX = "(window.API_BASE||'') + ";
const PREFIX_JSON = "(window.API_BASE?window.API_BASE:'')";

function patchFile(file) {
  let src = fs.readFileSync(file, 'utf8');
  let count = 0;

  // Only patch fetch() calls. Replace the string literal after fetch( for /api/ paths.
  // Pattern: fetch(' /api/  ...  '  or fetch(" /api/ ... "  or fetch(` /api/ ...
  const re = /fetch\((\s*)(['"`])(\/api\/)([^'"`]*)\2/g;
  src = src.replace(re, (match, sp, q, apisp, rest) => {
    count++;
    return `fetch(${sp}${q}${PREFIX_JSON}${q} + ${q}${apisp}${rest}${q}`;
  });

  fs.writeFileSync(file, src, 'utf8');
  console.log(`${path.basename(file)}: ${count} fetch calls patched`);
}

files.forEach(patchFile);
console.log('Done.');

