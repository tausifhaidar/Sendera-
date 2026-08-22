const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const SUPPORTED_CHAINS = {
  "1": "Ethereum",
  "10": "OP Mainnet",
  "50": "XDC Network",
  "56": "BNB Smart Chain",
  "100": "Gnosis",
  "130": "Unichain",
  "137": "Polygon",
  "143": "Monad",
  "146": "Sonic",
  "204": "opBNB",
  "324": "zkSync Era",
  "999": "HyperEVM",
  "1284": "Moonbeam",
  "1285": "Moonriver",
  "5000": "Mantle",
  "8453": "Base",
  "59144": "Linea",
  "42220": "Celo",
  "43114": "Avalanche C-Chain",
  "534352": "Scroll",
  "80094": "Berachain",
  "81457": "Blast",
  "84532": "Base Sepolia",
  "11155111": "Ethereum Sepolia",
  "80002": "Polygon Amoy",
};

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "sendera-backend" });
});

async function explorerRequest(params) {
  if (!ETHERSCAN_API_KEY) throw new Error("Transaction history service is not configured");
  const url = new URL("https://api.etherscan.io/v2/api");
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  url.searchParams.set("apikey", ETHERSCAN_API_KEY);
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error("Explorer service unavailable");
  return data;
}

function validateAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(String(address || ""));
}

function validateChain(chainid) {
  return Boolean(SUPPORTED_CHAINS[String(chainid)]);
}

app.get("/api/transactions", async (req, res) => {
  const { address, chainid = "1" } = req.query;

  if (!validateAddress(address)) return res.status(400).json({ error: "Invalid wallet address" });
  if (!validateChain(chainid)) return res.status(400).json({ error: "Unsupported network" });

  try {
    const data = await explorerRequest({
      chainid,
      module: "account",
      action: "txlist",
      address,
      startblock: "0",
      endblock: "99999999",
      page: "1",
      offset: "50",
      sort: "desc",
    });

    if (data.status === "1" && Array.isArray(data.result)) {
      return res.json({ network: SUPPORTED_CHAINS[String(chainid)], transactions: data.result });
    }

    if (Array.isArray(data.result) && data.result.length === 0) {
      return res.json({ network: SUPPORTED_CHAINS[String(chainid)], transactions: [] });
    }

    return res.status(502).json({ error: "Unable to load transaction history" });
  } catch (error) {
    console.error("Transaction history error:", error.message);
    return res.status(502).json({ error: error.message || "Unable to load transaction history" });
  }
});

app.get("/api/token-holdings", async (req, res) => {
  const { address, chainid = "1", page = "1", offset = "100" } = req.query;

  if (!validateAddress(address)) return res.status(400).json({ error: "Invalid wallet address" });
  if (!validateChain(chainid)) return res.status(400).json({ error: "Unsupported network" });

  try {
    const data = await explorerRequest({
      chainid,
      module: "account",
      action: "addresstokenbalance",
      address,
      page,
      offset,
    });

    if (data.status === "1" && Array.isArray(data.result)) {
      const holdings = data.result.map((token) => ({
        address: token.TokenAddress,
        name: token.TokenName,
        symbol: token.TokenSymbol,
        decimals: Number(token.TokenDivisor || 18),
        balance: token.TokenQuantity || "0",
        priceUsd: Number(token.TokenPriceUSD || 0),
        network: SUPPORTED_CHAINS[String(chainid)],
      }));
      return res.json({ network: SUPPORTED_CHAINS[String(chainid)], holdings });
    }

    if (Array.isArray(data.result) && data.result.length === 0) {
      return res.json({ network: SUPPORTED_CHAINS[String(chainid)], holdings: [] });
    }

    return res.status(502).json({ error: data.result || "Unable to load token holdings" });
  } catch (error) {
    console.error("Token holdings error:", error.message);
    return res.status(502).json({ error: error.message || "Unable to load token holdings" });
  }
});

app.get("/api/token-transactions", async (req, res) => {
  const { address, contractaddress, chainid = "1" } = req.query;

  if (!validateAddress(address) || !validateAddress(contractaddress)) {
    return res.status(400).json({ error: "Invalid wallet or token contract address" });
  }
  if (!validateChain(chainid)) return res.status(400).json({ error: "Unsupported network" });

  try {
    const data = await explorerRequest({
      chainid,
      module: "account",
      action: "tokentx",
      address,
      contractaddress,
      startblock: "0",
      endblock: "99999999",
      page: "1",
      offset: "50",
      sort: "desc",
    });

    if (data.status === "1" && Array.isArray(data.result)) {
      return res.json({ network: SUPPORTED_CHAINS[String(chainid)], transactions: data.result });
    }

    if (Array.isArray(data.result) && data.result.length === 0) {
      return res.json({ network: SUPPORTED_CHAINS[String(chainid)], transactions: [] });
    }

    return res.status(502).json({ error: "Unable to load token history" });
  } catch (error) {
    console.error("Token history error:", error.message);
    return res.status(502).json({ error: error.message || "Unable to load token history" });
  }
});

app.listen(PORT, () => {
  console.log(`Sendera backend running on port ${PORT}`);
});
