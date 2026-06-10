function BottomNav({
  activeTab,
  setActiveTab,
}) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#0f172a",
        display: "flex",
        justifyContent: "space-around",
        padding: 15,
        borderTop: "1px solid #334155",
      }}
    >
      <button
        onClick={() => setActiveTab("home")}
        style={{
          background: "none",
          border: "none",
          color:
            activeTab === "home"
              ? "#22c55e"
              : "white",
        }}
      >
        Home
      </button>

      <button
        onClick={() => setActiveTab("send")}
        style={{
          background: "none",
          border: "none",
          color:
            activeTab === "send"
              ? "#22c55e"
              : "white",
        }}
      >
        Send
      </button>

      <button
        onClick={() =>
          setActiveTab("receive")
        }
        style={{
          background: "none",
          border: "none",
          color:
            activeTab === "receive"
              ? "#22c55e"
              : "white",
        }}
      >
        Receive
      </button>

      <button
        onClick={() =>
          setActiveTab("history")
        }
        style={{
          background: "none",
          border: "none",
          color:
            activeTab === "history"
              ? "#22c55e"
              : "white",
        }}
      >
        History
      </button>

      <button
        onClick={() =>
          setActiveTab("settings")
        }
        style={{
          background: "none",
          border: "none",
          color:
            activeTab === "settings"
              ? "#22c55e"
              : "white",
        }}
      >
        Settings
      </button>
    </div>
  );
}

export default BottomNav;
