function BottomNav({ activeTab, setActiveTab }) {
  const items = [
    ["home", "Home"],
    ["send", "Send"],
    ["receive", "Receive"],
    ["tokens", "Tokens"],
    ["history", "History"],
    ["settings", "Settings"],
  ];

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20, background: "rgba(15,23,42,.97)", display: "flex", overflowX: "auto", padding: "10px 6px", borderTop: "1px solid #334155", backdropFilter: "blur(10px)" }}>
      {items.map(([id, label]) => (
        <button key={id} onClick={() => setActiveTab(id)} style={{ flex: "0 0 auto", minWidth: 64, padding: "8px 10px", background: "none", border: "none", color: activeTab === id ? "#22c55e" : "#e2e8f0", fontWeight: activeTab === id ? "bold" : "normal", fontSize: 11, cursor: "pointer" }}>
          {label}
        </button>
      ))}
    </div>
  );
}

export default BottomNav;
