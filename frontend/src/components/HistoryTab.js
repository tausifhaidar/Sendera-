import { ethers } from "ethers";

function HistoryTab({ transactions = [], selectedNetwork }) {
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

  function formatAmount(value) {
    try {
      return Number(ethers.formatEther(value || "0")).toFixed(4);
    } catch {
      return "0.0000";
    }
  }

  return (
    <div>
      <h2>Transaction History</h2>
      <p style={{ color: "#94a3b8", marginTop: 5 }}>{networkName}</p>

      {transactions.length > 0 ? (
        transactions.map((tx) => {
          const isReceived =
            String(tx.to || "").toLowerCase() !==
            String(tx.from || "").toLowerCase();
          const date = tx.timeStamp
            ? new Date(Number(tx.timeStamp) * 1000).toLocaleString()
            : "Date unavailable";

          return (
            <div
              key={tx.hash}
              style={{
                background: "#0f172a",
                padding: 18,
                borderRadius: 16,
                marginTop: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <strong style={{ color: isReceived ? "#22c55e" : "#60a5fa" }}>
                  {isReceived ? "Received" : "Sent"}
                </strong>
                <strong>{formatAmount(tx.value)} ETH</strong>
              </div>

              <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 6 }}>
                {date}
              </p>

              <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>
                {isReceived ? "From" : "To"}
              </p>
              <p style={{ fontSize: 12, wordBreak: "break-all", marginTop: 0 }}>
                {isReceived ? tx.from : tx.to}
              </p>

              <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>
                Status
              </p>
              <p style={{ marginTop: 0 }}>
                {tx.isError === "1" ? "Failed" : "Confirmed"}
              </p>

              {tx.hash && explorerBase && (
                <a
                  href={`${explorerBase}${tx.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: 11,
                    marginTop: 14,
                    borderRadius: 10,
                    background: "#1e293b",
                    color: "white",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  View on Explorer
                </a>
              )}
            </div>
          );
        })
      ) : (
        <div
          style={{
            background: "#0f172a",
            padding: 20,
            borderRadius: 16,
            marginTop: 20,
            textAlign: "center",
            color: "#94a3b8",
          }}
        >
          No Transactions
        </div>
      )}
    </div>
  );
}

export default HistoryTab;
