function BottomNav({ activeTab, setActiveTab }) {
  const items = [
    { key: "home", icon: "⌂", label: "Home" },
    { key: "send", icon: "↑", label: "Send" },
    { key: "receive", icon: "↓", label: "Receive" },
    { key: "tokens", icon: "◈", label: "Tokens" },
    { key: "history", icon: "◷", label: "Activity" },
    { key: "settings", icon: "⚙", label: "Settings" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 10,
        left: 10,
        right: 10,
        zIndex: 50,
        background: "rgba(10,17,31,.94)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid #243047",
        borderRadius: 22,
        display: "flex",
        justifyContent: "space-around",
        padding: "8px 4px",
        boxShadow: "0 14px 35px rgba(0,0,0,.35)",
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
              border: 0,
              background: active ? "#17233a" : "transparent",
              color: active ? "#60a5fa" : "#7f8da3",
              borderRadius: 15,
              padding: "7px 2px 6px",
              cursor: "pointer",
              transition: "all .18s ease",
            }}
          >
            <div style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</div>
            <div style={{ fontSize: 9, marginTop: 5, fontWeight: active ? 700 : 500 }}>
              {item.label}
            </div>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
