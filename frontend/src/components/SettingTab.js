function SettingTab({
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
        <p>Network</p>
        <p>Mainnet (Coming Soon)</p>
      </div>

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
          marginTop: 20,
          fontWeight: "bold",
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default SettingTab;
