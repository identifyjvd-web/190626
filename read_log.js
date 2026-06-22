const fs = require('fs');
const lines = fs.readFileSync('C:\\Users\\Anjuman Chhindwara\\.gemini\\antigravity\\brain\\548eb106-592c-4925-9393-e89619d20cfb\\.system_generated\\logs\\transcript_full.jsonl', 'utf8').split('\n');
for (const line of lines) {
    if (line.includes('"step_index":611')) {
        console.log(line);
        break;
    }
}
