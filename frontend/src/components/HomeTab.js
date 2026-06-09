function HomeTab({ wallet }) {
  return (
    <div>
      <h1>Sendera</h1>

      <div
        style={{
          background: "#0f172a",
          padding: 20,
          borderRadius: 16,
          marginTop: 20,
        }}
      >
        <p>Total Balance</p>
        <h2>$0.00</h2>
      </div>

      <div
        style={{
          background: "#0f172a",
          padding: 20,
          borderRadius: 16,
          marginTop: 20,
        }}
      >
        <p>Wallet Address</p>

        <p
          style={{
            wordBreak: "break-all",
          }}
        >
          {wallet?.address || "No Wallet"}
        </p>
      </div>

      <div
        style={{
          background: "#0f172a",
          padding: 20,
          borderRadius: 16,
          marginTop: 20,
        }}
      >
        <h3>AI Assistant</h3>

        <input
          placeholder="Ask Sendera..."
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "none",
            background: "#1e293b",
            color: "white",
            boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  );
}

export default HomeTab;
