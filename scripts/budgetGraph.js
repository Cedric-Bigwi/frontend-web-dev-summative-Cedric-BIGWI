// budgetGraph.js
import { loadTransactions, loadBudget } from './storage.js';

let weeklyChartInstance = null;
let categoryBarChartInstance = null;
let totalChartInstance = null;

function capitalizeFirstLetter(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

/**
 * Safely render all budget-related visuals
 */
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

/**
 * Display "No budget" message inside canvas
 */
function showNoBudgetMessage(canvas, msg) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '1.4rem Arial';
  ctx.textAlign = 'center';
  ctx.fillText(msg, canvas.width / 2, canvas.height / 2);
}

/**
 * Weekly Line Chart — Spending in last 7 days
 */
function renderWeeklyLineChart(transactions) {
  const now = new Date();
  const last7days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const dailyTotals = last7days.map(date =>
    transactions.filter(t => t.date === date)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const ctx = document.getElementById('weeklyChart')?.getContext('2d');
  if (!ctx) return;
  if (weeklyChartInstance) weeklyChartInstance.destroy();

  weeklyChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: last7days,
      datasets: [{
        label: 'Daily Spending (Rwf)',
        data: dailyTotals,
        borderColor: '#36A2EB',
        backgroundColor: '#9AD0F5',
        fill: true,
        tension: 0.3,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true }, tooltip: { enabled: true } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

/**
 * Category Bar Chart — Spending vs Budget
 */
function renderCategoryBarChart(transactions, budget) {
  const spent = {};
  Object.keys(budget.categories).forEach(c => spent[c] = 0);

  transactions.forEach(txn => {
    if (spent.hasOwnProperty(txn.category)) spent[txn.category] += txn.amount;
  });

  const labels = Object.keys(spent).map(capitalizeFirstLetter);
  const spentValues = Object.values(spent);
  const budgetValues = Object.values(budget.categories);

  const ctx = document.getElementById('categoryBarChart')?.getContext('2d');
  if (!ctx) return;
  if (window.categoryBarChartInstance) window.categoryBarChartInstance.destroy();

  window.categoryBarChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Budget',
          data: budgetValues,
          backgroundColor: 'rgb(0, 238, 255)', // cyan budget bars
        },
        {
          label: 'Spent',
          data: spentValues,
          backgroundColor: spentValues.map((v, i) =>
            v <= budgetValues[i] ? '#4BC0C0' : '#FF6384' // green if under, red if over
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
            generateLabels: (chart) => {
              // Custom legend items
              return [
                {
                  text: 'Budget',
                  fillStyle: 'rgb(0, 238, 255)',
                },
                {
                  text: 'Spent (Under Budget)',
                  fillStyle: '#4BC0C0',
                },
                {
                  text: 'Spent (Over Budget)',
                  fillStyle: '#FF6384',
                },
              ];
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toLocaleString()} Rwf`,
          },
        },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

/**
 * Total Spending vs Remaining Budget — Dashboard Overview
 */
function renderTotalBudgetChart(transactions, budget) {
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalBudget = budget.total;
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
            label: ctx => `${ctx.label}: ${ctx.raw.toLocaleString()} Rwf`
          }
        }
      }
    }
  });

  // Update dashboard text summary
  const msg = document.getElementById('dashboardSummary');
  if (msg) {
    msg.innerHTML = `
      <strong>Total Budget:</strong> ${totalBudget.toLocaleString()} Rwf<br>
      <strong>Total Spent:</strong> ${totalSpent.toLocaleString()} Rwf<br>
      <strong>Remaining:</strong> ${remaining.toLocaleString()} Rwf
    `;
    msg.style.color = remaining > totalBudget * 0.1 ? 'green' : 'red';
  }
}