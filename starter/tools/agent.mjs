// Connects the chat in the panel's Build tab to opencode, a coding agent, when it's installed on
// this computer. tools/dev.mjs starts it in this folder and passes messages to it, so there's
// nothing else to run. Without opencode, the panel shows the box for notes to your coding agent.
//
// The limits below only apply here, to messages from the panel. The people and pages behind those
// messages aren't always developers or trustworthy: text from a real website reaches the agent, and
// a site could hide instructions in it. So the agent can read this folder and change the adapter,
// and nothing else: no shell and no web. Running opencode yourself in this folder has no such limits.
import { spawn, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const LIMITS = {
  '*': 'deny',
  read: 'allow',
  list: 'allow',
  grep: 'allow',
  glob: 'allow',
  // Patterns are matched against the path from the top of the project, and a downloaded folder has
  // no git repository to be that top, so each one has to match the end of a longer path.
  edit: { '*': 'deny', '*adapter.js': 'allow', '*fix.json': 'allow' },
  external_directory: 'deny',
};

const WINDOWS = process.platform === 'win32';
// Adds what the person didn't write to a message. read() cuts it off again.
const ADDED = '\n\n[From the panel]\n';
const DOING = { read: 'Reading', list: 'Looking through the folder', grep: 'Looking through the folder', glob: 'Looking through the folder', edit: 'Changing', write: 'Changing' };

// The workshop's Gemini key, from the environment or a line in this folder's .env file.
function setting(root, name) {
  if (process.env[name]) return process.env[name];
  try {
    const line = fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/).find((l) => l.startsWith(name + '='));
    return line ? line.slice(name.length + 1).trim() : '';
  } catch (e) { return ''; }
}

function config(root) {
  const key = setting(root, 'GEMINI_API_KEY');
  const out = { permission: LIMITS };
  // Gemini needs opencode's own Google connection. Through its OpenAI-style one, Gemini refuses
  // every tool call, because the signature it adds to each one gets lost on the way back.
  if (key) {
    const url = setting(root, 'GEMINI_BASE_URL');
    out.model = 'google/gemini-3.5-flash';
    out.provider = { google: { options: { apiKey: key, ...(url ? { baseURL: url } : {}) }, models: { 'gemini-3.5-flash': { name: 'Gemini' } } } };
  }
  return out;
}

function plainError(e) {
  const text = String((e && (e.data && e.data.message)) || (e && e.message) || e);
  if (/api.?key|unauthori[sz]ed|permission.?denied|\b40[13]\b|no.+(provider|model)|model.+not found/i.test(text)) {
    return 'Opencode has no AI model it can use. In this folder, run opencode once and choose a model with /connect, or put the workshop’s key in .env as GEMINI_API_KEY=…, then start npm run dev again.';
  }
  if (/quota|rate.?limit|\b429\b|resource.?exhausted|overloaded/i.test(text)) {
    return 'The AI model is at its limit right now. Wait a minute and send it again. If it keeps happening, tell one of the organizers.';
  }
  if (/EPROTO|ECONN|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|fetch failed|socket|TLS|network/i.test(text)) {
    return 'Opencode couldn’t reach the AI model. Check the internet connection and send it again.';
  }
  return 'Opencode ran into a problem: ' + text.slice(0, 300);
}

