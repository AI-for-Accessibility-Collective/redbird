// Opens the Redbird workshop panel on whatever site a tab is showing, like NYTimes or a store
// someone actually shops at.
//
// Press the toolbar button on a tab to turn the panel on there, and press it again to turn it off.
// The panel is the store's own workshop/loader.js, loaded from the live site, so it is always the
// version the workshop uses, and its AI calls go to the store's /api/ai like they do on Redbird.
//
// Most big sites send a Content-Security-Policy header that only lets their own servers run
// scripts on the page, which stops the panel and the adapters it loads from the workshop site and
// jsDelivr. While the panel is on in a tab, pages in that tab (and only that tab) load without
// that header. Turning the panel off puts it back.
//
// With a starter folder running on this computer (npm run dev), the panel runs that folder's
// adapter.js on the site too, and runs it again each time the file is saved. Chrome asks before a
// public website can reach this computer, so this script carries those requests for the page.

const SITE = 'https://redbird-workshop.vercel.app';
const LOADER = SITE + '/workshop/loader.js';
const PORTS = [5179, 5180, 5181, 5182, 5183];
// What a page may ask a folder for. A page has no way to reach anything else on this computer.
const FOLDER_PATHS = /^\/__rb\/(adapter\.js|fix\.json|feedback|chat|chat\/stop)(\?|$)/;

chrome.action.onClicked.addListener((tab) => toggle(tab.id, tab.url));

async function tabsOn() {
  return (await chrome.storage.session.get('on')).on || [];
}

async function toggle(tabId, url) {
  // Redbird has the panel already, and Chrome's own pages (chrome://, the Web Store) don't let
  // extensions run anything on them.
  if (url && (url.startsWith(SITE) || !/^(https?:|about:blank)/.test(url))) return;
  const on = await tabsOn();
  if (on.includes(tabId)) return turnOff(tabId, on);
  return turnOn(tabId, on);
}

async function turnOn(tabId, on) {
  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [tabId],
    addRules: [{
      id: tabId,
      priority: 1,
      action: { type: 'modifyHeaders', responseHeaders: [{ header: 'content-security-policy', operation: 'remove' }] },
      condition: { tabIds: [tabId], resourceTypes: ['main_frame'] },
    }],
  });
  await chrome.storage.session.set({ on: on.concat(tabId) });
  // The page came with its policy already, so it loads again without it, and the panel goes in
  // once it has (below).
  await chrome.tabs.reload(tabId);
}

async function turnOff(tabId, on) {
  await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [tabId] });
  await chrome.storage.session.set({ on: on.filter((id) => id !== tabId) });
  await chrome.action.setBadgeText({ tabId, text: '' });
  await chrome.action.setTitle({ tabId, title: 'Open the Redbird panel on this page' });
  // The extension keeps the person's profile. This site doesn't need its copy any more.
  try { await chrome.scripting.executeScript({ target: { tabId }, world: 'ISOLATED', func: forgetPerson }); } catch (e) { /* a page it can't reach */ }
  await chrome.tabs.reload(tabId);
}

function forgetPerson() {
  ['redbird:me', 'redbird:person', 'redbird:learned', 'redbird:carried-at'].forEach((k) => localStorage.removeItem(k));
}

// Every page the tab opens while the panel is on gets the panel.
chrome.webNavigation.onDOMContentLoaded.addListener(async ({ tabId, frameId, url }) => {
  if (frameId !== 0 || !/^https?:/.test(url) || url.startsWith(SITE)) return;
  if (!(await tabsOn()).includes(tabId)) return;
  const [{ carried }, local] = await Promise.all([chrome.storage.local.get('carried'), findFolder()]);
  try {
    if (local) await chrome.scripting.executeScript({ target: { tabId }, world: 'ISOLATED', func: carryFolderRequests });
    await chrome.scripting.executeScript({ target: { tabId }, world: 'MAIN', func: addPanel, args: [LOADER, carried || null, local] });
    await chrome.scripting.executeScript({ target: { tabId }, world: 'ISOLATED', files: ['carry.js'] });
    chrome.action.setBadgeText({ tabId, text: 'on' });
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#8c1515' });
  } catch (e) { console.warn('[redbird] could not add the panel:', e.message); }
});

