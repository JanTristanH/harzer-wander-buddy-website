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


const badLinks = [
    "/stempelstelle-1-eckertalsperre",
    "/stempelstelle-100-ruine-ebersburg",
    "/stempelstelle-101-einhornhoehle",
    "/stempelstelle-102-ravensberg",
    "/stempelstelle-111-steinbergturm",
    "/stempelstelle-112-klusfelsen",
    "/stempelstelle-112-liebesbankweg",
    "/stempelstelle-113-grumbacher-teiche",
    "/stempelstelle-113-unterer-grumbacher-teich",
    "/stempelstelle-116-verlobungsinsel",
    "/stempelstelle-119-hallesche-huette",
    "/stempelstelle-123-gasthaus-rinderstall",
    "/stempelstelle-123-rinderstall",
    "/stempelstelle-124-koete-am-heidestieg",
    "/stempelstelle-127-weppner-huette",
    "/stempelstelle-128-schindelkopf",
    "/stempelstelle-130-albertturm",
    "/stempelstelle-131-kaysereiche",
    "/stempelstelle-134-brander-klippe",
    "/stempelstelle-137-mangelhalber-tor",
    "/stempelstelle-139-prinzenteich",
    "/stempelstelle-14-schnarcherklippe",
    "/stempelstelle-14-schnarcherklippen",
    "/stempelstelle-141-oberer-hahnebalzer-teich",
    "/stempelstelle-146-grosses-wehr-morgenbrodstal",
    "/stempelstelle-148-naturmythenpfad",
    "/stempelstelle-149-kleine-oker",
    "/stempelstelle-150-burgruine-frauenstein",
    "/stempelstelle-150-großer-knollen",
    "/stempelstelle-151-burgruine-scharzfels",
    "/stempelstelle-153-goedeckenplatz",
    "/stempelstelle-154-dreibrodesteine",
    "/stempelstelle-157-kapellenfleck",
    "/stempelstelle-160-helenenruh",
    "/stempelstelle-162-alte-wache",
    "/stempelstelle-163-bremer-klippe",
    "/stempelstelle-165-wendeleiche",
    "/stempelstelle-166-sachsenstein",
    "/stempelstelle-166-sachsensteinhütte",
    "/stempelstelle-169-polsterberger-hubhaus",
    "/stempelstelle-171-altarklippen",
    "/stempelstelle-172 -katzsohlteich",
    "/stempelstelle-173-hirschbuechenkopf",
    "/stempelstelle-175-schaubergwerk-glasbach-stollen",
    "/stempelstelle-177-verlobungsurne",
    "/stempelstelle-178-hirschgrund",
    "/stempelstelle-178-koenigsruhe",
    "/stempelstelle-179-vierter-friedrichshammer",
    "/stempelstelle-186-anhaltinischer-saalstein",
    "/stempelstelle-187-ruine-lauenburg",
    "/stempelstelle-194-wasserkunstanlage-hellergrund",
    "/stempelstelle-199-bismarckturm-ballenstedt",
    "/stempelstelle-20-barenberg",
    "/stempelstelle-203-schutzhutte-am-mettenberg",
    "/stempelstelle-204-selkeblick",
    "/stempelstelle-208-ruine-grillenburg",
    "/stempelstelle-212-queste",
    "/stempelstelle-216-hunrodeiche",
    "/stempelstelle-217-dicke-buche",
    "/stempelstelle-218-talsperre-neustadt",
    "/stempelstelle-220-phillippsgruss",
    "/stempelstelle-26-mönchsbuche",
    "/stempelstelle-28-steinerne-renne",
    "/stempelstelle-29-elverstein",
    "/stempelstelle-37-schaubergwerk-buechenberg",
    "/stempelstelle-43-hohe-tuer",
    "/stempelstelle-47-oberharzblick",
    "/stempelstelle-47-oberharzblick-am-buchenberg",
    "/stempelstelle-52-trageburg",
    "/stempelstelle-54-rotesteine",
    "/stempelstelle-55-wuestung-selkenfelde",
    "/stempelstelle-56-rappbodeblick",
    "/stempelstelle-6-obere-ilsefaelle",
    "/stempelstelle-60-harzkoehlerei-stemberghaus",
    "/stempelstelle-60-stemberghaus",
    "/stempelstelle-61-grauwacke-rieder",
    "/stempelstelle-61-harzer-grauwacke",
    "/stempelstelle-62-talsperre-wendefurth",
    "/stempelstelle-63-schoenburg",
    "/stempelstelle-63-schoeneburg",
    "/stempelstelle-63-schoneburg",
    "/stempelstelle-64-boeser-kleef",
    "/stempelstelle-66-wilhelmsblick",
    "/stempelstelle-67-weisser-hirsch",
    "/stempelstelle-68-la-viershoehe",
    "/stempelstelle-68-weisser-hirsch-aussichtspunkt",
    "/stempelstelle-69-sonnenklippe",
    "/stempelstelle-7-plessenburg",
    "/stempelstelle-70-prinzensicht",
    "/stempelstelle-71-grossvaterfelsen",
    "/stempelstelle-71-rosstrappe",
    "/stempelstelle-72-rosstrappe",
    "/stempelstelle-72-wilhelmsblick",
    "/stempelstelle-74-hamburger-wappen",
    "/stempelstelle-75-heidelberg",
    "/stempelstelle-76-gasthaus-grossvater",
    "/stempelstelle-76-hamburger-wappen",
    "/stempelstelle-77-teufelsmauer-timmenrode",
    "/stempelstelle-78-obere-muehle-blankenburg",
    "/stempelstelle-79-otto-ebert-bruecke",
    "/stempelstelle-8-oberfoerster-koch-denkmal",
    "/stempelstelle-82-regensteinmuehle",
    "/stempelstelle-84-altenburg-heimburg",
    "/stempelstelle-86-bisongehege-stangerode",
    "/stempelstelle-88-hoher-kleef",
    "/stempelstelle-90-maltermeisterturm",
    "/stempelstelle-92-poppenberg",
    "/stempelstelle-92-poppenbergturm",
    "/stempelstelle-93-drei-taelerblick",
    "/stempelstelle-98-burgruine-hohnstein",
    "/stempelstelle-99-dampflokstieg-lok",
];


replaceBadLinks();