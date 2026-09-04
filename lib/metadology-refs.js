// Referencias del sistema Metadology (v4.8 + v5 + creative engine) compactadas para el prompt de campaña.
// Fuente: skills metadology-v4-8 (design-system, prompt-assembly, copy-framework, clasificacion),
// metadology-v5 (angulos, segmentacion, meta-fields) y metadology-creative-engine (matriz 4B/4C).

export const PATRONES_ESTATICOS = `
BIBLIOTECA DE PATRONES (esqueletos ganadores SIN marca — el esqueleto es invariante, la piel es variable):

P-001 · Timeline Static · familia gráfico/data · celda: cualquier industria · problem/solution aware · sof 1-2 · deseo funcional→transformación
  esqueleto: (1) headline con trigger word arriba → (2) 3 filas cronometradas «1 hora / 7 días / 60-90 días» con un beneficio dimensionalizado cada una, ícono lineal por fila → (3) CTA + urgencia abajo
  mecánica: future-pacing; empieza en 1h-24h (nunca en 30 días); el beneficio lejano sube el ticket
  skinning: acento en la trigger word y en los hitos; display en headline; íconos según el arte de marca

P-002 · Comparación Editorial · gráfico/data · real estate, compra considerada, B2B · solution aware · sof 3-4 · mecanismo
  esqueleto: dos columnas · cifra/beneficio héroe a la izquierda vs benchmark a la derecha · divisor fino · caption en minúscula · fuente citada al pie · CTA discreto
  mecánica: truth-teller; posiciona el indicador correcto; lujo = jerarquía tipográfica, NUNCA color de alarma
  skinning: display serif/grotesk de marca; acento SOLO en la cifra héroe; neutros de marca en el divisor

P-004 · Ingredient / Component Callout · fotográfico · DTC, belleza, food, suplementos · solution→product aware · mecanismo
  esqueleto: producto héroe centrado y nítido · 3-5 componentes/ingredientes alrededor con líneas rotuladas · headline arriba · CTA abajo · fondo en color de marca
  mecánica: hace tangible «qué trae dentro»; justifica precio/calidad

P-005 · Grid of 4 · gráfico · DTC, apparel, home · product aware · funcional
  esqueleto: cuadrícula 2×2 del mismo producto en 4 usos/contextos · copy chico en una esquina · CTA
  mecánica: rango/versatilidad en un solo frame

P-006 · Day vs Night · fotográfico · DTC, belleza, wellness · product aware · emocional
  esqueleto: dos mitades gemelas del mismo producto en dos momentos opuestos (AM/PM, trabajo/ocio) · label por mitad · headline puente
  mecánica: dos ocasiones de uso en un frame

P-007 · Before / After Split · fotográfico · wellness, belleza, home, servicios · problem→product aware · funcional→emocional
  esqueleto: dos paneles contiguos de la transformación con labels «Antes / Después» y caption de tiempo · headline puente arriba · CTA abajo
  mecánica: prueba de resultado, la promesa más legible (compliance en salud)

P-008 · Problem–Solution Stack · gráfico/data · servicios, DTC, SaaS · problem aware · funcional
  esqueleto: headline arriba → panel-problema (tenso, desaturado) → divisor → panel-solución (alivio, en acento, con el producto/mecanismo) → CTA
  mecánica: espeja el modelo mental del comprador; una sola idea

P-009 · Statement / Big-Claim · fotográfico/escena · cualquier industria · unaware→most aware · identidad
  esqueleto: afirmación disruptiva gigante (<7 palabras) centrada · sub-línea pequeña · escena o producto de fondo con mucho aire · marca diminuta · CTA pill
  mecánica: pattern interrupt puro; entra por identidad, no por producto

P-010 · Native UI / Fake Post · nativo · DTC, servicios · product aware · emocional
  esqueleto: imita un comentario/DM/reseña de 5★ de FB o IG con avatar, nombre real y fecha · el texto de la reseña es el copy · sin chrome de marca
  mecánica: lee como prueba social orgánica, no como anuncio

P-011 · Ugly / Lo-fi Native · nativo · DTC, servicios locales · TOF frío · funcional
  esqueleto: foto de celular sin pulir del producto/servicio real · texto nativo tipo post encima · cero brand chrome
  mecánica: no parece anuncio → más thumb-stop en frío

P-012 · Testimonial / Review Card · testimonial · cualquier industria · product aware, retargeting · emocional
  esqueleto: rostro/escena real del cliente · cita con una CIFRA específica destacada en acento · 5★ · nombre y ciudad · CTA
  mecánica: prueba social concreta; el número vence al adjetivo

P-013 · Listicle «[N] razones» · gráfico/data · DTC, SaaS, high-ticket · solution aware · mecanismo
  esqueleto: headline «[N] razones por las que [audiencia] se cambió a [producto]» · lista numerada escaneable (3-5) con íconos lineales a la izquierda · producto/pantalla a la derecha · CTA abajo
  mecánica: curiosity + escaneo fácil

P-014 · PR / Authority Wall · gráfico · fintech, salud, high-ticket · sof 3-5 · mecanismo
  esqueleto: fila de «visto en» / premios / logos reales + UN claim grande · CTA (solo si la autoridad es real y defendible)

P-015 · Founder Static Manifesto · fotográfico · marcas con fundador, local, high-ticket · problem→product aware · identidad
  esqueleto: retrato del fundador (luz del moodboard) · línea-manifiesto en primera persona como headline · firma · producto/marca discretos · CTA
  mecánica: humaniza; sube confianza

AJUSTES POR FAMILIA (van en el prompt de imagen):
- gráfico/data (P-001, P-002, P-005, P-008, P-013, P-014): jerarquía tipográfica limpia, tarjetas/íconos lineales en la paleta de marca; el acento marca el foco (la solución, la cifra, el claim). Escena real detrás o fondo de marca; nunca clipart.
- fotográfico/escena (P-004, P-006, P-007, P-009, P-015): escena real con la luz del moodboard; producto/persona nítidos; palabra-fantasma «ghosted» al fondo si el patrón lo pide; look editorial premium; nada de vector plano.
- nativo (P-010, P-011): la piel de marca se subordina a la estética de la plataforma o del «post real»: respetar la UI de FB/IG o el look lo-fi de celular; el acento de marca casi no aparece.
- testimonial (P-012): rostro real, la CIFRA en acento, atribución real (nombre/ciudad).`;

