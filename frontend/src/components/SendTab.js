import TransactionPreview from "./TransactionPreview";

function SendTab({
  wallet,
  recipient,
  setRecipient,
  sendAmount,
  setSendAmount,
  showPreview,
  setShowPreview,
}) {
  return (
    <div>
      <h2>Send Crypto</h2>

      <div
        style={{
          background: "#0f172a",
          padding: 20,
          borderRadius: 16,
          marginTop: 20,
        }}
      >
        <p>Recipient Address</p>

        <input
          value={recipient}
          onChange={(e) =>
            setRecipient(e.target.value)
          }
          placeholder="0x..."
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "none",
            background: "#1e293b",
            color: "white",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div
        style={{
          background: "#0f172a",
          padding: 20,
          borderRadius: 16,
          marginTop: 20,
        }}
      >
        <p>Amount</p>

        <input
          value={sendAmount}
          onChange={(e) =>
            setSendAmount(e.target.value)
          }
          placeholder="0.00"
          type="number"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "none",
            background: "#1e293b",
            color: "white",
            boxSizing: "border-box",
          }}
        />
      </div>

      <button
        onClick={() => {
          if (!recipient || !sendAmount) {
            alert(
              "Please enter recipient address and amount."
            );
            return;
          }

          setShowPreview(true);
        }}
        style={{
          width: "100%",
          padding: 14,
          border: "none",
          borderRadius: 12,
          background: "#22c55e",
          color: "white",
          fontWeight: "bold",
          marginTop: 20,
          cursor: "pointer",
        }}
      >
        Preview Transaction
      </button>

         {showPreview && (
      <TransactionPreview
        wallet={wallet}
        network="Ethereum Sepolia"
        address={recipient}
        amount={sendAmount}
        onCancel={() =>
          setShowPreview(false)
        }
        onConfirm={() =>
          alert("Next Step: Real Transaction")
         }
       />
     )}

   </div>
  );
 }

export default SendTab;
