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
        borderTop:
          "1px solid #334155",
      }}
    >
      <button
        onClick={() =>
          setActiveTab("home")
        }
      >
        Home
      </button>

      <button
        onClick={() =>
          setActiveTab("receive")
        }
      >
        Receive
      </button>

      <button
        onClick={() =>
          setActiveTab("history")
        }
      >
        History
      </button>

      <button
        onClick={() =>
          setActiveTab("settings")
        }
      >
        Settings
      </button>
    </div>
  );
}

export default BottomNav;
