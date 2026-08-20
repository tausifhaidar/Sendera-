import QRCard from "./QRCard";

function ReceiveTab({ wallet, selectedNetwork }) {
  const networkName =
    selectedNetwork === "baseSepolia"
      ? "Base Sepolia"
      : selectedNetwork === "ethereumSepolia"
      ? "Ethereum Sepolia"
      : selectedNetwork === "polygonAmoy"
      ? "Polygon Amoy"
      : selectedNetwork;

  const address = wallet?.address || "";

  async function copyAddress() {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      alert("Address Copied");
    } catch {
      alert("Unable to copy address");
    }
  }

  async function shareAddress() {
    if (!address) return;

    const shareText = `My Sendera wallet address (${networkName}):\n${address}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Sendera Wallet Address",
          text: shareText,
        });
      } catch {}
      return;
    }

    try {
      await navigator.clipboard.writeText(address);
      alert("Sharing is not available. Address copied instead.");
    } catch {
      alert("Unable to share address");
    }
  }

  return (
    <div>
      <h2>Receive Crypto</h2>

      <div
        style={{
          background: "#0f172a",
          padding: 20,
          borderRadius: 16,
          marginTop: 20,
        }}
      >
        <p style={{ color: "#94a3b8" }}>Network</p>
        <h3 style={{ marginTop: 5 }}>{networkName}</h3>

        <p style={{ color: "#94a3b8", marginTop: 20 }}>
          Wallet Address
        </p>

        <p
          style={{
            wordBreak: "break-all",
            marginBottom: 0,
          }}
        >
          {address || "No Wallet"}
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
          <button
            onClick={copyAddress}
            style={{
              flex: 1,
              padding: 12,
              border: "none",
              borderRadius: 12,
              background: "#334155",
              color: "white",
              fontWeight: "bold",
            }}
          >
            Copy Address
          </button>

          <button
            onClick={shareAddress}
            style={{
              flex: 1,
              padding: 12,
              border: "none",
              borderRadius: 12,
              background: "#22c55e",
              color: "white",
              fontWeight: "bold",
            }}
          >
            Share
          </button>
        </div>
      </div>

      <QRCard address={address} network={networkName} />
    </div>
  );
}

export default ReceiveTab;
