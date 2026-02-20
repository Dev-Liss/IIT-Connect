const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'data', 'timetable.json');
const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
const out = {};
for (const k in data) {
    const rx = /^L5 (SE|CS)\s*-?G(\d+)$/;
    const match = k.match(rx);
    if (match) {
        out[`${match[1]}-G${match[2]}`] = data[k];
    } else {
        out[k.trim()] = data[k];
    }
}
fs.writeFileSync(p, JSON.stringify(out, null, 4));
console.log('Done mapping keys in timetable.json');
