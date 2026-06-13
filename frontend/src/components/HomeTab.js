import AIActionCard from "./AIActionCard";
import AIChatBox from "./AIChatBox";
import PortfolioCard from "./PortfolioCard";
import BalanceCard from "./BalanceCard";
import WalletCard from "./WalletCard";

function HomeTab({
  wallet,
  balance,
  selectedNetwork,
}) {
  return (
    <div>
      <h1>Sendera</h1>

      <BalanceCard
        balance={balance}
        network={selectedNetwork}
      />

      <WalletCard wallet={wallet} />

      <PortfolioCard />

      <AIActionCard />

      <AIChatBox />
    </div>
  );
}

export default HomeTab;
