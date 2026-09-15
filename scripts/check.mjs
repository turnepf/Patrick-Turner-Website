// Pre-deploy check. Fails (exit 1) if a page references a local file that
// doesn't exist, has an obvious HTML problem, or links to a dead external URL.
// No dependencies; runs on Node 18+. Usage: node scripts/check.mjs
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = 'public';
const problems = [];
const warnings = [];

const pages = readdirSync(ROOT).filter((f) => f.endsWith('.html'));
const external = new Set();

for (const page of pages) {
  const html = readFileSync(join(ROOT, page), 'utf8');
  if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${page}: missing <title>`);
  if (!/<meta name="viewport"/.test(html)) problems.push(`${page}: missing viewport meta tag`);
  for (const tag of ['main', 'section', 'div', 'ul', 'a', 'p', 'header', 'footer', 'nav', 'dl']) {
    const opens = (html.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
    const closes = (html.match(new RegExp(`</${tag}>`, 'g')) || []).length;
    if (opens !== closes) problems.push(`${page}: ${opens} <${tag}> vs ${closes} </${tag}>`);
  }
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, ref] of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    if (ref.startsWith('mailto:')) continue;
    if (ref.startsWith('#')) {
      if (ref.length > 1 && !ids.has(ref.slice(1))) problems.push(`${page}: no element with id for ${ref}`);
    } else if (/^https?:\/\//.test(ref)) {
      if (!/fonts\.(googleapis|gstatic)\.com\/?$|fonts\.googleapis\.com\/css2|patrickturner\.net\/?$/.test(ref)) external.add(ref);
    } else {
      const path = ref.split(/[?#]/)[0];
      const file = path === '/' ? 'index.html' : path.replace(/^\//, '');
      const target = join(ROOT, path.startsWith('/') ? '' : dirname(page), file);
      if (!existsSync(target)) problems.push(`${page}: ${ref} not found in ${ROOT}/`);
    }
  }
}

// External links: only a definite "gone" (404/410) or an unreachable host fails
// the deploy. Sites that block bots (403, 429, 5xx) are reported but allowed.
await Promise.all(
  [...external].map(async (url) => {
    for (const method of ['HEAD', 'GET']) {
      try {
        const res = await fetch(url, {
          method,
          redirect: 'follow',
          signal: AbortSignal.timeout(15000),
          headers: { 'user-agent': 'Mozilla/5.0 (patrickturner.net link check)' },
        });
        if (res.ok) return;
        if (method === 'HEAD' && res.status !== 404 && res.status !== 410) continue;
        if (res.status === 404 || res.status === 410) problems.push(`dead link (${res.status}): ${url}`);
        else warnings.push(`couldn't confirm (${res.status}): ${url}`);
        return;
      } catch (err) {
        if (method === 'GET') problems.push(`unreachable: ${url} (${err.cause?.code || err.name})`);
      }
    }
  }),
);

for (const w of warnings) console.log(`warn  ${w}`);
if (problems.length) {
  for (const p of problems) console.log(`FAIL  ${p}`);
  console.log(`\n${problems.length} problem(s). Not deploying.`);
  process.exit(1);
}
console.log(`ok  ${pages.length} page(s), ${external.size} external link(s) checked`);
