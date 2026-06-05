# Metadology — Caperifai Landing

Landing page en Next.js para Caperifai: presenta la propuesta (hero, problema, cómo funciona, qué recibes, prueba) y cierra con un lead magnet donde el visitante describe su producto y **Aria** (Claude) le devuelve un **buyer persona**, **4-5 ángulos de venta** y **2 anuncios de muestra** con la metodología METADOLOGY ADS para Meta.

## Arquitectura

- **`app/page.jsx`** — la landing completa + el lead magnet (componente cliente). Recoge el lead y, opcionalmente, lo manda al webhook de Apps Script.
- **`app/api/analyze/route.js`** — proxy server-side que llama a Claude. **La API key vive solo en el servidor**, nunca se expone al navegador.

## Variables de entorno

Copia `.env.example` a `.env.local` y rellena:

| Variable | Dónde | Para qué |
|---|---|---|
| `ANTHROPIC_API_KEY` | servidor | Llamar a Claude. **Secreta.** |
| `ANTHROPIC_MODEL` | servidor | Opcional. Default `claude-sonnet-4-6`. |
| `NEXT_PUBLIC_WEBHOOK_URL` | navegador | URL `/exec` del Apps Script donde se guardan los leads. Vacío = no se guarda lead. |
| `NEXT_PUBLIC_DEMO_URL` | navegador | Link de agenda para el botón "Agendar demo". |

## Desarrollo

```bash
npm install
cp .env.example .env.local   # y rellena ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

## Deploy en Vercel

1. Importa el repo en Vercel.
2. En **Settings → Environment Variables** agrega `ANTHROPIC_API_KEY` (y opcionalmente las demás).
3. Deploy. Cada push a `main` redeploya.
