import { useState } from "react";

function HomeTab({ wallet, balance, selectedNetwork, setSelectedNetwork, setActiveTab }) {
  const [copied, setCopied] = useState(false);

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
      : "Polygon Amoy";

  const shortAddress = wallet?.address
    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
    : "No wallet";

  async function copyAddress() {
    if (!wallet?.address) return;
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("Unable to copy address");
    }
  }

  const go = (tab) => setActiveTab?.(tab);
  const card = {
    background: "rgba(11, 20, 49, 0.72)",
    border: "1px solid rgba(145, 110, 255, 0.28)",
    borderRadius: 24,
    boxShadow: "0 18px 55px rgba(4, 7, 30, .35)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
  };

  const action = (title, subtitle, icon, accent, tab) => (
    <button
      onClick={() => go(tab)}
      style={{
        ...card,
        flex: 1,
        minWidth: 0,
        padding: "17px 8px 15px",
        color: "white",
        cursor: "pointer",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          margin: "0 auto 10px",
          display: "grid",
          placeItems: "center",
          background: accent,
          boxShadow: `0 10px 28px ${accent}66`,
          fontSize: 22,
          fontWeight: 900,
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 15, fontWeight: 800 }}>{title}</div>
      <div style={{ marginTop: 3, fontSize: 11, color: "#a9b4d0" }}>{subtitle}</div>
    </button>
  );

  return (
    <div
      style={{
        minHeight: "calc(100vh - 20px)",
        maxWidth: 560,
        margin: "0 auto",
        padding: "8px 2px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -2,
          background:
            "radial-gradient(circle at 12% 12%, rgba(87,71,255,.35), transparent 34%), radial-gradient(circle at 88% 30%, rgba(0,173,255,.22), transparent 30%), radial-gradient(circle at 70% 85%, rgba(158,67,255,.26), transparent 30%), linear-gradient(180deg, #05061a 0%, #07102b 42%, #09061f 100%)",
        }}
      />

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          opacity: 0.33,
          pointerEvents: "none",
          backgroundImage:
            "radial-gradient(circle at 20% 18%, white 0 1px, transparent 1px), radial-gradient(circle at 72% 36%, white 0 1px, transparent 1px), radial-gradient(circle at 84% 78%, white 0 1px, transparent 1px)",
          backgroundSize: "220px 180px, 260px 220px, 300px 260px",
        }}
      />

      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 6px 14px" }}>
        <div>
          <div style={{ color: "#a7b1ca", fontSize: 13, fontWeight: 600 }}>Welcome back 👋</div>
          <div style={{ marginTop: 2, fontSize: 31, fontWeight: 900, letterSpacing: -1.2 }}>Sendera</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => go("receive")} style={{ ...card, width: 42, height: 42, color: "white", fontSize: 18, cursor: "pointer" }}>⌗</button>
          <button onClick={() => go("settings")} style={{ ...card, width: 42, height: 42, color: "white", fontSize: 18, cursor: "pointer" }}>⚙</button>
        </div>
      </header>

      <div style={{ position: "relative", margin: "0 0 12px 2px" }}>
        <select
          value={selectedNetwork}
          onChange={(e) => setSelectedNetwork?.(e.target.value)}
          aria-label="Select network"
          style={{
            appearance: "none",
            WebkitAppearance: "none",
            border: "1px solid rgba(130,150,255,.30)",
            background: "linear-gradient(135deg, rgba(24,39,86,.92), rgba(31,18,71,.90))",
            color: "#eef2ff",
            borderRadius: 999,
            padding: "10px 36px 10px 14px",
            fontWeight: 800,
            fontSize: 12,
            cursor: "pointer",
            outline: "none",
            boxShadow: "0 10px 30px rgba(35,40,120,.18)",
          }}
        >
          {networks.map((network) => (
            <option key={network.key} value={network.key} style={{ background: "#0b1227", color: "white" }}>
              ● {network.name}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 118,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: "#b9c6e6",
            fontSize: 11,
          }}
        >
          ▾
        </span>
      </div>

      <section
        style={{
          ...card,
          padding: 22,
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, rgba(22,27,74,.92), rgba(20,10,59,.74) 55%, rgba(7,36,73,.80))",
        }}
      >
        <div style={{ position: "absolute", right: -20, top: -20, width: 210, height: 210, borderRadius: "50%", background: "radial-gradient(circle, rgba(143,75,255,.42), transparent 68%)" }} />
        <div style={{ color: "#b5bfd7", fontSize: 13, fontWeight: 600 }}>Total Balance</div>
        <div style={{ marginTop: 5, fontSize: 40, lineHeight: 1, fontWeight: 900, letterSpacing: -1.7, whiteSpace: "nowrap" }}>
          {Number(balance || 0).toFixed(4)} ETH
        </div>
        <div style={{ marginTop: 8, color: "#92a0bd", fontSize: 13 }}>{networkName}</div>

        <div style={{ marginTop: 17, height: 78, display: "flex", alignItems: "center" }}>
          <svg width="100%" height="78" viewBox="0 0 420 78" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6d35ff" />
                <stop offset="100%" stopColor="#35a7ff" />
              </linearGradient>
            </defs>
            <path d="M0 59 C45 47, 64 69, 103 48 S164 56, 205 33 S258 48, 297 24 S345 30, 420 5" fill="none" stroke="url(#line)" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ border: "1px solid rgba(170,160,255,.18)", background: "rgba(255,255,255,.06)", borderRadius: 14, padding: "9px 11px", color: "#dce2f1", fontSize: 12 }}>
            {shortAddress}
          </div>
          <button onClick={copyAddress} style={{ border: 0, background: "transparent", color: "#8ec6ff", fontWeight: 800, cursor: "pointer" }}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </section>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        {action("Send", "Crypto", "↑", "linear-gradient(145deg,#7b31ff,#5b20ff)", "send")}
        {action("Receive", "Crypto", "↓", "linear-gradient(145deg,#22e77c,#08b862)", "receive")}
        {action("Swap", "Tokens", "⇄", "linear-gradient(145deg,#19b9ff,#0677d8)", "tokens")}
        {action("Buy", "Crypto", "+", "linear-gradient(145deg,#ff9c2d,#ff6f00)", "send")}
      </div>

      <section style={{ ...card, marginTop: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "17px 17px 13px", borderBottom: "1px solid rgba(120,140,190,.13)" }}>
          <div style={{ fontSize: 19, fontWeight: 850 }}>Assets</div>
          <button onClick={() => go("tokens")} style={{ border: 0, background: "transparent", color: "#bd6fff", fontWeight: 800, cursor: "pointer" }}>View all</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 17px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", display: "grid", placeItems: "center", background: "linear-gradient(145deg,#4d73ff,#2637b7)", boxShadow: "0 8px 22px rgba(56,70,220,.35)", fontSize: 24 }}>Ξ</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>Ethereum</div>
              <div style={{ color: "#8f9bb3", marginTop: 3, fontSize: 12 }}>ETH</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{Number(balance || 0).toFixed(4)} ETH</div>
            <div style={{ color: "#8994ab", fontSize: 11, marginTop: 3 }}>Native asset</div>
          </div>
        </div>

        <button onClick={() => go("tokens")} style={{ width: "100%", border: 0, borderTop: "1px solid rgba(120,140,190,.13)", background: "rgba(255,255,255,.02)", color: "#7fc4ff", padding: 14, textAlign: "left", fontWeight: 800, cursor: "pointer" }}>
          Open Tokens →
        </button>
      </section>

      <section style={{ ...card, marginTop: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "17px 17px 13px", borderBottom: "1px solid rgba(120,140,190,.13)" }}>
          <div style={{ fontSize: 19, fontWeight: 850 }}>Recent Activity</div>
          <button onClick={() => go("history")} style={{ border: 0, background: "transparent", color: "#bd6fff", fontWeight: 800, cursor: "pointer" }}>View all</button>
        </div>
        <div style={{ padding: "12px 17px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "9px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{ width: 37, height: 37, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(125,45,255,.16)", color: "#b36cff", fontSize: 18 }}>↗</div>
              <div><div style={{ fontWeight: 800, fontSize: 14 }}>Sent</div><div style={{ color: "#8f9bb3", fontSize: 11 }}>Latest transaction</div></div>
            </div>
            <div style={{ textAlign: "right" }}><div style={{ fontWeight: 800, fontSize: 13 }}>Activity</div><div style={{ color: "#39dd92", fontSize: 11 }}>Confirmed</div></div>
          </div>
          <div style={{ height: 1, background: "rgba(120,140,190,.12)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "9px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{ width: 37, height: 37, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(21,210,120,.14)", color: "#37e792", fontSize: 18 }}>↙</div>
              <div><div style={{ fontWeight: 800, fontSize: 14 }}>Received</div><div style={{ color: "#8f9bb3", fontSize: 11 }}>Latest incoming</div></div>
            </div>
            <div style={{ textAlign: "right" }}><div style={{ fontWeight: 800, fontSize: 13 }}>View history</div><div style={{ color: "#8f9bb3", fontSize: 11 }}>All networks</div></div>
          </div>
        </div>
      </section>

      <button
        onClick={() => go("settings")}
        style={{
          ...card,
          width: "100%",
          marginTop: 14,
          padding: "17px 18px",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 14,
          textAlign: "left",
          cursor: "pointer",
          background: "linear-gradient(135deg, rgba(78,43,155,.50), rgba(9,64,140,.50))",
        }}
      >
        <div style={{ width: 48, height: 48, borderRadius: 16, display: "grid", placeItems: "center", background: "linear-gradient(145deg,#8b43ff,#3e59ff)", fontSize: 25, boxShadow: "0 10px 28px rgba(102,63,255,.35)" }}>✦</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}><strong style={{ fontSize: 17 }}>AI Assistant</strong><span style={{ fontSize: 9, fontWeight: 900, padding: "4px 6px", borderRadius: 999, background: "#7d55ff" }}>BETA</span></div>
          <div style={{ marginTop: 4, color: "#b5bfd2", fontSize: 12 }}>Ask anything about your wallet, network or transactions.</div>
        </div>
        <div style={{ width: 42, height: 42, borderRadius: "50%", display: "grid", placeItems: "center", background: "linear-gradient(145deg,#8f3bff,#5b4bff)", fontSize: 22 }}>→</div>
      </button>
    </div>
  );
}

export default HomeTab;
