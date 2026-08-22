function QRCard({ address, network }) {
  const qrData = address ? encodeURIComponent(address) : "";
  const qrUrl = qrData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${qrData}`
    : "";

  async function copyAddress() {
    if (!address) return;
    try { await navigator.clipboard.writeText(address); alert("Address Copied"); }
    catch { alert("Unable to copy address"); }
  }

  async function shareAddress() {
    if (!address) return;
    const shareText = `My Sendera wallet address (${network}):\n${address}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Sendera Wallet Address", text: shareText }); } catch {}
      return;
    }
    try { await navigator.clipboard.writeText(address); alert("Sharing is not available. Address copied instead."); }
    catch { alert("Unable to share address"); }
  }

  return (
    <div
      style={{
        background: "linear-gradient(145deg, rgba(24,30,72,.95), rgba(8,17,45,.98))",
        border: "1px solid rgba(139,92,246,.32)",
        padding: 20,
        borderRadius: 24,
        marginTop: 16,
        textAlign: "center",
        boxShadow: "0 18px 50px rgba(0,0,0,.18)",
      }}
    >
      <div style={{ color: "#8d9abb", fontSize: 12 }}>Scan to receive</div>
      <h3 style={{ margin: "5px 0 0", fontSize: 21 }}>Your QR Code</h3>
      <p style={{ color: "#8491ad", marginTop: 6, fontSize: 12 }}>{network}</p>

      <div style={{ width: 240, height: 240, background: "white", margin: "18px auto", borderRadius: 22, padding: 10, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 40px rgba(99,102,241,.15)" }}>
        {qrUrl ? <img src={qrUrl} alt="Sendera wallet QR code" width="220" height="220" style={{ display: "block" }} /> : <span style={{ color: "#0f172a" }}>No Wallet</span>}
      </div>

      <p style={{ color: "#8c99b5", fontSize: 12, wordBreak: "break-all", margin: "0 0 15px" }}>{address || "No Wallet"}</p>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={copyAddress} style={{ flex: 1, padding: 12, border: "1px solid #293b68", borderRadius: 13, background: "#101c39", color: "white", fontWeight: 700 }}>Copy</button>
        <button onClick={shareAddress} style={{ flex: 1, padding: 12, border: "1px solid rgba(139,92,246,.42)", borderRadius: 13, background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "white", fontWeight: 800 }}>Share</button>
      </div>
    </div>
  );
}

export default QRCard;
