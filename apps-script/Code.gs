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
 *   { "action": "referral", ...campos del form }  -> { ok:true, row:N }                   (landing /referrals, pestaña "Referidos")
 *   { "action": "temporada", ...campos del form } -> { ok:true, row:N }                   (landing /campañas-navidenas, pestaña "Temporada")
 *
 * Aviso al equipo (temporada): cada envío manda un correo a NOTIFY_EMAIL. Configúralo en
 * Configuración del proyecto → Propiedades de la secuencia de comandos → NOTIFY_EMAIL
 * (puedes poner varios separados por coma). Si no existe, se avisa al dueño del script.
 */

// ===== Formulario web (pestaña "Leads") =====
const SHEET_NAME = "Leads";
const HEADERS = ["fecha", "nombre", "correo", "telefono", "empresa", "producto", "link", "problema"];

// ===== Landing de referidos /referrals (pestaña "Referidos") =====
const REF_SHEET = "Referidos";
const REF_HEADERS = [
  "fecha", "nombre", "correo", "empresa", "rol", "etapa",
  "presupuesto", "canales", "problema", "referido", "origen",
];

// ===== Landing de temporada /campañas-navidenas (pestaña "Temporada") =====
const TMP_SHEET = "Temporada";
const TMP_HEADERS = [
  "fecha", "etapa", "calificado", "icp_fallas", "nombre", "empresa", "whatsapp", "correo",
  "rol", "pais", "giro", "tamano", "canales", "inversion", "operador", "resultados",
  "medicion", "modalidad", "notas", "fuente", "utm_source", "utm_medium",
  "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "referrer", "pagina",
];
const TMP_ETAPAS = ["Nuevo", "Contactado", "Calificado", "Llamada", "Cerrado", "Perdido"];

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

function getRefSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(REF_SHEET);
  if (!sh) sh = ss.insertSheet(REF_SHEET);
  if (sh.getLastRow() === 0) {
    sh.appendRow(REF_HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, REF_HEADERS.length).setFontWeight("bold");
  }
  return sh;
}

function getTmpSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(TMP_SHEET);
  if (!sh) sh = ss.insertSheet(TMP_SHEET);
  if (sh.getLastRow() === 0) {
    sh.appendRow(TMP_HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, TMP_HEADERS.length).setFontWeight("bold");
    // Lista desplegable para marcar la etapa del lead en toda la columna "etapa".
    const col = TMP_HEADERS.indexOf("etapa") + 1;
    const rule = SpreadsheetApp.newDataValidation().requireValueInList(TMP_ETAPAS, true).build();
    sh.getRange(2, col, sh.getMaxRows() - 1, 1).setDataValidation(rule);
  }
  return sh;
}

// Un alta por envío de /campañas-navidenas + aviso inmediato por correo al equipo.
function temporadaAppend(body) {
  const sh = getTmpSheet();
  const row = TMP_HEADERS.map(function (h) {
    if (h === "fecha") return body.fecha ? new Date(body.fecha) : new Date();
    if (h === "etapa") return body.etapa || "Nuevo";
    const v = body[h];
    // Evita que Sheets interprete "+52…" o "=…" como fórmula.
    if (typeof v === "string" && /^[=+\-@]/.test(v)) return "'" + v;
    return v || "";
  });
  sh.appendRow(row);
  const rowNum = sh.getLastRow();
  try {
    notifyTemporada(body, rowNum);
  } catch (err) {
    console.error("notifyTemporada: " + err);
  }
  return { ok: true, row: rowNum };
}

function notifyTemporada(b, rowNum) {
  const to =
    PropertiesService.getScriptProperties().getProperty("NOTIFY_EMAIL") ||
    Session.getEffectiveUser().getEmail();
  if (!to) return;
  const digits = String(b.whatsapp || "").replace(/\D/g, "");
  const wa = digits ? "https://wa.me/" + (digits.length === 10 ? "52" + digits : digits) : "";
  const lines = [
    (b.calificado === "Sí" ? "✅ Lead CALIFICADO (cumple el ICP)" : "⚪ Lead NO calificado: " + (b.icp_fallas || "")),
    "Landing de temporada · fila " + rowNum + ", pestaña " + TMP_SHEET + ".",
    b.calificado === "Sí" ? "Contáctalo en menos de 15 minutos." : "",
    "",
    "Nombre: " + (b.nombre || ""),
    "Empresa: " + (b.empresa || ""),
    "Puesto: " + (b.rol || "") + " · País: " + (b.pais || ""),
    "Giro: " + (b.giro || ""),
    "WhatsApp: " + (b.whatsapp || "") + (wa ? "  →  " + wa : ""),
    "Correo: " + (b.correo || ""),
    "Tamaño: " + (b.tamano || ""),
    "Se anuncia en: " + (b.canales || ""),
    "Inversión mensual: " + (b.inversion || ""),
    "Opera sus campañas: " + (b.operador || ""),
    "Claridad de resultados: " + (b.resultados || ""),
    "Medición: " + (b.medicion || ""),
    "Modalidad: " + (b.modalidad || ""),
    "Notas: " + (b.notas || "—"),
    "",
    "Fuente: " + (b.fuente || "") + (b.utm_campaign ? " · campaña " + b.utm_campaign : ""),
    "Hoja: " + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
  ];
  MailApp.sendEmail({
    to: to,
    subject: (b.calificado === "Sí" ? "✅ Lead calificado temporada: " : "Lead temporada (no ICP): ") + (b.empresa || b.nombre || "") + " · " + (b.modalidad || ""),
    body: lines.join("\n"),
  });
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

// Un alta por envío del formulario de /referrals. Sin dedup: el mismo correo puede
// volver con otro partner o en otra etapa, y perder ese contacto sería peor que repetirlo.
function referralAppend(body) {
  const sh = getRefSheet();
  const row = REF_HEADERS.map(function (h) {
    if (h === "fecha") return body.fecha || new Date().toISOString();
    return body[h] || "";
  });
  sh.appendRow(row);
  return { ok: true, row: sh.getLastRow() };
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const action = body.action || "lead";

    if (action === "wa_upsert") {
      return jsonOut(waUpsert(body));
    }
    if (action === "referral") {
      return jsonOut(referralAppend(body));
    }
    if (action === "temporada") {
      return jsonOut(temporadaAppend(body));
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
  return jsonOut({ ok: true, service: "caperifai-leads", whatsapp: true, referrals: true, temporada: true });
}
