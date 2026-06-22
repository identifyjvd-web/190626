const fs = require('fs');
let text = fs.readFileSync('index.html', 'utf8');
text = text.replace(/const APP_VERSION = 'Javed Ansari';/, "const APP_VERSION = 'JVD 1.04.26';");
fs.writeFileSync('index.html', text);
console.log('Done fixing version text');
