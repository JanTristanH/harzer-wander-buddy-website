import extractLinksFromSitemap from "./extractLinksFromSitemap.js";
import fs from 'fs';

const hostSitemap = 'https://www.harzer-wander-buddy.de';
const hostTest = 'http://localhost:4000';
const aBadLinks = [];

const aDefaultLinksToIgnoreInSubLinks = [
    '/',
    '/about',
    '/authors',
    '/app-waitlist',
    '/contact',
    '/',
    '/impressum',
    '/privacy-policy',
    '/app-waitlist',
    'https://www.wowthemes.net/memoirs-free-jekyll-theme/'
];

const aRegexToIgnoreInSubLinks = [
    /google/,
    /geo:/,
    /instagram/,
    /mailto/,
    /facebook/,
    /twitter/,
    /linkedin/,
    /categories#Stempelstelle/,
    /wikimedia/,
    /wikipedia/,
    /license/,
    /wikidata/,
    /flickr/,
    /categories/,
    /licence/,
    /domain/
];

const verifyLinkIntegrity = (sitemapPath) => {
    const links = extractLinksFromSitemap(sitemapPath)
        .map((link) => link.replace(hostSitemap, hostTest));
    const linkCheckResults = links.map((link) => verifyLink(link, true));
    return linkCheckResults;
}

const verifyLink = (link, bVerifySubLinks) => {
    return fetch(link)
        .then(response => response.text()
            .then(text => {
                if (text.match(/404/)) {
                    aBadLinks.push(link);
                    return {
                        link,
                        status: 404,
                        statusText: 'Not Found'
                    };
                }
                if (!bVerifySubLinks) {
                    return {
                        link,
                        status: 200
                    };
                }
                
                const subLinks = extractLinksFromResponse(text)
                    .filter(subLink => !aDefaultLinksToIgnoreInSubLinks.includes(subLink))
                    .filter(subLink => !aRegexToIgnoreInSubLinks.some(regex => regex.test(subLink)))
                    .map(subLink => `${hostTest}${subLink}`)
                    // remove duplicates
                    .filter((subLink, index, self) => self.indexOf(subLink) === index)
                    .map(subLink => verifyLink(subLink, false));
                
                return Promise.all(subLinks)
                    .then(results => ({
                        link,
                        status: 200,
                        subLinks: results
                    }));
            })
        )
        .catch(error => {
            return {
                link,
                status: 500
            };
        });
};


const extractLinksFromResponse = (response) => {
    return response.match(/<a.*?href="(.*?)"/g).map((link) => link.replace(/<a.*?href="|"/g, ''));
}

// const testLink = "https://www.harzer-wander-buddy.de/"
// verifyLink(testLink, true).then((result) => console.log(result));


console.time("all");
const aResult = verifyLinkIntegrity('../sitemap.xml');

Promise.all(aResult).then((result) => {
    console.timeEnd("all");
    fs.writeFileSync('result.json', JSON.stringify(result, null, 4));
    fs.writeFileSync('result_badLinks.json', JSON.stringify(aBadLinks.map(e => e.replace(hostTest, "")).filter((subLink, index, self) => self.indexOf(subLink) === index).sort(), null, 4));
    // console.log(result);
 });

