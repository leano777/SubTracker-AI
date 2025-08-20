// Test script to create a budget pod via console
// Run this in the browser console while the app is open

const createTestPod = () => {
  // Get the store
  const store = window.useFinancialStore?.getState();
  
  if (!store) {
    console.error('Store not found. Make sure the app is running.');
    return;
  }
  
  // Create a test budget pod
  const testPod = {
    id: `test-pod-${Date.now()}`,
    name: 'Test Emergency Fund',
    type: 'emergency',
    description: 'Test pod for emergency savings',
    monthlyAmount: 500,
    currentAmount: 250,
    targetAmount: 3000,
    isActive: true,
    autoTransfer: true,
    transferDay: 15,
    priority: 1,
    rolloverUnused: true,
    warningThreshold: 100,
    notes: 'This is a test pod created for testing edit functionality',
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    contributions: [],
    withdrawals: []
  };
  
  // Add the pod
  store.addBudgetPod(testPod);
  
  console.log('✅ Test pod created:', testPod);
  console.log('Current pods:', store.budgetPods);
  
  return testPod;
};

// Instructions:
console.log(`
===========================================
Budget Pod Test Script
===========================================

To create a test budget pod:
1. Open the app at http://localhost:5175
2. Navigate to the Budget tab
3. Open browser developer console (F12)
4. Run: createTestPod()
5. The new pod should appear immediately
6. Click the 3-dot menu and select "Edit Pod"
7. Verify the form populates with the pod data
8. Make changes and save
9. Verify changes persist

===========================================
`);

// Export for use in console
window.createTestPod = createTestPod;