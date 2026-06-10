function WalletCard({ wallet }) {
  return (
    <div
      style={{
        background: "#0f172a",
        padding: 20,
        borderRadius: 16,
        marginTop: 20,
      }}
    >
      <p
        style={{
          color: "#94a3b8",
          marginBottom: 10,
        }}
      >
        Sendera Wallet
      </p>

      <h3
        style={{
          margin: 0,
          wordBreak: "break-all",
        }}
      >
        {wallet?.address ||
          "No Wallet"}
      </h3>

      <p
        style={{
          marginTop: 15,
          color: "#22c55e",
        }}
      >
        Base Sepolia
      </p>
    </div>
  );
}

export default WalletCard;
