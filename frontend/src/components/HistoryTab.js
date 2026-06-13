function HistoryTab() {
  const transactions = [
    {
      type: "Received",
      amount: "0.05 ETH",
      network: "Ethereum Sepolia",
    },
  ];

  return (
    <div>
      <h2>Transaction History</h2>

      {transactions.map((tx, index) => (
        <div
          key={index}
          style={{
            background: "#0f172a",
            padding: 20,
            borderRadius: 16,
            marginTop: 20,
          }}
        >
          <h3>{tx.type}</h3>

          <p>{tx.amount}</p>

          <p
            style={{
              color: "#94a3b8",
            }}
          >
            {tx.network}
          </p>
        </div>
      ))}
    </div>
  );
}

export default HistoryTab;
