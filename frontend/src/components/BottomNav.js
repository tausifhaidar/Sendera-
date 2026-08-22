function BottomNav({ activeTab, setActiveTab }) {
  const items = [
    { key: "home", icon: "⌂", label: "Home" },
    { key: "tokens", icon: "◈", label: "Tokens" },
    { key: "history", icon: "◷", label: "Activity" },
    { key: "ai", icon: "✦", label: "AI" },
    { key: "settings", icon: "⚙", label: "Settings" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 12,
        left: 10,
        right: 10,
        zIndex: 50,
        background: "linear-gradient(180deg, rgba(7,15,39,.92), rgba(5,11,29,.97))",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(110,91,210,.35)",
        borderRadius: 24,
        display: "flex",
        justifyContent: "space-around",
        padding: "8px 5px",
        boxShadow: "0 18px 50px rgba(0,0,0,.45), 0 0 35px rgba(79,70,229,.10)",
      }}
    >
      {items.map((item) => {
        const active = activeTab === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            aria-label={item.label}
            style={{
              flex: 1,
              minWidth: 0,
              border: active ? "1px solid rgba(139,92,246,.35)" : "1px solid transparent",
              background: active ? "linear-gradient(180deg, rgba(124,58,237,.26), rgba(37,99,235,.10))" : "transparent",
              color: active ? "#f3f0ff" : "#8390aa",
              borderRadius: 17,
              padding: "8px 2px 7px",
              cursor: "pointer",
              boxShadow: active ? "0 0 24px rgba(124,58,237,.18)" : "none",
            }}
          >
            <div style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</div>
            <div style={{ fontSize: 9, marginTop: 5, fontWeight: active ? 800 : 500 }}>{item.label}</div>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