export const FIT_LOGIC = `
FIT LOGIC — qué patrones jalar (Industria 4B ∩ Consciencia 4C):

4C · VISUAL CORRECTO POR ETAPA DE CONSCIENCIA (regla dura):
- Unaware → lifestyle aspiracional que conecta identidad con el problema. PROHIBIDO: producto, before/after. Patrones: P-009, P-011, P-015.
- Problem aware → el problema resaltado. PROHIBIDO: producto solo. Patrones: P-007, P-008, P-009, P-001.
- Solution aware → la solución EN ACCIÓN, comparada. PROHIBIDO: lifestyle vago. Patrones: P-002, P-013, P-004, P-008.
- Product aware → producto de frente, gente real usándolo. Patrones: P-012, P-010, P-005, P-006, P-014, P-015.
- Most aware → producto + oferta gigante. PROHIBIDO: educación. Patrones: P-009 (oferta), P-012.

4B · PREFERENCIAS DE ESTÁTICOS POR INDUSTRIA:
- E-commerce/DTC: product shot, comparación, before/after, testimonial, promo, ugly · ángulos: PAS, transformación, negative-to-positive, prueba social, FOMO
- Moda/Belleza: product shot lifestyle, flat lay, before/after, testimonial · aspiracional, prueba social, FOMO (drops), curiosity
- SaaS/B2B: screenshot dashboard, comparación, specs, testimonial, native UI · PAS, error, objeciones, ROI («así resolví X» > features)
- Salud/Wellness: before/after (compliance), testimonial con resultado, educational, timeline · transformación, miedo con solución, myth-busting
- Finanzas/Fintech: testimonial, educational, PR/authority, statement · error («el error que te cuesta dinero»), miedo (fees), myth-busting · educar > vender; sin emojis
- Servicios locales: before/after, testimonial local, ugly, problem-solution, promo · PAS, prueba social local, autoridad · CIUDAD en el hook
- Real estate: comparación editorial (cifra/m²), statement (cifra héroe), native premium, split fotográfico, PR/authority · truth-teller, objection-jiu-jitsu, us-vs-them · cifras con benchmark; lujo = tipografía, nunca color de alarma; sin emojis
- Gaming/Apps: screenshot gameplay, comparación, statement · curiosity, news hijack, FOMO
- High-ticket/Coaching: listicle, testimonial de transformación, PR/authority, teaser · transformación, us-vs-them, secret, error, curiosity gap
- Restaurantes/Food: close-up apetitoso, ugly (foto real del plato), promo, testimonial local · deseo sensorial, prueba social local, FOMO estacional`;

