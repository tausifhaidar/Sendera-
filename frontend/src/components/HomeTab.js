import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { NETWORKS, MAINNETS, TESTNETS } from "./rpcConfig";
import BuyModal from "./BuyModal";
import { fetchNativeUsdPrice } from "./priceService";

const SWAP_CONFIG = {
  ethereumSepolia: { chainId: 11155111, quoter: "0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3", router: "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E" },
  baseSepolia: { chainId: 84532, quoter: "0xC5290058841028F1614F3A6F0F5816cAd0df5E27", router: "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4" },
};

const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner,address spender) view returns (uint256)",
  "function approve(address spender,uint256 amount) returns (bool)",
];

const QUOTER_ABI = ["function quoteExactInputSingle((address tokenIn,address tokenOut,uint256 amountIn,uint24 fee,uint160 sqrtPriceLimitX96)) returns (uint256 amountOut,uint160 sqrtPriceX96After,uint32 initializedTicksCrossed,uint256 gasEstimate)"];
const ROUTER_ABI = ["function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)) payable returns (uint256 amountOut)"];

function shorten(value) { return value ? `${value.slice(0, 6)}...${value.slice(-4)}` : "—"; }

function HomeTab({ wallet, balance, selectedNetwork, setSelectedNetwork, setActiveTab }) {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const [showSwap, setShowSwap] = useState(false);
  const [showBuy, setShowBuy] = useState(false);
  const [nativeUsd, setNativeUsd] = useState(null);
  const [swapTokens, setSwapTokens] = useState([]);
  const [swap, setSwap] = useState({ tokenIn: "", tokenOut: "", amount: "", fee: "3000" });
  const [swapQuote, setSwapQuote] = useState("");
  const [swapMeta, setSwapMeta] = useState({ inSymbol: "", outSymbol: "", inDecimals: 18, outDecimals: 18 });
  const [swapLoading, setSwapLoading] = useState(false);

  const network = NETWORKS[selectedNetwork] || NETWORKS.ethereumSepolia;
  const networkName = network.name;
  const nativeSymbol = network.symbol || "ETH";
  const shortAddress = wallet?.address ? shorten(wallet.address) : "No wallet";
  const swapSupported = Boolean(SWAP_CONFIG[selectedNetwork]);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const card = { background: "rgba(11,20,49,.72)", border: "1px solid rgba(145,110,255,.28)", borderRadius: 24, boxShadow: "0 18px 55px rgba(4,7,30,.35)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" };
  const input = { width: "100%", padding: "13px 14px", borderRadius: 14, border: "1px solid #293b68", background: "#09132f", color: "white", boxSizing: "border-box", outline: "none" };

  function notify(message) { setToast(message); window.setTimeout(() => setToast(""), 2200); }

  async function copyAddress() {
    if (!wallet?.address) return;
    try { await navigator.clipboard.writeText(wallet.address); setCopied(true); notify("Wallet address copied"); window.setTimeout(() => setCopied(false), 1500); }
    catch { notify("Unable to copy address"); }
  }

  useEffect(() => {
    let cancelled = false;
    async function loadPrice() {
      try {
        let price = null;
        if (backendUrl) {
          const response = await fetch(`${backendUrl.replace(/\/$/, "")}/api/prices?chainid=${network.chainId}`);
          const data = await response.json();
          if (response.ok) price = Number(data?.priceUsd || 0) || null;
        }
        if (!price) price = await fetchNativeUsdPrice(selectedNetwork);
        if (!cancelled) setNativeUsd(price);
      } catch (error) {
        console.log("Native price error:", error.message);
        try {
          const fallback = await fetchNativeUsdPrice(selectedNetwork);
          if (!cancelled) setNativeUsd(fallback);
        } catch {
          if (!cancelled) setNativeUsd(null);
        }
      }
    }
    loadPrice();
    const timer = window.setInterval(loadPrice, 60000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [selectedNetwork, network.chainId, backendUrl]);

  useEffect(() => {
    async function loadSwapTokens() {
      if (!wallet || !showSwap) return;
      const local = (() => { try { return JSON.parse(localStorage.getItem("sendera_tokens") || "[]"); } catch { return []; } })().filter((t) => t.network === selectedNetwork);
      let discovered = [];
      if (backendUrl && network.chainId) {
        try {
          const response = await fetch(`${backendUrl.replace(/\/$/, "")}/api/token-holdings?address=${encodeURIComponent(wallet.address)}&chainid=${network.chainId}`);
          const data = await response.json();
          if (response.ok && Array.isArray(data.holdings)) discovered = data.holdings;
        } catch (error) { console.log("Swap token discovery error:", error.message); }
      }
      const merged = [...discovered, ...local].filter((token, index, arr) => token?.address && arr.findIndex((x) => x.address?.toLowerCase() === token.address.toLowerCase()) === index);
      setSwapTokens(merged);
      if (merged.length >= 2) setSwap((value) => ({ ...value, tokenIn: value.tokenIn || merged[0].address, tokenOut: value.tokenOut || merged[1].address }));
    }
    loadSwapTokens();
  }, [wallet, selectedNetwork, showSwap, backendUrl, network.chainId]);

  async function loadTokenMeta(provider, address) {
    if (!ethers.isAddress(address)) throw new Error("Invalid token address");
    const token = new ethers.Contract(address, ERC20_ABI, provider);
    const [symbol, decimals] = await Promise.all([token.symbol(), token.decimals()]);
    return { symbol, decimals: Number(decimals) };
  }

  async function quoteSwap() {
    if (!swapSupported) { notify("Swap provider is not configured for this network yet"); return; }
    if (!swap.tokenIn || !swap.tokenOut || swap.tokenIn.toLowerCase() === swap.tokenOut.toLowerCase()) { notify("Select two different tokens"); return; }
    if (!swap.amount || Number(swap.amount) <= 0) { notify("Enter an amount"); return; }
    try {
      setSwapLoading(true);
      const provider = new ethers.JsonRpcProvider(network.rpc);
      const [inMeta, outMeta] = await Promise.all([loadTokenMeta(provider, swap.tokenIn), loadTokenMeta(provider, swap.tokenOut)]);
      const amountIn = ethers.parseUnits(swap.amount, inMeta.decimals);
      const quoter = new ethers.Contract(SWAP_CONFIG[selectedNetwork].quoter, QUOTER_ABI, provider);
      const result = await quoter.quoteExactInputSingle.staticCall({ tokenIn: swap.tokenIn, tokenOut: swap.tokenOut, amountIn, fee: Number(swap.fee), sqrtPriceLimitX96: 0 });
      setSwapMeta({ inSymbol: inMeta.symbol, outSymbol: outMeta.symbol, inDecimals: inMeta.decimals, outDecimals: outMeta.decimals });
      setSwapQuote(ethers.formatUnits(result[0], outMeta.decimals));
      notify("Quote updated");
    } catch (error) { console.error(error); setSwapQuote(""); notify(error?.shortMessage || "No liquidity found for this pair"); }
    finally { setSwapLoading(false); }
  }

  async function executeSwap() {
    if (!swapQuote || !swapSupported) return;
    try {
      setSwapLoading(true);
      const provider = new ethers.JsonRpcProvider(network.rpc);
      const signer = wallet.connect(provider);
      const amountIn = ethers.parseUnits(swap.amount, swapMeta.inDecimals);
      const minOut = ethers.parseUnits((Number(swapQuote) * 0.995).toFixed(Math.min(swapMeta.outDecimals, 8)), swapMeta.outDecimals);
      const token = new ethers.Contract(swap.tokenIn, ERC20_ABI, signer);
      const allowance = await token.allowance(wallet.address, SWAP_CONFIG[selectedNetwork].router);
      if (allowance < amountIn) { const approval = await token.approve(SWAP_CONFIG[selectedNetwork].router, amountIn); await approval.wait(); }
      const router = new ethers.Contract(SWAP_CONFIG[selectedNetwork].router, ROUTER_ABI, signer);
      const tx = await router.exactInputSingle({ tokenIn: swap.tokenIn, tokenOut: swap.tokenOut, fee: Number(swap.fee), recipient: wallet.address, amountIn, amountOutMinimum: minOut, sqrtPriceLimitX96: 0 });
      await tx.wait();
      notify(`Swap successful • ${shorten(tx.hash)}`);
      setShowSwap(false); setSwapQuote(""); setSwap({ tokenIn: "", tokenOut: "", amount: "", fee: "3000" }); setActiveTab?.("tokens");
    } catch (error) { console.error(error); notify(error?.shortMessage || "Swap failed"); }
    finally { setSwapLoading(false); }
  }

  const portfolioUsd = useMemo(() => {
    const value = Number(balance || 0) * Number(nativeUsd || 0);
    if (value > 0) return `$${value.toFixed(2)}`;
    return Number(balance || 0) === 0 ? "$0.00" : "Price unavailable";
  }, [balance, nativeUsd]);

  const action = (title, subtitle, icon, accent, onClick) => <button onClick={onClick} style={{ ...card, flex: 1, minWidth: 0, padding: "16px 7px 14px", color: "white", cursor: "pointer", textAlign: "center" }}><div style={{ width: 42, height: 42, borderRadius: "50%", margin: "0 auto 9px", display: "grid", placeItems: "center", background: accent, fontSize: 21, fontWeight: 900 }}>{icon}</div><div style={{ fontSize: 14, fontWeight: 800 }}>{title}</div><div style={{ marginTop: 2, fontSize: 10, color: "#a9b4d0" }}>{subtitle}</div></button>;

  return (
    <div style={{ minHeight: "calc(100vh - 20px)", maxWidth: 620, margin: "0 auto", padding: "8px 2px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: -2, background: "radial-gradient(circle at 12% 12%, rgba(87,71,255,.35), transparent 34%), radial-gradient(circle at 88% 30%, rgba(0,173,255,.22), transparent 30%), radial-gradient(circle at 70% 85%, rgba(158,67,255,.26), transparent 30%), linear-gradient(180deg,#05061a 0%,#07102b 42%,#09061f 100%)" }} />
      {toast && <div style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", zIndex: 100, background: "rgba(9,18,45,.94)", border: "1px solid rgba(130,145,255,.35)", color: "white", borderRadius: 999, padding: "10px 14px", fontSize: 12, fontWeight: 800 }}>{toast}</div>}

      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 6px 14px" }}><div><div style={{ color: "#a7b1ca", fontSize: 13, fontWeight: 600 }}>Welcome back 👋</div><div style={{ marginTop: 2, fontSize: 31, fontWeight: 900, letterSpacing: -1.2 }}>Sendera</div></div><div style={{ display: "flex", gap: 8 }}><button onClick={() => setActiveTab?.("receive")} style={{ ...card, width: 42, height: 42, color: "white", cursor: "pointer" }}>⌗</button><button onClick={() => setActiveTab?.("settings")} style={{ ...card, width: 42, height: 42, color: "white", cursor: "pointer" }}>⚙</button></div></header>

      <div style={{ ...card, padding: 12, marginBottom: 12 }}>
        <div style={{ color: "#6f7f9f", fontSize: 10, fontWeight: 900, letterSpacing: 1, marginBottom: 7 }}>NETWORK</div>
        <select value={selectedNetwork} onChange={(e) => { setSelectedNetwork?.(e.target.value); notify(`Network: ${NETWORKS[e.target.value]?.name}`); }} style={{ width: "100%", border: "1px solid rgba(130,150,255,.30)", background: "linear-gradient(135deg,rgba(24,39,86,.92),rgba(31,18,71,.90))", color: "#eef2ff", borderRadius: 14, padding: "12px 13px", fontWeight: 800, fontSize: 13, cursor: "pointer", outline: "none" }}>
          <optgroup label="Mainnets">{MAINNETS.map((item) => <option key={item.key} value={item.key} style={{ background: "#0b1227", color: "white" }}>{item.name} · {item.symbol}</option>)}</optgroup>
          <optgroup label="Testnets">{TESTNETS.map((item) => <option key={item.key} value={item.key} style={{ background: "#0b1227", color: "white" }}>{item.name} · {item.symbol}</option>)}</optgroup>
        </select>
      </div>

      <section style={{ ...card, padding: 22, position: "relative", overflow: "hidden", background: "linear-gradient(135deg,rgba(22,27,74,.92),rgba(20,10,59,.74) 55%,rgba(7,36,73,.80))" }}><div style={{ position: "absolute", right: -20, top: -20, width: 210, height: 210, borderRadius: "50%", background: "radial-gradient(circle,rgba(143,75,255,.42),transparent 68%)" }} /><div style={{ color: "#b5bfd7", fontSize: 13, fontWeight: 600 }}>Total Balance</div><div style={{ marginTop: 5, fontSize: 40, lineHeight: 1, fontWeight: 900, letterSpacing: -1.7, whiteSpace: "nowrap" }}>{Number(balance || 0).toFixed(4)} {nativeSymbol}</div><div style={{ marginTop: 8, color: "#92a0bd", fontSize: 13 }}>{networkName}</div><div style={{ marginTop: 8, color: "#d4dcf0", fontSize: 15, fontWeight: 800 }}>{portfolioUsd}</div><div style={{ marginTop: 6, color: nativeUsd ? "#9aa8c4" : "#e2a6a6", fontSize: 11 }}>{nativeUsd ? `Live price · $${nativeUsd.toLocaleString()}/${nativeSymbol}` : "Live price unavailable"}</div><div style={{ marginTop: 15, height: 62 }}><svg width="100%" height="62" viewBox="0 0 420 62" preserveAspectRatio="none"><defs><linearGradient id="line" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#6d35ff"/><stop offset="100%" stopColor="#35a7ff"/></linearGradient></defs><path d="M0 48 C45 36 64 58 103 38 S164 45 205 24 S258 38 297 14 S345 21 420 1" fill="none" stroke="url(#line)" strokeWidth="4" strokeLinecap="round" /></svg></div><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}><div style={{ border: "1px solid rgba(170,160,255,.18)", background: "rgba(255,255,255,.06)", borderRadius: 14, padding: "9px 11px", color: "#dce2f1", fontSize: 12 }}>{shortAddress}</div><button onClick={copyAddress} style={{ border: 0, background: "transparent", color: "#8ec6ff", fontWeight: 800, cursor: "pointer" }}>{copied ? "Copied" : "Copy"}</button></div></section>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>{action("Send", "Crypto", "↑", "linear-gradient(145deg,#7b31ff,#5b20ff)", () => setActiveTab?.("send"))}{action("Receive", "Crypto", "↓", "linear-gradient(145deg,#22e77c,#08b862)", () => setActiveTab?.("receive"))}{action("Swap", "Tokens", "⇄", "linear-gradient(145deg,#19b9ff,#0677d8)", () => setShowSwap(true))}{action("Buy", "Crypto", "+", "linear-gradient(145deg,#ff9c2d,#ff6f00)", () => setShowBuy(true))}</div>

      <section style={{ ...card, marginTop: 14, overflow: "hidden" }}><div style={{ display: "flex", justifyContent: "space-between", padding: "17px 17px 13px", borderBottom: "1px solid rgba(120,140,190,.13)" }}><div style={{ fontSize: 19, fontWeight: 850 }}>Portfolio</div><div style={{ color: "#7d8ca9", fontSize: 11 }}>{nativeUsd ? "Live price" : "Price feed"}</div></div><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 17px" }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 44, height: 44, borderRadius: "50%", display: "grid", placeItems: "center", background: "linear-gradient(145deg,#4d73ff,#2637b7)", fontSize: 24 }}>Ξ</div><div><div style={{ fontWeight: 800, fontSize: 15 }}>{networkName}</div><div style={{ color: "#8f9bb3", marginTop: 3, fontSize: 12 }}>{nativeSymbol} • {Number(balance || 0).toFixed(4)}</div></div></div><div style={{ textAlign: "right" }}><div style={{ fontWeight: 800, fontSize: 14 }}>{portfolioUsd}</div><div style={{ color: "#8994ab", fontSize: 11, marginTop: 3 }}>{nativeUsd ? `$${nativeUsd.toLocaleString()}/${nativeSymbol}` : "Live price unavailable"}</div></div></div><button onClick={() => setActiveTab?.("tokens")} style={{ width: "100%", border: 0, borderTop: "1px solid rgba(120,140,190,.13)", background: "rgba(255,255,255,.02)", color: "#7fc4ff", padding: 14, textAlign: "left", fontWeight: 800, cursor: "pointer" }}>Manage tokens →</button></section>

      <section style={{ ...card, marginTop: 14, padding: 16 }}><div style={{ fontSize: 18, fontWeight: 850 }}>Security</div><div style={{ marginTop: 6, color: "#8c99b2", fontSize: 12 }}>Wallet encrypted locally. Auto-lock is enabled.</div><div style={{ display: "flex", gap: 9, marginTop: 12 }}><button onClick={() => setActiveTab?.("settings")} style={{ flex: 1, padding: 12, borderRadius: 13, border: "1px solid #293b68", background: "#101c39", color: "white", fontWeight: 800 }}>Security Settings</button><button onClick={() => setActiveTab?.("history")} style={{ flex: 1, padding: 12, borderRadius: 13, border: "1px solid rgba(139,92,246,.35)", background: "linear-gradient(135deg,#31206f,#203e78)", color: "white", fontWeight: 800 }}>Activity</button></div></section>

      {showSwap && <div style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(1,5,18,.72)", backdropFilter: "blur(10px)", display: "grid", placeItems: "center", padding: 18 }}><div style={{ ...card, width: "100%", maxWidth: 520, padding: 20, background: "linear-gradient(160deg,#101a43,#180f37)" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ color: "#9ea9c3", fontSize: 12 }}>On-chain swap</div><h3 style={{ margin: "4px 0 0", fontSize: 24 }}>Swap Tokens</h3></div><button onClick={() => setShowSwap(false)} style={{ border: 0, background: "rgba(255,255,255,.07)", color: "white", width: 36, height: 36, borderRadius: "50%" }}>×</button></div>{!swapSupported && <div style={{ marginTop: 14, padding: 12, borderRadius: 14, background: "rgba(245,158,11,.10)", border: "1px solid rgba(245,158,11,.25)", color: "#fbbf24", fontSize: 12 }}>This network is connected for wallet operations, but its swap provider is not configured yet.</div>}<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginTop: 14 }}><select style={input} value={swap.tokenIn} onChange={(e) => setSwap((s) => ({ ...s, tokenIn: e.target.value }))}><option value="">From token</option>{swapTokens.map((t) => <option key={t.address} value={t.address}>{t.symbol || t.name}</option>)}</select><select style={input} value={swap.tokenOut} onChange={(e) => setSwap((s) => ({ ...s, tokenOut: e.target.value }))}><option value="">To token</option>{swapTokens.map((t) => <option key={t.address} value={t.address}>{t.symbol || t.name}</option>)}</select></div><input style={{ ...input, marginTop: 9 }} placeholder="Amount" type="number" value={swap.amount} onChange={(e) => setSwap((s) => ({ ...s, amount: e.target.value }))} /><button disabled={!swapSupported || swapLoading} onClick={quoteSwap} style={{ width: "100%", padding: 13, marginTop: 10, border: 0, borderRadius: 14, background: "linear-gradient(135deg,#18bfff,#6750ff)", color: "white", fontWeight: 900 }}>{swapLoading ? "Working..." : "Get Quote"}</button>{swapQuote && <div style={{ marginTop: 12, padding: 14, borderRadius: 14, background: "rgba(255,255,255,.05)", border: "1px solid rgba(139,92,246,.25)" }}><div style={{ display: "grid", gap: 7, fontSize: 13 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#98a7c4" }}>You Pay</span><strong>{swap.amount} {swapMeta.inSymbol}</strong></div><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#98a7c4" }}>You Receive</span><strong>{Number(swapQuote).toFixed(Math.min(swapMeta.outDecimals, 6))} {swapMeta.outSymbol}</strong></div></div><div style={{ marginTop: 7, color: "#70809f", fontSize: 10 }}>Includes estimated network gas + 0.30% Sendera service cost when pricing is available.</div><button disabled={swapLoading} onClick={executeSwap} style={{ width: "100%", marginTop: 10, padding: 13, border: 0, borderRadius: 13, background: "#22c55e", color: "#04120a", fontWeight: 900 }}>{swapLoading ? "Swapping..." : "Confirm Swap"}</button></div>}</div></div>}

      {showBuy && <BuyModal open={showBuy} onClose={() => setShowBuy(false)} wallet={wallet} selectedNetwork={selectedNetwork} backendUrl={backendUrl} notify={notify} />}
    </div>
  );
}

export default HomeTab;
