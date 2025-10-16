// Supabase-powered Monthly Expense Tracker
import { supabaseService } from './supabase-service.js';

// --- CONSTANTS ---
const CURRENCY = 'Rs';

// --- STATE MANAGEMENT ---
let state = {
  salary: 60000,
  transactions: [],
  categories: [
    { name: 'Groceries', allocation: '70' },
    { name: 'Utilities', allocation: '30' },
    { name: 'Transport', allocation: '70' },
    { name: 'Healthcare', allocation: '30' },
    { name: 'Shopping', allocation: '30' },
  ],
  currentAllocationView: 'all',
  currentDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
  isLoading: true,
  error: null
};

function getDefaultState() {
  // Generate some sample data for the last 3 months
  const now = new Date();
  const sampleTransactions = [
    { amount: 8000, description: 'Monthly groceries', category: 'Groceries', allocation: '70', date: new Date(now.getFullYear(), now.getMonth(), 10).toISOString() },
    { amount: 2000, description: 'Plumbing and repairing', category: 'Utilities', allocation: '30', date: new Date(now.getFullYear(), now.getMonth(), 5).toISOString() },
    { amount: 3000, description: 'Fuel and transport', category: 'Transport', allocation: '70', date: new Date(now.getFullYear(), now.getMonth(), 12).toISOString() },
    { amount: 5000, description: 'Medical checkup', category: 'Healthcare', allocation: '30', date: new Date(now.getFullYear(), now.getMonth(), 15).toISOString() },
    // Previous month data
    { amount: 7500, description: 'Groceries', category: 'Groceries', allocation: '70', date: new Date(now.getFullYear(), now.getMonth() - 1, 8).toISOString() },
    { amount: 4000, description: 'New phone case', category: 'Shopping', allocation: '30', date: new Date(now.getFullYear(), now.getMonth() - 1, 20).toISOString() },
    // Two months ago data
    { amount: 9000, description: 'Groceries', category: 'Groceries', allocation: '70', date: new Date(now.getFullYear(), now.getMonth() - 2, 11).toISOString() },
  ];

  return {
    salary: 60000,
    transactions: sampleTransactions,
    categories: [
      { name: 'Groceries', allocation: '70' },
      { name: 'Utilities', allocation: '30' },
      { name: 'Transport', allocation: '70' },
      { name: 'Healthcare', allocation: '30' },
      { name: 'Shopping', allocation: '30' },
    ],
    currentAllocationView: 'all',
    currentDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
  };
}

// --- SUPABASE INTEGRATION ---
async function initializeApp() {
  try {
    state.isLoading = true;
    render();

    // Initialize Supabase with default data
    const defaultState = getDefaultState();
    await supabaseService.initializeUserData(defaultState);

    // Load user data from Supabase
    const userData = await supabaseService.getUserData();
    const transactions = await supabaseService.getTransactions();

    // Update state with Supabase data
    state.salary = userData.salary;
    state.categories = userData.categories;
    state.currentAllocationView = userData.currentAllocationView || 'all';
    state.currentDate = userData.currentDate;
    state.transactions = transactions;
    state.isLoading = false;
    state.error = null;

    render();
    setupEventListeners();
  } catch (error) {
    console.error('Error initializing app:', error);
    state.isLoading = false;
    state.error = error.message;
    render();
  }
}

async function saveUserSettings() {
  try {
    await supabaseService.updateUserSettings({
      salary: state.salary,
      categories: state.categories,
      currentAllocationView: state.currentAllocationView,
      currentDate: state.currentDate
    });
  } catch (error) {
    console.error('Error saving user settings:', error);
    alert('Failed to save settings. Please try again.');
  }
}

