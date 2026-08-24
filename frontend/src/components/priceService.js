import { NETWORKS } from "./rpcConfig";

const NATIVE_COINGECKO_IDS = {
  ethereum: "ethereum",
  base: "ethereum",
  arbitrum: "ethereum",
  optimism: "ethereum",
  linea: "ethereum",
  scroll: "ethereum",
  zksync: "ethereum",
  blast: "ethereum",
  unichain: "ethereum",
  polygon: "matic-network",
  bsc: "binancecoin",
  avalanche: "avalanche-2",
  mantle: "mantle",
  gnosis: "xdai",
  celo: "celo",
  moonbeam: "moonbeam",
  moonriver: "moonriver",
  opbnb: "binancecoin",
  sonic: "sonic-3",
  berachain: "berachain-bera",
  monad: "monad",
  hyperevm: "hyperliquid",
  xdc: "xdce-crowd-sale",
};

const DEX_CHAIN_IDS = {
  ethereum: "ethereum",
  base: "base",
  arbitrum: "arbitrum",
  optimism: "optimism",
  polygon: "polygon",
  bsc: "bsc",
  avalanche: "avalanche",
  linea: "linea",
  scroll: "scroll",
  zksync: "zksync",
  blast: "blast",
  mantle: "mantle",
  gnosis: "gnosis",
  celo: "celo",
  moonbeam: "moonbeam",
  moonriver: "moonriver",
  opbnb: "opbnb",
  sonic: "sonic",
  unichain: "unichain",
  berachain: "berachain",
  monad: "monad",
  hyperevm: "hyperevm",
  xdc: "xdc",
};

export async function fetchNativeUsdPrice(networkKey) {
  const coinId = NATIVE_COINGECKO_IDS[networkKey];
  if (!coinId) return null;
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=usd`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Native price service unavailable");
  const data = await response.json();
  const value = Number(data?.[coinId]?.usd || 0);
  return value > 0 ? value : null;
}

export async function fetchTokenUsdPrice(networkKey, contractAddress) {
  if (!NETWORKS[networkKey] || !contractAddress) return null;
  const chainId = DEX_CHAIN_IDS[networkKey];
  if (!chainId) return null;
  const address = String(contractAddress).trim().toLowerCase();
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
    if (!response.ok) return null;
    const data = await response.json();
    const pairs = Array.isArray(data?.pairs) ? data.pairs : [];
    const matching = pairs.filter((pair) => String(pair.chainId).toLowerCase() === chainId);
    if (!matching.length) return null;
    matching.sort((a, b) => Number(b?.liquidity?.usd || 0) - Number(a?.liquidity?.usd || 0));
    const price = Number(matching[0]?.priceUsd || 0);
    return price > 0 ? price : null;
  } catch {
    return null;
  }
}

export function formatUsd(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  if (number === 0) return "$0.00";
  if (number < 0) return "—";
  if (number >= 1000) return `$${number.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (number >= 1) return `$${number.toFixed(2)}`;
  if (number >= 0.01) return `$${number.toFixed(4)}`;
  return `$${number.toPrecision(4)}`;
}
