/**
 * Caperifai · Captura de leads + candado por correo (1 análisis gratis por persona)
 *
 * Pega este código en tu proyecto de Apps Script (el del Web App /exec que ya tienes),
 * y vuelve a desplegar como Web App con acceso "Cualquier persona".
 *
 * Soporta dos acciones vía POST (JSON):
 *   { "action": "check", "correo": "x@y.com" }  -> { ok:true, used:true|false }
 *   { "action": "lead",  ...campos del form }   -> { ok:true, used:false } (o duplicate:true)
 *
 * El backend de Next.js (/api/analyze) llama "check" antes de generar y "lead" al terminar.
 */

const SHEET_NAME = "Leads";
const HEADERS = ["fecha", "nombre", "correo", "telefono", "empresa", "producto", "link", "problema"];

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
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

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const sh = getSheet();
    const action = body.action || "lead";

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
  return jsonOut({ ok: true, service: "caperifai-leads" });
}