// --- HELPERS ---
const formatCurrency = (amount) => {
  return `${CURRENCY} ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getMonthYear = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const CATEGORY_COLORS = {
    'Groceries': { bg: '#E6F9F0', text: '#28A745' },
    'Utilities': { bg: '#FFF0E6', text: '#FD7E14' },
    'Transport': { bg: '#FFFBE6', text: '#FFC107' },
    'Healthcare': { bg: '#FDEEED', text: '#DC3545' },
    'Shopping': { bg: '#E6F2FF', text: '#007BFF' },
    'default': { bg: '#F8F9FA', text: '#6C757D' }
};

const PIE_CHART_COLORS = ['#28A745', '#007BFF', '#FD7E14', '#DC3545', '#FFC107', '#6F42C1'];

// --- EVENT HANDLERS ---
async function handleViewToggle(view) {
  state.currentAllocationView = view;
  await saveUserSettings();
  render();
}

async function handleMonthChange(direction) {
    const d = new Date(state.currentDate);
    d.setMonth(d.getMonth() + (direction === 'prev' ? -1 : 1));
    state.currentDate = d.toISOString();
    await saveUserSettings();
    render();
}

async function handleSalaryEdit() {
    const newSalaryStr = prompt('Enter your new monthly salary:', state.salary);
    if (newSalaryStr === null) {
        return; // User cancelled
    }
    const newSalary = parseFloat(newSalaryStr);
    if (!isNaN(newSalary) && newSalary >= 0) {
        state.salary = newSalary;
        await saveUserSettings();
        render();
    } else {
        alert('Invalid salary amount. Please enter a valid number.');
    }
}

async function handleAddTransaction() {
  const description = prompt('Transaction description:');
  if (!description) return;

  const amountStr = prompt('Amount:');
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    alert('Invalid amount. Please enter a valid number.');
    return;
  }

  const category = prompt(`Category (${state.categories.map(c => c.name).join(', ')}):`);
  if (!category) return;

  const categoryData = state.categories.find(c => c.name.toLowerCase() === category.toLowerCase());
  if (!categoryData) {
    alert('Invalid category. Please choose from the available categories.');
    return;
  }

  const dateStr = prompt('Date (YYYY-MM-DD, or leave empty for today):');
  let date;
  if (dateStr) {
    date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      alert('Invalid date format. Please use YYYY-MM-DD.');
      return;
    }
  } else {
    date = new Date();
  }

  try {
    const transaction = {
      amount,
      description,
      category: categoryData.name,
      allocation: categoryData.allocation,
      date: date.toISOString()
    };

    const savedTransaction = await supabaseService.addTransaction(transaction);
    state.transactions.push(savedTransaction);
    render();
  } catch (error) {
    console.error('Error adding transaction:', error);
    alert('Failed to add transaction. Please try again.');
  }
}

async function handleDeleteTransaction(transactionId) {
  if (!confirm('Are you sure you want to delete this transaction?')) return;

  try {
    await supabaseService.deleteTransaction(transactionId);
    state.transactions = state.transactions.filter(t => t.id !== transactionId);
    render();
  } catch (error) {
    console.error('Error deleting transaction:', error);
    alert('Failed to delete transaction. Please try again.');
  }
}

function handleManageCategories() {
  const categoriesStr = prompt(
    'Manage categories (format: Name:Allocation%):\n' +
    'Example: Groceries:70, Utilities:30\n\n' +
    'Current categories:\n' +
    state.categories.map(c => `${c.name}:${c.allocation}%`).join(', '),
    state.categories.map(c => `${c.name}:${c.allocation}`).join(', ')
  );

  if (!categoriesStr) return;

  try {
    const categories = categoriesStr.split(',').map(cat => {
      const [name, allocation] = cat.trim().split(':');
      return { name: name.trim(), allocation: allocation.trim() };
    });

    // Validate categories
    for (const cat of categories) {
      if (!cat.name || !cat.allocation || !['30', '70'].includes(cat.allocation)) {
        throw new Error('Invalid category format. Use Name:Allocation where allocation is 30 or 70.');
      }
    }

    state.categories = categories;
    saveUserSettings();
    render();
  } catch (error) {
    alert(error.message);
  }
}

// --- COMPUTED DATA ---
function getComputedData() {
    const currentDate = new Date(state.currentDate);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Filter transactions for current month
    const filteredTransactions = state.transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getFullYear() === year && txDate.getMonth() === month;
    }).filter(tx => {
        if (state.currentAllocationView === 'all') return true;
        return tx.allocation === state.currentAllocationView;
    });

    const totalSpent = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const remaining = state.salary - totalSpent;
    const spentPercentage = state.salary > 0 ? (totalSpent / state.salary) * 100 : 0;

    // Allocation data
    const allocation30Total = Math.round(state.salary * 0.3);
    const allocation70Total = Math.round(state.salary * 0.7);

    const spent30 = state.transactions
        .filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getFullYear() === year && txDate.getMonth() === month && tx.allocation === '30';
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

    const spent70 = state.transactions
        .filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getFullYear() === year && txDate.getMonth() === month && tx.allocation === '70';
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

    const allocation30 = {
        name: '30% Section',
        total: allocation30Total,
        spent: spent30,
        remaining: allocation30Total - spent30
    };

    const allocation70 = {
        name: '70% Section', 
        total: allocation70Total,
        spent: spent70,
        remaining: allocation70Total - spent70
    };

    // Category spending
    const categorySpending = {};
    filteredTransactions.forEach(tx => {
        categorySpending[tx.category] = (categorySpending[tx.category] || 0) + tx.amount;
    });

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
        const trendDate = new Date(year, month - i, 1);
        const trendYear = trendDate.getFullYear();
        const trendMonth = trendDate.getMonth();

        const monthTransactions = state.transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getFullYear() === trendYear && txDate.getMonth() === trendMonth;
        });

        const monthSpent = monthTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        monthlyTrends.push({
            month: trendDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            spent: monthSpent,
            remaining: state.salary - monthSpent
        });
    }

    return {
        totalSpent,
        remaining,
        spentPercentage,
        filteredTransactions,
        allocation30,
        allocation70,
        categorySpending,
        monthlyTrends
    };
}

// --- RENDER FUNCTIONS ---
function render() {
  const app = document.getElementById('app');
  if (!app) return;

  if (state.isLoading) {
    app.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading your expense data from Supabase...</p>
      </div>
    `;
    return;
  }

  if (state.error) {
    app.innerHTML = `
      <div class="error-container">
        <h2>Error Loading Application</h2>
        <p>${state.error}</p>
        <button onclick="location.reload()" class="btn btn-primary">Retry</button>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">
          Make sure you've set up your Supabase configuration in <code>supabase-config.js</code>
        </p>
      </div>
    `;
    return;
  }

  app.innerHTML = `
    <header class="app-header">
        ${renderHeader()}
    </header>
    <main class="main-content">
        ${renderDashboard()}
    </main>
  `;
}

