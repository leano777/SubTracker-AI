# 🛠️ Quick Debug Guide for SubTracker AI

## Open Browser DevTools
**Windows**: `F12` or `Ctrl + Shift + I`  
**Mac**: `Cmd + Option + I`

## 1. 🔍 Check Console Tab
Look for:
- ✅ **Green/Info messages**: Normal operation
- ⚠️ **Yellow warnings**: Minor issues (usually okay)
- ❌ **Red errors**: Problems that need fixing

### Expected Messages:
```
✅ [stableUserId recalculated] user-id-123
✅ [themeValues recalculated] light
✅ Supabase auth initialized
```

### Problem Messages:
```
❌ Failed to fetch from Supabase
❌ Authentication error
❌ TypeError: Cannot read properties...
```

## 2. 🌐 Check Network Tab
Look for:
- ✅ **Status 200/201**: Successful API calls to Supabase
- ❌ **Status 401/403**: Authentication issues  
- ❌ **Status 500**: Server errors
- ❌ **Failed requests**: Connection problems

### Expected Requests:
- `ythtqafqwglruxzikipo.supabase.co/auth/v1/...`
- `ythtqafqwglruxzikipo.supabase.co/rest/v1/...`

## 3. 🎯 Quick Functionality Test
1. **Authentication**:
   - Look for Sign In/Sign Up buttons
   - Try to open auth modal
   
2. **Navigation**:
   - Check if tabs are visible (Dashboard, Planning, etc.)
   - Try clicking between tabs
   
3. **Theme**:
   - Look for theme switcher
   - Test light/dark theme toggle

## 4. 📱 Mobile Test
- Resize browser window to mobile size
- Check if interface adapts properly
- Test touch interactions
