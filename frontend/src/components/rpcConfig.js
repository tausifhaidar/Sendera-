export const NETWORKS = {
  ethereumSepolia: { name: "Ethereum Sepolia", symbol: "ETH", chainId: "11155111", rpc: "https://ethereum-sepolia-rpc.publicnode.com", explorer: "https://sepolia.etherscan.io/tx/", testnet: true },
  ethereum: { name: "Ethereum", symbol: "ETH", chainId: "1", rpc: "https://ethereum-rpc.publicnode.com", explorer: "https://etherscan.io/tx/", mainnet: true },
  base: { name: "Base", symbol: "ETH", chainId: "8453", rpc: "https://mainnet.base.org", explorer: "https://basescan.org/tx/", mainnet: true },
  arbitrum: { name: "Arbitrum One", symbol: "ETH", chainId: "42161", rpc: "https://arb1.arbitrum.io/rpc", explorer: "https://arbiscan.io/tx/", mainnet: true },
  optimism: { name: "OP Mainnet", symbol: "ETH", chainId: "10", rpc: "https://mainnet.optimism.io", explorer: "https://optimistic.etherscan.io/tx/", mainnet: true },
  polygon: { name: "Polygon", symbol: "POL", chainId: "137", rpc: "https://polygon.drpc.org", explorer: "https://polygonscan.com/tx/", mainnet: true },
  bsc: { name: "BNB Smart Chain", symbol: "BNB", chainId: "56", rpc: "https://bsc-dataseed1.bnbchain.org", explorer: "https://bscscan.com/tx/", mainnet: true },
  avalanche: { name: "Avalanche C-Chain", symbol: "AVAX", chainId: "43114", rpc: "https://api.avax.network/ext/bc/C/rpc", explorer: "https://avascan.info/blockchain/c/tx/", mainnet: true },
  linea: { name: "Linea", symbol: "ETH", chainId: "59144", rpc: "https://rpc.linea.build", explorer: "https://lineascan.build/tx/", mainnet: true },
  scroll: { name: "Scroll", symbol: "ETH", chainId: "534352", rpc: "https://rpc.scroll.io", explorer: "https://scrollscan.com/tx/", mainnet: true },
  zksync: { name: "zkSync Era", symbol: "ETH", chainId: "324", rpc: "https://mainnet.era.zksync.io", explorer: "https://explorer.zksync.io/tx/", mainnet: true },
  blast: { name: "Blast", symbol: "ETH", chainId: "81457", rpc: "https://rpc.blast.io", explorer: "https://blastscan.io/tx/", mainnet: true },
  mantle: { name: "Mantle", symbol: "MNT", chainId: "5000", rpc: "https://rpc.mantle.xyz", explorer: "https://mantlescan.xyz/tx/", mainnet: true },
  gnosis: { name: "Gnosis", symbol: "xDAI", chainId: "100", rpc: "https://rpc.gnosischain.com", explorer: "https://gnosisscan.io/tx/", mainnet: true },
  celo: { name: "Celo", symbol: "CELO", chainId: "42220", rpc: "https://forno.celo.org", explorer: "https://celoscan.io/tx/", mainnet: true },
  moonbeam: { name: "Moonbeam", symbol: "GLMR", chainId: "1284", rpc: "https://rpc.api.moonbeam.network", explorer: "https://moonscan.io/tx/", mainnet: true },
  moonriver: { name: "Moonriver", symbol: "MOVR", chainId: "1285", rpc: "https://rpc.api.moonriver.moonbeam.network", explorer: "https://moonriver.moonscan.io/tx/", mainnet: true },
  opbnb: { name: "opBNB", symbol: "BNB", chainId: "204", rpc: "https://opbnb-mainnet-rpc.bnbchain.org", explorer: "https://opbnbscan.com/tx/", mainnet: true },
  sonic: { name: "Sonic", symbol: "S", chainId: "146", rpc: "https://rpc.soniclabs.com", explorer: "https://sonicscan.org/tx/", mainnet: true },
  unichain: { name: "Unichain", symbol: "ETH", chainId: "130", rpc: "https://mainnet.unichain.org", explorer: "https://uniscan.xyz/tx/", mainnet: true },
  berachain: { name: "Berachain", symbol: "BERA", chainId: "80094", rpc: "https://rpc.berachain.com", explorer: "https://berascan.com/tx/", mainnet: true },
  monad: { name: "Monad", symbol: "MON", chainId: "143", rpc: "https://rpc.monad.xyz", explorer: "https://monadscan.com/tx/", mainnet: true },
  hyperevm: { name: "HyperEVM", symbol: "HYPE", chainId: "999", rpc: "https://rpc.hyperliquid.xyz/evm", explorer: "https://www.hyperscan.com/tx/", mainnet: true },
  xdc: { name: "XDC Network", symbol: "XDC", chainId: "50", rpc: "https://rpc.xinfin.network", explorer: "https://xdcscan.io/tx/", mainnet: true },
  baseSepolia: { name: "Base Sepolia", symbol: "ETH", chainId: "84532", rpc: "https://sepolia.base.org", explorer: "https://sepolia.basescan.org/tx/", testnet: true },
  polygonAmoy: { name: "Polygon Amoy", symbol: "POL", chainId: "80002", rpc: "https://rpc-amoy.polygon.technology", explorer: "https://amoy.polygonscan.com/tx/", testnet: true },
};

export const NETWORK_LIST = Object.entries(NETWORKS).map(([key, value]) => ({ key, ...value }));
export const MAINNETS = NETWORK_LIST.filter((network) => network.mainnet);
export const TESTNETS = NETWORK_LIST.filter((network) => network.testnet);

// Compatibility bridge for the existing history hook: old App code only knows the original testnet chain map.
// When a newly added EVM mainnet is selected, rewrite an undefined chainid in the history URL from the persisted network.
if (typeof window !== "undefined" && !window.__senderaNetworkFetchPatched) {
  window.__senderaNetworkFetchPatched = true;
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    try {
      const rawUrl = typeof input === "string" ? input : input?.url;
      if (rawUrl && /\/api\/(transactions|token-transactions)/.test(rawUrl) && /chainid=undefined(?:&|$)/.test(rawUrl)) {
        const saved = localStorage.getItem("sendera_selected_network");
        const replacement = NETWORKS[saved]?.chainId;
        if (replacement) input = rawUrl.replace("chainid=undefined", `chainid=${replacement}`);
      }
    } catch {}
    return nativeFetch(input, init);
  };
}