function renderHeader() {
    const currentDate = new Date(state.currentDate);
    return `
    <div class="header-top">
      <div class="header-title">
        <h1>Monthly Expense Tracker</h1>
        <p>Track and manage your monthly salary expenses (powered by Supabase)</p>
      </div>
      <div class="header-actions">
        <button class="btn" id="manage-categories-btn">Manage Categories</button>
        <button class="btn btn-primary" id="add-transaction-btn">+ Add Transaction</button>
      </div>
    </div>
    <div class="header-nav">
      <div class="month-navigator">
        <button id="prev-month-btn" aria-label="Previous month">&larr;</button>
        <div class="current-month">${getMonthYear(currentDate.toISOString())}</div>
        <button id="next-month-btn" aria-label="Next month">&rarr;</button>
      </div>
      <div class="view-toggle">
        <button id="toggle-all" class="${state.currentAllocationView === 'all' ? 'active' : ''}">All Expenses</button>
        <button id="toggle-70" class="${state.currentAllocationView === '70' ? 'active' : ''}">70% Section</button>
        <button id="toggle-30" class="${state.currentAllocationView === '30' ? 'active' : ''}">30% Section</button>
      </div>
    </div>
    `;
}

function renderDashboard() {
    const computed = getComputedData();
    
    return `
    <div class="dashboard">
        ${renderSummaryCards(computed)}
        ${renderAllocationOverview(computed)}
        ${renderTransactionsList(computed)}
        ${renderCategoryBreakdown(computed)}
    </div>
    `;
}

