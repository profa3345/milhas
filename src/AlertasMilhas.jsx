// src/AlertasMilhas.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plane, Bell, BellRing, Trash2, Plus, CheckCircle2, Clock,
  Sparkles, Mail, Power, Search, AlertCircle, Loader2, ChevronDown, X,
} from "lucide-react";
import {
  fetchAlerts,
  createAlert,
  toggleAlert,
  deleteAlert,
  checkAlertNow,
} from "./services/alertService";

/* ─── Lista de aeroportos ────────────────────────────────────────────────── */
const AIRPORTS = [
  // Brasil
  { code: "GRU", city: "São Paulo",       name: "Guarulhos",              country: "BR", flag: "🇧🇷" },
  { code: "GIG", city: "Rio de Janeiro",  name: "Galeão",                 country: "BR", flag: "🇧🇷" },
  { code: "SDU", city: "Rio de Janeiro",  name: "Santos Dumont",          country: "BR", flag: "🇧🇷" },
  { code: "CGH", city: "São Paulo",       name: "Congonhas",              country: "BR", flag: "🇧🇷" },
  { code: "BSB", city: "Brasília",        name: "Presidente JK",          country: "BR", flag: "🇧🇷" },
  { code: "SSA", city: "Salvador",        name: "Dep. Luís Eduardo",      country: "BR", flag: "🇧🇷" },
  { code: "FOR", city: "Fortaleza",       name: "Pinto Martins",          country: "BR", flag: "🇧🇷" },
  { code: "REC", city: "Recife",          name: "Guararapes",             country: "BR", flag: "🇧🇷" },
  { code: "BEL", city: "Belém",          name: "Val de Cans",            country: "BR", flag: "🇧🇷" },
  { code: "MAO", city: "Manaus",          name: "Eduardo Gomes",          country: "BR", flag: "🇧🇷" },
  { code: "POA", city: "Porto Alegre",    name: "Salgado Filho",          country: "BR", flag: "🇧🇷" },
  { code: "CWB", city: "Curitiba",        name: "Afonso Pena",            country: "BR", flag: "🇧🇷" },
  { code: "FLN", city: "Florianópolis",   name: "Hercílio Luz",           country: "BR", flag: "🇧🇷" },
  { code: "VCP", city: "Campinas",        name: "Viracopos",              country: "BR", flag: "🇧🇷" },
  { code: "NAT", city: "Natal",           name: "São Gonçalo do Amarante",country: "BR", flag: "🇧🇷" },
  { code: "MCZ", city: "Maceió",          name: "Zumbi dos Palmares",     country: "BR", flag: "🇧🇷" },
  { code: "THE", city: "Teresina",        name: "Senador Petrônio Portela",country:"BR", flag: "🇧🇷" },
  { code: "SLZ", city: "São Luís",        name: "Marechal Cunha Machado", country: "BR", flag: "🇧🇷" },
  { code: "CGB", city: "Cuiabá",         name: "Marechal Rondon",        country: "BR", flag: "🇧🇷" },
  { code: "CGR", city: "Campo Grande",    name: "Campo Grande",           country: "BR", flag: "🇧🇷" },
  { code: "GYN", city: "Goiânia",        name: "Santa Genoveva",         country: "BR", flag: "🇧🇷" },
  { code: "VIX", city: "Vitória",         name: "Eurico de Aguiar",       country: "BR", flag: "🇧🇷" },
  { code: "AJU", city: "Aracaju",         name: "Santa Maria",            country: "BR", flag: "🇧🇷" },
  { code: "JPA", city: "João Pessoa",     name: "Presidente Castro Pinto",country: "BR", flag: "🇧🇷" },
  { code: "PMW", city: "Palmas",          name: "Brigadeiro Lysias",      country: "BR", flag: "🇧🇷" },
  { code: "PVH", city: "Porto Velho",     name: "Gov. Jorge Teixeira",    country: "BR", flag: "🇧🇷" },
  { code: "MCP", city: "Macapá",         name: "Alberto Alcolumbre",     country: "BR", flag: "🇧🇷" },
  { code: "BVB", city: "Boa Vista",       name: "Atlas Brasil Cantanhede",country: "BR", flag: "🇧🇷" },
  { code: "RBR", city: "Rio Branco",      name: "Plácido de Castro",      country: "BR", flag: "🇧🇷" },
  // América do Norte
  { code: "MIA", city: "Miami",           name: "Miami Intl",             country: "US", flag: "🇺🇸" },
  { code: "JFK", city: "Nova York",       name: "John F. Kennedy",        country: "US", flag: "🇺🇸" },
  { code: "EWR", city: "Newark",          name: "Newark Liberty",         country: "US", flag: "🇺🇸" },
  { code: "LAX", city: "Los Angeles",     name: "Los Angeles Intl",       country: "US", flag: "🇺🇸" },
  { code: "ORD", city: "Chicago",         name: "O'Hare",                 country: "US", flag: "🇺🇸" },
  { code: "ATL", city: "Atlanta",         name: "Hartsfield-Jackson",     country: "US", flag: "🇺🇸" },
  { code: "DFW", city: "Dallas",          name: "Dallas/Fort Worth",      country: "US", flag: "🇺🇸" },
  { code: "IAH", city: "Houston",         name: "George Bush",            country: "US", flag: "🇺🇸" },
  { code: "MCO", city: "Orlando",         name: "Orlando Intl",           country: "US", flag: "🇺🇸" },
  { code: "BOS", city: "Boston",          name: "Logan",                  country: "US", flag: "🇺🇸" },
  { code: "SFO", city: "San Francisco",   name: "San Francisco Intl",     country: "US", flag: "🇺🇸" },
  { code: "LAS", city: "Las Vegas",       name: "Harry Reid",             country: "US", flag: "🇺🇸" },
  { code: "YYZ", city: "Toronto",         name: "Pearson",                country: "CA", flag: "🇨🇦" },
  { code: "YUL", city: "Montreal",        name: "Pierre Elliott Trudeau", country: "CA", flag: "🇨🇦" },
  { code: "YVR", city: "Vancouver",       name: "Vancouver Intl",         country: "CA", flag: "🇨🇦" },
  { code: "MEX", city: "Cidade do México",name: "Benito Juárez",          country: "MX", flag: "🇲🇽" },
  { code: "CUN", city: "Cancún",         name: "Cancún Intl",            country: "MX", flag: "🇲🇽" },
  // América do Sul
  { code: "EZE", city: "Buenos Aires",    name: "Ministro Pistarini",     country: "AR", flag: "🇦🇷" },
  { code: "AEP", city: "Buenos Aires",    name: "Aeroparque",             country: "AR", flag: "🇦🇷" },
  { code: "SCL", city: "Santiago",        name: "Arturo Merino Benítez",  country: "CL", flag: "🇨🇱" },
  { code: "LIM", city: "Lima",            name: "Jorge Chávez",           country: "PE", flag: "🇵🇪" },
  { code: "BOG", city: "Bogotá",         name: "El Dorado",              country: "CO", flag: "🇨🇴" },
  { code: "MVD", city: "Montevidéu",     name: "Carrasco",               country: "UY", flag: "🇺🇾" },
  { code: "ASU", city: "Assunção",       name: "Silvio Pettirossi",      country: "PY", flag: "🇵🇾" },
  { code: "VVI", city: "Santa Cruz",      name: "Viru Viru",              country: "BO", flag: "🇧🇴" },
  { code: "GYE", city: "Guayaquil",       name: "José Joaquín de Olmedo",country: "EC",  flag: "🇪🇨" },
  { code: "PTY", city: "Cidade do Panamá",name: "Tocumen",               country: "PA", flag: "🇵🇦" },
  { code: "CCS", city: "Caracas",         name: "Simón Bolívar",          country: "VE", flag: "🇻🇪" },
  // Europa
  { code: "LIS", city: "Lisboa",          name: "Humberto Delgado",       country: "PT", flag: "🇵🇹" },
  { code: "OPO", city: "Porto",           name: "Francisco Sá Carneiro",  country: "PT", flag: "🇵🇹" },
  { code: "LHR", city: "Londres",         name: "Heathrow",               country: "GB", flag: "🇬🇧" },
  { code: "LGW", city: "Londres",         name: "Gatwick",                country: "GB", flag: "🇬🇧" },
  { code: "CDG", city: "Paris",           name: "Charles de Gaulle",      country: "FR", flag: "🇫🇷" },
  { code: "ORY", city: "Paris",           name: "Orly",                   country: "FR", flag: "🇫🇷" },
  { code: "AMS", city: "Amsterdã",       name: "Schiphol",               country: "NL", flag: "🇳🇱" },
  { code: "FRA", city: "Frankfurt",       name: "Frankfurt Intl",         country: "DE", flag: "🇩🇪" },
  { code: "MUC", city: "Munique",         name: "Franz Josef Strauss",    country: "DE", flag: "🇩🇪" },
  { code: "MAD", city: "Madri",          name: "Barajas",                country: "ES", flag: "🇪🇸" },
  { code: "BCN", city: "Barcelona",       name: "El Prat",                country: "ES", flag: "🇪🇸" },
  { code: "FCO", city: "Roma",            name: "Fiumicino",              country: "IT", flag: "🇮🇹" },
  { code: "MXP", city: "Milão",          name: "Malpensa",               country: "IT", flag: "🇮🇹" },
  { code: "ZUR", city: "Zurique",        name: "Kloten",                 country: "CH", flag: "🇨🇭" },
  { code: "VIE", city: "Viena",          name: "Schwechat",              country: "AT", flag: "🇦🇹" },
  { code: "BRU", city: "Bruxelas",       name: "Zaventem",               country: "BE", flag: "🇧🇪" },
  { code: "CPH", city: "Copenhague",     name: "Kastrup",                country: "DK", flag: "🇩🇰" },
  { code: "ARN", city: "Estocolmo",      name: "Arlanda",                country: "SE", flag: "🇸🇪" },
  { code: "IST", city: "Istambul",       name: "Istanbul Airport",       country: "TR", flag: "🇹🇷" },
  // Ásia / Oriente Médio / África / Oceania
  { code: "DXB", city: "Dubai",           name: "Dubai Intl",             country: "AE", flag: "🇦🇪" },
  { code: "DOH", city: "Doha",            name: "Hamad",                  country: "QA", flag: "🇶🇦" },
  { code: "NRT", city: "Tóquio",         name: "Narita",                 country: "JP", flag: "🇯🇵" },
  { code: "HND", city: "Tóquio",         name: "Haneda",                 country: "JP", flag: "🇯🇵" },
  { code: "PEK", city: "Pequim",         name: "Capital",                country: "CN", flag: "🇨🇳" },
  { code: "PVG", city: "Xangai",         name: "Pudong",                 country: "CN", flag: "🇨🇳" },
  { code: "SIN", city: "Singapura",       name: "Changi",                 country: "SG", flag: "🇸🇬" },
  { code: "BKK", city: "Bangkok",         name: "Suvarnabhumi",           country: "TH", flag: "🇹🇭" },
  { code: "SYD", city: "Sydney",          name: "Kingsford Smith",        country: "AU", flag: "🇦🇺" },
  { code: "MEL", city: "Melbourne",       name: "Tullamarine",            country: "AU", flag: "🇦🇺" },
  { code: "JNB", city: "Joanesburgo",    name: "O.R. Tambo",             country: "ZA", flag: "🇿🇦" },
];

