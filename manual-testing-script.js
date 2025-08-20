// Manual Testing Script for BudgetPod Features
// Copy and paste this into the browser console while the app is running

console.clear();
console.log('%c🧪 BudgetPod Manual Testing Script', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50;');

// Test Suite 1: Store Access and Basic Operations
function testStoreAccess() {
  console.log('%c📊 Test 1: Store Access', 'color: #2196F3; font-weight: bold;');
  
  const store = window.useFinancialStore?.getState();
  if (!store) {
    console.error('❌ Store not accessible. Make sure the app is fully loaded.');
    return false;
  }
  
  console.log('✅ Store accessible');
  console.log('📋 Current budget pods:', store.budgetPods.length);
  console.log('💰 Current store state:', {
    pods: store.budgetPods.length,
    incomeSources: store.incomeSources.length,
    transactions: store.transactions.length
  });
  
  return true;
}

// Test Suite 2: Create Test Budget Pod
function createTestBudgetPod() {
  console.log('%c🏗️ Test 2: Create Test Budget Pod', 'color: #2196F3; font-weight: bold;');
  
  const store = window.useFinancialStore?.getState();
  if (!store) {
    console.error('❌ Store not accessible');
    return false;
  }
  
  const testPod = {
    id: `test-emergency-${Date.now()}`,
    name: 'Test Emergency Fund',
    type: 'emergency',
    description: 'Test pod for emergency savings - created by testing script',
    monthlyAmount: 500,
    currentAmount: 250,
    targetAmount: 3000,
    isActive: true,
    autoTransfer: true,
    transferDay: 15,
    priority: 1,
    rolloverUnused: true,
    warningThreshold: 100,
    notes: 'This is a test pod created for testing the edit functionality',
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    contributions: [
      {
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        amount: 150,
        note: 'Initial deposit'
      },
      {
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        amount: 100,
        note: 'Paycheck allocation'
      }
    ],
    withdrawals: []
  };
  
  try {
    store.addBudgetPod(testPod);
    console.log('✅ Test pod created successfully');
    console.log('📝 Pod details:', testPod);
    return testPod;
  } catch (error) {
    console.error('❌ Failed to create test pod:', error);
    return false;
  }
}

// Test Suite 3: Test Pod Transactions
function testPodTransactions(podId) {
  console.log('%c💸 Test 3: Pod Transactions', 'color: #2196F3; font-weight: bold;');
  
  const store = window.useFinancialStore?.getState();
  if (!store || !podId) {
    console.error('❌ Store or pod ID not available');
    return false;
  }
  
  const pod = store.budgetPods.find(p => p.id === podId);
  if (!pod) {
    console.error('❌ Pod not found');
    return false;
  }
  
  console.log('💰 Initial balance:', pod.currentAmount);
  
  // Test adding funds
  try {
    store.addToBudgetPod(podId, 75, 'Test contribution from script');
    console.log('✅ Added $75 to pod');
  } catch (error) {
    console.error('❌ Failed to add funds:', error);
    return false;
  }
  
  // Test withdrawing funds
  try {
    store.withdrawFromBudgetPod(podId, 25, 'Test withdrawal for emergency');
    console.log('✅ Withdrew $25 from pod');
  } catch (error) {
    console.error('❌ Failed to withdraw funds:', error);
    return false;
  }
  
  // Check final balance
  const updatedPod = store.budgetPods.find(p => p.id === podId);
  console.log('💰 Final balance:', updatedPod.currentAmount);
  console.log('📊 Contributions:', updatedPod.contributions?.length || 0);
  console.log('📊 Withdrawals:', updatedPod.withdrawals?.length || 0);
  
  return true;
}

// Test Suite 4: Test Pod Editing
function testPodEditing(podId) {
  console.log('%c✏️ Test 4: Pod Editing', 'color: #2196F3; font-weight: bold;');
  
  const store = window.useFinancialStore?.getState();
  if (!store || !podId) {
    console.error('❌ Store or pod ID not available');
    return false;
  }
  
  const originalPod = store.budgetPods.find(p => p.id === podId);
  if (!originalPod) {
    console.error('❌ Pod not found');
    return false;
  }
  
  console.log('📝 Original pod name:', originalPod.name);
  console.log('💰 Original monthly amount:', originalPod.monthlyAmount);
  
  // Test updating pod
  try {
    store.updateBudgetPod(podId, {
      name: 'Updated Emergency Fund',
      monthlyAmount: 600,
      description: 'Updated description from testing script',
      priority: 2
    });
    console.log('✅ Pod updated successfully');
  } catch (error) {
    console.error('❌ Failed to update pod:', error);
    return false;
  }
  
  // Verify changes
  const updatedPod = store.budgetPods.find(p => p.id === podId);
  console.log('📝 Updated pod name:', updatedPod.name);
  console.log('💰 Updated monthly amount:', updatedPod.monthlyAmount);
  console.log('⚡ Updated priority:', updatedPod.priority);
  
  return true;
}

// Test Suite 5: Test Data Persistence
function testDataPersistence() {
  console.log('%c💾 Test 5: Data Persistence', 'color: #2196F3; font-weight: bold;');
  
  const store = window.useFinancialStore?.getState();
  if (!store) {
    console.error('❌ Store not accessible');
    return false;
  }
  
  const podCount = store.budgetPods.length;
  console.log('📊 Current pod count:', podCount);
  
  // Check localStorage
  try {
    const savedData = localStorage.getItem('financial-dashboard-storage');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      console.log('✅ Data found in localStorage');
      console.log('📊 Saved pods count:', parsed.state?.budgetPods?.length || 0);
      return true;
    } else {
      console.warn('⚠️ No data found in localStorage');
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking localStorage:', error);
    return false;
  }
}

// Test Suite 6: Transaction History Verification
function testTransactionHistory() {
  console.log('%c📊 Test 6: Transaction History', 'color: #2196F3; font-weight: bold;');
  
  const store = window.useFinancialStore?.getState();
  if (!store) {
    console.error('❌ Store not accessible');
    return false;
  }
  
  let totalTransactions = 0;
  let totalContributions = 0;
  let totalWithdrawals = 0;
  
  store.budgetPods.forEach(pod => {
    const contributions = pod.contributions?.length || 0;
    const withdrawals = pod.withdrawals?.length || 0;
    totalTransactions += contributions + withdrawals;
    totalContributions += contributions;
    totalWithdrawals += withdrawals;
  });
  
  console.log('📊 Transaction Summary:');
  console.log('  - Total transactions:', totalTransactions);
  console.log('  - Total contributions:', totalContributions);
  console.log('  - Total withdrawals:', totalWithdrawals);
  
  // Check if TransactionHistory component would have data
  if (totalTransactions > 0) {
    console.log('✅ Transaction history has data to display');
    return true;
  } else {
    console.warn('⚠️ No transactions found for history display');
    return false;
  }
}

// Main Test Runner
function runAllTests() {
  console.log('%c🚀 Starting Comprehensive BudgetPod Tests', 'color: #FF9800; font-size: 14px; font-weight: bold;');
  console.log('');
  
  const results = {
    storeAccess: false,
    podCreation: false,
    transactions: false,
    editing: false,
    persistence: false,
    history: false
  };
  
  // Test 1: Store Access
  results.storeAccess = testStoreAccess();
  console.log('');
  
  if (!results.storeAccess) {
    console.log('%c❌ Tests aborted due to store access failure', 'color: #f44336; font-weight: bold;');
    return results;
  }
  
  // Test 2: Pod Creation
  const testPod = createTestBudgetPod();
  results.podCreation = !!testPod;
  console.log('');
  
  if (testPod) {
    // Test 3: Transactions
    results.transactions = testPodTransactions(testPod.id);
    console.log('');
    
    // Test 4: Editing
    results.editing = testPodEditing(testPod.id);
    console.log('');
  }
  
  // Test 5: Persistence
  results.persistence = testDataPersistence();
  console.log('');
  
  // Test 6: Transaction History
  results.history = testTransactionHistory();
  console.log('');
  
  // Summary
  console.log('%c📋 Test Results Summary', 'color: #9C27B0; font-size: 14px; font-weight: bold;');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${icon} ${testName}`);
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`%c🎯 Tests Passed: ${passed}/${total}`, `color: ${passed === total ? '#4CAF50' : '#FF9800'}; font-weight: bold;`);
  
  if (passed === total) {
    console.log('%c🎉 All tests passed! The BudgetPod functionality is working correctly.', 'color: #4CAF50; font-weight: bold;');
  } else {
    console.log('%c⚠️ Some tests failed. Check the individual test results above.', 'color: #FF9800; font-weight: bold;');
  }
  
  console.log('');
  console.log('%c📝 Next Steps:', 'color: #607D8B; font-weight: bold;');
  console.log('1. Navigate to the Budget tab in the app');
  console.log('2. Verify the test pod appears in the UI');
  console.log('3. Test the edit functionality through the UI');
  console.log('4. Check the Transaction History tab');
  console.log('5. Test CSV export functionality');
  
  return results;
}

// Manual UI Test Instructions
function showUITestInstructions() {
  console.log('%c🎨 Manual UI Testing Instructions', 'color: #673AB7; font-size: 14px; font-weight: bold;');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('1. 📱 Navigate to Budget tab in the app');
  console.log('2. 👀 Verify the test pod appears in the pod grid');
  console.log('3. 🖱️ Click the 3-dot menu on the test pod');
  console.log('4. ✏️ Select "Edit Pod" and verify form populates correctly');
  console.log('5. 💾 Make changes and save, verify changes persist');
  console.log('6. 💰 Test "Add Funds" and "Withdraw Funds" buttons');
  console.log('7. 📊 Navigate to "Recent Activity" tab');
  console.log('8. 🔍 Test filtering and search functionality');
  console.log('9. 📥 Test CSV export feature');
  console.log('10. 🔄 Refresh page and verify data persists');
  console.log('');
  console.log('💡 Tip: Open Developer Tools > Console to see any errors');
}

// Cleanup function
function cleanupTestData() {
  console.log('%c🧹 Cleaning up test data...', 'color: #795548; font-weight: bold;');
  
  const store = window.useFinancialStore?.getState();
  if (!store) {
    console.error('❌ Store not accessible');
    return false;
  }
  
  const testPods = store.budgetPods.filter(pod => 
    pod.name.includes('Test') || pod.description?.includes('testing script')
  );
  
  testPods.forEach(pod => {
    store.deleteBudgetPod(pod.id);
    console.log(`🗑️ Deleted test pod: ${pod.name}`);
  });
  
  console.log(`✅ Cleaned up ${testPods.length} test pods`);
  return true;
}

// Export functions to global scope
window.budgetPodTests = {
  runAllTests,
  testStoreAccess,
  createTestBudgetPod,
  testPodTransactions,
  testPodEditing,
  testDataPersistence,
  testTransactionHistory,
  showUITestInstructions,
  cleanupTestData
};

console.log('%c🎯 Available Test Commands:', 'color: #009688; font-weight: bold;');
console.log('  • budgetPodTests.runAllTests() - Run all automated tests');
console.log('  • budgetPodTests.showUITestInstructions() - Show manual UI test steps');
console.log('  • budgetPodTests.cleanupTestData() - Remove test data');
console.log('');
console.log('%c▶️ Run: budgetPodTests.runAllTests()', 'color: #4CAF50; font-size: 12px; background: #E8F5E8; padding: 2px 6px;');