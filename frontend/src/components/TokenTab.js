import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { NETWORKS } from "./rpcConfig";
import { fetchNativeUsdPrice, fetchTokenUsdPrice, formatUsd } from "./priceService";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

function TokenTab({ wallet, selectedNetwork }) {
  const network = NETWORKS[selectedNetwork] || {};
  const [tokens, setTokens] = useState(() => { try { return JSON.parse(localStorage.getItem("sendera_tokens") || "[]"); } catch { return []; } });
  const [holdings, setHoldings] = useState([]);
  const [nativeBalance, setNativeBalance] = useState("0");
  const [nativePrice, setNativePrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [sendForm, setSendForm] = useState({});
  const [sending, setSending] = useState("");
  const [tokenPrices, setTokenPrices] = useState({});
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  async function loadNativeBalance() {
    if (!wallet || !network.rpc) return;
    try {
      const provider = new ethers.JsonRpcProvider(network.rpc);
      setNativeBalance(ethers.formatEther(await provider.getBalance(wallet.address)));
    } catch { setNativeBalance("0"); }
  }

  async function loadHoldings() {
    if (!wallet || !backendUrl || !network.chainId) return;
    try {
      const response = await fetch(`${backendUrl.replace(/\/$/, "")}/api/token-holdings?address=${encodeURIComponent(wallet.address)}&chainid=${network.chainId}`);
      const data = await response.json();
      if (response.ok && Array.isArray(data.holdings)) setHoldings(data.holdings); else setHoldings([]);
    } catch (error) { console.log("Token holdings error:", error.message); setHoldings([]); }
  }

  async function refreshPrices(list) {
    if (!list.length) return;
    setPriceLoading(true);
    try {
      const next = {};
      await Promise.all(list.slice(0, 40).map(async (token) => {
        const price = await fetchTokenUsdPrice(selectedNetwork, token.address);
        if (price != null) next[token.address.toLowerCase()] = price;
      }));
      setTokenPrices(next);
    } finally { setPriceLoading(false); }
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
      const nativeBalanceValue = await provider.getBalance(wallet.address);
      if (gasPrice && nativeBalanceValue < fee) throw new Error(`Insufficient ${network.symbol || "native"} balance for gas fees.`);
      const tx = await tokenContract.transfer(form.to, value, { gasLimit: gas });
      await tx.wait();
      alert(`Token transaction successful!\n\nHash:\n${tx.hash}`);
      setSendForm((previous) => ({ ...previous, [key]: { to: "", amount: "" } }));
      await loadHoldings();
    } catch (error) { console.error(error); alert(error?.shortMessage || error?.message || "Token transaction failed."); }
    finally { setSending(""); }
  }

  useEffect(() => { loadHoldings(); loadNativeBalance(); }, [wallet, selectedNetwork]);

  const localTokens = tokens.filter((token) => token.network === selectedNetwork);
  const merged = [...holdings, ...localTokens].filter((token, index, arr) => token.address && arr.findIndex((t) => t.address?.toLowerCase() === token.address.toLowerCase()) === index);

  useEffect(() => {
    refreshPrices(merged);
    let cancelled = false;
    async function loadNative() {
      try { const price = await fetchNativeUsdPrice(selectedNetwork); if (!cancelled) setNativePrice(price); }
      catch { if (!cancelled) setNativePrice(null); }
    }
    loadNative();
    const timer = window.setInterval(loadNative, 60000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [selectedNetwork, wallet, holdings.length, localTokens.length]);

  function displayBalance(token) {
    try { return ethers.formatUnits(token.balance || "0", token.decimals || 18); } catch { return "0"; }
  }

  const enriched = merged.map((token) => {
    const fallback = Number(token.priceUsd || 0);
    const price = tokenPrices[token.address?.toLowerCase()] ?? fallback;
    return { ...token, livePriceUsd: price || 0 };
  });
  const nativeUsd = Number(nativeBalance || 0) * Number(nativePrice || 0);
  const tokenUsd = enriched.reduce((sum, token) => sum + Number(displayBalance(token)) * Number(token.livePriceUsd || 0), 0);
  const totalUsd = nativeUsd + tokenUsd;
  const totalValueReady = nativePrice !== null || enriched.some((token) => token.livePriceUsd > 0);
  const card = { background: "rgba(13,21,52,.84)", border: "1px solid rgba(91,74,170,.25)", padding: 18, borderRadius: 22 };

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", paddingBottom: 30 }}>
      <div style={{ marginBottom: 18 }}><div style={{ color: "#8d9abb", fontSize: 12 }}>Assets & live prices</div><h2 style={{ margin: "4px 0 0", fontSize: 28 }}>Portfolio</h2><p style={{ color: "#8d9abb", margin: "6px 0 0", fontSize: 12 }}>{network.name || selectedNetwork}</p></div>
      <section style={{ ...card, background: "linear-gradient(145deg,rgba(28,26,75,.94),rgba(8,17,45,.98))" }}>
        <div style={{ color: "#7e8ca9", fontSize: 11, fontWeight: 800 }}>TOTAL PORTFOLIO VALUE</div>
        <div style={{ marginTop: 6, fontSize: 30, fontWeight: 900 }}>{totalValueReady ? formatUsd(totalUsd) : "Price unavailable"}</div>
        <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap", fontSize: 11, color: "#9aa8c4" }}><span>{nativeBalance} {network.symbol || "NATIVE"} · {nativePrice !== null ? formatUsd(nativePrice) : "—"}</span><span>{priceLoading ? "Updating prices…" : "Live prices"}</span></div>
        <button onClick={() => { loadHoldings(); loadNativeBalance(); refreshPrices(merged); }} style={{ width: "100%", padding: 12, marginTop: 13, border: "1px solid rgba(139,92,246,.45)", borderRadius: 13, background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "white", fontWeight: 800 }}>Refresh Portfolio</button>
      </section>
      {enriched.length === 0 ? <div style={{ ...card, marginTop: 16, color: "#8b98b5", textAlign: "center" }}><div style={{ color: "#dce4f2", fontWeight: 700 }}>No token balances found</div><div style={{ fontSize: 12, marginTop: 5 }}>Token holdings on this EVM network are discovered automatically.</div></div> : enriched.map((token) => {
        const key = `${selectedNetwork}:${token.address}`;
        const form = sendForm[key] || { to: "", amount: "" };
        const balanceText = displayBalance(token);
        const usd = Number(balanceText || 0) * Number(token.livePriceUsd || 0);
        return <div key={key} style={{ ...card, marginTop: 14 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}><div><strong>{token.name || token.symbol}</strong><div style={{ color: "#7c8aa6", fontSize: 12, marginTop: 3 }}>{token.symbol}</div></div><div style={{ textAlign: "right" }}><strong>{Number(balanceText).toFixed(6)}</strong><div style={{ color: "#7c8aa6", fontSize: 11, marginTop: 3 }}>{token.livePriceUsd ? `${formatUsd(usd)} · ${formatUsd(token.livePriceUsd)}` : "Price unavailable"}</div></div></div><div style={{ fontSize: 10, color: "#697896", wordBreak: "break-all", marginTop: 11 }}>{token.address}</div><input value={form.to} onChange={(e) => setSendForm((p) => ({ ...p, [key]: { ...form, to: e.target.value } }))} placeholder="Recipient 0x..." style={{ width: "100%", padding: 12, marginTop: 12, borderRadius: 13, border: "1px solid #293b68", background: "#09132f", color: "white", boxSizing: "border-box" }} /><input value={form.amount} onChange={(e) => setSendForm((p) => ({ ...p, [key]: { ...form, amount: e.target.value } }))} placeholder={`Amount ${token.symbol || "token"}`} type="number" style={{ width: "100%", padding: 12, marginTop: 8, borderRadius: 13, border: "1px solid #293b68", background: "#09132f", color: "white", boxSizing: "border-box" }} /><button onClick={() => sendToken(token)} disabled={sending === key} style={{ width: "100%", padding: 13, marginTop: 9, border: 0, borderRadius: 13, background: "linear-gradient(135deg,#2563eb,#0ea5e9)", color: "white", fontWeight: 800 }}>{sending === key ? "Sending..." : `Send ${token.symbol || "Token"}`}</button></div>;
      })}
    </div>
  );
}

export default TokenTab;
