const fs = require('fs');

const en = JSON.parse(fs.readFileSync('i18n/locales/en.json', 'utf8'));
const es = JSON.parse(fs.readFileSync('i18n/locales/es.json', 'utf8'));
const ro = JSON.parse(fs.readFileSync('i18n/locales/ro.json', 'utf8'));
const ru = JSON.parse(fs.readFileSync('i18n/locales/ru.json', 'utf8'));

function getKeys(obj, prefix = '') {
  let keys = [];
  for (let key in obj) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getKeys(obj[key], path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

const enKeys = new Set(getKeys(en));
const esKeys = new Set(getKeys(es));
const roKeys = new Set(getKeys(ro));
const ruKeys = new Set(getKeys(ru));

console.log('=== Translation Key Statistics ===');
console.log('EN keys:', enKeys.size);
console.log('ES keys:', esKeys.size);
console.log('RO keys:', roKeys.size);
console.log('RU keys:', ruKeys.size);
console.log('');

const missingInES = [...enKeys].filter(k => !esKeys.has(k));
const missingInRO = [...enKeys].filter(k => !roKeys.has(k));
const missingInRU = [...enKeys].filter(k => !ruKeys.has(k));

if (missingInES.length > 0) {
  console.log('=== Missing in ES (' + missingInES.length + ') ===');
  console.log(JSON.stringify(missingInES, null, 2));
  console.log('');
}

if (missingInRO.length > 0) {
  console.log('=== Missing in RO (' + missingInRO.length + ') ===');
  console.log(JSON.stringify(missingInRO, null, 2));
  console.log('');
}

if (missingInRU.length > 0) {
  console.log('=== Missing in RU (' + missingInRU.length + ') ===');
  console.log(JSON.stringify(missingInRU, null, 2));
  console.log('');
}

if (missingInES.length === 0 && missingInRO.length === 0 && missingInRU.length === 0) {
  console.log('✓ All translations are complete and synchronized!');
} else {
  console.log('Total missing translations:', missingInES.length + missingInRO.length + missingInRU.length);
}
