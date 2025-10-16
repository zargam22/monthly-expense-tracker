// Firebase-powered Monthly Expense Tracker
import { firebaseService } from './firebase-service.js';

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

// --- FIREBASE INTEGRATION ---
async function initializeApp() {
  try {
    state.isLoading = true;
    render();

    // Initialize Firebase with default data
    const defaultState = getDefaultState();
    await firebaseService.initializeUserData(defaultState);

    // Load user data from Firebase
    const userData = await firebaseService.getUserData();
    const transactions = await firebaseService.getTransactions();

    // Update state with Firebase data
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
    await firebaseService.updateUserSettings({
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

    const savedTransaction = await firebaseService.addTransaction(transaction);
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
    await firebaseService.deleteTransaction(transactionId);
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
        <p>Loading your expense data...</p>
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
        <p>Track and manage your monthly salary expenses</p>
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
        <button id="toggle-30" class="${state.currentAllocationView === '30' ? 'active' : ''}">30% Section</button>
        <button id="toggle-70" class="${state.currentAllocationView === '70' ? 'active' : ''}">70% Section</button>
      </div>
    </div>
  `;
}

function renderDashboard() {
    const { totalSpent, remaining, spentPercentage, filteredTransactions, allocation30, allocation70, categorySpending, monthlyTrends } = getComputedData();
    return `
        <div class="summary-widgets">
            <div class="widget card salary">
                <h3>Monthly Salary</h3>
                <p>${formatCurrency(state.salary)}</p>
                <button id="edit-salary-btn" class="edit-widget-btn" aria-label="Edit Salary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
            </div>
            <div class="widget card spent">
                <h3>Total Spent</h3>
                <p>${formatCurrency(totalSpent)}</p>
            </div>
            <div class="widget card remaining">
                <h3>Remaining</h3>
                <p>${formatCurrency(remaining)}</p>
            </div>
            <div class="widget card percentage">
                <h3>Spent Percentage</h3>
                <p>${spentPercentage.toFixed(1)}%</p>
            </div>
        </div>
        <div class="allocation-cards">
            ${renderAllocationCard(allocation30)}
            ${renderAllocationCard(allocation70)}
        </div>
        <div class="card chart-card">
            <h3>Category-wise Spending</h3>
            <p>Distribution of expenses</p>
            ${renderPieChart(categorySpending, totalSpent)}
        </div>
        <div class="card chart-card">
            <h3>Monthly Trends</h3>
            <p>Comparison across months</p>
            ${renderMonthlyTrendsChart(monthlyTrends)}
        </div>
        <div class="card transaction-history">
            ${renderTransactionList(filteredTransactions)}
        </div>
    `;
}

function renderAllocationCard(data) {
    const spentPercent = data.total > 0 ? (data.spent / data.total) * 100 : 0;
    const typeClass = data.name.includes('30') ? 'thirty' : 'seventy';
    return `
        <div class="card allocation-card ${typeClass}">
            <h4>${data.name}</h4>
            <div class="allocated-amount">${formatCurrency(data.total)} allocated</div>
            <div class="progress-bar">
                <div style="width: ${spentPercent}%"></div>
            </div>
            <div class="progress-labels">
                <span>Spent: ${formatCurrency(data.spent)}</span>
                <span>Remaining: ${formatCurrency(data.remaining)}</span>
            </div>
        </div>
    `;
}

function renderPieChart(categorySpending, totalSpent) {
    if (totalSpent === 0) {
        return `<div class="empty-state">No spending data for this period.</div>`;
    }
    const sortedCategories = Object.entries(categorySpending).sort((a, b) => b[1] - a[1]);
    const SVG_SIZE = 350;
    const RADIUS = 85;
    const center = SVG_SIZE / 2;
    let startAngle = -90;

    const slices = sortedCategories.map(([name, amount], index) => {
        const percent = (amount / totalSpent);
        const angle = percent * 360;
        const endAngle = startAngle + angle;
        
        const x1 = center + RADIUS * Math.cos(Math.PI * startAngle / 180);
        const y1 = center + RADIUS * Math.sin(Math.PI * startAngle / 180);
        const x2 = center + RADIUS * Math.cos(Math.PI * endAngle / 180);
        const y2 = center + RADIUS * Math.sin(Math.PI * endAngle / 180);
        const largeArcFlag = angle > 180 ? 1 : 0;

        const pathData = `M ${center},${center} L ${x1},${y1} A ${RADIUS},${RADIUS} 0 ${largeArcFlag},1 ${x2},${y2} Z`;
        
        const labelAngle = startAngle + angle / 2;
        const labelRadius = RADIUS + 40;
        const labelX = center + labelRadius * Math.cos(Math.PI * labelAngle / 180);
        const labelY = center + labelRadius * Math.sin(Math.PI * labelAngle / 180);
        const textAnchor = labelX < center ? "end" : "start";

        const lineStartX = center + (RADIUS + 5) * Math.cos(Math.PI * labelAngle / 180);
        const lineStartY = center + (RADIUS + 5) * Math.sin(Math.PI * labelAngle / 180);
        
        const color = PIE_CHART_COLORS[index % PIE_CHART_COLORS.length];
        startAngle = endAngle;

        return `
            <path d="${pathData}" fill="${color}" stroke="#fff" stroke-width="2"/>
            <polyline points="${lineStartX},${lineStartY} ${labelX},${labelY}" fill="none" stroke="${color}" stroke-width="1.5"/>
            <text class="pie-label-name" x="${labelX + (textAnchor === 'start' ? 5 : -5)}" y="${labelY}" dy="-0.2em" text-anchor="${textAnchor}" fill="${color}">${name}</text>
            <text class="pie-label-percent" x="${labelX + (textAnchor === 'start' ? 5 : -5)}" y="${labelY}" dy="1em" text-anchor="${textAnchor}" fill="${color}">${(percent * 100).toFixed(0)}%</text>
        `;
    }).join('');

    return `<div class="pie-chart-container"><svg viewBox="0 0 ${SVG_SIZE} ${SVG_SIZE}">${slices}</svg></div>`;
}

function renderMonthlyTrendsChart(monthlyTrends) {
    const maxAmount = Math.max(...monthlyTrends.map(d => d.spent + d.remaining), state.salary * 0.5, 1);
    const yAxisLabels = [0, 0.25, 0.5, 0.75, 1].map(p => Math.round(maxAmount * p)).reverse();
    
    const bars = monthlyTrends.map(data => {
        const spentHeight = maxAmount > 0 ? (data.spent / maxAmount) * 100 : 0;
        const remainingHeight = maxAmount > 0 ? (data.remaining / maxAmount) * 100 : 0;
        return `
            <div class="chart-bar-group">
                <div class="bars">
                    <div class="bar remaining" style="height: ${remainingHeight}%" title="Remaining: ${formatCurrency(data.remaining)}"></div>
                    <div class="bar spent" style="height: ${spentHeight}%" title="Spent: ${formatCurrency(data.spent)}"></div>
                </div>
                <div class="chart-label">${data.month}</div>
            </div>
        `;
    }).join('');

    return `
        <div class="bar-chart-container">
            <div class="y-axis">
                ${yAxisLabels.map(label => `<span>${formatCurrency(label).replace(CURRENCY, '').trim()}</span>`).join('')}
            </div>
            <div class="bar-chart">
                ${bars}
            </div>
            <div class="chart-legend">
                <div class="legend-item"><span class="legend-color" style="background-color: var(--green);"></span> Remaining</div>
                <div class="legend-item"><span class="legend-color" style="background-color: var(--red);"></span> Spent</div>
            </div>
        </div>
    `;
}

function renderTransactionList(transactions) {
    if (transactions.length === 0) {
        return `<div class="empty-state">No transactions for this period.</div>`;
    }
    const sortedTransactions = [...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return `
        <div class="transaction-history-header">
            <h3>Transaction History</h3>
            <p>${transactions.length} transactions</p>
        </div>
        <ul class="transaction-list">
            ${sortedTransactions.map(tx => {
                const colors = CATEGORY_COLORS[tx.category] || CATEGORY_COLORS.default;
                return `
                <li class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-description">
                            ${tx.description}
                        </div>
                        <div class="transaction-meta">
                            <span class="category" style="background-color: ${colors.bg}; color: ${colors.text};">
                                ${tx.category} (${tx.allocation}%)
                            </span>
                            <span class="date">${formatDate(tx.date)}</span>
                        </div>
                    </div>
                    <div class="transaction-amount">
                        <span>${formatCurrency(tx.amount)}</span>
                        <button class="delete-btn" data-transaction-id="${tx.id}" title="Delete transaction">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"></polyline><path d="M19,6V20A2,2 0 0,1 17,20H7A2,2 0 0,1 5,20V6M8,6V4A2,2 0 0,1 10,4H14A2,2 0 0,1 16,4V6"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                </li>`;
            }).join('')}
        </ul>
    `;
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
  // Use event delegation for dynamically created elements
  document.addEventListener('click', async (e) => {
    if (e.target.id === 'toggle-all') {
      await handleViewToggle('all');
    } else if (e.target.id === 'toggle-30') {
      await handleViewToggle('30');
    } else if (e.target.id === 'toggle-70') {
      await handleViewToggle('70');
    } else if (e.target.id === 'prev-month-btn') {
      await handleMonthChange('prev');
    } else if (e.target.id === 'next-month-btn') {
      await handleMonthChange('next');
    } else if (e.target.id === 'edit-salary-btn') {
      await handleSalaryEdit();
    } else if (e.target.id === 'add-transaction-btn') {
      await handleAddTransaction();
    } else if (e.target.id === 'manage-categories-btn') {
      handleManageCategories();
    } else if (e.target.closest('.delete-btn')) {
      const transactionId = e.target.closest('.delete-btn').dataset.transactionId;
      await handleDeleteTransaction(transactionId);
    }
  });
}

// --- APP INITIALIZATION ---
document.addEventListener('DOMContentLoaded', initializeApp);

// Make functions globally available for debugging
window.firebaseService = firebaseService;
window.state = state;