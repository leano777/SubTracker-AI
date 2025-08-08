// Debug Authentication Issues
// Run this in browser console to diagnose auth problems

console.log("🔍 SubTracker AI - Authentication Debug");
console.log("=====================================");

// 1. Check Environment Variables
console.log("\n1. Environment Variables:");
console.log("VITE_SUPABASE_URL:", import.meta?.env?.VITE_SUPABASE_URL || "Not found");
console.log("VITE_SUPABASE_ANON_KEY:", import.meta?.env?.VITE_SUPABASE_ANON_KEY ? "Present" : "Not found");

// 2. Check Local Storage for Auth Tokens
console.log("\n2. Local Storage Auth Tokens:");
const authKeys = [];
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('auth') || key.includes('sb-'))) {
        const value = localStorage.getItem(key);
        console.log(`${key}: ${value ? `${value.substring(0, 50)}...` : 'null'}`);
        authKeys.push(key);
    }
}
if (authKeys.length === 0) {
    console.log("No auth tokens found in localStorage");
}

// 3. Check Supabase Client Status
console.log("\n3. Supabase Client Status:");
try {
    // Check if supabase is available globally
    if (window.supabase) {
        console.log("✅ Supabase client available globally");
        console.log("Supabase URL:", window.supabase.supabaseUrl);
    } else {
        console.log("❌ Supabase client not available globally");
    }
} catch (error) {
    console.log("❌ Error checking Supabase client:", error.message);
}

// 4. Check Current Auth State
console.log("\n4. Current Auth State:");
try {
    // This will work if supabase is available
    const checkAuth = async () => {
        if (window.supabase) {
            const { data: { session }, error } = await window.supabase.auth.getSession();
            
            if (error) {
                console.log("❌ Auth session error:", error.message);
            } else if (session) {
                console.log("✅ Active session found:");
                console.log("User ID:", session.user.id);
                console.log("Email:", session.user.email);
                console.log("Email confirmed:", session.user.email_confirmed_at ? "Yes" : "No");
            } else {
                console.log("❌ No active session");
            }
        }
    };
    checkAuth();
} catch (error) {
    console.log("❌ Error checking auth state:", error.message);
}

// 5. Network Check - Test Supabase Connection
console.log("\n5. Testing Supabase Connection:");
const testConnection = async () => {
    try {
        const supabaseUrl = "https://ythtqafqwglruxzikipo.supabase.co";
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'GET',
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0aHRxYWZxd2dscnV4emlraXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTYzMzMsImV4cCI6MjA2OTQ3MjMzM30.X1cTBeqts_b7MxcYzm8Gyhne8EJvqM-zLwaeQIU3o6o'
            }
        });
        
        if (response.ok) {
            console.log("✅ Supabase connection successful");
            console.log("Status:", response.status);
        } else {
            console.log("❌ Supabase connection failed");
            console.log("Status:", response.status);
            console.log("Response:", await response.text());
        }
    } catch (error) {
        console.log("❌ Network error:", error.message);
    }
};
testConnection();

// 6. Instructions
console.log("\n6. Next Steps:");
console.log("================");
console.log("If you see authentication issues:");
console.log("1. Check if your existing user account email matches what you're trying to login with");
console.log("2. Try the 'Forgot Password' flow to reset your password");
console.log("3. Check if email confirmation is required");
console.log("4. Look for red errors in the Console tab");
console.log("5. Check Network tab for failed API calls");

console.log("\nTo test login manually:");
console.log("1. Open Network tab in DevTools");
console.log("2. Try to login");
console.log("3. Look for requests to ythtqafqwglruxzikipo.supabase.co");
console.log("4. Check if any return 400/401/500 errors");
