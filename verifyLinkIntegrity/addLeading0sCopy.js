import fs from 'fs';

const sFile = '../sitemap.xml';
function updateStampNumber(input) {
    return input.replaceAll(/(stempelstelle-)(\d+)/ig, (match, prefix, num) => {
        return prefix + num.padStart(3, '0');
    });
}

const data = fs.readFileSync(sFile, 'utf-8');
const newData = updateStampNumber(data);
fs.writeFileSync(sFile, newData);

