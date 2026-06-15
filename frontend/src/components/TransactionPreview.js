function TransactionPreview({
  address,
  amount,
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
        To: {address || "No Address"}
      </p>

      <p>
        Amount: {amount || "0"} ETH
      </p>
    </div>
  );
}

export default TransactionPreview;
