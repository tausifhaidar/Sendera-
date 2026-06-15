function HistoryTab({
  wallet,
  selectedNetwork,
}) {
  return (
    <div>
      <h2>Transaction History</h2>

      <div
        style={{
          background: "#0f172a",
          padding: 20,
          borderRadius: 16,
          marginTop: 20,
        }}
      >
        <p>
          Wallet:
        </p>

        <p
          style={{
            wordBreak: "break-all",
          }}
        >
          {wallet?.address ||
            "No Wallet"}
        </p>

        <p
          style={{
            marginTop: 10,
            color: "#94a3b8",
          }}
        >
          Network:
          {" "}
          {selectedNetwork}
        </p>
      </div>

      <div
        style={{
          background: "#0f172a",
          padding: 20,
          borderRadius: 16,
          marginTop: 20,
          textAlign: "center",
        }}
      >
        <p>
          Real Transaction Sync
          Coming Soon
        </p>
      </div>
    </div>
  );
}

export default HistoryTab;
