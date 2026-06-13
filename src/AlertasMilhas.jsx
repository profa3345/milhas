// src/AlertasMilhas.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Plane, Bell, BellRing, Trash2, Plus, CheckCircle2, Clock,
  Sparkles, Mail, Power, Search, AlertCircle, Loader2,
} from "lucide-react";
import {
  fetchAlerts,
  createAlert,
  toggleAlert,
  deleteAlert,
  checkAlertNow,
} from "./services/alertService";

/* ─── Tarifas mock — troque pela API seats.aero / Smiles ─────────────────── */
const FARES = [
  { route: "GRU-MIA", airline: "American Airlines", code: "AA", miles: 64600, taxes: 312, award: true,  baggage: true,  partner: true  },
  { route: "GRU-MIA", airline: "Copa Airlines",     code: "CM", miles: 55000, taxes: 290, award: true,  baggage: true,  partner: true  },
  { route: "GRU-MIA", airline: "GOL",               code: "G3", miles: 89500, taxes: 280, award: false, baggage: true,  partner: false },
  { route: "GRU-MIA", airline: "GOL",               code: "G3", miles:110000, taxes: 250, award: false, baggage: false, partner: false },
  { route: "GRU-LIS", airline: "TAP Air Portugal",  code: "TP", miles: 72000, taxes: 410, award: true,  baggage: true,  partner: true  },
  { route: "GRU-LIS", airline: "GOL",               code: "G3", miles: 95000, taxes: 360, award: false, baggage: true,  partner: false },
  { route: "GIG-JFK", airline: "LATAM",             code: "LA", miles: 68000, taxes: 330, award: true,  baggage: true,  partner: true  },
  { route: "GIG-JFK", airline: "Delta",             code: "DL", miles: 99000, taxes: 380, award: true,  baggage: true,  partner: true  },
];

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const C = {
  bg:     "#0B0E13",
  panel:  "#141A23",
  panel2: "#1A212C",
  line:   "rgba(255,255,255,0.08)",
  txt:    "#F2F4F7",
  mut:    "#8A93A2",
  gold:   "#F5C451",
  amber:  "#FFB020",
  green:  "#3DD68C",
  red:    "#FF6B6B",
};

const fmt = (n) => n?.toLocaleString("pt-BR") ?? "—";

/* ─── Componentes internos ───────────────────────────────────────────────── */
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
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        background: "transparent",
        border: `1px solid ${C.line}`,
        borderRadius: 9,
        padding: 7,
        cursor: disabled ? "default" : "pointer",
        display: "flex",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}

function Toast({ message, type = "error", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20, zIndex: 999,
      background: type === "error" ? C.red : C.green,
      color: "#fff", borderRadius: 12, padding: "12px 18px",
      fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
      boxShadow: "0 8px 24px rgba(0,0,0,.4)",
      animation: "fade .3s ease both",
    }}>
      <AlertCircle size={16} />
      {message}
    </div>
  );
}

