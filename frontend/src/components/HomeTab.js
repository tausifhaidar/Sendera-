import AIActionCard from "./AIActionCard";
import AIChatBox from "./AIChatBox";
import PortfolioCard from "./PortfolioCard";
import BalanceCard from "./BalanceCard";
import WalletCard from "./WalletCard";

function HomeTab({ wallet }) {
  return (
    <div>
      <h1>Sendera</h1>

      <BalanceCard
  balance="0.0000"
  network="Base Sepolia"
/>

      <WalletCard wallet={wallet} />

      <PortfolioCard />
      
      <AIActionCard />
  
      <AIChatBox />
    </div>
  );
}

export default HomeTab;
