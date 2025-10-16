// storage.js
const STORAGE_KEY = 'finance:data';
const BUDGET_KEY = 'finance:budget';

export function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load transactions:', err);
    return [];
  }
}

export function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save transactions:', err);
  }
}

export function addTransaction(transaction) {
  const transactions = loadTransactions();
  transactions.push(transaction);
  saveTransactions(transactions);
  return transactions;
}

export function clearTransactions() {
  localStorage.removeItem(STORAGE_KEY);
}

export function editTransaction(id, updatedData) {
  const transactions = loadTransactions();
  const txnIndex = transactions.findIndex(t => t.id === id);
  if (txnIndex !== -1) {
    transactions[txnIndex] = {
      ...transactions[txnIndex],
      ...updatedData,
      updated_at: new Date().toISOString()
    };
    saveTransactions(transactions);
  }
  return transactions;
}

export function loadBudget() {
  try {
    const raw = localStorage.getItem(BUDGET_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Failed to load budget:', err);
    return null;
  }
}

export function saveBudget(budget) {
  try {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budget));
  } catch (err) {
    console.error('Failed to save budget:', err);
  }
}

export function clearBudget() {
  localStorage.removeItem(BUDGET_KEY);
}