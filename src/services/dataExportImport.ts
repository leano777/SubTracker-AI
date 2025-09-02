interface ExportData {
  subscriptions?: any[];
  categories?: any[];
  budgetPods?: any[];
  paymentCards?: any[];
  investments?: any[];
  notebooks?: any[];
  settings?: any;
  exportDate: string;
  version: string;
}

// Helper function to get data from localStorage
const getLocalStorageItem = (key: string, defaultValue: any = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error parsing localStorage item ${key}:`, error);
    return defaultValue;
  }
};

// Export all user data
export const exportData = (): ExportData => {
  const userId = 'local-user-001'; // Get from auth context in production
  
  return {
    subscriptions: getLocalStorageItem(`subtracker_data_${userId}`)?.subscriptions || [],
    categories: getLocalStorageItem(`subtracker_categories_${userId}`, []),
    budgetPods: getLocalStorageItem(`subtracker_enhanced_pods_${userId}`, []),
    paymentCards: getLocalStorageItem(`subtracker_payment_cards_${userId}`, []),
    investments: getLocalStorageItem(`subtracker_investments_${userId}`, []),
    notebooks: getLocalStorageItem(`subtracker_notebooks_${userId}`, []),
    settings: getLocalStorageItem('subtracker_settings', {}),
    exportDate: new Date().toISOString(),
    version: '1.0.0'
  };
};

// Import data and restore to localStorage
export const importData = (data: ExportData): boolean => {
  try {
    const userId = 'local-user-001'; // Get from auth context in production
    
    // Validate data structure
    if (!data.version || !data.exportDate) {
      throw new Error('Invalid import file format');
    }
    
    // Import each data type if present
    if (data.subscriptions) {
      const currentData = getLocalStorageItem(`subtracker_data_${userId}`, {});
      currentData.subscriptions = data.subscriptions;
      localStorage.setItem(`subtracker_data_${userId}`, JSON.stringify(currentData));
    }
    
    if (data.categories) {
      localStorage.setItem(`subtracker_categories_${userId}`, JSON.stringify(data.categories));
    }
    
    if (data.budgetPods) {
      localStorage.setItem(`subtracker_enhanced_pods_${userId}`, JSON.stringify(data.budgetPods));
    }
    
    if (data.paymentCards) {
      localStorage.setItem(`subtracker_payment_cards_${userId}`, JSON.stringify(data.paymentCards));
    }
    
    if (data.investments) {
      localStorage.setItem(`subtracker_investments_${userId}`, JSON.stringify(data.investments));
    }
    
    if (data.notebooks) {
      localStorage.setItem(`subtracker_notebooks_${userId}`, JSON.stringify(data.notebooks));
    }
    
    if (data.settings) {
      localStorage.setItem('subtracker_settings', JSON.stringify(data.settings));
    }
    
    // Update last import timestamp
    localStorage.setItem('subtracker_last_import', new Date().toISOString());
    
    return true;
  } catch (error) {
    console.error('Import error:', error);
    return false;
  }
};

// Download data as JSON file
export const downloadJSON = (data: any, filename: string) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// Convert array to CSV and download
export const downloadCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }
  
  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// Clear all user data
export const clearAllData = (userId: string = 'local-user-001'): boolean => {
  try {
    const keysToRemove = [
      `subtracker_data_${userId}`,
      `subtracker_categories_${userId}`,
      `subtracker_enhanced_pods_${userId}`,
      `subtracker_payment_cards_${userId}`,
      `subtracker_investments_${userId}`,
      `subtracker_notebooks_${userId}`,
      `subtracker_transactions_${userId}`,
      'subtracker_settings',
      'subtracker_session'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    return true;
  } catch (error) {
    console.error('Clear data error:', error);
    return false;
  }
};

// Backup data automatically
export const autoBackup = () => {
  try {
    const data = exportData();
    const backupKey = 'subtracker_auto_backup';
    localStorage.setItem(backupKey, JSON.stringify(data));
    localStorage.setItem('subtracker_last_backup', new Date().toISOString());
    return true;
  } catch (error) {
    console.error('Auto backup error:', error);
    return false;
  }
};

// Restore from auto backup
export const restoreFromBackup = (): boolean => {
  try {
    const backupKey = 'subtracker_auto_backup';
    const backup = localStorage.getItem(backupKey);
    
    if (!backup) {
      console.error('No backup found');
      return false;
    }
    
    const data = JSON.parse(backup);
    return importData(data);
  } catch (error) {
    console.error('Restore backup error:', error);
    return false;
  }
};