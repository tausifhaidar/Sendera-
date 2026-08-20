function QRCard({ address, network }) {
  const qrData = address ? encodeURIComponent(address) : "";
  const qrUrl = qrData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrData}`
    : "";

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

    const shareText = `My Sendera wallet address (${network}):\n${address}`;

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
    <div
      style={{
        background: "#0f172a",
        padding: 20,
        borderRadius: 16,
        marginTop: 20,
        textAlign: "center",
      }}
    >
      <h3>Receive Crypto</h3>

      <p style={{ color: "#94a3b8", marginTop: 6 }}>
        {network}
      </p>

      <div
        style={{
          width: 220,
          height: 220,
          background: "white",
          margin: "20px auto",
          borderRadius: 16,
          padding: 10,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {qrUrl ? (
          <img
            src={qrUrl}
            alt="Sendera wallet QR code"
            width="200"
            height="200"
            style={{ display: "block" }}
          />
        ) : (
          <span style={{ color: "#0f172a" }}>No Wallet</span>
        )}
      </div>

      <p
        style={{
          color: "#94a3b8",
          fontSize: 13,
          wordBreak: "break-all",
          margin: "0 0 16px",
        }}
      >
        {address || "No Wallet"}
      </p>

      <div style={{ display: "flex", gap: 10 }}>
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
            cursor: "pointer",
          }}
        >
          Copy
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
            cursor: "pointer",
          }}
        >
          Share
        </button>
      </div>
    </div>
  );
}

export default QRCard;
