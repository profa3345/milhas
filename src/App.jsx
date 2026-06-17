// src/App.jsx
import React, { useState } from "react";
import { Plane, Bell } from "lucide-react";
import BuscaPassagens from "./BuscaPassagens";
import AlertasMilhas  from "./AlertasMilhas";

const C = {
  bg:    "#0B0E13",
  panel: "#141A23",
  line:  "rgba(255,255,255,0.08)",
  txt:   "#F2F4F7",
  mut:   "#8A93A2",
  gold:  "#F5C451",
  amber: "#FFB020",
};

export default function App() {
  const [tab, setTab] = useState("busca"); // "busca" | "alertas"

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Albert Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Albert+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 300,
        background: C.bg + "ee",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${C.line}`,
      }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", gap: 6, height: 58 }}>

          {/* logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 16 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: `linear-gradient(135deg,${C.amber},${C.gold})`,
              display: "flex", alignItems: "center", justifyContent: "center", color: C.bg,
            }}>
              <Plane size={16} strokeWidth={2.6} />
            </div>
            <span style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800, fontSize: 16, letterSpacing: "-.02em", color: C.txt,
            }}>
              MilhasRadar
            </span>
          </div>

          {/* tabs */}
          {[
            { id: "busca",   icon: <Plane size={15} strokeWidth={2.3} />,  label: "Buscar passagens" },
            { id: "alertas", icon: <Bell  size={15} strokeWidth={2.3} />,  label: "Meus alertas"     },
          ].map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "7px 14px", borderRadius: 10,
                  border: `1px solid ${active ? C.gold + "55" : "transparent"}`,
                  background: active ? C.gold + "15" : "transparent",
                  color: active ? C.gold : C.mut,
                  fontWeight: 600, fontSize: 13, cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all .15s",
                }}
              >
                {t.icon}{t.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── CONTEÚDO ── */}
      {tab === "busca"   && <BuscaPassagens />}
      {tab === "alertas" && <AlertasMilhas  />}
    </div>
  );
}