/* ─── Tarifas mock ───────────────────────────────────────────────────────── */
const FARES = [
  { route: "GRU-MIA", airline: "American Airlines", code: "AA", miles: 64600,  taxes: 312, award: true,  baggage: true,  partner: true  },
  { route: "GRU-MIA", airline: "Copa Airlines",     code: "CM", miles: 55000,  taxes: 290, award: true,  baggage: true,  partner: true  },
  { route: "GRU-MIA", airline: "GOL",               code: "G3", miles: 89500,  taxes: 280, award: false, baggage: true,  partner: false },
  { route: "GRU-MIA", airline: "GOL",               code: "G3", miles: 110000, taxes: 250, award: false, baggage: false, partner: false },
  { route: "GRU-LIS", airline: "TAP Air Portugal",  code: "TP", miles: 72000,  taxes: 410, award: true,  baggage: true,  partner: true  },
  { route: "GRU-LIS", airline: "GOL",               code: "G3", miles: 95000,  taxes: 360, award: false, baggage: true,  partner: false },
  { route: "GIG-JFK", airline: "LATAM",             code: "LA", miles: 68000,  taxes: 330, award: true,  baggage: true,  partner: true  },
  { route: "GIG-JFK", airline: "Delta",             code: "DL", miles: 99000,  taxes: 380, award: true,  baggage: true,  partner: true  },
];

