function TransactionSuccess({
  amount,
  network,
  address,
  hash,
  onDone,
}) {
  const shortHash = hash
    ? `${hash.slice(0, 10)}...${hash.slice(-8)}`
    : "";

  const shortAddress = address
    ? `${address.slice(0, 8)}...${address.slice(-6)}`
    : "";

  function copyHash() {
    if (!hash) return;

    navigator.clipboard
      ?.writeText(hash)
      .then(() => alert("Transaction hash copied!"))
      .catch(() => alert("Unable to copy transaction hash."));
  }

  function openExplorer() {
    if (!hash) return;

    let explorer = "";

    if (network === "Ethereum Sepolia") {
      explorer = `https://sepolia.etherscan.io/tx/${hash}`;
    } else if (network === "Base Sepolia") {
      explorer = `https://sepolia.basescan.org/tx/${hash}`;
    } else if (network === "Polygon Amoy") {
      explorer = `https://amoy.polygonscan.com/tx/${hash}`;
    }

    if (explorer) {
      window.open(explorer, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2, 6, 23, 0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#0f172a",
          borderRadius: 24,
          padding: 24,
          boxSizing: "border-box",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: "#14532d",
            color: "#22c55e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            margin: "0 auto 18px",
          }}
        >
          ✓
        </div>

        <h2 style={{ margin: 0 }}>Transaction Successful</h2>

        <p style={{ color: "#94a3b8", marginTop: 10 }}>
          {amount} ETH sent successfully
        </p>

        <div
          style={{
            background: "#020617",
            borderRadius: 16,
            padding: 16,
            marginTop: 20,
            textAlign: "left",
          }}
        >
          <p style={{ color: "#94a3b8", margin: "0 0 6px" }}>Network</p>
          <p style={{ margin: "0 0 16px" }}>{network}</p>

          <p style={{ color: "#94a3b8", margin: "0 0 6px" }}>To</p>
          <p
            style={{
              margin: "0 0 16px",
              wordBreak: "break-all",
            }}
          >
            {shortAddress}
          </p>

          <p style={{ color: "#94a3b8", margin: "0 0 6px" }}>
            Transaction Hash
          </p>
          <p
            style={{
              margin: 0,
              wordBreak: "break-all",
              color: "#e2e8f0",
            }}
          >
            {shortHash}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button
            onClick={copyHash}
            style={{
              flex: 1,
              padding: 13,
              border: "none",
              borderRadius: 12,
              background: "#334155",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Copy Hash
          </button>

          <button
            onClick={openExplorer}
            style={{
              flex: 1,
              padding: 13,
              border: "none",
              borderRadius: 12,
              background: "#22c55e",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Explorer
          </button>
        </div>

        <button
          onClick={onDone}
          style={{
            width: "100%",
            padding: 13,
            marginTop: 12,
            border: "none",
            borderRadius: 12,
            background: "transparent",
            color: "#94a3b8",
            cursor: "pointer",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default TransactionSuccess;
