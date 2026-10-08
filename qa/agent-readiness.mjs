// Agent-readiness checks for propfuel.com (Is Agentic / Ora audit items).
// Run: node qa/agent-readiness.mjs [baseUrl]
// Exits non-zero if any REQUIRED check fails. Checks marked INFRA need an edge
// proxy in front of Webflow and are reported but do not fail the run.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const BASE = (process.argv[2] || 'https://www.propfuel.com').replace(/\/$/, '');
const here = path.dirname(fileURLToPath(import.meta.url));
const results = [];
const check = (name, ok, detail, { infra = false } = {}) =>
  results.push({ name, ok, detail, infra });
const bust = () => 'v=' + Date.now();

async function get(url, headers = {}) {
  const res = await fetch(url, { headers, redirect: 'follow' });
  return { status: res.status, headers: res.headers, body: await res.text() };
}

// 1. Homepage content without JavaScript + sequential heading hierarchy
{
  const { status, body } = await get(`${BASE}/?${bust()}`, { Accept: 'text/html' });
  check('homepage returns 200 HTML', status === 200, `status ${status}`);
  const text = body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  check('homepage has 500+ chars of raw-HTML text', text.length >= 500, `${text.length} chars`);
  const levels = [...body.matchAll(/<h([1-6])[\s>]/gi)].map((m) => +m[1]);
  check('homepage has exactly one H1', levels.filter((l) => l === 1).length === 1, `H1 count ${levels.filter((l) => l === 1).length}`);
  const skips = [];
  levels.reduce((prev, l, i) => {
    if (l > prev + 1) skips.push(`h${prev}->h${l} at heading #${i + 1}`);
    return l;
  }, 0);
  check('homepage heading levels never skip', skips.length === 0, skips.join(', ') || 'sequential');
}

// 2. llms.txt (llmstxt.org format) with when-to-use guidance
{
  const { status, headers, body } = await get(`${BASE}/llms.txt?${bust()}`);
  check('/llms.txt returns 200', status === 200, `status ${status}`);
  check('/llms.txt is text/plain or text/markdown', /text\/(plain|markdown)/.test(headers.get('content-type') || ''), headers.get('content-type'));
  const lines = body.split('\n');
  check('llms.txt starts with an H1', /^# \S/.test(lines[0] || ''), lines[0]);
  check('llms.txt has a blockquote summary', lines.some((l) => l.startsWith('> ')), '');
  check('llms.txt has a "When to use" section', /^## When to use/m.test(body), '');
  const repoCopy = fs.readFileSync(path.join(here, '..', 'agent', 'llms.txt'), 'utf8');
  check('served llms.txt matches repo copy (agent/llms.txt)', body.trim() === repoCopy.trim(), body.trim() === repoCopy.trim() ? 'identical' : 'DRIFT: re-upload agent/llms.txt in Webflow > Site settings > SEO > LLMs.txt');
  const links = [...body.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]);
  const bad = [];
  for (const u of links) {
    const r = await fetch(u, { method: 'GET', redirect: 'follow' });
    if (r.status !== 200) bad.push(`${r.status} ${u}`);
  }
  check(`all ${links.length} llms.txt links return 200`, bad.length === 0, bad.join('; ') || 'ok');
}

// 3. 404 status (body format is INFRA)
{
  const { status, headers } = await get(`${BASE}/__agent-404-probe-${Date.now()}`, { Accept: 'text/markdown' });
  check('unknown path returns 404', status === 404, `status ${status}`);
  check('404 returns Markdown body for Accept: text/markdown', /text\/markdown/.test(headers.get('content-type') || ''), headers.get('content-type'), { infra: true });
}

// 4. Markdown content negotiation on the homepage (INFRA)
{
  const md = await get(`${BASE}/?${bust()}`, { Accept: 'text/markdown' });
  const vary = (md.headers.get('vary') || '').toLowerCase();
  check('homepage serves text/markdown for Accept: text/markdown', /text\/markdown/.test(md.headers.get('content-type') || ''), md.headers.get('content-type'), { infra: true });
  check('homepage sends Vary: Accept', vary.split(',').map((s) => s.trim()).includes('accept'), vary || '(none)', { infra: true });
  const html = await get(`${BASE}/?${bust()}`, { Accept: 'text/html' });
  check('homepage still serves HTML for Accept: text/html', /text\/html/.test(html.headers.get('content-type') || ''), html.headers.get('content-type'));
}

let failed = 0;
for (const r of results) {
  const tag = r.ok ? 'PASS' : r.infra ? 'INFRA' : 'FAIL';
  if (!r.ok && !r.infra) failed++;
  console.log(`${tag.padEnd(5)} ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
}
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} passed, ${failed} required failures`);
process.exit(failed ? 1 : 0);
