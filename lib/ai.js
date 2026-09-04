// Llamadas a Claude (Anthropic SDK). Todo el flujo pide JSON en texto y lo repara si viene truncado —
// mismo enfoque que /api/full-campaign, para no depender de schemas rígidos en prompts largos.
import Anthropic from "@anthropic-ai/sdk";

export const MODEL = (process.env.ANTHROPIC_MODEL || "claude-opus-5").trim();

export function hasAnthropic() {
  return !!(process.env.ANTHROPIC_API_KEY || "").trim();
}

let _client;
function client() {
  if (!_client) _client = new Anthropic({ apiKey: (process.env.ANTHROPIC_API_KEY || "").trim(), maxRetries: 2 });
  return _client;
}

function closeOpenStructures(s) {
  if (!s) return null;
  const stack = [];
  let inStr = false, esc = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "{" || c === "[") stack.push(c);
    else if (c === "}" || c === "]") stack.pop();
  }
  let out = s;
  if (inStr) out += '"';
  out = out.replace(/,\s*$/, "");
  for (let i = stack.length - 1; i >= 0; i--) out += stack[i] === "{" ? "}" : "]";
  return out;
}

export function extractJson(text) {
  if (!text) return null;
  let str = String(text).trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  const a = str.indexOf("{");
  if (a > 0) str = str.slice(a);
  const last = str.lastIndexOf("}");
  for (const cand of [str, str.slice(0, last + 1), closeOpenStructures(str), closeOpenStructures(str.slice(0, last + 1))]) {
    if (!cand) continue;
    try { return JSON.parse(cand); } catch {}
  }
  let cut = str;
  for (let i = 0; i < 200 && cut.length > 50; i++) {
    const c = cut.lastIndexOf(",");
    cut = cut.slice(0, c >= 0 ? c : cut.length - 1);
    try { return JSON.parse(closeOpenStructures(cut)); } catch {}
  }
  return null;
}

/**
 * Pide a Claude un objeto JSON. Streaming para respuestas largas (moodboard/campaña) sin timeouts.
 * `effort`: low | medium | high.
 */
export async function claudeJson({ system, user, maxTokens = 8000, effort = "medium" }) {
  const stream = client().messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
    thinking: { type: "adaptive" },
    output_config: { effort },
  });
  const msg = await stream.finalMessage();
  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
  const data = extractJson(text);
  if (!data) {
    const why = msg.stop_reason === "max_tokens" ? "se cortó por longitud" : "no devolvió JSON válido";
    throw new Error(`La IA ${why}.`);
  }
  return data;
}
