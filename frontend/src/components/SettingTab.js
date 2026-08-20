import NetworkSelector from "./NetworkSelector";

function SettingTab({
  wallet,
  seedPhrase,
  selectedNetwork,
  setSelectedNetwork,
  setWallet,
  setSeedPhrase,
  setScreen,
}) {
  const networkName =
    selectedNetwork === "baseSepolia"
      ? "Base Sepolia"
      : selectedNetwork === "ethereumSepolia"
      ? "Ethereum Sepolia"
      : selectedNetwork === "polygonAmoy"
      ? "Polygon Amoy"
      : selectedNetwork;

  function copyAddress() {
    if (!wallet?.address) return;

    navigator.clipboard
      .writeText(wallet.address)
      .then(() => alert("Address Copied"))
      .catch(() => alert("Unable to copy address"));
  }

  function showRecoveryPhrase() {
    if (!seedPhrase) {
      alert("Recovery Phrase not available");
      return;
    }

    const confirmed = window.confirm(
      "Never share your recovery phrase with anyone. Anyone with it can control your wallet. Continue?"
    );

    if (confirmed) {
      alert(seedPhrase);
    }
  }

  function lockWallet() {
    setWallet(null);
    setSeedPhrase("");
    setScreen("locked");
  }

  function logoutWallet() {
    const confirmed = window.confirm(
      "This will remove the encrypted wallet from this device. Make sure you have your recovery phrase before continuing."
    );

    if (!confirmed) return;

    localStorage.removeItem("sendera_wallet");
    setWallet(null);
    setSeedPhrase("");
    setScreen("welcome");
  }

  return (
    <div>
      <h2>Settings</h2>

      <div
        style={{
          background: "#0f172a",
          padding: 20,
          borderRadius: 16,
          marginTop: 20,
        }}
      >
        <p style={{ color: "#94a3b8", marginBottom: 8 }}>
          Wallet Address
        </p>

        <p style={{ wordBreak: "break-all", margin: 0 }}>
          {wallet?.address || "No Wallet"}
        </p>

        <p style={{ color: "#22c55e", marginBottom: 0 }}>
          {networkName}
        </p>
      </div>

      <NetworkSelector
        selectedNetwork={selectedNetwork}
        setSelectedNetwork={setSelectedNetwork}
      />

      <div
        style={{
          background: "#0f172a",
          padding: 20,
          borderRadius: 16,
          marginTop: 20,
        }}
      >
        <p style={{ color: "#94a3b8", marginBottom: 8 }}>Security</p>
        <p style={{ margin: 0 }}>Encrypted Local Wallet</p>
        <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.5 }}>
          Your wallet is encrypted on this device. Your PIN is never stored.
          Never share your recovery phrase.
        </p>
      </div>

      <button
        onClick={copyAddress}
        style={{
          width: "100%",
          padding: 14,
          border: "none",
          borderRadius: 12,
          background: "#2563eb",
          color: "white",
          marginTop: 20,
          fontWeight: "bold",
        }}
      >
        Copy Address
      </button>

      <button
        onClick={showRecoveryPhrase}
        style={{
          width: "100%",
          padding: 14,
          border: "none",
          borderRadius: 12,
          background: "#f59e0b",
          color: "white",
          marginTop: 15,
          fontWeight: "bold",
        }}
      >
        View Recovery Phrase
      </button>

      <button
        onClick={lockWallet}
        style={{
          width: "100%",
          padding: 14,
          border: "none",
          borderRadius: 12,
          background: "#475569",
          color: "white",
          marginTop: 15,
          fontWeight: "bold",
        }}
      >
        Lock Wallet
      </button>

      <button
        onClick={logoutWallet}
        style={{
          width: "100%",
          padding: 14,
          border: "none",
          borderRadius: 12,
          background: "#ef4444",
          color: "white",
          marginTop: 15,
          fontWeight: "bold",
        }}
      >
        Remove Wallet
      </button>
    </div>
  );
}

export default SettingTab;
