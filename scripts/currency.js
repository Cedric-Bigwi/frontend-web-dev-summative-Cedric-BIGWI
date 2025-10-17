// currency.js

export const currencyState = {
  currentCurrency: 'USD',
  rates: {
    USD: 1,
    EUR: 0.93,
    RWF: 1400
  },
  trackedAmounts: {},
  onCurrencyChangeCallbacks: [] // <-- new
};


export function formatCurrency(amount) {
  const currency = currencyState.currentCurrency;
  switch (currency) {
    case 'USD': return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'EUR': return `€${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'RWF': return `RWF ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
}


export function trackAmount(element, value, currency) {
  currencyState.trackedAmounts[element.id] = {
    originalValue: parseFloat(value),
    originalCurrency: currency
  };
  element.textContent = formatCurrency(convertAmount(value, currency, currencyState.currentCurrency));

}

export function convertAmount(value, fromCurrency, toCurrency) {
  const usdValue = value / currencyState.rates[fromCurrency]; 
  return usdValue * currencyState.rates[toCurrency];
}

export function updateFormCurrencies() {
  // Expense form
  const expenseSpan = document.getElementById('expenseFormCurrency');
  if (expenseSpan) expenseSpan.textContent = currencyState.currentCurrency;

  // Budget form (all spans with class 'budgetCurrency')
  const budgetSpans = document.querySelectorAll('.budgetCurrency');
  budgetSpans.forEach(span => span.textContent = currencyState.currentCurrency);
}

export function updateAllAmounts(newCurrency) {
  currencyState.currentCurrency = newCurrency;

  Object.keys(currencyState.trackedAmounts).forEach(id => {
    const elem = document.getElementById(id);
    if (!elem) return;

    const { originalValue, originalCurrency } = currencyState.trackedAmounts[id];
    const newValue = convertAmount(originalValue, originalCurrency, newCurrency);
    elem.textContent = formatCurrency(newValue);
  });

  updateFormCurrencies();

  // Notify listeners to re-render messages
  currencyState.onCurrencyChangeCallbacks.forEach(cb => cb(newCurrency));
}

// Register callback for currency change
export function onCurrencyChange(callback) {
  currencyState.onCurrencyChangeCallbacks.push(callback);
}

export function setupCurrencySwitcher(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  // Restore previous selection from localStorage
  const savedCurrency = localStorage.getItem('selectedCurrency');
  if (savedCurrency && currencyState.rates[savedCurrency]) {
    select.value = savedCurrency;
    updateAllAmounts(savedCurrency);
  }

  select.addEventListener('change', (e) => {
    const newCurrency = e.target.value;
    localStorage.setItem('selectedCurrency', newCurrency); // save selection
    updateAllAmounts(newCurrency);
  });
}
