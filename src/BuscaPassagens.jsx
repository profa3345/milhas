// src/BuscaPassagens.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Plane, Search, SlidersHorizontal, Luggage, Star, ArrowRight,
  ChevronDown, X, Loader2, AlertCircle, Clock, ArrowLeftRight,
  Filter, Sparkles, BadgeCheck,
} from "lucide-react";
import { searchSmiles, formatTime, formatDuration, airlineLogo, CABINS } from "./services/smilesService";

/* ─── Aeroportos (mesmo array do AlertasMilhas) ─────────────────────── */
const AIRPORTS = [
  { code: "GRU", city: "São Paulo",        name: "Guarulhos",               flag: "🇧🇷" },
  { code: "GIG", city: "Rio de Janeiro",   name: "Galeão",                  flag: "🇧🇷" },
  { code: "SDU", city: "Rio de Janeiro",   name: "Santos Dumont",           flag: "🇧🇷" },
  { code: "CGH", city: "São Paulo",        name: "Congonhas",               flag: "🇧🇷" },
  { code: "BSB", city: "Brasília",         name: "Presidente JK",           flag: "🇧🇷" },
  { code: "SSA", city: "Salvador",         name: "Dep. Luís Eduardo",       flag: "🇧🇷" },
  { code: "FOR", city: "Fortaleza",        name: "Pinto Martins",           flag: "🇧🇷" },
  { code: "REC", city: "Recife",           name: "Guararapes",              flag: "🇧🇷" },
  { code: "POA", city: "Porto Alegre",     name: "Salgado Filho",           flag: "🇧🇷" },
  { code: "CWB", city: "Curitiba",         name: "Afonso Pena",             flag: "🇧🇷" },
  { code: "VCP", city: "Campinas",         name: "Viracopos",               flag: "🇧🇷" },
  { code: "MAO", city: "Manaus",           name: "Eduardo Gomes",           flag: "🇧🇷" },
  { code: "BEL", city: "Belém",           name: "Val de Cans",             flag: "🇧🇷" },
  { code: "FLN", city: "Florianópolis",    name: "Hercílio Luz",            flag: "🇧🇷" },
  { code: "NAT", city: "Natal",            name: "São Gonçalo do Amarante", flag: "🇧🇷" },
  { code: "MIA", city: "Miami",            name: "Miami Intl",              flag: "🇺🇸" },
  { code: "JFK", city: "Nova York",        name: "John F. Kennedy",         flag: "🇺🇸" },
  { code: "EWR", city: "Newark",           name: "Newark Liberty",          flag: "🇺🇸" },
  { code: "LAX", city: "Los Angeles",      name: "Los Angeles Intl",        flag: "🇺🇸" },
  { code: "ORD", city: "Chicago",          name: "O'Hare",                  flag: "🇺🇸" },
  { code: "ATL", city: "Atlanta",          name: "Hartsfield-Jackson",      flag: "🇺🇸" },
  { code: "MCO", city: "Orlando",          name: "Orlando Intl",            flag: "🇺🇸" },
  { code: "IAH", city: "Houston",          name: "George Bush",             flag: "🇺🇸" },
  { code: "YYZ", city: "Toronto",          name: "Pearson",                 flag: "🇨🇦" },
  { code: "MEX", city: "Cidade do México", name: "Benito Juárez",           flag: "🇲🇽" },
  { code: "CUN", city: "Cancún",          name: "Cancún Intl",             flag: "🇲🇽" },
  { code: "EZE", city: "Buenos Aires",     name: "Ministro Pistarini",      flag: "🇦🇷" },
  { code: "SCL", city: "Santiago",         name: "Arturo Merino Benítez",   flag: "🇨🇱" },
  { code: "LIM", city: "Lima",             name: "Jorge Chávez",            flag: "🇵🇪" },
  { code: "BOG", city: "Bogotá",          name: "El Dorado",               flag: "🇨🇴" },
  { code: "PTY", city: "Panamá",          name: "Tocumen",                 flag: "🇵🇦" },
  { code: "LIS", city: "Lisboa",           name: "Humberto Delgado",        flag: "🇵🇹" },
  { code: "OPO", city: "Porto",            name: "Francisco Sá Carneiro",   flag: "🇵🇹" },
  { code: "LHR", city: "Londres",          name: "Heathrow",                flag: "🇬🇧" },
  { code: "CDG", city: "Paris",            name: "Charles de Gaulle",       flag: "🇫🇷" },
  { code: "AMS", city: "Amsterdã",        name: "Schiphol",                flag: "🇳🇱" },
  { code: "FRA", city: "Frankfurt",        name: "Frankfurt Intl",          flag: "🇩🇪" },
  { code: "MAD", city: "Madri",           name: "Barajas",                 flag: "🇪🇸" },
  { code: "FCO", city: "Roma",             name: "Fiumicino",               flag: "🇮🇹" },
  { code: "IST", city: "Istambul",        name: "Istanbul Airport",         flag: "🇹🇷" },
  { code: "DXB", city: "Dubai",            name: "Dubai Intl",              flag: "🇦🇪" },
  { code: "DOH", city: "Doha",             name: "Hamad",                   flag: "🇶🇦" },
  { code: "NRT", city: "Tóquio",          name: "Narita",                  flag: "🇯🇵" },
  { code: "SIN", city: "Singapura",        name: "Changi",                  flag: "🇸🇬" },
  { code: "SYD", city: "Sydney",           name: "Kingsford Smith",         flag: "🇦🇺" },
  { code: "JNB", city: "Joanesburgo",     name: "O.R. Tambo",              flag: "🇿🇦" },
];

