// UI code: reads forms, shows data, reacts to clicks.
// It calls logic.js for math and storage.js for saving.

let data = loadData();

const amountInput = document.getElementById("amount");
const noteInput = document.getElementById("note");
const dateInput = document.getElementById("date");
const categoryButtons = document.getElementById("category-buttons");
const addMessage = document.getElementById("add-message");
const typeExpenseButton = document.getElementById("type-expense");
const typeIncomeButton = document.getElementById("type-income");
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

// Calm, easy-to-tell-apart colours; each category always keeps its colour
const CATEGORY_COLORS = {
  Food: "#3a7d6b",
  Transport: "#5b8db8",
  Fun: "#e0a458",
  School: "#8e7cc3",
  Bills: "#7d8a84",
  Other: "#c4b48a",
};

// Created on the first render, then only its data is updated
let categoryChart = null;

// Which entry the dialog is editing, or null when it's closed
let editingId = null;
// What the add form is logging right now: "expense" or "income"
let addType = "expense";

// Good enough to be unique for one person's data: time + random letters
function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function addEntry(category) {
  const amountCents = parseAmountToCents(amountInput.value);
  if (amountCents === null) {
    addMessage.textContent = "Type an amount first, like 12.50";
    amountInput.focus();
    return;
  }

  data.entries.push({
    id: makeId(),
    type: addType,
    amountCents: amountCents,
    category: category,
    note: noteInput.value.trim(),
    date: dateInput.value || toDateString(new Date()),
  });
  saveData(data);
  render();

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

function renderTotals(entries) {
  const totals = monthTotals(entries);
  document.getElementById("total-in").textContent = formatCents(totals.inCents);
  document.getElementById("total-out").textContent = formatCents(totals.outCents);
  document.getElementById("total-left").textContent = formatCents(totals.leftCents);
}

function renderChart(totals) {
  const chartWrap = document.getElementById("chart-wrap");
  // Chart is only defined if the CDN script loaded; offline, we skip the chart
  if (typeof Chart === "undefined" || totals.length === 0) {
    chartWrap.hidden = true;
    return;
  }
  chartWrap.hidden = false;

  const labels = totals.map((total) => total.category);
  const values = totals.map((total) => total.cents);
  const colors = labels.map((category) => CATEGORY_COLORS[category]);

  if (categoryChart === null) {
    categoryChart = new Chart(document.getElementById("category-chart"), {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [{ data: values, backgroundColor: colors, borderColor: "#ffffff", borderWidth: 2 }],
      },
      options: {
        plugins: {
          // The list under the chart already acts as the legend
          legend: { display: false },
          tooltip: {
            callbacks: {
              // The chart holds cents, so format them like everywhere else
              label: (context) => " " + formatCents(context.raw),
            },
          },
        },
      },
    });
  } else {
    categoryChart.data.labels = labels;
    categoryChart.data.datasets[0].data = values;
    categoryChart.data.datasets[0].backgroundColor = colors;
    categoryChart.update();
  }
}

function renderCategoryTotals(entries) {
  const list = document.getElementById("category-list");
  const totals = totalsByCategory(entries);
  renderChart(totals);
  list.innerHTML = "";
  document.getElementById("category-empty").hidden = totals.length > 0;
  for (const total of totals) {
    const row = makeElement("li", "category-row", "");
    const name = makeElement("span", "category-name", total.category);
    // The coloured dot links each row to its slice of the chart
    const dot = makeElement("span", "category-dot", "");
    dot.style.background = CATEGORY_COLORS[total.category];
    name.prepend(dot);
    row.appendChild(name);
    row.appendChild(makeElement("span", "category-amount", formatCents(total.cents)));
    list.appendChild(row);
  }
}

// Redraws everything that depends on the data. Called after any change.
function render() {
  const thisMonth = monthKey(toDateString(new Date()));
  const entries = entriesInMonth(data.entries, thisMonth);
  renderTotals(entries);
  renderCategoryTotals(entries);
  renderList(entries);
}

// Redraws the whole list from data. Simpler than updating one row,
// and fast enough for a few hundred entries.
function renderList(monthEntries) {
  const entries = sortNewestFirst(monthEntries);

  entryList.innerHTML = "";
  monthEmpty.hidden = entries.length > 0;

  for (const entry of entries) {
    const item = document.createElement("li");
    // A real <button> can be reached with the keyboard and read by
    // screen readers, unlike a clickable <div>
    const row = document.createElement("button");
    row.type = "button";
    row.className = entry.type === "income" ? "entry income" : "entry";
    row.addEventListener("click", () => openEditor(entry));
    const details = makeElement("div", "entry-details", "");
    details.appendChild(makeElement("span", "entry-category", entry.category));
    if (entry.note) {
      details.appendChild(makeElement("span", "entry-note", entry.note));
    }
    row.appendChild(details);
    const right = makeElement("div", "entry-right", "");
    // Income gets a "+" so the two kinds are easy to tell apart at a glance
    const sign = entry.type === "income" ? "+" : "";
    right.appendChild(makeElement("span", "entry-amount", sign + formatCents(entry.amountCents)));
    right.appendChild(makeElement("span", "entry-date", formatShortDate(entry.date)));
    row.appendChild(right);
    item.appendChild(row);
    entryList.appendChild(item);
  }
}

function openEditor(entry) {
  editingId = entry.id;
  editCategory.innerHTML = "";
  for (const category of categoriesFor(entry.type)) {
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
  render();
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
  render();
  closeEditor();
});

// One button per category; tapping it saves, so logging is one tap.
// Rebuilt when switching between expense and income.
function renderCategoryButtons() {
  categoryButtons.innerHTML = "";
  for (const category of categoriesFor(addType)) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = category;
    button.addEventListener("click", () => addEntry(category));
    categoryButtons.appendChild(button);
  }
}

function setAddType(type) {
  addType = type;
  typeExpenseButton.setAttribute("aria-pressed", String(type === "expense"));
  typeIncomeButton.setAttribute("aria-pressed", String(type === "income"));
  renderCategoryButtons();
  addMessage.textContent = "";
  amountInput.focus();
}

typeExpenseButton.addEventListener("click", () => setAddType("expense"));
typeIncomeButton.addEventListener("click", () => setAddType("income"));

renderCategoryButtons();
dateInput.value = toDateString(new Date());
render();
amountInput.focus();
