import { useState } from "react";
import NetworkSelector from "./NetworkSelector";

function SettingTab({ wallet, seedPhrase, selectedNetwork, setSelectedNetwork, setWallet, setSeedPhrase, setScreen, onChangePin }) {
  const [showPinForm, setShowPinForm] = useState(false);
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [savingPin, setSavingPin] = useState(false);

  const networkName = selectedNetwork === "baseSepolia" ? "Base Sepolia" : selectedNetwork === "ethereumSepolia" ? "Ethereum Sepolia" : selectedNetwork === "polygonAmoy" ? "Polygon Amoy" : selectedNetwork;

  function copyAddress() {
    if (!wallet?.address) return;
    navigator.clipboard.writeText(wallet.address).then(() => alert("Address Copied")).catch(() => alert("Unable to copy address"));
  }

  function showRecoveryPhrase() {
    if (!seedPhrase) return alert("Recovery Phrase not available");
    const confirmed = window.confirm("Never share your recovery phrase with anyone. Anyone with it can control your wallet. Continue?");
    if (confirmed) alert(seedPhrase);
  }

  async function changePin() {
    if (!onChangePin) return alert("PIN change is unavailable.");
    if (newPin.length < 6) return alert("New PIN must contain at least 6 characters.");
    if (newPin !== confirmNewPin) return alert("New PINs do not match.");
    try {
      setSavingPin(true);
      await onChangePin(oldPin, newPin);
      setOldPin(""); setNewPin(""); setConfirmNewPin(""); setShowPinForm(false);
      alert("PIN changed successfully.");
    } catch (error) {
      alert(error?.message || "Unable to change PIN.");
    } finally { setSavingPin(false); }
  }

  function lockWallet() {
    setWallet(null); setSeedPhrase(""); setScreen("locked");
  }

  function logoutWallet() {
    const confirmed = window.confirm("This will remove the encrypted wallet from this device. Make sure you have your recovery phrase before continuing.");
    if (!confirmed) return;
    localStorage.removeItem("sendera_wallet");
    setWallet(null); setSeedPhrase(""); setScreen("welcome");
  }

  const button = (background, marginTop = 15) => ({ width: "100%", padding: 14, border: "none", borderRadius: 12, background, color: "white", marginTop, fontWeight: "bold", cursor: "pointer" });

  return (
    <div>
      <h2>Settings</h2>

      <div style={{ background: "#0f172a", padding: 20, borderRadius: 16, marginTop: 20 }}>
        <p style={{ color: "#94a3b8", marginBottom: 8 }}>Wallet Address</p>
        <p style={{ wordBreak: "break-all", margin: 0 }}>{wallet?.address || "No Wallet"}</p>
        <p style={{ color: "#22c55e", marginBottom: 0 }}>{networkName}</p>
      </div>

      <NetworkSelector selectedNetwork={selectedNetwork} setSelectedNetwork={setSelectedNetwork} />

      <div style={{ background: "#0f172a", padding: 20, borderRadius: 16, marginTop: 20 }}>
        <p style={{ color: "#94a3b8", marginBottom: 8 }}>Security</p>
        <p style={{ margin: 0 }}>Encrypted Local Wallet</p>
        <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.5 }}>
          Wallet data is encrypted with AES-GCM. The active wallet session auto-locks after inactivity.
        </p>
      </div>

      <button onClick={copyAddress} style={button("#2563eb", 20)}>Copy Address</button>
      <button onClick={showRecoveryPhrase} style={button("#f59e0b")}>View Recovery Phrase</button>
      <button onClick={() => setShowPinForm((value) => !value)} style={button("#7c3aed")}>{showPinForm ? "Close PIN Change" : "Change PIN"}</button>

      {showPinForm && (
        <div style={{ background: "#0f172a", padding: 16, borderRadius: 14, marginTop: 12 }}>
          <input type="password" inputMode="numeric" placeholder="Current PIN" value={oldPin} onChange={(e) => setOldPin(e.target.value)} style={{ width: "100%", padding: 12, boxSizing: "border-box", marginBottom: 10 }} />
          <input type="password" inputMode="numeric" placeholder="New PIN" value={newPin} onChange={(e) => setNewPin(e.target.value)} style={{ width: "100%", padding: 12, boxSizing: "border-box", marginBottom: 10 }} />
          <input type="password" inputMode="numeric" placeholder="Confirm New PIN" value={confirmNewPin} onChange={(e) => setConfirmNewPin(e.target.value)} style={{ width: "100%", padding: 12, boxSizing: "border-box" }} />
          <button onClick={changePin} disabled={savingPin} style={button("#22c55e", 10)}>{savingPin ? "Changing..." : "Save New PIN"}</button>
        </div>
      )}

      <button onClick={lockWallet} style={button("#475569")}>Lock Wallet Now</button>
      <button onClick={logoutWallet} style={button("#ef4444")}>Remove Wallet</button>
    </div>
  );
}

export default SettingTab;
