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

      <PortfolioCard />

      <AIChatBox />
    </div>
  );
}

export default HomeTab;