export function createAgent(root) {
  const found = spawnSync('opencode', ['--version'], { shell: WINDOWS, stdio: 'ignore' }).status === 0;
  const password = crypto.randomBytes(24).toString('hex');
  const auth = 'Basic ' + Buffer.from('opencode:' + password).toString('base64');
  let child = null, base = '', session = null, starting = null, failure = '';

  function launch() {
    return new Promise((done, fail) => {
      const env = { ...process.env, OPENCODE_SERVER_PASSWORD: password, OPENCODE_CONFIG_CONTENT: JSON.stringify(config(root)),
        // Opencode also reads ~/.claude/CLAUDE.md, a person's private notes, and would send it to
        // the shared model with every message.
        OPENCODE_DISABLE_CLAUDE_CODE: '1' };
      if (setting(root, 'GEMINI_API_KEY')) delete env.ANTHROPIC_API_KEY; // nothing else gets billed
      child = spawn('opencode', ['serve', '--hostname', '127.0.0.1', '--port', '0'], { cwd: root, env, shell: WINDOWS, stdio: ['ignore', 'pipe', 'pipe'] });
      let said = '';
      const read = (d) => {
        said += d;
        const m = said.match(/listening on (http:\/\/127\.0\.0\.1:\d+)/);
        if (m) { base = m[1]; done(); }
      };
      child.stdout.on('data', read);
      child.stderr.on('data', read);
      child.once('error', fail);
      child.once('exit', () => {
        child = null; base = ''; session = null;
        fail(new Error('it stopped while starting: ' + said.slice(-200)));
      });
    });
  }

  // The first start on a computer takes about 20 seconds, while opencode sets itself up.
  function ready() {
    if (base) return Promise.resolve();
    starting = starting || launch().then(() => { failure = ''; }, (e) => { failure = plainError(e); throw e; }).finally(() => { starting = null; });
    return starting;
  }

  async function api(method, url, body) {
    const r = await fetch(base + url, { method, signal: AbortSignal.timeout(15000),
      headers: { authorization: auth, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    if (!r.ok) throw new Error('opencode answered ' + r.status);
    const text = await r.text();
    return text ? JSON.parse(text) : null;
  }

  function message(m) {
    const parts = m.parts || [];
    const text = parts.filter((p) => p.type === 'text' && !p.synthetic).map((p) => p.text).join('\n').trim();
    if (m.info.role === 'user') return { who: 'you', text: text.split(ADDED)[0] };
    return { who: 'opencode', text, error: m.info.error ? plainError(m.info.error) : '' };
  }

  return {
    name: found ? 'opencode' : null,
    warm() { if (found) ready().catch(() => {}); },

    async send({ text, url, snapshot, pointedAt, pointedAtLabel, error }) {
      await ready();
      if (!session) session = (await api('POST', '/session', { title: 'From the panel' })).id;
      fs.writeFileSync(path.join(root, 'page.html'), String(snapshot || '').slice(0, 200000));
      let added = `This came from the chat in the panel, so follow "Messages from the panel" in AGENTS.md. They are on ${url}. A shortened copy of that page is in page.html in this folder.`;
      if (pointedAt) added += `\nThey pointed at ${pointedAtLabel || 'this'}:\n\n\`\`\`html\n${String(pointedAt).slice(0, 3000)}\n\`\`\``;
      if (error) added += `\nThe panel shows this error from adapter.js: ${error}`;
      await api('POST', `/session/${session}/prompt_async`, { parts: [{ type: 'text', text: text + ADDED + added }] });
    },

    async read() {
      if (!found) return { messages: [], busy: false };
      if (!session) return { messages: failure ? [{ who: 'opencode', text: '', error: failure }] : [], busy: false, starting: !!starting };
      const [status, list] = await Promise.all([api('GET', '/session/status'), api('GET', `/session/${session}/message`)]);
      const now = status && status[session];
      const running = list.flatMap((m) => m.parts || []).filter((p) => p.type === 'tool' && p.state && p.state.status === 'running').pop();
      return {
        messages: list.map(message).filter((m) => m.text || m.error),
        busy: !!now && now.type !== 'idle',
        doing: running ? DOING[running.tool] || 'Working' : '',
      };
    },

    async stop() { if (session) await api('POST', `/session/${session}/abort`, {}); },

    // Waits until opencode has gone, so it isn't left running after npm run dev stops. It doesn't
    // always stop when asked, for example in the middle of a request.
    close() {
      const going = child;
      if (!going) return Promise.resolve();
      if (WINDOWS) { spawnSync('taskkill', ['/pid', String(going.pid), '/t', '/f'], { stdio: 'ignore' }); return Promise.resolve(); }
      return new Promise((done) => {
        going.once('exit', done);
        going.kill();
        setTimeout(() => { going.kill('SIGKILL'); done(); }, 1500);
      });
    },
  };
}
