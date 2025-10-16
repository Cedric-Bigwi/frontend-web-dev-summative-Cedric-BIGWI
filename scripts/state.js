// state.js
import { saveTransactions, loadTransactions } from './storage.js';


function enableTableSort() {
    let table_rows = document.querySelectorAll('tbody tr'),
    table_headings = document.querySelectorAll('thead th');
  // 2. Sorting | Ordering data of HTML table
  
    table_headings.forEach((head, i) => {
        let sort_asc = true;
        head.onclick = () => {
            table_headings.forEach(head => head.classList.remove('active'));
            head.classList.add('active');
  
            document.querySelectorAll('td').forEach(td => td.classList.remove('active'));
            table_rows.forEach(row => {
                row.querySelectorAll('td')[i].classList.add('active');
            })
  
            head.classList.toggle('asc', sort_asc);
            sort_asc = head.classList.contains('asc') ? false : true;
  
            sortTable(i, sort_asc);
        }
    })
  
  
    function sortTable(column, sort_asc) {
        [...table_rows].sort((a, b) => {
            let first_row = a.querySelectorAll('td')[column].textContent.toLowerCase(),
                second_row = b.querySelectorAll('td')[column].textContent.toLowerCase();
  
            return sort_asc ? (first_row < second_row ? 1 : -1) : (first_row < second_row ? -1 : 1);
        })
            .map(sorted_row => document.querySelector('tbody').appendChild(sorted_row));
    }
}



function addTransaction(txn) {
  state.transactions.push(txn);
  saveTransactions(state.transactions);
}


function updateTransaction(id, updatedTxn) {
  const index = state.transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    state.transactions[index] = { ...state.transactions[index], ...updatedTxn, updatedAt: new Date().toISOString() };
    saveTransactions(state.transactions);
  }
}


function deleteTransaction(id) {
  let transactions = loadTransactions();
  const txnIndex = transactions.findIndex(t => t.id === id);
  if (txnIndex === -1) return transactions;

  // Remove the transaction
  transactions.splice(txnIndex, 1);

  // Reassign IDs for remaining transactions
  transactions = transactions.map((t, i) => ({ ...t, id: `txn_${i + 1}` }));

  saveTransactions(transactions);
  return transactions;
}

export { addTransaction, updateTransaction, deleteTransaction,enableTableSort};