/* ─── Tela principal ─────────────────────────────────────────────────────── */
export default function AlertasMilhas() {
  const [alerts,    setAlerts]    = useState([]);
  const [loaded,    setLoaded]    = useState(false);
  const [checking,  setChecking]  = useState(null);   // id do alerta sendo checado
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState(null);
  const [matchCache, setMatchCache] = useState({});   // { alertId: fare | null }

  /* Form */
  const [origin,      setOrigin]      = useState("GRU");
  const [destination, setDestination] = useState("MIA");
  const [maxMiles,    setMaxMiles]    = useState(90000);
  const [cabin,       setCabin]       = useState("Econômica");
  const [partnerOnly, setPartnerOnly] = useState(false);
  const [contact,     setContact]     = useState("");

  const showToast = useCallback((message, type = "error") => {
    setToast({ message, type });
  }, []);

  /* ── Carrega alertas do Firestore ── */
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAlerts();
        setAlerts(data);
        // Checa matches iniciais
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
        console.error(e);
        showToast("Erro ao carregar alertas do Firebase.");
      } finally {
        setLoaded(true);
      }
    })();
  }, [showToast]);

  /* ── Criar alerta ── */
  const addAlert = async () => {
    if (!contact.trim()) {
      showToast("Informe um e-mail ou WhatsApp para o aviso.");
      return;
    }
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
      console.error(e);
      showToast("Erro ao salvar alerta. Verifique o Firestore.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Remover ── */
  const remove = async (id) => {
    try {
      await deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      setMatchCache((prev) => { const n = { ...prev }; delete n[id]; return n; });
    } catch (e) {
      showToast("Erro ao remover alerta.");
    }
  };

  /* ── Ativar / Pausar ── */
  const toggle = async (id, currentActive) => {
    try {
      await toggleAlert(id, currentActive);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
      );
    } catch (e) {
      showToast("Erro ao atualizar alerta.");
    }
  };

  /* ── Verificar agora ── */
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
    } catch (e) {
      showToast("Erro ao checar tarifas.");
    } finally {
      setChecking(null);
    }
  };

  /* ─── Render ─────────────────────────────────────────────────────────────── */
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
            <Field label="Origem">
              <input className="field" value={origin} onChange={(e) => setOrigin(e.target.value.toUpperCase())} />
            </Field>
            <Field label="Destino">
              <input className="field" value={destination} onChange={(e) => setDestination(e.target.value.toUpperCase())} />
            </Field>
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
            <input
              type="range" min={40000} max={130000} step={500}
              value={maxMiles}
              onChange={(e) => setMaxMiles(+e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginTop: 16, alignItems: "end" }}>
            <Field label="Avisar em (e-mail ou WhatsApp)">
              <input
                className="field"
                placeholder="voce@email.com"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </Field>
            <div
              onClick={() => setPartnerOnly(!partnerOnly)}
              style={{
                cursor: "pointer", padding: "11px 14px", borderRadius: 11,
                fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
                border: `1px solid ${partnerOnly ? C.gold : C.line}`,
                background: partnerOnly ? C.gold : "transparent",
                color: partnerOnly ? C.bg : C.txt,
              }}
            >
              Só outras cias.
            </div>
          </div>

          <button
            onClick={addAlert}
            disabled={saving}
            style={{
              marginTop: 16, width: "100%", border: "none", cursor: saving ? "wait" : "pointer",
              background: `linear-gradient(135deg,${C.amber},${C.gold})`,
              color: C.bg, fontWeight: 700, fontSize: 15,
              padding: 13, borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving
              ? <Loader2 size={17} style={{ animation: "spin .7s linear infinite" }} />
              : <BellRing size={17} strokeWidth={2.5} />}
            {saving ? "Salvando…" : "Criar alerta"}
          </button>
        </div>

        {/* LISTA */}
        <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 8 }}>
          <span className="display" style={{ fontSize: 18, fontWeight: 700 }}>Meus alertas</span>
          <span style={{ fontSize: 12, color: C.mut, background: C.panel2, padding: "2px 9px", borderRadius: 99 }}>
            {alerts.length}
          </span>
        </div>

        {!loaded && (
          <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 10, color: C.mut }}>
            <Loader2 size={16} style={{ animation: "spin .7s linear infinite" }} />
            Carregando do Firebase…
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
              <div
                key={a.id}
                className="fade"
                style={{
                  animationDelay: `${i * 40}ms`,
                  background: C.panel,
                  border: `1px solid ${match ? C.green + "66" : C.line}`,
                  borderRadius: 16, padding: 16,
                  boxShadow: match ? `0 8px 28px -14px ${C.green}55` : "none",
                  opacity: a.active ? 1 : 0.55,
                }}
              >
                {/* Cabeçalho */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="display" style={{ fontSize: 19, fontWeight: 800 }}>
                    {a.origin} <Plane size={14} color={C.gold} style={{ display: "inline", margin: "0 2px" }} /> {a.destination}
                  </div>
                  <span style={{ fontSize: 12, color: C.mut }}>
                    até <strong style={{ color: C.gold }}>{fmt(a.maxMiles)}</strong> mi · {a.cabin}
                    {a.partnerOnly ? " · só parceiras" : ""}
                  </span>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <IconBtn title={a.active ? "Pausar" : "Ativar"} onClick={() => toggle(a.id, a.active)}>
                      <Power size={15} color={a.active ? C.green : C.mut} />
                    </IconBtn>
                    <IconBtn title="Excluir" onClick={() => remove(a.id)}>
                      <Trash2 size={15} color={C.red} />
                    </IconBtn>
                  </div>
                </div>

                {/* Contato */}
                <div style={{ fontSize: 12, color: C.mut, marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
                  <Mail size={12} /> {a.contact}
                </div>

                {/* Status */}
                {a.active && (
                  match ? (
                    <div style={{
                      marginTop: 12, background: C.green + "14",
                      border: `1px solid ${C.green}44`, borderRadius: 12,
                      padding: "12px 14px", display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <CheckCircle2 size={20} color={C.green} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>
                          Tarifa encontrada! {fmt(match.miles)} milhas
                        </div>
                        <div style={{ fontSize: 12, color: C.mut }}>
                          {match.airline} · + R$ {fmt(match.taxes)} taxas
                          {match.baggage && " · com bagagem"}
                        </div>
                      </div>
                      {match.partner && <Sparkles size={16} color={C.gold} />}
                    </div>
                  ) : (
                    <div style={{ marginTop: 12, fontSize: 13, color: C.mut, display: "flex", alignItems: "center", gap: 7 }}>
                      <Search size={14} /> Monitorando — nada abaixo de {fmt(a.maxMiles)} mi ainda.
                    </div>
                  )
                )}

                {/* Rodapé */}
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: C.mut, display: "flex", alignItems: "center", gap: 5 }}>
                    <Clock size={11} />
                    {lastCheckedDate
                      ? `Checado ${lastCheckedDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                      : "Ainda não checado"}
                  </span>
                  <button
                    onClick={() => handleCheckNow(a)}
                    disabled={!a.active || checking === a.id}
                    style={{
                      background: "transparent",
                      border: `1px solid ${C.line}`,
                      color: C.txt,
                      cursor: a.active && checking !== a.id ? "pointer" : "default",
                      borderRadius: 9, padding: "6px 12px",
                      fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                      display: "flex", gap: 6, alignItems: "center",
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
          Em produção, um Cloud Function (cron) roda a checagem de tempos em tempos, compara cada tarifa nova
          com o teto de cada alerta e dispara o aviso por e-mail/WhatsApp — registrando em{" "}
          <code style={{ color: C.mut }}>alert_hits</code> para não notificar duas vezes.
        </p>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
