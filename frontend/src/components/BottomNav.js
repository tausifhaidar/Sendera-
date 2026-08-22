import { useState } from "react";

function BottomNav({ activeTab, setActiveTab }) {
  const [aiOpen, setAiOpen] = useState(false);

  const items = [
    { key: "home", icon: "⌂", label: "Home" },
    { key: "tokens", icon: "◈", label: "Tokens" },
    { key: "history", icon: "◷", label: "Activity" },
    { key: "ai", icon: "✦", label: "AI" },
    { key: "settings", icon: "⚙", label: "Settings" },
  ];

  function handleItem(item) {
    if (item.key === "ai") {
      setAiOpen(true);
      return;
    }
    setActiveTab(item.key);
  }

  return (
    <>
      {aiOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "rgba(2,6,23,.72)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 12,
          }}
          onClick={() => setAiOpen(false)}
        >
          <section
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 620,
              borderRadius: 28,
              padding: 20,
              marginBottom: 86,
              background: "linear-gradient(145deg, rgba(27,18,76,.98), rgba(7,24,58,.98))",
              border: "1px solid rgba(139,92,246,.40)",
              boxShadow: "0 24px 70px rgba(0,0,0,.45), 0 0 45px rgba(92,52,220,.20)",
              color: "white",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ color: "#9aa8c6", fontSize: 11 }}>Sendera Intelligence</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                  <strong style={{ fontSize: 24 }}>AI Assistant</strong>
                  <span style={{ fontSize: 9, fontWeight: 900, padding: "4px 6px", borderRadius: 999, background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>BETA</span>
                </div>
              </div>
              <button
                onClick={() => setAiOpen(false)}
                style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid #2b3b68", background: "#0c1733", color: "white", fontSize: 18, cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            <p style={{ color: "#b6c0d7", fontSize: 13, lineHeight: 1.5, marginTop: 10 }}>
              Ask Sendera about your wallet, network, transactions or crypto basics.
            </p>

            <div
              style={{
                marginTop: 14,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 9,
              }}
            >
              {["Check my balance", "Explain my last transaction", "Which network am I using?", "How can I save gas?"].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => alert(`${prompt}\n\nAI connection will be wired into this assistant.`)}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid rgba(129,111,220,.20)",
                    background: "rgba(7,14,34,.62)",
                    color: "#eef2ff",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                gap: 9,
                alignItems: "center",
                marginTop: 14,
                padding: 9,
                borderRadius: 15,
                background: "#07132f",
                border: "1px solid #263760",
              }}
            >
              <input
                placeholder="Ask Sendera..."
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: 0,
                  outline: 0,
                  background: "transparent",
                  color: "white",
                  fontSize: 13,
                }}
              />
              <button
                onClick={() => alert("AI connection will be wired into this assistant.")}
                style={{
                  border: 0,
                  borderRadius: 11,
                  padding: "9px 13px",
                  color: "white",
                  background: "linear-gradient(135deg,#7c3aed,#2563eb)",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Ask
              </button>
            </div>
          </section>
        </div>
      )}

      <nav
        style={{
          position: "fixed",
          bottom: 12,
          left: 10,
          right: 10,
          zIndex: 50,
          background: "linear-gradient(180deg, rgba(7,15,39,.92), rgba(5,11,29,.97))",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(110,91,210,.35)",
          borderRadius: 24,
          display: "flex",
          justifyContent: "space-around",
          padding: "8px 5px",
          boxShadow: "0 18px 50px rgba(0,0,0,.45), 0 0 35px rgba(79,70,229,.10)",
        }}
      >
        {items.map((item) => {
          const active = item.key === "ai" ? aiOpen : activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleItem(item)}
              aria-label={item.label}
              style={{
                flex: 1,
                minWidth: 0,
                border: active ? "1px solid rgba(139,92,246,.35)" : "1px solid transparent",
                background: active ? "linear-gradient(180deg, rgba(124,58,237,.26), rgba(37,99,235,.10))" : "transparent",
                color: active ? "#f3f0ff" : "#8390aa",
                borderRadius: 17,
                padding: "8px 2px 7px",
                cursor: "pointer",
                boxShadow: active ? "0 0 24px rgba(124,58,237,.18)" : "none",
              }}
            >
              <div style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</div>
              <div style={{ fontSize: 9, marginTop: 5, fontWeight: active ? 800 : 500 }}>{item.label}</div>
            </button>
          );
        })}
      </nav>
    </>
  );
}

export default BottomNav;
