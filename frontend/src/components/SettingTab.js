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
    <p>Wallet Address</p>

    <p
      style={{
        wordBreak: "break-all",
      }}
    >
      {wallet?.address || "No Wallet"}
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
    <p>Theme</p>
    <p>Dark Mode</p>
  </div>

  <button
    onClick={() => {
      navigator.clipboard.writeText(
        wallet?.address || ""
      );

      alert("Address Copied");
    }}
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
    onClick={() => {
      if (!seedPhrase) {
        alert(
          "Recovery Phrase not available"
        );
        return;
      }

      alert(seedPhrase);
    }}
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
    onClick={() => {
      localStorage.removeItem(
        "sendera_wallet"
      );

      setWallet(null);
      setSeedPhrase("");
      setScreen("welcome");
    }}
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
    Logout
  </button>
</div>

);
}

export default SettingTab;
