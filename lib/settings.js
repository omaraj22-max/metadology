// Configuración editable desde el back office (/back-office/settings). Se guarda en el store (Redis)
// y cada llave cae a la variable de entorno del mismo nombre si está vacía. Redis y BACKOFFICE_PASSWORD
// son el "bootstrap" y solo viven en env.
import { kvGet, kvSet } from "./store";

const KEY = "wa:settings";

export const SETTING_GROUPS = [
  {
    id: "whatsapp",
    title: "WhatsApp (Meta Cloud API)",
    fields: [
      { key: "META_PHONE_NUMBER_ID", label: "Phone number ID", hint: "Meta → WhatsApp → API Setup" },
      { key: "META_WABA_ID", label: "WhatsApp Business Account ID", hint: "Meta → WhatsApp → API Setup, debajo del phone number ID. Si lo dejas vacío se intenta detectar solo." },
      { key: "META_ACCESS_TOKEN", label: "Access token permanente", secret: true, hint: "System User con whatsapp_business_messaging" },
      { key: "META_APP_SECRET", label: "App secret", secret: true, hint: "App settings → Basic. Valida la firma del webhook." },
      { key: "META_WEBHOOK_VERIFY_TOKEN", label: "Verify token del webhook", hint: "Lo inventas tú; el mismo se pone en Meta." },
    ],
  },
  {
    id: "ia",
    title: "Inteligencia artificial",
    fields: [
      { key: "ANTHROPIC_API_KEY", label: "Anthropic API key (Claude)", secret: true, hint: "Conversación, análisis, moodboard y campaña" },
      { key: "ANTHROPIC_MODEL", label: "Modelo de Claude", placeholder: "claude-opus-5", hint: "claude-opus-5 (default) o claude-sonnet-5 (más barato)" },
      { key: "OPENAI_API_KEY", label: "OpenAI API key (GPT Image)", secret: true, hint: "Imágenes del moodboard y del anuncio" },
      { key: "OPENAI_IMAGE_MODEL", label: "Modelo de imagen", placeholder: "gpt-image-2", hint: "gpt-image-2 (cae a gpt-image-1 si no está disponible)" },
      { key: "OPENAI_IMAGE_QUALITY", label: "Calidad de la piel de marca (moodboard)", placeholder: "medium", hint: "low · medium · high" },
      { key: "OPENAI_AD_QUALITY", label: "Calidad del anuncio", placeholder: "high", hint: "low · medium · high — el anuncio va en high por default" },
    ],
  },
  {
    id: "sheet",
    title: "Google Sheet",
    fields: [
      { key: "APPS_SCRIPT_URL", label: "URL del Web App (Apps Script /exec)", hint: "Debe ser la versión con la acción wa_upsert" },
      { key: "SPREADSHEET_URL", label: "Link del Sheet (para abrirlo desde aquí)", hint: "Solo informativo" },
    ],
  },
  {
    id: "general",
    title: "General",
    fields: [
      { key: "SITE_URL", label: "URL pública del sitio", placeholder: "https://metadology.caperif.ai", hint: "Links del resultado e imágenes que descarga WhatsApp" },
      { key: "CAPERIFAI_CTA_URL", label: "Link de agenda (CTA final)", placeholder: "https://calendar.app.google/…" },
    ],
  },
];

export const SETTING_KEYS = SETTING_GROUPS.flatMap((g) => g.fields.map((f) => f.key));

const DEFAULTS = {
  ANTHROPIC_MODEL: "claude-opus-5",
  OPENAI_IMAGE_MODEL: "gpt-image-2",
  OPENAI_IMAGE_QUALITY: "medium",
  OPENAI_AD_QUALITY: "high",
  SITE_URL: "https://metadology.caperif.ai",
  CAPERIFAI_CTA_URL: "https://calendar.app.google/oqKtfT6Hkv4eET5u8",
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyzmGS0QC27C9WNsaD7rKmEebPnQSGIA0TS6YXBIzFdmOCPqPZR2fFLE0h6iNgvF-JU/exec",
};

const clean = (v) => (v == null ? "" : String(v).trim().replace(/^["']|["']$/g, ""));

let cache = { at: 0, data: null };

export async function loadSettings() {
  if (cache.data && Date.now() - cache.at < 5000) return cache.data;
  let data = {};
  try {
    data = (await kvGet(KEY)) || {};
  } catch (e) {
    console.warn("[settings] no se pudo leer el store:", e?.message || e);
  }
  cache = { at: Date.now(), data };
  return data;
}

/** Valor efectivo: store → env → default. */
export async function getSetting(key) {
  const stored = await loadSettings();
  return clean(stored[key]) || clean(process.env[key]) || DEFAULTS[key] || "";
}

export async function getSettings(keys) {
  const out = {};
  for (const k of keys) out[k] = await getSetting(k);
  return out;
}

export async function saveSettings(patch) {
  const current = (await kvGet(KEY)) || {};
  for (const k of SETTING_KEYS) {
    if (k in patch) {
      const v = clean(patch[k]);
      if (v) current[k] = v;
      else delete current[k];
    }
  }
  current.updatedAt = Date.now();
  await kvSet(KEY, current);
  cache = { at: 0, data: null };
  return current;
}

function mask(v) {
  if (!v) return "";
  if (v.length <= 8) return "••••";
  return `${v.slice(0, 4)}…${v.slice(-4)}`;
}

/** Vista para el back office: qué hay guardado, de dónde viene y los secretos enmascarados. */
export async function describeSettings() {
  const stored = (await kvGet(KEY)) || {};
  return SETTING_GROUPS.map((g) => ({
    ...g,
    fields: g.fields.map((f) => {
      const s = clean(stored[f.key]);
      const e = clean(process.env[f.key]);
      const effective = s || e || DEFAULTS[f.key] || "";
      return {
        ...f,
        source: s ? "store" : e ? "env" : DEFAULTS[f.key] ? "default" : "none",
        value: f.secret ? "" : s,
        display: f.secret ? mask(effective) : effective,
        set: !!effective,
      };
    }),
  }));
}
