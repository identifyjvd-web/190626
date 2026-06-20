const fs = require('fs');
const b64 = fs.readFileSync('IDentify Logo.png', 'base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" fill="white" rx="24"/>
    <image href="data:image/png;base64,${b64}" width="120" height="120" x="0" y="0"/>
</svg>`;
fs.writeFileSync('favicon-white.svg', svg);
console.log('Created favicon-white.svg');
