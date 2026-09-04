// Registro del resultado Metadology. Se crea en cuanto Aria tiene los 4 datos (antes de que corra el
// pipeline) para poder mandar el link de avance en vivo desde el primer momento.
import { kvGet, kvSet, K, newId } from "./store";

export const STAGES = ["brand", "moodboard", "campaign", "ad"];

export async function createResult(conv) {
  const r = {
    id: newId("r"),
    convId: conv.id,
    phone: conv.phone,
    name: conv.name,
    createdAt: Date.now(),
    fields: conv.fields,
    status: "generating", // generating | done | error
    currentStage: null,
    progress: {}, // { brand: { startedAt, doneAt, error } , ... }
    error: null,
    landing: null,
    brand: null,
    moodboard: null,
    moodboardImg: null,
    campaign: null,
    adImg: null,
  };
  conv.resultId = r.id;
  await kvSet(K.result(r.id), r);
  return r;
}

export async function loadResult(id) {
  return id ? kvGet(K.result(id)) : null;
}

export async function saveResult(r) {
  r.updatedAt = Date.now();
  await kvSet(K.result(r.id), r);
}

/** Estado derivado (también para resultados creados antes de que existiera `status`). */
export function resultState(r) {
  if (!r) return "missing";
  if (r.status === "error") return "error";
  if (r.adImg || r.status === "done") return "done";
  return "generating";
}
