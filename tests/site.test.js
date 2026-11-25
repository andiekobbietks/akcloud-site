const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
const js = scriptMatch && scriptMatch[1];

test('inline page JavaScript parses', () => {
  assert.ok(js, 'index.html must contain its page script');
  assert.doesNotThrow(() => new vm.Script(js, { filename: 'index.html' }));
});

test('all HTML IDs are unique', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert.deepEqual([...new Set(duplicates)], []);
});

test('internal navigation links resolve to an element', () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  const fragments = [...html.matchAll(/href="#([^"]+)"/g)].map(match => match[1]);
  assert.ok(fragments.length > 0);
  for (const fragment of fragments) assert.ok(ids.has(fragment), 'missing #' + fragment);
});

test('local image references exist', () => {
  const images = [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]);
  assert.ok(images.length > 0);
  for (const src of images) assert.ok(fs.existsSync(path.join(root, src)), 'missing image: ' + src);
});

test('consultation form is a real Netlify form with matching static detection fields', () => {
  assert.match(html, /<form name="consultation"[^>]*data-netlify="true"/);
  assert.match(html, /name="form-name" value="consultation"/);
  for (const field of ['name', 'email', 'company', 'topic', 'message', 'source']) {
    assert.match(html, new RegExp('name="' + field + '"'), 'missing form field ' + field);
  }
  assert.match(html, /id="lead-submit"/);
  assert.match(html, /response\.ok/);
  assert.match(html, /Your details have not been saved/);
});

test('unconfigured booking does not send visitors to an old Odoo tenant', () => {
  assert.doesNotMatch(html, /andiekobbie\.odoo\.com/);
  assert.match(js, /fetch\('\/api\/get-config'/);
  assert.match(js, /EARLY ACCESS/);
});

test('fake client login is not presented as a working portal', () => {
  assert.doesNotMatch(html, /id="login-overlay"/);
  assert.doesNotMatch(js, /function signIn/);
});

test('booking configuration is opt-in through environment configuration', () => {
  const source = fs.readFileSync(path.join(root, 'netlify/functions/get-config.js'), 'utf8');
  assert.match(source, /process\.env\.BOOKING_URL/);
  assert.match(source, /parsed\.protocol === 'https:'/);
  assert.doesNotMatch(source, /andiekobbie\.odoo\.com/);
});

test('security policy does not contain the old inline comment inside connect-src', () => {
  const toml = fs.readFileSync(path.join(root, 'netlify.toml'), 'utf8');
  assert.match(toml, /connect-src 'self'/);
  assert.doesNotMatch(toml, /connect-src[^\n]*legacy deployment origin/);
});
