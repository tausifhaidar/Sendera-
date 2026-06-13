function NetworkSelector({
  selectedNetwork,
  setSelectedNetwork,
}) {
  const networks = [
    {
      key: "baseSepolia",
      name: "Base Sepolia",
    },
    {
      key: "ethereumSepolia",
      name: "Ethereum Sepolia",
    },
    {
      key: "polygonAmoy",
      name: "Polygon Amoy",
    },
  ];

  return (
    <div
      style={{
        background: "#0f172a",
        padding: 20,
        borderRadius: 16,
        marginTop: 20,
      }}
    >
      <h3>Network Selector</h3>

      <div
        style={{
          marginTop: 15,
        }}
      >
        {networks.map((network) => (
          <p
            key={network.key}
            onClick={() =>
              setSelectedNetwork(
                network.key
              )
            }
            style={{
              cursor: "pointer",
            }}
          >
            {selectedNetwork ===
            network.key
              ? "🟢"
              : "⚪"}{" "}
            {network.name}
          </p>
        ))}
      </div>
    </div>
  );
}

export default NetworkSelector;
