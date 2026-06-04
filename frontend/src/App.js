import { useState } from "react";
import { ethers } from "ethers";

function App() {
  const [screen, setScreen] = useState("welcome");
  const [wallet, setWallet] = useState(null);
  const [seedPhrase, setSeedPhrase] = useState("");

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

      <button
        style={{
          width: 250,
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
  );
}

export default App;
