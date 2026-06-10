function SendTab() {
return (
<div>
<h2>Send Crypto</h2>

  <div
    style={{
      background: "#0f172a",
      padding: 20,
      borderRadius: 16,
      marginTop: 20,
    }}
  >
    <p>Recipient Address</p>

    <input
      placeholder="0x..."
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

  <div
    style={{
      background: "#0f172a",
      padding: 20,
      borderRadius: 16,
      marginTop: 20,
    }}
  >
    <p>Amount</p>

    <input
      placeholder="0.00"
      type="number"
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

  <button
    style={{
      width: "100%",
      padding: 14,
      border: "none",
      borderRadius: 12,
      background: "#22c55e",
      color: "white",
      fontWeight: "bold",
      marginTop: 20,
    }}
  >
    Preview Transaction
  </button>
</div>

);
}

export default SendTab;