/* ─── Design tokens ─────────────────────────────────────────────────── */
const C = {
  bg:     "#0B0E13",
  panel:  "#141A23",
  panel2: "#1A212C",
  panel3: "#101520",
  line:   "rgba(255,255,255,0.08)",
  txt:    "#F2F4F7",
  mut:    "#8A93A2",
  gold:   "#F5C451",
  amber:  "#FFB020",
  green:  "#3DD68C",
  red:    "#FF6B6B",
  blue:   "#4B9EFF",
};

const fmt  = (n) => n?.toLocaleString("pt-BR") ?? "—";
const fmtR = (n) => n ? `R$ ${Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—";

// data mínima = hoje
const todayStr = () => new Date().toISOString().slice(0, 10);

/* ─── AirportPicker ─────────────────────────────────────────────────── */
function AirportPicker({ value, onChange, placeholder = "Selecione" }) {
  const [q, setQ]       = useState("");
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);
  const inp             = useRef(null);
  const sel             = AIRPORTS.find((a) => a.code === value);

  const results = q.length
    ? AIRPORTS.filter((a) => {
        const s = q.toLowerCase();
        return a.code.toLowerCase().includes(s) || a.city.toLowerCase().includes(s) || a.name.toLowerCase().includes(s);
      }).slice(0, 8)
    : AIRPORTS.slice(0, 8);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQ(""); } };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", flex: 1 }}>
      <button type="button" onClick={() => { setOpen(true); setTimeout(() => inp.current?.focus(), 40); }}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          background: C.panel2, border: `1px solid ${open ? C.gold : C.line}`,
          borderRadius: 12, padding: "13px 14px", cursor: "pointer",
          color: C.txt, fontFamily: "inherit", fontSize: 15, textAlign: "left",
        }}>
        {sel ? (
          <>
            <span style={{ fontSize: 20 }}>{sel.flag}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 18, fontFamily: "'Bricolage Grotesque',sans-serif", letterSpacing: "-.02em", lineHeight: 1 }}>{sel.code}</div>
              <div style={{ fontSize: 12, color: C.mut, marginTop: 2 }}>{sel.city}</div>
            </div>
          </>
        ) : (
          <span style={{ color: C.mut, fontSize: 14 }}>{placeholder}</span>
        )}
        <ChevronDown size={14} color={C.mut} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 200,
          background: C.panel3, border: `1px solid ${C.gold}44`, borderRadius: 14,
          boxShadow: "0 20px 50px rgba(0,0,0,.6)", overflow: "hidden", animation: "fade .15s ease both",
        }}>
          <div style={{ padding: "10px 10px 6px", borderBottom: `1px solid ${C.line}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.panel2, borderRadius: 9, padding: "8px 10px" }}>
              <Search size={13} color={C.mut} />
              <input ref={inp} value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Cidade ou código IATA…"
                style={{ background: "transparent", border: "none", outline: "none", color: C.txt, fontSize: 13, flex: 1, fontFamily: "inherit" }} />
              {q && <button onClick={() => setQ("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}><X size={13} color={C.mut} /></button>}
            </div>
          </div>
          <div style={{ maxHeight: 260, overflowY: "auto" }}>
            {results.map((a) => (
              <button key={a.code} type="button" onClick={() => { onChange(a.code); setOpen(false); setQ(""); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                  background: value === a.code ? C.gold + "18" : "transparent",
                  border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  borderLeft: value === a.code ? `3px solid ${C.gold}` : "3px solid transparent",
                }}
                onMouseEnter={(e) => { if (value !== a.code) e.currentTarget.style.background = C.panel2; }}
                onMouseLeave={(e) => { if (value !== a.code) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ fontSize: 18 }}>{a.flag}</span>
                <div>
                  <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
                    <span style={{ fontWeight: 700, color: C.txt, fontFamily: "'Bricolage Grotesque',sans-serif" }}>{a.code}</span>
                    <span style={{ fontSize: 13, color: C.txt }}>{a.city}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.mut }}>{a.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── FlightCard ─────────────────────────────────────────────────────── */
function FlightCard({ flight, maxMiles }) {
  const overLimit = maxMiles && flight.miles > maxMiles;
  const logo      = airlineLogo(flight.airlineCode);

  return (
    <div style={{
      background: C.panel,
      border: `1px solid ${flight.isAward && flight.isPartner ? C.gold + "55" : C.line}`,
      borderRadius: 16, padding: "16px 18px",
      boxShadow: flight.isAward && flight.isPartner ? `0 8px 28px -14px ${C.gold}33` : "none",
      opacity: overLimit ? 0.45 : 1,
      position: "relative", overflow: "hidden",
    }}>
      {/* badge destaque */}
      {flight.isAward && flight.isPartner && (
        <div style={{
          position: "absolute", top: 0, right: 0,
          background: `linear-gradient(135deg,${C.amber},${C.gold})`,
          color: C.bg, fontSize: 10, fontWeight: 800, padding: "4px 10px",
          borderBottomLeftRadius: 10, display: "flex", alignItems: "center", gap: 4,
        }}>
          <Sparkles size={10} /> AWARD
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* logo / código */}
        <div style={{ width: 44, height: 44, borderRadius: 10, background: C.panel2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {logo
            ? <img src={logo} alt={flight.airlineCode} style={{ width: 32, height: 32, objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; }} />
            : <span style={{ fontSize: 13, fontWeight: 800, color: C.gold, fontFamily: "'Bricolage Grotesque',sans-serif" }}>{flight.airlineCode}</span>}
        </div>

        {/* cia + nº voo */}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{flight.airline}</div>
          <div style={{ fontSize: 11, color: C.mut }}>{flight.flightNumber || "—"}</div>
        </div>

        {/* horários */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 auto" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 22, fontFamily: "'Bricolage Grotesque',sans-serif", letterSpacing: "-.02em", lineHeight: 1 }}>
              {formatTime(flight.departureTime)}
            </div>
            <div style={{ fontSize: 11, color: C.mut, marginTop: 2 }}>{flight.origin}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div style={{ fontSize: 10, color: C.mut }}>{flight.durationMin ? formatDuration(flight.durationMin) : ""}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <div style={{ width: 28, height: 1, background: C.line }} />
              <Plane size={13} color={C.gold} />
              <div style={{ width: 28, height: 1, background: C.line }} />
            </div>
            <div style={{ fontSize: 10, color: C.mut }}>
              {flight.stops === 0 ? "Direto" : `${flight.stops} escala${flight.stops > 1 ? "s" : ""}`}
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 22, fontFamily: "'Bricolage Grotesque',sans-serif", letterSpacing: "-.02em", lineHeight: 1 }}>
              {formatTime(flight.arrivalTime)}
            </div>
            <div style={{ fontSize: 11, color: C.mut, marginTop: 2 }}>{flight.destination}</div>
          </div>
        </div>

        {/* milhas + taxas */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 20, fontFamily: "'Bricolage Grotesque',sans-serif", color: overLimit ? C.red : C.gold, letterSpacing: "-.02em", lineHeight: 1 }}>
            {fmt(flight.miles)}
          </div>
          <div style={{ fontSize: 10, color: C.mut, marginTop: 1 }}>milhas</div>
          {flight.taxesBRL > 0 && (
            <div style={{ fontSize: 11, color: C.mut, marginTop: 3 }}>+ {fmtR(flight.taxesBRL)}</div>
          )}
        </div>
      </div>

      {/* badges inferiores */}
      <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
        {flight.isAward && (
          <Badge color={C.gold} icon={<Star size={10} />}>Tarifa Award</Badge>
        )}
        {flight.isPartner && (
          <Badge color={C.blue} icon={<BadgeCheck size={10} />}>Outras cias.</Badge>
        )}
        {flight.hasBaggage && (
          <Badge color={C.green} icon={<Luggage size={10} />}>
            Bagagem {flight.baggageKg > 0 ? `${flight.baggageKg}kg` : "inclusa"}
          </Badge>
        )}
        {flight.stops === 0 && (
          <Badge color={C.mut}>Voo direto</Badge>
        )}
        {overLimit && (
          <Badge color={C.red}>Acima do seu teto</Badge>
        )}
      </div>

      {/* botão emissão */}
      <a
        href={`https://www.smiles.com.br/mfe/emissao-passagem/?adults=1&cabin=ALL&tripType=2&originAirport=${flight.origin}&destinationAirport=${flight.destination}`}
        target="_blank" rel="noopener noreferrer"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          marginTop: 14, padding: "9px 0", borderRadius: 10, textDecoration: "none",
          background: flight.isAward && flight.isPartner
            ? `linear-gradient(135deg,${C.amber},${C.gold})`
            : C.panel2,
          color: flight.isAward && flight.isPartner ? C.bg : C.txt,
          fontSize: 13, fontWeight: 700, fontFamily: "inherit",
          border: `1px solid ${flight.isAward && flight.isPartner ? "transparent" : C.line}`,
        }}
      >
        Ver na Smiles <ArrowRight size={13} />
      </a>
    </div>
  );
}

function Badge({ color, icon, children }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: color + "22", color, borderRadius: 99,
      fontSize: 11, fontWeight: 600, padding: "3px 9px",
    }}>
      {icon}{children}
    </span>
  );
}

/* ─── BuscaPassagens (tela principal) ──────────────────────────────── */
export default function BuscaPassagens() {
  const [origin,      setOrigin]      = useState("GRU");
  const [destination, setDestination] = useState("MIA");
  const [date,        setDate]        = useState(todayStr());
  const [cabin,       setCabin]       = useState("ALL");
  const [adults,      setAdults]      = useState(1);

  // filtros pós-busca
  const [maxMiles,    setMaxMiles]    = useState(0);      // 0 = sem limite
  const [onlyAward,   setOnlyAward]   = useState(false);
  const [onlyPartner, setOnlyPartner] = useState(false);
  const [onlyBaggage, setOnlyBaggage] = useState(false);
  const [sortBy,      setSortBy]      = useState("miles"); // "miles" | "duration"
  const [showFilters, setShowFilters] = useState(false);

  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [searched, setSearched] = useState(false);

  const swap = () => { setOrigin(destination); setDestination(origin); };

  const handleSearch = async () => {
    if (!origin || !destination || !date) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    setResults([]);
    try {
      const data = await searchSmiles({ origin, destination, date, cabin, adults });
      setResults(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // filtragem + ordenação
  const filtered = results
    .filter((f) => !onlyAward   || f.isAward)
    .filter((f) => !onlyPartner || f.isPartner)
    .filter((f) => !onlyBaggage || f.hasBaggage)
    .filter((f) => !maxMiles    || f.miles <= maxMiles)
    .sort((a, b) => sortBy === "miles" ? a.miles - b.miles : a.durationMin - b.durationMin);

  const awardCount   = results.filter((f) => f.isAward).length;
  const partnerCount = results.filter((f) => f.isPartner).length;
  const minMiles     = results.length ? Math.min(...results.map((f) => f.miles)) : 0;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.txt, fontFamily: "'Albert Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Albert+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        .display{font-family:'Bricolage Grotesque',sans-serif;letter-spacing:-.02em;}
        .fade{animation:fade .35s ease both;}
        @keyframes fade{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        .field{background:${C.panel2};border:1px solid ${C.line};color:${C.txt};border-radius:11px;padding:10px 13px;font-size:14px;font-family:inherit;}
        .field:focus{outline:none;border-color:${C.gold};}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:${C.line};border-radius:99px;}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "22px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg,${C.amber},${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", color: C.bg }}>
            <Plane size={21} strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="display" style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>MilhasRadar · Busca</h1>
            <p style={{ margin: 0, fontSize: 13, color: C.mut }}>Passagens prêmio via Smiles em tempo real</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 20px" }}>

        {/* ── FORMULÁRIO ── */}
        <div className="fade" style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 20, padding: 20 }}>

          {/* rota */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 12, color: C.mut, fontWeight: 600, display: "block", marginBottom: 6 }}>Origem</span>
              <AirportPicker value={origin} onChange={setOrigin} placeholder="De onde?" />
            </div>

            {/* swap */}
            <button onClick={swap} type="button" style={{
              width: 42, height: 42, borderRadius: 11, flexShrink: 0, marginBottom: 1,
              background: C.panel2, border: `1px solid ${C.line}`, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", color: C.gold,
            }}>
              <ArrowLeftRight size={16} />
            </button>

            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 12, color: C.mut, fontWeight: 600, display: "block", marginBottom: 6 }}>Destino</span>
              <AirportPicker value={destination} onChange={setDestination} placeholder="Para onde?" />
            </div>
          </div>

          {/* data + cabine + passageiros */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: 10, marginTop: 12 }}>
            <div>
              <span style={{ fontSize: 12, color: C.mut, fontWeight: 600, display: "block", marginBottom: 6 }}>Data de ida</span>
              <input type="date" className="field" value={date} min={todayStr()}
                onChange={(e) => setDate(e.target.value)} style={{ width: "100%", colorScheme: "dark" }} />
            </div>
            <div>
              <span style={{ fontSize: 12, color: C.mut, fontWeight: 600, display: "block", marginBottom: 6 }}>Cabine</span>
              <select className="field" value={cabin} onChange={(e) => setCabin(e.target.value)} style={{ width: "100%" }}>
                {Object.entries(CABINS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <span style={{ fontSize: 12, color: C.mut, fontWeight: 600, display: "block", marginBottom: 6 }}>Adultos</span>
              <select className="field" value={adults} onChange={(e) => setAdults(+e.target.value)} style={{ width: "100%" }}>
                {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* botão buscar */}
          <button onClick={handleSearch} disabled={loading || !origin || !destination || !date}
            style={{
              marginTop: 14, width: "100%", border: "none",
              cursor: loading ? "wait" : "pointer",
              background: `linear-gradient(135deg,${C.amber},${C.gold})`,
              color: C.bg, fontWeight: 800, fontSize: 16, padding: "14px",
              borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: loading ? 0.75 : 1, fontFamily: "inherit",
            }}>
            {loading
              ? <><Loader2 size={18} style={{ animation: "spin .7s linear infinite" }} /> Buscando na Smiles…</>
              : <><Search size={18} /> Buscar passagens</>}
          </button>
        </div>

        {/* ── ERRO ── */}
        {error && (
          <div className="fade" style={{ marginTop: 16, background: C.red + "18", border: `1px solid ${C.red}44`, borderRadius: 14, padding: "14px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <AlertCircle size={18} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.red }}>Erro ao buscar</div>
              <div style={{ fontSize: 13, color: C.mut, marginTop: 3 }}>{error}</div>
              <div style={{ fontSize: 12, color: C.mut, marginTop: 6 }}>
                Verifique se o proxy <code style={{ color: C.gold }}>/api/smiles.js</code> está rodando (<code>npx vercel dev</code>).
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTADOS ── */}
        {searched && !loading && !error && (
          <div className="fade">
            {/* sumário + filtros */}
            <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div className="display" style={{ fontSize: 18, fontWeight: 700 }}>
                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
              </div>
              {minMiles > 0 && (
                <span style={{ fontSize: 12, color: C.mut, background: C.panel2, padding: "3px 10px", borderRadius: 99 }}>
                  a partir de <strong style={{ color: C.gold }}>{fmt(minMiles)}</strong> mi
                </span>
              )}
              {awardCount > 0 && (
                <span style={{ fontSize: 12, color: C.gold, background: C.gold + "18", padding: "3px 10px", borderRadius: 99 }}>
                  {awardCount} Award
                </span>
              )}
              {partnerCount > 0 && (
                <span style={{ fontSize: 12, color: C.blue, background: C.blue + "18", padding: "3px 10px", borderRadius: 99 }}>
                  {partnerCount} outras cias.
                </span>
              )}
              <button onClick={() => setShowFilters(!showFilters)}
                style={{
                  marginLeft: "auto", display: "flex", alignItems: "center", gap: 6,
                  background: showFilters ? C.gold + "22" : C.panel2,
                  border: `1px solid ${showFilters ? C.gold + "66" : C.line}`,
                  color: showFilters ? C.gold : C.txt, borderRadius: 10,
                  padding: "7px 13px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}>
                <Filter size={13} /> Filtros
              </button>
            </div>

            {/* painel de filtros */}
            {showFilters && (
              <div className="fade" style={{ marginTop: 10, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 16px", display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
                {/* teto de milhas */}
                <div style={{ flex: "1 1 200px" }}>
                  <div style={{ fontSize: 12, color: C.mut, fontWeight: 600, marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                    <span>Teto de milhas</span>
                    <span style={{ color: C.gold }}>{maxMiles ? fmt(maxMiles) + " mi" : "Sem limite"}</span>
                  </div>
                  <input type="range" min={0} max={200000} step={1000} value={maxMiles}
                    onChange={(e) => setMaxMiles(+e.target.value)}
                    style={{ width: "100%", WebkitAppearance: "none", appearance: "none", height: 5, borderRadius: 99, background: `linear-gradient(90deg,${C.amber},${C.gold})` }} />
                </div>

                {/* ordenar */}
                <div>
                  <div style={{ fontSize: 12, color: C.mut, fontWeight: 600, marginBottom: 6 }}>Ordenar por</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[["miles","Milhas"],["duration","Duração"]].map(([k,v]) => (
                      <button key={k} onClick={() => setSortBy(k)}
                        style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
                          background: sortBy === k ? C.gold : C.panel2,
                          color: sortBy === k ? C.bg : C.txt,
                          border: `1px solid ${sortBy === k ? C.gold : C.line}` }}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* toggles */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    [onlyAward,   setOnlyAward,   "Só Award",         C.gold  ],
                    [onlyPartner, setOnlyPartner, "Só outras cias.",  C.blue  ],
                    [onlyBaggage, setOnlyBaggage, "Com bagagem",      C.green ],
                  ].map(([val, set, label, color]) => (
                    <button key={label} onClick={() => set(!val)}
                      style={{
                        padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
                        background: val ? color + "22" : C.panel2,
                        color: val ? color : C.txt,
                        border: `1px solid ${val ? color + "66" : C.line}`,
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* cards */}
            {filtered.length === 0 ? (
              <div style={{ marginTop: 16, textAlign: "center", color: C.mut, padding: "40px 20px", border: `1px dashed ${C.line}`, borderRadius: 16 }}>
                Nenhum resultado com os filtros aplicados.
              </div>
            ) : (
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                {filtered.map((f, i) => (
                  <div key={f.id} className="fade" style={{ animationDelay: `${i * 35}ms` }}>
                    <FlightCard flight={f} maxMiles={maxMiles || null} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* estado vazio inicial */}
        {!searched && !loading && (
          <div style={{ marginTop: 40, textAlign: "center", color: C.mut }}>
            <Plane size={36} style={{ opacity: 0.2, marginBottom: 12 }} />
            <p style={{ fontSize: 14 }}>Escolha origem, destino e data para buscar passagens prêmio.</p>
          </div>
        )}
      </div>
    </div>
  );
}
