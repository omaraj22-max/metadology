# Metadology por WhatsApp

Aria conversa por WhatsApp, hace las 4 preguntas del formulario y entrega el moodboard + el anuncio
por el mismo chat, más una página con el resultado completo. Todo vive en este proyecto (Next.js).

## Flujo

1. El usuario escribe al número de WhatsApp Business → Meta llama `POST /api/whatsapp/webhook`.
2. `lib/flow.js` lleva la conversación (Claude, con respaldo determinista): producto → link → país → problema.
   No se piden datos de contacto (el teléfono ya viene en el mensaje). Nunca se muestra competencia.
3. Con los 4 datos, corre el pipeline por etapas (`lib/pipeline.js`, cada etapa en su propia invocación de
   `POST /api/wa/process`, hasta 300 s): `brand` (scrape + análisis + moodboard JSON) → `moodboard` (imagen,
   se envía) → `campaign` (concepto/copy) → `ad` (imagen con el moodboard de referencia + entrega + link).
4. Resultado en `/r/<id>`; imágenes en `/api/wa/image/<id>`.
5. Cada conversación se espeja en el Google Sheet (pestaña **WhatsApp**, acción `wa_upsert` del Apps Script).
6. Back office en `/back-office` (contraseña `BACKOFFICE_PASSWORD`): lista, detalle con transcripción, reintentar.

Palabras clave del usuario: `reintentar` (si falló), `reiniciar` (nueva marca).

## Variables de entorno (Vercel → Settings → Environment Variables)

| Variable | Para qué |
|---|---|
| `ANTHROPIC_API_KEY` | Claude (conversación + análisis + moodboard + campaña). Ya existe. |
| `ANTHROPIC_MODEL` | Opcional. Default `claude-opus-5`. Alternativa más barata: `claude-sonnet-5`. |
| `OPENAI_API_KEY` | GPT Image (moodboard y anuncio). `OPENAI_IMAGE_MODEL` (default `gpt-image-2`, cae a `gpt-image-1`), `OPENAI_IMAGE_QUALITY` (default `medium`). |
| `META_ACCESS_TOKEN` | Token permanente (System User) de la app de Meta con permiso `whatsapp_business_messaging`. |
| `META_PHONE_NUMBER_ID` | ID del número (WhatsApp → API Setup). |
| `META_WEBHOOK_VERIFY_TOKEN` | Cadena que tú inventas; la misma se pone en Meta al registrar el webhook. |
| `META_APP_SECRET` | Opcional pero recomendado: valida la firma `X-Hub-Signature-256`. |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Upstash Redis (Vercel → Storage → Upstash Redis → Connect al proyecto los crea solos). También acepta `UPSTASH_REDIS_REST_URL/TOKEN`. |
| `BACKOFFICE_PASSWORD` | Contraseña de `/back-office`. |
| `APPS_SCRIPT_URL` | Opcional: ya hay fallback al Web App actual. Debe ser la versión con `wa_upsert` (`apps-script/Code.gs`). |
| `SITE_URL` | Opcional. Default `https://metadology.caperif.ai` (se usa para links e imágenes que descarga WhatsApp). |
| `CAPERIFAI_CTA_URL` | Opcional. Link de agenda al final. |

## Registrar el webhook en Meta

1. developers.facebook.com → tu app → WhatsApp → Configuration → Webhook → **Edit**.
2. Callback URL: `https://metadology.caperif.ai/api/whatsapp/webhook` · Verify token: el valor de `META_WEBHOOK_VERIFY_TOKEN`.
3. **Manage** → suscribir el campo `messages`.
4. Si el número es de prueba, agrega los teléfonos destinatarios en la lista de testers.

## Probar en local

```bash
npm run dev -- -p 4995
scripts/wa-sim.sh "hola"          # simula un mensaje entrante (los envíos salen en consola)
```
Sin Redis usa `.wa-store/store.json`; sin `META_*` los envíos se imprimen; sin `ANTHROPIC_API_KEY` usa las preguntas fijas.
En dev NO se escribe al Sheet real (usa `SHEET_MIRROR=1` para forzarlo).
