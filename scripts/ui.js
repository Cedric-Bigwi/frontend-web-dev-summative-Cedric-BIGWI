// ui.js
import { deleteTransaction } from './state.js';
import { loadTransactions, addTransaction, editTransaction } from './storage.js';
import { currencyState, trackAmount, convertAmount, formatCurrency } from './currency.js';

export function handleFormSubmit(form) {
  const category = form.querySelector('#category').value.trim();
  const description = form.querySelector('#description').value.trim();
  const amount = parseFloat(form.querySelector('#amount').value);
  const date = form.querySelector('#date').value;

  const editingId = form.dataset.editingId;
  const selectedCurrency = currencyState.currentCurrency; // store user's selected currency

  if (editingId) {
    // Update the transaction in-place
    editTransaction(editingId, { 
      date, 
      description, 
      category, 
      amount, 
      originalCurrency: selectedCurrency,
      updated_at: new Date().toISOString()
    });
    delete form.dataset.editingId;
  } else {
    const transactions = loadTransactions();
    const id = `txn_${transactions.length + 1}`;
    const txn = {
      id,
      date,
      description,
      category,
      amount,
      originalCurrency: selectedCurrency, // save original currency
      created_at: new Date().toISOString(),
      updated_at: null
    };
    addTransaction(txn);
  }

  renderTransactionList();
  form.reset();
  document.getElementById('expenseForm').classList.add('hidden');
}

export function renderTransactionList(transactions = null) {
  function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const tbody = document.querySelector('tbody');
  if (!tbody) return;

  const all = transactions || loadTransactions();
  tbody.innerHTML = '';

  if (all.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No transactions yet</td></tr>`;
    return;
  }

  all.forEach(txn => {
    const tr = document.createElement('tr');

    // Convert amount from its original currency to current currency for display
    const displayAmount = convertAmount(txn.amount, txn.originalCurrency || 'RWF', currencyState.currentCurrency);

    tr.innerHTML = `
      <td>${txn.date}</td>
      <td>${txn.description}</td>
      <td>${capitalizeFirstLetter(txn.category)}</td>
      <td id="txn-${txn.id}-amount">${formatCurrency(displayAmount)}</td>
      <td>
        <button data-id="${txn.id}" class="edit-btn" title="Edit"> 
          <i class="fa-solid fa-pencil"></i> 
        </button>
        <button data-id="${txn.id}" class="delete-btn" title="Delete"> 
          <i class="fa-solid fa-trash"></i> 
        </button>
      </td>
    `;
    tbody.appendChild(tr);

    // Track amount for dynamic conversion
    const amountCell = tr.querySelector(`#txn-${txn.id}-amount`);
    trackAmount(amountCell, txn.amount, txn.originalCurrency || 'RWF');
  });

  // Edit buttons
  tbody.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      populateFormForEdit(id);
    });
  });

  // Delete buttons
  tbody.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      if (confirm('Are you sure you want to delete this transaction?')) {
        deleteTransaction(id);
        renderTransactionList();
      }
    });
  });
}

function populateFormForEdit(id) {
  const transactions = loadTransactions();
  const txn = transactions.find(t => t.id === id);
  if (!txn) return;

  const form = document.getElementById('transaction-form');
  form.querySelector('#date').value = txn.date;
  form.querySelector('#description').value = txn.description;
  form.querySelector('#category').value = txn.category;
  form.querySelector('#amount').value = txn.amount; // keep original value

  form.dataset.editingId = id; // store editing id
  document.getElementById('expenseForm').classList.remove('hidden');
}
