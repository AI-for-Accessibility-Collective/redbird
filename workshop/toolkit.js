// Connects this Redbird tab to an AI for Accessibility toolkit as the app
// "Redbird demo", using the toolkit's Adapter MCP SDK.
//
// What that gives the workshop:
//   - The tab shows up in the toolkit's developer console under Apps, grouped
//     with every other Redbird tab (and starter folder) on the same account.
//   - The console, or a coding agent holding the same token, can turn
//     Redbird's adapters on and off, read whether they're on, and undo a
//     change, all through the standard MCP tools the SDK provides.
//
// The SDK is loaded from the toolkit itself (<toolkit>/sdk/adapter-mcp.js), so
// Redbird always speaks the version of the contract that toolkit understands.
// loader.js hands over a small bridge to its own adapter switches; nothing
// here loads or runs adapters by itself, and the panel stays in charge.

// The adapters Redbird exports: the workshop examples, the fix-this-page
// button, and whatever the person built. The rest of the panel's library
// stays internal (it runs here, but no one outside can call it).
const EXPORTED = ['real-arrival-dates', 'swatch-names', 'calm-urgency', 'reading-level', 'pause-moving-things', 'toolkit-fixes', 'mine', 'local'];
const TITLES = {
  'real-arrival-dates': 'Real arrival dates',
  'swatch-names': 'Swatch names',
  'calm-urgency': 'Calm urgency',
  'reading-level': 'Reading level',
  'pause-moving-things': 'Pause moving things',
  'toolkit-fixes': 'Fix this page',
  mine: 'Your adapter (Build tab)',
  local: 'Your folder’s adapter.js',
};
// Parameters an adapter takes from outside, as JSON Schema. Most workshop
// adapters only read the person's profile, which comes from the profile the
// panel is shopping as, not from the caller.
const PARAMETERS = {
  'calm-urgency': {
    mode: { enum: ['label', 'hide'], description: 'label dims countdowns and low-stock messages and adds a short note; hide hides them.' },
  },
};
// Turning these off reloads the page (it is the only clean way to undo
// them), so they cannot offer undo.
const RELOADS = new Set(['toolkit-fixes', 'mine', 'local']);
// Address parts that steer the workshop panel rather than pick the page.
const CONTROL_PARAMS = ['try', 'workshop', 'profile', 'issues', 'today', 'spotlight', 'from', 'reset', 'need', 'new', 'rbtest', 'at'];

function pageKey(url) {
  const u = new URL(url, location.href);
  for (const p of CONTROL_PARAMS) u.searchParams.delete(p);
  u.searchParams.sort();
  const path = u.pathname.replace(/\.html$/, '').replace(/\/index$/, '/') || '/';
  return `${u.origin}${path}${u.searchParams.toString() ? `?${u.searchParams}` : ''}`;
}

async function sha256(text) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
  return `sha256:${[...bytes].map(b => b.toString(16).padStart(2, '0')).join('')}`;
}

