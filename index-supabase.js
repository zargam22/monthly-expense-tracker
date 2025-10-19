// Supabase-powered Monthly Expense Tracker
import { supabaseService } from './supabase-service.js';

// --- CONSTANTS ---
const CURRENCY = 'Rs';

// --- STATE MANAGEMENT ---
let state = {
  salary: 60000,
  transactions: [],
  categories: [
    { name: 'Groceries', allocation: '67' },
    { name: 'Utilities', allocation: '33' },
    { name: 'Transport', allocation: '67' },
    { name: 'Healthcare', allocation: '33' },
    { name: 'Shopping', allocation: '33' },
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
    { id: 'tx_1', amount: 8000, description: 'Monthly groceries', category: 'Groceries', allocation: '67', date: new Date(now.getFullYear(), now.getMonth(), 10).toISOString() },
    { id: 'tx_2', amount: 2000, description: 'Plumbing and repairing', category: 'Utilities', allocation: '33', date: new Date(now.getFullYear(), now.getMonth(), 5).toISOString() },
    { id: 'tx_3', amount: 3000, description: 'Fuel and transport', category: 'Transport', allocation: '67', date: new Date(now.getFullYear(), now.getMonth(), 12).toISOString() },
    { id: 'tx_4', amount: 5000, description: 'Medical checkup', category: 'Healthcare', allocation: '33', date: new Date(now.getFullYear(), now.getMonth(), 15).toISOString() },
    { id: 'tx_5', amount: 5000, description: 'corn flour', category: 'Groceries', allocation: '67', date: new Date(now.getFullYear(), now.getMonth(), 16).toISOString() },
    { id: 'tx_6', amount: 1000, description: 'Test transaction', category: 'Shopping', allocation: '33', date: new Date(now.getFullYear(), now.getMonth(), 17).toISOString() },
    // Previous month data
    { id: 'tx_7', amount: 7500, description: 'Groceries', category: 'Groceries', allocation: '67', date: new Date(now.getFullYear(), now.getMonth() - 1, 8).toISOString() },
    { id: 'tx_8', amount: 4000, description: 'New phone case', category: 'Shopping', allocation: '33', date: new Date(now.getFullYear(), now.getMonth() - 1, 20).toISOString() },
    // Two months ago data
    { id: 'tx_9', amount: 9000, description: 'Groceries', category: 'Groceries', allocation: '67', date: new Date(now.getFullYear(), now.getMonth() - 2, 11).toISOString() },
  ];

  return {
    salary: 60000,
    transactions: sampleTransactions,
    categories: [
      { name: 'Groceries', allocation: '67' },
      { name: 'Utilities', allocation: '33' },
      { name: 'Transport', allocation: '67' },
      { name: 'Healthcare', allocation: '33' },
      { name: 'Shopping', allocation: '33' },
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
const formatCurrency = (amount, showDecimals = false) => {
  const decimals = showDecimals ? 2 : 0;
  return `${CURRENCY} ${amount.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
};

// Helper specifically for allocation amounts that need 2-decimal precision
const formatAllocationAmount = (amount) => {
  return formatCurrency(amount, true);
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

// Performance optimization: Cache calendar modal
let calendarModalCache = null;
let calendarDisplayDate = null;

async function handleDatePicker() {
    // Create calendar modal only once and reuse
    if (!calendarModalCache) {
        calendarModalCache = createCalendarModalElement();
    }
    
    const currentDate = new Date(state.currentDate);
    calendarDisplayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    // Show modal with optimized animation
    document.body.appendChild(calendarModalCache);
    requestAnimationFrame(() => {
        calendarModalCache.style.opacity = '1';
        updateCalendarDisplay();
    });
}

function createCalendarModalElement() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.2s ease';
    
    modal.innerHTML = `
        <div class="calendar-modal">
            <div class="calendar-header">
                <h3>Select Month</h3>
                <button class="close-calendar-btn">&times;</button>
            </div>
            <div class="calendar-widget">
                <div class="calendar-nav">
                    <button class="calendar-prev-year">&laquo;</button>
                    <button class="calendar-prev-month">&lsaquo;</button>
                    <div class="calendar-current-month-year">
                        <span class="calendar-month"></span>
                        <span class="calendar-year"></span>
                    </div>
                    <button class="calendar-next-month">&rsaquo;</button>
                    <button class="calendar-next-year">&raquo;</button>
                </div>
                <div class="calendar-grid">
                    <div class="calendar-weekdays">
                        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                    </div>
                    <div class="calendar-dates"></div>
                </div>
                <div class="calendar-actions">
                    <button class="btn calendar-select-btn">Select This Month</button>
                    <button class="btn calendar-cancel-btn">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    // Setup optimized event listeners once
    setupCalendarEventListeners(modal);
    
    return modal;
}

function setupCalendarEventListeners(modal) {
    const closeModal = () => {
        modal.style.opacity = '0';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 200);
    };
    
    // Use event delegation for better performance
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        } else if (e.target.classList.contains('close-calendar-btn') || 
                   e.target.classList.contains('calendar-cancel-btn')) {
            closeModal();
        } else if (e.target.classList.contains('calendar-prev-year')) {
            calendarDisplayDate.setFullYear(calendarDisplayDate.getFullYear() - 1);
            updateCalendarDisplay();
        } else if (e.target.classList.contains('calendar-next-year')) {
            calendarDisplayDate.setFullYear(calendarDisplayDate.getFullYear() + 1);
            updateCalendarDisplay();
        } else if (e.target.classList.contains('calendar-prev-month')) {
            calendarDisplayDate.setMonth(calendarDisplayDate.getMonth() - 1);
            updateCalendarDisplay();
        } else if (e.target.classList.contains('calendar-next-month')) {
            calendarDisplayDate.setMonth(calendarDisplayDate.getMonth() + 1);
            updateCalendarDisplay();
        } else if (e.target.classList.contains('calendar-select-btn')) {
            handleCalendarSelection(closeModal);
        }
    });
}

