// search.js

function compileRegex(input, flags = 'i') {
  try {
    return input ? new RegExp(input, flags) : null;
  } catch {
    return null; // invalid pattern
  }
}


function searchTransactions() {
  const search = document.querySelector('.search-container input'),
    table_rows = document.querySelectorAll('tbody tr');

  // 1. Searching for specific data of HTML table
  search.addEventListener('input', searchTable);

  function searchTable() {
      table_rows.forEach((row, i) => {
          let table_data = row.textContent.toLowerCase(),
              search_data = search.value.toLowerCase();

          row.classList.toggle('hide', table_data.indexOf(search_data) < 0);
          row.style.setProperty('--delay', i / 25 + 's');
      })
  }
}

export { compileRegex,  searchTransactions };
