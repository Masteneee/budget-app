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

// The month being viewed, like "2026-10". Starts on the current month.
let viewMonth = monthKey(toDateString(new Date()));

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
  // Show the month the entry belongs to, so it's visible right away
  viewMonth = monthKey(data.entries[data.entries.length - 1].date);
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

function renderGoal(goal) {
  const saved = goalSavedCents(goal);
  const percent = goalPercent(goal);
  const item = makeElement("li", "goal", "");

  const top = makeElement("div", "goal-top", "");
  top.appendChild(makeElement("span", "goal-name", goal.name));
  top.appendChild(makeElement("span", "goal-amounts", formatCents(saved) + " of " + formatCents(goal.targetCents)));
  item.appendChild(top);

  // role and aria-value* let screen readers announce the progress
  const bar = makeElement("div", "progress", "");
  bar.setAttribute("role", "progressbar");
  bar.setAttribute("aria-valuemin", "0");
  bar.setAttribute("aria-valuemax", "100");
  bar.setAttribute("aria-valuenow", String(percent));
  bar.setAttribute("aria-label", goal.name + " progress");
  const fill = makeElement("div", "progress-fill", "");
  fill.style.width = percent + "%";
  bar.appendChild(fill);
  item.appendChild(bar);

  let status = percent + "%";
  if (percent === 100) {
    status = "Goal reached!";
  } else if (goal.targetDate) {
    status += " · by " + formatLongDate(goal.targetDate);
  }
  item.appendChild(makeElement("p", "goal-status", status));

  const form = makeElement("form", "goal-add", "");
  const input = document.createElement("input");
  input.type = "text";
  input.inputMode = "decimal";
  input.placeholder = "Amount";
  input.autocomplete = "off";
  input.setAttribute("aria-label", "Amount to add to " + goal.name);
  const addButton = makeElement("button", "", "Add money");
  addButton.type = "submit";
  form.appendChild(input);
  form.appendChild(addButton);
  const message = makeElement("p", "message", "");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const amountCents = parseAmountToCents(input.value);
    if (amountCents === null) {
      message.textContent = "Type an amount, like 20";
      return;
    }
    goal.contributions.push({ date: toDateString(new Date()), amountCents: amountCents });
    saveData(data);
    render();
  });
  item.appendChild(form);
  item.appendChild(message);

  const deleteStart = makeElement("button", "quiet", "Delete goal");
  deleteStart.type = "button";
  const confirmBox = makeElement("div", "delete-confirm", "");
  confirmBox.hidden = true;
  confirmBox.appendChild(makeElement("p", "", "Delete this goal and its history?"));
  const confirmButtons = makeElement("div", "dialog-buttons", "");
  const yes = makeElement("button", "", "Yes, delete");
  yes.type = "button";
  const no = makeElement("button", "secondary", "Keep it");
  no.type = "button";
  confirmButtons.appendChild(yes);
  confirmButtons.appendChild(no);
  confirmBox.appendChild(confirmButtons);
  deleteStart.addEventListener("click", () => (confirmBox.hidden = false));
  no.addEventListener("click", () => (confirmBox.hidden = true));
  yes.addEventListener("click", () => {
    data.goals = data.goals.filter((g) => g.id !== goal.id);
    saveData(data);
    render();
  });
  item.appendChild(deleteStart);
  item.appendChild(confirmBox);
  return item;
}

function renderGoals() {
  const list = document.getElementById("goal-list");
  list.innerHTML = "";
  document.getElementById("goals-empty").hidden = data.goals.length > 0;
  for (const goal of data.goals) {
    list.appendChild(renderGoal(goal));
  }
}