function renderSummaryCards(computed) {
    return `
    <div class="summary-cards">
        <div class="card">
            <div class="card-header">
                <h3>Monthly Salary</h3>
                <button class="btn-icon" id="edit-salary-btn">✏️</button>
            </div>
            <div class="amount positive">${formatCurrency(state.salary)}</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Total Spent</h3>
            </div>
            <div class="amount negative">${formatCurrency(computed.totalSpent)}</div>
            <div class="percentage">${computed.spentPercentage.toFixed(1)}% of salary</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Remaining</h3>
            </div>
            <div class="amount ${computed.remaining >= 0 ? 'positive' : 'negative'}">${formatCurrency(computed.remaining)}</div>
            <div class="percentage">${(100 - computed.spentPercentage).toFixed(1)}% of salary</div>
        </div>
    </div>
    `;
}

function renderAllocationOverview(computed) {
    const allocation30Percentage = computed.allocation30.total > 0 ? (computed.allocation30.spent / computed.allocation30.total) * 100 : 0;
    const allocation70Percentage = computed.allocation70.total > 0 ? (computed.allocation70.spent / computed.allocation70.total) * 100 : 0;
    
    return `
    <div class="allocation-overview">
        <div class="card">
            <div class="card-header">
                <h3>30% Allocation (Wants)</h3>
                <div class="allocation-subtitle">${formatCurrency(computed.allocation30.total)} budgeted</div>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill allocation-30" style="width: ${Math.min(allocation30Percentage, 100)}%"></div>
                </div>
                <div class="progress-text">${allocation30Percentage.toFixed(1)}%</div>
            </div>
            <div class="allocation-details">
                <div class="detail">
                    <span class="label">Spent:</span>
                    <span class="value negative">${formatCurrency(computed.allocation30.spent)}</span>
                </div>
                <div class="detail">
                    <span class="label">Remaining:</span>
                    <span class="value ${computed.allocation30.remaining >= 0 ? 'positive' : 'negative'}">${formatCurrency(computed.allocation30.remaining)}</span>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>70% Allocation (Needs)</h3>
                <div class="allocation-subtitle">${formatCurrency(computed.allocation70.total)} budgeted</div>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill allocation-70" style="width: ${Math.min(allocation70Percentage, 100)}%"></div>
                </div>
                <div class="progress-text">${allocation70Percentage.toFixed(1)}%</div>
            </div>
            <div class="allocation-details">
                <div class="detail">
                    <span class="label">Spent:</span>
                    <span class="value negative">${formatCurrency(computed.allocation70.spent)}</span>
                </div>
                <div class="detail">
                    <span class="label">Remaining:</span>
                    <span class="value ${computed.allocation70.remaining >= 0 ? 'positive' : 'negative'}">${formatCurrency(computed.allocation70.remaining)}</span>
                </div>
            </div>
        </div>
    </div>
    `;
}

