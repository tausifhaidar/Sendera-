import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { NETWORKS } from "./rpcConfig";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

function TokenTab({ wallet, selectedNetwork }) {
  const network = NETWORKS[selectedNetwork] || {};
  const [tokens, setTokens] = useState(() => { try { return JSON.parse(localStorage.getItem("sendera_tokens") || "[]"); } catch { return []; } });
  const [holdings, setHoldings] = useState([]);
  const [contract, setContract] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendForm, setSendForm] = useState({});
  const [sending, setSending] = useState("");
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  function persist(next) { setTokens(next); localStorage.setItem("sendera_tokens", JSON.stringify(next)); }

  async function loadHoldings() {
    if (!wallet || !backendUrl || !network.chainId) return;
    try {
      const response = await fetch(`${backendUrl.replace(/\/$/, "")}/api/token-holdings?address=${encodeURIComponent(wallet.address)}&chainid=${network.chainId}`);
      const data = await response.json();
      if (response.ok && Array.isArray(data.holdings)) setHoldings(data.holdings);
      else setHoldings([]);
    } catch (error) { console.log("Token holdings error:", error.message); setHoldings([]); }
  }

  async function addToken() {
    if (!wallet || !ethers.isAddress(contract)) { alert("Enter a valid ERC-20 token contract address."); return; }
    try {
      setLoading(true);
      const provider = new ethers.JsonRpcProvider(network.rpc);
      const token = new ethers.Contract(contract, ERC20_ABI, provider);
      const [name, symbol, decimals] = await Promise.all([token.name(), token.symbol(), token.decimals()]);
      const item = { address: contract, name, symbol, decimals: Number(decimals), network: selectedNetwork };
      persist([item, ...tokens.filter((t) => !(t.address.toLowerCase() === contract.toLowerCase() && t.network === selectedNetwork))]);
      setContract("");
      await loadHoldings();
    } catch (error) { console.error(error); alert("Unable to read this token contract on the selected network."); }
    finally { setLoading(false); }
  }

  async function sendToken(token) {
    const key = `${selectedNetwork}:${token.address}`;
    const form = sendForm[key] || {};
    if (!wallet || !ethers.isAddress(form.to || "") || !form.amount || Number(form.amount) <= 0) { alert("Enter a valid recipient and token amount."); return; }
    try {
      setSending(key);
      const provider = new ethers.JsonRpcProvider(network.rpc);
      const signer = wallet.connect(provider);
      const tokenContract = new ethers.Contract(token.address, ERC20_ABI, signer);
      const value = ethers.parseUnits(String(form.amount), token.decimals);
      const gas = await tokenContract.transfer.estimateGas(form.to, value);
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice ?? feeData.maxFeePerGas;
      const fee = gasPrice ? gas * gasPrice : 0n;
      const nativeBalance = await provider.getBalance(wallet.address);
      if (gasPrice && nativeBalance < fee) throw new Error(`Insufficient ${network.symbol || "native"} balance for gas fees.`);
      const tx = await tokenContract.transfer(form.to, value, { gasLimit: gas });
      await tx.wait();
      alert(`Token transaction successful!\n\nHash:\n${tx.hash}`);
      setSendForm((previous) => ({ ...previous, [key]: { to: "", amount: "" } }));
      await loadHoldings();
    } catch (error) { console.error(error); alert(error?.shortMessage || error?.message || "Token transaction failed."); }
    finally { setSending(""); }
  }

  useEffect(() => { loadHoldings(); }, [wallet, selectedNetwork]);

  const localTokens = tokens.filter((token) => token.network === selectedNetwork);
  const merged = [...holdings, ...localTokens].filter((token, index, arr) => token.address && arr.findIndex((t) => t.address?.toLowerCase() === token.address.toLowerCase()) === index);

  function displayBalance(token) {
    try { return ethers.formatUnits(token.balance || "0", token.decimals || 18); } catch { return "0"; }
  }

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", paddingBottom: 30 }}>
      <div style={{ marginBottom: 18 }}><div style={{ color: "#8d9abb", fontSize: 12 }}>Assets & tokens</div><h2 style={{ margin: "4px 0 0", fontSize: 28 }}>Tokens</h2><p style={{ color: "#8d9abb", margin: "6px 0 0", fontSize: 12 }}>{network.name || selectedNetwork}</p></div>

      <div style={{ background: "linear-gradient(145deg,rgba(28,26,75,.94),rgba(8,17,45,.98))", border: "1px solid rgba(139,92,246,.28)", padding: 18, borderRadius: 22 }}><div style={{ fontWeight: 800, fontSize: 16 }}>Wallet tokens</div><div style={{ color: "#7e8ca9", fontSize: 12, marginTop: 5 }}>Holdings are discovered automatically when the backend explorer service is available.</div><button onClick={loadHoldings} style={{ width: "100%", padding: 12, marginTop: 12, border: "1px solid rgba(139,92,246,.45)", borderRadius: 13, background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "white", fontWeight: 800 }}>Refresh Holdings</button></div>

      <div style={{ background: "rgba(13,21,52,.84)", border: "1px solid rgba(91,74,170,.25)", padding: 18, borderRadius: 22, marginTop: 14 }}><div style={{ fontWeight: 800 }}>Import token</div><input value={contract} onChange={(e) => setContract(e.target.value)} placeholder="Token contract 0x..." style={{ width: "100%", padding: 13, marginTop: 10, borderRadius: 13, border: "1px solid #293b68", background: "#09132f", color: "white", boxSizing: "border-box" }} /><button onClick={addToken} disabled={loading} style={{ width: "100%", padding: 13, marginTop: 9, border: 0, borderRadius: 13, background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "white", fontWeight: 800 }}>{loading ? "Reading..." : "Import Token"}</button></div>

      {merged.length === 0 ? <div style={{ background: "rgba(13,21,52,.84)", border: "1px solid #26345c", padding: 30, borderRadius: 22, marginTop: 16, color: "#8b98b5", textAlign: "center" }}><div style={{ color: "#dce4f2", fontWeight: 700 }}>No token balances found</div><div style={{ fontSize: 12, marginTop: 5 }}>Receive or import an ERC-20 token on this network.</div></div> : merged.map((token) => {
        const key = `${selectedNetwork}:${token.address}`;
        const form = sendForm[key] || { to: "", amount: "" };
        const balanceText = displayBalance(token);
        const usd = Number(token.priceUsd || 0) * Number(balanceText || 0);
        return <div key={key} style={{ background: "rgba(13,21,52,.84)", border: "1px solid rgba(91,74,170,.25)", padding: 18, borderRadius: 22, marginTop: 14 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}><div><strong>{token.name || token.symbol}</strong><div style={{ color: "#7c8aa6", fontSize: 12, marginTop: 3 }}>{token.symbol}</div></div><div style={{ textAlign: "right" }}><strong>{Number(balanceText).toFixed(4)}</strong><div style={{ color: "#7c8aa6", fontSize: 11, marginTop: 3 }}>{token.priceUsd ? `$${usd.toFixed(2)}` : "Price unavailable"}</div></div></div><div style={{ fontSize: 10, color: "#697896", wordBreak: "break-all", marginTop: 11 }}>{token.address}</div><input value={form.to} onChange={(e) => setSendForm((p) => ({ ...p, [key]: { ...form, to: e.target.value } }))} placeholder="Recipient 0x..." style={{ width: "100%", padding: 12, marginTop: 12, borderRadius: 13, border: "1px solid #293b68", background: "#09132f", color: "white", boxSizing: "border-box" }} /><input value={form.amount} onChange={(e) => setSendForm((p) => ({ ...p, [key]: { ...form, amount: e.target.value } }))} placeholder={`Amount ${token.symbol || "token"}`} type="number" style={{ width: "100%", padding: 12, marginTop: 8, borderRadius: 13, border: "1px solid #293b68", background: "#09132f", color: "white", boxSizing: "border-box" }} /><button onClick={() => sendToken(token)} disabled={sending === key} style={{ width: "100%", padding: 13, marginTop: 9, border: 0, borderRadius: 13, background: "linear-gradient(135deg,#2563eb,#0ea5e9)", color: "white", fontWeight: 800 }}>{sending === key ? "Sending..." : `Send ${token.symbol || "Token"}`}</button></div>;
      })}
    </div>
  );
}

export default TokenTab;
