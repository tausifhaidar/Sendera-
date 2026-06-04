function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <h1
          style={{
            fontSize: 48,
            marginBottom: 10,
          }}
        >
          Sendera
        </h1>

        <p
          style={{
            color: "#94a3b8",
            fontSize: 18,
            marginBottom: 50,
          }}
        >
          Your AI Crypto Assistant
        </p>

        <button
          style={{
            width: "100%",
            maxWidth: 320,
            padding: 18,
            borderRadius: 16,
            border: "none",
            background: "#22c55e",
            color: "white",
            fontSize: 18,
            fontWeight: "bold",
            cursor: "pointer",
            marginBottom: 15,
          }}
        >
          Create Wallet
        </button>

        <br />

        <button
          style={{
            width: "100%",
            maxWidth: 320,
            padding: 18,
            borderRadius: 16,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "white",
            fontSize: 18,
            cursor: "pointer",
          }}
        >
          Import Wallet
        </button>
      </div>

      <div
        style={{
          marginTop: 80,
          textAlign: "center",
          color: "#64748b",
          fontSize: 14,
        }}
      >
        AI-Native Crypto Wallet
      </div>
    </div>
  );
}

export default App;