function renderTransactionsList(computed) {
    if (computed.filteredTransactions.length === 0) {
        return `
        <div class="card">
            <div class="card-header">
                <h3>Recent Transactions</h3>
            </div>
            <div class="empty-state">
                <p>No transactions found for the current filters.</p>
                <button class="btn btn-primary" onclick="handleAddTransaction()">Add First Transaction</button>
            </div>
        </div>
        `;
    }
    
    return `
    <div class="card">
        <div class="card-header">
            <h3>Recent Transactions</h3>
            <div class="transaction-count">${computed.filteredTransactions.length} transaction${computed.filteredTransactions.length !== 1 ? 's' : ''}</div>
        </div>
        <div class="transactions-list">
            ${computed.filteredTransactions.slice(0, 10).map(tx => {
                const colors = CATEGORY_COLORS[tx.category] || CATEGORY_COLORS.default;
                return `
                <div class="transaction-item">
                    <div class="transaction-left">
                        <div class="transaction-category" style="background-color: ${colors.bg}; color: ${colors.text}">
                            ${tx.category}
                        </div>
                        <div class="transaction-details">
                            <div class="transaction-description">${tx.description}</div>
                            <div class="transaction-meta">${formatDate(tx.date)} • ${tx.allocation}% allocation</div>
                        </div>
                    </div>
                    <div class="transaction-right">
                        <div class="transaction-amount negative">${formatCurrency(tx.amount)}</div>
                        <button class="btn-icon delete-btn" onclick="handleDeleteTransaction('${tx.id}')">🗑️</button>
                    </div>
                </div>
                `;
            }).join('')}
            ${computed.filteredTransactions.length > 10 ? 
                `<div class="transaction-item show-more">
                    <div class="show-more-text">And ${computed.filteredTransactions.length - 10} more transactions...</div>
                </div>` 
                : ''
            }
        </div>
    </div>
    `;
}

function renderCategoryBreakdown(computed) {
    const categories = Object.entries(computed.categorySpending)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);
    
    if (categories.length === 0) {
        return `
        <div class="card">
            <div class="card-header">
                <h3>Category Breakdown</h3>
            </div>
            <div class="empty-state">
                <p>No spending data available for the current month.</p>
            </div>
        </div>
        `;
    }
    
    const maxAmount = Math.max(...categories.map(c => c.amount));
    
    return `
    <div class="card">
        <div class="card-header">
            <h3>Category Breakdown</h3>
            <div class="breakdown-total">Total: ${formatCurrency(computed.totalSpent)}</div>
        </div>
        <div class="category-breakdown">
            ${categories.map((cat, index) => {
                const colors = CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.default;
                const percentage = computed.totalSpent > 0 ? (cat.amount / computed.totalSpent) * 100 : 0;
                const barWidth = maxAmount > 0 ? (cat.amount / maxAmount) * 100 : 0;
                
                return `
                <div class="category-item">
                    <div class="category-header">
                        <div class="category-name">
                            <span class="category-indicator" style="background-color: ${colors.text}"></span>
                            ${cat.category}
                        </div>
                        <div class="category-amount">${formatCurrency(cat.amount)} (${percentage.toFixed(1)}%)</div>
                    </div>
                    <div class="category-bar">
                        <div class="category-fill" style="width: ${barWidth}%; background-color: ${colors.text}"></div>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    </div>
    `;
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    // Month navigation
    document.getElementById('prev-month-btn')?.addEventListener('click', () => handleMonthChange('prev'));
    document.getElementById('next-month-btn')?.addEventListener('click', () => handleMonthChange('next'));
    
    // View toggles
    document.getElementById('toggle-all')?.addEventListener('click', () => handleViewToggle('all'));
    document.getElementById('toggle-70')?.addEventListener('click', () => handleViewToggle('70'));
    document.getElementById('toggle-30')?.addEventListener('click', () => handleViewToggle('30'));
    
    // Actions
    document.getElementById('add-transaction-btn')?.addEventListener('click', handleAddTransaction);
    document.getElementById('edit-salary-btn')?.addEventListener('click', handleSalaryEdit);
    document.getElementById('manage-categories-btn')?.addEventListener('click', handleManageCategories);
}

// Make functions globally available for onclick handlers
window.handleDeleteTransaction = handleDeleteTransaction;
window.handleAddTransaction = handleAddTransaction;

// --- INITIALIZE APP ---
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});