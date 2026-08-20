import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { NETWORKS } from "./rpcConfig";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

const EXPLORERS = {
  baseSepolia: "https://sepolia.basescan.org/tx/",
  ethereumSepolia: "https://sepolia.etherscan.io/tx/",
  polygonAmoy: "https://amoy.polygonscan.com/tx/",
};

function networkName(network) {
  return NETWORKS[network]?.name || network;
}

function TokenTab({ wallet, selectedNetwork }) {
  const [tokens, setTokens] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sendera_tokens") || "[]");
    } catch {
      return [];
    }
  });
  const [contract, setContract] = useState("");
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState({});
  const [tokenHistory, setTokenHistory] = useState({});
  const [sendForm, setSendForm] = useState({});
  const [sending, setSending] = useState("");

  const chainId = useMemo(() => ({
    baseSepolia: "84532",
    ethereumSepolia: "11155111",
    polygonAmoy: "80002",
  }[selectedNetwork]), [selectedNetwork]);

  function persist(next) {
    setTokens(next);
    localStorage.setItem("sendera_tokens", JSON.stringify(next));
  }

  async function addToken() {
    if (!wallet || !ethers.isAddress(contract)) {
      alert("Enter a valid ERC-20 token contract address.");
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.JsonRpcProvider(NETWORKS[selectedNetwork].rpc);
      const token = new ethers.Contract(contract, ERC20_ABI, provider);
      const [name, symbol, decimals] = await Promise.all([
        token.name(),
        token.symbol(),
        token.decimals(),
      ]);

      const item = {
        address: contract,
        name,
        symbol,
        decimals: Number(decimals),
        network: selectedNetwork,
      };

      const next = [
        item,
        ...tokens.filter(
          (t) => !(t.address.toLowerCase() === contract.toLowerCase() && t.network === selectedNetwork)
        ),
      ];
      persist(next);
      setContract("");
    } catch (error) {
      console.error(error);
      alert("Unable to read this token contract on the selected network.");
    } finally {
      setLoading(false);
    }
  }

  async function refreshToken(token) {
    if (!wallet) return;
    try {
      const provider = new ethers.JsonRpcProvider(NETWORKS[selectedNetwork].rpc);
      const contractInstance = new ethers.Contract(token.address, ERC20_ABI, provider);
      const raw = await contractInstance.balanceOf(wallet.address);
      setBalances((previous) => ({
        ...previous,
        [`${selectedNetwork}:${token.address}`]: ethers.formatUnits(raw, token.decimals),
      }));
    } catch (error) {
      console.log("Token balance error:", error.message);
    }
  }

  async function refreshHistory(token) {
    if (!wallet || !process.env.REACT_APP_BACKEND_URL || !chainId) return;
    try {
      const url = `${process.env.REACT_APP_BACKEND_URL.replace(/\/$/, "")}/api/token-transactions?address=${encodeURIComponent(wallet.address)}&contractaddress=${encodeURIComponent(token.address)}&chainid=${chainId}`;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) return;
      setTokenHistory((previous) => ({
        ...previous,
        [`${selectedNetwork}:${token.address}`]: data.transactions || [],
      }));
    } catch (error) {
      console.log("Token history error:", error.message);
    }
  }

  async function sendToken(token) {
    const key = `${selectedNetwork}:${token.address}`;
    const form = sendForm[key] || {};
    if (!wallet || !ethers.isAddress(form.to || "") || !form.amount || Number(form.amount) <= 0) {
      alert("Enter a valid recipient and token amount.");
      return;
    }

    try {
      setSending(key);
      const provider = new ethers.JsonRpcProvider(NETWORKS[selectedNetwork].rpc);
      const signer = wallet.connect(provider);
      const tokenContract = new ethers.Contract(token.address, ERC20_ABI, signer);
      const value = ethers.parseUnits(String(form.amount), token.decimals);
      const gas = await tokenContract.transfer.estimateGas(form.to, value);
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice ?? feeData.maxFeePerGas;
      const estimatedFee = gasPrice ? gas * gasPrice : 0n;
      const nativeBalance = await provider.getBalance(wallet.address);
      if (gasPrice && nativeBalance < estimatedFee) {
        throw new Error("Insufficient native balance for gas fees.");
      }

      const tx = await tokenContract.transfer(form.to, value, { gasLimit: gas });
      await tx.wait();
      alert(`Token transaction successful!\n\nHash:\n${tx.hash}`);
      setSendForm((previous) => ({ ...previous, [key]: { to: "", amount: "" } }));
      await refreshToken(token);
      await refreshHistory(token);
    } catch (error) {
      console.error(error);
      if (error?.code === "ACTION_REJECTED") {
        alert("Transaction cancelled by user.");
      } else {
        alert(error?.shortMessage || error?.message || "Token transaction failed.");
      }
    } finally {
      setSending("");
    }
  }

  useEffect(() => {
    const current = tokens.filter((token) => token.network === selectedNetwork);
    current.forEach((token) => {
      refreshToken(token);
      refreshHistory(token);
    });
  }, [selectedNetwork, wallet]);

  const currentTokens = tokens.filter((token) => token.network === selectedNetwork);

  return (
    <div>
      <h2>Tokens</h2>
      <p style={{ color: "#94a3b8", marginTop: 5 }}>{networkName(selectedNetwork)}</p>

      <div style={{ background: "#0f172a", padding: 20, borderRadius: 16, marginTop: 20 }}>
        <p style={{ color: "#94a3b8" }}>Import ERC-20 Token</p>
        <input
          value={contract}
          onChange={(e) => setContract(e.target.value)}
          placeholder="Token contract 0x..."
          style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: "#1e293b", color: "white", boxSizing: "border-box" }}
        />
        <button onClick={addToken} disabled={loading} style={{ width: "100%", padding: 13, marginTop: 12, border: "none", borderRadius: 12, background: "#22c55e", color: "white", fontWeight: "bold" }}>
          {loading ? "Reading Token..." : "Import Token"}
        </button>
      </div>

      {currentTokens.length === 0 ? (
        <div style={{ background: "#0f172a", padding: 20, borderRadius: 16, marginTop: 20, color: "#94a3b8", textAlign: "center" }}>
          No tokens imported on this network.
        </div>
      ) : (
        currentTokens.map((token) => {
          const key = `${selectedNetwork}:${token.address}`;
          const history = tokenHistory[key] || [];
          const form = sendForm[key] || { to: "", amount: "" };
          return (
            <div key={key} style={{ background: "#0f172a", padding: 18, borderRadius: 16, marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <strong>{token.name}</strong>
                  <p style={{ color: "#94a3b8", margin: "5px 0" }}>{token.symbol}</p>
                </div>
                <strong>{Number(balances[key] || 0).toFixed(4)} {token.symbol}</strong>
              </div>

              <p style={{ fontSize: 11, color: "#64748b", wordBreak: "break-all" }}>{token.address}</p>

              <input
                value={form.to}
                onChange={(e) => setSendForm((previous) => ({ ...previous, [key]: { ...form, to: e.target.value } }))}
                placeholder="Recipient 0x..."
                style={{ width: "100%", padding: 11, borderRadius: 10, border: "none", background: "#1e293b", color: "white", boxSizing: "border-box", marginTop: 8 }}
              />
              <input
                value={form.amount}
                onChange={(e) => setSendForm((previous) => ({ ...previous, [key]: { ...form, amount: e.target.value } }))}
                placeholder={`Amount ${token.symbol}`}
                type="number"
                style={{ width: "100%", padding: 11, borderRadius: 10, border: "none", background: "#1e293b", color: "white", boxSizing: "border-box", marginTop: 8 }}
              />
              <button onClick={() => sendToken(token)} disabled={sending === key} style={{ width: "100%", padding: 12, marginTop: 10, border: "none", borderRadius: 10, background: "#2563eb", color: "white", fontWeight: "bold" }}>
                {sending === key ? "Sending..." : `Send ${token.symbol}`}
              </button>

              <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 18 }}>Recent Token Transfers</p>
              {history.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: 12 }}>No token transfers found.</p>
              ) : (
                history.slice(0, 5).map((tx) => {
                  const received = String(tx.to || "").toLowerCase() === wallet?.address?.toLowerCase();
                  const amount = (() => {
                    try { return Number(ethers.formatUnits(tx.value || "0", Number(tx.tokenDecimal || token.decimals))).toFixed(4); } catch { return "0"; }
                  })();
                  return (
                    <div key={tx.hash} style={{ background: "#111827", padding: 10, borderRadius: 10, marginTop: 8 }}>
                      <strong style={{ color: received ? "#22c55e" : "#60a5fa" }}>{received ? "Received" : "Sent"} {amount} {token.symbol}</strong>
                      <p style={{ fontSize: 11, color: "#94a3b8", wordBreak: "break-all", marginBottom: 5 }}>{tx.hash}</p>
                      <a href={`${EXPLORERS[selectedNetwork]}${tx.hash}`} target="_blank" rel="noreferrer" style={{ color: "white", fontSize: 12 }}>View on Explorer</a>
                    </div>
                  );
                })
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default TokenTab;
