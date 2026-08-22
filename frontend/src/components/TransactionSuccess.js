function TransactionSuccess({ amount, network, address, hash, onDone }) {
  const shortHash = hash ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : "";
  const shortAddress = address ? `${address.slice(0, 8)}...${address.slice(-6)}` : "";

  function copyHash() {
    if (!hash) return;
    navigator.clipboard?.writeText(hash).then(() => alert("Transaction hash copied!")).catch(() => alert("Unable to copy transaction hash."));
  }

  function openExplorer() {
    if (!hash) return;
    let explorer = "";
    if (network === "Ethereum Sepolia") explorer = `https://sepolia.etherscan.io/tx/${hash}`;
    else if (network === "Base Sepolia") explorer = `https://sepolia.basescan.org/tx/${hash}`;
    else if (network === "Polygon Amoy") explorer = `https://amoy.polygonscan.com/tx/${hash}`;
    if (explorer) window.open(explorer, "_blank", "noopener,noreferrer");
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(4,7,24,.82)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18, zIndex: 1000 }}>
      <div style={{ width: "100%", maxWidth: 430, background: "linear-gradient(145deg,#17154b,#08132f)", border: "1px solid rgba(139,92,246,.4)", borderRadius: 28, padding: 24, boxSizing: "border-box", boxShadow: "0 30px 100px rgba(0,0,0,.55), 0 0 50px rgba(124,58,237,.16)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 76, height: 76, borderRadius: 24, margin: "0 auto 16px", display: "grid", placeItems: "center", background: "linear-gradient(135deg,#22c55e,#14b8a6)", color: "#04120a", fontSize: 38, fontWeight: 900, boxShadow: "0 0 35px rgba(34,197,94,.25)" }}>✓</div>
          <div style={{ color: "#77e6a7", fontSize: 12, fontWeight: 800, letterSpacing: .4 }}>TRANSACTION COMPLETE</div>
          <h2 style={{ margin: "5px 0 0", fontSize: 25 }}>Sent Successfully</h2>
          <p style={{ color: "#9aa7c0", marginTop: 8 }}>{amount} ETH sent on {network}</p>
        </div>

        <div style={{ background: "#09132f", border: "1px solid #24365f", borderRadius: 18, padding: 15, marginTop: 18 }}>
          <div style={{ color: "#7887a5", fontSize: 11 }}>Recipient</div><div style={{ marginTop: 4, fontWeight: 700 }}>{shortAddress}</div>
          <div style={{ color: "#7887a5", fontSize: 11, marginTop: 13 }}>Transaction hash</div><div style={{ marginTop: 4, wordBreak: "break-all", fontSize: 12 }}>{shortHash}</div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={copyHash} style={{ flex: 1, padding: 13, border: "1px solid #2b3d68", borderRadius: 14, background: "#111d3a", color: "white", fontWeight: 800 }}>Copy Hash</button>
          <button onClick={openExplorer} style={{ flex: 1, padding: 13, border: "1px solid rgba(139,92,246,.45)", borderRadius: 14, background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "white", fontWeight: 800 }}>Explorer →</button>
        </div>
        <button onClick={onDone} style={{ width: "100%", padding: 13, marginTop: 10, border: "none", background: "transparent", color: "#92a0ba", fontWeight: 700 }}>Back to Activity</button>
      </div>
    </div>
  );
}

export default TransactionSuccess;
