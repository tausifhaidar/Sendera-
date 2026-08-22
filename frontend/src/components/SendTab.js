import TransactionPreview from "./TransactionPreview";

function SendTab({
  wallet,
  recipient,
  setRecipient,
  sendAmount,
  setSendAmount,
  showPreview,
  setShowPreview,
  selectedNetwork,
  gasFee,
  onPreviewTransaction,
  setGasFee,
  onSendTransaction,
  onTransactionSuccess,
}) {
  const networkName =
    selectedNetwork === "baseSepolia"
      ? "Base Sepolia"
      : selectedNetwork === "ethereumSepolia"
      ? "Ethereum Sepolia"
      : selectedNetwork === "polygonAmoy"
      ? "Polygon Amoy"
      : selectedNetwork;

  const card = {
    background: "rgba(13, 21, 52, 0.82)",
    border: "1px solid rgba(129, 101, 255, 0.22)",
    borderRadius: 22,
    boxShadow: "0 18px 50px rgba(0,0,0,.18)",
  };

  const input = {
    width: "100%",
    padding: "15px 16px",
    borderRadius: 14,
    border: "1px solid #263662",
    background: "#0a1330",
    color: "white",
    boxSizing: "border-box",
    outline: "none",
    fontSize: 14,
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", paddingBottom: 30 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ color: "#8e9abb", fontSize: 12, marginBottom: 4 }}>Secure transfer</div>
        <h2 style={{ margin: 0, fontSize: 28, letterSpacing: -0.6 }}>Send Crypto</h2>
        <p style={{ color: "#8e9abb", margin: "7px 0 0", fontSize: 13 }}>{networkName}</p>
      </div>

      <div style={{ ...card, padding: 20, marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ color: "#a8b3cc", fontSize: 12 }}>Recipient</div>
            <div style={{ fontWeight: 700, marginTop: 3 }}>Wallet address</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 12, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#7c3aed,#2563eb)", fontSize: 18 }}>↗</div>
        </div>
        <input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          style={input}
        />
        <div style={{ color: "#657393", fontSize: 11, marginTop: 8 }}>Only send to a compatible EVM wallet address.</div>
      </div>

      <div style={{ ...card, padding: 20, marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ color: "#a8b3cc", fontSize: 12 }}>Amount</div>
            <div style={{ fontWeight: 700, marginTop: 3 }}>ETH to send</div>
          </div>
          <span style={{ color: "#7d8eb4", fontSize: 12 }}>ETH</span>
        </div>
        <input
          value={sendAmount}
          onChange={(e) => setSendAmount(e.target.value)}
          placeholder="0.0000"
          type="number"
          min="0"
          step="any"
          style={{ ...input, fontSize: 24, fontWeight: 700 }}
        />
      </div>

      <button
        onClick={async () => {
          if (!recipient || !sendAmount) {
            alert("Please enter recipient address and amount.");
            return;
          }
          await onPreviewTransaction(recipient, sendAmount);
        }}
        style={{
          width: "100%",
          padding: 16,
          border: "1px solid rgba(167,139,250,.45)",
          borderRadius: 16,
          background: "linear-gradient(135deg,#7c3aed,#2563eb)",
          color: "white",
          fontWeight: 800,
          marginTop: 16,
          cursor: "pointer",
          boxShadow: "0 14px 35px rgba(79,70,229,.28)",
        }}
      >
        Review Transaction →
      </button>

      {showPreview && (
        <TransactionPreview
          wallet={wallet}
          network={networkName}
          address={recipient}
          amount={sendAmount}
          gasFee={gasFee}
          onCancel={() => {
            setShowPreview(false);
            setGasFee("");
          }}
          onConfirm={async () => {
            const hash = await onSendTransaction(recipient, sendAmount);
            if (hash) {
              onTransactionSuccess?.(hash, gasFee);
              setShowPreview(false);
              setRecipient("");
              setSendAmount("");
              setGasFee("");
            }
          }}
        />
      )}
    </div>
  );
}

export default SendTab;
