# Student Finance Tracker

**Track, visualize, and manage your student expenses with ease!**  

Student Finance Tracker is a **mobile-first, responsive web app** designed to help students manage their finances. With this app, you can set budgets, log expenses, view spending trends, and analyze your finances — all in a clean, intuitive interface.  

---

## 🖌️ Theme

**Personal Finance Management for Students** – A minimalistic and accessible design with mobile-first responsiveness.  
Focus on **clarity, readability, and usability** while keeping the interface visually appealing.  

---

## ✨ Features

- **Set Budget:** Assign budgets for different categories like Food, Books, Transport, Entertainment, Fees, and Others.  
- **Add Expenses:** Quickly log your daily expenses with a description, amount, date, and category.  
- **Visual Analytics:** Interactive charts to track spending trends.  
- **Recent Transactions:** Searchable and sortable transaction table with real-time filtering.  
- **Responsive Design:** Works seamlessly across mobile (360px), tablet, and desktop.  
- **Accessibility Focused:** Keyboard navigation, ARIA-live notifications, high-contrast interface, and tap-friendly buttons.  
- **Persistent Data:** Transactions and budgets saved via `localStorage` across sessions.  
- **Notifications:** Real-time feedback for saving budgets or adding expenses.  

---

## 🔍 Regex Catalog (Validation & Search)

| Purpose | Regex Pattern | Example |
|---------|---------------|---------|
| Amount | `^\d+(\.\d{1,2})?$` | `500`, `1500.50` |
| Description | `^[a-zA-Z0-9\s,.!?]{3,100}$` | `Lunch at campus`, `Bought books` |
| Date | `^\d{4}-\d{2}-\d{2}$` | `2025-10-16` |
| Category | `^(food|books|transport|entertainment|fees|others)$` | `food`, `transport` |
| Search | `[a-zA-Z0-9\s]+` | `Books 2025` |

> Advanced regex ensures **real-time validation**, safe search, and proper formatting of amounts and dates.  

---

## ⌨️ Keyboard Map

- **Menu Navigation:** Tab / Shift+Tab  
- **Open Settings:** Tab → Enter  
- **Toggle Budget Form:** Enter on “Set Budget” button  
- **Add Transaction:** Tab → Enter on “+ Add Expense”  
- **Save Form:** Enter while focused on submit button  
- **Close Popup:** Tab → Enter on “Ok” button  
- **Search Transactions:** Tab → input field → type → Enter  

---

## ♿ Accessibility Notes

- Semantic HTML using `<header>`, `<main>`, `<section>`, `<footer>`.  
- Proper heading hierarchy for screen readers.  
- ARIA-live regions for budget and transaction notifications.  
- Keyboard navigable forms, buttons, and popups.  
- High-contrast interface for readability.  
- Tap-friendly buttons and interactive elements for mobile users.  
- Labels for all form inputs; placeholders are complemented with proper labels.  

---

## ⚡ How to Run

Open dashboard.html in your browser.

  Start using the app:
  
    Set budgets using the "Set Budget" button.
    
    Add expenses via "+ Add Expense".
    
    Visualize trends through the charts.
    
    Filter transactions using the search bar.

🧪 Testing

    Form Validation: Inputs match regex patterns for amount, date, description, and category.
    
    Persistence: Data remains in localStorage after reload.
    
    Responsive Layout: Test across mobile, tablet, and desktop.
    
    Keyboard Navigation: Test Tab, Shift+Tab, Enter, and Esc keys.
    
    Chart Updates: Adding or deleting expenses updates the charts dynamically.
    
    Search Functionality: Filter transactions in real-time using the search bar.

📚 References & Credits

    w3Schools – HTML, CSS, JavaScript guidance.
    
    ChatGPT – Assistance with responsive design and documentation.
    
    Google AI – Regex patterns and UX recommendations.
    
    Responsive HTML Table With Pure CSS Example
     – Inspiration for responsive table design.
    
    YouTube tutorials on mobile-first CSS, Chart.js, and responsive UI design.
    
    All UI and logic code is original. AI was only used for documentation and seed data generation, not code.

[![Watch the demo](https://img.youtube.com/vi/DPHs7oa9-Jo/maxresdefault.jpg)](https://youtu.be/DPHs7oa9-Jo)

Code written by: 👨🏻‍🎓 CÉDRIC BIGWI HINDURA
© 2025 Student Finance Tracker
