// Debug utility to check environment variables
export const debugEnv = () => {
  console.log("=== ENVIRONMENT VARIABLES DEBUG ===");
  console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
  console.log(
    "VITE_SUPABASE_ANON_KEY (first 20 chars):",
    `${import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20)}...`
  );
  console.log("NODE_ENV:", import.meta.env.MODE);
  console.log("All env vars:", import.meta.env);
  console.log("====================================");
};
