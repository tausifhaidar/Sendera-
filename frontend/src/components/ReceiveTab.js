function ReceiveTab({ wallet }) {
  return (
    <div>
      <h2>Receive Crypto</h2>

      <div
        style={{
          background: "#0f172a",
          padding: 20,
          borderRadius: 16,
          marginTop: 20,
        }}
      >
        <p>Wallet Address</p>

        <p
          style={{
            wordBreak: "break-all",
          }}
        >
          {wallet?.address || "No Wallet"}
        </p>

        <button
          onClick={() => {
            navigator.clipboard.writeText(
              wallet?.address || ""
            );
            alert("Address Copied");
          }}
          style={{
            width: "100%",
            padding: 12,
            marginTop: 15,
            border: "none",
            borderRadius: 12,
            background: "#22c55e",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Copy Address
        </button>
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
        <h3>QR Code</h3>
        <p>Coming Soon</p>
      </div>
    </div>
  );
}

export default ReceiveTab;
