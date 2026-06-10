import AIChatBox from "./AIChatBox";
import PortfolioCard from "./PortfolioCard";
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
    <PortfolioCard />
    <AIChatBox />

export default HomeTab;