function renderComparison(entries) {
  const previousMonth = shiftMonth(viewMonth, -1);
  const previousEntries = entriesInMonth(data.entries, previousMonth);
  const rows = compareMonths(entries, previousEntries);
  const list = document.getElementById("compare-list");
  const empty = document.getElementById("compare-empty");
  list.innerHTML = "";

  if (totalsByCategory(previousEntries).length === 0) {
    empty.textContent = "No spending logged in " + formatMonthLabel(previousMonth) + " to compare with.";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  for (const row of rows) {
    list.appendChild(makeElement("li", "", describeChange(row)));
  }
}

function renderMonthSwitcher() {
  const currentMonth = monthKey(toDateString(new Date()));
  const isCurrent = viewMonth === currentMonth;
  document.getElementById("month-label").textContent = formatMonthLabel(viewMonth);
  // No point browsing into months that haven't happened yet
  document.getElementById("month-next").disabled = viewMonth >= currentMonth;
  document.getElementById("left-label").textContent = isCurrent
    ? "Left this month"
    : "Left in " + formatMonthLabel(viewMonth);
  document.getElementById("list-title").textContent = isCurrent ? "This month" : formatMonthLabel(viewMonth);
}

// Redraws everything that depends on the data. Called after any change.
function render() {
  const entries = entriesInMonth(data.entries, viewMonth);
  renderMonthSwitcher();
  renderTotals(entries);
  renderCategoryTotals(entries);
  renderComparison(entries);
  renderList(entries);
  renderGoals();
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
    const hours = entry.type === "expense" ? hoursOfWork(entry.amountCents, data.settings.hourlyWageCents) : null;
    if (hours !== null) {
      right.appendChild(makeElement("span", "entry-hours", formatHours(hours) + " of work"));
    }
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

const wageInput = document.getElementById("wage");
const settingsMessage = document.getElementById("settings-message");

function fillSettingsForm() {
  const wage = data.settings.hourlyWageCents;
  wageInput.value = wage ? (wage / 100).toFixed(2) : "";
}

document.getElementById("settings-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const text = wageInput.value.trim();
  if (text === "") {
    data.settings.hourlyWageCents = null;
    settingsMessage.textContent = "Hours of work turned off";
  } else {
    const wageCents = parseAmountToCents(text);
    if (wageCents === null) {
      settingsMessage.textContent = "Type your wage as a number, like 16.10";
      return;
    }
    data.settings.hourlyWageCents = wageCents;
    settingsMessage.textContent = "Saved: " + formatCents(wageCents) + " per hour";
  }
  saveData(data);
  render();
});

document.getElementById("goal-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const nameInput = document.getElementById("goal-name");
  const targetInput = document.getElementById("goal-target");
  const dateInput = document.getElementById("goal-date");
  const message = document.getElementById("goal-message");
  const name = nameInput.value.trim();
  const targetCents = parseAmountToCents(targetInput.value);
  if (name === "") {
    message.textContent = "Give your goal a name";
    return;
  }
  if (targetCents === null) {
    message.textContent = "Type a target amount, like 400";
    return;
  }
  data.goals.push({
    id: makeId(),
    name: name,
    targetCents: targetCents,
    // An empty date field gives "", which we store as "no date"
    targetDate: dateInput.value || null,
    contributions: [],
  });
  saveData(data);
  nameInput.value = "";
  targetInput.value = "";
  dateInput.value = "";
  message.textContent = "";
  document.getElementById("new-goal").open = false;
  render();
});

const backupMessage = document.getElementById("backup-message");
const importFile = document.getElementById("import-file");
const importConfirm = document.getElementById("import-confirm");
// A backup that passed the checks and waits for "Yes, replace"
let pendingBackup = null;

document.getElementById("export-button").addEventListener("click", () => {
  const backup = { app: "budget-app", version: 1, exportedAt: new Date().toISOString(), data: data };
  // A Blob is file contents held in memory; the temporary link lets
  // the browser "download" it without any server
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "budget-backup-" + toDateString(new Date()) + ".json";
  link.click();
  URL.revokeObjectURL(link.href);
  backupMessage.textContent = "Backup downloaded";
});

document.getElementById("import-button").addEventListener("click", () => importFile.click());

importFile.addEventListener("change", async () => {
  const file = importFile.files[0];
  // Reset so choosing the same file again still triggers "change"
  importFile.value = "";
  if (!file) {
    return;
  }
  let backup = null;
  try {
    // await pauses here until the file is read, without freezing the page
    backup = JSON.parse(await file.text());
  } catch (error) {
    backupMessage.textContent = "That file couldn't be read as a backup.";
    return;
  }
  const problems = checkBackup(backup);
  if (problems.length > 0) {
    backupMessage.textContent = "Nothing was changed. " + problems.slice(0, 3).join(" ");
    return;
  }
  pendingBackup = backup;
  backupMessage.textContent = "";
  document.getElementById("import-question").textContent =
    "This backup has " + plural(backup.data.entries.length, "entry", "entries") +
    ". Replace your current " + plural(data.entries.length, "entry", "entries") + " with it?";
  importConfirm.hidden = false;
});

document.getElementById("import-yes").addEventListener("click", () => {
  data = replaceData(pendingBackup.data);
  pendingBackup = null;
  importConfirm.hidden = true;
  viewMonth = monthKey(toDateString(new Date()));
  fillSettingsForm();
  render();
  backupMessage.textContent = "Backup loaded";
});

document.getElementById("import-no").addEventListener("click", () => {
  pendingBackup = null;
  importConfirm.hidden = true;
  backupMessage.textContent = "Nothing was changed.";
});

document.getElementById("month-prev").addEventListener("click", () => {
  viewMonth = shiftMonth(viewMonth, -1);
  render();
});
document.getElementById("month-next").addEventListener("click", () => {
  viewMonth = shiftMonth(viewMonth, 1);
  render();
});

typeExpenseButton.addEventListener("click", () => setAddType("expense"));
typeIncomeButton.addEventListener("click", () => setAddType("income"));

renderCategoryButtons();
fillSettingsForm();
dateInput.value = toDateString(new Date());
render();
amountInput.focus();
