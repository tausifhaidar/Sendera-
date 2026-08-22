import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { NETWORKS } from "./rpcConfig";

const SWAP_CONFIG = {
  ethereumSepolia: {
    chainId: 11155111,
    quoter: "0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3",
    router: "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E",
  },
  baseSepolia: {
    chainId: 84532,
    quoter: "0xC5290058841028F1614F3A6F0F5816cAd0df5E27",
    router: "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4",
  },
};

const SERVICE_FEE_RATE = 0.003;

const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner,address spender) view returns (uint256)",
  "function approve(address spender,uint256 amount) returns (bool)",
];

const QUOTER_ABI = [
  "function quoteExactInputSingle((address tokenIn,address tokenOut,uint256 amountIn,uint24 fee,uint160 sqrtPriceLimitX96)) returns (uint256 amountOut,uint160 sqrtPriceX96After,uint32 initializedTicksCrossed,uint256 gasEstimate)",
];

const ROUTER_ABI = [
  "function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)) payable returns (uint256 amountOut)",
];

function shorten(value, start = 6, end = 4) {
  return value ? `${value.slice(0, start)}...${value.slice(-end)}` : "—";
}

function HomeTab({ wallet, balance, selectedNetwork, setSelectedNetwork, setActiveTab }) {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const [showSwap, setShowSwap] = useState(false);
  const [showBuy, setShowBuy] = useState(false);
  const [swap, setSwap] = useState({ tokenIn: "", tokenOut: "", amount: "", fee: "3000" });
  const [swapQuote, setSwapQuote] = useState("");
  const [swapMeta, setSwapMeta] = useState({ inSymbol: "", outSymbol: "", inDecimals: 18, outDecimals: 18 });
  const [swapLoading, setSwapLoading] = useState(false);
  const [swapCostUsd, setSwapCostUsd] = useState(null);
  const [ethUsd, setEthUsd] = useState(null);

  const networks = [
    { key: "baseSepolia", name: "Base Sepolia" },
    { key: "ethereumSepolia", name: "Ethereum Sepolia" },
    { key: "polygonAmoy", name: "Polygon Amoy" },
  ];

  const networkName = NETWORKS[selectedNetwork]?.name || selectedNetwork;
  const shortAddress = wallet?.address ? shorten(wallet.address) : "No wallet";
  const swapSupported = Boolean(SWAP_CONFIG[selectedNetwork]);

  const card = {
    background: "rgba(11, 20, 49, 0.72)",
    border: "1px solid rgba(145, 110, 255, 0.28)",
    borderRadius: 24,
    boxShadow: "0 18px 55px rgba(4, 7, 30, .35)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
  };

  const input = {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 14,
    border: "1px solid #293b68",
    background: "#09132f",
    color: "white",
    boxSizing: "border-box",
    outline: "none",
  };

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  async function copyAddress() {
    if (!wallet?.address) return;
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      notify("Wallet address copied");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      notify("Unable to copy address");
    }
  }

  async function loadTokenMeta(provider, address) {
    if (!ethers.isAddress(address)) throw new Error("Invalid token contract address");
    const token = new ethers.Contract(address, ERC20_ABI, provider);
    const [symbol, decimals] = await Promise.all([token.symbol(), token.decimals()]);
    return { symbol, decimals: Number(decimals) };
  }

  function estimateServiceCostUsd(amount, symbol) {
    const normalized = String(symbol || "").toUpperCase();
    const numericAmount = Number(amount || 0);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return null;
    if ((normalized === "ETH" || normalized === "WETH") && ethUsd) {
      return numericAmount * SERVICE_FEE_RATE * ethUsd;
    }
    if (["USDC", "USDT", "DAI", "USD"] .includes(normalized)) {
      return numericAmount * SERVICE_FEE_RATE;
    }
    return null;
  }

  async function quoteSwap() {
    if (!wallet) return;
    if (!swapSupported) {
      notify("Swap is unavailable on Polygon Amoy right now");
      return;
    }
    if (!ethers.isAddress(swap.tokenIn) || !ethers.isAddress(swap.tokenOut)) {
      notify("Enter valid token contract addresses");
      return;
    }
    if (swap.tokenIn.toLowerCase() === swap.tokenOut.toLowerCase()) {
      notify("Choose two different tokens");
      return;
    }
    if (!swap.amount || Number(swap.amount) <= 0) {
      notify("Enter a valid amount");
      return;
    }

    try {
      setSwapLoading(true);
      setSwapCostUsd(null);
      const provider = new ethers.JsonRpcProvider(NETWORKS[selectedNetwork].rpc);
      const [inMeta, outMeta] = await Promise.all([
        loadTokenMeta(provider, swap.tokenIn),
        loadTokenMeta(provider, swap.tokenOut),
      ]);
      const amountIn = ethers.parseUnits(swap.amount, inMeta.decimals);
      const quoter = new ethers.Contract(SWAP_CONFIG[selectedNetwork].quoter, QUOTER_ABI, provider);
      const result = await quoter.quoteExactInputSingle.staticCall({
        tokenIn: swap.tokenIn,
        tokenOut: swap.tokenOut,
        amountIn,
        fee: Number(swap.fee),
        sqrtPriceLimitX96: 0,
      });
      const amountOut = result[0];
      setSwapMeta({ inSymbol: inMeta.symbol, outSymbol: outMeta.symbol, inDecimals: inMeta.decimals, outDecimals: outMeta.decimals });
      setSwapQuote(ethers.formatUnits(amountOut, outMeta.decimals));

      try {
        const gasEstimate = BigInt(result[3]);
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice ?? feeData.maxFeePerGas;
        if (gasPrice && ethUsd) {
          const gasEth = Number(ethers.formatEther(gasEstimate * gasPrice));
          const gasUsd = gasEth * ethUsd;
          const serviceUsd = estimateServiceCostUsd(swap.amount, inMeta.symbol);
          setSwapCostUsd(serviceUsd == null ? gasUsd : gasUsd + serviceUsd);
        }
      } catch (costError) {
        console.log("Swap cost estimate unavailable:", costError.message);
      }

      notify("Quote updated");
    } catch (error) {
      console.error("Swap quote error", error);
      setSwapQuote("");
      setSwapCostUsd(null);
      notify(error?.shortMessage || "No Uniswap pool/liquidity found for this pair");
    } finally {
      setSwapLoading(false);
    }
  }

  async function executeSwap() {
    if (!swapQuote || !wallet) return;
    try {
      setSwapLoading(true);
      const provider = new ethers.JsonRpcProvider(NETWORKS[selectedNetwork].rpc);
      const signer = wallet.connect(provider);
      const amountIn = ethers.parseUnits(swap.amount, swapMeta.inDecimals);
      const minOut = ethers.parseUnits((Number(swapQuote) * 0.995).toFixed(Math.min(swapMeta.outDecimals, 8)), swapMeta.outDecimals);
      const token = new ethers.Contract(swap.tokenIn, ERC20_ABI, signer);
      const allowance = await token.allowance(wallet.address, SWAP_CONFIG[selectedNetwork].router);
      if (allowance < amountIn) {
        const approval = await token.approve(SWAP_CONFIG[selectedNetwork].router, amountIn);
        await approval.wait();
      }
      const router = new ethers.Contract(SWAP_CONFIG[selectedNetwork].router, ROUTER_ABI, signer);
      const tx = await router.exactInputSingle({
        tokenIn: swap.tokenIn,
        tokenOut: swap.tokenOut,
        fee: Number(swap.fee),
        recipient: wallet.address,
        amountIn,
        amountOutMinimum: minOut,
        sqrtPriceLimitX96: 0,
      });
      await tx.wait();
      notify(`Swap successful • ${shorten(tx.hash)}`);
      setSwapQuote("");
      setSwapCostUsd(null);
      setSwap({ tokenIn: "", tokenOut: "", amount: "", fee: "3000" });
      setShowSwap(false);
      setActiveTab?.("tokens");
    } catch (error) {
      console.error("Swap execution error", error);
      notify(error?.shortMessage || "Swap failed");
    } finally {
      setSwapLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function loadPrice() {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
        const data = await response.json();
        if (!cancelled) setEthUsd(Number(data?.ethereum?.usd || 0));
      } catch {
        if (!cancelled) setEthUsd(null);
      }
    }
    loadPrice();
    const timer = window.setInterval(loadPrice, 60000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, []);

  const portfolioUsd = useMemo(() => {
    const value = Number(balance || 0) * Number(ethUsd || 0);
    return value > 0 ? `$${value.toFixed(2)}` : "Price unavailable";
  }, [balance, ethUsd]);

  const action = (title, subtitle, icon, accent, onClick) => (
    <button onClick={onClick} style={{ ...card, flex: 1, minWidth: 0, padding: "16px 7px 14px", color: "white", cursor: "pointer", textAlign: "center" }}>
      <div style={{ width: 42, height: 42, borderRadius: "50%", margin: "0 auto 9px", display: "grid", placeItems: "center", background: accent, fontSize: 21, fontWeight: 900 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 800 }}>{title}</div>
      <div style={{ marginTop: 2, fontSize: 10, color: "#a9b4d0" }}>{subtitle}</div>
    </button>
  );

  return (
    <div style={{ minHeight: "calc(100vh - 20px)", maxWidth: 560, margin: "0 auto", padding: "8px 2px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: -2, background: "radial-gradient(circle at 12% 12%, rgba(87,71,255,.35), transparent 34%), radial-gradient(circle at 88% 30%, rgba(0,173,255,.22), transparent 30%), radial-gradient(circle at 70% 85%, rgba(158,67,255,.26), transparent 30%), linear-gradient(180deg, #05061a 0%, #07102b 42%, #09061f 100%)" }} />

      {toast && (
        <div style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", zIndex: 100, background: "rgba(9,18,45,.94)", border: "1px solid rgba(130,145,255,.35)", color: "white", borderRadius: 999, padding: "10px 14px", fontSize: 12, fontWeight: 800, boxShadow: "0 14px 35px rgba(0,0,0,.35)" }}>
          {toast}
        </div>
      )}

      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 6px 14px" }}>
        <div><div style={{ color: "#a7b1ca", fontSize: 13, fontWeight: 600 }}>Welcome back 👋</div><div style={{ marginTop: 2, fontSize: 31, fontWeight: 900, letterSpacing: -1.2 }}>Sendera</div></div>
        <div style={{ display: "flex", gap: 8 }}><button onClick={() => setActiveTab?.("receive")} style={{ ...card, width: 42, height: 42, color: "white", cursor: "pointer" }}>⌗</button><button onClick={() => setActiveTab?.("settings")} style={{ ...card, width: 42, height: 42, color: "white", cursor: "pointer" }}>⚙</button></div>
      </header>

      <div style={{ margin: "0 0 12px 2px" }}><select value={selectedNetwork} onChange={(e) => { setSelectedNetwork?.(e.target.value); notify(`Network: ${NETWORKS[e.target.value]?.name}`); }} style={{ border: "1px solid rgba(130,150,255,.30)", background: "linear-gradient(135deg, rgba(24,39,86,.92), rgba(31,18,71,.90))", color: "#eef2ff", borderRadius: 999, padding: "10px 14px", fontWeight: 800, fontSize: 12, cursor: "pointer", outline: "none" }}>{networks.map((network) => <option key={network.key} value={network.key} style={{ background: "#0b1227", color: "white" }}>● {network.name}</option>)}</select></div>

      <section style={{ ...card, padding: 22, position: "relative", overflow: "hidden", background: "linear-gradient(135deg, rgba(22,27,74,.92), rgba(20,10,59,.74) 55%, rgba(7,36,73,.80))" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 210, height: 210, borderRadius: "50%", background: "radial-gradient(circle, rgba(143,75,255,.42), transparent 68%)" }} />
        <div style={{ color: "#b5bfd7", fontSize: 13, fontWeight: 600 }}>Total Balance</div><div style={{ marginTop: 5, fontSize: 40, lineHeight: 1, fontWeight: 900, letterSpacing: -1.7, whiteSpace: "nowrap" }}>{Number(balance || 0).toFixed(4)} ETH</div><div style={{ marginTop: 8, color: "#92a0bd", fontSize: 13 }}>{networkName}</div><div style={{ marginTop: 8, color: "#d4dcf0", fontSize: 15, fontWeight: 800 }}>{portfolioUsd}</div>
        <div style={{ marginTop: 15, height: 65 }}><svg width="100%" height="65" viewBox="0 0 420 65" preserveAspectRatio="none"><defs><linearGradient id="line" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#6d35ff"/><stop offset="100%" stopColor="#35a7ff"/></linearGradient></defs><path d="M0 49 C45 37, 64 59, 103 38 S164 46, 205 23 S258 38, 297 14 S345 20, 420 1" fill="none" stroke="url(#line)" strokeWidth="4" strokeLinecap="round" /></svg></div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}><div style={{ border: "1px solid rgba(170,160,255,.18)", background: "rgba(255,255,255,.06)", borderRadius: 14, padding: "9px 11px", color: "#dce2f1", fontSize: 12 }}>{shortAddress}</div><button onClick={copyAddress} style={{ border: 0, background: "transparent", color: "#8ec6ff", fontWeight: 800, cursor: "pointer" }}>{copied ? "Copied" : "Copy"}</button></div>
      </section>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>{action("Send", "Crypto", "↑", "linear-gradient(145deg,#7b31ff,#5b20ff)", () => setActiveTab?.("send"))}{action("Receive", "Crypto", "↓", "linear-gradient(145deg,#22e77c,#08b862)", () => setActiveTab?.("receive"))}{action("Swap", "Tokens", "⇄", "linear-gradient(145deg,#19b9ff,#0677d8)", () => setShowSwap(true))}{action("Buy", "Crypto", "+", "linear-gradient(145deg,#ff9c2d,#ff6f00)", () => setShowBuy(true))}</div>

      <section style={{ ...card, marginTop: 14, overflow: "hidden" }}><div style={{ display: "flex", justifyContent: "space-between", padding: "17px 17px 13px", borderBottom: "1px solid rgba(120,140,190,.13)" }}><div style={{ fontSize: 19, fontWeight: 850 }}>Portfolio</div><div style={{ color: "#7d8ca9", fontSize: 11 }}>{ethUsd ? "Live ETH price" : "Price feed offline"}</div></div><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 17px" }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 44, height: 44, borderRadius: "50%", display: "grid", placeItems: "center", background: "linear-gradient(145deg,#4d73ff,#2637b7)", fontSize: 24 }}>Ξ</div><div><div style={{ fontWeight: 800, fontSize: 15 }}>Ethereum</div><div style={{ color: "#8f9bb3", marginTop: 3, fontSize: 12 }}>ETH • {Number(balance || 0).toFixed(4)}</div></div></div><div style={{ textAlign: "right" }}><div style={{ fontWeight: 800, fontSize: 14 }}>{portfolioUsd}</div><div style={{ color: "#8994ab", fontSize: 11, marginTop: 3 }}>{ethUsd ? `$${ethUsd.toLocaleString()}/ETH` : "—"}</div></div></div><button onClick={() => setActiveTab?.("tokens")} style={{ width: "100%", border: 0, borderTop: "1px solid rgba(120,140,190,.13)", background: "rgba(255,255,255,.02)", color: "#7fc4ff", padding: 14, textAlign: "left", fontWeight: 800, cursor: "pointer" }}>Manage tokens →</button></section>

      <section style={{ ...card, marginTop: 14, padding: 16 }}><div style={{ fontSize: 18, fontWeight: 850 }}>Security</div><div style={{ marginTop: 6, color: "#8c99b2", fontSize: 12 }}>Wallet encrypted locally. Auto-lock is enabled.</div><div style={{ display: "flex", gap: 9, marginTop: 12 }}><button onClick={() => setActiveTab?.("settings")} style={{ flex: 1, padding: 12, borderRadius: 13, border: "1px solid #293b68", background: "#101c39", color: "white", fontWeight: 800 }}>Security Settings</button><button onClick={() => setActiveTab?.("history")} style={{ flex: 1, padding: 12, borderRadius: 13, border: "1px solid rgba(139,92,246,.35)", background: "linear-gradient(135deg,#31206f,#203e78)", color: "white", fontWeight: 800 }}>Activity</button></div></section>

      {showSwap && (
        <div style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(1,5,18,.72)", backdropFilter: "blur(10px)", display: "grid", placeItems: "center", padding: 18 }}>
          <div style={{ ...card, width: "100%", maxWidth: 520, padding: 20, background: "linear-gradient(160deg,#101a43,#180f37)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ color: "#9ea9c3", fontSize: 12 }}>On-chain swap</div><h3 style={{ margin: "4px 0 0", fontSize: 24 }}>Swap Tokens</h3></div><button onClick={() => { setShowSwap(false); setSwapQuote(""); setSwapCostUsd(null); }} style={{ border: 0, background: "rgba(255,255,255,.07)", color: "white", width: 36, height: 36, borderRadius: "50%" }}>×</button></div>
            {!swapSupported && <div style={{ marginTop: 14, padding: 12, borderRadius: 14, background: "rgba(245,158,11,.10)", border: "1px solid rgba(245,158,11,.25)", color: "#fbbf24", fontSize: 12 }}>Uniswap v3 is not deployed in Sendera on Polygon Amoy. Use Base Sepolia or Ethereum Sepolia for ERC-20 swaps.</div>}
            <input style={{ ...input, marginTop: 14 }} placeholder="Token In contract 0x..." value={swap.tokenIn} onChange={(e) => setSwap((s) => ({ ...s, tokenIn: e.target.value }))} />
            <input style={{ ...input, marginTop: 9 }} placeholder="Token Out contract 0x..." value={swap.tokenOut} onChange={(e) => setSwap((s) => ({ ...s, tokenOut: e.target.value }))} />
            <div style={{ display: "flex", gap: 9, marginTop: 9 }}><input style={{ ...input, flex: 1 }} placeholder="Amount" type="number" value={swap.amount} onChange={(e) => setSwap((s) => ({ ...s, amount: e.target.value }))} /><select style={{ ...input, width: 115 }} value={swap.fee} onChange={(e) => setSwap((s) => ({ ...s, fee: e.target.value }))}><option value="500">0.05%</option><option value="3000">0.30%</option><option value="10000">1.00%</option></select></div>
            <button disabled={!swapSupported || swapLoading} onClick={quoteSwap} style={{ width: "100%", padding: 13, marginTop: 10, border: 0, borderRadius: 14, background: "linear-gradient(135deg,#18bfff,#6750ff)", color: "white", fontWeight: 900 }}>{swapLoading ? "Working..." : "Get Quote"}</button>
            {swapQuote && <div style={{ marginTop: 12, padding: 14, borderRadius: 14, background: "rgba(255,255,255,.05)", border: "1px solid rgba(139,92,246,.25)" }}><div style={{ display: "grid", gap: 7, fontSize: 13 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#98a7c4" }}>You Pay</span><strong>{swap.amount} {swapMeta.inSymbol}</strong></div><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#98a7c4" }}>You Receive</span><strong>{Number(swapQuote).toFixed(Math.min(swapMeta.outDecimals, 6))} {swapMeta.outSymbol}</strong></div><div style={{ display: "flex", justifyContent: "space-between", paddingTop: 5, borderTop: "1px solid rgba(120,140,190,.14)" }}><span style={{ color: "#98a7c4" }}>Network cost</span><strong>{swapCostUsd != null ? `≈ $${swapCostUsd.toFixed(2)}` : "Calculating..."}</strong></div></div><div style={{ marginTop: 7, color: "#70809f", fontSize: 10 }}>Includes estimated network gas + 0.30% Sendera service cost.</div><div style={{ marginTop: 6, color: "#8b97af", fontSize: 11 }}>~0.5% slippage protection • ERC-20 only</div><button disabled={swapLoading} onClick={executeSwap} style={{ width: "100%", marginTop: 10, padding: 13, border: 0, borderRadius: 13, background: "#22c55e", color: "#04120a", fontWeight: 900 }}>{swapLoading ? "Swapping..." : "Confirm Swap"}</button></div>}
          </div>
        </div>
      )}

      {showBuy && (
        <div style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(1,5,18,.72)", backdropFilter: "blur(10px)", display: "grid", placeItems: "center", padding: 18 }}>
          <div style={{ ...card, width: "100%", maxWidth: 480, padding: 20, background: "linear-gradient(160deg,#161a43,#20112f)" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ color: "#9ea9c3", fontSize: 12 }}>Fiat on-ramp</div><h3 style={{ margin: "4px 0 0", fontSize: 24 }}>Buy Crypto</h3></div><button onClick={() => setShowBuy(false)} style={{ border: 0, background: "rgba(255,255,255,.07)", color: "white", width: 36, height: 36, borderRadius: "50%" }}>×</button></div><div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: "rgba(255,255,255,.05)", border: "1px solid rgba(139,92,246,.24)", color: "#c7d0e4", fontSize: 12, lineHeight: 1.5 }}>Buy integrations require a regulated on-ramp provider and its production application key. Sendera does not collect card or bank details itself.</div><button onClick={() => { notify("On-ramp setup required before purchase"); setShowBuy(false); setActiveTab?.("settings"); }} style={{ width: "100%", marginTop: 12, padding: 13, border: 0, borderRadius: 13, background: "linear-gradient(135deg,#ff9c2d,#ff6f00)", color: "white", fontWeight: 900 }}>Configure Buy Provider</button></div>
        </div>
      )}
    </div>
  );
}

export default HomeTab;