async function handleCalendarSelection(closeModal) {
    state.currentDate = new Date(calendarDisplayDate.getFullYear(), calendarDisplayDate.getMonth(), 1).toISOString();
    await saveUserSettings();
    render();
    closeModal();
}

function updateCalendarDisplay() {
    if (!calendarModalCache || !calendarDisplayDate) return;
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const currentDate = new Date(state.currentDate);
    
    // Update month and year display
    calendarModalCache.querySelector('.calendar-month').textContent = monthNames[calendarDisplayDate.getMonth()];
    calendarModalCache.querySelector('.calendar-year').textContent = calendarDisplayDate.getFullYear();
    
    // Optimized calendar dates rendering
    const datesContainer = calendarModalCache.querySelector('.calendar-dates');
    const fragment = document.createDocumentFragment();
    
    const firstDay = new Date(calendarDisplayDate.getFullYear(), calendarDisplayDate.getMonth(), 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Reuse existing date elements if possible
    const existingDates = datesContainer.querySelectorAll('.calendar-date');
    
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        let dateDiv = existingDates[i];
        if (!dateDiv) {
            dateDiv = document.createElement('div');
            dateDiv.className = 'calendar-date';
        }
        
        dateDiv.textContent = date.getDate();
        dateDiv.className = 'calendar-date';
        
        if (date.getMonth() !== calendarDisplayDate.getMonth()) {
            dateDiv.classList.add('other-month');
        }
        
        if (date.getFullYear() === currentDate.getFullYear() && 
            date.getMonth() === currentDate.getMonth()) {
            dateDiv.classList.add('selected-month');
        }
        
        if (i >= existingDates.length) {
            fragment.appendChild(dateDiv);
        }
    }
    
    if (fragment.hasChildNodes()) {
        datesContainer.appendChild(fragment);
    }
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
  showTransactionModal();
}

// Performance optimization: Cache DOM elements and reuse modals
let transactionModalCache = null;

function showTransactionModal(editTransaction = null) {
  const isEdit = !!editTransaction;
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Create modal only once and reuse
  if (!transactionModalCache) {
    transactionModalCache = createTransactionModalElement();
  }
  
  // Update modal content efficiently
  updateTransactionModalContent(transactionModalCache, isEdit, editTransaction, currentDate);
  
  // Show modal with optimized animation
  document.body.appendChild(transactionModalCache);
  requestAnimationFrame(() => {
    transactionModalCache.style.opacity = '1';
  });
  
  // Setup modal event listeners
  setupTransactionModalListeners(isEdit, editTransaction);
}

