import fs from 'fs';

const sPath = '../_posts/stampboxes/';
let iCounter = 0;
function updateStampNumber(input) {
    return input.replaceAll(/(stempelstelle-)(\d+)/ig, (match, prefix, num) => {
        return prefix + num.padStart(3, '0');
    });
}

const files = fs.readdirSync('../_posts/stampboxes');
for (let i = 0; i < files.length; i++) {
    iCounter++;
    const file = files[i];
    const content = fs.readFileSync(sPath + file, 'utf-8');
    const newContent = updateStampNumber(content);
    console.log(`${iCounter}: processed ${file}`);
    fs.writeFileSync(updateStampNumber(sPath + "/padded/" + file), newContent);

}