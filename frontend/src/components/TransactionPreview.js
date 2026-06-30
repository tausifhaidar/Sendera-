function TransactionPreview({
  wallet,
  network,
  address,
  amount,
  onCancel,
  onConfirm,
}) {
  return (
    <div
      style={{
        background: "#0f172a",
        padding: 20,
        borderRadius: 16,
        marginTop: 20,
      }}
    >
      <h3>Transaction Preview</h3>

      <p>
        <strong>Network:</strong>{" "}
        {network}
      </p>

      <p>
        <strong>From:</strong>
      </p>

      <p
        style={{
          wordBreak: "break-all",
          color: "#94a3b8",
        }}
      >
        {wallet?.address}
      </p>

      <p>
        <strong>To:</strong>
      </p>

      <p
        style={{
          wordBreak: "break-all",
          color: "#94a3b8",
        }}
      >
        {address}
      </p>

      <p>
        <strong>Amount:</strong>{" "}
        {amount} ETH
      </p>

      <p>
        <strong>Estimated Gas:</strong>
        {" "}
        Loading...
      </p>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 20,
        }}
      >
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: 12,
            background: "#334155",
            color: "white",
            border: "none",
            borderRadius: 10,
          }}
        >
          Cancel
        </button>

        <button
          onClick={onConfirm}
          style={{
            flex: 1,
            padding: 12,
            background: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: 10,
            fontWeight: "bold",
          }}
        >
          Confirm & Send
        </button>
      </div>
    </div>
  );
}

export default TransactionPreview;
