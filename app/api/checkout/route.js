export const runtime = "nodejs";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";

// Precio (~$27 USD) por moneda. unit_amount en la subunidad (centavos). Todas 2-decimales.
const PRICES = {
  usd: 2700, // $27.00
  mxn: 49900, // ~$499 MXN
  eur: 2500, // €25.00
  gbp: 2100, // £21.00
  brl: 14900, // ~R$149
  cad: 3700, // CA$37
  aud: 4100, // A$41
};

// País → moneda. Lo no listado cae a USD (que funciona en la mayoría de tarjetas).
const COUNTRY_CURRENCY = {
  MX: "mxn", US: "usd", PR: "usd", BR: "brl",
  ES: "eur", DE: "eur", FR: "eur", IT: "eur", PT: "eur", NL: "eur", IE: "eur",
  GB: "gbp", CA: "cad", AU: "aud",
};

export async function POST(req) {
  if (!STRIPE_KEY) {
    return Response.json({ error: "Falta STRIPE_SECRET_KEY en el servidor." }, { status: 500 });
  }
  let body = {};
  try { body = await req.json(); } catch {}

  const country = String(req.headers.get("x-vercel-ip-country") || body.country || "US").toUpperCase();
  let currency = COUNTRY_CURRENCY[country] || "usd";
  if (!PRICES[currency]) currency = "usd";
  const unit_amount = PRICES[currency];

  const origin =
    req.headers.get("origin") ||
    (() => { try { return new URL(req.url).origin; } catch { return "https://metadology.caperif.ai"; } })();

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", currency);
  params.set("line_items[0][price_data][unit_amount]", String(unit_amount));
  params.set("line_items[0][price_data][product_data][name]", "Campaña completa lista para lanzar — Caperifai");
  params.set(
    "line_items[0][price_data][product_data][description]",
    "Set de 6-10 ads por temperatura, prompts + anuncios en imagen, scripts para videos y plan de testing."
  );
  params.set("success_url", `${origin}/?compra=ok`);
  params.set("cancel_url", `${origin}/?compra=cancelada`);
  params.append("payment_method_types[]", "card");
  if (body.email && /\S+@\S+\.\S+/.test(body.email)) params.set("customer_email", body.email);

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.url) {
      return Response.json({ error: json?.error?.message || `Stripe ${res.status}` }, { status: 502 });
    }
    return Response.json({ url: json.url });
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 502 });
  }
}