function randomId() {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return `rb-${[...bytes].map(b => b.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * @param {{url: string, token: string}} config  the toolkit and the account's token
 * @param {object} bridge  loader.js's adapter switches (see bridge() there)
 * @param {(status: object) => void} onStatus
 * @returns {Promise<{close: () => Promise<void>}>}
 */
export async function connect(config, bridge, onStatus) {
  const base = String(config.url).replace(/\/+$/, '');
  const sdk = await import(`${base}/sdk/adapter-mcp.js`);
  const { createAdapterProvider, connectToToolkit, defineDescriptor, fromToggleAdapter, detectBrowserPlatform } = sdk;

  const here = () => pageKey(location.href);
  const target = { platforms: ['*'], urls: [`${location.origin}/*`] };

  async function registration(id) {
    const info = bridge.info(id);
    const reloads = RELOADS.has(id);
    const params = PARAMETERS[id] || {};
    const code = id === 'mine' || id === 'local' ? await bridge.code(id) : null;
    const descriptor = defineDescriptor({
      appId: 'redbird',
      id,
      name: TITLES[id] || id,
      description: [info.help, info.who ? `For: ${info.who}.` : ''].filter(Boolean).join(' '),
      version: id === 'mine' || id === 'local' ? 'draft' : bridge.version,
      reach: 'self',
      surfaces: ['web'],
      targets: [target],
      inputSchema: { type: 'object', properties: params, additionalProperties: false },
      outputSchema: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          changes: { type: 'integer', minimum: 0, description: 'Changes the workshop panel saw this adapter make on the page.' },
        },
        required: ['enabled'],
        additionalProperties: false,
      },
      requires: { host: ['web.document'], profileScopes: [], dependencies: info.ai ? [{ name: 'redbird.ai', optional: true, fallback: 'works without AI, with less' }] : [] },
      effects: { writes: ['web.dom'], idempotent: true, reversibility: reloads ? 'partial' : 'full' },
      operations: reloads ? ['query', 'check', 'apply', 'targets'] : ['query', 'check', 'apply', 'revert', 'targets'],
    });
    // The panel's own switch is the adapter: turning it on here is the same
    // as ticking it in the panel, so both always agree.
    const adapter = {
      get enabled() { return bridge.isOn(id); },
      enable: (parameters) => bridge.turn(id, true, parameters),
      disable: () => bridge.turn(id, false),
    };
    return fromToggleAdapter({
      descriptor,
      adapter,
      executionArtifactDigest: code ? await sha256(code) : null,
      // The page records what the adapter changed; give it a moment to see it.
      observe: async () => {
        await new Promise(r => setTimeout(r, 300));
        return { enabled: bridge.isOn(id), changes: bridge.changes(id) };
      },
      targets: () => ({ candidates: [{ target: { url: here() }, label: document.title }], coverage: 'complete' }),
      // One tab is one page. Another page is another tab's job.
      resolveTarget: (t) => (t.url && pageKey(t.url) === here() ? null : {
        code: 'target-unavailable',
        message: `This Redbird tab shows ${here()}. Open that page in a tab (it connects too) and use its instance.`,
      }),
      availability: () => (bridge.error(id) ? { available: false, reasons: [{ code: 'internal-error', message: bridge.error(id) }] } : { available: true }),
    });
  }

  const ids = EXPORTED.filter(id => bridge.has(id));
  const provider = createAdapterProvider({
    application: {
      appId: 'redbird',
      name: 'Redbird demo',
      version: bridge.version,
      description: 'The workshop’s practice store, with accessibility problems built in on purpose.',
      supportedPlatforms: [{ environment: 'web-page' }],
      platform: detectBrowserPlatform(),
      surfaces: ['web'],
    },
    adapters: await Promise.all(ids.map(registration)),
    instructions: 'Redbird is a practice store. Each instance is one browser tab showing one page; adapter_targets gives its address. Turn the workshop adapters on and off with adapter_apply, or the apply_<id> shortcuts.',
  });

  const link = connectToToolkit({
    url: base,
    token: config.token,
    provider,
    // A new id per page load: two tabs never share one, and the toolkit's
    // per-app endpoint still finds the tab when it is the only one.
    providerId: randomId(),
    label: `${bridge.local ? 'Starter folder' : 'Store tab'} — ${document.title} (${location.pathname}${location.search})`,
    onStatus,
  });
  addEventListener('pagehide', () => { link.close(); });
  publishOwn(sdk, base, config.token, bridge).catch(() => { /* sharing is extra; the store works without it */ });
  return link;
}

/**
 * Put the participant's own adapter (their starter folder's adapter.js) in the
 * toolkit's adapter registry, private to their account: it then appears on the
 * console's Adapters page, where they can run it in their browser on any
 * website (with the adapter runtime extension) or share it with the other
 * teams. The Build tab's adapter ("mine") stays out of the registry: it is
 * registered with this app only, under Apps. Publishing the same code again
 * is not a new revision, so every page load can do this.
 */
async function publishOwn(sdk, base, token, bridge) {
  const registry = sdk.createRegistryClient({ url: base, token });
  for (const id of ['local']) {
    if (!bridge.has(id)) continue;
    const code = await bridge.code(id);
    if (!code || sdk.lintWebModule(code).some(f => f.level === 'error')) continue;
    const info = bridge.info(id);
    await registry.publish({
      appName: 'Redbird demo',
      code,
      descriptor: sdk.defineDescriptor({
        appId: 'redbird', id, name: TITLES[id] || id, version: 'draft',
        description: [info.help, info.who ? `For: ${info.who}.` : ''].filter(Boolean).join(' '),
        targets: [{ platforms: ['*'], urls: [`${location.origin}/*`] }],
        inputSchema: { type: 'object', properties: PARAMETERS[id] || {}, additionalProperties: false },
      }),
    });
  }
}

