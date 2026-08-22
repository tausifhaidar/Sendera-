import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { NETWORKS } from "./rpcConfig";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

const EXPLORERS = {
  baseSepolia: "https://sepolia.basescan.org/tx/",
  ethereumSepolia: "https://sepolia.etherscan.io/tx/",
  polygonAmoy: "https://amoy.polygonscan.com/tx/",
};

function networkName(network) { return NETWORKS[network]?.name || network; }

function TokenTab({ wallet, selectedNetwork }) {
  const [tokens, setTokens] = useState(() => { try { return JSON.parse(localStorage.getItem("sendera_tokens") || "[]"); } catch { return []; } });
  const [contract, setContract] = useState("");
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState({});
  const [tokenHistory, setTokenHistory] = useState({});
  const [sendForm, setSendForm] = useState({});
  const [sending, setSending] = useState("");

  const chainId = useMemo(() => ({ baseSepolia: "84532", ethereumSepolia: "11155111", polygonAmoy: "80002" }[selectedNetwork]), [selectedNetwork]);

  function persist(next) { setTokens(next); localStorage.setItem("sendera_tokens", JSON.stringify(next)); }

  async function addToken() {
    if (!wallet || !ethers.isAddress(contract)) { alert("Enter a valid ERC-20 token contract address."); return; }
    try {
      setLoading(true);
      const provider = new ethers.JsonRpcProvider(NETWORKS[selectedNetwork].rpc);
      const token = new ethers.Contract(contract, ERC20_ABI, provider);
      const [name, symbol, decimals] = await Promise.all([token.name(), token.symbol(), token.decimals()]);
      const item = { address: contract, name, symbol, decimals: Number(decimals), network: selectedNetwork };
      const next = [item, ...tokens.filter((t) => !(t.address.toLowerCase() === contract.toLowerCase() && t.network === selectedNetwork))];
      persist(next); setContract("");
    } catch (error) { console.error(error); alert("Unable to read this token contract on the selected network."); }
    finally { setLoading(false); }
  }

  async function refreshToken(token) {
    if (!wallet) return;
    try {
      const provider = new ethers.JsonRpcProvider(NETWORKS[selectedNetwork].rpc);
      const contractInstance = new ethers.Contract(token.address, ERC20_ABI, provider);
      const raw = await contractInstance.balanceOf(wallet.address);
      setBalances((previous) => ({ ...previous, [`${selectedNetwork}:${token.address}`]: ethers.formatUnits(raw, token.decimals) }));
    } catch (error) { console.log("Token balance error:", error.message); }
  }

  async function refreshHistory(token) {
    if (!wallet || !process.env.REACT_APP_BACKEND_URL || !chainId) return;
    try {
      const url = `${process.env.REACT_APP_BACKEND_URL.replace(/\/$/, "")}/api/token-transactions?address=${encodeURIComponent(wallet.address)}&contractaddress=${encodeURIComponent(token.address)}&chainid=${chainId}`;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) return;
      setTokenHistory((previous) => ({ ...previous, [`${selectedNetwork}:${token.address}`]: data.transactions || [] }));
    } catch (error) { console.log("Token history error:", error.message); }
  }

  async function sendToken(token) {
    const key = `${selectedNetwork}:${token.address}`;
    const form = sendForm[key] || {};
    if (!wallet || !ethers.isAddress(form.to || "") || !form.amount || Number(form.amount) <= 0) { alert("Enter a valid recipient and token amount."); return; }
    try {
      setSending(key);
      const provider = new ethers.JsonRpcProvider(NETWORKS[selectedNetwork].rpc);
      const signer = wallet.connect(provider);
      const tokenContract = new ethers.Contract(token.address, ERC20_ABI, signer);
      const value = ethers.parseUnits(String(form.amount), token.decimals);
      const gas = await tokenContract.transfer.estimateGas(form.to, value);
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice ?? feeData.maxFeePerGas;
      const estimatedFee = gasPrice ? gas * gasPrice : 0n;
      const nativeBalance = await provider.getBalance(wallet.address);
      if (gasPrice && nativeBalance < estimatedFee) throw new Error("Insufficient native balance for gas fees.");
      const tx = await tokenContract.transfer(form.to, value, { gasLimit: gas });
      await tx.wait();
      alert(`Token transaction successful!\n\nHash:\n${tx.hash}`);
      setSendForm((previous) => ({ ...previous, [key]: { to: "", amount: "" } }));
      await refreshToken(token); await refreshHistory(token);
    } catch (error) {
      console.error(error);
      if (error?.code === "ACTION_REJECTED") alert("Transaction cancelled by user.");
      else alert(error?.shortMessage || error?.message || "Token transaction failed.");
    } finally { setSending(""); }
  }

  useEffect(() => {
    const current = tokens.filter((token) => token.network === selectedNetwork);
    current.forEach((token) => { refreshToken(token); refreshHistory(token); });
  }, [selectedNetwork, wallet]);

  const currentTokens = tokens.filter((token) => token.network === selectedNetwork);

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", paddingBottom: 30 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ color: "#8d9abb", fontSize: 12 }}>Assets & tokens</div>
        <h2 style={{ margin: "4px 0 0", fontSize: 28 }}>Tokens</h2>
        <p style={{ color: "#8d9abb", margin: "6px 0 0", fontSize: 12 }}>{networkName(selectedNetwork)}</p>
      </div>

      <div style={{ background: "linear-gradient(145deg,rgba(28,26,75,.94),rgba(8,17,45,.98))", border: "1px solid rgba(139,92,246,.28)", padding: 18, borderRadius: 22 }}>
        <div style={{ fontWeight: 800, fontSize: 16 }}>Add an ERC-20 token</div>
        <div style={{ color: "#7e8ca9", fontSize: 12, marginTop: 5 }}>Import a token contract for the selected network.</div>
        <input value={contract} onChange={(e) => setContract(e.target.value)} placeholder="Token contract 0x..." style={{ width: "100%", padding: 14, marginTop: 14, borderRadius: 14, border: "1px solid #293b68", background: "#09132f", color: "white", boxSizing: "border-box" }} />
        <button onClick={addToken} disabled={loading} style={{ width: "100%", padding: 14, marginTop: 10, border: "1px solid rgba(139,92,246,.45)", borderRadius: 14, background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "white", fontWeight: 800 }}>{loading ? "Reading Token..." : "Import Token"}</button>
      </div>

      {currentTokens.length === 0 ? (
        <div style={{ background: "rgba(13,21,52,.82)", border: "1px solid #26345c", padding: 30, borderRadius: 22, marginTop: 16, color: "#8b98b5", textAlign: "center" }}><div style={{ fontSize: 28 }}>＋</div><div style={{ color: "#dce4f2", fontWeight: 700, marginTop: 6 }}>No tokens added</div><div style={{ fontSize: 12, marginTop: 4 }}>Import an ERC-20 token above.</div></div>
      ) : currentTokens.map((token) => {
        const key = `${selectedNetwork}:${token.address}`;
        const history = tokenHistory[key] || [];
        const form = sendForm[key] || { to: "", amount: "" };
        return (
          <div key={key} style={{ background: "rgba(13,21,52,.84)", border: "1px solid rgba(91,74,170,.25)", padding: 18, borderRadius: 22, marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}><div style={{ width: 42, height: 42, borderRadius: 14, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#2563eb,#7c3aed)", fontWeight: 900 }}>{token.symbol?.slice(0,1)}</div><div><strong>{token.name}</strong><div style={{ color: "#7c8aa6", fontSize: 12, marginTop: 3 }}>{token.symbol}</div></div></div>
              <div style={{ textAlign: "right" }}><strong>{Number(balances[key] || 0).toFixed(4)}</strong><div style={{ color: "#7c8aa6", fontSize: 11 }}>{token.symbol}</div></div>
            </div>
            <div style={{ fontSize: 11, color: "#697896", wordBreak: "break-all", marginTop: 12 }}>{token.address}</div>
            <div style={{ marginTop: 14, fontWeight: 700, fontSize: 13 }}>Send {token.symbol}</div>
            <input value={form.to} onChange={(e) => setSendForm((previous) => ({ ...previous, [key]: { ...form, to: e.target.value } }))} placeholder="Recipient 0x..." style={{ width: "100%", padding: 12, marginTop: 8, borderRadius: 13, border: "1px solid #293b68", background: "#09132f", color: "white", boxSizing: "border-box" }} />
            <input value={form.amount} onChange={(e) => setSendForm((previous) => ({ ...previous, [key]: { ...form, amount: e.target.value } }))} placeholder={`Amount ${token.symbol}`} type="number" style={{ width: "100%", padding: 12, marginTop: 8, borderRadius: 13, border: "1px solid #293b68", background: "#09132f", color: "white", boxSizing: "border-box" }} />
            <button onClick={() => sendToken(token)} disabled={sending === key} style={{ width: "100%", padding: 13, marginTop: 9, border: "1px solid rgba(37,99,235,.5)", borderRadius: 13, background: "linear-gradient(135deg,#2563eb,#0ea5e9)", color: "white", fontWeight: 800 }}>{sending === key ? "Sending..." : `Send ${token.symbol}`}</button>
            <div style={{ color: "#7c8aa6", fontSize: 12, marginTop: 17 }}>Recent transfers</div>
            {history.length === 0 ? <div style={{ color: "#566581", fontSize: 12, marginTop: 6 }}>No token transfers found.</div> : history.slice(0,5).map((tx) => {
              const received = String(tx.to || "").toLowerCase() === wallet?.address?.toLowerCase();
              const amount = (() => { try { return Number(ethers.formatUnits(tx.value || "0", Number(tx.tokenDecimal || token.decimals))).toFixed(4); } catch { return "0"; } })();
              return <div key={tx.hash} style={{ background: "#09132f", border: "1px solid #20345c", padding: 11, borderRadius: 13, marginTop: 8 }}><strong style={{ color: received ? "#4ade80" : "#a78bfa" }}>{received ? "Received" : "Sent"} {amount} {token.symbol}</strong><div style={{ fontSize: 10, color: "#7583a0", wordBreak: "break-all", margin: "5px 0" }}>{tx.hash}</div><a href={`${EXPLORERS[selectedNetwork]}${tx.hash}`} target="_blank" rel="noreferrer" style={{ color: "#8fb7ff", fontSize: 11 }}>View on Explorer →</a></div>;
            })}
          </div>
        );
      })}
    </div>
  );
}

export default TokenTab;
