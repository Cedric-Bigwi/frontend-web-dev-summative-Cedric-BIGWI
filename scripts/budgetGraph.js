// budgetGraph.js
import { loadTransactions, loadBudget } from './storage.js';
import { convertAmount, currencyState, formatCurrency } from './currency.js';

let weeklyChartInstance = null;
let categoryBarChartInstance = null;
let totalChartInstance = null;

function capitalizeFirstLetter(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

export function renderBudgetGraphs() {
  const transactions = loadTransactions();
  const budget = loadBudget();

  const weeklyCanvas = document.getElementById('weeklyChart');
  const categoryCanvas = document.getElementById('categoryBarChart');
  const totalCanvas = document.getElementById('totalBudgetChart');

  if (!budget) {
    // Show placeholder for all charts
    if (weeklyCanvas) showNoBudgetMessage(weeklyCanvas, 'No budget set yet.');
    if (categoryCanvas) showNoBudgetMessage(categoryCanvas, 'No budget set yet.');
    if (totalCanvas) showNoBudgetMessage(totalCanvas, 'No budget set yet.');
    return;
  }

  if (weeklyCanvas) renderWeeklyLineChart(transactions);
  if (categoryCanvas) renderCategoryBarChart(transactions, budget);
  if (totalCanvas) renderTotalBudgetChart(transactions, budget);
}

function showNoBudgetMessage(canvas, msg) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '1.4rem Arial';
  ctx.textAlign = 'center';
  ctx.fillText(msg, canvas.width / 2, canvas.height / 2);
}

function renderWeeklyLineChart(transactions) {
  const now = new Date();
  const last7days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const dailyTotals = last7days.map(date =>
    transactions
      .filter(t => t.date === date)
      .reduce(
        (sum, t) => sum + convertAmount(t.amount, t.originalCurrency || 'RWF', currencyState.currentCurrency),
        0
      )
  );

  const ctx = document.getElementById('weeklyChart')?.getContext('2d');
  if (!ctx) return;
  if (weeklyChartInstance) weeklyChartInstance.destroy();

  weeklyChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: last7days,
      datasets: [
        {
          label: `Daily Spending (${currencyState.currentCurrency})`,
          data: dailyTotals,
          borderColor: '#36A2EB',
          backgroundColor: '#9AD0F5',
          fill: true,
          tension: 0.3,
          pointRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.raw, currencyState.currentCurrency)}`
          }
        }
      },
      scales: { y: { beginAtZero: true } }
    }
  });
}

function renderCategoryBarChart(transactions, budget) {
  const spent = {};
  Object.keys(budget.categories).forEach(c => spent[c] = 0);

  transactions.forEach(txn => {
    if (spent.hasOwnProperty(txn.category)) {
      spent[txn.category] += convertAmount(txn.amount, txn.originalCurrency || 'RWF', currencyState.currentCurrency);
    }
  });

  const labels = Object.keys(spent).map(capitalizeFirstLetter);
  const spentValues = Object.values(spent);
  const budgetValues = Object.values(budget.categories).map(val =>
    convertAmount(val, budget.currency || 'RWF', currencyState.currentCurrency)
  );

  const ctx = document.getElementById('categoryBarChart')?.getContext('2d');
  if (!ctx) return;
  if (categoryBarChartInstance) categoryBarChartInstance.destroy();

  categoryBarChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: `Budget (${currencyState.currentCurrency})`,
          data: budgetValues,
          backgroundColor: 'rgb(0, 238, 255)',
        },
        {
          label: `Spent (${currencyState.currentCurrency})`,
          data: spentValues,
          backgroundColor: spentValues.map((v, i) =>
            v <= budgetValues[i] ? '#4BC0C0' : '#FF6384'
          ),
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            generateLabels: (chart) => [
              { text: 'Budget', fillStyle: 'rgb(0, 238, 255)' },
              { text: 'Spent (Under Budget)', fillStyle: '#4BC0C0' },
              { text: 'Spent (Over Budget)', fillStyle: '#FF6384' },
            ]
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.raw, currencyState.currentCurrency)}`
          }
        }
      },
      scales: { y: { beginAtZero: true } }
    },
  });
}

function renderTotalBudgetChart(transactions, budget) {
  const totalSpent = transactions.reduce(
    (sum, t) => sum + convertAmount(t.amount, t.originalCurrency || 'RWF', currencyState.currentCurrency),
    0
  );

  const totalBudget = convertAmount(budget.total, budget.currency || 'RWF', currencyState.currentCurrency);
  const remaining = Math.max(totalBudget - totalSpent, 0);

  const ctx = document.getElementById('totalBudgetChart')?.getContext('2d');
  if (!ctx) return;
  if (totalChartInstance) totalChartInstance.destroy();

  totalChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Spent', 'Remaining'],
      datasets: [{
        data: [totalSpent, remaining],
        backgroundColor: ['#FF6384', '#4BC0C0']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label}: ${formatCurrency(ctx.raw, currencyState.currentCurrency)}`
          }
        }
      }
    }
  });

  const msg = document.getElementById('dashboardSummary');
  if (msg) {
    msg.innerHTML = `
      <strong>Total Budget:</strong> ${formatCurrency(totalBudget, currencyState.currentCurrency)}<br>
      <strong>Total Spent:</strong> ${formatCurrency(totalSpent, currencyState.currentCurrency)}<br>
      <strong>Remaining:</strong> ${formatCurrency(remaining, currencyState.currentCurrency)}
    `;
    msg.style.color = remaining > totalBudget * 0.1 ? 'green' : 'red';
  }
}
