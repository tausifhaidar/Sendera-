import QRCard from "./QRCard";

function ReceiveTab({ wallet, selectedNetwork, setSelectedNetwork }) {
  const networks = [
    { key: "baseSepolia", name: "Base Sepolia" },
    { key: "ethereumSepolia", name: "Ethereum Sepolia" },
    { key: "polygonAmoy", name: "Polygon Amoy" },
  ];

  const networkName =
    selectedNetwork === "baseSepolia"
      ? "Base Sepolia"
      : selectedNetwork === "ethereumSepolia"
      ? "Ethereum Sepolia"
      : selectedNetwork === "polygonAmoy"
      ? "Polygon Amoy"
      : selectedNetwork;

  const address = wallet?.address || "";
  const shortAddress = address ? `${address.slice(0, 10)}...${address.slice(-8)}` : "No wallet";

  async function copyAddress() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      alert("Address Copied");
    } catch { alert("Unable to copy address"); }
  }

  async function shareAddress() {
    if (!address) return;
    const shareText = `My Sendera wallet address (${networkName}):\n${address}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Sendera Wallet Address", text: shareText }); } catch {}
      return;
    }
    try {
      await navigator.clipboard.writeText(address);
      alert("Sharing is not available. Address copied instead.");
    } catch { alert("Unable to share address"); }
  }

  const card = {
    background: "rgba(13,21,52,.84)",
    border: "1px solid rgba(104,76,210,.26)",
    borderRadius: 24,
    boxShadow: "0 18px 50px rgba(0,0,0,.18)",
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", paddingBottom: 30 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ color: "#8d9abb", fontSize: 12 }}>Receive securely</div>
        <h2 style={{ margin: "4px 0 0", fontSize: 28 }}>Receive Crypto</h2>
        <p style={{ color: "#8d9abb", fontSize: 13, marginTop: 7 }}>Choose the network first, then share your address.</p>
      </div>

      <div style={{ ...card, padding: 18 }}>
        <div style={{ color: "#8694b3", fontSize: 11, fontWeight: 800, letterSpacing: 0.4 }}>RECEIVE ON NETWORK</div>
        <div style={{ display: "grid", gap: 9, marginTop: 12 }}>
          {networks.map((network) => {
            const active = selectedNetwork === network.key;
            return (
              <button
                key={network.key}
                onClick={() => setSelectedNetwork(network.key)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "13px 14px",
                  borderRadius: 15,
                  border: active ? "1px solid rgba(139,92,246,.75)" : "1px solid #26375f",
                  background: active ? "linear-gradient(135deg, rgba(124,58,237,.30), rgba(37,99,235,.24))" : "#0b1634",
                  color: "white",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontWeight: 750, fontSize: 13 }}>{network.name}</span>
                <span style={{ color: active ? "#a78bfa" : "#667594", fontSize: 12 }}>{active ? "✓ Selected" : "Select"}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ ...card, padding: 20, marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#8694b3", fontSize: 12 }}>Selected Network</div>
            <strong style={{ display: "block", marginTop: 4 }}>{networkName}</strong>
          </div>
          <div style={{ padding: "7px 10px", borderRadius: 99, background: "rgba(34,197,94,.12)", color: "#4ade80", fontSize: 11 }}>Ready to receive</div>
        </div>

        <div style={{ marginTop: 18, padding: 14, borderRadius: 16, background: "#09132f", border: "1px solid #24345f" }}>
          <div style={{ color: "#7f8cac", fontSize: 11 }}>Wallet address</div>
          <div style={{ marginTop: 6, fontSize: 15, fontWeight: 700, wordBreak: "break-all" }}>{address || "No Wallet"}</div>
          <div style={{ color: "#667594", fontSize: 11, marginTop: 6 }}>{shortAddress}</div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={copyAddress} style={{ flex: 1, padding: 13, border: "1px solid #2d3d69", borderRadius: 14, background: "#121f40", color: "white", fontWeight: 700 }}>Copy Address</button>
          <button onClick={shareAddress} style={{ flex: 1, padding: 13, border: "1px solid rgba(139,92,246,.45)", borderRadius: 14, background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "white", fontWeight: 800 }}>Share</button>
        </div>
      </div>

      <QRCard address={address} network={networkName} />
    </div>
  );
}

export default ReceiveTab;
