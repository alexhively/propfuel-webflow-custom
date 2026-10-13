import { readFileSync, existsSync, statSync, mkdtempSync } from 'fs';
import { execSync } from 'child_process';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

// The live site loads this repo's files from GitHub Pages (= origin/main).
// QA serves those URLs from a local folder instead: the working tree (what's being pushed), or an
// export of origin/main (the baseline). Both sides go through the same path, so load timing matches.
export const PAGES_PREFIX = 'https://alexhively.github.io/propfuel-webflow-custom/';
export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Hosts a page needs to render. Everything else (analytics, chat, pixels) is blocked during QA:
// it adds noise to screenshots and would count QA runs as real visits.
const RENDER_HOSTS = [
  'propfuel-v2.webflow.io', 'website-files.com', 'webflow.com', 'd3e54v103j8qbb.cloudfront.net',
  'fonts.googleapis.com', 'fonts.gstatic.com', 'alexhively.github.io',
];

const MIME = {
  '.js': 'application/javascript', '.mjs': 'application/javascript',
  '.json': 'application/json', '.css': 'text/css', '.html': 'text/html',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif',
  '.pdf': 'application/pdf', '.txt': 'text/plain',
};

let mainExport = null;
// A one-off export of origin/main (what GitHub Pages serves), the "before" side of every check.
export function exportMain(ref = process.env.QA_BASE_REF || 'origin/main') {
  if (mainExport) return mainExport;
  const dir = mkdtempSync(path.join(os.tmpdir(), 'pf-qa-main-'));
  execSync(`git -C "${REPO_ROOT}" archive ${ref} | tar -x -C "${dir}"`, { stdio: ['ignore', 'ignore', 'inherit'] });
  mainExport = dir;
  return dir;
}

function allowed(host) {
  return RENDER_HOSTS.some(h => host === h || host.endsWith('.' + h));
}

// Call before page.goto(). root: folder to serve the repo's files from.
export async function serveRepoFiles(page, root) {
  await page.setRequestInterception(true);
  page.on('request', req => {
    const url = req.url();
    if (url.startsWith('data:') || url.startsWith('blob:')) return req.continue();
    let host;
    try { host = new URL(url).hostname; } catch { return req.continue(); }
    if (!allowed(host)) return req.abort('blockedbyclient');
    if (!url.startsWith(PAGES_PREFIX)) return req.continue();
    const rel = decodeURIComponent(new URL(url).pathname.replace('/propfuel-webflow-custom/', ''));
    const file = path.resolve(root, rel);
    if (!file.startsWith(root + path.sep) || !existsSync(file) || !statSync(file).isFile()) {
      return req.respond({ status: 404, headers: { 'Access-Control-Allow-Origin': '*' }, body: 'not in this version' });
    }
    req.respond({
      status: 200,
      contentType: MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' },
      body: readFileSync(file),
    });
  });
}

// side: 'push' (working tree) or 'main' (origin/main export).
export async function prepareSide(page, side) {
  await serveRepoFiles(page, side === 'push' ? REPO_ROOT : exportMain());
}
