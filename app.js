// UI code: reads forms, shows data, reacts to clicks.
// It calls logic.js for math and storage.js for saving.

let data = loadData();

const amountInput = document.getElementById("amount");
const noteInput = document.getElementById("note");
const dateInput = document.getElementById("date");
const categoryButtons = document.getElementById("category-buttons");
const addMessage = document.getElementById("add-message");
const entryList = document.getElementById("entry-list");
const monthEmpty = document.getElementById("month-empty");
const editDialog = document.getElementById("edit-dialog");
const editForm = document.getElementById("edit-form");
const editAmount = document.getElementById("edit-amount");
const editCategory = document.getElementById("edit-category");
const editNote = document.getElementById("edit-note");
const editDate = document.getElementById("edit-date");
const editMessage = document.getElementById("edit-message");
const deleteConfirm = document.getElementById("delete-confirm");

// Which entry the dialog is editing, or null when it's closed
let editingId = null;

// Good enough to be unique for one person's data: time + random letters
function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function addExpense(category) {
  const amountCents = parseAmountToCents(amountInput.value);
  if (amountCents === null) {
    addMessage.textContent = "Type an amount first, like 12.50";
    amountInput.focus();
    return;
  }

  data.entries.push({
    id: makeId(),
    type: "expense",
    amountCents: amountCents,
    category: category,
    note: noteInput.value.trim(),
    date: dateInput.value || toDateString(new Date()),
  });
  saveData(data);
  renderList();

  addMessage.textContent = "Saved " + formatCents(amountCents) + " in " + category;
  // Clear the form so the next expense can be typed right away
  amountInput.value = "";
  noteInput.value = "";
  dateInput.value = toDateString(new Date());
  amountInput.focus();
}

// Builds a small element with a class and text. textContent (not
// innerHTML) means a note like "<b>" is shown as text, never run as HTML.
function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

// Redraws the whole list from data. Simpler than updating one row,
// and fast enough for a few hundred entries.
function renderList() {
  const thisMonth = monthKey(toDateString(new Date()));
  const entries = sortNewestFirst(entriesInMonth(data.entries, thisMonth));

  entryList.innerHTML = "";
  monthEmpty.hidden = entries.length > 0;

  for (const entry of entries) {
    const item = document.createElement("li");
    // A real <button> can be reached with the keyboard and read by
    // screen readers, unlike a clickable <div>
    const row = document.createElement("button");
    row.type = "button";
    row.className = "entry";
    row.addEventListener("click", () => openEditor(entry));
    const details = makeElement("div", "entry-details", "");
    details.appendChild(makeElement("span", "entry-category", entry.category));
    if (entry.note) {
      details.appendChild(makeElement("span", "entry-note", entry.note));
    }
    row.appendChild(details);
    const right = makeElement("div", "entry-right", "");
    right.appendChild(makeElement("span", "entry-amount", formatCents(entry.amountCents)));
    right.appendChild(makeElement("span", "entry-date", formatShortDate(entry.date)));
    row.appendChild(right);
    item.appendChild(row);
    entryList.appendChild(item);
  }
}

function openEditor(entry) {
  editingId = entry.id;
  editCategory.innerHTML = "";
  for (const category of EXPENSE_CATEGORIES) {
    editCategory.appendChild(new Option(category, category));
  }
  // toFixed(2) without "$" so the box holds a plain number to edit
  editAmount.value = (entry.amountCents / 100).toFixed(2);
  editCategory.value = entry.category;
  editNote.value = entry.note;
  editDate.value = entry.date;
  editMessage.textContent = "";
  deleteConfirm.hidden = true;
  editDialog.showModal();
}

function closeEditor() {
  editingId = null;
  editDialog.close();
}

editForm.addEventListener("submit", (event) => {
  // A form's default action reloads the page; we save in JavaScript instead
  event.preventDefault();
  const amountCents = parseAmountToCents(editAmount.value);
  if (amountCents === null) {
    editMessage.textContent = "Type an amount, like 12.50";
    editAmount.focus();
    return;
  }
  data.entries = updateEntry(data.entries, editingId, {
    amountCents: amountCents,
    category: editCategory.value,
    note: editNote.value.trim(),
    date: editDate.value || toDateString(new Date()),
  });
  saveData(data);
  renderList();
  closeEditor();
});

document.getElementById("edit-cancel").addEventListener("click", closeEditor);

// Deleting takes two taps so a slip of the thumb can't erase anything
document.getElementById("delete-start").addEventListener("click", () => {
  deleteConfirm.hidden = false;
});
document.getElementById("delete-no").addEventListener("click", () => {
  deleteConfirm.hidden = true;
});
document.getElementById("delete-yes").addEventListener("click", () => {
  data.entries = removeEntry(data.entries, editingId);
  saveData(data);
  renderList();
  closeEditor();
});

// One button per category; tapping it saves, so logging is one tap
for (const category of EXPENSE_CATEGORIES) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = category;
  button.addEventListener("click", () => addExpense(category));
  categoryButtons.appendChild(button);
}

dateInput.value = toDateString(new Date());
renderList();
amountInput.focus();
