// Prompts for the two builders in the workshop panel's Build tab. Vercel doesn't turn files that
// start with an underscore into functions, so this is only read by api/ai.js.
//
// Both follow the toolkit's own builders, so what people make here is what the extension makes:
//   buildSkill    the Engineer from toolkit/core/skill-builder.js. It writes a SKILL.md that names
//                 existing adapters and settings. No code.
//   writeAdapter  the Adapter Builder's prompt (extension adapter-builder/prompts/creator.txt),
//   reviseAdapter and refine.txt for changes. The extension's version writes a user script; this
//                 one writes the workshop's adapter module (enable, disable, toggle), so the panel
//                 can switch it off and show what it changed.

const SUPPORT_AREAS = ['vision', 'hearing', 'motor', 'cognitive', 'reading', 'sensory'];
const CATEGORIES = ['news', 'social', 'video', 'shopping', 'education', 'productivity', 'reference', 'finance', 'health', 'government', 'other'];

function about(person) {
  return person ? `\nWho it is for, in the builder's words: "${person}"` : '';
}

function buildSkill({ need, person, catalog, settings, previous, feedback }) {
  const revision = previous && feedback
    ? `\n\nYou already built this skill for that need:\n\n${previous}\n\nThe person tried it and said: "${feedback}"\n` +
      'Revise the skill to address their feedback. Keep the same name unless the feedback changes what the skill is about, and keep the parts that already worked.'
    : '';
  return `You are the Engineer — an accessibility skill builder. Author a SKILL.md that adapts web pages for the need below by composing EXISTING adapters. You do NOT write code; you write a playbook that names which adapters to apply and with what settings.

The need: "${need}"${about(person)}${revision}

Available adapters (use only these ids):
${catalog}

Setting keys (use only these; leave "settings" empty for every other adapter):
${settings}

Support areas for supportAreas: ${SUPPORT_AREAS.join(', ')}.
Site categories for siteRelevance: ${CATEGORIES.join(', ')} (or "all").

Output a COMPLETE SKILL.md, nothing else, in exactly this shape:

---
name: <short-kebab-case-id>
description: <one sentence: what it does and WHEN to use it — this is what an agent matches on>
supportAreas: [<comma-separated support areas from the list above, matching the adapters' "helps" areas>]
siteRelevance: [<comma-separated categories from the list above, or "all">]
---

# <Title>

<1-2 sentences: what this skill does for the person.>

## What it does
<numbered list: each adapter you apply and why, in plain language.>

## When to use
<when it helps and when to skip it.>

## Recipe
\`\`\`json
{
  "adapters": [
    { "id": "<adapter-id>", "settings": {} }
  ]
}
\`\`\`

Rules:
- Only reference adapter ids and setting keys listed above. Keep the recipe minimal — 1 to 4 adapters that directly serve the need.
- Pick an adapter only if its description says it makes the exact change asked for. An adapter that helps the same people in general doesn't count: for example, keyboard shortcuts don't make one unreachable button reachable, and rewriting product descriptions doesn't rewrite a return policy.
- If no adapter above makes the exact change, return the SKILL.md with an empty "adapters" list and say in "When to use" what is missing. A new adapter will then be written for exactly this need, so an empty list is better than a near miss.
- Only use the support areas and site categories listed above; any other value is rejected.
- The "Recipe" JSON is the machine-runnable truth; make the prose match it.
- Write the prose plainly, for someone who doesn't code. No marketing words.
- Describe what the page gets wrong and what the skill changes, not what is wrong with the person. Don't write "the disabled", "the elderly", "seniors", "suffers from" or "struggles with".
- Prefer the narrowest siteRelevance the need implies; use "all" only for genuinely global needs.`;
}

