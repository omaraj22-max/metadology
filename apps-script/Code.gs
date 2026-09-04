/**
 * Caperifai · Apps Script del Google Sheet
 *
 * Pega este código COMPLETO en el proyecto de Apps Script del Web App /exec que ya usa el sitio
 * y vuelve a desplegar: Implementar → Administrar implementaciones → ✎ → Versión: "Nueva versión" → Implementar.
 * (Así la URL /exec se conserva y no hay que cambiar nada en Vercel.)
 *
 * Acciones vía POST (JSON):
 *   { "action": "check", "correo": "x@y.com" }   -> { ok:true, used:true|false }        (formulario web)
 *   { "action": "lead",  ...campos del form }     -> { ok:true, used:false }              (formulario web)
 *   { "action": "wa_upsert", ...conversación }    -> { ok:true, row:N }                   (WhatsApp: una fila por conversación, se actualiza)
 */

// ===== Formulario web (pestaña "Leads") =====
const SHEET_NAME = "Leads";
const HEADERS = ["fecha", "nombre", "correo", "telefono", "empresa", "producto", "link", "problema"];

// ===== WhatsApp (pestaña "WhatsApp") =====
const WA_SHEET = "WhatsApp";
const WA_HEADERS = [
  "convId", "telefono", "nombre", "inicio", "ultimaActividad", "status", "etapa",
  "producto", "link", "pais", "problema", "marca",
  "resultadoUrl", "moodboardUrl", "adUrl", "hook", "error", "mensajes", "transcript",
];

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  return sh;
}

function getWaSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(WA_SHEET);
  if (!sh) sh = ss.insertSheet(WA_SHEET);
  if (sh.getLastRow() === 0) {
    sh.appendRow(WA_HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, WA_HEADERS.length).setFontWeight("bold");
  }
  return sh;
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function emailExists(sh, email) {
  const target = String(email || "").trim().toLowerCase();
  if (!target) return false;
  const last = sh.getLastRow();
  if (last < 2) return false;
  const col = HEADERS.indexOf("correo") + 1; // 1-based
  const values = sh.getRange(2, col, last - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim().toLowerCase() === target) return true;
  }
  return false;
}

// Una fila por conversación de WhatsApp (clave: convId). Si existe, se actualiza; si no, se agrega.
function waUpsert(body) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = getWaSheet();
    const row = WA_HEADERS.map(function (h) {
      const v = body[h];
      if (v === undefined || v === null) return "";
      return typeof v === "string" ? v.slice(0, 49000) : v;
    });
    const last = sh.getLastRow();
    let target = 0;
    if (last >= 2) {
      const ids = sh.getRange(2, 1, last - 1, 1).getValues();
      for (let i = 0; i < ids.length; i++) {
        if (String(ids[i][0]) === String(body.convId)) { target = i + 2; break; }
      }
    }
    if (target) {
      sh.getRange(target, 1, 1, WA_HEADERS.length).setValues([row]);
    } else {
      sh.appendRow(row);
      target = sh.getLastRow();
    }
    return { ok: true, row: target };
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const action = body.action || "lead";

    if (action === "wa_upsert") {
      return jsonOut(waUpsert(body));
    }

    const sh = getSheet();
    if (action === "check") {
      return jsonOut({ ok: true, used: emailExists(sh, body.correo) });
    }

    // action === "lead": dedup + append
    if (emailExists(sh, body.correo)) {
      return jsonOut({ ok: true, used: true, duplicate: true });
    }
    const row = HEADERS.map(function (h) {
      if (h === "fecha") return body.fecha || new Date().toISOString();
      return body[h] || "";
    });
    sh.appendRow(row);
    return jsonOut({ ok: true, used: false });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonOut({ ok: true, service: "caperifai-leads", whatsapp: true });
}
