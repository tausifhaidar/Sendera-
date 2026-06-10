import BalanceCard from "./BalanceCard";
import WalletCard from "./WalletCard";

function HomeTab({ wallet }) {
return (
<div>
<h1>Sendera</h1>

  <BalanceCard />

  <WalletCard wallet={wallet} />

  <div
    style={{
      background: "#0f172a",
      padding: 20,
      borderRadius: 16,
      marginTop: 20,
    }}
  >
    <h3>AI Assistant</h3>

    <input
      placeholder="Ask Sendera..."
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
</div>

);
}

export default HomeTab;
