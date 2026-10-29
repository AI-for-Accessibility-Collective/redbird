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

const SITE = 'https://redbird-workshop.vercel.app';
const LOADER = SITE + '/workshop/loader.js';

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
  await chrome.tabs.reload(tabId);
}

// Every page the tab opens while the panel is on gets the panel.
chrome.webNavigation.onDOMContentLoaded.addListener(async ({ tabId, frameId, url }) => {
  if (frameId !== 0 || !/^https?:/.test(url) || url.startsWith(SITE)) return;
  if (!(await tabsOn()).includes(tabId)) return;
  const { carried } = await chrome.storage.local.get('carried');
  chrome.action.setBadgeText({ tabId, text: 'on' });
  chrome.action.setBadgeBackgroundColor({ tabId, color: '#8c1515' });
  chrome.scripting.executeScript({ target: { tabId }, world: 'MAIN', func: addPanel, args: [LOADER, carried || null] })
    .catch((e) => console.warn('[redbird] could not add the panel:', e.message));
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const on = await tabsOn();
  if (!on.includes(tabId)) return;
  await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [tabId] });
  await chrome.storage.session.set({ on: on.filter((id) => id !== tabId) });
});

// Runs in the page. Brings over the profile and fixes last used on Redbird (see carry.js), then
// adds the panel. A site keeps what was built on it until something changes on Redbird again.
function addPanel(src, carried) {
  if (document.querySelector('script[data-redbird-panel]')) return;
  try {
    const at = Number(localStorage.getItem('redbird:carried-at')) || 0;
    if (carried && carried.at > at) {
      Object.keys(carried.keys).forEach((k) => {
        if (carried.keys[k] == null) localStorage.removeItem(k);
        else localStorage.setItem(k, carried.keys[k]);
      });
      localStorage.setItem('redbird:carried-at', String(carried.at));
    }
    localStorage.setItem('redbird:workshop', 'on');
  } catch (e) { /* storage blocked on this site: the panel starts empty */ }
  const s = document.createElement('script');
  s.src = src;
  s.dataset.redbirdPanel = '';
  (document.head || document.documentElement).appendChild(s);
}
