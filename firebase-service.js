// Firebase Database Service
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs 
} from 'firebase/firestore';
import { db } from './firebase-config.js';

// Default user ID for single-user application
const USER_ID = 'default-user';

class FirebaseService {
  constructor() {
    this.userId = USER_ID;
  }

  // Initialize user data with default state
  async initializeUserData(defaultState) {
    try {
      console.log('Initializing Firebase connection...');
      const userDoc = doc(db, 'users', this.userId);
      
      // Wait a bit for Firebase to initialize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userSnap = await getDoc(userDoc);
      
      if (!userSnap.exists()) {
        console.log('Creating new user with default data...');
        await setDoc(userDoc, {
          salary: defaultState.salary,
          categories: defaultState.categories,
          currentAllocationView: defaultState.currentAllocationView,
          currentDate: defaultState.currentDate,
          createdAt: new Date().toISOString()
        });

        // Add sample transactions
        for (const transaction of defaultState.transactions) {
          await this.addTransaction(transaction);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing user data:', error);
      
      // If it's an offline error, provide more helpful message
      if (error.code === 'unavailable' || error.message.includes('offline')) {
        throw new Error('Unable to connect to database. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  }

  // Get user data
  async getUserData() {
    try {
      const userDoc = doc(db, 'users', this.userId);
      const userSnap = await getDoc(userDoc);
      
      if (userSnap.exists()) {
        return userSnap.data();
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
      const userDoc = doc(db, 'users', this.userId);
      await updateDoc(userDoc, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  // Add a new transaction
  async addTransaction(transaction) {
    try {
      const transactionsRef = collection(db, 'users', this.userId, 'transactions');
      const docRef = await addDoc(transactionsRef, {
        ...transaction,
        createdAt: new Date().toISOString()
      });
      
      return { ...transaction, id: docRef.id };
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  // Get all transactions
  async getTransactions() {
    try {
      const transactionsRef = collection(db, 'users', this.userId, 'transactions');
      const q = query(transactionsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const transactions = [];
      querySnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() });
      });
      
      return transactions;
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  // Update a transaction
  async updateTransaction(transactionId, updates) {
    try {
      const transactionDoc = doc(db, 'users', this.userId, 'transactions', transactionId);
      await updateDoc(transactionDoc, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  // Delete a transaction
  async deleteTransaction(transactionId) {
    try {
      const transactionDoc = doc(db, 'users', this.userId, 'transactions', transactionId);
      await deleteDoc(transactionDoc);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Real-time listener for user data changes
  onUserDataChange(callback) {
    const userDoc = doc(db, 'users', this.userId);
    return onSnapshot(userDoc, callback);
  }

  // Real-time listener for transactions changes
  onTransactionsChange(callback) {
    const transactionsRef = collection(db, 'users', this.userId, 'transactions');
    const q = query(transactionsRef, orderBy('date', 'desc'));
    return onSnapshot(q, callback);
  }

  // Get transactions for a specific month/year
  async getTransactionsByMonth(year, month) {
    try {
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
      
      const transactionsRef = collection(db, 'users', this.userId, 'transactions');
      const q = query(
        transactionsRef, 
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const transactions = [];
      querySnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() });
      });
      
      return transactions;
    } catch (error) {
      console.error('Error getting transactions by month:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();