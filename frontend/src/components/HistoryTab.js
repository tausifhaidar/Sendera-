import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { NETWORKS } from "./rpcConfig";

const EXPLORERS = {
  baseSepolia: "https://sepolia.basescan.org/tx/",
  ethereumSepolia: "https://sepolia.etherscan.io/tx/",
  polygonAmoy: "https://amoy.polygonscan.com/tx/",
};

function HistoryTab({ transactions = [], selectedNetwork, wallet, onRefresh }) {
  const [resolvedGasFees, setResolvedGasFees] = useState({});
  const [expanded, setExpanded] = useState(null);
  const networkName = NETWORKS[selectedNetwork]?.name || selectedNetwork;
  const explorerBase = EXPLORERS[selectedNetwork] || "";

  useEffect(() => {
    let cancelled = false;
    async function resolveMissingGasFees() {
      const rpcUrl = NETWORKS[selectedNetwork]?.rpc;
      if (!rpcUrl) return;
      const missing = transactions.filter((tx) => tx.hash && (!tx.gasUsed || !tx.gasPrice) && !resolvedGasFees[tx.hash]);
      if (!missing.length) return;
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const results = {};
      for (const tx of missing.slice(0, 20)) {
        try {
          const receipt = await provider.getTransactionReceipt(tx.hash);
          if (!receipt) continue;
          const gasPrice = receipt.gasPrice ?? receipt.effectiveGasPrice;
          if (receipt.gasUsed && gasPrice) results[tx.hash] = ethers.formatEther(receipt.gasUsed * gasPrice);
        } catch (error) { console.log("Gas fee lookup error:", error.message); }
      }
      if (!cancelled && Object.keys(results).length) setResolvedGasFees((previous) => ({ ...previous, ...results }));
    }
    resolveMissingGasFees();
    return () => { cancelled = true; };
  }, [transactions, selectedNetwork, resolvedGasFees]);

  function formatAmount(value) {
    try { return Number(ethers.formatEther(value || "0")).toFixed(4); } catch { return "0.0000"; }
  }

  function formatGasFee(tx) {
    try {
      const unit = selectedNetwork === "polygonAmoy" ? "POL" : "ETH";
      if (tx.gasUsed && tx.gasPrice) return `${Number(ethers.formatEther(BigInt(tx.gasUsed) * BigInt(tx.gasPrice))).toFixed(6)} ${unit}`;
      if (resolvedGasFees[tx.hash]) return `${Number(resolvedGasFees[tx.hash]).toFixed(6)} ${unit}`;
      return "Loading...";
    } catch { return "Unavailable"; }
  }

  function getStatus(tx) {
    if (tx.isError === "1" || tx.txreceipt_status === "0") return "Failed";
    return tx.confirmations && Number(tx.confirmations) === 0 ? "Pending" : "Confirmed";
  }

  const pill = (background, color) => ({ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 9px", borderRadius: 999, background, color, fontSize: 11, fontWeight: 800 });

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", paddingBottom: 30 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div>
          <div style={{ color: "#8d9abb", fontSize: 12 }}>Your activity</div>
          <h2 style={{ margin: "4px 0 0", fontSize: 28 }}>Transaction History</h2>
          <p style={{ color: "#8d9abb", margin: "6px 0 0", fontSize: 12 }}>{networkName}</p>
        </div>
        <button onClick={onRefresh} style={{ border: "1px solid #2c3d69", borderRadius: 13, padding: "10px 13px", background: "#111d3a", color: "white", fontWeight: 700 }}>↻ Refresh</button>
      </div>

      {transactions.length > 0 ? transactions.map((tx) => {
        const myAddress = String(wallet?.address || "").toLowerCase();
        const from = String(tx.from || "").toLowerCase();
        const to = String(tx.to || "").toLowerCase();
        const isReceived = to === myAddress && from !== myAddress;
        const status = getStatus(tx);
        const date = tx.timeStamp ? new Date(Number(tx.timeStamp) * 1000).toLocaleString() : "Date unavailable";
        const isOpen = expanded === tx.hash;
        const statusStyle = status === "Failed" ? pill("rgba(239,68,68,.12)", "#f87171") : status === "Pending" ? pill("rgba(245,158,11,.12)", "#fbbf24") : pill("rgba(34,197,94,.12)", "#4ade80");

        return (
          <div key={tx.hash} style={{ background: "rgba(13,21,52,.86)", border: "1px solid rgba(91,74,170,.25)", padding: 17, borderRadius: 22, marginTop: 13, boxShadow: "0 15px 40px rgba(0,0,0,.15)" }}>
            <button onClick={() => setExpanded(isOpen ? null : tx.hash)} style={{ width: "100%", background: "none", border: "none", color: "white", padding: 0, textAlign: "left", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, display: "grid", placeItems: "center", background: isReceived ? "rgba(34,197,94,.14)" : "rgba(124,58,237,.16)", color: isReceived ? "#4ade80" : "#c4b5fd", fontSize: 19 }}>{isReceived ? "↓" : "↑"}</div>
                  <div><strong>{isReceived ? "Received" : "Sent"}</strong><div style={{ color: "#7584a2", fontSize: 11, marginTop: 3 }}>{date}</div></div>
                </div>
                <div style={{ textAlign: "right" }}><strong style={{ fontSize: 14 }}>{isReceived ? "+" : "-"}{formatAmount(tx.value)} {selectedNetwork === "polygonAmoy" ? "POL" : "ETH"}</strong><div style={{ marginTop: 5 }}>{statusStyle}</div></div>
              </div>
            </button>

            {isOpen && (
              <div style={{ marginTop: 15, paddingTop: 14, borderTop: "1px solid #223257" }}>
                <div style={{ color: "#7e8cab", fontSize: 11 }}>{isReceived ? "From" : "To"}</div>
                <div style={{ marginTop: 5, fontSize: 12, wordBreak: "break-all" }}>{isReceived ? tx.from : tx.to}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 13 }}>
                  <div style={{ background: "#09132f", padding: 12, borderRadius: 14, border: "1px solid #21345e" }}><div style={{ color: "#7584a2", fontSize: 11 }}>Gas fee</div><div style={{ marginTop: 4, fontWeight: 700 }}>{formatGasFee(tx)}</div></div>
                  <div style={{ background: "#09132f", padding: 12, borderRadius: 14, border: "1px solid #21345e" }}><div style={{ color: "#7584a2", fontSize: 11 }}>Status</div><div style={{ marginTop: 4, fontWeight: 700 }}>{status}</div></div>
                </div>
                <div style={{ color: "#7584a2", fontSize: 11, marginTop: 13 }}>Transaction hash</div>
                <div style={{ fontSize: 11, wordBreak: "break-all", marginTop: 5, color: "#c9d3e9" }}>{tx.hash}</div>
                {tx.hash && explorerBase && <a href={`${explorerBase}${tx.hash}`} target="_blank" rel="noreferrer" style={{ display: "block", textAlign: "center", padding: 12, marginTop: 14, borderRadius: 14, background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "white", textDecoration: "none", fontWeight: 800 }}>View on Explorer →</a>}
              </div>
            )}
          </div>
        );
      }) : (
        <div style={{ background: "rgba(13,21,52,.84)", border: "1px solid #26345b", padding: 30, borderRadius: 22, marginTop: 18, textAlign: "center", color: "#8b98b5" }}><div style={{ fontSize: 28, marginBottom: 8 }}>◎</div><div style={{ fontWeight: 700, color: "#d9e1f2" }}>No transactions yet</div><div style={{ fontSize: 12, marginTop: 5 }}>Your completed activity will appear here.</div></div>
      )}
    </div>
  );
}

export default HistoryTab;