const ADAPTER_RULES = `You are writing a small JavaScript adapter that changes a web page to make it more accessible for one person. It runs in the Redbird workshop: a practice online store with accessibility problems built in on purpose. The workshop panel loads your adapter, switches it on and off, and shows the person every change it makes to the page.

# Hard rules

1. **Output raw JavaScript only.** No Markdown fences, no commentary. The file is loaded as an ES module.

2. **Export exactly one object** with this shape:
   export const MyAdapter = {
     enabled: false,
     enable(options = {}) { ... },   // make the change
     disable() { ... },              // put the page back EXACTLY as it was
     toggle(options) { if (this.enabled) this.disable(); else this.enable(options); },
   };
   Rename MyAdapter after what it does, in PascalCase (e.g. StarReader). No other exports, no top-level await.

3. **disable() undoes everything.** Before changing an attribute, text or style, remember the old value (a Map from element to its old values works well) and put it back in disable(). Remove anything you added, disconnect observers and remove event listeners.

4. **Do the work in a method on the object and call it with this.apply()** (or another method name). The panel watches calls to the object's own methods to show what changed, so changes made inside a method get credited to the adapter. If the page adds content later, use a MutationObserver whose callback calls this.apply() again, at most twice a second, and make apply() skip elements it already changed.

5. **Wrap the body of enable() and apply() in try/catch** and log with console.warn('my adapter:', e). A bug must never break the store.

6. **Never touch the workshop panel.** Skip any element inside #ws-root or .ws-panel.

7. **Class and id prefix.** Anything you add gets a class or id starting with "my-". Add styles with one <style id="my-<kebab>"> element, and remove it in disable().

8. **To tell a screen reader user something,** add this helper above the export and call say('...'):
   function say(text) {
     if (window.RB_SAY) return window.RB_SAY(text); // the store's one voice for screen readers
     let live = document.getElementById('ws-live');
     if (!live) {
       live = Object.assign(document.createElement('div'), { id: 'ws-live' });
       live.setAttribute('aria-live', 'polite');
       live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';
       document.body.appendChild(live);
     }
     // One queue on the region, shared with the other adapters, so messages don't wipe each other.
     live.waiting = (live.waiting || []).concat(text);
     clearTimeout(live.timer);
     live.timer = setTimeout(() => {
       const words = live.waiting.join('. ');
       live.waiting = [];
       live.textContent = '';
       setTimeout(() => { live.textContent = words; }, 60);
     }, 50);
   }

# What enable(options) gets

- options.profile: the person, or null. options.profile.freeText is their needs in their own words; options.profile.fields.readingLevel is a US school grade or null.
- options.today: a Date for "today" in the store (use it for date math, not new Date()).
- options.rewrite(text, instructions): asks an AI model to rewrite text by your instructions (at most 600 characters of instructions and 6000 of text). Returns a Promise of the new text, or null if AI isn't available. Use it only when the fix needs judgment, like plain-language rewrites or short summaries. Always handle null (leave the page as it was).

# Forbidden

- fetch, XMLHttpRequest, WebSocket, import, eval, new Function, document.write.
- Navigating (location.href = ..., window.open, history.pushState), submitting forms, clicking buttons for the person.
- Writing cookies, localStorage or sessionStorage.

# Words the person sees

Any words your adapter shows or says to the person must be plain, short and adult. Say what changed on the page. Don't mention the person's disability or age.

# Style

- Small and readable: the person will open your code to see what it does. Clear names, short comments that say why. Under about 100 lines unless the fix really needs more.
- Prefer selectors that follow what things are (roles, data- attributes, visible text, element types) over long class chains. The store's markup is shown below; base your selectors on it.

# Example: "Say when a link opens a new tab"

function say(text) { /* the helper above */ }

export const NewTabLinks = {
  enabled: false,
  before: null, // link → its old aria-label
  observer: null,

  enable() {
    if (this.enabled) return;
    this.enabled = true;
    this.before = new Map();
    const n = this.apply();
    let queued = false;
    this.observer = new MutationObserver(() => {
      if (queued || !this.enabled) return;
      queued = true;
      setTimeout(() => { queued = false; if (this.enabled) this.apply(); }, 500);
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
    say(n ? 'Marked ' + n + ' links that open a new tab' : 'No links open a new tab here');
  },

  apply() {
    let n = 0;
    try {
      for (const a of document.querySelectorAll('a[target="_blank"]')) {
        if (this.before.has(a) || a.closest('#ws-root, .ws-panel')) continue;
        const name = (a.getAttribute('aria-label') || a.textContent).trim();
        if (!name) continue;
        this.before.set(a, a.getAttribute('aria-label'));
        a.setAttribute('aria-label', name + ' (opens in a new tab)');
        n++;
      }
    } catch (e) { console.warn('my adapter:', e); }
    return n;
  },

  disable() {
    if (!this.enabled) return;
    this.enabled = false;
    this.observer.disconnect();
    for (const [a, old] of this.before) old === null ? a.removeAttribute('aria-label') : a.setAttribute('aria-label', old);
    this.before.clear();
    say('New tab labels removed');
  },

  toggle(options) { if (this.enabled) this.disable(); else this.enable(options); },
};`;

function page(snapshot, target, url) {
  return `\n\n# The page it was described on\n\nAddress: ${url || 'unknown'}\n\n` +
    (target ? `The person pointed at this part of the page:\n${target}\n\n` : '') +
    `The page's markup, shortened (long text cut, repeated items collapsed):\n${snapshot || '(not available)'}`;
}

// The panel shows this line to the person as what each version did, then takes it off the code.
const NOTE = `Start the file with one line: "// What changed: " and one short, plain sentence for the person who asked, with no code words.`;

function writeAdapter({ description, name, person, snapshot, target, url }) {
  return `${ADAPTER_RULES}${page(snapshot, target, url)}

# Now, the request

What the person wants changed:
${description}
${name ? `\nWhat they called it: ${name}` : ''}${about(person)}

${NOTE} Say what the adapter does on the page, for example: "// What changed: The star ratings are read out as numbers, like 4.6 out of 5 stars."
Return only the JavaScript module. No fences, no explanation.`;
}

