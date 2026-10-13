const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const listeners = {};
const load = { hidden: false, addEventListener: (event, fn) => { listeners.load = fn; },
  setAttribute: (_name, value) => { load.expanded = value; }, focus: () => { load.focused = true; } };
const close = { hidden: true, addEventListener: (event, fn) => { listeners.close = fn; },
  focus: () => { close.focused = true; } };
const content = { children: [], querySelector: () => content.children[0] || null,
  appendChild: frame => content.children.push(frame), replaceChildren: () => { content.children = []; } };
const section = { querySelector: selector => ({ '[data-external-form-load]': load,
  '[data-external-form-close]': close, '[data-external-form-content]': content })[selector] };
let framesCreated = 0;
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/js/external-form.js'), 'utf8'), {
  document: { querySelectorAll: () => [section], createElement: tag => {
    assert.equal(tag, 'iframe'); framesCreated++; return { style: {} };
  } }
});
assert.equal(framesCreated, 0, 'No third-party frame before explicit activation');
listeners.load(); listeners.load();
assert.equal(framesCreated, 1, 'Repeated activation must not create duplicate frames');
assert.match(content.children[0].src, /^https:\/\/tally\.so\/embed\/wbYe7Z\?/);
assert.equal(content.children[0].referrerPolicy, 'no-referrer');
assert.equal(load.hidden, true); assert.equal(close.hidden, false); assert.equal(load.expanded, 'true');
listeners.close();
assert.equal(content.children.length, 0); assert.equal(load.hidden, false);
assert.equal(close.hidden, true); assert.equal(load.expanded, 'false'); assert.equal(load.focused, true);
listeners.load(); assert.equal(framesCreated, 2, 'Loading again requires another click');
const page = fs.readFileSync(path.join(root, '_pages/tally-form.md'), 'utf8');
assert.ok(!/<iframe\b|tally\.so\/widgets\/embed\.js/.test(page), 'HTML must not start loading Tally');
console.log('External form activation, duplicate protection and closing checks passed.');
