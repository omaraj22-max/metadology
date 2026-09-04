// Almacenamiento del flujo de WhatsApp.
// Producción: Upstash Redis vía REST (variables que inyecta Vercel Storage: KV_REST_API_URL / KV_REST_API_TOKEN,
// o UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN). Sin credenciales (dev local) cae a un archivo JSON
// en .wa-store/ para poder probar el flujo completo sin servicios externos.
import { promises as fs } from "node:fs";
import path from "node:path";

function creds() {
  const e = process.env;
  return {
    url: e.KV_REST_API_URL || e.UPSTASH_REDIS_REST_URL || "",
    token: e.KV_REST_API_TOKEN || e.UPSTASH_REDIS_REST_TOKEN || "",
  };
}

export function hasRedis() {
  const c = creds();
  return !!(c.url && c.token);
}

async function redis(cmd) {
  const { url, token } = creds();
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`Redis ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  if (j.error) throw new Error(`Redis: ${j.error}`);
  return j.result;
}

// ---- fallback local (archivo) ----
const LOCAL_DIR = process.env.WA_LOCAL_STORE_DIR || path.join(process.cwd(), ".wa-store");
const LOCAL_FILE = path.join(LOCAL_DIR, "store.json");
let localCache = null;

async function localRead() {
  if (localCache) return localCache;
  try {
    localCache = JSON.parse(await fs.readFile(LOCAL_FILE, "utf8"));
  } catch {
    localCache = { kv: {}, exp: {}, z: {} };
  }
  return localCache;
}
async function localWrite(db) {
  localCache = db;
  await fs.mkdir(LOCAL_DIR, { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(db));
}
function localAlive(db, key) {
  const exp = db.exp[key];
  if (exp && exp < Date.now()) {
    delete db.kv[key];
    delete db.exp[key];
    return false;
  }
  return key in db.kv;
}

// ---- API pública ----

export async function kvGet(key) {
  if (hasRedis()) {
    const v = await redis(["GET", key]);
    return v == null ? null : JSON.parse(v);
  }
  const db = await localRead();
  return localAlive(db, key) ? db.kv[key] : null;
}

export async function kvSet(key, value, { ex } = {}) {
  if (hasRedis()) {
    const cmd = ["SET", key, JSON.stringify(value)];
    if (ex) cmd.push("EX", String(ex));
    await redis(cmd);
    return;
  }
  const db = await localRead();
  db.kv[key] = value;
  if (ex) db.exp[key] = Date.now() + ex * 1000;
  else delete db.exp[key];
  await localWrite(db);
}

export async function kvDel(key) {
  if (hasRedis()) {
    await redis(["DEL", key]);
    return;
  }
  const db = await localRead();
  delete db.kv[key];
  delete db.exp[key];
  await localWrite(db);
}

/** SET NX con TTL: true si la llave no existía (útil para deduplicar mensajes). */
export async function kvSetNX(key, value, ex) {
  if (hasRedis()) {
    const r = await redis(["SET", key, JSON.stringify(value), "EX", String(ex), "NX"]);
    return r === "OK";
  }
  const db = await localRead();
  if (localAlive(db, key)) return false;
  db.kv[key] = value;
  db.exp[key] = Date.now() + ex * 1000;
  await localWrite(db);
  return true;
}

export async function zAdd(key, score, member) {
  if (hasRedis()) {
    await redis(["ZADD", key, String(score), member]);
    return;
  }
  const db = await localRead();
  db.z[key] = db.z[key] || {};
  db.z[key][member] = score;
  await localWrite(db);
}

/** Miembros ordenados por score descendente (más reciente primero). */
export async function zRevRange(key, start = 0, stop = 199) {
  if (hasRedis()) {
    return (await redis(["ZREVRANGE", key, String(start), String(stop)])) || [];
  }
  const db = await localRead();
  const z = db.z[key] || {};
  return Object.entries(z)
    .sort((a, b) => b[1] - a[1])
    .slice(start, stop + 1)
    .map(([m]) => m);
}

export async function zRem(key, member) {
  if (hasRedis()) {
    await redis(["ZREM", key, member]);
    return;
  }
  const db = await localRead();
  if (db.z[key]) delete db.z[key][member];
  await localWrite(db);
}

// ---- Llaves del dominio ----
export const K = {
  conv: (id) => `wa:conv:${id}`,
  active: (phone) => `wa:active:${phone}`,
  convs: "wa:convs",
  result: (id) => `wa:result:${id}`,
  img: (id) => `wa:img:${id}`,
  seen: (msgId) => `wa:seen:${msgId}`,
};

export function newId(prefix = "") {
  const abc = "abcdefghijkmnpqrstuvwxyz23456789";
  let s = "";
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(12));
  for (const b of bytes) s += abc[b % abc.length];
  return prefix + s;
}
