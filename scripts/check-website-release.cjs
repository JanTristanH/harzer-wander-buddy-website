const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const appUrl = 'https://app.harzer-wander-buddy.de';
const config = read('_config.yml');
assert.match(config, /legal_vat_id: 'DE462683424'/);
assert.match(config, /app_url: 'https:\/\/app\.harzer-wander-buddy\.de'/);
assert.equal((config.match(/^exclude:/gm) || []).length, 1, 'Use one effective exclusion list');
const navigation = read('_data/navigation.yml');
assert.ok(navigation.includes(appUrl));
const layout = read('_layouts/default.html');
assert.ok(layout.includes("item.url contains '://'"), 'External menu links must not receive the site base URL');
assert.ok(layout.includes('href="{{ site.app_url }}">App öffnen'));
const page = read('_pages/app.md');
assert.ok(page.includes('href="{{ site.app_url }}">App jetzt öffnen'));
const redirect = read('_pages/redirects/app-waitlist.html');
assert.match(redirect, /permalink: \/app-waitlist/);
assert.match(redirect, /http-equiv="refresh" content="0; url={{ site.app_url }}"/);
for (const file of ['_pages/tally-form.md', 'assets/js/external-form.js', 'scripts/check-external-form.cjs']) {
  assert.ok(!fs.existsSync(path.join(root, file)), file + ' must be removed');
}
for (const file of ['_config.yml', '_data/navigation.yml', '_layouts/default.html', '_layouts/share.html', '_pages/app.md', '_pages/privacy-policy.md', 'assets/js/share-page.js', 'llms.txt']) {
  assert.ok(!/tally\.so|Warteliste|app-waitlist/.test(read(file)), file + ' must not advertise the former waitlist');
}
const contact = read('_pages/contact.md');
assert.ok(contact.includes('href="mailto:{{ site.email }}"'), 'Contact must provide the email alternative');
assert.ok(!/<(form|input|textarea)( |>)/i.test(contact), 'Contact must not submit to a form service');
for (const file of ['_config.yml', '_pages/contact.md', '_pages/privacy-policy.md', '_pages/impressum.md']) {
  assert.ok(!/formspree/i.test(read(file)), file + ' must not use or describe Formspree');
}
const shareScript = read('assets/js/share-page.js');
function runShare(kind, query, mobile = false) {
  const nodes = Object.fromEntries(['state', 'chip', 'open', 'fineprint'].map(key => [key, {}]));
  const listeners = {};
  const timers = [];
  const location = { href: 'https://www.harzer-wander-buddy.de/share/?' + query, search: '?' + query };
  vm.runInNewContext(shareScript, {
    URL, URLSearchParams,
    document: { body: { dataset: { shareKind: kind } }, querySelector: selector => nodes[selector.replace('[data-share-', '').replace(']', '')] },
    navigator: { userAgent: mobile ? 'iPhone' : 'Desktop' },
    window: { location, setTimeout: callback => timers.push(callback), addEventListener: (event, callback) => { listeners[event] = callback; } },
  });
  listeners.load();
  return { nodes, timers, location };
}
let result = runShare('generic', '');
assert.equal(result.nodes.open.href, appUrl);
assert.equal(result.nodes.open.textContent, 'Web-App öffnen');
result = runShare('stamp', 'id=bad%2Fid');
assert.equal(result.nodes.open.href, appUrl, 'Unsafe IDs must fall back to the web app');
result = runShare('stamp', 'id=42', true);
assert.equal(result.nodes.open.href, 'harzerwanderbuddyapp://stamps/42', 'Preserve existing native share destinations');
assert.equal(result.timers.length, 1);
result.timers[0]();
assert.equal(result.location.href, 'harzerwanderbuddyapp://stamps/42');
console.log('Website legal configuration, app links, legacy redirect and share fallback checks passed.');
