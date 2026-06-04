import { useState, useEffect } from "react";
import { ethers } from "ethers";

function App() {
  const [screen, setScreen] = useState("welcome");
  const [wallet, setWallet] = useState(null);
  const [seedPhrase, setSeedPhrase] = useState("");
  const [importPhrase, setImportPhrase] = useState("");
  
  function createWallet() {
    const newWallet = ethers.Wallet.createRandom();

    const phrase =
      newWallet.mnemonic?.phrase || "";

    localStorage.setItem(
      "sendera_wallet",
      JSON.stringify({
        address: newWallet.address,
        privateKey:
          newWallet.privateKey,
        phrase,
      })
    );

    setWallet(newWallet);
    setSeedPhrase(phrase);
    setScreen("backup");
  }
  function importWallet() {
  try {
    const importedWallet =
      ethers.Wallet.fromPhrase(
        importPhrase.trim()
      );

    localStorage.setItem(
      "sendera_wallet",
      JSON.stringify({
        address:
          importedWallet.address,
        privateKey:
          importedWallet.privateKey,
        phrase:
          importPhrase.trim(),
      })
    );

    setWallet(importedWallet);
    setScreen("dashboard");
  } catch (err) {
    alert("Invalid Seed Phrase");
  }
  }
  useEffect(() => {
  const savedWallet =
    localStorage.getItem(
      "sendera_wallet"
    );

  if (!savedWallet) return;

  try {
    const data =
      JSON.parse(savedWallet);

    const restoredWallet =
      new ethers.Wallet(
        data.privateKey
      );

    setWallet(restoredWallet);
    setScreen("dashboard");
  } catch (err) {
    console.log(err);
  }
}, []);
  
  if (screen === "backup") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#020617",
          color: "white",
          padding: 20,
          fontFamily: "Arial",
        }}
      >
        <h1>Backup Wallet</h1>

        <p>
          Save your recovery phrase.
        </p>

        <div
          style={{
            background: "#0f172a",
            padding: 20,
            borderRadius: 12,
            marginTop: 20,
            wordBreak: "break-word",
          }}
        >
          {seedPhrase}
        </div>

        <button
          onClick={() =>
            setScreen("dashboard")
          }
          style={{
            width: "100%",
            marginTop: 20,
            padding: 16,
            borderRadius: 12,
            border: "none",
            background: "#22c55e",
            color: "white",
            fontWeight: "bold",
          }}
        >
          I Saved It
        </button>
      </div>
    );
  }

  if (screen === "dashboard") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#020617",
          color: "white",
          padding: 20,
          fontFamily: "Arial",
        }}
      >
        <h1>Sendera</h1>

        <div
          style={{
            background: "#0f172a",
            padding: 20,
            borderRadius: 16,
            marginTop: 20,
          }}
        >
          <p>Total Balance</p>

          <h2>$0.00</h2>
        </div>

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
            {wallet?.address}
          </p>
        </div>

         <button
  onClick={() => {
    navigator.clipboard.writeText(
      wallet?.address || ""
    );
    alert("Address Copied");
  }}
  style={{
    marginTop: 12,
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "none",
    background: "#2563eb",
    color: "white",
    fontWeight: "bold",
  }}
>
  Copy Address
</button>
    
        <div
          style={{
            marginTop: 20,
          }}
        >
          <input
            placeholder="Ask Sendera..."
            style={{
              width: "100%",
              padding: 16,
              borderRadius: 12,
              border: "none",
              background: "#1e293b",
              color: "white",
              boxSizing:
                "border-box",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        fontFamily: "Arial",
        padding: 20,
      }}
    >
      <h1>Sendera</h1>

      <p
        style={{
          color: "#94a3b8",
          marginBottom: 40,
        }}
      >
        Your AI Crypto Assistant
      </p>

      <button
        onClick={createWallet}
        style={{
          width: 250,
          padding: 16,
          borderRadius: 14,
          border: "none",
          background: "#22c55e",
          color: "white",
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 15,
        }}
      >
        Create Wallet
      </button>

      <div
  style={{
    width: 250,
  }}
>
  <textarea
    placeholder="Paste Seed Phrase"
    value={importPhrase}
    onChange={(e) =>
      setImportPhrase(
        e.target.value
      )
    }
    style={{
      width: "100%",
      height: 100,
      padding: 12,
      borderRadius: 12,
      marginBottom: 10,
      background: "#0f172a",
      color: "white",
      border:
        "1px solid #334155",
      boxSizing:
        "border-box",
    }}
  />

  <button
    onClick={importWallet}
    style={{
      width: "100%",
      padding: 16,
      borderRadius: 14,
      border: "1px solid #334155",
      background: "#0f172a",
      color: "white",
      fontSize: 18,
    }}
  >
    Import Wallet
  </button>
</div>
</div>
  );
}

export default App;