/**
 * Hear when the person's toolkit profile changes, and which preset is selected, so the store
 * follows it without a refresh. The toolkit sends {revision, selected: {id, name, edited} | null}
 * on connecting and on every change; read the profile itself with readProfile. A browser tab
 * gets only a handful of connections per address, so the caller closes this while its tab is
 * hidden and opens it again when the tab comes back (the first event then says what changed).
 * @param {{url: string, token: string}} config
 * @param {(state: {revision: number, selected: object|null}) => void} onState
 * @returns {{close: () => void}}
 */
export function watchProfile(config, onState) {
  const base = String(config.url).replace(/\/+$/, '');
  let closed = false, controller = null, attempt = 0;

  async function read(body) {
    const reader = body.getReader(), decoder = new TextDecoder();
    let buffer = '', event = 'message', data = [];
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return;
      buffer += decoder.decode(value, { stream: true });
      let nl;
      while ((nl = buffer.search(/\r?\n/)) !== -1) {
        const line = buffer.slice(0, nl);
        buffer = buffer.slice(nl + (buffer[nl] === '\r' ? 2 : 1));
        if (line === '') {
          if (data.length && event === 'profile') { try { onState(JSON.parse(data.join('\n'))); } catch { /* a broken event changes nothing */ } }
          event = 'message'; data = [];
        } else if (!line.startsWith(':')) {
          const colon = line.indexOf(':');
          const field = colon === -1 ? line : line.slice(0, colon);
          const text = colon === -1 ? '' : line.slice(colon + 1).replace(/^ /, '');
          if (field === 'event') event = text; else if (field === 'data') data.push(text);
        }
      }
    }
  }

  (async () => {
    while (!closed) {
      controller = new AbortController();
      try {
        const response = await fetch(`${base}/v1/profile/events`, {
          headers: { authorization: `Bearer ${config.token}`, accept: 'text/event-stream' },
          cache: 'no-store',
          signal: controller.signal,
        });
        if (response.status === 401 || response.status === 403 || response.status === 404) return; // not allowed, or an older toolkit
        if (!response.ok) throw new Error(`the toolkit answered ${response.status}`);
        attempt = 0;
        await read(response.body);
      } catch { /* closed on purpose, or the connection dropped: try again below */ }
      if (closed) return;
      await new Promise(r => setTimeout(r, Math.min(30000, 1000 * 2 ** Math.min(attempt++, 5))));
    }
  })();

  return { close() { closed = true; controller?.abort(); } };
}

async function toolkitJSON(config, path, body) {
  const base = String(config.url).replace(/\/+$/, '');
  const response = await fetch(`${base}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { authorization: `Bearer ${config.token}`, ...(body ? { 'content-type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.ok) throw new Error(result?.message || result?.error || `the toolkit answered ${response.status}`);
  return result;
}

/** The presets the person can choose from in their toolkit: [{id, name, description, builtIn}]. */
export async function listPresets(config) {
  return (await toolkitJSON(config, '/v1/profile/presets')).presets;
}

/**
 * Make one of those presets the toolkit's active profile, as the developer console's Load
 * profile does. The toolkit's profile changes for every app, not just this store.
 * @returns {Promise<{revision: number, selected: object, profile: object}>}
 */
export async function selectPreset(config, id) {
  return toolkitJSON(config, '/v1/profile/select', { id });
}

/** Read the signed-in person's profile from the toolkit, with the same token. */
export async function readProfile(config) {
  const base = String(config.url).replace(/\/+$/, '');
  const response = await fetch(`${base}/v1/librarian/getProfile`, {
    method: 'POST',
    headers: { authorization: `Bearer ${config.token}`, 'content-type': 'application/json' },
    body: '{"args":[]}',
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.ok) throw new Error(body?.message || body?.error || `the toolkit answered ${response.status}`);
  return body.result;
}
