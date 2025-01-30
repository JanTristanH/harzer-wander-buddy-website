import fs from 'fs';

const extractLinksFromSitemap = (sitemapPath) => {
    const sitemap = fs.readFileSync(sitemapPath, 'utf8');
    const links = sitemap.match(/<loc>(.*?)<\/loc>/g).map((link) => link.replace(/<\/?loc>/g, ''));
    return links;
    }

export default extractLinksFromSitemap;