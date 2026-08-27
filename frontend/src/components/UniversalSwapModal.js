import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { NETWORKS } from "./rpcConfig";

const NATIVE = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

function shorten(value) { return value ? `${value.slice(0, 6)}...${value.slice(-4)}` : "—"; }

export default function UniversalSwapModal({ open, onClose, wallet, selectedNetwork, backendUrl, notify }) {
  const network = NETWORKS[selectedNetwork] || {};
  const [tokens, setTokens] = useState([]);
  const [fromToken, setFromToken] = useState(NATIVE);
  const [toToken, setToToken] = useState("");
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [discover, setDiscover] = useState("");
  const [discovering, setDiscovering] = useState(false);

  const tokenMap = useMemo(() => new Map(tokens.map((t) => [String(t.address).toLowerCase(), t])), [tokens]);
  const fromMeta = tokenMap.get(fromToken.toLowerCase());
  const toMeta = tokenMap.get(toToken.toLowerCase());

  useEffect(() => {
    if (!open || !wallet) return;
    let cancelled = false;
    async function load() {
      const local = (() => {
        try { return JSON.parse(localStorage.getItem("sendera_tokens") || "[]"); } catch { return []; }
      })().filter((t) => t.network === selectedNetwork);
      let discovered = [];
      if (backendUrl && network.chainId) {
        try {
          const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/token-holdings?address=${encodeURIComponent(wallet.address)}&chainid=${network.chainId}`);
          const data = await res.json();
          if (res.ok && Array.isArray(data.holdings)) discovered = data.holdings;
        } catch {}
      }
      const merged = [...discovered, ...local]
        .filter((t) => t?.address)
        .filter((t, i, arr) => arr.findIndex((x) => x.address?.toLowerCase() === t.address.toLowerCase()) === i)
        .map((t) => ({ ...t, address: t.address }));
      if (!cancelled) {
        setTokens(merged);
        if (!toToken && merged[0]) setToToken(merged[0].address);
      }
    }
    setQuote(null);
    load();
    return () => { cancelled = true; };
  }, [open, wallet, selectedNetwork, backendUrl, network.chainId]);

  async function discoverToken() {
    if (!ethers.isAddress(discover) || discover.toLowerCase() === NATIVE.toLowerCase()) {
      notify?.("Enter a valid ERC-20 contract address");
      return;
    }
    try {
      setDiscovering(true);
      const provider = new ethers.JsonRpcProvider(network.rpc);
      const contract = new ethers.Contract(discover, ERC20_ABI, provider);
      const [symbol, decimals] = await Promise.all([contract.symbol(), contract.decimals()]);
      const token = { address: discover, symbol, name: symbol, decimals: Number(decimals), network: selectedNetwork };
      setTokens((previous) => previous.some((t) => t.address.toLowerCase() === discover.toLowerCase()) ? previous : [token, ...previous]);
      setToToken(discover);
      setDiscover("");
      notify?.(`${symbol} added to swap`);
    } catch (error) {
      notify?.(error?.shortMessage || "Unable to read this token contract");
    } finally { setDiscovering(false); }
  }

  async function getQuote() {
    if (!wallet) return notify?.("Wallet is not connected");
    if (!backendUrl) return notify?.("Swap service is not configured");
    if (!fromToken || !toToken || fromToken.toLowerCase() === toToken.toLowerCase()) return notify?.("Select two different tokens");
    if (!amount || Number(amount) <= 0) return notify?.("Enter an amount");
    try {
      setLoading(true);
      const params = new URLSearchParams({ chainId: String(network.chainId), sellToken: fromToken, buyToken: toToken, sellAmount: ethers.parseUnits(amount, fromMeta?.decimals || 18).toString(), taker: wallet.address });
      const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/swap/quote?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No route found");
      setQuote(data);
    } catch (error) {
      setQuote(null);
      notify?.(error?.message || "No liquidity found for this pair");
    } finally { setLoading(false); }
  }

  async function execute() {
    if (!quote?.transaction || !wallet) return;
    try {
      setLoading(true);
      const provider = new ethers.JsonRpcProvider(network.rpc);
      const signer = wallet.connect(provider);
      const allowance = quote?.issues?.allowance?.spender;
      if (fromToken.toLowerCase() !== NATIVE.toLowerCase() && allowance) {
        const token = new ethers.Contract(fromToken, ["function allowance(address,address) view returns (uint256)", "function approve(address,uint256) returns (bool)"], signer);
        const needed = quote.sellAmount;
        const current = await token.allowance(wallet.address, allowance);
        if (current < BigInt(needed)) {
          const approval = await token.approve(allowance, needed);
          await approval.wait();
        }
      }
      const tx = await signer.sendTransaction({
        to: quote.transaction.to,
        data: quote.transaction.data,
        value: BigInt(quote.transaction.value || "0"),
        gasLimit: quote.transaction.gas ? BigInt(quote.transaction.gas) : undefined,
      });
      await tx.wait();
      notify?.(`Swap successful • ${shorten(tx.hash)}`);
      onClose?.();
    } catch (error) {
      notify?.(error?.shortMessage || error?.message || "Swap failed");
    } finally { setLoading(false); }
  }

  if (!open) return null;
  const quoteOut = quote?.buyAmount && toMeta?.decimals != null ? ethers.formatUnits(quote.buyAmount, toMeta.decimals) : quote?.buyAmount;
  const feeAmount = quote?.fees?.integratorFee?.amount && quote?.fees?.integratorFee?.token?.toLowerCase() === fromToken.toLowerCase() && fromMeta?.decimals != null
    ? ethers.formatUnits(quote.fees.integratorFee.amount, fromMeta.decimals)
    : null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(1,5,18,.76)", backdropFilter: "blur(12px)", display: "grid", placeItems: "center", padding: 18 }}>
      <div style={{ width: "100%", maxWidth: 520, padding: 20, borderRadius: 24, border: "1px solid rgba(145,110,255,.28)", background: "linear-gradient(160deg,#101a43,#180f37)", color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ color: "#9ea9c3", fontSize: 12 }}>Aggregated EVM swap</div><h3 style={{ margin: "4px 0 0", fontSize: 24 }}>Swap any token</h3></div>
          <button onClick={onClose} style={{ border: 0, background: "rgba(255,255,255,.07)", color: "white", width: 36, height: 36, borderRadius: "50%" }}>×</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginTop: 15 }}>
          <select value={fromToken} onChange={(e) => { setFromToken(e.target.value); setQuote(null); }} style={fieldStyle}>
            <option value={NATIVE}>{network.symbol || "Native"}</option>
            {tokens.map((t) => <option key={`from-${t.address}`} value={t.address}>{t.symbol || t.name}</option>)}
          </select>
          <select value={toToken} onChange={(e) => { setToToken(e.target.value); setQuote(null); }} style={fieldStyle}>
            <option value="">To token</option>
            {tokens.map((t) => <option key={`to-${t.address}`} value={t.address}>{t.symbol || t.name}</option>)}
          </select>
        </div>
        <input value={amount} onChange={(e) => { setAmount(e.target.value); setQuote(null); }} placeholder={`Amount ${fromMeta?.symbol || network.symbol || "token"}`} type="number" style={{ ...fieldStyle, marginTop: 9 }} />
        <button disabled={loading} onClick={getQuote} style={buttonStyle}>{loading ? "Finding best route…" : "Get Best Quote"}</button>
        <div style={{ marginTop: 12, padding: 12, borderRadius: 14, background: "rgba(255,255,255,.045)", border: "1px solid rgba(139,92,246,.18)" }}>
          <div style={{ color: "#9aa8c4", fontSize: 11, marginBottom: 7 }}>New / unlisted token</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={discover} onChange={(e) => setDiscover(e.target.value)} placeholder="Paste ERC-20 contract 0x…" style={{ ...fieldStyle, marginTop: 0, flex: 1 }} />
            <button disabled={discovering} onClick={discoverToken} style={{ ...buttonStyle, width: 110, marginTop: 0 }}>{discovering ? "…" : "Add token"}</button>
          </div>
        </div>
        {quote && <div style={{ marginTop: 13, padding: 14, borderRadius: 14, background: "rgba(255,255,255,.05)", border: "1px solid rgba(139,92,246,.25)" }}>
          <div style={row}><span>You Pay</span><strong>{amount} {fromMeta?.symbol || network.symbol}</strong></div>
          <div style={row}><span>You Receive</span><strong>{quoteOut || "—"} {toMeta?.symbol || "token"}</strong></div>
          <div style={{ ...row, marginTop: 6 }}><span>Route</span><span>{quote.sources?.map?.((s) => s.name || s).join?.(", ") || "Aggregated liquidity"}</span></div>
          <div style={{ marginTop: 8, color: "#7f8eaa", fontSize: 10 }}>0.30% Sendera service fee is included in the quote when fee configuration is active.</div>
          {feeAmount && <div style={{ marginTop: 5, color: "#8fa0bd", fontSize: 10 }}>Estimated Sendera fee: {feeAmount} {fromMeta?.symbol}</div>}
          <button disabled={loading} onClick={execute} style={{ ...buttonStyle, background: "#22c55e", color: "#04120a" }}>{loading ? "Confirming…" : "Confirm Swap"}</button>
        </div>}
      </div>
    </div>
  );
}

const fieldStyle = { width: "100%", padding: "13px 14px", borderRadius: 14, border: "1px solid #293b68", background: "#09132f", color: "white", boxSizing: "border-box" };
const buttonStyle = { width: "100%", padding: 13, marginTop: 10, border: 0, borderRadius: 14, background: "linear-gradient(135deg,#18bfff,#6750ff)", color: "white", fontWeight: 900, cursor: "pointer" };
const row = { display: "flex", justifyContent: "space-between", gap: 10, color: "#9aa8c4", fontSize: 13 };
