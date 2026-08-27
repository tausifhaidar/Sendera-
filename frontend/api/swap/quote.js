const NATIVE = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

const SUPPORTED = new Set([
  "1", "10", "137", "8453", "42161", "43114", "80094", "56", "999", "59144", "5000", "143", "146", "130", "534352",
]);

function isAddress(v) { return /^0x[a-fA-F0-9]{40}$/.test(String(v || "")); }
function isNative(v) { return String(v || "").toLowerCase() === NATIVE.toLowerCase(); }

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.ZEROX_API_KEY;
  const feeRecipient = process.env.SWAP_FEE_RECIPIENT;
  const { chainId, sellToken, buyToken, sellAmount, taker } = req.query || {};

  if (!key) return res.status(503).json({ error: "Swap aggregator is not configured" });
  if (!feeRecipient || !isAddress(feeRecipient)) return res.status(503).json({ error: "Sendera swap fee wallet is not configured" });
  if (!SUPPORTED.has(String(chainId))) return res.status(400).json({ error: "This EVM network is not supported by the swap aggregator yet" });
  if (!isAddress(sellToken) && !isNative(sellToken)) return res.status(400).json({ error: "Invalid sell token" });
  if (!isAddress(buyToken) && !isNative(buyToken)) return res.status(400).json({ error: "Invalid buy token" });
  if (!isAddress(taker)) return res.status(400).json({ error: "Invalid wallet address" });
  if (!/^\d+$/.test(String(sellAmount || ""))) return res.status(400).json({ error: "Invalid sell amount" });
  if (String(sellToken).toLowerCase() === String(buyToken).toLowerCase()) return res.status(400).json({ error: "Select two different tokens" });

  try {
    const url = new URL("https://api.0x.org/swap/allowance-holder/quote");
    url.searchParams.set("chainId", String(chainId));
    url.searchParams.set("sellToken", String(sellToken));
    url.searchParams.set("buyToken", String(buyToken));
    url.searchParams.set("sellAmount", String(sellAmount));
    url.searchParams.set("taker", String(taker));
    url.searchParams.set("slippageBps", "100");

    const feeToken = !isNative(sellToken) ? sellToken : (!isNative(buyToken) ? buyToken : null);
    if (feeToken) {
      url.searchParams.set("swapFeeRecipient", feeRecipient);
      url.searchParams.set("swapFeeBps", "30");
      url.searchParams.set("swapFeeToken", feeToken);
    }

    const response = await fetch(url, {
      headers: { "0x-api-key": key, "0x-version": "v2", "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status >= 400 && response.status < 500 ? response.status : 502).json({ error: data?.reason || data?.message || data?.validationErrors?.[0]?.reason || "Unable to find a swap route" });
    if (data?.liquidityAvailable === false) return res.status(404).json({ error: "No liquidity available for this token pair" });

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ...data, senderaFeeBps: feeToken ? 30 : 0, aggregator: "0x" });
  } catch (error) {
    return res.status(502).json({ error: error.message || "Swap service unavailable" });
  }
};
