import { useState } from "react";

const TestApp = () => {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>SubTracker AI - Test Mode</h1>
      <p>If you can see this and click the button, React is working:</p>
      <button
        onClick={() => setCount(count + 1)}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
      >
        Count: {count}
      </button>
      <div style={{ marginTop: "20px" }}>
        <h2>Environment Variables:</h2>
        <p>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? "✅ Loaded" : "❌ Missing"}</p>
        <p>VITE_ENABLE_DEBUG: {import.meta.env.VITE_ENABLE_DEBUG}</p>
        <p>VITE_TEST_MODE: {import.meta.env.VITE_TEST_MODE}</p>
      </div>
    </div>
  );
};

export default TestApp;
