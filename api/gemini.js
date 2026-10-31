// Lets opencode use the workshop's Gemini key from people's own computers, without the key being
// on those computers. The starter folder's tools/agent.mjs points opencode here, and this adds the
// key before passing the request on to Google, so nobody has anything to set up.
//
// /api/ai only does a fixed list of tasks. A coding agent's requests can't fit a list like that, so
// this takes whole requests, and these are the limits on them: always the workshop's model, whatever
// the request names, the tools opencode defines itself (so no paid Google Search), and a cap on
// what goes in and comes out.

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const MAX_BODY = 2000000;    // characters of request, about 15 times what a long chat sends
const MAX_OUTPUT = 16384;    // tokens per answer, the same as the Build tab's longest tasks

// A guard against a runaway loop, not a limit people should ever notice: a round of chat is about
// 15 requests over a minute or two, so this is 40 people all sending at once.
let windowStart = 0, inWindow = 0;
const PER_MINUTE = 600;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const call = /\/models\/[\w.-]+:(streamGenerateContent|generateContent)(?:\?|$)/.exec(req.url || '');
  if (req.method !== 'POST' || !call) return refuse(res, 400, 'Only requests to the model work here.');
  const key = process.env.GEMINI_API_KEY;
  if (!key) return refuse(res, 503, 'The shared AI key is not set up.');

  const now = Date.now();
  if (now - windowStart > 60000) { windowStart = now; inWindow = 0; }
  if (++inWindow > PER_MINUTE) return refuse(res, 429, 'Busy, try again in a minute');

  const body = typeof req.body === 'string' ? safeJSON(req.body) : req.body;
  if (!body || !Array.isArray(body.contents)) return refuse(res, 400, 'That isn’t a request for the model.');
  if (JSON.stringify(body).length > MAX_BODY) return refuse(res, 413, 'This chat has grown too long. Start npm run dev again to begin a new one.');
  if (body.tools) body.tools = body.tools.filter((t) => t && t.functionDeclarations);
  body.generationConfig = { ...body.generationConfig, maxOutputTokens: Math.min(body.generationConfig?.maxOutputTokens || MAX_OUTPUT, MAX_OUTPUT) };

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:${call[1]}${call[1] === 'streamGenerateContent' ? '?alt=sse' : ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
    });
    // Some of Google's errors quote the key, so none of their words are passed on.
    if (!r.ok) return refuse(res, r.status === 429 ? 429 : r.status === 400 ? 400 : 502, 'The AI model couldn’t answer (' + r.status + ').');
    res.status(200);
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json');
    for await (const chunk of r.body) res.write(chunk);
    res.end();
  } catch (e) {
    if (!res.headersSent) return refuse(res, 502, 'AI request failed');
    res.end();
  }
};

// The shape of Google's own errors, which is what opencode expects.
function refuse(res, status, message) { return res.status(status).json({ error: { code: status, message } }); }

function safeJSON(s) { try { return JSON.parse(s); } catch (e) { return null; } }
