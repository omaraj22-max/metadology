import { kvGet, K } from "@/lib/store";

export const runtime = "nodejs";

// Sirve las imágenes generadas (moodboard / anuncio). WhatsApp las descarga desde aquí.
export async function GET(_req, { params }) {
  const id = String(params?.id || "").replace(/[^a-z0-9]/gi, "");
  const img = id ? await kvGet(K.img(id)) : null;
  if (!img?.b64) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(img.b64, "base64"), {
    status: 200,
    headers: {
      "Content-Type": img.mime || "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
