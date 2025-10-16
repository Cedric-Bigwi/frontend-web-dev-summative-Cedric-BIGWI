// budgetMessage.js 

import { loadTransactions, loadBudget } from './storage.js';

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function daysBetween(start, end) {
  const diffTime = Math.max(new Date(end) - new Date(start), 0);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export function getBudgetStats() {
  const budget = loadBudget();
  const transactions = loadTransactions();

  if (!budget || !budget.categories) {
    return {
      totalBudget: 0,
      totalSpent: 0,
      totalRemaining: 0,
      percentRemaining: 0,
      daysLeft: 0,
      categories: {},
      dailySpending: {}
    };
  }

  const start = new Date(budget.start);
  const end = new Date(budget.end);
  const now = new Date();

  const spent = {};
  Object.keys(budget.categories).forEach(cat => spent[cat] = 0);

  const dailySpending = {
    Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0
  };

  transactions.forEach(txn => {
    const txnDate = new Date(txn.date);
    if (txnDate >= start && txnDate <= end) {
      if (spent.hasOwnProperty(txn.category)) spent[txn.category] += txn.amount;

      const diffDays = (now - txnDate) / (1000 * 60 * 60 * 24);
      if (diffDays <= 7) {
        const dayName = txnDate.toLocaleDateString('en-US', { weekday: 'long' });
        dailySpending[dayName] += txn.amount;
      }
    }
  });

  const totalSpent = Object.values(spent).reduce((a, b) => a + b, 0);
  const totalBudget = budget.total || Object.values(budget.categories).reduce((a, b) => a + b, 0);
  const totalRemaining = totalBudget - totalSpent;
  const percentRemaining = totalBudget ? Math.max(0, Math.round((totalRemaining / totalBudget) * 100)) : 0;
  const daysLeft = Math.max(0, daysBetween(now, end));

  const categories = {};
  Object.keys(budget.categories).forEach(cat => {
    const remaining = budget.categories[cat] - spent[cat];
    const percent = budget.categories[cat] ? Math.round((remaining / budget.categories[cat]) * 100) : 0;
    categories[cat] = {
      spent: spent[cat],
      remaining,
      percent
    };
  });

  return { totalBudget, totalSpent, totalRemaining, percentRemaining, daysLeft, categories, dailySpending };
}

// Dashboard message
export function renderDashboardMessage() {
  const stats = getBudgetStats();

  const keyBreakdown = document.getElementById('key-breakdown');
  if (!keyBreakdown) return;

  keyBreakdown.querySelector('ul').innerHTML = `
    <li>Budgeted Amount: ${stats.totalBudget.toLocaleString()} Rwf</li>
    <li>Amount Spent: ${stats.totalSpent.toLocaleString()} Rwf</li>
  `;

  const msgEl = keyBreakdown.querySelector('#notification-container');
  msgEl.textContent = stats.totalBudget > 0
    ? `You are remaining with ${stats.percentRemaining}% (${stats.totalRemaining.toLocaleString()} Rwf) of your budgeted amount, with ${stats.daysLeft} day(s) left.`
    : `No budget set yet. Please create a budget to track your spending.`;
}

// Report messages
export function renderReportMessage() {
  const stats = getBudgetStats();

  // Sort categories by spent amount descending
  const sortedCategories = Object.entries(stats.categories)
    .sort(([, a], [, b]) => b.spent - a.spent);

  const categoryReport = document.getElementById('category-report');
  if (categoryReport) {
    categoryReport.querySelector('ul').innerHTML = sortedCategories.map(([cat, catStats]) => {
      const remainingPercent = Math.max(0, catStats.percent);
      return `<li>${capitalize(cat)}: ${catStats.spent.toLocaleString()} Rwf (Remaining ${remainingPercent}% "${catStats.remaining.toLocaleString()}")</li>`;
    }).join('') || `<li>No budget set yet.</li>`;
  }

  // Sort days by spent amount descending
  const sortedDays = Object.entries(stats.dailySpending)
    .sort(([, a], [, b]) => b - a);

  const dailyReport = document.getElementById('daily-report');
  if (dailyReport) {
    dailyReport.querySelector('ul').innerHTML = sortedDays.map(([day, amount]) => {
      return `<li>${day}: ${amount.toLocaleString()} Rwf</li>`;
    }).join('') || `<li>No spending data available.</li>`;

    const msgEl = dailyReport.querySelector('#notification-container');
    msgEl.textContent = stats.totalBudget > 0
      ? `You are remaining with ${stats.percentRemaining}% (${stats.totalRemaining.toLocaleString()} Rwf) of your budgeted amount, with ${stats.daysLeft} day(s) left.`
      : `No budget set yet.`;
  }
}

export function refreshBudgetMessages() {
  renderDashboardMessage();
  renderReportMessage();
  renderBudgetCapMessages();
}

export function renderBudgetCapMessages() {
  const stats = getBudgetStats(); // contains spent per category

  const cards = document.querySelectorAll('.summary-cards .card');
  if (!cards || !stats.categories) return;

  cards.forEach(card => {
    const h2 = card.querySelector('h2');
    const p = card.querySelector('p');
    if (!h2 || !p) return;

    const catName = h2.textContent.replace(':','').toLowerCase();
    if (stats.categories[catName]) {
      p.textContent = `${stats.categories[catName].spent.toLocaleString()} Rwf`;
    } else {
      p.textContent = '0 Rwf';
    }
  });
}

