function HistoryTab({
  transactions = [],
}) {
  return (
    <div>
      <h2>
        Transaction History
      </h2>

      {transactions.length >
      0 ? (
        transactions.map(
          (tx) => (
            <div
              key={tx.hash}
              style={{
                background:
                  "#0f172a",
                padding: 20,
                borderRadius: 16,
                marginTop: 20,
              }}
            >
              <p>
                {(Number(
                  tx.value
                ) /
                  1e18
                ).toFixed(
                  4
                )}{" "}
                ETH
              </p>

              <p
                style={{
                  fontSize: 12,
                  color:
                    "#94a3b8",
                  wordBreak:
                    "break-all",
                }}
              >
                {tx.hash}
              </p>
            </div>
          )
        )
      ) : (
        <div
          style={{
            background:
              "#0f172a",
            padding: 20,
            borderRadius: 16,
            marginTop: 20,
            textAlign:
              "center",
          }}
        >
          No Transactions
        </div>
      )}
    </div>
  );
}

export default HistoryTab;
