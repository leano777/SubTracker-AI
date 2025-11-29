# 🔐 SubTracker AI - Login Troubleshooting Guide

## 🚨 Current Issue
**Problem**: After attempting to login, user is redirected back to the landing page instead of accessing the main application.

**Root Cause**: Authentication state not being properly set, likely due to:
1. Supabase authentication configuration
2. User account status (email confirmation, password issues)
3. Client-side authentication flow issues

---

## 🔍 Step-by-Step Debugging

### Step 1: Open Browser DevTools
1. Press `F12` or `Ctrl+Shift+I` (Windows)
2. Go to the **Console** tab
3. Clear any existing logs

### Step 2: Run Diagnostic Script
Copy and paste this into the Console:
```javascript
console.log("🔍 Auth Diagnostic");
console.log("Environment Check:");
console.log("- Supabase URL:", window.location.href.includes('ythtqafqwglruxzikipo.supabase.co') ? "Connected to correct instance" : "Check environment");

// Check localStorage for auth tokens
let authTokens = [];
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('auth') || key.includes('sb-'))) {
        authTokens.push(key);
    }
}
console.log("- Auth tokens found:", authTokens.length);
authTokens.forEach(key => console.log("  -", key));
```

### Step 3: Test Login Process
1. Switch to the **Network** tab in DevTools
2. Clear network log
3. Attempt to login with your credentials
4. Look for these patterns:

#### ✅ Expected Successful Flow:
```
Request to: ythtqafqwglruxzikipo.supabase.co/auth/v1/token?grant_type=password
Status: 200
Response: Contains access_token and refresh_token
```

#### ❌ Common Failure Patterns:

**Invalid Credentials:**
```
Status: 400
Response: {"error": "Invalid login credentials"}
```

**Unconfirmed Email:**
```
Status: 400  
Response: {"error": "Email not confirmed"}
```

**User Not Found:**
```
Status: 400
Response: {"error": "Invalid login credentials"}
```

### Step 4: Check Console for Auth Errors
Look for these messages in the Console:

#### ✅ Successful Auth Messages:
```
✅ Supabase client available, checking session...
✅ Active session found: your-email@domain.com
✅ User signed in: your-email@domain.com
```

#### ❌ Error Messages to Watch For:
```
❌ Session check error: [error details]
❌ Authentication service not available
❌ No active session
❌ Failed to initialize authentication
```

---

## 🛠️ Common Solutions

### Solution 1: Email Confirmation Required
**If you see "Email not confirmed" error:**

1. Check your email for confirmation link
2. Click the confirmation link
3. Try logging in again

### Solution 2: Password Reset
**If you're unsure about your password:**

1. Click "Forgot Password" on login form
2. Enter your email address
3. Check email for reset link
4. Set new password and try again

### Solution 3: Clear Auth Cache
**If authentication is stuck:**

```javascript
// Run in Console to clear auth cache
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Solution 4: Check User Account Exists
**To verify your account exists in Supabase:**

Go to your Supabase dashboard → Authentication → Users
Look for your email address in the user list

### Solution 5: Create New Account
**If account doesn't exist:**

1. Click "Sign Up" instead of "Sign In"  
2. Use the same email you thought you had an account with
3. Complete registration process

---

## 🔧 Advanced Troubleshooting

### Check Supabase Configuration
Run this in Console to verify connection:
```javascript
const testSupabaseConnection = async () => {
    try {
        const response = await fetch('https://ythtqafqwglruxzikipo.supabase.co/rest/v1/', {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0aHRxYWZxd2dscnV4emlraXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTYzMzMsImV4cCI6MjA2OTQ3MjMzM30.X1cTBeqts_b7MxcYzm8Gyhne8EJvqM-zLwaeQIU3o6o'
            }
        });
        console.log('✅ Supabase connection test:', response.ok ? 'SUCCESS' : 'FAILED');
    } catch (error) {
        console.log('❌ Connection error:', error.message);
    }
};
testSupabaseConnection();
```

### Manual Auth Test
Test authentication manually:
```javascript
// Only run this if you have the Supabase client available
const testLogin = async (email, password) => {
    if (window.supabase) {
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.log('❌ Login failed:', error.message);
        } else {
            console.log('✅ Login successful:', data.user.email);
        }
    }
};

// Usage: testLogin('your-email@domain.com', 'your-password');
```

---

## 📞 What to Report

When reporting the issue, include:

1. **Console Errors**: Any red error messages
2. **Network Failures**: Failed requests with status codes  
3. **Auth Diagnostic Results**: From the diagnostic script above
4. **Account Status**: Whether you remember creating an account
5. **Email Confirmation**: Whether you confirmed your email

---

## 🎯 Quick Actions to Try Right Now

### Option A: Reset and Try Fresh
```javascript
// Clear everything and start fresh
localStorage.clear();
sessionStorage.clear();
location.reload();
// Then try creating a new account
```

### Option B: Use Different Browser
- Try Chrome if you're using Firefox (or vice versa)
- Use incognito/private mode
- This helps identify cache/cookie issues

### Option C: Check Email
- Look for SubTracker or Supabase emails
- Check spam/junk folder
- Click any confirmation links

---

**Next Steps**: Try the solutions above and let me know what errors/messages you see!
