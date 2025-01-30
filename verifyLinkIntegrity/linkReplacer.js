import fs from 'fs';
import extractLinksFromSitemap from "./extractLinksFromSitemap.js";

const sPath = '../_posts/stampboxes/';
const validLinks = extractLinksFromSitemap('../sitemap.xml')
let iCounter = 0;

// create map number - validLink
const validLinkMap = new Map();
for (let i = 0; i < validLinks.length; i++) {
    const validLink = validLinks[i];
    //extract number from validLink
    const numberMatch = validLink.match(/\d+/)
    if (!numberMatch) {
        console.log(`No number found in ${validLink}`);
        continue;
    }
    validLinkMap.set(numberMatch[0], validLink.replace('https://www.harzer-wander-buddy.de', ''));
}

const replaceBadLinks = () => {
    // replace all badlinks with valid link
    for (let i = 0; i < badLinks.length; i++) {
        const badLink = badLinks[i];
        //extract number from badLink
        const number = badLink.match(/\d+/)[0];
        const validLink = validLinkMap.get(number);
        
        // search through all files in directory an replace badLink with validLink
        const files = fs.readdirSync('../_posts/stampboxes');
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const content = fs.readFileSync(sPath + file, 'utf-8');
            const newContent = content.replace(badLink, validLink);
            if (content !== newContent) {
                iCounter++;
                console.log(`${iCounter}: Replaced ${badLink} with ${validLink} in ${file}`);
                fs.writeFileSync(sPath + file, newContent);
            }
        }
    }
}


const badLinks = [];


replaceBadLinks();