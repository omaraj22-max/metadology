// ICP de Caperifai para la landing de temporada (/campañas-navidenas).
//
// Empresas en México, de 10 a 200 personas, que dirige el fundador o CEO. Ya invierten
// en Meta o Google (mínimo $10,000 MXN al mes), hoy dependen de una agencia o freelancer
// que no les entrega resultados claros, y tienen un modelo donde un lead o una venta
// se puede medir.
//
// Las opciones del formulario y la regla de calificación viven juntas aquí para que no
// se desincronicen. La calificación se calcula en el servidor (/api/temporada) y es la
// única fuente de verdad: el navegador solo dispara el evento Lead si el API dice
// calificado = true.

export const OPTIONS = {
  giro: ["Banquetes y catering", "Meseros y personal", "Salones y eventos", "Mobiliario y carpas", "Audio y entretenimiento", "Foto y video", "Decoración", "Otro servicio"],
  pais: ["México", "Otro país"],
  rol: ["Fundador o dueño", "CEO o director general", "Gerente o encargado de marketing", "Otro puesto"],
  tamano: ["Menos de 10", "10 a 50", "51 a 200", "Más de 200 personas"],
  canales: ["Meta (Facebook / Instagram)", "Google", "Meta y Google", "Todavía no invierto"],
  inversion: ["Todavía no invierto", "Menos de $10,000", "$10,000 a $25,000", "$25,000 a $50,000", "Más de $50,000"],
  operador: ["Una agencia", "Un freelancer", "Mi equipo interno", "Yo mismo", "Nadie todavía"],
  resultados: ["Sí, sé cuánto me cuesta cada cliente", "Más o menos", "No, no tengo claridad"],
  medicion: ["Sí, cada lead o venta queda registrado", "Solo en parte", "No los medimos"],
  modalidad: ["Pago por lead", "Campaña completa", "Quiero que me asesoren"],
};

// Cada regla: [campo, valores que SÍ cumplen, razón que se guarda cuando no cumple].
const RULES = [
  ["pais", ["México"], "Fuera de México"],
  ["tamano", ["10 a 50", "51 a 200"], "Tamaño fuera de 10–200"],
  ["rol", ["Fundador o dueño", "CEO o director general"], "No es fundador/CEO"],
  ["canales", ["Meta (Facebook / Instagram)", "Google", "Meta y Google"], "No invierte en Meta/Google"],
  ["inversion", ["$10,000 a $25,000", "$25,000 a $50,000", "Más de $50,000"], "Inversión < $10,000"],
  ["operador", ["Una agencia", "Un freelancer"], "No depende de agencia/freelancer"],
  ["resultados", ["Más o menos", "No, no tengo claridad"], "Ya tiene resultados claros"],
  ["medicion", ["Sí, cada lead o venta queda registrado", "Solo en parte"], "No puede medir leads/ventas"],
];

export function qualify(lead) {
  const fallas = RULES.filter(([k, ok]) => !ok.includes(lead[k])).map(([, , why]) => why);
  return { calificado: fallas.length === 0, fallas };
}
