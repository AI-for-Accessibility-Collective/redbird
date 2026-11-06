// Connects this Redbird tab to an AI for Accessibility toolkit as the app "Redbird demo", using
// the toolkit's Adapter MCP SDK. Redbird is an app with its own adaptations, as the toolkit's skill
// describes one: they are part of the store's code, they follow the person's toolkit profile, and
// connecting shows them under Apps.
//
// What that gives the workshop:
//   - The tab shows up in the toolkit's developer console under Apps, grouped with every other
//     Redbird tab on the same account.
//   - The console, or a coding agent holding the same token, can turn Redbird's adaptations on
//     and off, read whether they're on, undo a change, and check them all (app_verify), through
//     the standard MCP tools the SDK provides.
//   - The needs Redbird's adaptations meet that the toolkit has no name for are registered with
//     the toolkit, so its profile agent can suggest them to the people they fit.
//
// The SDK is loaded from the toolkit itself (<toolkit>/sdk/adapter-mcp.js), so Redbird always
// speaks the version of the contract that toolkit understands. loader.js hands over a small bridge
// to its own switches; nothing here loads or runs adaptations by itself, and the panel stays in
// charge. The toolkit's own built-in adapters, which the panel also runs, are the toolkit's, not
// Redbird's, so they are not offered here.

// Redbird's own adaptations (the workshop examples in workshop/adapters/).
const EXPORTED = ['real-arrival-dates', 'swatch-names', 'calm-urgency', 'reading-level', 'pause-moving-things'];
const TITLES = {
  'real-arrival-dates': 'Real arrival dates',
  'swatch-names': 'Swatch names',
  'calm-urgency': 'Calm urgency',
  'reading-level': 'Reading level',
  'pause-moving-things': 'Pause moving things',
};
const AREAS = {
  'real-arrival-dates': ['vision', 'cognitive'],
  'swatch-names': ['vision'],
  'calm-urgency': ['cognitive', 'sensory'],
  'reading-level': ['cognitive', 'reading'],
  'pause-moving-things': ['cognitive', 'sensory'],
};
// The needs an adaptation meets that the profile has no name for. (Swatch names, reading level
// and pausing moving things meet needs the toolkit already has: names for controls, simpler text
// and less motion.) Once the person has one, their profile says '<appId>/<id>', and the store
// turns the adaptation on.
const NEEDS = {
  'real-arrival-dates': [{
    id: 'real-dates', phrase: 'Real dates instead of business days',
    description: 'Shows the day something arrives, like “arrives Tue, Nov 3”, instead of “5–7 business days”.',
    abilities: 'Working a date out from a count of business days takes memory and attention, and a screen reader reads the count without the date.',
  }],
  'calm-urgency': [{
    id: 'no-pressure', phrase: 'No pressure to buy now',
    description: 'Labels or hides countdown timers, “only 2 left” and “14 people have this in their carts”.',
    abilities: 'Messages made to rush people can take over the page for someone with anxiety or attention differences, and lead to buying too fast.',
  }],
};
// Parameters an adaptation takes from outside, as JSON Schema. Most of Redbird's adaptations take
// the person's settings from the profile the panel is shopping as, not from the caller.
const PARAMETERS = {
  'calm-urgency': {
    mode: { enum: ['label', 'hide'], description: 'label dims countdowns and low-stock messages and adds a short note; hide hides them.' },
  },
};
// Address parts that steer the workshop panel rather than pick the page.
const CONTROL_PARAMS = ['try', 'workshop', 'profile', 'issues', 'today', 'spotlight', 'reset', 'tab', 'at'];

function pageKey(url) {
  const u = new URL(url, location.href);
  for (const p of CONTROL_PARAMS) u.searchParams.delete(p);
  u.searchParams.sort();
  const path = u.pathname.replace(/\.html$/, '').replace(/\/index$/, '/') || '/';
  return `${u.origin}${path}${u.searchParams.toString() ? `?${u.searchParams}` : ''}`;
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

  function registration(id) {
    const info = bridge.info(id);
    const params = PARAMETERS[id] || {};
    const descriptor = defineDescriptor({
      appId: 'redbird',
      id,
      name: TITLES[id] || id,
      description: [info.help, info.who ? `For: ${info.who}.` : ''].filter(Boolean).join(' '),
      version: bridge.version,
      reach: 'self',
      surfaces: ['web'],
      targets: [target],
      supportAreas: AREAS[id],
      ...(NEEDS[id] ? { needs: NEEDS[id] } : {}),
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
      effects: { writes: ['web.dom'], idempotent: true, reversibility: 'full' },
      operations: ['query', 'check', 'apply', 'revert', 'targets'],
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
      // What it is on with, so undo puts back the parameters it had.
      parameters: () => bridge.parameters(id),
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
      description: 'The workshop’s practice store, with accessibility problems built in on purpose, and its own adaptations for them.',
      supportedPlatforms: [{ environment: 'web-page' }],
      platform: detectBrowserPlatform(),
      surfaces: ['web'],
    },
    adapters: ids.map(registration),
    instructions: 'Redbird is a practice store. Each instance is one browser tab showing one page; adapter_targets gives its address. Turn Redbird’s own adaptations on and off with adapter_apply, or the apply_<id> shortcuts; app_verify checks them all.',
  });

  const link = connectToToolkit({
    url: base,
    token: config.token,
    provider,
    // A new id per page load: two tabs never share one, and the toolkit's
    // per-app endpoint still finds the tab when it is the only one.
    providerId: randomId(),
    label: `Store tab — ${document.title} (${location.pathname}${location.search})`,
    onStatus,
  });
  addEventListener('pagehide', () => { link.close(); });
  return link;
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

/**
 * Tell the person's toolkit what they did here, so it can learn from it (the toolkit's
 * profile_observe tool does the same). It suggests profile changes from what it learns, and the
 * person answers each one in the developer console. One plain sentence, the site, small details.
 * It names the app, so if the person keeps what Redbird gives to Redbird alone (the console's
 * Apps page), the toolkit keeps this observation there too.
 * @param {{url: string, token: string}} config
 * @param {{text: string, origin?: string, type?: string, data?: object}} observation
 */
export async function observe(config, observation) {
  return (await toolkitJSON(config, '/v1/librarian/logObservation', { args: [{ ...observation, app: 'redbird' }] })).result;
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