export const ANGULOS_28 = `
LIBRERÍA DE ÁNGULOS — 28 tipos en 7 familias. Un ángulo = MEZCLA de 2-3 tipos (nunca un tipo puro, salvo A1/G1) × dolor/deseo en voz del cliente × nivel del iceberg × etapa de consciencia → BIG IDEA + TRIGGER WORD.
A DESEO: A1 claim directo (sof 1-2, específico + compresión de tiempo) · A2 economía de esfuerzo (resultado MENOS el costo esperado; universal) · A3 historia de transformación (sof 3-5) · A4 upgrade de identidad (sof 5, iceberg 4-5)
B MIEDO/DOLOR: B1 agitación de miedo (sof 1-3; amenaza HIPERESPECÍFICA o falla) · B2 enemigo oculto/causa raíz (sof 3-4; exige mecanismo único) · B3 error/qué evitar (unaware→solution) · B4 autodiagnóstico (unaware/problem; que se descubra solo)
C CURIOSIDAD: C1 loop abierto (NUNCA solo; solo como hook) · C2 conocimiento suprimido (sof 3-5) · C3 contrarian (sof 3-5; requiere research) · C4 paradoja (sof 4-5)
D PRUEBA: D1 descubrimiento/«nuevo» (sof 3-4) · D2 razón lógica/dato (MOF/BOF; TOF solo audiencias analíticas) · D3 demostración (sof 4; PRIORIZAR si el producto es demostrable) · D4 prueba social/manada (product aware)
E AUTORIDAD: E1 experto/guía (sof 3-4) · E2 acceso exclusivo/insider (identidad) · E3 autoridad prestada · E4 proclamación audaz (sof 2-3; SIEMPRE con credibilidad)
F HISTORIA: F1 confesión primera persona (prioridad 2026) · F2 héroe improbable «yo era igual que tú» (sof 5) · F3 topical/newsjacking (unaware) · F4 controversial/tabú
G OFERTA: G1 problema–solución (ESTRUCTURAL, no cuenta como ángulo) · G2 deal directo (solo BOF) · G3 variedad/opcionalidad (MOF) · G4 escasez/urgencia (BOF; SIEMPRE con razón)
Selector por sofisticación: 1-2 → A1 A2 G1 B1 E4 · 3 → B2 C2 C3 D1 E1 E4 · 4 → B2 C4 D1 D3 D4 C3 · 5 → A4 F2 C4 F1 A3
Selector por consciencia: unaware → B4 B3 A4 F3 E2 · problem → B1 B3 B4 A1 G1 · solution → B2 C3 D1 D3 E1 · product → D3 D4 E3 G3 · most → G2 G4 D4
Polarización (F4/C3/E4) siempre contra el enemigo común (creencia vieja, táctica obsoleta), jamás contra personas.

TRIGGER WORDS (van en el hook): Por fin (valida lucha larga) · Reto (loss→gain) · Simple (economía de esfuerzo) · Evita (contrarian, solo con research) · Advertencia (miedo→acción) · Nuevo (sof 3-4) · Comprobado (siempre respaldado) · Solo (FOMO: TOF junto al CTA, BOF en el hook).`;

