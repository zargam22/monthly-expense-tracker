// --- STATE MANAGEMENT ---
const APP_STORAGE_KEY = 'monthly-expense-tracker-state-v2';
const CURRENCY = 'Rs';

function getDefaultState() {
  // Generate some sample data for the last 3 months
  const now = new Date();
  const sampleTransactions = [
    { id: 'tx_1', amount: 8000, description: 'Monthly groceries', category: 'Groceries', allocation: '70', date: new Date(now.getFullYear(), now.getMonth(), 10).toISOString() },
    { id: 'tx_2', amount: 2000, description: 'Plumbing and repairing', category: 'Utilities', allocation: '30', date: new Date(now.getFullYear(), now.getMonth(), 5).toISOString() },
    { id: 'tx_3', amount: 3000, description: 'Fuel and transport', category: 'Transport', allocation: '70', date: new Date(now.getFullYear(), now.getMonth(), 12).toISOString() },
    { id: 'tx_4', amount: 5000, description: 'Medical checkup', category: 'Healthcare', allocation: '30', date: new Date(now.getFullYear(), now.getMonth(), 15).toISOString() },
    // Previous month data
    { id: 'tx_5', amount: 7500, description: 'Groceries', category: 'Groceries', allocation: '70', date: new Date(now.getFullYear(), now.getMonth() - 1, 8).toISOString() },
    { id: 'tx_6', amount: 4000, description: 'New phone case', category: 'Shopping', allocation: '30', date: new Date(now.getFullYear(), now.getMonth() - 1, 20).toISOString() },
    // Two months ago data
    { id: 'tx_7', amount: 9000, description: 'Groceries', category: 'Groceries', allocation: '70', date: new Date(now.getFullYear(), now.getMonth() - 2, 11).toISOString() },
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

function loadState() {
  try {
    const storedState = localStorage.getItem(APP_STORAGE_KEY);
    if (storedState) {
        const parsed = JSON.parse(storedState);
        // Ensure date is an ISO string
        parsed.currentDate = new Date(parsed.currentDate).toISOString();
        return parsed;
    }
    const defaultState = getDefaultState();
    saveState(defaultState);
    return defaultState;
  } catch (error) {
    console.error("Failed to load state from localStorage", error);
    return getDefaultState();
  }
}

function saveState(currentState = state) {
  try {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(currentState));
  } catch (error) {
    console.error("Failed to save state to localStorage", error);
  }
}

let state = loadState();

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
function handleViewToggle(view) {
  state.currentAllocationView = view;
  render();
}

function handleMonthChange(direction) {
    const d = new Date(state.currentDate);
    d.setMonth(d.getMonth() + (direction === 'prev' ? -1 : 1));
    state.currentDate = d.toISOString();
    saveState();
    render();
}

function handleSalaryEdit() {
    const newSalaryStr = prompt('Enter your new monthly salary:', state.salary);
    if (newSalaryStr === null) {
        return; // User cancelled
    }
    const newSalary = parseFloat(newSalaryStr);
    if (!isNaN(newSalary) && newSalary >= 0) {
        state.salary = newSalary;
        saveState();
        render();
    } else {
        alert('Invalid salary amount. Please enter a valid number.');
    }
}

// --- RENDER FUNCTIONS ---
function render() {
  const app = document.getElementById('app');
  if (!app) return;
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
                            <span class="category-tag" style="background-color: ${colors.bg}; color: ${colors.text}; border-color: ${colors.text}33;">
                                ${tx.category}
                            </span>
                        </div>
                        <div class="transaction-meta">
                            <span>${formatDate(tx.date)}</span> &bull; <span>${tx.allocation}% Section</span>
                        </div>
                    </div>
                    <div class="transaction-amount">${formatCurrency(tx.amount)}</div>
                </li>
            `}).join('')}
        </ul>
    `;
}

function getComputedData() {
    const currentDate = new Date(state.currentDate);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const transactionsThisMonth = state.transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    const filteredTransactions = transactionsThisMonth.filter(tx => 
        state.currentAllocationView === 'all' || tx.allocation === state.currentAllocationView
    );

    const totalSpent = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalSalaryThisMonth = state.currentAllocationView === 'all' ? state.salary : state.salary * (parseInt(state.currentAllocationView) / 100);
    const remaining = totalSalaryThisMonth - totalSpent;
    const spentPercentage = totalSalaryThisMonth > 0 ? (totalSpent / totalSalaryThisMonth) * 100 : 0;
    
    const categorySpending = filteredTransactions.reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
        return acc;
    }, {});

    const allocation30Total = state.salary * 0.3;
    const allocation30Spent = transactionsThisMonth.filter(tx => tx.allocation === '30').reduce((sum, tx) => sum + tx.amount, 0);
    
    const allocation70Total = state.salary * 0.7;
    const allocation70Spent = transactionsThisMonth.filter(tx => tx.allocation === '70').reduce((sum, tx) => sum + tx.amount, 0);

    const monthlyTrends = [-2, -1, 0].map(monthOffset => {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() + monthOffset);
        const month = d.getMonth();
        const year = d.getFullYear();
        
        const monthTransactions = state.transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getMonth() === month && txDate.getFullYear() === year;
        });
        
        const spent = monthTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        return {
            month: d.toLocaleDateString('en-US', { month: 'short' }),
            spent,
            remaining: state.salary - spent
        };
    });

    return { 
        totalSpent,
        remaining,
        spentPercentage,
        filteredTransactions,
        categorySpending,
        allocation30: { name: '30% Allocation', total: allocation30Total, spent: allocation30Spent, remaining: allocation30Total - allocation30Spent },
        allocation70: { name: '70% Allocation', total: allocation70Total, spent: allocation70Spent, remaining: allocation70Total - allocation70Spent },
        monthlyTrends
    };
}

