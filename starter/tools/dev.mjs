// Serves the Redbird store on this computer with your adapter.js on it, and runs the adapter again
// each time you save the file.
//
//   npm run dev              then open the address it prints
//   npm run dev -- 5180      use another port (PORT=5180 works too)
//
// Pages, photos and the store's AI come from the live store, so there is nothing else to download
// and nothing to install. Only adapter.js, fix.json and feedback.md come from this folder.
// Needs Node 18 or newer.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const STORE = (process.env.REDBIRD || 'https://redbird-workshop.vercel.app').replace(/\/$/, '');

// Your toolkit, if you want this folder's adapter to show up in its developer console (as part of
// Redbird demo) and to shop as your toolkit profile. Copy the default token from the console:
//
//   TOOLKIT_URL=http://localhost:8080 TOOLKIT_TOKEN=aat_… npm run dev
//
// The token only goes to the store pages this server serves on your own computer.
const TOOLKIT = process.env.TOOLKIT_URL && process.env.TOOLKIT_TOKEN
  ? { url: process.env.TOOLKIT_URL.replace(/\/+$/, ''), token: process.env.TOOLKIT_TOKEN }
  : null;

// What the store's pages are told, so the workshop panel loads adapter.js from here.
const LOCAL = { adapter: '/__rb/adapter.js', events: '/__rb/events', feedback: '/__rb/feedback', fix: '/__rb/fix.json', store: STORE, toolkit: TOOLKIT };

export function readFix() {
  let text;
  try { text = fs.readFileSync(path.join(ROOT, 'fix.json'), 'utf8'); } catch (e) { return {}; }
  try { return JSON.parse(text); } catch (e) {
    console.error(`fix.json isn't valid JSON (${e.message}), so it's being ignored. Fix it and run this again.`);
    return {};
  }
}

// The store page to open, with the adapter on: the page in fix.json, plus any toolkit adapters it uses.
export function startPath(fix = readFix()) {
  const page = fix.page || '/product?id=rb-20w-usbc-charger';
  const q = new URL(page, 'http://x').searchParams;
  const toolkit = (fix.toolkitAdapters || []).map((a) => a.id).filter(Boolean);
  q.set('try', ['local', ...toolkit].join(','));
  q.set('workshop', 'on');
  if ((fix.issues || []).length) q.set('issues', fix.issues.join(','));
  return new URL(page, 'http://x').pathname + '?' + q.toString().replace(/%2C/g, ',');
}

// Photos, fonts and the video are big and never change, so each is fetched from the store once.
// Pages and scripts come fresh every time, so an update to the store shows up without a restart.
const cache = new Map();
const PASS = ['content-type', 'content-range', 'accept-ranges', 'last-modified', 'etag'];

