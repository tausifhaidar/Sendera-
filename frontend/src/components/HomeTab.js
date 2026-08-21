import { useState } from "react";

function HomeTab({ wallet, balance, selectedNetwork }) {
  const [copied, setCopied] = useState(false);

  const networkName =
    selectedNetwork === "baseSepolia"
      ? "Base Sepolia"
      : selectedNetwork === "ethereumSepolia"
      ? "Ethereum Sepolia"
      : "Polygon Amoy";

  async function copyAddress() {
    if (!wallet?.address) return;
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("Unable to copy address");
    }
  }

  const shortAddress = wallet?.address
    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
    : "No wallet";

  const actionStyle = {
    flex: 1,
    minWidth: 0,
    border: "1px solid #243047",
    background: "#111a2d",
    color: "white",
    borderRadius: 16,
    padding: "14px 8px",
    textAlign: "center",
    fontSize: 12,
    fontWeight: 600,
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", paddingBottom: 12 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 2px 18px",
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: "#8b98ad" }}>Welcome back</div>
          <h1 style={{ margin: "3px 0 0", fontSize: 24, letterSpacing: -0.5 }}>
            Sendera
          </h1>
        </div>

        <div
          style={{
            background: "#111a2d",
            border: "1px solid #243047",
            borderRadius: 20,
            padding: "8px 11px",
            fontSize: 11,
            color: "#cbd5e1",
          }}
        >
          ● {networkName}
        </div>
      </div>

      <section
        style={{
          background: "linear-gradient(145deg, #111d36, #0b1223)",
          border: "1px solid #243047",
          borderRadius: 24,
          padding: 22,
          boxShadow: "0 18px 45px rgba(0,0,0,.22)",
        }}
      >
        <div style={{ color: "#8b98ad", fontSize: 13 }}>Total Balance</div>
        <div
          style={{
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: -1.2,
            marginTop: 7,
          }}
        >
          {Number(balance || 0).toFixed(4)} ETH
        </div>
        <div style={{ color: "#64748b", fontSize: 12, marginTop: 5 }}>
          {networkName}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 20,
            paddingTop: 14,
            borderTop: "1px solid #243047",
          }}
        >
          <span style={{ color: "#94a3b8", fontSize: 12 }}>{shortAddress}</span>
          <button
            onClick={copyAddress}
            style={{
              border: 0,
              background: "transparent",
              color: "#60a5fa",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </section>

      <div style={{ display: "flex", gap: 9, marginTop: 14 }}>
        <button style={actionStyle}>↑<br />Send</button>
        <button style={actionStyle}>↓<br />Receive</button>
        <button style={actionStyle}>⇄<br />Swap</button>
        <button style={actionStyle}>＋<br />Buy</button>
      </div>

      <section
        style={{
          background: "#0d1628",
          border: "1px solid #1d2a40",
          borderRadius: 20,
          marginTop: 16,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 17px 12px",
          }}
        >
          <strong style={{ fontSize: 15 }}>Assets</strong>
          <span style={{ color: "#64748b", fontSize: 11 }}>Current network</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 17px",
            borderTop: "1px solid #1d2a40",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#18243a",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
              }}
            >
              Ξ
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Ethereum</div>
              <div style={{ color: "#64748b", fontSize: 11 }}>ETH</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>
              {Number(balance || 0).toFixed(4)} ETH
            </div>
            <div style={{ color: "#64748b", fontSize: 11 }}>Native asset</div>
          </div>
        </div>

        <div style={{ padding: "11px 17px 15px", color: "#60a5fa", fontSize: 12 }}>
          Open Tokens →
        </div>
      </section>

      <section
        style={{
          background: "#0d1628",
          border: "1px solid #1d2a40",
          borderRadius: 20,
          marginTop: 16,
          padding: 17,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <strong style={{ fontSize: 15 }}>AI Assistant</strong>
          <span style={{ color: "#22c55e", fontSize: 11 }}>Ready</span>
        </div>
        <div style={{ color: "#7f8da3", fontSize: 12, marginTop: 6 }}>
          Ask Sendera about your wallet, network or transaction.
        </div>
        <div
          style={{
            marginTop: 12,
            background: "#111c31",
            border: "1px solid #202e46",
            borderRadius: 13,
            padding: "11px 13px",
            color: "#64748b",
            fontSize: 12,
          }}
        >
          Ask Sendera...
        </div>
      </section>
    </div>
  );
}

export default HomeTab;