function createTransactionModalElement() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'transaction-modal-overlay';
  modal.style.opacity = '0';
  modal.style.transition = 'opacity 0.2s ease';
  
  modal.innerHTML = `
    <div class="transaction-modal enhanced">
      <div class="modal-header">
        <h2 id="modal-title">Add New Transaction</h2>
        <button class="close-modal-btn" id="close-transaction-modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <form class="transaction-form" id="transaction-form">
        <div class="form-group">
          <label for="transaction-description">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            Description *
          </label>
          <input type="text" id="transaction-description" name="description" 
                 placeholder="What did you spend on?" required>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="transaction-amount">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              Amount (${CURRENCY}) *
            </label>
            <input type="number" id="transaction-amount" name="amount" 
                   placeholder="0.00" min="0.01" step="0.01" required>
          </div>
          <div class="form-group">
            <label for="transaction-date">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Date <span id="date-label-suffix">(defaults to today)</span>
            </label>
            <input type="date" id="transaction-date" name="date">
            <div class="field-hint" id="date-hint">💡 Leave as is to use today's date</div>
          </div>
        </div>
        
        <div class="form-group category-group">
          <label for="transaction-category">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z"></path>
            </svg>
            Category *
          </label>
          <div class="custom-select-wrapper">
            <select id="transaction-category" name="category" required>
              <option value="">Choose a category...</option>
            </select>
            <div class="select-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </div>
          </div>
          <div class="field-hint" id="category-hint">💡 ${state.categories.length} categories available. Manage them in settings.</div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancel-transaction">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" id="submit-transaction">
            Add Transaction
          </button>
        </div>
      </form>
    </div>
  `;
  
  return modal;
}

function updateTransactionModalContent(modal, isEdit, editTransaction, currentDate) {
  // Update title
  modal.querySelector('#modal-title').textContent = isEdit ? 'Edit Transaction' : 'Add New Transaction';
  
  // Update form fields
  const descInput = modal.querySelector('#transaction-description');
  const amountInput = modal.querySelector('#transaction-amount');
  const dateInput = modal.querySelector('#transaction-date');
  const categorySelect = modal.querySelector('#transaction-category');
  const submitBtn = modal.querySelector('#submit-transaction');
  const dateLabelSuffix = modal.querySelector('#date-label-suffix');
  const dateHint = modal.querySelector('#date-hint');
  
  // Clear and update form values
  descInput.value = isEdit ? editTransaction.description : '';
  amountInput.value = isEdit ? editTransaction.amount : '';
  dateInput.value = isEdit ? new Date(editTransaction.date).toISOString().split('T')[0] : currentDate;
  
  // Update date label and hint for edit mode
  if (isEdit) {
    dateLabelSuffix.style.display = 'none';
    dateHint.style.display = 'none';
  } else {
    dateLabelSuffix.style.display = 'inline';
    dateHint.style.display = 'block';
  }
  
  // Update category options efficiently
  categorySelect.innerHTML = `
    <option value="">Choose a category...</option>
    ${state.categories.map(cat => `
      <option value="${cat.name}" data-allocation="${cat.allocation}"
              ${isEdit && editTransaction.category === cat.name ? 'selected' : ''}>
        ${cat.name} • ${cat.allocation === '33' ? '33.33%' : '66.67%'} allocation
      </option>
    `).join('')}
  `;
  
  // Update submit button
  submitBtn.textContent = isEdit ? 'Update Transaction' : 'Add Transaction';
  
  // Update category hint
  modal.querySelector('#category-hint').textContent = `💡 ${state.categories.length} categories available. Manage them in settings.`;
}

