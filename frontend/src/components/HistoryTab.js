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
      if (tx.gasUsed && tx.gasPrice) return `${Number(ethers.formatEther(BigInt(tx.gasUsed) * BigInt(tx.gasPrice))).toFixed(6)} ${selectedNetwork === "polygonAmoy" ? "POL" : "ETH"}`;
      if (resolvedGasFees[tx.hash]) return `${Number(resolvedGasFees[tx.hash]).toFixed(6)} ${selectedNetwork === "polygonAmoy" ? "POL" : "ETH"}`;
      return "Loading...";
    } catch { return "Unavailable"; }
  }

  function getStatus(tx) {
    if (tx.isError === "1" || tx.txreceipt_status === "0") return "Failed";
    return tx.confirmations && Number(tx.confirmations) === 0 ? "Pending" : "Confirmed";
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Transaction History</h2>
          <p style={{ color: "#94a3b8", marginTop: 0 }}>{networkName}</p>
        </div>
        <button onClick={onRefresh} style={{ border: "none", borderRadius: 10, padding: "9px 12px", background: "#1e293b", color: "white", fontWeight: "bold" }}>Refresh</button>
      </div>

      {transactions.length > 0 ? transactions.map((tx) => {
        const myAddress = String(wallet?.address || "").toLowerCase();
        const from = String(tx.from || "").toLowerCase();
        const to = String(tx.to || "").toLowerCase();
        const isReceived = to === myAddress && from !== myAddress;
        const status = getStatus(tx);
        const date = tx.timeStamp ? new Date(Number(tx.timeStamp) * 1000).toLocaleString() : "Date unavailable";
        const isOpen = expanded === tx.hash;

        return (
          <div key={tx.hash} style={{ background: "#0f172a", padding: 18, borderRadius: 16, marginTop: 14, border: "1px solid #172033" }}>
            <button onClick={() => setExpanded(isOpen ? null : tx.hash)} style={{ width: "100%", background: "none", border: "none", color: "white", padding: 0, textAlign: "left", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <strong style={{ color: isReceived ? "#22c55e" : "#60a5fa" }}>{isReceived ? "↓ Received" : "↑ Sent"}</strong>
                <strong>{formatAmount(tx.value)} {selectedNetwork === "polygonAmoy" ? "POL" : "ETH"}</strong>
              </div>
              <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 0 }}>{date} • {status}</p>
            </button>

            {isOpen && (
              <div style={{ marginTop: 14 }}>
                <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>{isReceived ? "From" : "To"}</p>
                <p style={{ fontSize: 12, wordBreak: "break-all", marginTop: 0 }}>{isReceived ? tx.from : tx.to}</p>
                <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>Status</p>
                <p style={{ marginTop: 0, color: status === "Failed" ? "#ef4444" : status === "Pending" ? "#f59e0b" : "#22c55e", fontWeight: "bold" }}>{status}</p>
                <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>Gas Fee</p>
                <p style={{ marginTop: 0 }}>{formatGasFee(tx)}</p>
                <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>Transaction Hash</p>
                <p style={{ fontSize: 12, wordBreak: "break-all", marginTop: 0 }}>{tx.hash}</p>
                {tx.hash && explorerBase && <a href={`${explorerBase}${tx.hash}`} target="_blank" rel="noreferrer" style={{ display: "block", textAlign: "center", padding: 11, marginTop: 14, borderRadius: 10, background: "#1e293b", color: "white", textDecoration: "none", fontWeight: "bold" }}>View on Explorer</a>}
              </div>
            )}
          </div>
        );
      }) : (
        <div style={{ background: "#0f172a", padding: 20, borderRadius: 16, marginTop: 20, textAlign: "center", color: "#94a3b8" }}>No Transactions</div>
      )}
    </div>
  );
}

export default HistoryTab;
