function AIChatTab() {
  const quickActions = [
    "Check my balance",
    "Explain my last transaction",
    "Which network am I using?",
    "How can I save gas?",
  ];

  return (
    <div
      style={{
        minHeight: "calc(100vh - 20px)",
        maxWidth: 620,
        margin: "0 auto",
        padding: "8px 2px 30px",
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <div style={{ color: "#a8b2cc", fontSize: 12, fontWeight: 600 }}>Sendera Intelligence</div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 4 }}>
          <h2 style={{ margin: 0, fontSize: 29 }}>AI Assistant</h2>
          <span style={{ fontSize: 9, fontWeight: 900, padding: "5px 7px", borderRadius: 999, background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>BETA</span>
        </div>
        <p style={{ color: "#8d9ab5", fontSize: 13, marginTop: 7 }}>Ask about your wallet, transactions, networks or crypto basics.</p>
      </div>

      <section
        style={{
          background: "linear-gradient(135deg, rgba(54,33,118,.58), rgba(9,48,112,.55))",
          border: "1px solid rgba(139,92,246,.35)",
          borderRadius: 24,
          padding: 20,
          boxShadow: "0 18px 50px rgba(60,44,150,.20)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              display: "grid",
              placeItems: "center",
              fontSize: 28,
              background: "linear-gradient(145deg,#8d3fff,#2f72ff)",
              boxShadow: "0 12px 30px rgba(112,63,255,.32)",
            }}
          >
            ✦
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Hello, I’m Sendera AI</div>
            <div style={{ color: "#b8c1d8", fontSize: 12, marginTop: 4 }}>Your wallet-side copilot.</div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 9, marginTop: 18 }}>
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => alert(`${action}\n\nAI connection will be wired into this assistant.`)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: 13,
                borderRadius: 14,
                border: "1px solid rgba(129,111,220,.20)",
                background: "rgba(8,16,39,.52)",
                color: "#e8ecf8",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {action} <span style={{ float: "right", color: "#a56bff" }}>→</span>
            </button>
          ))}
        </div>
      </section>

      <section
        style={{
          marginTop: 14,
          background: "rgba(13,21,52,.84)",
          border: "1px solid rgba(104,76,210,.26)",
          borderRadius: 22,
          padding: 16,
        }}
      >
        <div style={{ color: "#8d9abb", fontSize: 11, marginBottom: 8 }}>Ask Sendera</div>
        <div
          style={{
            display: "flex",
            gap: 9,
            alignItems: "center",
            background: "#09132f",
            border: "1px solid #263760",
            borderRadius: 14,
            padding: "9px 10px",
          }}
        >
          <input
            placeholder="Ask about your wallet..."
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
            Send
          </button>
        </div>
      </section>
    </div>
  );
}

export default AIChatTab;
