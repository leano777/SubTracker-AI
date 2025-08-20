# 🧪 Manual Testing Checklist - Phase 5 QA

**Test Date**: 2025-08-19  
**App Version**: Post-TypeScript fixes  
**Test URL**: http://localhost:5178  
**Status**: ✅ Ready for manual testing

---

## 🎯 **Critical User Flows** (Must Pass)

### 1. 🚀 **App Startup & Navigation**
- [ ] **Landing Page Loads**
  - Page renders without white screen
  - No console errors in DevTools (F12)
  - Background and UI elements visible
  
- [ ] **Tab Navigation**
  - Click through all main tabs: Dashboard, Intelligence, Budget, Planning, etc.
  - No white screens on tab switching
  - Each tab loads content properly
  
- [ ] **Responsive Design**
  - Test on different screen sizes (resize browser)
  - Mobile layout works (< 768px width)
  - Touch-friendly on mobile devices

---

## 💳 **Core Functionality Tests**

### 2. 📊 **Subscription Management**
- [ ] **Add New Subscription**
  - Click "Add Subscription" button
  - Fill out subscription form (name, cost, billing cycle)
  - Submit successfully
  - New subscription appears in list
  
- [ ] **Edit Subscription**
  - Click edit button on existing subscription
  - Modify details (cost, billing cycle, etc.)
  - Save changes
  - Changes persist and display correctly
  
- [ ] **Delete Subscription**
  - Click delete button
  - Confirm deletion in modal
  - Subscription removed from list

### 3. 💰 **Payment Cards**
- [ ] **Add Payment Card** (Fixed in our session)
  - Navigate to payment cards section
  - Click "Add Card"
  - Fill form including nickname, last 4 digits
  - **NEW**: Check "Set as default" checkbox
  - Submit successfully
  - Card appears in list with default indicator
  
- [ ] **Edit Payment Card**
  - Click edit on existing card
  - Modify details
  - **NEW**: Toggle default setting
  - Save changes
  - Changes persist correctly

### 4. 🏦 **Budget Features**
- [ ] **Budget Pods**
  - Navigate to Budget tab
  - View existing budget pods (Vehicle, Rent, Food, etc.)
  - Check balance calculations
  - Test pod allocation settings
  
- [ ] **Income Setup Wizard**
  - Access income setup wizard
  - Fill out income source details
  - Complete pay period setup
  - Review final calculations

### 5. 📈 **Variable Pricing** (Fixed in our session)
- [ ] **Variable Subscription**
  - Create subscription with "variable" billing cycle
  - Add upcoming price changes
  - **NEW**: Verify cost amounts are numbers (not strings)
  - Check price change displays properly
  
- [ ] **Price Change Calculations**
  - View subscriptions with upcoming changes
  - Verify price increase/decrease indicators
  - Check formatted currency displays

---

## 🔧 **Technical Validation**

### 6. 💾 **Data Persistence**
- [ ] **LocalStorage**
  - Add subscription, refresh page
  - Data should persist across browser refresh
  - No data loss on tab switching
  
- [ ] **Form Validation**
  - Submit forms with missing required fields
  - Appropriate error messages display
  - Cannot submit invalid data

### 7. 🎨 **UI/UX Polish**
- [ ] **Theme Support**
  - Switch between light/dark themes (if available)
  - Colors and contrast appropriate
  - No visual glitches
  
- [ ] **Loading States**
  - Forms show loading during submission
  - Data loads smoothly without jarring transitions

---

## 🚨 **Error Scenarios** (Edge Cases)

### 8. 🐛 **Error Handling**
- [ ] **Invalid Data**
  - Enter extremely large numbers
  - Enter negative values where inappropriate
  - Enter special characters in number fields
  
- [ ] **Browser Compatibility**
  - Test in Chrome (primary)
  - Test in Firefox (secondary)
  - Test in Safari/Edge (if available)

---

## ✅ **Pass Criteria**

### **Green Light for Production**
- [ ] All critical user flows work without errors
- [ ] No console errors in normal usage
- [ ] Data persists correctly
- [ ] Forms submit and validate properly
- [ ] **TypeScript fixes work**: No runtime type errors
- [ ] **Payment card isDefault** works properly
- [ ] **Variable pricing** displays correctly

### **Red Flags (Must Fix)**
- ❌ White screens on navigation
- ❌ Console errors on normal usage
- ❌ Form submissions failing
- ❌ Data loss on refresh
- ❌ Critical features not working

---

## 📋 **Testing Instructions**

1. **Open Development Server**: http://localhost:5178
2. **Open DevTools**: Press F12 to monitor console
3. **Work Through Checklist**: Test each item systematically
4. **Document Issues**: Note any problems found
5. **Verify Fixes**: Confirm our TypeScript fixes work in practice

---

## 🎯 **Focus Areas** (Our Recent Fixes)

### **High Priority Testing**
1. **Payment Card Forms**: Test isDefault checkbox functionality
2. **Variable Pricing**: Verify number types work correctly
3. **Navigation**: Ensure no TypeScript errors cause runtime issues
4. **Form Submissions**: All forms should work without type errors

**Expected Result**: All functionality should work smoothly with zero TypeScript-related runtime errors!

---

*Manual testing should take approximately 30-45 minutes for full coverage.*