function reviseAdapter({ code, description, feedback, error, history, person, snapshot, target, url }) {
  return `${ADAPTER_RULES}${page(snapshot, target, url)}

# Revising an adapter

You wrote the adapter below for this request: "${description}"${about(person)}
${history ? `\nSince then they also asked for these, which the code should still do:\n${history}\n` : ''}
CURRENT CODE:
${code}

${error ? `When the workshop tried to run it, it failed with: ${error}\n\n` : ''}${feedback ? `The person tried it and said: "${feedback}"\n\n` : ''}Revision rules:
1. Keep what already worked. Don't start over unless the feedback contradicts the original goal.
2. Make the change the person asked for as narrowly as possible.
3. If they say it did nothing, check the selectors against the page markup above, widen them, or wait for content with the MutationObserver.
4. If it broke something, narrow it: stricter selectors, or leave out the elements it shouldn't touch.
5. If there was an error, fix its cause.

${NOTE} Say what is different from the last version, for example: "// What changed: It now also reads the stars in the reviews." Leave out the last version's "What changed" line.
Return only the revised JavaScript module. No fences, no explanation.`;
}

// "Not sure what to write?" in the Build tab: three short answers become an ability profile, the
// way the toolkit's onboarding chat (onboarding/) turns a conversation into one.
function profileFromChat({ answers }) {
  return `You help someone describe a person's accessibility needs for the AI for Accessibility Toolkit, so its adapters can change web pages for that person.

From the answers below, write two or three plain sentences about the person, in the third person. Say what on shopping websites gets in their way, what helps, and what should stay the same. Describe the website as the problem, not the person. For example: "Small gray text is hard for Bill to read. Bigger, darker text and bigger buttons help." Use only what the answers say. If the answers name a disability, use the same words. Don't add a diagnosis, don't guess, and don't use the word "user". Write it the way the person would be glad to read about themselves. If the answers don't name the person, call them "they".

Then, on its own last line, write "Support areas:" followed by the ones that apply, from this list only: vision, hearing, motor, cognitive, reading, sensory.

Answers:
${answers}`;
}

// "Not sure what to change?" in the Build tab: a few changes to this page that would help this person.
function suggestChanges({ person, snapshot, url }) {
  return `You help someone in an accessibility workshop decide what to fix on a web page for one person. The page is from Redbird, a practice online store with accessibility problems built in on purpose.
${person ? `\nWho it is for: "${person}"\n` : '\nNo person was given, so suggest changes that help the most people.\n'}
Suggest the three changes to this page that would help this person most. Each one is a single short sentence that starts with a verb, says what to change and where on the page, in plain words. For example: "Read the star ratings out as numbers, like 4.6 out of 5 stars." Only suggest changes to what is really on this page. Describe what the page gets wrong, not what is wrong with the person.

Return the three sentences, one per line, with nothing else.

The page (${url || 'unknown address'}), shortened:
${snapshot || '(not available)'}`;
}

// "My profile" in the Profiles tab: someone describes themselves, and this writes their own profile
// and picks the adapters for it, the way the toolkit's onboarding does.
function myProfile({ answers, catalog }) {
  return `You set up someone's own accessibility profile for the AI for Accessibility Toolkit. The toolkit uses it to change websites for them, starting with Redbird, a practice online store.

Here is what they wrote about themselves:
${answers}

Return only a JSON object, with no other text:
{"about": "...", "supportAreas": [], "readingLevel": null, "urgency": null, "adapters": []}

- about: two or three short, plain sentences in the first person, the way they'd write it themselves. Say what gets in their way and what helps, in their own words where you can. For example: "I have low vision. Small gray text is hard for me to read, and bigger, darker text helps." Don't repeat "on shopping websites" or "would make shopping easier for me" in every sentence. Describe the websites as the problem, not the person. If they name a disability, keep it, in their words. Don't add a diagnosis or anything they didn't say. Write it in the language they wrote in.
- supportAreas: the ones that apply, from this list only: vision, hearing, motor, cognitive, reading, sensory.
- readingLevel: a school grade from 3 to 12 if they asked for simpler or shorter text, otherwise null.
- urgency: "hide" if countdowns, "only 2 left" messages or pressure to buy fast bother them, otherwise null.
- adapters: two to five adapter ids from the list below, each fixing something they wrote about. Only pick an adapter when it clearly matches what they said, and don't pick two that do the same job. Cover each problem they mention with an adapter that fixes it, if the list has one; for example, a banner that keeps changing needs an adapter that stops banners or carousels. An empty list is better than a guess. Use the ids exactly as written in the list.

If the answers don't say anything about what gets in their way or what they need, return "" for about and [] for adapters.

Adapters:
${catalog}`;
}

module.exports = { buildSkill, writeAdapter, reviseAdapter, profileFromChat, suggestChanges, myProfile };
