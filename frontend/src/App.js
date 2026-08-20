import { NETWORKS } from "./components/rpcConfig";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

import SendTab from "./components/SendTab";
import HomeTab from "./components/HomeTab";
import ReceiveTab from "./components/ReceiveTab";
import HistoryTab from "./components/HistoryTab";
import SettingTab from "./components/SettingTab";
import BottomNav from "./components/BottomNav";
import TransactionSuccess from "./components/TransactionSuccess";
import {
  encryptWallet,
  decryptWallet,
  isEncryptedWallet,
} from "./components/walletSecurity";

function getUserFriendlyError(error) {
  const message = String(error?.shortMessage || error?.reason || error?.message || "");
  const code = error?.code;

  if (code === "ACTION_REJECTED" || /user rejected|user denied|rejected/i.test(message)) return "Transaction cancelled by user.";
  if (/insufficient funds|insufficient balance|underfunded|not enough funds/i.test(message)) return "Insufficient balance to complete this transaction, including gas fees.";
  if (/invalid address|bad address/i.test(message)) return "Invalid recipient wallet address.";
  if (/could not coalesce|invalid BigNumberish|invalid value|underflow|overflow/i.test(message)) return "Please enter a valid amount.";
  if (/network|rpc|failed to fetch|timeout|server error|could not detect/i.test(message)) return "Network connection failed. Please try again.";
  if (/gas|fee data|estimate/i.test(message)) return "Unable to estimate gas right now. Please check the network and try again.";
  return "Transaction failed. Please check the details and try again.";
}

