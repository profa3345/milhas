// src/services/smilesService.js
// Chama a API interna da Smiles (a mesma que o site deles usa).
// Não requer chave — mas pode mudar se a Smiles alterar o contrato.
//
// ATENÇÃO: chamadas diretas do browser geram erro de CORS.
// Use um proxy reverso. Opções gratuitas:
//   • Vercel Edge Function  →  /api/smiles  (recomendado, já configurado abaixo)
//   • Cloudflare Worker
//   • Firebase Cloud Function
//
// Em desenvolvimento local, rode o proxy Vercel:
//   npx vercel dev
// ---------------------------------------------------------------------------

const PROXY = "/api/smiles"; // rota do Edge Function (ver /api/smiles.js)

// Cabines aceitas pela Smiles
export const CABINS = {
  ALL:       "Todas",
  ECONOMIC:  "Econômica",
  BUSINESS:  "Executiva",
  FIRST:     "Primeira Classe",
};

/**
 * Busca voos de milhas na Smiles.
 *
 * @param {object} params
 * @param {string} params.origin        — IATA de origem  (ex: "GRU")
 * @param {string} params.destination   — IATA de destino (ex: "MIA")
 * @param {string} params.date          — "YYYY-MM-DD"
 * @param {string} params.cabin         — "ALL" | "ECONOMIC" | "BUSINESS" | "FIRST"
 * @param {number} params.adults        — passageiros adultos (padrão 1)
 * @returns {Promise<Flight[]>}
 */
export async function searchSmiles({ origin, destination, date, cabin = "ALL", adults = 1 }) {
  const params = new URLSearchParams({
    originAirportCode:      origin,
    destinationAirportCode: destination,
    departureDate:          date,         // "2025-08-15"
    adults:                 adults,
    cabin,
    tripType:               "2",          // 2 = só ida
    currencyCode:           "BRL",
  });

  const res = await fetch(`${PROXY}?${params}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Smiles API error ${res.status}: ${text}`);
  }

  const json = await res.json();
  return parseFlights(json);
}

// ---------------------------------------------------------------------------
// Parser — transforma a resposta bruta da Smiles no formato interno
// ---------------------------------------------------------------------------
function parseFlights(raw) {
  const list = raw?.requestedFlightSegmentList?.[0]?.flightList ?? [];

  return list
    .map((f) => {
      const seg   = f.segmentList?.[0] ?? {};
      const fare  = f.fareList?.[0]    ?? {};
      const miles = fare.miles ?? fare.milesWithTax ?? null;

      if (!miles) return null;

      return {
        id:           f.uid ?? Math.random().toString(36).slice(2),
        airline:      seg.airline?.description ?? "Desconhecida",
        airlineCode:  seg.airline?.code        ?? "??",
        flightNumber: `${seg.airline?.code ?? ""}${seg.flightNumber ?? ""}`,
        origin:       seg.departure?.airportCode ?? "",
        destination:  seg.arrival?.airportCode   ?? "",
        departureTime:seg.departure?.date         ?? "",
        arrivalTime:  seg.arrival?.date           ?? "",
        durationMin:  seg.duration               ?? 0,
        stops:        (f.segmentList?.length ?? 1) - 1,

        // milhas e taxas
        miles,
        milesWithTax: fare.milesWithTax ?? miles,
        taxes:        fare.airlineTax   ?? 0,
        taxesBRL:     fare.airlineTax   ?? 0,

        // flags importantes
        isAward:      fare.type === "AWARD" || fare.type === "SMILES_AWARD",
        isPartner:    seg.airline?.code !== "G3",  // G3 = GOL (programa próprio)
        hasBaggage:   fare.baggage?.quantity > 0 ?? false,
        baggageKg:    fare.baggage?.weight       ?? 0,
        cabin:        fare.cabin ?? "ECONOMIC",

        // raw para debug
        _raw: f,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.miles - b.miles);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${m > 0 ? ` ${m}min` : ""}`;
}

export function formatTime(dateStr) {
  if (!dateStr) return "--:--";
  // "2025-08-15T21:25:00.000-03:00" → "21h25"
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`;
}

export function airlineLogo(code) {
  // Logos via API pública do Clearbit / simple-icons fallback
  const map = {
    AA: "https://www.gstatic.com/flights/airline_logos/70px/AA.png",
    LA: "https://www.gstatic.com/flights/airline_logos/70px/LA.png",
    G3: "https://www.gstatic.com/flights/airline_logos/70px/G3.png",
    CM: "https://www.gstatic.com/flights/airline_logos/70px/CM.png",
    TP: "https://www.gstatic.com/flights/airline_logos/70px/TP.png",
    DL: "https://www.gstatic.com/flights/airline_logos/70px/DL.png",
    UA: "https://www.gstatic.com/flights/airline_logos/70px/UA.png",
    AF: "https://www.gstatic.com/flights/airline_logos/70px/AF.png",
    IB: "https://www.gstatic.com/flights/airline_logos/70px/IB.png",
    LH: "https://www.gstatic.com/flights/airline_logos/70px/LH.png",
  };
  return map[code] ?? null;
}
