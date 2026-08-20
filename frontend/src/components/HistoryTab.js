import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { NETWORKS } from "./rpcConfig";

function HistoryTab({ transactions = [], selectedNetwork, wallet }) {
  const [resolvedGasFees, setResolvedGasFees] = useState({});

  const networkName =
    selectedNetwork === "baseSepolia"
      ? "Base Sepolia"
      : selectedNetwork === "ethereumSepolia"
      ? "Ethereum Sepolia"
      : selectedNetwork === "polygonAmoy"
      ? "Polygon Amoy"
      : selectedNetwork;

  const explorerBase =
    selectedNetwork === "baseSepolia"
      ? "https://sepolia.basescan.org/tx/"
      : selectedNetwork === "ethereumSepolia"
      ? "https://sepolia.etherscan.io/tx/"
      : selectedNetwork === "polygonAmoy"
      ? "https://amoy.polygonscan.com/tx/"
      : "";

  useEffect(() => {
    let cancelled = false;

    async function resolveMissingGasFees() {
      const rpcUrl = NETWORKS[selectedNetwork]?.rpc;
      if (!rpcUrl) return;

      const missing = transactions.filter(
        (tx) => tx.hash && (!tx.gasUsed || !tx.gasPrice) && !resolvedGasFees[tx.hash]
      );
      if (!missing.length) return;

      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const results = {};

      for (const tx of missing) {
        try {
          const receipt = await provider.getTransactionReceipt(tx.hash);
          if (!receipt) continue;

          const gasPrice = receipt.gasPrice ?? receipt.effectiveGasPrice;
          if (receipt.gasUsed && gasPrice) {
            results[tx.hash] = ethers.formatEther(receipt.gasUsed * gasPrice);
          }
        } catch (error) {
          console.log("Gas fee lookup error:", error.message);
        }
      }

      if (!cancelled && Object.keys(results).length) {
        setResolvedGasFees((previous) => ({ ...previous, ...results }));
      }
    }

    resolveMissingGasFees();
    return () => {
      cancelled = true;
    };
  }, [transactions, selectedNetwork, resolvedGasFees]);

  function formatAmount(value) {
    try {
      return Number(ethers.formatEther(value || "0")).toFixed(4);
    } catch {
      return "0.0000";
    }
  }

  function formatGasFee(tx) {
    try {
      if (tx.gasUsed && tx.gasPrice) {
        const fee = BigInt(tx.gasUsed) * BigInt(tx.gasPrice);
        return `${Number(ethers.formatEther(fee)).toFixed(6)} ETH`;
      }

      if (resolvedGasFees[tx.hash]) {
        return `${Number(resolvedGasFees[tx.hash]).toFixed(6)} ETH`;
      }

      return "Loading...";
    } catch {
      return "Unavailable";
    }
  }

  function getStatus(tx) {
    if (tx.isError === "1" || tx.txreceipt_status === "0") return "Failed";
    return "Confirmed";
  }

  return (
    <div>
      <h2>Transaction History</h2>
      <p style={{ color: "#94a3b8", marginTop: 5 }}>{networkName}</p>

      {selectedNetwork !== "ethereumSepolia" ? (
        <div style={{ background: "#0f172a", padding: 20, borderRadius: 16, marginTop: 20, textAlign: "center", color: "#94a3b8" }}>
          History for {networkName} will be available after explorer support is connected.
        </div>
      ) : transactions.length > 0 ? (
        transactions.map((tx) => {
          const myAddress = String(wallet?.address || "").toLowerCase();
          const from = String(tx.from || "").toLowerCase();
          const to = String(tx.to || "").toLowerCase();
          const isReceived = to === myAddress && from !== myAddress;
          const status = getStatus(tx);
          const date = tx.timeStamp
            ? new Date(Number(tx.timeStamp) * 1000).toLocaleString()
            : "Date unavailable";

          return (
            <div key={tx.hash} style={{ background: "#0f172a", padding: 18, borderRadius: 16, marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <strong style={{ color: isReceived ? "#22c55e" : "#60a5fa" }}>
                  {isReceived ? "Received" : "Sent"}
                </strong>
                <strong>{formatAmount(tx.value)} ETH</strong>
              </div>

              <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12 }}>{date}</p>

              <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>{isReceived ? "From" : "To"}</p>
              <p style={{ fontSize: 12, wordBreak: "break-all", marginTop: 0 }}>{isReceived ? tx.from : tx.to}</p>

              <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>Status</p>
              <p style={{ marginTop: 0, color: status === "Failed" ? "#ef4444" : "#22c55e", fontWeight: "bold" }}>{status}</p>

              <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>Gas Fee</p>
              <p style={{ marginTop: 0 }}>{formatGasFee(tx)}</p>

              <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>Transaction Hash</p>
              <p style={{ fontSize: 12, wordBreak: "break-all", marginTop: 0 }}>{tx.hash}</p>

              {tx.hash && explorerBase && (
                <a href={`${explorerBase}${tx.hash}`} target="_blank" rel="noreferrer" style={{ display: "block", textAlign: "center", padding: 11, marginTop: 14, borderRadius: 10, background: "#1e293b", color: "white", textDecoration: "none", fontWeight: "bold" }}>
                  View on Explorer
                </a>
              )}
            </div>
          );
        })
      ) : (
        <div style={{ background: "#0f172a", padding: 20, borderRadius: 16, marginTop: 20, textAlign: "center", color: "#94a3b8" }}>
          No Transactions
        </div>
      )}
    </div>
  );
}

export default HistoryTab;
