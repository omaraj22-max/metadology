/**
 * Caperifai · Landing de temporada (/campañas-navidenas) → Google Sheet propio
 *
 * INSTALACIÓN (una sola vez):
 * 1. Crea un Google Sheet nuevo (p. ej. "Leads Temporada Caperifai").
 * 2. En ese Sheet: Extensiones → Apps Script. Borra lo que haya y pega este archivo COMPLETO. Guarda.
 * 3. (Opcional) Configuración del proyecto (⚙) → Propiedades de la secuencia de comandos →
 *    agrega NOTIFY_EMAIL con el/los correos que reciben el aviso de cada lead (separados por coma).
 *    Si no existe, el aviso llega al dueño del script.
 * 4. Implementar → Nueva implementación → tipo "Aplicación web":
 *      Ejecutar como: Yo   ·   Quién tiene acceso: Cualquier usuario
 *    Autoriza los permisos (Sheets + enviar correo) y copia la URL que termina en /exec.
 * 5. En Vercel (proyecto metadology) agrega la variable TEMPORADA_WEBHOOK_URL = esa URL /exec
 *    y vuelve a desplegar.
 *
 * Para cambios futuros: Implementar → Administrar implementaciones → ✎ → Versión "Nueva versión"
 * (así la URL /exec no cambia).
 *
 * POST JSON { ...campos del formulario }  →  { ok:true, row:N }
 */

const SHEET = "Leads";
const HEADERS = [
  "fecha", "etapa", "calificado", "icp_fallas", "nombre", "empresa", "whatsapp", "correo",
  "rol", "pais", "giro", "tamano", "canales", "inversion", "operador", "resultados",
  "medicion", "modalidad", "notas", "fuente", "utm_source", "utm_medium",
  "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "referrer", "pagina",
];
const ETAPAS = ["Nuevo", "Contactado", "Calificado", "Llamada", "Cerrado", "Perdido"];

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) sh = ss.insertSheet(SHEET);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#EEF0FF");
    // Lista desplegable para la etapa del lead en toda la columna.
    const etapaCol = HEADERS.indexOf("etapa") + 1;
    const rule = SpreadsheetApp.newDataValidation().requireValueInList(ETAPAS, true).build();
    sh.getRange(2, etapaCol, sh.getMaxRows() - 1, 1).setDataValidation(rule);
    // Verde para los leads que cumplen el ICP.
    const calCol = HEADERS.indexOf("calificado") + 1;
    const calRange = sh.getRange(2, calCol, sh.getMaxRows() - 1, 1);
    sh.setConditionalFormatRules([
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Sí").setBackground("#D1FAE5").setFontColor("#047857").setRanges([calRange]).build(),
    ]);
  }
  return sh;
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function appendLead(body) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = getSheet();
    const row = HEADERS.map(function (h) {
      if (h === "fecha") return body.fecha ? new Date(body.fecha) : new Date();
      if (h === "etapa") return body.etapa || "Nuevo";
      const v = body[h];
      if (v === undefined || v === null) return "";
      // Evita que Sheets interprete "+52…" o "=…" como fórmula.
      if (typeof v === "string" && /^[=+\-@]/.test(v)) return "'" + v;
      return v;
    });
    sh.appendRow(row);
    return sh.getLastRow();
  } finally {
    lock.releaseLock();
  }
}

function notify(b, rowNum) {
  const to =
    PropertiesService.getScriptProperties().getProperty("NOTIFY_EMAIL") ||
    Session.getEffectiveUser().getEmail();
  if (!to) return;
  const ok = b.calificado === "Sí";
  const digits = String(b.whatsapp || "").replace(/\D/g, "");
  const wa = digits ? "https://wa.me/" + (digits.length === 10 ? "52" + digits : digits) : "";
  const lines = [
    ok ? "✅ Lead CALIFICADO (cumple el ICP). Contáctalo en menos de 15 minutos." : "⚪ Lead NO calificado: " + (b.icp_fallas || ""),
    "Fila " + rowNum + " · " + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    "",
    "Nombre: " + (b.nombre || ""),
    "Empresa: " + (b.empresa || ""),
    "Puesto: " + (b.rol || "") + " · País: " + (b.pais || ""),
    "Giro: " + (b.giro || "") + " · Tamaño: " + (b.tamano || ""),
    "WhatsApp: " + (b.whatsapp || "") + (wa ? "  →  " + wa : ""),
    "Correo: " + (b.correo || ""),
    "Se anuncia en: " + (b.canales || "") + " · Inversión mensual: " + (b.inversion || ""),
    "Opera sus campañas: " + (b.operador || ""),
    "Claridad de resultados: " + (b.resultados || ""),
    "Medición: " + (b.medicion || ""),
    "Modalidad: " + (b.modalidad || ""),
    "Notas: " + (b.notas || "—"),
    "",
    "Fuente: " + (b.fuente || "") + (b.utm_campaign ? " · campaña " + b.utm_campaign : ""),
  ];
  MailApp.sendEmail({
    to: to,
    subject: (ok ? "✅ Lead calificado: " : "Lead temporada (no ICP): ") + (b.empresa || b.nombre || "") + " · " + (b.modalidad || ""),
    body: lines.join("\n"),
  });
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const rowNum = appendLead(body);
    try {
      notify(body, rowNum);
    } catch (err) {
      console.error("notify: " + err);
    }
    return jsonOut({ ok: true, row: rowNum });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonOut({ ok: true, service: "caperifai-temporada" });
}