function App() {
  const [screen, setScreen] = useState("welcome");
  const [wallet, setWallet] = useState(null);
  const [seedPhrase, setSeedPhrase] = useState("");
  const [importPhrase, setImportPhrase] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [selectedNetwork, setSelectedNetwork] = useState("baseSepolia");
  const [balance, setBalance] = useState("0.0000");
  const [transactions, setTransactions] = useState([]);
  const [recipient, setRecipient] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [gasFee, setGasFee] = useState("");
  const [successTransaction, setSuccessTransaction] = useState(null);
  const [pendingWallet, setPendingWallet] = useState(null);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [unlockPin, setUnlockPin] = useState("");
  const [isSavingWallet, setIsSavingWallet] = useState(false);

  async function saveEncryptedWallet(targetWallet, phrase, userPin) {
    const payload = await encryptWallet({ address: targetWallet.address, privateKey: targetWallet.privateKey, phrase }, userPin);
    localStorage.setItem("sendera_wallet", payload);
  }

  function createWallet() {
    const newWallet = ethers.Wallet.createRandom();
    const phrase = newWallet.mnemonic?.phrase || "";
    setPendingWallet({ wallet: newWallet, phrase });
    setSeedPhrase(phrase);
    setPin("");
    setConfirmPin("");
    setScreen("backup");
  }

  function importWallet() {
    try {
      const phrase = importPhrase.trim();
      if (!phrase) return alert("Please enter your recovery phrase.");
      const importedWallet = ethers.Wallet.fromPhrase(phrase);
      setPendingWallet({ wallet: importedWallet, phrase });
      setSeedPhrase("");
      setPin("");
      setConfirmPin("");
      setScreen("setPin");
    } catch {
      alert("Invalid recovery phrase. Please check it and try again.");
    }
  }

  async function finishWalletSetup() {
    if (!pendingWallet?.wallet) return;
    if (pin.length < 6) return alert("PIN must contain at least 6 characters.");
    if (pin !== confirmPin) return alert("PINs do not match.");

    try {
      setIsSavingWallet(true);
      await saveEncryptedWallet(pendingWallet.wallet, pendingWallet.phrase, pin);
      setWallet(pendingWallet.wallet);
      setSeedPhrase(pendingWallet.phrase);
      setPendingWallet(null);
      setPin("");
      setConfirmPin("");
      setScreen("dashboard");
    } catch (error) {
      console.error(error);
      alert("Unable to secure wallet on this device.");
    } finally {
      setIsSavingWallet(false);
    }
  }

  async function unlockWallet() {
    if (!unlockPin) return alert("Enter your wallet PIN.");

    try {
      const savedWallet = localStorage.getItem("sendera_wallet");
      if (!savedWallet || !isEncryptedWallet(savedWallet)) {
        alert("Wallet storage is not encrypted. Please restore your wallet and create a new secure PIN.");
        return;
      }

      const data = await decryptWallet(savedWallet, unlockPin);
      const restoredWallet = new ethers.Wallet(data.privateKey);
      setWallet(restoredWallet);
      setSeedPhrase(data.phrase || "");
      setUnlockPin("");
      setScreen("dashboard");
    } catch {
      alert("Incorrect PIN or corrupted wallet data.");
    }
  }

  async function estimateGas(to, amount) {
    try {
      if (!wallet) return "";
      if (!ethers.isAddress(to)) throw new Error("Invalid address");
      if (!amount || Number(amount) <= 0) throw new Error("Invalid amount");
      const parsedAmount = ethers.parseEther(amount);
      const rpcUrl = NETWORKS[selectedNetwork]?.rpc;
      if (!rpcUrl) throw new Error("Network unavailable");
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const gasLimit = await provider.estimateGas({ from: wallet.address, to, value: parsedAmount });
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice ?? feeData.maxFeePerGas;
      if (!gasPrice) throw new Error("Unable to fetch gas price");
      const estimatedFee = gasLimit * gasPrice;
      const currentBalance = await provider.getBalance(wallet.address);
      if (currentBalance < parsedAmount + estimatedFee) throw new Error("Insufficient funds");
      return ethers.formatEther(estimatedFee);
    } catch (error) {
      console.error("Gas Estimation Error:", error);
      alert(getUserFriendlyError(error));
      return "";
    }
  }

  async function handlePreviewTransaction(to, amount) {
    setGasFee("");
    const estimatedFee = await estimateGas(to, amount);
    if (!estimatedFee) return false;
    setGasFee(estimatedFee);
    setShowPreview(true);
    return true;
  }

  async function sendTransaction(to, amount) {
    try {
      if (!wallet) throw new Error("Wallet unavailable");
      if (!ethers.isAddress(to)) throw new Error("Invalid address");
      if (!amount || Number(amount) <= 0) throw new Error("Invalid amount");
      const parsedAmount = ethers.parseEther(amount);
      const rpcUrl = NETWORKS[selectedNetwork]?.rpc;
      if (!rpcUrl) throw new Error("Network unavailable");
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const signer = wallet.connect(provider);
      const currentBalance = await provider.getBalance(wallet.address);
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice ?? feeData.maxFeePerGas;
      const gasLimit = await provider.estimateGas({ from: wallet.address, to, value: parsedAmount });
      if (!gasPrice) throw new Error("Unable to fetch gas price");
      const estimatedFee = gasLimit * gasPrice;
      if (currentBalance < parsedAmount + estimatedFee) throw new Error("Insufficient funds");
      const tx = await signer.sendTransaction({ to, value: parsedAmount, gasLimit });
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Send Transaction Error:", error);
      alert(getUserFriendlyError(error));
      return null;
    }
  }

  async function refreshBalance() {
    if (!wallet) return;
    try {
      const rpcUrl = NETWORKS[selectedNetwork]?.rpc;
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      setBalance(ethers.formatEther(await provider.getBalance(wallet.address)));
    } catch (error) {
      console.error("Balance Error:", error);
    }
  }

  async function refreshTransactions() {
    if (!wallet) return;
    if (selectedNetwork !== "ethereumSepolia") return setTransactions([]);

    try {
      const apiBase = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${apiBase}/api/transactions?address=${encodeURIComponent(wallet.address)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "History unavailable");
      setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
    } catch (error) {
      console.log("Transaction History Error:", error.message);
      setTransactions([]);
    }
  }

  useEffect(() => {
    const savedWallet = localStorage.getItem("sendera_wallet");
    if (!savedWallet) return;
    if (isEncryptedWallet(savedWallet)) {
      setScreen("locked");
      return;
    }
    localStorage.removeItem("sendera_wallet");
    setScreen("welcome");
  }, []);

  useEffect(() => { refreshBalance(); }, [wallet, selectedNetwork]);
  useEffect(() => { refreshTransactions(); }, [wallet, selectedNetwork]);

  if (screen === "backup") return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "white", padding: 20 }}>
      <h1>Backup Wallet</h1>
      <p>Save your recovery phrase somewhere safe. Never share it.</p>
      <div style={{ background: "#0f172a", padding: 20, borderRadius: 12, marginTop: 20, wordBreak: "break-word" }}>{seedPhrase}</div>
      <button onClick={() => setScreen("setPin")} style={{ width: "100%", padding: 16, marginTop: 20 }}>I Saved It</button>
    </div>
  );

  if (screen === "setPin") return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "white", display: "flex", flexDirection: "column", justifyContent: "center", padding: 20 }}>
      <h1>Secure Your Wallet</h1>
      <p style={{ color: "#94a3b8" }}>Create a PIN of at least 6 characters. This PIN encrypts your wallet on this device.</p>
      <input type="password" inputMode="numeric" autoComplete="new-password" placeholder="Create PIN" value={pin} onChange={(e) => setPin(e.target.value)} style={{ width: "100%", padding: 14, boxSizing: "border-box", marginTop: 15 }} />
      <input type="password" inputMode="numeric" autoComplete="new-password" placeholder="Confirm PIN" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} style={{ width: "100%", padding: 14, boxSizing: "border-box", marginTop: 12 }} />
      <button onClick={finishWalletSetup} disabled={isSavingWallet} style={{ width: "100%", padding: 16, marginTop: 20 }}>{isSavingWallet ? "Securing Wallet..." : "Secure Wallet"}</button>
    </div>
  );

  if (screen === "locked") return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "white", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 20 }}>
      <h1>Sendera Locked</h1>
      <p style={{ color: "#94a3b8" }}>Enter your PIN to unlock your wallet.</p>
      <input type="password" inputMode="numeric" autoComplete="current-password" placeholder="Wallet PIN" value={unlockPin} onChange={(e) => setUnlockPin(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") unlockWallet(); }} style={{ width: 250, padding: 14, boxSizing: "border-box", marginTop: 15 }} />
      <button onClick={unlockWallet} style={{ width: 250, padding: 16, marginTop: 15 }}>Unlock Wallet</button>
    </div>
  );

  if (screen === "dashboard") return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "white", padding: 20, paddingBottom: 100 }}>
      {activeTab === "home" && <HomeTab wallet={wallet} balance={balance} selectedNetwork={selectedNetwork} />}
      {activeTab === "send" && <SendTab wallet={wallet} recipient={recipient} setRecipient={setRecipient} sendAmount={sendAmount} setSendAmount={setSendAmount} showPreview={showPreview} setShowPreview={setShowPreview} selectedNetwork={selectedNetwork} gasFee={gasFee} onPreviewTransaction={handlePreviewTransaction} setGasFee={setGasFee} onSendTransaction={sendTransaction} onTransactionSuccess={(hash) => setSuccessTransaction({ hash, amount: sendAmount, address: recipient, network: NETWORKS[selectedNetwork]?.name || selectedNetwork })} />}
      {activeTab === "receive" && <ReceiveTab wallet={wallet} selectedNetwork={selectedNetwork} />}
      {activeTab === "history" && <HistoryTab wallet={wallet} selectedNetwork={selectedNetwork} transactions={transactions} />}
      {activeTab === "settings" && <SettingTab wallet={wallet} seedPhrase={seedPhrase} selectedNetwork={selectedNetwork} setSelectedNetwork={setSelectedNetwork} setWallet={setWallet} setSeedPhrase={setSeedPhrase} setScreen={setScreen} setTransactions={setTransactions} />}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      {successTransaction && <TransactionSuccess amount={successTransaction.amount} network={successTransaction.network} address={successTransaction.address} hash={successTransaction.hash} onDone={() => { setSuccessTransaction(null); setActiveTab("home"); }} />}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "white", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 20 }}>
      <h1>Sendera</h1>
      <p>Your AI Crypto Assistant</p>
      <button onClick={createWallet} style={{ width: 250, padding: 16, marginBottom: 15 }}>Create Wallet</button>
      <textarea placeholder="Paste Seed Phrase" value={importPhrase} onChange={(e) => setImportPhrase(e.target.value)} style={{ width: 250, height: 100, marginBottom: 10 }} />
      <button onClick={importWallet} style={{ width: 250, padding: 16 }}>Import Wallet</button>
    </div>
  );
}

export default App;
