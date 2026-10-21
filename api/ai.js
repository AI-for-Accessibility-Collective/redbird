// The store's shared AI helper, run by Vercel as a serverless function at /api/ai.
//
// The Gemini key lives only in the Vercel project's environment (GEMINI_API_KEY) and never
// reaches the browser. The page sends a task name and its inputs, this function builds the
// prompt, calls Gemini and returns the text. It only does the tasks below, so it can't be
// used as a general-purpose Gemini proxy, and inputs are capped in size.
//
//   POST /api/ai  { "task": "simplify", "text": "..." }  →  { "result": "..." }

const MODEL = 'gemini-3.5-flash';
const MAX_TEXT = 6000;       // characters of page text per request
const MAX_IMAGE = 4000000;   // characters of base64 image data (about 3 MB, under Vercel's 4.5 MB request limit)
const MAX_NOTE = 600;        // characters of custom instructions from a workshop adapter

// Prompts follow the toolkit extension's background.js, so adapters behave the same here.
const TASKS = {
  // Workshop reading-level adapter: rewrite at a grade, with optional instructions it can change.
  rewrite: ({ text, instructions }) => ({
    text: `${clip(instructions, MAX_NOTE) || 'Rewrite this text in plain language.'}\n\n${clip(text, MAX_TEXT)}`,
  }),
  simplify: ({ text }) => ({
    text: `Rewrite this text using simpler language, but KEEP ALL THE INFORMATION.\n\nORIGINAL TEXT:\n${clip(text, MAX_TEXT)}\n\n` +
      'RULES:\n- Use common, everyday words (6th-grade vocabulary)\n- Break long sentences into shorter ones\n' +
      '- Keep EVERY fact, detail, and point from the original\n- Do NOT summarize\n- No bullet points, no markdown, plain text only\n\n' +
      'Return ONLY the simplified text:',
  }),
  summarize: ({ text }) => ({
    text: `Summarize this in 2 or 3 short, plain sentences. Keep numbers, prices and dates exact. Plain text only.\n\n${clip(text, MAX_TEXT)}`,
  }),
  translate: ({ text, targetLang }) => ({
    text: `Translate this text into ${clip(targetLang, 40) || 'English'}. Return only the translation.\n\n${clip(text, MAX_TEXT)}`,
  }),
  define: ({ word, context }) => ({
    text: `In one short plain sentence, explain what "${clip(word, 80)}" means here. Context: ${clip(context, 800)}`,
  }),
  describeImage: ({ imageData }) => ({
    image: imageData,
    text: 'Alt text for screen reader. Be BRIEF and USEFUL.\n\nCHART: "Bar chart: Sales rose from $2M (2020) to $5M (2023)"\n' +
      'ICON: "Settings gear icon"\nPHOTO: "Woman speaking at podium" not "A woman with brown hair..."\nLOGO: "Acme Corp logo"\n\n' +
      'One sentence max. No fluff. Just the facts.',
  }),
  describeElement: ({ imageData, elementType, context }) => ({
    image: imageData,
    text: `Describe this ${clip(elementType, 40) || 'element'} for a screen reader user in one or two sentences. Context: ${clip(context, 800)}`,
  }),
  label: ({ elementType, html, context }) => ({
    text: `Give a short accessible name (2 to 5 words) for this ${clip(elementType, 40) || 'control'} on a shopping site. ` +
      `Return only the name.\n\nHTML: ${clip(html, 2000)}\nNearby text: ${clip(context, 800)}`,
  }),
  linkText: ({ linkText, href, context }) => ({
    text: `This link says "${clip(linkText, 200)}" and goes to ${clip(href, 300)}. Nearby text: ${clip(context, 800)}\n` +
      'Write better link text (2 to 6 words) that says where it goes. Return only the text.',
  }),
  columnHeader: ({ sampleData }) => ({
    text: `These are values from one table column: ${clip(JSON.stringify(sampleData), 1500)}\nReturn a short column header (1 to 3 words) only.`,
  }),
};

function clip(v, n) { return typeof v === 'string' ? v.slice(0, n) : ''; }

// Same request, same answer: the store's text barely changes, so most requests in a workshop
// room repeat. Kept per server instance, which is enough to save most calls.
const cache = new Map();
// A guard against a runaway loop, not a limit people should ever notice.
let windowStart = 0, inWindow = 0;
const PER_MINUTE = 600;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: 'The shared AI key is not set up.' });

  const body = typeof req.body === 'string' ? safeJSON(req.body) : req.body || {};
  const task = TASKS[body.task];
  if (!task) return res.status(400).json({ error: 'Unknown task' });
  const built = task(body);
  if (built.image) {
    const m = /^data:(image\/[\w.+-]+);base64,([A-Za-z0-9+/=]+)$/.exec(built.image);
    if (!m || m[2].length > MAX_IMAGE) return res.status(400).json({ error: 'Image missing or too large' });
    built.mime = m[1]; built.data = m[2];
  }

  const id = body.task + '\n' + built.text + '\n' + (built.data ? built.data.length + built.data.slice(0, 200) + built.data.slice(-200) : '');
  if (cache.has(id)) return res.status(200).json({ result: cache.get(id), cached: true });

  const now = Date.now();
  if (now - windowStart > 60000) { windowStart = now; inWindow = 0; }
  if (++inWindow > PER_MINUTE) return res.status(429).json({ error: 'Busy, try again in a minute' });

  const parts = built.data ? [{ inlineData: { mimeType: built.mime, data: built.data } }, { text: built.text }] : [{ text: built.text }];
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0.2, maxOutputTokens: 2048, thinkingConfig: { thinkingBudget: 0 } } }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(502).json({ error: 'AI request failed (' + r.status + ')' });
    const text = (d.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim();
    // A cut-off answer would read as broken text on the page, so treat it as no answer.
    if (!text || d.candidates?.[0]?.finishReason === 'MAX_TOKENS') return res.status(502).json({ error: 'AI returned nothing' });
    if (cache.size > 2000) cache.delete(cache.keys().next().value);
    cache.set(id, text);
    return res.status(200).json({ result: text });
  } catch (e) {
    return res.status(502).json({ error: 'AI request failed' });
  }
};

function safeJSON(s) { try { return JSON.parse(s); } catch (e) { return {}; } }
