import { useState } from "react";
import NetworkSelector from "./NetworkSelector";

function SettingTab({ wallet, seedPhrase, selectedNetwork, setSelectedNetwork, setWallet, setSeedPhrase, setScreen, onChangePin }) {
  const [showPinForm, setShowPinForm] = useState(false);
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [savingPin, setSavingPin] = useState(false);

  const networkName = selectedNetwork === "baseSepolia" ? "Base Sepolia" : selectedNetwork === "ethereumSepolia" ? "Ethereum Sepolia" : "Polygon Amoy";
  const card = { background: "rgba(13,21,52,.84)", border: "1px solid rgba(91,74,170,.25)", borderRadius: 22, boxShadow: "0 16px 45px rgba(0,0,0,.15)" };
  const input = { width: "100%", padding: 13, borderRadius: 13, border: "1px solid #293b68", background: "#09132f", color: "white", boxSizing: "border-box" };

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
    } catch (error) { alert(error?.message || "Unable to change PIN."); }
    finally { setSavingPin(false); }
  }

  function lockWallet() { setWallet(null); setSeedPhrase(""); setScreen("locked"); }

  function logoutWallet() {
    const confirmed = window.confirm("This will remove the encrypted wallet from this device. Make sure you have your recovery phrase before continuing.");
    if (!confirmed) return;
    localStorage.removeItem("sendera_wallet"); setWallet(null); setSeedPhrase(""); setScreen("welcome");
  }

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", paddingBottom: 30 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ color: "#8d9abb", fontSize: 12 }}>Wallet controls</div>
        <h2 style={{ margin: "4px 0 0", fontSize: 28 }}>Settings</h2>
      </div>

      <section style={{ ...card, padding: 18 }}>
        <div style={{ color: "#8694b3", fontSize: 11 }}>ACTIVE WALLET</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 15, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#7c3aed,#2563eb)", fontSize: 20 }}>◉</div>
          <div style={{ minWidth: 0 }}><div style={{ fontWeight: 800 }}>Sendera Wallet</div><div style={{ color: "#7e8ca9", fontSize: 12, wordBreak: "break-all", marginTop: 3 }}>{wallet?.address || "No Wallet"}</div></div>
        </div>
        <div style={{ marginTop: 14, display: "inline-flex", padding: "6px 10px", borderRadius: 999, background: "rgba(34,197,94,.1)", color: "#4ade80", fontSize: 11 }}>{networkName}</div>
      </section>

      <section style={{ ...card, padding: 18, marginTop: 14 }}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Network</div>
        <NetworkSelector selectedNetwork={selectedNetwork} setSelectedNetwork={setSelectedNetwork} />
      </section>

      <section style={{ ...card, padding: 18, marginTop: 14 }}>
        <div style={{ fontWeight: 800 }}>Security</div>
        <div style={{ color: "#7f8daa", fontSize: 12, lineHeight: 1.55, marginTop: 6 }}>Your wallet is encrypted locally with AES-GCM. The active session automatically locks after inactivity.</div>
        <div style={{ marginTop: 13, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          <button onClick={copyAddress} style={{ padding: 12, borderRadius: 13, border: "1px solid #293b68", background: "#101c39", color: "white", fontWeight: 700 }}>Copy Address</button>
          <button onClick={showRecoveryPhrase} style={{ padding: 12, borderRadius: 13, border: "1px solid rgba(245,158,11,.35)", background: "rgba(245,158,11,.10)", color: "#fbbf24", fontWeight: 700 }}>Recovery Phrase</button>
        </div>
        <button onClick={() => setShowPinForm((value) => !value)} style={{ width: "100%", padding: 13, marginTop: 10, borderRadius: 13, border: "1px solid rgba(139,92,246,.45)", background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "white", fontWeight: 800 }}>{showPinForm ? "Close PIN Change" : "Change PIN"}</button>

        {showPinForm && (
          <div style={{ background: "#09132f", border: "1px solid #243761", padding: 14, borderRadius: 16, marginTop: 10 }}>
            <input type="password" inputMode="numeric" placeholder="Current PIN" value={oldPin} onChange={(e) => setOldPin(e.target.value)} style={input} />
            <input type="password" inputMode="numeric" placeholder="New PIN" value={newPin} onChange={(e) => setNewPin(e.target.value)} style={{ ...input, marginTop: 9 }} />
            <input type="password" inputMode="numeric" placeholder="Confirm New PIN" value={confirmNewPin} onChange={(e) => setConfirmNewPin(e.target.value)} style={{ ...input, marginTop: 9 }} />
            <button onClick={changePin} disabled={savingPin} style={{ width: "100%", padding: 13, marginTop: 10, border: "none", borderRadius: 13, background: "#22c55e", color: "#04120a", fontWeight: 900 }}>{savingPin ? "Changing..." : "Save New PIN"}</button>
          </div>
        )}
      </section>

      <section style={{ ...card, padding: 18, marginTop: 14 }}>
        <div style={{ fontWeight: 800 }}>Session</div>
        <button onClick={lockWallet} style={{ width: "100%", padding: 13, marginTop: 11, border: "1px solid #2d3e69", borderRadius: 13, background: "#121f40", color: "white", fontWeight: 800 }}>Lock Wallet Now</button>
        <button onClick={logoutWallet} style={{ width: "100%", padding: 13, marginTop: 10, border: "1px solid rgba(239,68,68,.35)", borderRadius: 13, background: "rgba(239,68,68,.10)", color: "#f87171", fontWeight: 800 }}>Remove Wallet</button>
      </section>
    </div>
  );
}

export default SettingTab;