async function proxy(req, res) {
  const url = STORE + req.url;
  const ranged = !!req.headers.range;
  const key = req.method + ' ' + req.url;
  if (!ranged && cache.has(key)) return send(res, cache.get(key));
  let r;
  try {
    r = await fetch(url, {
      method: req.method,
      redirect: 'manual',
      headers: { 'user-agent': 'redbird-starter', ...(ranged ? { range: req.headers.range } : {}) },
    });
  } catch (e) {
    return send(res, { status: 502, headers: { 'content-type': 'text/plain; charset=utf-8' }, body: Buffer.from('Couldn’t reach the store at ' + STORE + '. Check the internet connection.\n') });
  }
  const headers = {};
  for (const h of PASS) if (r.headers.get(h)) headers[h] = r.headers.get(h);
  const loc = r.headers.get('location');
  if (loc) headers.location = loc.replace(STORE, '') || '/';
  let body = Buffer.from(await r.arrayBuffer());
  const html = /text\/html/.test(headers['content-type'] || '');
  if (html) {
    // The panel's loader reads RB_LOCAL, so it has to come before any of the store's scripts.
    const tag = '<script>window.RB_LOCAL = ' + JSON.stringify(LOCAL) + ';</script>';
    const text = body.toString('utf8');
    body = Buffer.from(/<head[^>]*>/i.test(text) ? text.replace(/<head[^>]*>/i, (m) => m + tag) : tag + text);
    headers['cache-control'] = 'no-store';
  }
  const out = { status: r.status, headers, body };
  if (/^(image|font|video|audio)\//.test(headers['content-type'] || '') && !ranged && r.status === 200 && req.method === 'GET' && body.length < 8e6) cache.set(key, out);
  send(res, out);
}

function send(res, { status, headers, body }) {
  res.writeHead(status, { ...headers, 'content-length': body.length });
  res.end(body);
}

// The store's AI (rewriting text, describing photos) runs on the live store, which holds the key.
async function ai(req, res) {
  const body = await readBody(req);
  try {
    const r = await fetch(STORE + '/api/ai', { method: 'POST', headers: { 'content-type': 'application/json', 'user-agent': 'redbird-starter' }, body });
    send(res, { status: r.status, headers: { 'content-type': 'application/json' }, body: Buffer.from(await r.arrayBuffer()) });
  } catch (e) {
    send(res, { status: 502, headers: { 'content-type': 'application/json' }, body: Buffer.from('{"error":"couldn’t reach the store’s AI"}') });
  }
}

function readBody(req) {
  return new Promise((done) => {
    const parts = [];
    req.on('data', (c) => parts.push(c));
    req.on('end', () => done(Buffer.concat(parts)));
  });
}

function file(res, name, type) {
  fs.readFile(path.join(ROOT, name), (err, body) => {
    if (err) return send(res, { status: 404, headers: { 'content-type': 'text/plain' }, body: Buffer.from(name + ' is missing from the folder\n') });
    send(res, { status: 200, headers: { 'content-type': type, 'cache-control': 'no-store' }, body });
  });
}

// "Add note for the coding agent" in the panel adds a note to feedback.md, with the page it was on and
// what the person pointed at.
async function feedback(req, res) {
  let note = {};
  try { note = JSON.parse((await readBody(req)).toString('utf8')); } catch (e) {}
  const text = String(note.text || '').trim();
  if (!text) return send(res, { status: 400, headers: { 'content-type': 'application/json' }, body: Buffer.from('{"error":"empty note"}') });
  const when = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  let md = `\n## ${when}${note.page ? ', on ' + note.page : ''}\n\n${text}\n`;
  if (note.pointedAt) md += `\nThey pointed at ${note.pointedAtLabel || 'this'}:\n\n\`\`\`html\n${String(note.pointedAt).slice(0, 3000)}\n\`\`\`\n`;
  fs.appendFileSync(path.join(ROOT, 'feedback.md'), md);
  send(res, { status: 200, headers: { 'content-type': 'application/json' }, body: Buffer.from('{"ok":true}') });
}

// Tells open store pages when adapter.js changes. Editors often save by replacing the file, so this
// watches the folder rather than the file.
const listeners = new Set();
let timer = null;
function watch() {
  fs.watch(ROOT, (event, name) => {
    if (name !== 'adapter.js') return;
    clearTimeout(timer);
    timer = setTimeout(() => { for (const res of listeners) res.write('data: adapter.js\n\n'); }, 150);
  });
}
function events(req, res) {
  res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' });
  res.write(': connected\n\n');
  listeners.add(res);
  req.on('close', () => listeners.delete(res));
}

export function start(port = Number(process.env.PORT) || 5179, { live = true } = {}) {
  const server = http.createServer((req, res) => {
    handle(req, res).catch((e) => {
      console.error('Couldn’t answer ' + req.url + ': ' + e.message);
      if (!res.headersSent) send(res, { status: 502, headers: { 'content-type': 'text/plain; charset=utf-8' }, body: Buffer.from('Something went wrong getting this from the store. Reload the page.\n') });
      else res.end();
    });
  });
  if (live) watch();
  return new Promise((done, fail) => {
    server.once('error', fail);
    server.listen(port, '127.0.0.1', () => done(server));
  });
}

// Every request goes through here. Anything that goes wrong with one request is answered with an
// error page above, so the server keeps running.
async function handle(req, res) {
  const p = req.url.split('?')[0];
  if (p === LOCAL.adapter) return file(res, 'adapter.js', 'text/javascript; charset=utf-8');
  if (p === LOCAL.fix) return file(res, 'fix.json', 'application/json; charset=utf-8');
  if (p === LOCAL.events) return events(req, res);
  if (p === LOCAL.feedback && req.method === 'POST') return feedback(req, res);
  if (p === '/api/ai' && req.method === 'POST') return ai(req, res);
  if (req.method === 'GET' || req.method === 'HEAD') return proxy(req, res);
  send(res, { status: 405, headers: { 'content-type': 'text/plain' }, body: Buffer.from('Not here\n') });
}

// Run directly (npm run dev), not imported by the tests. Both paths go through realpath, since
// Node resolves links in import.meta.url, and Windows can differ in the drive letter's case.
function same(a, b) { try { return fs.realpathSync(a).toLowerCase() === fs.realpathSync(b).toLowerCase(); } catch (e) { return false; } }
if (process.argv[1] && same(process.argv[1], fileURLToPath(import.meta.url))) {
  const port = Number(process.argv[2]) || Number(process.env.PORT) || 5179;
  process.on('unhandledRejection', (e) => console.error('Something went wrong:', e && e.message ? e.message : e));
  start(port).then(() => {
    console.log(`Redbird is running with your adapter.js at:\n\n  http://localhost:${port}${startPath()}\n`);
    if (TOOLKIT) console.log(`It connects to your toolkit at ${TOOLKIT.url}: look for Redbird demo under Apps in the developer console.\n`);
    console.log('Save adapter.js and the page runs it again. Press Ctrl+C to stop.');
  }, (e) => {
    if (e.code === 'EADDRINUSE') console.error(`Port ${port} is already in use. Maybe the store is already running here? Or try npm run dev -- ${port + 1}`);
    else console.error(e);
    process.exit(1);
  });
}
