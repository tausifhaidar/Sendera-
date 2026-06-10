function AIChatBox() {
  return (
    <div
      style={{
        background: "#0f172a",
        padding: 20,
        borderRadius: 16,
        marginTop: 20,
      }}
    >
      <h3>AI Assistant</h3>

      <input
        placeholder="Ask Sendera..."
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 12,
          border: "none",
          background: "#1e293b",
          color: "white",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

export default AIChatBox;
