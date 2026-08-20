const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const SUPPORTED_CHAINS = {
  "11155111": "Ethereum Sepolia",
  "84532": "Base Sepolia",
  "80002": "Polygon Amoy",
};

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "sendera-backend" });
});

app.get("/api/transactions", async (req, res) => {
  const { address, chainid = "11155111" } = req.query;

  if (!/^0x[a-fA-F0-9]{40}$/.test(String(address || ""))) {
    return res.status(400).json({ error: "Invalid wallet address" });
  }

  if (!SUPPORTED_CHAINS[String(chainid)]) {
    return res.status(400).json({ error: "Unsupported network" });
  }

  if (!ETHERSCAN_API_KEY) {
    return res.status(503).json({ error: "Transaction history service is not configured" });
  }

  try {
    const url = new URL("https://api.etherscan.io/v2/api");
    url.searchParams.set("chainid", String(chainid));
    url.searchParams.set("module", "account");
    url.searchParams.set("action", "txlist");
    url.searchParams.set("address", address);
    url.searchParams.set("startblock", "0");
    url.searchParams.set("endblock", "99999999");
    url.searchParams.set("page", "1");
    url.searchParams.set("offset", "25");
    url.searchParams.set("sort", "desc");
    url.searchParams.set("apikey", ETHERSCAN_API_KEY);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({ error: "Explorer service unavailable" });
    }

    if (data.status === "1") {
      return res.json({
        network: SUPPORTED_CHAINS[String(chainid)],
        transactions: data.result,
      });
    }

    if (Array.isArray(data.result) && data.result.length === 0) {
      return res.json({
        network: SUPPORTED_CHAINS[String(chainid)],
        transactions: [],
      });
    }

    return res.status(502).json({ error: "Unable to load transaction history" });
  } catch (error) {
    console.error("Transaction history error:", error.message);
    return res.status(502).json({ error: "Unable to load transaction history" });
  }
});

app.listen(PORT, () => {
  console.log(`Sendera backend running on port ${PORT}`);
});
