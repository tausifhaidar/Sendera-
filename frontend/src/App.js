import { useState, useEffect } from "react";
import { ethers } from "ethers";

import { NETWORKS } from "./components/rpcConfig";
import SendTab from "./components/SendTab";
import HomeTab from "./components/HomeTab";
import ReceiveTab from "./components/ReceiveTab";
import HistoryTab from "./components/HistoryTab";
import SettingTab from "./components/SettingTab";
import BottomNav from "./components/BottomNav";

function App() {
  const [screen, setScreen] = useState("welcome");
  const [wallet, setWallet] = useState(null);
  const [seedPhrase, setSeedPhrase] = useState("");
  const [importPhrase, setImportPhrase] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [selectedNetwork, setSelectedNetwork] =
  useState("baseSepolia");
  const [balance, setBalance] =
useState("0.0000");
  
  function createWallet() {
    const newWallet = ethers.Wallet.createRandom();

    const phrase =
      newWallet.mnemonic?.phrase || "";

    localStorage.setItem(
      "sendera_wallet",
      JSON.stringify({
        address: newWallet.address,
        privateKey: newWallet.privateKey,
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
          address: importedWallet.address,
          privateKey:
            importedWallet.privateKey,
          phrase: importPhrase.trim(),
        })
      );

      setWallet(importedWallet);
      setScreen("dashboard");
    } catch {
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
      setSeedPhrase(
  data.phrase || ""
);
      setScreen("dashboard");
    } catch {}
  }, []);
useEffect(() => {
  async function loadBalance() {
    if (!wallet) return;

    try {
      const provider =
  new ethers.JsonRpcProvider(
    NETWORKS[selectedNetwork].rpc
  );

      const rawBalance =
        await provider.getBalance(
          wallet.address
        );

      const formattedBalance =
        ethers.formatEther(
          rawBalance
        );

      setBalance(
        Number(
          formattedBalance
        ).toFixed(4)
      );
    } catch (err) {
      console.log(err);
    }
  }

  loadBalance();
}, [wallet, selectedNetwork]);
  
if (screen === "backup") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#020617",
          color: "white",
          padding: 20,
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
            padding: 16,
            marginTop: 20,
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
          paddingBottom: 100,
        }}
      >
        {activeTab === "home" && (
          <HomeTab
               wallet={wallet}
              balance={balance}
              />
              )}
        
         {activeTab === "send" && (
           <SendTab />
         )}
        
{activeTab === "receive" && (
          <ReceiveTab wallet={wallet} />
        )}

        {activeTab === "history" && (
          <HistoryTab />
        )}

        {activeTab === "settings" && (
          <SettingTab
            wallet={wallet}
            seedPhrase={seedPhrase}
            selectedNetwork={selectedNetwork}
            setSelectedNetwork={setSelectedNetwork}
            setWallet={setWallet}
            setSeedPhrase={setSeedPhrase}
            setScreen={setScreen}
          />
        )}

        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
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
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <h1>Sendera</h1>

      <p>
        Your AI Crypto Assistant
      </p>

      <button
        onClick={createWallet}
        style={{
          width: 250,
          padding: 16,
          marginBottom: 15,
        }}
      >
        Create Wallet
      </button>

      <textarea
        placeholder="Paste Seed Phrase"
        value={importPhrase}
        onChange={(e) =>
          setImportPhrase(
            e.target.value
          )
        }
        style={{
          width: 250,
          height: 100,
          marginBottom: 10,
        }}
      />

      <button
        onClick={importWallet}
        style={{
          width: 250,
          padding: 16,
        }}
      >
        Import Wallet
      </button>
    </div>
  );
}

export default App;