export const COPY_FRAMEWORK = `
COPY FRAMEWORK «Influencia Invisible» — se vende en la capa PSICOLÓGICA, nunca en la táctica (características + lógica = prohibido).
1) PCOR antes de escribir: Problemas (dolor que lo desvela, voz literal) · Cuestionamientos (dudas que paralizan) · Obstáculos (barreras) · Resultados (transformación + estatus). 2-3 bullets por letra.
2) Interés propio: todo copy pasa ≥2 de: anulación del esfuerzo · superioridad de estatus · independencia · fortificación del ego · intercambio limpio.
3) Talón de Aquiles → ángulo: inseguridad competitiva → «ventaja injusta» · sed de validación → exclusividad · miedo al caos → sistema de control · gratificación → recompensa rápida · necesidad de impulso → «vaca lechera».
4) TITULAR (H1) = [GRAN RESULTADO] + [ATAJO o TIEMPO específico] − [DOLOR o ESFUERZO temido]. 5 variantes, cada una activando una regla de oro distinta: eclipsa a la masa · siembra el enigma · toma postura · adopta autoridad · usa el contraste. Marcar H1★. Rechazar titulares invisibles («Cómo mejorar tus ventas hoy»); estándar = magnético («El método casi invisible que hace que tu competencia trabaje para ti»). Si no incomoda un poco a la competencia, es débil. Siempre defendible.
5) TEXTO PRINCIPAL: elegir PAS (dolor agudo, problem aware, sof 1-3) o BAB (aspiracional/identidad, sof 4-5, high-ticket), mapeado sobre Hook→Valor→Oferta. Asedio simultáneo: corazón (iceberg) Y mente (mecanismo + prueba).
   - Hook (primeros ≤125 caracteres): H1★ adaptado + FILTRO DE SEGMENTO (direct address «Si vendes en Amazon…» / dolor identitario / exclusión explícita «Esto NO es para…») + trigger word. Hooks universales («¿Quieres ganar más?») = prohibidos.
   - Valor: agitación (PAS) o After (BAB) + mecanismo + autoridad + bandera (garantía/reversal de riesgo); mata la objeción (PCOR-C), elimina el obstáculo (PCOR-O).
   - Oferta = cierre sigiloso en 3 pasos: brecha de sinceridad (admitir una limitación honesta) → efecto espejo (reflejar deseos/frustraciones) → cierre por valor de liberación (precio anclado al costo de NO avanzar). Un solo CTA.
   - Saltos de línea reales entre bloques. Emojis: máx 2-3 funcionales (cero en real estate/fintech/legal). Sin hashtags.
6) CAMPOS META: TÍTULO ≤40 caracteres = H1★ comprimido (carga semántica al inicio; móvil trunca ~27; sin punto final; nunca la marca sola) · DESCRIPCIÓN ≤30 = reversal de riesgo, escasez con razón o ancla de precio (nunca info crítica; no repetir el título) · BOTÓN CTA literal del enum: Más información · Comprar · Registrarte · Suscribirte · Enviar mensaje · Reservar · Obtener oferta · Descargar · Solicitar precio · Contactarnos · Ver más · Aplicar ahora (lead magnet → Descargar; demo B2B → Solicitar precio/Más información; WhatsApp → Enviar mensaje; e-comm → Comprar; high-ticket → Aplicar ahora).
7) Línea de POSTURA del batch: enemigo común + a quién sirve («Para quien busca crecer en serio; si te conformas, no es para ti»).
8) Localización: adaptar, no traducir; trato (tú/vos/usted), modismos, moneda y formato del mercado. Claims y cifras SIEMPRE defendibles; sin datos, sin cifras inventadas.`;

export const SEGMENTACION = `
SEGMENTACIÓN POR ANUNCIO (Advantage+): el ad set no segmenta; EL ANUNCIO ES LA SEGMENTACIÓN. Cada creativo declara a quién le habla con dos filtros:
- FILTRO DE COPY: el hook nombra al segmento (direct address / dolor identitario / exclusión explícita) dentro de los primeros 125 caracteres.
- FILTRO VISUAL: casting (edad, género, look, vestuario del segmento) · locación/contexto (donde vive ese segmento: oficina corporativa ≠ taller ≠ cocina de casa) · props/artefactos que ese segmento reconoce como suyos · MARCADOR DE SEGMENTO baked-in en la zona superior (rol, ciudad, cifra, etapa de vida).
Prohibido: stock genérico intercambiable entre segmentos. Test: si le cambio el headline, ¿este visual serviría para otro segmento? Si sí, no está segmentando.`;
