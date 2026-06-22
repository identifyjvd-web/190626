const fs = require('fs');
let text = fs.readFileSync('index.html', 'utf8');

const regex = /<div class="absolute right-0 bottom-2">\s*<span class="text-\[9px\] font-bold tracking-\[0\.12em\] text-slate-300 uppercase"><span\s*id="login-app-version">.*?<\/span><\/span>\s*<\/div>/g;

if (regex.test(text)) {
    text = text.replace(regex, '');
    fs.writeFileSync('index.html', text);
    console.log('Removed gray version text successfully!');
} else {
    console.log('Regex did not match. Trying simple replace.');
    // Let's just find the login-app-version span and hide its container.
    text = text.replace('<div class="absolute right-0 bottom-2">', '<div class="absolute right-0 bottom-2 hidden">');
    fs.writeFileSync('index.html', text);
    console.log('Added hidden class.');
}
