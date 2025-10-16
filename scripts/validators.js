// validators.js

// Regex patterns
const regex = {
  description: /^\S(?:.*\S)?$/, // no leading/trailing spaces
  amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/, // number with up to 2 decimals, positive only
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, // YYYY-MM-DD
  duplicateWords: /\b(\w+)\s+\1\b/i // back-reference: duplicate words
};

// Validate description input
export function validateDescription(inputEl, noteEl) {
  const value = inputEl.value.trim();

  if (!value) {
    noteEl.textContent = 'Description is required.';
    noteEl.style.color = 'red';
    return false;
  }

  if (value.length < 3) {
    noteEl.textContent = 'Description must be at least 3 characters long.';
    noteEl.style.color = 'red';
    return false;
  }

  // Advanced regex: check duplicate words
  const duplicateWords = /\b(\w+)\s+\1\b/i;
  if (duplicateWords.test(value)) {
    noteEl.textContent = 'Warning: duplicate words detected.';
    noteEl.style.color = 'orange';
  } else {
    noteEl.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
    noteEl.style.color = 'green';
  }

  return true;
}

// Validate amount input
export function validateAmount(inputEl, noteEl) {
  const value = inputEl.value.trim();
  const num = parseFloat(value);

  if (!value) {
    noteEl.textContent = 'Amount is required.';
    noteEl.style.color = 'red';
    return false;
  }

  if (isNaN(num) || num <= 0) {
    noteEl.textContent = 'Please enter a valid positive amount.';
    noteEl.style.color = 'red';
    return false;
  }

  noteEl.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
  noteEl.style.color = 'green';
  return true;
}

// Validate date input
export function validateDate(inputEl, noteEl) {
  const value = inputEl.value;
  const selectedDate = new Date(value);
  const currentDate = new Date();

  if (!value) {
    noteEl.textContent = 'Please select a date.';
    noteEl.style.color = 'red';
    return false;
  }

  if (selectedDate > currentDate) {
    noteEl.textContent = 'Date cannot be in the future.';
    noteEl.style.color = 'red';
    return false;
  }

  noteEl.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
  noteEl.style.color = 'green';
  return true;
}

// Validate entire form (pass DOM elements)
export function validateForm(inputs) {
  const { descriptionEl, descriptionNoteEl, amountEl, amountNoteEl, dateEl, dateNoteEl } = inputs;

  const isDescValid = validateDescription(descriptionEl, descriptionNoteEl);
  const isAmountValid = validateAmount(amountEl, amountNoteEl);
  const isDateValid = validateDate(dateEl, dateNoteEl);

  return isDescValid && isAmountValid && isDateValid;
}