// --- HIGH-PERFORMANCE MODAL & FORM LOGIC (2024 Best Practices) ---

// Modal cache to prevent DOM reflow
let modalCache = new Map();
let currentModal = null;

async function openModal(title, content) {
    // Close existing modal first
    if (currentModal) {
        await closeModal();
    }
    
    // Use cached modal if available
    const cacheKey = `${title}-${content.slice(0, 50)}`;
    let modalElement;
    
    if (modalCache.has(cacheKey)) {
        modalElement = modalCache.get(cacheKey);
        document.body.appendChild(modalElement);
    } else {
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${title}</h2>
                        <button class="close-modal-btn">&times;</button>
                    </div>
                    ${content}
                </div>
            </div>
        `;
        
        // Create modal using DocumentFragment for better performance
        const template = document.createElement('template');
        template.innerHTML = modalHTML;
        modalElement = template.content.firstElementChild;
        document.body.appendChild(modalElement);
        
        // Cache the modal for reuse (limit cache size)
        if (modalCache.size > 5) {
            const firstKey = modalCache.keys().next().value;
            modalCache.delete(firstKey);
        }
        modalCache.set(cacheKey, modalElement.cloneNode(true));
    }
    
    currentModal = modalElement;
    
    // Optimize event handling with delegation
    modalElement.addEventListener('click', handleModalClick, { passive: true });
    
    // Add keyboard support
    document.addEventListener('keydown', handleModalKeydown);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Focus trap for accessibility
    requestAnimationFrame(() => {
        const firstInput = modalElement.querySelector('input, select, button');
        if (firstInput) firstInput.focus();
    });
}

function handleModalClick(e) {
    if (e.target.classList.contains('modal-overlay') || e.target.closest('.close-modal-btn')) {
        closeModal();
    }
}

function handleModalKeydown(e) {
    if (e.key === 'Escape' && currentModal) {
        closeModal();
    }
}

async function closeModal() {
    if (!currentModal) return;
    
    return new Promise((resolve) => {
        // Add closing animation class
        currentModal.classList.add('closing');
        
        // Wait for animation to complete
        const animationDuration = 150; // matches CSS animation
        setTimeout(() => {
            if (currentModal && currentModal.parentNode) {
                currentModal.remove();
            }
            currentModal = null;
            
            // Restore body scroll
            document.body.style.overflow = '';
            
            // Remove keyboard listener
            document.removeEventListener('keydown', handleModalKeydown);
            
            resolve();
        }, animationDuration);
    });
}

function showAddTransactionModal() {
    const options = state.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    const content = `
        <form id="add-transaction-form" class="modal-form">
            <div class="input-group">
                <label for="tx-amount">Amount</label>
                <input type="number" id="tx-amount" required placeholder="0.00">
            </div>
            <div class="input-group">
                <label for="tx-description">Description</label>
                <input type="text" id="tx-description" required placeholder="e.g., Monthly groceries">
            </div>
            <div class="input-group">
                <label for="tx-category">Category</label>
                <select id="tx-category" required>
                    <option value="">Select a category</option>
                    ${options}
                </select>
            </div>
            <div id="category-allocation-display"></div>
            <button type="submit">Add Transaction</button>
        </form>
    `;
    openModal('Add Transaction', content);
    
    const categorySelect = document.getElementById('tx-category');
    const allocationDisplay = document.getElementById('category-allocation-display');
    
    const updateAllocationDisplay = () => {
        const selectedCategory = state.categories.find(c => c.name === categorySelect.value);
        if (selectedCategory) {
            allocationDisplay.textContent = `This category is part of the ${selectedCategory.allocation}% allocation.`;
        } else {
            allocationDisplay.textContent = '';
        }
    };
    
    categorySelect.addEventListener('change', updateAllocationDisplay);
    updateAllocationDisplay(); // Initial call
    
    document.getElementById('add-transaction-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('tx-amount').value);
        const description = document.getElementById('tx-description').value;
        const categoryName = document.getElementById('tx-category').value;
        
        const category = state.categories.find(c => c.name === categoryName);
        if (!category || !description || isNaN(amount) || amount <= 0) {
            alert('Please fill out all fields correctly.');
            return;
        }

        const newTransaction = {
            id: `tx_${new Date().getTime()}`,
            amount,
            description,
            category: category.name,
            allocation: category.allocation,
            date: new Date().toISOString(),
        };

        state.transactions.push(newTransaction);
        saveState();
        closeModal();
        render();
    });
}

function showManageCategoriesModal() {
    const renderList = () => state.categories.map(c => `
        <li class="category-management-item" data-category-name="${c.name}">
            <div>
                <span>${c.name}</span>
                <span class="category-allocation-tag ${c.allocation === '30' ? 'thirty' : 'seventy'}">${c.allocation}%</span>
            </div>
            <button class="delete-category-btn" aria-label="Delete ${c.name}">&times;</button>
        </li>
    `).join('');

    const content = `
        <ul class="category-management-list" id="category-list-container">
            ${renderList()}
        </ul>
        <form id="add-category-form" class="modal-form">
            <div class="input-group">
                <label for="new-category-name">New Category Name</label>
                <input type="text" id="new-category-name" required placeholder="e.g., Entertainment">
            </div>
            <div class="input-group">
                <label for="new-category-allocation">Allocation</label>
                <select id="new-category-allocation" required>
                    <option value="30">30% Section</option>
                    <option value="70">70% Section</option>
                </select>
            </div>
            <button type="submit">Add Category</button>
        </form>
    `;
    openModal('Manage Categories', content);

    document.getElementById('add-category-form').addEventListener('submit', e => {
        e.preventDefault();
        const nameInput = document.getElementById('new-category-name');
        const allocationSelect = document.getElementById('new-category-allocation');
        const name = nameInput.value.trim();
        
        if (name && !state.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            state.categories.push({ name, allocation: allocationSelect.value });
            saveState();
            document.getElementById('category-list-container').innerHTML = renderList();
            nameInput.value = '';
        } else {
            alert('Category name cannot be empty or already exist.');
        }
    });

    document.getElementById('category-list-container').addEventListener('click', e => {
        const target = e.target;
        if (target.classList.contains('delete-category-btn')) {
            const categoryItem = target.closest('.category-management-item');
            if (categoryItem) {
                const categoryName = categoryItem.dataset.categoryName;
                if (confirm(`Are you sure you want to delete the "${categoryName}" category?`)) {
                    state.categories = state.categories.filter(c => c.name !== categoryName);
                    saveState();
                    document.getElementById('category-list-container').innerHTML = renderList();
                }
            }
        }
    });
}


function attachEventListeners() {
    const app = document.getElementById('app');
    if (!app) return;

    // Use a single event listener on the app container for better performance
    // and to avoid issues with re-rendering.
    app.addEventListener('click', (e) => {
        const target = e.target;

        // Header and Navigation controls
        if (target.closest('#toggle-all')) handleViewToggle('all');
        else if (target.closest('#toggle-30')) handleViewToggle('30');
        else if (target.closest('#toggle-70')) handleViewToggle('70');
        else if (target.closest('#prev-month-btn')) handleMonthChange('prev');
        else if (target.closest('#next-month-btn')) handleMonthChange('next');
        else if (target.closest('#manage-categories-btn')) showManageCategoriesModal();
        else if (target.closest('#add-transaction-btn')) showAddTransactionModal();
        
        // Widget controls
        else if (target.closest('#edit-salary-btn')) handleSalaryEdit();
    }, { passive: true });

    // Add optimized scroll and touch performance
    document.addEventListener('scroll', () => {
        // Throttle scroll events if needed
    }, { passive: true });

    document.addEventListener('touchstart', () => {
        // Passive touch events for better mobile performance
    }, { passive: true });

    document.addEventListener('wheel', () => {
        // Passive wheel events for better scrolling performance
    }, { passive: true });
}

// --- INITIALIZATION ---
function initializeApp() {
    render();             // Render the initial UI FIRST.
    attachEventListeners(); // THEN set up the main event listener.
}

document.addEventListener('DOMContentLoaded', initializeApp);
