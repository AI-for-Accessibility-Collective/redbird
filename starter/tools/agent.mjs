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
  read: { '*': 'allow', '*.env': 'deny', '*.env.*': 'deny' },
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

// Everyone uses the workshop's Gemini key, through the store's /api/gemini, so there's nothing to set
// up and the key isn't on this computer. A GEMINI_API_KEY in the environment goes straight to Google
// instead. It isn't read from a file here, since the agent can read files and a page can ask it to.
function config(store) {
  const key = process.env.GEMINI_API_KEY;
  const url = process.env.GEMINI_BASE_URL || (key ? '' : store + '/api/gemini');
  // Gemini needs opencode's own Google connection. Through its OpenAI-style one, Gemini refuses
  // every tool call, because the signature it adds to each one gets lost on the way back.
  // A round of chat is many short steps, and this model took about a quarter as long on each as
  // Gemini 4 Argon, which is stronger but ran past four minutes on a first round.
  return {
    permission: LIMITS,
    enabled_providers: ['google'],
    model: 'google/gemini-3.6-flash',
    small_model: 'google/gemini-3.6-flash',
    provider: { google: { options: { apiKey: key || 'kept-on-the-server', ...(url ? { baseURL: url } : {}) }, models: { 'gemini-3.6-flash': { name: 'Gemini' } } } },
  };
}

const DROPPED = /EPROTO|ECONN|ETIMEDOUT|EAI_AGAIN|fetch failed|socket|TLS/i;

function plainError(e) {
  const text = String((e && (e.data && e.data.message)) || (e && e.message) || e);
  if (/api.?key|unauthori[sz]ed|permission.?denied|\b40[13]\b|no.+(provider|model)|model.+not found/i.test(text)) {
    return 'The AI model turned this down. Tell one of the organizers.';
  }
  if (/quota|rate.?limit|\b429\b|resource.?exhausted|overloaded/i.test(text)) {
    return 'The AI model is at its limit right now. Wait a minute and send it again. If it keeps happening, tell one of the organizers.';
  }
  if (DROPPED.test(text) || /ENOTFOUND|network/i.test(text)) {
    return 'Opencode couldn’t reach the AI model. Check the internet connection and send it again.';
  }
  return 'Opencode ran into a problem: ' + text.slice(0, 300);
}

export function createAgent(root, store) {
  const found = spawnSync('opencode', ['--version'], { shell: WINDOWS, stdio: 'ignore' }).status === 0;
  const password = crypto.randomBytes(24).toString('hex');
  const auth = 'Basic ' + Buffer.from('opencode:' + password).toString('base64');
  let child = null, base = '', session = null, starting = null, failure = '', queue = Promise.resolve(), waiting = 0, last = [], earlier = [], retried = new Set();

  function launch() {
    return new Promise((done, fail) => {
      const env = { ...process.env, OPENCODE_SERVER_PASSWORD: password, OPENCODE_CONFIG_CONTENT: JSON.stringify(config(store)),
        // Opencode also reads ~/.claude/CLAUDE.md, a person's private notes, and would send it to
        // the shared model with every message.
        OPENCODE_DISABLE_CLAUDE_CODE: '1' };
      delete env.ANTHROPIC_API_KEY; // nothing else gets billed
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
        // A new start can't pick up this chat, but the person can still read it.
        if (base) { failure = 'Opencode stopped. Send your message again. It won’t remember this chat.'; earlier = last; }
        child = null; base = ''; session = null;
        fail(new Error('it stopped while starting: ' + said.slice(-200)));
      });
      setTimeout(() => { if (!base) { child?.kill(); fail(new Error('it took too long to start')); } }, 90000);
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
    return { who: 'opencode', text, error: m.info.error && !retried.has(m.info.id) ? plainError(m.info.error) : '' };
  }

  async function deliver({ text, url, snapshot, pointedAt, pointedAtLabel, error }) {
    await ready();
    if (!session) session = (await api('POST', '/session', { title: 'From the panel' })).id;
    fs.writeFileSync(path.join(root, 'page.html'), String(snapshot || '').slice(0, 200000));
    let added = `This came from the chat in the panel, so follow "Messages from the panel" in AGENTS.md. They are on ${url}. A shortened copy of that page is in page.html in this folder.`;
    if (pointedAt) added += `\nThey pointed at ${pointedAtLabel || 'this'}:\n\n\`\`\`html\n${String(pointedAt).slice(0, 3000)}\n\`\`\``;
    if (error) added += `\nThe panel shows this error from adapter.js: ${error}`;
    await api('POST', `/session/${session}/prompt_async`, { parts: [{ type: 'text', text: text + ADDED + added }] });
  }

  return {
    name: found ? 'opencode' : null,
    warm() { if (found) ready().catch(() => {}); },

    // One at a time, so two sends can't each start a chat and lose the first one's reply.
    send(note) {
      waiting++;
      failure = '';
      queue = queue.then(() => deliver(note)).catch((e) => { failure = plainError(e); }).finally(() => { waiting--; });
    },
    async read() {
      if (!found) return { messages: [], busy: false };
      const failed = failure ? [{ who: 'opencode', text: '', error: failure }] : [];
      if (!session) return { messages: last.concat(failed), busy: waiting > 0, starting: !!starting };
      const [status, list] = await Promise.all([api('GET', '/session/status'), api('GET', `/session/${session}/message`)]);
      const now = status && status[session];
      const running = list.flatMap((m) => m.parts || []).filter((p) => p.type === 'tool' && p.state && p.state.status === 'running').pop();
      // About one model call in 150 loses its connection, which would otherwise end a round of about
      // 15 calls with an error. Carries on by itself, once for each time it happens.
      const end = list[list.length - 1];
      let again = false;
      if ((!now || now.type === 'idle') && end && end.info.error && !retried.has(end.info.id) && DROPPED.test(String(end.info.error.data?.message || end.info.error.message || ''))) {
        retried.add(end.info.id);
        await api('POST', `/session/${session}/prompt_async`, { parts: [{ type: 'text', text: ADDED + 'The connection to the model dropped. Carry on from where you stopped.' }] });
        again = true;
      }
      last = earlier.concat(list.map(message).filter((m) => m.text || m.error));
      return {
        messages: last.concat(failed),
        busy: again || waiting > 0 || (!!now && now.type !== 'idle'),
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