function setupTransactionModalListeners(isEdit, editTransaction) {
  const overlay = document.getElementById('transaction-modal-overlay');
  const form = document.getElementById('transaction-form');
  const closeBtn = document.getElementById('close-transaction-modal');
  const cancelBtn = document.getElementById('cancel-transaction');
  
  function closeModal() {
    overlay.style.opacity = '0';
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 200);
  }
  
  // Remove existing event listeners to prevent memory leaks
  const newCloseBtn = closeBtn.cloneNode(true);
  const newCancelBtn = cancelBtn.cloneNode(true);
  closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
  
  // Add event listeners to new elements
  newCloseBtn.addEventListener('click', closeModal);
  newCancelBtn.addEventListener('click', closeModal);
  
  // Optimized overlay click handler
  const handleOverlayClick = (e) => {
    if (e.target === overlay) closeModal();
  };
  overlay.addEventListener('click', handleOverlayClick);
  
  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
        <circle cx="12" cy="12" r="10"></circle>
      </svg>
      ${isEdit ? 'Updating...' : 'Saving...'}
    `;
    
    const formData = new FormData(form);
    const description = formData.get('description').trim();
    const amount = parseFloat(formData.get('amount'));
    const category = formData.get('category');
    const date = formData.get('date');
    
    // Validation with specific error messages
    if (!description) {
      showNotification('Please enter a transaction description.', 'error');
      resetSubmitButton();
      return;
    }
    
    if (!category) {
      showNotification('Please select a category.', 'error');
      resetSubmitButton();
      return;
    }
    
    if (isNaN(amount) || amount <= 0) {
      showNotification('Please enter a valid amount greater than 0.', 'error');
      resetSubmitButton();
      return;
    }
    
    if (!date) {
      showNotification('Please select a valid date.', 'error');
      resetSubmitButton();
      return;
    }
    
    const categoryData = state.categories.find(c => c.name === category);
    if (!categoryData) {
      showNotification('Invalid category selected.', 'error');
      resetSubmitButton();
      return;
    }
    
    try {
      const transactionData = {
        amount: Math.round(amount * 100) / 100, // Ensure 2 decimal precision
        description,
        category: categoryData.name,
        allocation: categoryData.allocation,
        date: new Date(date).toISOString()
      };
      
      console.log('Saving transaction data:', transactionData);
      
      if (isEdit) {
        // Update existing transaction
        const updatedTransaction = await supabaseService.updateTransaction(editTransaction.id, transactionData);
        const index = state.transactions.findIndex(tx => tx.id === editTransaction.id);
        if (index !== -1) {
          state.transactions[index] = updatedTransaction;
        }
        showNotification('💚 Transaction updated successfully!', 'success');
      } else {
        // Add new transaction
        const savedTransaction = await supabaseService.addTransaction(transactionData);
        console.log('Transaction saved successfully:', savedTransaction);
        state.transactions.unshift(savedTransaction); // Add to beginning for better UX
        showNotification('💚 Transaction added successfully!', 'success');
      }
      
      render();
      closeModal();
    } catch (error) {
      console.error('Error saving transaction:', error);
      let errorMessage = 'Failed to save transaction. Please try again.';
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Check your internet connection.';
      } else if (error.message.includes('database')) {
        errorMessage = 'Database error. Please try again later.';
      }
      
      showNotification(errorMessage, 'error');
      resetSubmitButton();
    }
    
    function resetSubmitButton() {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

async function handleDeleteTransaction(transactionId) {
  if (!transactionId) {
    console.error('No transaction ID provided');
    alert('Unable to delete transaction: invalid ID');
    return;
  }
  
  console.log('Attempting to delete transaction with ID:', transactionId);
  
  if (!confirm('Are you sure you want to delete this transaction?')) return;

  try {
    // Find the transaction to ensure it exists
    const transaction = state.transactions.find(t => t.id === transactionId);
    if (!transaction) {
      console.error('Transaction not found in state:', transactionId);
      console.log('Available transaction IDs:', state.transactions.map(t => t.id));
      alert('Transaction not found in local state');
      return;
    }

    console.log('Found transaction to delete:', transaction);

    // First update the UI immediately for better UX (optimistic update)
    state.transactions = state.transactions.filter(t => t.id !== transactionId);
    render();

    // Then call the backend to actually delete
    await supabaseService.deleteTransaction(transactionId);
    console.log('Transaction successfully deleted from database');

  } catch (error) {
    console.error('Error deleting transaction:', error);
    // Revert the optimistic update on error
    const allTransactions = await supabaseService.getTransactions();
    state.transactions = allTransactions;
    render();
    alert('Failed to delete transaction. Please try again.');
  }
}

// Performance optimization: Cache categories modal
let categoriesModalCache = null;

function handleManageCategories() {
  showCategoriesModal();
}

function showCategoriesModal() {
  // Create modal only once and reuse
  if (!categoriesModalCache) {
    categoriesModalCache = createCategoriesModalElement();
  }
  
  // Update categories list content
  updateCategoriesModalContent(categoriesModalCache);
  
  // Show modal with optimized animation
  document.body.appendChild(categoriesModalCache);
  requestAnimationFrame(() => {
    categoriesModalCache.style.opacity = '1';
  });
  
  setupCategoriesModalListeners();
}

function createCategoriesModalElement() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'categories-modal-overlay';
  modal.style.opacity = '0';
  modal.style.transition = 'opacity 0.2s ease';
  
  modal.innerHTML = `
    <div class="categories-modal enhanced">
      <div class="modal-header">
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z"></path>
          </svg>
          Manage Categories
        </h2>
        <button class="close-modal-btn" id="close-categories-modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="categories-content">
        <div class="existing-categories">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
            </svg>
            Current Categories (<span id="categories-count">${state.categories.length}</span>)
          </h3>
          <div class="categories-list" id="categories-list">
          </div>
        </div>
        
        <div class="add-category-section">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add New Category
          </h3>
          <form class="category-form" id="category-form">
            <div class="form-row">
              <div class="form-group">
                <label for="category-name">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                  </svg>
                  Category Name *
                </label>
                <input type="text" id="category-name" name="name" 
                       placeholder="e.g., Entertainment, Dining, Travel..." required>
              </div>
              <div class="form-group">
                <label for="category-allocation">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12,6 12,12 16,14"></polyline>
                  </svg>
                  Allocation *
                </label>
                <div class="custom-select-wrapper">
                  <select id="category-allocation" name="allocation" required>
                    <option value="">Choose allocation...</option>
                    <option value="33">🥉 33.33% Section (1/3 of budget)</option>
                    <option value="67">🥇 66.67% Section (2/3 of budget)</option>
                  </select>
                  <div class="select-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                  </div>
                </div>
                <div class="field-hint">💡 33% for necessities, 67% for discretionary spending</div>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-create-category">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create Category
            </button>
          </form>
        </div>
      </div>
      
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" id="cancel-categories">
          Cancel
        </button>
        <button type="button" class="btn btn-success" id="save-categories">
          Save Changes
        </button>
      </div>
    </div>
  `;
  
  return modal;
}

function updateCategoriesModalContent(modal) {
  // Update categories count
  modal.querySelector('#categories-count').textContent = state.categories.length;
  
  // Update categories list
  const categoriesList = modal.querySelector('#categories-list');
  categoriesList.innerHTML = renderCategoriesList();
  
  // Reset form
  const form = modal.querySelector('#category-form');
  form.reset();
}

function renderCategoriesList() {
  return state.categories.map((cat, index) => `
    <div class="category-item" data-index="${index}">
      <div class="category-info">
        <span class="category-name">${cat.name}</span>
        <span class="category-allocation allocation-${cat.allocation}">
          ${cat.allocation === '33' ? '33.33%' : '66.67%'} allocation
        </span>
      </div>
      <button class="btn-icon delete-category-btn" data-index="${index}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3,6 5,6 21,6"></polyline>
          <path d="m19,6 v14 a2,2 0 0,1 -2,2 H7 a2,2 0 0,1 -2,-2 V6 m3,0 V4 a2,2 0 0,1 2,-2 h4 a2,2 0 0,1 2,2 v2"></path>
        </svg>
      </button>
    </div>
  `).join('');
}

function setupCategoriesModalListeners() {
  const overlay = document.getElementById('categories-modal-overlay');
  const form = document.getElementById('category-form');
  const closeBtn = document.getElementById('close-categories-modal');
  const cancelBtn = document.getElementById('cancel-categories');
  const saveBtn = document.getElementById('save-categories');
  const categoriesList = document.getElementById('categories-list');
  
  function closeModal() {
    overlay.remove();
  }
  
  // Close modal events
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  
  // Add category form
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const name = formData.get('name').trim();
    const allocation = formData.get('allocation');
    
    if (!name || !allocation) {
      showNotification('Please fill in all fields.', 'error');
      return;
    }
    
    // Check if category already exists
    if (state.categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
      showNotification('Category already exists.', 'error');
      return;
    }
    
    state.categories.push({ name, allocation });
    categoriesList.innerHTML = renderCategoriesList();
    form.reset();
    showNotification('Category added successfully!', 'success');
  });
  
  // Delete category
  categoriesList.addEventListener('click', (e) => {
    if (e.target.closest('.delete-category-btn')) {
      const index = parseInt(e.target.closest('.delete-category-btn').dataset.index);
      const categoryName = state.categories[index].name;
      
      // Check if category is being used in transactions
      const isUsed = state.transactions.some(tx => tx.category === categoryName);
      
      if (isUsed) {
        if (!confirm(`Category "${categoryName}" is used in existing transactions. Are you sure you want to delete it?`)) {
          return;
        }
      }
      
      state.categories.splice(index, 1);
      categoriesList.innerHTML = renderCategoriesList();
      showNotification('Category deleted successfully!', 'success');
    }
  });
  
  // Save changes
  saveBtn.addEventListener('click', async () => {
    try {
      await saveUserSettings();
      render();
      closeModal();
      showNotification('Categories updated successfully!', 'success');
    } catch (error) {
      console.error('Error saving categories:', error);
      showNotification('Failed to save categories. Please try again.', 'error');
    }
  });
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

    // Allocation data - 1/3 and 2/3 allocation with 2 decimal precision
    const allocation33Total = Math.round((state.salary * (1/3)) * 100) / 100;
    const allocation67Total = Math.round((state.salary * (2/3)) * 100) / 100;

    const spent33 = state.transactions
        .filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getFullYear() === year && txDate.getMonth() === month && tx.allocation === '33';
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

    const spent67 = state.transactions
        .filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getFullYear() === year && txDate.getMonth() === month && tx.allocation === '67';
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

    const allocation33 = {
        name: '33.33% Section (1/3)',
        total: allocation33Total,
        spent: spent33,
        remaining: allocation33Total - spent33
    };

    const allocation67 = {
        name: '66.67% Section (2/3)', 
        total: allocation67Total,
        spent: spent67,
        remaining: allocation67Total - spent67
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
        allocation33,
        allocation67,
        categorySpending,
        monthlyTrends
    };
}

// --- OPTIMIZED RENDER FUNCTIONS ---
let lastRenderState = {};
let isInitialRender = true;

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

  // Initial render or forced full render
  if (isInitialRender || !app.querySelector('header')) {
    app.innerHTML = `
      <header class="app-header">
          ${renderHeader()}
      </header>
      <main class="main-content">
          ${renderDashboard()}
      </main>
    `;
    isInitialRender = false;
    updateLastRenderState();
    return;
  }

  // Incremental updates for better performance
  updateHeaderIfNeeded();
  updateDashboardIfNeeded();
  updateLastRenderState();
}

function updateHeaderIfNeeded() {
  const currentDateStr = state.currentDate;
  const currentView = state.currentAllocationView;
  
  if (lastRenderState.currentDate !== currentDateStr || 
      lastRenderState.currentAllocationView !== currentView) {
    const header = document.querySelector('.app-header');
    if (header) {
      header.innerHTML = renderHeader();
    }
  }
}

function updateDashboardIfNeeded() {
  const transactionsChanged = JSON.stringify(state.transactions) !== JSON.stringify(lastRenderState.transactions);
  const salaryChanged = state.salary !== lastRenderState.salary;
  const categoriesChanged = JSON.stringify(state.categories) !== JSON.stringify(lastRenderState.categories);
  
  if (transactionsChanged || salaryChanged || categoriesChanged || 
      state.currentDate !== lastRenderState.currentDate ||
      state.currentAllocationView !== lastRenderState.currentAllocationView) {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.innerHTML = renderDashboard();
    }
  }
}

function updateLastRenderState() {
  lastRenderState = {
    currentDate: state.currentDate,
    currentAllocationView: state.currentAllocationView,
    salary: state.salary,
    transactions: JSON.parse(JSON.stringify(state.transactions)),
    categories: JSON.parse(JSON.stringify(state.categories))
  };
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
        <button id="prev-month-btn" aria-label="Previous month">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>
        <button id="current-month-btn" class="current-month-btn" title="Click to select a specific month">
          <div class="current-month">${getMonthYear(currentDate.toISOString())}</div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </button>
        <button id="next-month-btn" aria-label="Next month">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>
      <div class="view-toggle">
        <button id="toggle-all" class="${state.currentAllocationView === 'all' ? 'active' : ''}">All Expenses</button>
        <button id="toggle-67" class="${state.currentAllocationView === '67' ? 'active' : ''}">66.67% Section</button>
        <button id="toggle-33" class="${state.currentAllocationView === '33' ? 'active' : ''}">33.33% Section</button>
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
        <div class="card chart-card">
            <h3>Category-wise Spending</h3>
            <p>Distribution of expenses</p>
            ${renderPieChart(computed.categorySpending, computed.totalSpent)}
        </div>
        <div class="card chart-card">
            <h3>Monthly Trends</h3>
            <p>Comparison across months</p>
            ${renderMonthlyTrendsChart(computed.monthlyTrends)}
        </div>
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
                <button class="btn-icon" id="edit-salary-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="m18.5 2.5 a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
            </div>
            <div class="amount positive">${formatCurrency(state.salary)}</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Total Spent</h3>
            </div>
            <div class="amount negative">${formatCurrency(computed.totalSpent)}</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Remaining</h3>
            </div>
            <div class="amount ${computed.remaining >= 0 ? 'positive' : 'negative'}">${formatCurrency(computed.remaining)}</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Spent Percentage</h3>
            </div>
            <div class="amount">${computed.spentPercentage.toFixed(1)}%</div>
        </div>
    </div>
    `;
}

function renderAllocationOverview(computed) {
    const allocation33Percentage = computed.allocation33.total > 0 ? (computed.allocation33.spent / computed.allocation33.total) * 100 : 0;
    const allocation67Percentage = computed.allocation67.total > 0 ? (computed.allocation67.spent / computed.allocation67.total) * 100 : 0;
    
    return `
    <div class="allocation-overview">
        <div class="card">
            <div class="card-header">
                <h3>33.33% Allocation (1/3 - Wants)</h3>
                <div class="allocation-subtitle">${formatAllocationAmount(computed.allocation33.total)} budgeted</div>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill allocation-33" style="width: ${Math.min(allocation33Percentage, 100)}%"></div>
                </div>
                <div class="progress-text">${allocation33Percentage.toFixed(1)}%</div>
            </div>
            <div class="allocation-details">
                <div class="detail">
                    <span class="label">Spent:</span>
                    <span class="value negative">${formatCurrency(computed.allocation33.spent)}</span>
                </div>
                <div class="detail">
                    <span class="label">Remaining:</span>
                    <span class="value ${computed.allocation33.remaining >= 0 ? 'positive' : 'negative'}">${formatCurrency(computed.allocation33.remaining)}</span>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>66.67% Allocation (2/3 - Needs)</h3>
                <div class="allocation-subtitle">${formatAllocationAmount(computed.allocation67.total)} budgeted</div>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill allocation-67" style="width: ${Math.min(allocation67Percentage, 100)}%"></div>
                </div>
                <div class="progress-text">${allocation67Percentage.toFixed(1)}%</div>
            </div>
            <div class="allocation-details">
                <div class="detail">
                    <span class="label">Spent:</span>
                    <span class="value negative">${formatCurrency(computed.allocation67.spent)}</span>
                </div>
                <div class="detail">
                    <span class="label">Remaining:</span>
                    <span class="value ${computed.allocation67.remaining >= 0 ? 'positive' : 'negative'}">${formatCurrency(computed.allocation67.remaining)}</span>
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
    <div class="card transactions-card">
        <div class="card-header">
            <h3>Recent Transactions</h3>
            <div class="transaction-count">${computed.filteredTransactions.length} transaction${computed.filteredTransactions.length !== 1 ? 's' : ''}</div>
        </div>
        <div class="transactions-list-container">
            <div class="transactions-list">
                ${computed.filteredTransactions.slice(0, 15).map(tx => {
                    const colors = CATEGORY_COLORS[tx.category] || CATEGORY_COLORS.default;
                    return `
                    <div class="transaction-item" onclick="showTransactionModal(${JSON.stringify(tx).replace(/"/g, '&quot;')})">
                        <div class="transaction-left">
                            <div class="transaction-category" style="background-color: ${colors.bg}; color: ${colors.text}">
                                ${tx.category}
                            </div>
                            <div class="transaction-details">
                                <div class="transaction-description">${tx.description}</div>
                                <div class="transaction-meta">${formatDate(tx.date)} • ${tx.allocation === '33' ? '33.33%' : '66.67%'} allocation</div>
                            </div>
                        </div>
                        <div class="transaction-right">
                            <div class="transaction-amount negative">${formatCurrency(tx.amount)}</div>
                            <button class="btn-icon delete-btn" data-delete-transaction="${tx.id}" onclick="event.stopPropagation();">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3,6 5,6 21,6"></polyline>
                                    <path d="m19,6 v14 a2,2 0 0,1 -2,2 H7 a2,2 0 0,1 -2,-2 V6 m3,0 V4 a2,2 0 0,1 2,-2 h4 a2,2 0 0,1 2,2 v2"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    `;
                }).join('')}
                ${computed.filteredTransactions.length > 15 ? 
                    `<div class="transaction-item show-more">
                        <div class="show-more-text">And ${computed.filteredTransactions.length - 15} more transactions...</div>
                    </div>` 
                    : ''
                }
            </div>
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

// --- CHART RENDERING FUNCTIONS ---
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

// --- PERFORMANCE OPTIMIZATIONS ---
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle expensive operations
function throttle(func, wait) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, wait);
        }
    };
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    const app = document.getElementById('app');
    if (!app) return;

    // Use event delegation - single event listener on the app container
    // This prevents losing listeners when DOM is re-rendered
    app.addEventListener('click', (e) => {
        const target = e.target;

        // Month navigation
        if (target.closest('#prev-month-btn')) handleMonthChange('prev');
        else if (target.closest('#next-month-btn')) handleMonthChange('next');
        else if (target.closest('#current-month-btn')) handleDatePicker();
        
        // View toggles
        else if (target.closest('#toggle-all')) handleViewToggle('all');
        else if (target.closest('#toggle-67')) handleViewToggle('67');
        else if (target.closest('#toggle-33')) handleViewToggle('33');
        
        // Actions
        else if (target.closest('#add-transaction-btn')) handleAddTransaction();
        else if (target.closest('#edit-salary-btn')) handleSalaryEdit();
        else if (target.closest('#manage-categories-btn')) handleManageCategories();
        
        // Delete transaction buttons
        else if (target.closest('[data-delete-transaction]')) {
            const transactionId = target.closest('[data-delete-transaction]').getAttribute('data-delete-transaction');
            if (transactionId) handleDeleteTransaction(transactionId);
        }
    });

    // Add optimized scroll handlers for better performance
    const debouncedScrollHandler = debounce(() => {
        // Handle any scroll-based optimizations if needed
        requestAnimationFrame(() => {
            // Optimize any scroll-dependent rendering
        });
    }, 16); // ~60fps

    window.addEventListener('scroll', debouncedScrollHandler, { passive: true });
}

// Event delegation handles all clicks, no need for global functions

// --- NOTIFICATION SYSTEM ---
function showNotification(message, type = 'info') {
  // Remove existing notification if any
  const existing = document.querySelector('.notification-toast');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `notification-toast notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">
        ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
      </div>
      <span class="notification-message">${message}</span>
    </div>
    <button class="notification-close">×</button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-close after 4 seconds
  const autoClose = setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.add('notification-fade-out');
      setTimeout(() => notification.remove(), 300);
    }
  }, 4000);
  
  // Close button
  notification.querySelector('.notification-close').addEventListener('click', () => {
    clearTimeout(autoClose);
    notification.classList.add('notification-fade-out');
    setTimeout(() => notification.remove(), 300);
  });
  
  // Show animation
  setTimeout(() => notification.classList.add('notification-show'), 10);
}

// --- INITIALIZE APP ---
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});