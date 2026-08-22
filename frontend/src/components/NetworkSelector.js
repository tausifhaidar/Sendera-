function NetworkSelector({ selectedNetwork, setSelectedNetwork }) {
  const networks = [
    { key: "baseSepolia", name: "Base Sepolia", short: "Base" },
    { key: "ethereumSepolia", name: "Ethereum Sepolia", short: "Ethereum" },
    { key: "polygonAmoy", name: "Polygon Amoy", short: "Polygon" },
  ];

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 3 }}>
        {networks.map((network) => {
          const active = selectedNetwork === network.key;
          return (
            <button
              key={network.key}
              onClick={() => setSelectedNetwork(network.key)}
              style={{
                flex: "1 0 auto",
                minWidth: 105,
                padding: "11px 12px",
                borderRadius: 14,
                border: active ? "1px solid rgba(139,92,246,.55)" : "1px solid #293961",
                background: active ? "linear-gradient(135deg,rgba(124,58,237,.28),rgba(37,99,235,.18))" : "#09132f",
                color: active ? "#f2efff" : "#8b98b5",
                fontWeight: active ? 800 : 600,
                fontSize: 11,
                cursor: "pointer",
                boxShadow: active ? "0 0 22px rgba(124,58,237,.14)" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: active ? "#8b5cf6" : "#475569", display: "inline-block" }} />
                {network.short}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default NetworkSelector;
