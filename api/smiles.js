// api/smiles.js
// Vercel Edge Function — proxy para a API interna da Smiles.
// Resolve o bloqueio de CORS que impede chamadas diretas do browser.
//
// Deploy automático pelo Vercel quando o arquivo está em /api/
// Em dev local: npx vercel dev  (porta 3000)

export const config = { runtime: "edge" };

const SMILES_BASE =
  "https://api-air-flightsearch-green.smiles.com.br/v1/airlines/search";

// Cabeçalhos que a Smiles espera — sem eles retorna 403
const SMILES_HEADERS = {
  "Accept":           "application/json, text/plain, */*",
  "Accept-Language":  "pt-BR,pt;q=0.9",
  "Origin":           "https://www.smiles.com.br",
  "Referer":          "https://www.smiles.com.br/",
  "x-api-key":        "aJqPU7xNHl9qN3NVZnPaJ208aBgdw4NgdKBAsIxb",
  // channel e region são obrigatórios
  "channel":          "web",
  "region":           "BRASIL",
};

export default async function handler(req) {
  // Apenas GET
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { searchParams } = new URL(req.url);

  // Repassa todos os query params para a Smiles
  const upstream = new URL(SMILES_BASE);
  for (const [k, v] of searchParams.entries()) {
    upstream.searchParams.set(k, v);
  }

  try {
    const smilesRes = await fetch(upstream.toString(), {
      method:  "GET",
      headers: SMILES_HEADERS,
    });

    const body = await smilesRes.text();

    return new Response(body, {
      status:  smilesRes.status,
      headers: {
        "Content-Type":                "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status:  502,
      headers: {
        "Content-Type":                "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