// A starter folder running on this computer, if there is one.
async function findFolder() {
  const ask = (port) => fetch(`http://127.0.0.1:${port}/__rb/hello`, { signal: AbortSignal.timeout(400) })
    .then((r) => (r.ok ? r.json() : Promise.reject())).then((d) => ({ port, agent: d.agent || null }));
  try { return await Promise.any(PORTS.map(ask)); } catch (e) { return null; }
}

chrome.runtime.onMessage.addListener(({ folder } = {}, sender, answer) => {
  if (!folder || !sender.tab) return false;
  askFolder(folder, sender.tab.id).then(answer, () => answer({ status: 0, body: '' }));
  return true; // the answer comes later
});

async function askFolder({ path, method, body }, tabId) {
  if (!FOLDER_PATHS.test(path) || !(await tabsOn()).includes(tabId)) return { status: 403, body: '' };
  const local = await findFolder();
  if (!local) return { status: 0, body: '' };
  const r = await fetch(`http://127.0.0.1:${local.port}${path}`, { method, body: body || undefined, headers: body ? { 'Content-Type': 'application/json' } : {}, cache: 'no-store' });
  return { status: r.status, body: await r.text() };
}

// Runs beside the page, where it can reach the extension, and passes the panel's requests along.
// The site's own scripts can post the same messages. They can't fake a real click or key press, so
// a request that writes to the folder or reaches opencode has to follow one in the panel.
function carryFolderRequests() {
  if (window.rbCarrying) return;
  window.rbCarrying = true;
  let pressed = 0;
  for (const type of ['click', 'keydown']) {
    addEventListener(type, (e) => { if (e.isTrusted && e.target && e.target.id === 'ws-root') pressed = Date.now(); }, true);
  }
  addEventListener('message', (e) => {
    if (e.source !== window || !e.data || !e.data.rbAsk) return;
    const { rbAsk, path, method, body } = e.data;
    const answer = (r) => window.postMessage({ rbAnswer: rbAsk, status: (r && r.status) || 0, body: (r && r.body) || '' }, location.origin);
    if (method !== 'GET' && Date.now() - pressed > 3000) return answer({ status: 403 });
    chrome.runtime.sendMessage({ folder: { path, method, body } }).then(answer, () => answer(null));
  });
}

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const on = await tabsOn();
  if (!on.includes(tabId)) return;
  await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [tabId] });
  await chrome.storage.session.set({ on: on.filter((id) => id !== tabId) });
});

// Runs in the page. Brings over what changed since the last visit, on Redbird or on another site
// (see carry.js), then adds the panel.
function addPanel(src, carried, local) {
  if (document.querySelector('script[data-redbird-panel]')) return;
  if (local) {
    window.RB_LOCAL = { bridge: true, adapter: '/__rb/adapter.js', feedback: '/__rb/feedback', fix: '/__rb/fix.json',
      chat: local.agent ? '/__rb/chat' : null, agent: local.agent, store: new URL(src).origin };
  }
  try {
    const at = Number(localStorage.getItem('redbird:carried-at')) || 0;
    if (carried && carried.at > at) {
      Object.keys(carried.keys).forEach((k) => {
        if (!((carried.times || {})[k] > at)) return;
        if (carried.keys[k] == null) localStorage.removeItem(k);
        else localStorage.setItem(k, carried.keys[k]);
      });
      localStorage.setItem('redbird:carried-at', String(carried.at));
    }
    localStorage.setItem('redbird:workshop', 'on');
    // The folder's adapter is on unless it was turned off in the panel, which the panel notes.
    if (local && !localStorage.getItem('redbird:folder-off')) {
      const on = (localStorage.getItem('redbird:try') || '').split(',').filter((n) => n && n !== 'none');
      if (!on.includes('local')) localStorage.setItem('redbird:try', on.concat('local').join(','));
    }
  } catch (e) { /* storage blocked on this site: the panel starts empty */ }
  const s = document.createElement('script');
  s.src = src;
  s.dataset.redbirdPanel = '';
  (document.head || document.documentElement).appendChild(s);
}
