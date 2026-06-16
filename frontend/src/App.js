import { NETWORKS } from "./components/rpcConfig";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

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
  const [transactions, setTransactions] =
  useState([]);
  
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
      const rpcUrl =
        NETWORKS[selectedNetwork]?.rpc;

      const provider =
        new ethers.JsonRpcProvider(
          rpcUrl
        );

      const balanceWei =
        await provider.getBalance(
          wallet.address
        );

      const balanceEth =
        ethers.formatEther(
          balanceWei
        );

      console.log(
        "Network:",
        selectedNetwork
      );

      console.log(
        "Address:",
        wallet.address
      );

      console.log(
        "Balance:",
        balanceEth
      );

      setBalance(balanceEth);
    } catch (error) {
      console.error(error);

      alert(
        "Balance Error: " +
          error.message
      );
    }
  }

  loadBalance();
}, [wallet, selectedNetwork]);
  
  useEffect(() => {
  async function loadTransactions() {
    if (!wallet) return;

    try {
      const API_KEY =
  "21PH9R17JIRPKGF2VZDYVT3UJXGSQ43KEE";

      const response =
        await fetch(
          `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${wallet.address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${API_KEY}`
        );

      const data =
        await response.json();

      if (
        data.status === "1"
      ) {
        setTransactions(
          data.result
        );
      }
    } catch (error) {
      console.log(
        "Transaction Error:",
        error
      );
    }
  }

  if (
    selectedNetwork ===
    "ethereumSepolia"
  ) {
    loadTransactions();
  }
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
              selectedNetwork={selectedNetwork}
              />
              )}
        
         {activeTab === "send" && (
           <SendTab />
         )}
        
        {activeTab === "receive" && (
          <ReceiveTab wallet={wallet} />
        )}

        {activeTab === "history" && (
          <HistoryTab
            wallet={wallet}
            selectedNetwork={selectedNetwork}
            transactions={transactions}
          /> 
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
