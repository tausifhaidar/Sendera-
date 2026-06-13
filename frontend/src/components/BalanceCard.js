function BalanceCard({
  balance = "0.0000",
  network = "Base Sepolia",
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
      <p>Total Balance</p>

      <h2>{balance} ETH</h2>

      <p
        style={{
          color: "#94a3b8",
        }}
      >
        {network}
      </p>
    </div>
  );
}

export default BalanceCard;
