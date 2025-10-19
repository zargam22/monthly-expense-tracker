// Supabase Database Service - Drop-in replacement for Firebase
import { supabase, TABLES, USER_ID } from './supabase-config.js';

class SupabaseService {
  constructor() {
    this.userId = USER_ID;
  }

  // Initialize user data with default state
  async initializeUserData(defaultState) {
    try {
      console.log('Initializing Supabase connection...');
      
      // Check if user already exists
      const { data: existingUser, error: getUserError } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', this.userId)
        .single();

      if (getUserError && getUserError.code !== 'PGRST116') {
        // PGRST116 = "not found" error, which is expected for new users
        throw getUserError;
      }

      if (!existingUser) {
        console.log('Creating new user with default data...');
        
        // Create user record
        const { error: createUserError } = await supabase
          .from(TABLES.USERS)
          .insert({
            id: this.userId,
            salary: defaultState.salary,
            categories: defaultState.categories,
            current_allocation_view: defaultState.currentAllocationView,
            selected_date: defaultState.currentDate,
            created_at: new Date().toISOString()
          });

        if (createUserError) throw createUserError;

        // Add sample transactions
        for (const transaction of defaultState.transactions) {
          await this.addTransaction(transaction);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing user data:', error);
      
      // Provide user-friendly error messages
      if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
        throw new Error('Unable to connect to database. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  }

  // Get user data
  async getUserData() {
    try {
      const { data: user, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', this.userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('User data not found');
        }
        throw error;
      }

      // Convert snake_case to camelCase for compatibility
      return {
        salary: user.salary,
        categories: user.categories,
        currentAllocationView: user.current_allocation_view,
        currentDate: user.selected_date,
        createdAt: user.created_at
      };
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }

  // Update user settings (salary, categories, etc.)
  async updateUserSettings(updates) {
    try {
      // Convert camelCase to snake_case for database
      const dbUpdates = {};
      if (updates.salary !== undefined) dbUpdates.salary = updates.salary;
      if (updates.categories !== undefined) dbUpdates.categories = updates.categories;
      if (updates.currentAllocationView !== undefined) dbUpdates.current_allocation_view = updates.currentAllocationView;
      if (updates.currentDate !== undefined) dbUpdates.selected_date = updates.currentDate;
      
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from(TABLES.USERS)
        .update(dbUpdates)
        .eq('id', this.userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  // Add a new transaction
  async addTransaction(transaction) {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .insert({
          user_id: this.userId,
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          allocation: transaction.allocation,
          date: transaction.date,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Return in expected format
      return {
        id: data.id,
        amount: data.amount,
        description: data.description,
        category: data.category,
        allocation: data.allocation,
        date: data.date
      };
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  // Get all transactions
  async getTransactions() {
    try {
      const { data: transactions, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .select('*')
        .eq('user_id', this.userId)
        .order('date', { ascending: false });

      if (error) throw error;

      // Convert to expected format
      return transactions.map(tx => ({
        id: tx.id,
        amount: tx.amount,
        description: tx.description,
        category: tx.category,
        allocation: tx.allocation,
        date: tx.date
      }));
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  // Update a transaction
  async updateTransaction(transactionId, updates) {
    try {
      const dbUpdates = { ...updates };
      dbUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .update(dbUpdates)
        .eq('id', transactionId)
        .eq('user_id', this.userId)
        .select()
        .single();

      if (error) throw error;

      // Return in expected format
      return {
        id: data.id,
        amount: data.amount,
        description: data.description,
        category: data.category,
        allocation: data.allocation,
        date: data.date
      };
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  // Delete a transaction
  async deleteTransaction(transactionId) {
    try {
      const { error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .delete()
        .eq('id', transactionId)
        .eq('user_id', this.userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Real-time listener for user data changes
  onUserDataChange(callback) {
    const channel = supabase
      .channel('user-data-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: TABLES.USERS,
          filter: `id=eq.${this.userId}`
        }, 
        (payload) => {
          // Convert the payload to match Firebase format
          if (payload.new) {
            const userData = {
              salary: payload.new.salary,
              categories: payload.new.categories,
              currentAllocationView: payload.new.current_allocation_view,
              currentDate: payload.new.selected_date,
              createdAt: payload.new.created_at
            };
            callback({ data: () => userData, exists: () => true });
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => channel.unsubscribe();
  }

  // Real-time listener for transactions changes
  onTransactionsChange(callback) {
    const channel = supabase
      .channel('transactions-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: TABLES.TRANSACTIONS,
          filter: `user_id=eq.${this.userId}`
        }, 
        async () => {
          // When transactions change, fetch all transactions and call callback
          try {
            const transactions = await this.getTransactions();
            // Mimic Firebase format
            callback({
              forEach: (fn) => {
                transactions.forEach((tx, index) => {
                  fn({ id: tx.id, data: () => tx });
                });
              }
            });
          } catch (error) {
            console.error('Error in transactions change listener:', error);
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => channel.unsubscribe();
  }

  // Get transactions for a specific month/year
  async getTransactionsByMonth(year, month) {
    try {
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
      
      const { data: transactions, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .select('*')
        .eq('user_id', this.userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;

      // Convert to expected format
      return transactions.map(tx => ({
        id: tx.id,
        amount: tx.amount,
        description: tx.description,
        category: tx.category,
        allocation: tx.allocation,
        date: tx.date
      }));
    } catch (error) {
      console.error('Error getting transactions by month:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService();