// budget.js 

import { loadTransactions,saveBudget, loadBudget, clearBudget } from './storage.js';
import { renderBudgetGraphs } from './budgetGraph.js';


let budgetState = loadBudget() || {};

function showPopupMessage(text, color = 'black') {
  const popup = document.getElementById('budgetMessagePopup');
  const msg = document.getElementById('budgetMessage');
  msg.textContent = text;
  msg.style.color = color;
  popup.classList.remove('hidden');
}

/**
 * Validate budget form before saving
 */
function validateBudgetForm(form) {
  const start = form.querySelector('#budget-start').value;
  const end = form.querySelector('#budget-end').value;

  // Basic date checks
  if (!start || !end) {
    showPopupMessage('Please select both start and end dates.', 'red');
    return false;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate) || isNaN(endDate)) {
    showPopupMessage('Invalid date format.', 'red');
    return false;
  }
  if (startDate >= endDate) {
    showPopupMessage('Start date must be before end date.', 'red');
    return false;
  }

  // Category values
  const categories = ['food', 'books', 'transport', 'entertainment', 'fees', 'others'];
  const amounts = {};

  for (const cat of categories) {
    const value = parseFloat(form.querySelector(`#budget-${cat}`).value);
    if (isNaN(value) || value <= 0) {
      showPopupMessage(`Please enter a valid amount for ${cat}.`, 'red');
      return false;
    }
    amounts[cat] = value;
  }

  // Check disparity — no category > 3× another
  const values = Object.values(amounts);
  const max = Math.max(...values);
  const min = Math.min(...values);
  if (min * 10 < max) {
    alert(
      `Budget disparity too large!\n\nHighest: ${max.toLocaleString()} Rwf\nLowest: ${min.toLocaleString()} Rwf\n` +
      `Tip: Ensure smallest category is at least 1/10 of the largest.`
    );
    return;
  }

  return { start, end, categories: amounts };
}

/**
 * Handle form submission
 */
/**
 * Handle form submission
 */
export function handleBudgetFormSubmit(form) {
  // Prevent creating a new budget if there is an active one
  if (hasActiveBudget()) {
    showPopupMessage(
      `⚠ A budget is already active (${budgetState.start} → ${budgetState.end}). ` +
      `Please delete it first to create a new one.`,
      'red'
    );
    return;
  }

  const validated = validateBudgetForm(form);
  if (!validated) return;

  const budget = {
    start: validated.start,
    end: validated.end,
    categories: validated.categories,
  };

  // Calculate total
  budget.total = Object.values(budget.categories).reduce((a, b) => a + b, 0);

  saveBudget(budget);
  budgetState = budget;

  // show success message
  showPopupMessage(`✅ Budget saved! Total: ${budget.total.toLocaleString()} Rwf`, 'green');

  // Reset and hide form
  form.reset();
  document.getElementById('budgetForm').classList.add('hidden');

  // Render graphs safely
  renderBudgetGraphs();
}


export function calculateBudgetUsage(transactions) {
  if (!budgetState || !budgetState.categories) return null;

  const spent = {
    food: 0, books: 0, transport: 0, entertainment: 0, fees: 0, others: 0,
  };

  const startDate = new Date(budgetState.start);
  const endDate = new Date(budgetState.end);

  transactions.forEach(txn => {
    const txnDate = new Date(txn.date);
    if (txnDate >= startDate && txnDate <= endDate && spent.hasOwnProperty(txn.category)) {
      spent[txn.category] += txn.amount;
    }
  });

  const remaining = {};
  Object.keys(spent).forEach(cat => {
    remaining[cat] = budgetState.categories[cat] - spent[cat];
  });

  const totalRemaining = Object.values(remaining).reduce((a, b) => a + b, 0);

  return { spent, remaining, totalRemaining, totalBudget: budgetState.total };
}

export function showBudgetStatus() {
  const transactions = loadTransactions();
  const budgetUsage = calculateBudgetUsage(transactions);
  if (!budgetUsage) return;

  let msg = `Budget Status (${budgetState.start} → ${budgetState.end}):\n\n`;
  Object.keys(budgetUsage.remaining).forEach(cat => {
    msg += `${cat.charAt(0).toUpperCase() + cat.slice(1)}: ${budgetUsage.remaining[cat].toLocaleString()} Rwf remaining\n`;
  });
  msg += `\nTotal Remaining: ${budgetUsage.totalRemaining.toLocaleString()} Rwf`;

  alert(msg);
}

export function deleteBudget() {
  if (!budgetState || !budgetState.start) {
    alert('No budget set.');
    return;
  }
  if (confirm('Delete the current budget? This action cannot be undone.')) {
    clearBudget();
    budgetState = {};
    alert('Budget deleted successfully.');
    renderBudgetGraphs(); // reflect empty budget in chart
  }
}

export function hasActiveBudget() {
  if (!budgetState || !budgetState.end) return false;
  const now = new Date();
  return now <= new Date(budgetState.end);
}