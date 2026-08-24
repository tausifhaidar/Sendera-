import { useEffect, useMemo, useState } from "react";
import { NETWORKS } from "./rpcConfig";

const BUY_NETWORKS = {
  ethereum: { label: "Ethereum", assetOptions: ["ETH", "USDC"] },
  base: { label: "Base", assetOptions: ["ETH", "USDC"] },
  arbitrum: { label: "Arbitrum One", assetOptions: ["ETH", "USDC"] },
  optimism: { label: "OP Mainnet", assetOptions: ["ETH", "USDC"] },
  polygon: { label: "Polygon", assetOptions: ["USDC"] },
};

function BuyModal({ open, onClose, wallet, selectedNetwork, backendUrl, notify }) {
  const [networkKey, setNetworkKey] = useState(selectedNetwork);
  const [asset, setAsset] = useState("ETH");
  const [amount, setAmount] = useState("50");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const initial = BUY_NETWORKS[selectedNetwork] ? selectedNetwork : "base";
    setNetworkKey(initial);
    setAsset(BUY_NETWORKS[initial]?.assetOptions?.[0] || "ETH");
  }, [open, selectedNetwork]);

  const network = NETWORKS[networkKey] || {};
  const assetOptions = useMemo(() => BUY_NETWORKS[networkKey]?.assetOptions || [], [networkKey]);

  if (!open) return null;

  async function startBuy() {
    if (!wallet?.address) { notify?.("Unlock wallet first"); return; }
    if (!backendUrl) { notify?.("Buy service is not configured"); return; }
    if (!BUY_NETWORKS[networkKey]) { notify?.("Buy is not available on this network"); return; }
    if (!assetOptions.includes(asset)) { notify?.("Select a supported asset"); return; }
    const fiatAmount = Number(amount);
    if (!Number.isFinite(fiatAmount) || fiatAmount < 5 || fiatAmount > 2500) { notify?.("Enter an amount between $5 and $2,500"); return; }

    const popup = window.open("about:blank", "sendera-coinbase-buy");
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl.replace(/\/$/, "")}/api/buy/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: wallet.address,
          network: networkKey,
          asset,
          presetFiatAmount: fiatAmount,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data?.onrampUrl) throw new Error(data?.error || "Unable to start buy flow");
      if (popup) popup.location.href = data.onrampUrl;
      else window.location.href = data.onrampUrl;
      onClose?.();
    } catch (error) {
      if (popup) popup.close();
      notify?.(error?.message || "Unable to start buy flow");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 95, background: "rgba(1,5,18,.74)", backdropFilter: "blur(12px)", display: "grid", placeItems: "center", padding: 18 }}>
      <div style={{ width: "100%", maxWidth: 480, padding: 20, borderRadius: 24, border: "1px solid rgba(145,110,255,.28)", background: "linear-gradient(160deg,#161a43,#20112f)", boxShadow: "0 24px 70px rgba(0,0,0,.45)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#9ea9c3", fontSize: 12 }}>Fiat on-ramp</div>
            <h3 style={{ margin: "4px 0 0", fontSize: 24, color: "white" }}>Buy Crypto</h3>
          </div>
          <button onClick={onClose} style={{ border: 0, background: "rgba(255,255,255,.07)", color: "white", width: 36, height: 36, borderRadius: "50%", cursor: "pointer" }}>×</button>
        </div>

        <div style={{ marginTop: 14, padding: 13, borderRadius: 14, background: "rgba(255,255,255,.05)", border: "1px solid rgba(139,92,246,.22)", color: "#aebbd3", fontSize: 11, lineHeight: 1.5 }}>
          Coinbase handles payment and KYC. Crypto is delivered directly to your Sendera wallet address.
        </div>

        <label style={{ display: "block", marginTop: 14, color: "#8998b7", fontSize: 11, fontWeight: 800 }}>NETWORK</label>
        <select value={networkKey} onChange={(e) => { const key = e.target.value; setNetworkKey(key); setAsset(BUY_NETWORKS[key]?.assetOptions?.[0] || "ETH"); }} style={{ width: "100%", marginTop: 6, padding: 13, borderRadius: 14, border: "1px solid #293b68", background: "#09132f", color: "white", boxSizing: "border-box" }}>
          {Object.entries(BUY_NETWORKS).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
        </select>

        <label style={{ display: "block", marginTop: 12, color: "#8998b7", fontSize: 11, fontWeight: 800 }}>ASSET</label>
        <select value={asset} onChange={(e) => setAsset(e.target.value)} style={{ width: "100%", marginTop: 6, padding: 13, borderRadius: 14, border: "1px solid #293b68", background: "#09132f", color: "white", boxSizing: "border-box" }}>
          {assetOptions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>

        <label style={{ display: "block", marginTop: 12, color: "#8998b7", fontSize: 11, fontWeight: 800 }}>AMOUNT (USD)</label>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min="5" max="2500" step="1" style={{ width: "100%", marginTop: 6, padding: 13, borderRadius: 14, border: "1px solid #293b68", background: "#09132f", color: "white", boxSizing: "border-box" }} />
        <div style={{ marginTop: 6, color: "#6f7f9f", fontSize: 10 }}>Supported range in this Sendera flow: $5–$2,500.</div>

        <div style={{ marginTop: 12, padding: 11, borderRadius: 13, background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.20)", color: "#a7e7bd", fontSize: 10 }}>
          Recipient: {wallet?.address ? `${wallet.address.slice(0, 8)}…${wallet.address.slice(-6)}` : "No wallet"}
        </div>

        <button disabled={loading} onClick={startBuy} style={{ width: "100%", marginTop: 13, padding: 14, border: 0, borderRadius: 14, background: loading ? "#4b5563" : "linear-gradient(135deg,#ff9c2d,#ff6f00)", color: "white", fontWeight: 900, cursor: loading ? "wait" : "pointer" }}>
          {loading ? "Preparing secure checkout…" : "Continue to Coinbase"}
        </button>
      </div>
    </div>
  );
}

export default BuyModal;
