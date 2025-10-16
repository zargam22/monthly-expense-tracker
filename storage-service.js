// LocalStorage Database Service - Firebase replacement
class StorageService {
  constructor() {
    this.userId = 'default-user';
    this.storageKeys = {
      userData: `expense-tracker-user-${this.userId}`,
      transactions: `expense-tracker-transactions-${this.userId}`
    };
  }

  // Initialize user data with default state
  async initializeUserData(defaultState) {
    try {
      console.log('Initializing local storage...');
      
      // Check if user data exists
      const existingUserData = localStorage.getItem(this.storageKeys.userData);
      const existingTransactions = localStorage.getItem(this.storageKeys.transactions);
      
      if (!existingUserData) {
        console.log('Creating new user with default data...');
        
        // Set user settings
        const userData = {
          salary: defaultState.salary,
          categories: defaultState.categories,
          currentAllocationView: defaultState.currentAllocationView,
          currentDate: defaultState.currentDate,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(this.storageKeys.userData, JSON.stringify(userData));
        
        // Set sample transactions
        const transactions = defaultState.transactions.map((tx, index) => ({
          ...tx,
          id: `tx-${Date.now()}-${index}`,
          createdAt: new Date().toISOString()
        }));
        localStorage.setItem(this.storageKeys.transactions, JSON.stringify(transactions));
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing user data:', error);
      throw new Error('Failed to initialize local storage. Please check your browser settings.');
    }
  }

  // Get user data
  async getUserData() {
    try {
      const userData = localStorage.getItem(this.storageKeys.userData);
      
      if (userData) {
        return JSON.parse(userData);
      } else {
        throw new Error('User data not found');
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }

  // Update user settings (salary, categories, etc.)
  async updateUserSettings(updates) {
    try {
      const existingData = await this.getUserData();
      const updatedData = {
        ...existingData,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(this.storageKeys.userData, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  // Add a new transaction
  async addTransaction(transaction) {
    try {
      const transactions = await this.getTransactions();
      const newTransaction = {
        ...transaction,
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      };
      
      transactions.push(newTransaction);
      localStorage.setItem(this.storageKeys.transactions, JSON.stringify(transactions));
      
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  // Get all transactions
  async getTransactions() {
    try {
      const transactionsData = localStorage.getItem(this.storageKeys.transactions);
      
      if (transactionsData) {
        const transactions = JSON.parse(transactionsData);
        // Sort by date desc
        return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  // Update a transaction
  async updateTransaction(transactionId, updates) {
    try {
      const transactions = await this.getTransactions();
      const transactionIndex = transactions.findIndex(tx => tx.id === transactionId);
      
      if (transactionIndex === -1) {
        throw new Error('Transaction not found');
      }
      
      transactions[transactionIndex] = {
        ...transactions[transactionIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(this.storageKeys.transactions, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  // Delete a transaction
  async deleteTransaction(transactionId) {
    try {
      const transactions = await this.getTransactions();
      const filteredTransactions = transactions.filter(tx => tx.id !== transactionId);
      localStorage.setItem(this.storageKeys.transactions, JSON.stringify(filteredTransactions));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Get transactions for a specific month/year
  async getTransactionsByMonth(year, month) {
    try {
      const allTransactions = await this.getTransactions();
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      
      return allTransactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= startDate && txDate <= endDate;
      });
    } catch (error) {
      console.error('Error getting transactions by month:', error);
      return [];
    }
  }

  // Export data for backup (useful for GitHub Pages)
  exportData() {
    try {
      const userData = localStorage.getItem(this.storageKeys.userData);
      const transactions = localStorage.getItem(this.storageKeys.transactions);
      
      return {
        userData: userData ? JSON.parse(userData) : null,
        transactions: transactions ? JSON.parse(transactions) : [],
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  // Import data from backup
  importData(exportedData) {
    try {
      if (exportedData.userData) {
        localStorage.setItem(this.storageKeys.userData, JSON.stringify(exportedData.userData));
      }
      
      if (exportedData.transactions) {
        localStorage.setItem(this.storageKeys.transactions, JSON.stringify(exportedData.transactions));
      }
      
      console.log('Data imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Clear all data (reset)
  clearData() {
    try {
      localStorage.removeItem(this.storageKeys.userData);
      localStorage.removeItem(this.storageKeys.transactions);
      console.log('All data cleared');
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();