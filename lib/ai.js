// Llamadas a Claude (Anthropic SDK). Todo el flujo pide JSON en texto y lo repara si viene truncado —
// mismo enfoque que /api/full-campaign, para no depender de schemas rígidos en prompts largos.
import Anthropic from "@anthropic-ai/sdk";
import { getSetting } from "./settings";

export async function getModel() {
  return getSetting("ANTHROPIC_MODEL");
}

export async function hasAnthropic() {
  return !!(await getSetting("ANTHROPIC_API_KEY"));
}

let _client = { key: null, instance: null };
async function client() {
  const key = await getSetting("ANTHROPIC_API_KEY");
  if (!key) throw new Error("Falta la Anthropic API key (Configuración → IA).");
  if (_client.key !== key) _client = { key, instance: new Anthropic({ apiKey: key, maxRetries: 2 }) };
  return _client.instance;
}

/** Prueba de conexión: una llamada mínima. */
export async function testConnection() {
  const c = await client();
  const model = await getModel();
  const msg = await c.messages.create({ model, max_tokens: 20, messages: [{ role: "user", content: "Responde solo: ok" }] });
  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  return `${model} respondió: ${text.slice(0, 30)}`;
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
  const c = await client();
  const stream = c.messages.stream({
    model: await getModel(),
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
