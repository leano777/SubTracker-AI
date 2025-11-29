// Test script for budget pod transactions
// Run this in the browser console while the app is open

const testPodTransactions = () => {
  const store = window.useFinancialStore?.getState();
  
  if (!store) {
    console.error('Store not found. Make sure the app is running.');
    return;
  }
  
  // Get the first budget pod or create one if none exist
  let testPod = store.budgetPods[0];
  
  if (!testPod) {
    console.log('No pods found. Creating a test pod first...');
    testPod = {
      id: `test-pod-${Date.now()}`,
      name: 'Test Savings Pod',
      type: 'emergency',
      description: 'Test pod for transaction testing',
      monthlyAmount: 500,
      currentAmount: 100,
      targetAmount: 2000,
      isActive: true,
      autoTransfer: false,
      transferDay: 1,
      priority: 2,
      rolloverUnused: true,
      warningThreshold: 50,
      notes: 'Created for testing transactions',
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      contributions: [],
      withdrawals: []
    };
    store.addBudgetPod(testPod);
    console.log('✅ Created test pod:', testPod.name);
  }
  
  console.log('\n📊 Testing Pod:', testPod.name);
  console.log('Current Balance:', testPod.currentAmount);
  
  // Test adding funds
  console.log('\n💰 Testing Add Funds...');
  const addAmount = 150;
  store.addToBudgetPod(testPod.id, addAmount, 'Test deposit from console');
  
  // Get updated pod
  const updatedPod1 = store.budgetPods.find(p => p.id === testPod.id);
  console.log(`Added $${addAmount}. New balance: $${updatedPod1.currentAmount}`);
  console.log('Contributions:', updatedPod1.contributions);
  
  // Test withdrawing funds
  console.log('\n💸 Testing Withdraw Funds...');
  const withdrawAmount = 50;
  store.withdrawFromBudgetPod(testPod.id, withdrawAmount, 'Test withdrawal for expenses');
  
  // Get updated pod again
  const updatedPod2 = store.budgetPods.find(p => p.id === testPod.id);
  console.log(`Withdrew $${withdrawAmount}. New balance: $${updatedPod2.currentAmount}`);
  console.log('Withdrawals:', updatedPod2.withdrawals);
  
  // Summary
  console.log('\n📈 Transaction Test Summary:');
  console.log('- Initial balance:', testPod.currentAmount);
  console.log('- Added:', addAmount);
  console.log('- Withdrew:', withdrawAmount);
  console.log('- Final balance:', updatedPod2.currentAmount);
  console.log('- Total contributions:', updatedPod2.contributions?.length || 0);
  console.log('- Total withdrawals:', updatedPod2.withdrawals?.length || 0);
  
  return updatedPod2;
};

// Test batch transactions
const testBatchTransactions = () => {
  const store = window.useFinancialStore?.getState();
  
  if (!store || !store.budgetPods[0]) {
    console.error('No pods available for testing');
    return;
  }
  
  const pod = store.budgetPods[0];
  console.log('\n🔄 Testing Batch Transactions on:', pod.name);
  
  // Simulate multiple transactions
  const transactions = [
    { type: 'add', amount: 200, note: 'Paycheck allocation' },
    { type: 'add', amount: 50, note: 'Birthday gift' },
    { type: 'withdraw', amount: 75, reason: 'Emergency car repair' },
    { type: 'add', amount: 100, note: 'Side hustle income' },
    { type: 'withdraw', amount: 25, reason: 'Unexpected expense' }
  ];
  
  transactions.forEach((t, index) => {
    setTimeout(() => {
      if (t.type === 'add') {
        store.addToBudgetPod(pod.id, t.amount, t.note);
        console.log(`✅ Transaction ${index + 1}: Added $${t.amount} - ${t.note}`);
      } else {
        store.withdrawFromBudgetPod(pod.id, t.amount, t.reason);
        console.log(`📤 Transaction ${index + 1}: Withdrew $${t.amount} - ${t.reason}`);
      }
      
      const currentPod = store.budgetPods.find(p => p.id === pod.id);
      console.log(`   Current balance: $${currentPod.currentAmount}`);
    }, index * 500); // Delay each transaction by 500ms
  });
  
  setTimeout(() => {
    const finalPod = store.budgetPods.find(p => p.id === pod.id);
    console.log('\n✨ Batch Test Complete!');
    console.log('Final balance:', finalPod.currentAmount);
    console.log('Total transactions:', 
      (finalPod.contributions?.length || 0) + (finalPod.withdrawals?.length || 0)
    );
  }, transactions.length * 500 + 500);
};

// Instructions
console.log(`
===========================================
Budget Pod Transaction Test Scripts
===========================================

Available test functions:

1. testPodTransactions()
   - Tests basic add/withdraw functionality
   - Creates a test pod if none exist
   - Shows transaction history

2. testBatchTransactions()
   - Simulates multiple transactions
   - Tests rapid transaction processing
   - Verifies balance updates

To run tests:
1. Navigate to the Budget tab in the app
2. Run: testPodTransactions()
3. Check the "Recent Activity" tab to see transactions
4. Run: testBatchTransactions() for batch testing

===========================================
`);

// Export for console use
window.testPodTransactions = testPodTransactions;
window.testBatchTransactions = testBatchTransactions;