/* ─── Design tokens ──────────────────────────────────────────────────────── */
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
};

const fmt = (n) => n?.toLocaleString("pt-BR") ?? "—";

/* ─── AirportSelect — campo com busca e dropdown ─────────────────────────── */
function AirportSelect({ label, value, onChange }) {
  const [query,    setQuery]    = useState("");
  const [open,     setOpen]     = useState(false);
  const [focused,  setFocused]  = useState(false);
  const wrapRef  = useRef(null);
  const inputRef = useRef(null);

  const selected = AIRPORTS.find((a) => a.code === value);

  const results = query.length >= 1
    ? AIRPORTS.filter((a) => {
        const q = query.toLowerCase();
        return (
          a.code.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q)
        );
      }).slice(0, 8)
    : AIRPORTS.slice(0, 8);

  const pick = (airport) => {
    onChange(airport.code);
    setQuery("");
    setOpen(false);
  };

  // fecha ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <span style={{ fontSize: 12, color: C.mut, fontWeight: 600, display: "block", marginBottom: 6 }}>
        {label}
      </span>

      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          background: C.panel2, border: `1px solid ${open ? C.gold : C.line}`,
          borderRadius: 11, padding: "10px 12px", cursor: "pointer",
          color: C.txt, fontFamily: "inherit", fontSize: 14, textAlign: "left",
          transition: "border-color .15s",
        }}
      >
        {selected ? (
          <>
            <span style={{ fontSize: 18, lineHeight: 1 }}>{selected.flag}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontWeight: 700, fontFamily: "'Bricolage Grotesque', sans-serif", letterSpacing: "-.01em" }}>
                {selected.code}
              </span>
              <span style={{ color: C.mut, fontSize: 12, marginLeft: 6, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                {selected.city}
              </span>
            </div>
          </>
        ) : (
          <span style={{ color: C.mut }}>Selecione…</span>
        )}
        <ChevronDown size={14} color={C.mut} style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 100,
          background: C.panel3, border: `1px solid ${C.gold}44`,
          borderRadius: 13, overflow: "hidden",
          boxShadow: "0 16px 40px rgba(0,0,0,.55)",
          animation: "fade .15s ease both",
        }}>
          {/* Busca */}
          <div style={{ padding: "10px 10px 6px", borderBottom: `1px solid ${C.line}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.panel2, borderRadius: 9, padding: "8px 10px" }}>
              <Search size={13} color={C.mut} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar cidade ou código…"
                style={{ background: "transparent", border: "none", outline: "none", color: C.txt, fontSize: 13, flex: 1, fontFamily: "inherit" }}
              />
              {query && (
                <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                  <X size={13} color={C.mut} />
                </button>
              )}
            </div>
          </div>

          {/* Lista */}
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {results.length === 0 ? (
              <div style={{ padding: "14px 14px", fontSize: 13, color: C.mut }}>Nenhum aeroporto encontrado.</div>
            ) : results.map((a) => (
              <button
                key={a.code}
                type="button"
                onClick={() => pick(a)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", background: value === a.code ? C.gold + "18" : "transparent",
                  border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                  borderLeft: value === a.code ? `3px solid ${C.gold}` : "3px solid transparent",
                  transition: "background .1s",
                }}
                onMouseEnter={(e) => { if (value !== a.code) e.currentTarget.style.background = C.panel2; }}
                onMouseLeave={(e) => { if (value !== a.code) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{a.flag}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontWeight: 700, color: C.txt, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, letterSpacing: "-.01em" }}>
                      {a.code}
                    </span>
                    <span style={{ fontSize: 13, color: C.txt }}>{a.city}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.mut, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {a.name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Field wrapper simples ──────────────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ fontSize: 12, color: C.mut, fontWeight: 600, display: "block", marginBottom: 6 }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function IconBtn({ children, onClick, title, disabled }) {
  return (
    <button onClick={onClick} title={title} disabled={disabled} style={{
      background: "transparent", border: `1px solid ${C.line}`, borderRadius: 9, padding: 7,
      cursor: disabled ? "default" : "pointer", display: "flex", opacity: disabled ? 0.4 : 1,
    }}>
      {children}
    </button>
  );
}

function Toast({ message, type = "error", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20, zIndex: 9999,
      background: type === "error" ? C.red : C.green,
      color: "#fff", borderRadius: 12, padding: "12px 18px",
      fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
      boxShadow: "0 8px 24px rgba(0,0,0,.4)", animation: "fade .3s ease both",
    }}>
      <AlertCircle size={16} />{message}
    </div>
  );
}

/* ─── Tela principal ─────────────────────────────────────────────────────── */
export default function AlertasMilhas() {
  const [alerts,     setAlerts]     = useState([]);
  const [loaded,     setLoaded]     = useState(false);
  const [checking,   setChecking]   = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState(null);
  const [matchCache, setMatchCache] = useState({});

  const [origin,      setOrigin]      = useState("GRU");
  const [destination, setDestination] = useState("MIA");
  const [maxMiles,    setMaxMiles]    = useState(90000);
  const [cabin,       setCabin]       = useState("Econômica");
  const [partnerOnly, setPartnerOnly] = useState(false);
  const [contact,     setContact]     = useState("");

  const showToast = useCallback((message, type = "error") => setToast({ message, type }), []);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAlerts();
        setAlerts(data);
        const cache = {};
        for (const a of data) {
          if (a.active) {
            const route = `${a.origin}-${a.destination}`;
            const hits = FARES.filter(
              (f) => f.route === route && f.miles <= a.maxMiles && (!a.partnerOnly || f.partner)
            ).sort((a, b) => a.miles - b.miles);
            cache[a.id] = hits[0] || null;
          }
        }
        setMatchCache(cache);
      } catch (e) {
        showToast("Erro ao carregar alertas do Firebase.");
      } finally {
        setLoaded(true);
      }
    })();
  }, [showToast]);

  const addAlert = async () => {
    if (!contact.trim()) { showToast("Informe um e-mail ou WhatsApp para o aviso."); return; }
    setSaving(true);
    try {
      const id = await createAlert({ origin, destination, maxMiles, cabin, partnerOnly, contact: contact.trim() });
      const newAlert = {
        id, origin, destination, maxMiles, cabin, partnerOnly,
        contact: contact.trim(), active: true, lastChecked: null, lastFound: null,
        createdAt: { toDate: () => new Date() },
      };
      setAlerts((prev) => [newAlert, ...prev]);
      setContact("");
      showToast("Alerta criado com sucesso!", "success");
    } catch (e) {
      showToast("Erro ao salvar alerta. Verifique o Firestore.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      setMatchCache((prev) => { const n = { ...prev }; delete n[id]; return n; });
    } catch (e) { showToast("Erro ao remover alerta."); }
  };

  const toggle = async (id, currentActive) => {
    try {
      await toggleAlert(id, currentActive);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
    } catch (e) { showToast("Erro ao atualizar alerta."); }
  };

  const handleCheckNow = async (alert) => {
    setChecking(alert.id);
    try {
      const best = await checkAlertNow(alert, FARES);
      setMatchCache((prev) => ({ ...prev, [alert.id]: best }));
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alert.id
            ? { ...a, lastChecked: { toDate: () => new Date() }, lastFound: best?.miles ?? null }
            : a
        )
      );
    } catch (e) { showToast("Erro ao checar tarifas."); } finally { setChecking(null); }
  };

  const airportLabel = (code) => {
    const a = AIRPORTS.find((x) => x.code === code);
    return a ? `${a.flag} ${a.code} · ${a.city}` : code;
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.txt, fontFamily: "'Albert Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Albert+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        .display{font-family:'Bricolage Grotesque',sans-serif;letter-spacing:-.02em;}
        .fade{animation:fade .45s ease both;}
        @keyframes fade{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        .field{background:${C.panel2};border:1px solid ${C.line};color:${C.txt};border-radius:11px;padding:11px 13px;font-size:14px;width:100%;font-family:inherit;}
        .field:focus{outline:none;border-color:${C.gold};}
        input[type="range"]{-webkit-appearance:none;appearance:none;height:6px;border-radius:99px;background:linear-gradient(90deg,${C.amber},${C.gold});}
        input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:${C.bg};border:3px solid ${C.gold};cursor:pointer;box-shadow:0 0 0 4px rgba(245,196,81,.18);}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:${C.line};border-radius:99px;}
      `}</style>

      {/* HEADER */}
      <div style={{ borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px", display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: `linear-gradient(135deg,${C.amber},${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", color: C.bg }}>
            <Bell size={23} strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="display" style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>MilhasRadar · Alertas</h1>
            <p style={{ margin: 0, fontSize: 13, color: C.mut }}>Avisa quando a tarifa cair abaixo do seu teto de milhas</p>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: C.mut, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block" }} />
            Firebase conectado
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "22px 20px" }}>

        {/* CRIAR ALERTA */}
        <div className="fade" style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 18, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Plus size={18} color={C.gold} />
            <span style={{ fontWeight: 700 }}>Criar alerta</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <AirportSelect label="Origem"  value={origin}      onChange={setOrigin}      />
            <AirportSelect label="Destino" value={destination} onChange={setDestination} />
            <Field label="Cabine">
              <select className="field" value={cabin} onChange={(e) => setCabin(e.target.value)}>
                <option>Econômica</option>
                <option>Executiva</option>
              </select>
            </Field>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.mut, marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>Teto de milhas (limitador)</span>
              <span style={{ color: C.gold, fontWeight: 700 }}>{fmt(maxMiles)} milhas</span>
            </div>
            <input type="range" min={40000} max={130000} step={500} value={maxMiles} onChange={(e) => setMaxMiles(+e.target.value)} style={{ width: "100%" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginTop: 16, alignItems: "end" }}>
            <Field label="Avisar em (e-mail ou WhatsApp)">
              <input className="field" placeholder="voce@email.com" value={contact} onChange={(e) => setContact(e.target.value)} />
            </Field>
            <div
              onClick={() => setPartnerOnly(!partnerOnly)}
              style={{
                cursor: "pointer", padding: "11px 14px", borderRadius: 11, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
                border: `1px solid ${partnerOnly ? C.gold : C.line}`,
                background: partnerOnly ? C.gold : "transparent",
                color: partnerOnly ? C.bg : C.txt,
              }}
            >
              Só outras cias.
            </div>
          </div>

          <button
            onClick={addAlert} disabled={saving}
            style={{
              marginTop: 16, width: "100%", border: "none", cursor: saving ? "wait" : "pointer",
              background: `linear-gradient(135deg,${C.amber},${C.gold})`, color: C.bg, fontWeight: 700,
              fontSize: 15, padding: 13, borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? <Loader2 size={17} style={{ animation: "spin .7s linear infinite" }} /> : <BellRing size={17} strokeWidth={2.5} />}
            {saving ? "Salvando…" : "Criar alerta"}
          </button>
        </div>

        {/* LISTA */}
        <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 8 }}>
          <span className="display" style={{ fontSize: 18, fontWeight: 700 }}>Meus alertas</span>
          <span style={{ fontSize: 12, color: C.mut, background: C.panel2, padding: "2px 9px", borderRadius: 99 }}>{alerts.length}</span>
        </div>

        {!loaded && (
          <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 10, color: C.mut }}>
            <Loader2 size={16} style={{ animation: "spin .7s linear infinite" }} /> Carregando do Firebase…
          </div>
        )}

        {loaded && alerts.length === 0 && (
          <div style={{ marginTop: 14, textAlign: "center", color: C.mut, padding: 36, border: `1px dashed ${C.line}`, borderRadius: 16 }}>
            Nenhum alerta ainda. Crie o primeiro acima 👆
          </div>
        )}

        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
          {loaded && alerts.map((a, i) => {
            const match = a.active ? matchCache[a.id] : null;
            const lastCheckedDate = a.lastChecked?.toDate?.() ?? (a.lastChecked ? new Date(a.lastChecked) : null);
            return (
              <div key={a.id} className="fade" style={{
                animationDelay: `${i * 40}ms`, background: C.panel,
                border: `1px solid ${match ? C.green + "66" : C.line}`, borderRadius: 16, padding: 16,
                boxShadow: match ? `0 8px 28px -14px ${C.green}55` : "none", opacity: a.active ? 1 : 0.55,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="display" style={{ fontSize: 19, fontWeight: 800 }}>
                    {airportLabel(a.origin)} <Plane size={14} color={C.gold} style={{ display: "inline", margin: "0 4px" }} /> {airportLabel(a.destination)}
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6, flexShrink: 0 }}>
                    <IconBtn title={a.active ? "Pausar" : "Ativar"} onClick={() => toggle(a.id, a.active)}>
                      <Power size={15} color={a.active ? C.green : C.mut} />
                    </IconBtn>
                    <IconBtn title="Excluir" onClick={() => remove(a.id)}>
                      <Trash2 size={15} color={C.red} />
                    </IconBtn>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: C.mut, marginTop: 4, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span>até <strong style={{ color: C.gold }}>{fmt(a.maxMiles)}</strong> mi</span>
                  <span>{a.cabin}</span>
                  {a.partnerOnly && <span>só parceiras</span>}
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={11} /> {a.contact}</span>
                </div>

                {a.active && (match ? (
                  <div style={{
                    marginTop: 12, background: C.green + "14", border: `1px solid ${C.green}44`,
                    borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <CheckCircle2 size={20} color={C.green} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>Tarifa encontrada! {fmt(match.miles)} milhas</div>
                      <div style={{ fontSize: 12, color: C.mut }}>{match.airline} · + R$ {fmt(match.taxes)} taxas{match.baggage && " · com bagagem"}</div>
                    </div>
                    {match.partner && <Sparkles size={16} color={C.gold} />}
                  </div>
                ) : (
                  <div style={{ marginTop: 12, fontSize: 13, color: C.mut, display: "flex", alignItems: "center", gap: 7 }}>
                    <Search size={14} /> Monitorando — nada abaixo de {fmt(a.maxMiles)} mi ainda.
                  </div>
                ))}

                <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: C.mut, display: "flex", alignItems: "center", gap: 5 }}>
                    <Clock size={11} />
                    {lastCheckedDate
                      ? `Checado ${lastCheckedDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                      : "Ainda não checado"}
                  </span>
                  <button
                    onClick={() => handleCheckNow(a)} disabled={!a.active || checking === a.id}
                    style={{
                      background: "transparent", border: `1px solid ${C.line}`, color: C.txt,
                      cursor: a.active && checking !== a.id ? "pointer" : "default",
                      borderRadius: 9, padding: "6px 12px", fontSize: 12, fontWeight: 600,
                      fontFamily: "inherit", display: "flex", gap: 6, alignItems: "center",
                      opacity: !a.active ? 0.4 : 1,
                    }}
                  >
                    {checking === a.id
                      ? <span style={{ width: 12, height: 12, border: `2px solid ${C.mut}`, borderTopColor: C.gold, borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
                      : <Search size={13} />}
                    Verificar agora
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ marginTop: 24, fontSize: 12, color: C.mut, lineHeight: 1.6 }}>
          Alertas salvos no <strong style={{ color: C.gold }}>Firebase Firestore</strong> em tempo real.
          Em produção, um Cloud Function (cron) roda a checagem a cada 30 min, compara tarifas novas
          com o teto de cada alerta e dispara o aviso por e-mail/WhatsApp — registrando em{" "}
          <code style={{ color: C.mut }}>alert_hits</code> para não notificar duas vezes.
        </p>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
