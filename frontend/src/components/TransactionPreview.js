function TransactionPreview({
  wallet,
  network,
  address,
  amount,
  gasFee,
  onCancel,
  onConfirm,
}) {
  const row = {
    background: "#0a1330",
    border: "1px solid #24345f",
    borderRadius: 14,
    padding: "12px 14px",
    marginTop: 8,
  };

  return (
    <div
      style={{
        background: "linear-gradient(145deg, rgba(22,28,72,.96), rgba(8,16,43,.98))",
        border: "1px solid rgba(139,92,246,.35)",
        padding: 20,
        borderRadius: 24,
        marginTop: 18,
        boxShadow: "0 20px 55px rgba(48,35,120,.22)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ color: "#8d9abc", fontSize: 12 }}>Final review</div>
          <h3 style={{ margin: "4px 0 0", fontSize: 22 }}>Confirm Send</h3>
        </div>
        <div style={{ width: 42, height: 42, borderRadius: 14, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>✓</div>
      </div>

      <div style={row}><span style={{ color: "#8290af", fontSize: 12 }}>Network</span><div style={{ marginTop: 4, fontWeight: 700 }}>{network}</div></div>
      <div style={row}><span style={{ color: "#8290af", fontSize: 12 }}>From</span><div style={{ marginTop: 4, fontSize: 12, wordBreak: "break-all" }}>{wallet?.address}</div></div>
      <div style={row}><span style={{ color: "#8290af", fontSize: 12 }}>To</span><div style={{ marginTop: 4, fontSize: 12, wordBreak: "break-all" }}>{address}</div></div>

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <div style={{ ...row, flex: 1, marginTop: 0 }}><span style={{ color: "#8290af", fontSize: 12 }}>Amount</span><div style={{ marginTop: 4, fontSize: 18, fontWeight: 800 }}>{amount} ETH</div></div>
        <div style={{ ...row, flex: 1, marginTop: 0 }}><span style={{ color: "#8290af", fontSize: 12 }}>Gas</span><div style={{ marginTop: 4, fontSize: 14, fontWeight: 800 }}>{gasFee ? `${gasFee} ETH` : "Calculating..."}</div></div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: 14, background: "#16203b", color: "#dbe4f7", border: "1px solid #2b3a60", borderRadius: 14, fontWeight: 700 }}>Cancel</button>
        <button onClick={onConfirm} style={{ flex: 1, padding: 14, background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "white", border: "1px solid rgba(167,139,250,.45)", borderRadius: 14, fontWeight: 800 }}>Confirm & Send</button>
      </div>
    </div>
  );
}

export default TransactionPreview;
