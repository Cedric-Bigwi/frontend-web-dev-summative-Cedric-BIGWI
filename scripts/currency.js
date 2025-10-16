// Allowed currencies and conversion rates relative to USD
export const currencyState = {
  currentCurrency: 'USD',
  rates: {
    USD: 1,
    EUR: 0.93, // 1 USD = 0.93 EUR (example)
    RWF: 1400  // 1 USD = 1400 RWF (example)
  },
  // Map of elementId => { originalValue, originalCurrency }
  trackedAmounts: {}
};

// Format number with currency symbol
function formatAmount(amount, currency) {
  switch(currency) {
    case 'USD': return `$${amount.toFixed(2)}`;
    case 'EUR': return `€${amount.toFixed(2)}`;
    case 'RWF': return `RWF ${amount.toFixed(0)}`;
  }
}

// Track an element's amount
export function trackAmount(element, value, currency) {
  currencyState.trackedAmounts[element.id] = { originalValue: parseFloat(value), originalCurrency: currency };
  element.textContent = formatAmount(value, currencyState.currentCurrency);
}

// Convert value from original currency to target currency
function convertAmount(value, fromCurrency, toCurrency) {
  const usdValue = value / currencyState.rates[fromCurrency]; // convert to USD first
  return usdValue * currencyState.rates[toCurrency];
}

// Update all tracked amounts
export function updateAllAmounts(newCurrency) {
  currencyState.currentCurrency = newCurrency;

  Object.keys(currencyState.trackedAmounts).forEach(id => {
    const elem = document.getElementById(id);
    if(!elem) return;

    const { originalValue, originalCurrency } = currencyState.trackedAmounts[id];
    const newValue = convertAmount(originalValue, originalCurrency, newCurrency);
    elem.textContent = formatAmount(newValue, newCurrency);
  });
}

// Setup a dropdown selector
export function setupCurrencySwitcher(selectId) {
  const select = document.getElementById(selectId);
  if(!select) return;

  select.addEventListener('change', (e) => {
    updateAllAmounts(e.target.value);
  });
}
