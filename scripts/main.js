import { renderTransactionList, handleFormSubmit } from './ui.js';
import { enableTableSort } from './state.js';
import { validateDescription, validateAmount, validateDate, validateForm } from './validators.js';
import { searchTransactions } from './search.js';
import { handleBudgetFormSubmit, deleteBudget, hasActiveBudget} from './budget.js';
import { renderBudgetGraphs } from './budgetGraph.js';
import { refreshBudgetMessages } from './budgetMessage.js';
import { trackAmount, setupCurrencySwitcher } from './currency.js';

console.log('App initialized');


document.addEventListener('DOMContentLoaded', () => {
  const formSection = document.getElementById('expenseForm');
  const budgetFormSection = document.getElementById('budgetForm');
  const table=document.getElementById('transactionTable')

  renderTransactionList();
  renderBudgetGraphs();
  refreshBudgetMessages();

  if(table){
    searchTransactions();
    enableTableSort();
  }
  
  const settingsButton = document.getElementById('settings');
  const setting = document.querySelector('.setting');

  if (settingsButton && setting) {

    // Toggle dropdown on button click
    settingsButton.addEventListener('click', (e) => {
      e.stopPropagation();
      setting.classList.toggle('hidden');
    });

    // Close dropdown when clicking anywhere else
    document.addEventListener('click', () => {
      if (!setting.classList.contains('hidden')) {
        setting.classList.add('hidden');
      }
    });

    // Prevent closing when clicking inside the dropdown
    setting.addEventListener('click', (e) => e.stopPropagation());
  }


  // -------- Budget Form Handling --------
  if (budgetFormSection) {
    const addBudgetBtn = document.getElementById('addBudget');
    const cancelBudgetBtn = document.getElementById('budgetCancel');
    const budgetForm = document.getElementById('budget-form');
    const budgetPopup = document.getElementById('budgetMessagePopup');
    const closeBudgetPopup = document.getElementById('closeBudgetPopup');

    // Show budget form
    if(addBudgetBtn)addBudgetBtn.addEventListener('click', () => {
      if (hasActiveBudget()) {
        const choice = confirm(
          `A budget is already active.\nDo you want to delete it and create a new one?`
        );
        if (choice) {
          deleteBudget();
          budgetFormSection.classList.remove('hidden');
        }
      } else {
        budgetFormSection.classList.remove('hidden');
      }
    });

    // Cancel budget form
    cancelBudgetBtn.addEventListener('click', () => {
      budgetFormSection.classList.add('hidden');
    });

    // Submit budget form
    budgetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleBudgetFormSubmit(budgetForm);
      renderBudgetCapMessages(); // update summary cards
    });

    // Close popup
    closeBudgetPopup.addEventListener('click', () => {
      budgetPopup.classList.add('hidden');
    });
  }

  // -------- Expense Form Handling --------
  if (formSection) {
    const addBtn = document.getElementById('addTransaction');
    const cancelBtn = document.getElementById('cancel');
    const popup = document.getElementById('messagePopup');
    const closePopup = document.getElementById('closePopup');
    const form = document.getElementById('transaction-form');

    const descriptionEl = document.getElementById('description');
    const descriptionNoteEl = document.getElementById('descriptionNote');
    const amountEl = document.getElementById('amount');
    const amountNoteEl = document.getElementById('amountNote');
    const dateEl = document.getElementById('date');
    const dateNoteEl = document.getElementById('dateNote');

    addBtn.addEventListener('click', () => formSection.classList.remove('hidden'));

    descriptionEl.addEventListener('input', () => validateDescription(descriptionEl, descriptionNoteEl));
    amountEl.addEventListener('input', () => validateAmount(amountEl, amountNoteEl));
    dateEl.addEventListener('input', () => validateDate(dateEl, dateNoteEl));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm({ descriptionEl, descriptionNoteEl, amountEl, amountNoteEl, dateEl, dateNoteEl })) {
        return;
      }
      handleFormSubmit(form);
      renderBudgetCapMessages();
      formSection.classList.add('hidden');
      popup.classList.remove('hidden');
      form.reset();
    });

    if(closePopup)closePopup.addEventListener('click', () => popup.classList.add('hidden'));
    if(cancelBtn)cancelBtn.addEventListener('click', () => formSection.classList.add('hidden'));
  }

});
