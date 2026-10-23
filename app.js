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

// Calm, easy-to-tell-apart colours, bright enough for a dark background;
// each category always keeps its colour
const CATEGORY_COLORS = {
  Food: "#5fd3a5",
  Transport: "#6fa8dc",
  Fun: "#f0b46b",
  School: "#a993e0",
  Bills: "#9aa8a2",
  Other: "#d8c79a",
};

// The mint used for "money" lines and fills; never red (no guilt colours)
const LINE_COLOR = "#5fd3a5";
const CARD_COLOR = "#1a1a1a";

// Created on the first render, then only its data is updated
let categoryChart = null;
let lineChart = null;

// Chart.js draws dark text by default; on a dark page it needs light text
if (typeof Chart !== "undefined") {
  Chart.defaults.color = "#8e8e8e";
  Chart.defaults.borderColor = "#2a2a2a";
}

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

// A rounded square with one letter, like an app icon: "F" for Food.
// "33" at the end of a colour adds transparency (about 20%).
function makeIcon(letter, color) {
  const icon = makeElement("span", "row-icon", letter.charAt(0).toUpperCase());
  icon.style.background = color + "33";
  icon.style.color = color;
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

function renderGreeting() {
  const name = data.settings.name;
  document.getElementById("greeting").textContent =
    greetingFor(new Date().getHours()) + (name ? ", " + name : "");
}

// Builds a small element with a class and text. textContent (not
// innerHTML) means a note like "<b>" is shown as text, never run as HTML.
function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function renderSafeToSpend() {
  const today = toDateString(new Date());
  const safeBox = document.getElementById("safe-box");
  // Safe to spend is about the days ahead, so it only makes sense for now
  safeBox.hidden = viewMonth !== monthKey(today);
  if (safeBox.hidden) {
    return;
  }
  const budgets = effectiveBudgets(data.entries, data.budgets, monthKey(today), data.settings.rolloverStart).budgets;
  const safe = safeToSpend(data.entries, data.goals, budgets, today);
  document.getElementById("safe-per-day").textContent = formatCents(safe.perDayCents);
  let detail = formatCents(safe.leftCents) + " left";
  if (safe.goalsCents > 0) {
    detail += " − " + formatCents(safe.goalsCents) + " for goals";
  }
  if (safe.billsCents > 0) {
    detail += " − " + formatCents(safe.billsCents) + " for bills";
  }
  detail += ", over " + plural(safe.daysLeft, "day", "days");
  const incomeThisMonth = monthTotals(entriesInMonth(data.entries, monthKey(today))).inCents;
  if (incomeThisMonth === 0) {
    detail = "Add this month's income to see what's safe to spend.";
  } else if (safe.availableCents <= 0) {
    detail += ". Your plans use what's left this month, and that's okay.";
  }
  document.getElementById("safe-detail").textContent = detail;
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
        datasets: [{ data: values, backgroundColor: colors, borderColor: CARD_COLOR, borderWidth: 3 }],
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

// The big line under "Safe to spend": money left at the end of each day
function renderLineChart() {
  const wrap = document.getElementById("line-wrap");
  const today = toDateString(new Date());
  const isCurrent = viewMonth === monthKey(today);
  const year = Number(viewMonth.slice(0, 4));
  const monthNumber = Number(viewMonth.slice(5, 7));
  // Past months: every day. This month: up to today, since the rest hasn't happened
  const lastDay = isCurrent ? Number(today.slice(8, 10)) : new Date(year, monthNumber, 0).getDate();
  const series = dailyLeft(data.entries, viewMonth, lastDay);
  const hasData = entriesInMonth(data.entries, viewMonth).length > 0;

  if (typeof Chart === "undefined" || !hasData) {
    wrap.hidden = true;
    return;
  }
  wrap.hidden = false;
  const labels = series.map((_, index) => formatShortDate(viewMonth + "-" + String(index + 1).padStart(2, "0")));

  if (lineChart === null) {
    lineChart = new Chart(document.getElementById("line-chart"), {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          data: series,
          borderColor: LINE_COLOR,
          borderWidth: 2,
          // A soft see-through fill under the line, like a shadow
          backgroundColor: LINE_COLOR + "1a",
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 5,
          tension: 0.25,
        }],
      },
      options: {
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 6 } },
          y: { display: false },
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (context) => " " + formatCents(context.raw) + " left" } },
        },
      },
    });
  } else {
    lineChart.data.labels = labels;
    lineChart.data.datasets[0].data = series;
    lineChart.update();
  }
}

function renderCategoryTotals(entries) {
  const list = document.getElementById("category-list");
  renderChart(totalsByCategory(entries));
  const rollover = effectiveBudgets(data.entries, data.budgets, viewMonth, data.settings.rolloverStart);
  const rows = budgetRows(entries, rollover.budgets);
  list.innerHTML = "";
  document.getElementById("category-empty").hidden = rows.length > 0;
  for (const budgetRow of rows) {
    const item = makeElement("li", "category-item", "");
    const row = makeElement("div", "category-row", "");
    const name = makeElement("span", "category-name", budgetRow.category);
    // The coloured dot links each row to its slice of the chart
    const dot = makeElement("span", "category-dot", "");
    dot.style.background = CATEGORY_COLORS[budgetRow.category];
    name.prepend(dot);
    row.appendChild(name);
    row.appendChild(makeElement("span", "category-amount", formatCents(budgetRow.spentCents)));
    item.appendChild(row);

    if (budgetRow.budgetCents) {
      const bar = makeElement("div", budgetRow.isOver ? "progress over" : "progress", "");
      bar.setAttribute("role", "progressbar");
      bar.setAttribute("aria-valuemin", "0");
      bar.setAttribute("aria-valuemax", "100");
      bar.setAttribute("aria-valuenow", String(budgetRow.percent));
      bar.setAttribute("aria-label", budgetRow.category + " budget used");
      const fill = makeElement("div", "progress-fill", "");
      fill.style.width = budgetRow.percent + "%";
      bar.appendChild(fill);
      item.appendChild(bar);
      item.appendChild(makeElement("p", "budget-text", describeBudget(budgetRow)));
      const carriedCents = rollover.carried[budgetRow.category] || 0;
      if (carriedCents > 0) {
        item.appendChild(makeElement("p", "budget-text", "Includes " + formatCents(carriedCents) + " rolled over"));
      }
    }
    list.appendChild(item);
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

  const practiceButton = makeElement("button", "secondary practice-link", "Practice investing this amount");
  practiceButton.type = "button";
  practiceButton.addEventListener("click", () => practiceWithGoal(goal));
  item.appendChild(practiceButton);

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

function renderRuleCard() {
  const card = document.getElementById("rule-card");
  card.hidden = data.settings.budgetStyle !== "503020";
  if (card.hidden) {
    return;
  }
  const result = fiftyThirtyTwenty(data.entries, data.goals, viewMonth);
  const list = document.getElementById("rule-list");
  list.innerHTML = "";
  document.getElementById("rule-empty").hidden = result.incomeCents > 0;
  if (result.incomeCents === 0) {
    return;
  }
  for (const group of result.groups) {
    const item = makeElement("li", "category-item", "");
    const row = makeElement("div", "category-row", "");
    row.appendChild(makeElement("span", "", group.label + " (" + group.percent + "%)"));
    row.appendChild(makeElement("span", "category-amount", formatCents(group.actualCents)));
    item.appendChild(row);
    const percent = group.targetCents > 0 ? Math.min(100, Math.floor((group.actualCents / group.targetCents) * 100)) : 0;
    // For savings, going past 20% is great, so only needs/wants get the "over" colour
    const isOver = group.key !== "savings" && group.actualCents > group.targetCents;
    const bar = makeElement("div", isOver ? "progress over" : "progress", "");
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-valuenow", String(percent));
    bar.setAttribute("aria-label", group.label + " compared with target");
    const fill = makeElement("div", "progress-fill", "");
    fill.style.width = percent + "%";
    bar.appendChild(fill);
    item.appendChild(bar);
    item.appendChild(makeElement("p", "budget-text", "Target: " + formatCents(group.targetCents)));
    list.appendChild(item);
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
  renderSafeToSpend();
  renderLineChart();
  renderTotals(entries);
  renderRuleCard();
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
    row.appendChild(makeIcon(entry.category, CATEGORY_COLORS[entry.category] || LINE_COLOR));
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
  document.getElementById("user-name").value = data.settings.name;
  const wage = data.settings.hourlyWageCents;
  wageInput.value = wage ? (wage / 100).toFixed(2) : "";
  for (const radio of document.querySelectorAll('input[name="budget-style"]')) {
    radio.checked = radio.value === data.settings.budgetStyle;
  }
  document.getElementById("rollover").checked = data.settings.rolloverStart !== null;
}

document.getElementById("rollover").addEventListener("change", (event) => {
  // Remember when it was turned on, so only months from now on carry over
  data.settings.rolloverStart = event.target.checked ? monthKey(toDateString(new Date())) : null;
  saveData(data);
  render();
});

// The style is saved as soon as it's chosen, no Save button needed
for (const radio of document.querySelectorAll('input[name="budget-style"]')) {
  radio.addEventListener("change", () => {
    data.settings.budgetStyle = radio.value;
    saveData(data);
    render();
  });
}

document.getElementById("settings-form").addEventListener("submit", (event) => {
  event.preventDefault();
  data.settings.name = document.getElementById("user-name").value.trim();
  renderGreeting();
  const text = wageInput.value.trim();
  if (text === "") {
    data.settings.hourlyWageCents = null;
    settingsMessage.textContent = "Settings saved";
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

// One input per expense category, filled with the saved budget
function renderBudgetInputs() {
  const container = document.getElementById("budget-inputs");
  container.innerHTML = "";
  for (const category of EXPENSE_CATEGORIES) {
    const label = makeElement("label", "budget-label", category);
    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "decimal";
    input.autocomplete = "off";
    input.placeholder = "No plan";
    input.dataset.category = category;
    const budget = data.budgets[category];
    input.value = budget ? (budget / 100).toFixed(2) : "";
    label.appendChild(input);
    container.appendChild(label);
  }
}

document.getElementById("budget-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const message = document.getElementById("budget-message");
  const newBudgets = {};
  for (const input of document.querySelectorAll("#budget-inputs input")) {
    const text = input.value.trim();
    if (text === "") {
      continue;
    }
    const cents = parseAmountToCents(text);
    if (cents === null) {
      message.textContent = "Check the " + input.dataset.category + " box: type a number like 150";
      input.focus();
      return;
    }
    newBudgets[input.dataset.category] = cents;
  }
  data.budgets = newBudgets;
  saveData(data);
  message.textContent = "Budgets saved";
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
  renderGreeting();
  renderBudgetInputs();
  render();
  backupMessage.textContent = "Backup loaded";
});

document.getElementById("import-no").addEventListener("click", () => {
  pendingBackup = null;
  importConfirm.hidden = true;
  backupMessage.textContent = "Nothing was changed.";
});

// ---------- Tabs ----------

function showTab(name) {
  const isPractice = name === "practice";
  document.getElementById("budget-tab").hidden = isPractice;
  document.getElementById("practice-tab").hidden = !isPractice;
  document.getElementById("tab-budget").setAttribute("aria-selected", String(!isPractice));
  document.getElementById("tab-practice").setAttribute("aria-selected", String(isPractice));
  if (isPractice) {
    renderPractice();
  }
}

document.getElementById("tab-budget").addEventListener("click", () => showTab("budget"));
document.getElementById("tab-practice").addEventListener("click", () => showTab("practice"));

// ---------- Practice (paper trading) ----------

const apiKeyInput = document.getElementById("api-key");
const quoteMessage = document.getElementById("quote-message");

// The quote currently shown in "Look up a price", or null
let currentQuote = null;

function renderPractice() {
  const startCents = data.practice.startCents;
  const stats = portfolioStats(data.practice, startCents);
  document.getElementById("practice-total").textContent = formatCents(stats.totalCents);
  document.getElementById("practice-cash").textContent = formatCents(stats.cashCents);
  document.getElementById("practice-invested").textContent = formatCents(stats.holdingsCents);
  const gainPercent = Math.round((stats.gainCents / startCents) * 1000) / 10;
  document.getElementById("practice-gain").textContent =
    describeGain(stats.gainCents, gainPercent) + " since you started with " + formatCents(startCents);
  renderHoldings();
  renderTradePreview();
}

function renderHoldings() {
  const list = document.getElementById("holdings-list");
  const tickers = Object.keys(data.practice.holdings).sort();
  list.innerHTML = "";
  document.getElementById("holdings-empty").hidden = tickers.length > 0;
  document.getElementById("refresh-prices").hidden = tickers.length === 0;
  for (const ticker of tickers) {
    const holding = data.practice.holdings[ticker];
    const stats = holdingStats(holding, holding.lastPriceCents);
    const item = makeElement("li", "goal", "");
    const top = makeElement("div", "goal-top", "");
    const name = makeElement("span", "goal-name ticker-name", ticker);
    name.prepend(makeIcon(ticker, "#d9d9d9"));
    top.appendChild(name);
    top.appendChild(makeElement("span", "category-amount", formatCents(stats.valueCents)));
    item.appendChild(top);
    item.appendChild(makeElement("p", "budget-text",
      plural(stats.shares, "share", "shares") + " · average cost " + formatCents(stats.averageCostCents) +
      " · last price " + formatCents(holding.lastPriceCents)));
    item.appendChild(makeElement("p", "budget-text", "Gain or loss: " + describeGain(stats.gainCents, stats.gainPercent)));
    list.appendChild(item);
  }
}

// Shows what a trade would cost before you tap Buy or Sell
function renderTradePreview() {
  const preview = document.getElementById("trade-preview");
  if (currentQuote === null) {
    return;
  }
  const shares = parseShares(document.getElementById("trade-shares").value);
  const owned = data.practice.holdings[currentQuote.ticker];
  let text = shares === null ? "Whole shares only, like 1 or 3" : plural(shares, "share", "shares") +
    " × " + formatCents(currentQuote.priceCents) + " = " + formatCents(shares * currentQuote.priceCents);
  text += ". You own " + plural(owned ? owned.shares : 0, "share", "shares") + ".";
  preview.textContent = text;
}

function trade(kind) {
  const message = document.getElementById("trade-message");
  const shares = parseShares(document.getElementById("trade-shares").value);
  if (shares === null) {
    message.textContent = "Type a whole number of shares, like 1 or 3";
    return;
  }
  const ticker = currentQuote.ticker;
  const result = kind === "buy"
    ? buyShares(data.practice, ticker, shares, currentQuote.priceCents)
    : sellShares(data.practice, ticker, shares, currentQuote.priceCents);
  if (result.problem) {
    message.textContent = result.problem;
    return;
  }
  data.practice = result.practice;
  saveData(data);
  message.textContent = (kind === "buy" ? "Bought " : "Sold ") + plural(shares, "share", "shares") +
    " of " + ticker + " at " + formatCents(currentQuote.priceCents) + " (practice money)";
  renderPractice();
}

document.getElementById("buy-button").addEventListener("click", () => trade("buy"));
document.getElementById("sell-button").addEventListener("click", () => trade("sell"));
document.getElementById("trade-shares").addEventListener("input", renderTradePreview);

const PROJECTION_RATES = [2, 5, 7];
const PROJECTION_YEARS = [1, 5, 10, 20];

// Copies a goal's money into the simulator and shows what it could become
function practiceWithGoal(goal) {
  // What you've saved so far, or the target if you haven't started yet
  const saved = goalSavedCents(goal);
  const amountCents = saved > 0 ? saved : goal.targetCents;
  data.practice = addPracticeMoney(data.practice, amountCents);
  saveData(data);

  document.getElementById("projection-title").textContent =
    "What could " + formatCents(amountCents) + " from \"" + goal.name + "\" become?";
  const body = document.getElementById("projection-body");
  body.innerHTML = "";
  for (const row of projectionRows(amountCents, PROJECTION_RATES, PROJECTION_YEARS)) {
    const tableRow = document.createElement("tr");
    tableRow.appendChild(makeElement("th", "", plural(row.years, "year", "years")));
    for (const value of row.values) {
      tableRow.appendChild(makeElement("td", "", formatCents(value)));
    }
    body.appendChild(tableRow);
  }
  document.getElementById("projection-card").hidden = false;
  document.getElementById("trade-message").textContent = "";
  document.getElementById("projection-message").textContent =
    "Added " + formatCents(amountCents) + " of practice money. Your real goal is not touched.";

  showTab("practice");
  document.getElementById("projection-card").scrollIntoView();
}

// Built once: the lessons never change while the app is open
function renderLessons() {
  const container = document.getElementById("lesson-list");
  for (const lesson of LESSONS) {
    const card = makeElement("details", "lesson", "");
    card.appendChild(makeElement("summary", "", lesson.title));
    card.appendChild(makeElement("p", "", lesson.text));
    container.appendChild(card);
  }
}

document.getElementById("refresh-prices").addEventListener("click", async () => {
  const message = document.getElementById("refresh-message");
  message.textContent = "Refreshing...";
  // One request per holding; a for...of loop with await asks one at a time
  for (const ticker of Object.keys(data.practice.holdings)) {
    const answer = await fetchQuote(ticker);
    if (answer.problem) {
      message.textContent = answer.problem;
      return;
    }
    data.practice.holdings[ticker].lastPriceCents = answer.quote.priceCents;
  }
  saveData(data);
  message.textContent = "Prices updated " + new Date().toLocaleTimeString();
  renderPractice();
});

document.getElementById("reset-start").addEventListener("click", () => {
  document.getElementById("reset-confirm").hidden = false;
});
document.getElementById("reset-no").addEventListener("click", () => {
  document.getElementById("reset-confirm").hidden = true;
});
document.getElementById("reset-yes").addEventListener("click", () => {
  data.practice = { cashCents: PRACTICE_START_CENTS, startCents: PRACTICE_START_CENTS, holdings: {} };
  saveData(data);
  document.getElementById("reset-confirm").hidden = true;
  document.getElementById("trade-message").textContent = "";
  renderPractice();
});

document.getElementById("api-key-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const key = apiKeyInput.value.trim();
  saveApiKey(key);
  document.getElementById("api-key-message").textContent = key ? "Key saved in this browser" : "Key removed";
});

// Asks Finnhub for the latest price. Returns { quote } or { problem }.
// async because the answer comes back over the internet, later.
async function fetchQuote(ticker) {
  const key = loadApiKey();
  if (!key) {
    return { problem: "Add your free Finnhub key below to look up prices." };
  }
  // encodeURIComponent makes the text safe to put inside a web address
  const url = "https://finnhub.io/api/v1/quote?symbol=" + encodeURIComponent(ticker) +
    "&token=" + encodeURIComponent(key);
  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    // fetch only throws when no answer arrives: offline, or blocked by CORS
    return { problem: "Couldn't reach Finnhub. Check your internet connection and try again." };
  }
  if (response.status === 401 || response.status === 403) {
    return { problem: "Finnhub didn't accept that key. Check it in Price data below." };
  }
  if (response.status === 429) {
    return { problem: "That's a lot of lookups in one minute. Wait a moment and try again." };
  }
  if (!response.ok) {
    return { problem: "Finnhub had a problem (error " + response.status + "). Try again later." };
  }
  const quote = parseQuote(ticker, await response.json());
  if (quote === null) {
    return { problem: "No price found for " + ticker + ". Check the ticker (US stocks and ETFs only)." };
  }
  return { quote: quote };
}

document.getElementById("quote-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const result = document.getElementById("quote-result");
  const ticker = normalizeTicker(document.getElementById("ticker").value);
  result.hidden = true;
  currentQuote = null;
  document.getElementById("trade-message").textContent = "";
  if (ticker === null) {
    quoteMessage.textContent = "Type a ticker, like VOO or AAPL";
    return;
  }
  quoteMessage.textContent = "Looking up " + ticker + "...";
  const answer = await fetchQuote(ticker);
  if (answer.problem) {
    quoteMessage.textContent = answer.problem;
    return;
  }
  const quote = answer.quote;
  currentQuote = quote;
  // A fresh price for something you own updates its value too
  if (data.practice.holdings[quote.ticker]) {
    data.practice.holdings[quote.ticker].lastPriceCents = quote.priceCents;
    saveData(data);
  }
  quoteMessage.textContent = "";
  document.getElementById("quote-ticker").textContent = quote.ticker;
  document.getElementById("quote-price").textContent = formatCents(quote.priceCents);
  document.getElementById("quote-change").textContent = describeDayChange(quote);
  document.getElementById("quote-time").textContent = quote.time
    ? "Price as of " + new Date(quote.time).toLocaleString()
    : "";
  result.hidden = false;
  renderPractice();
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
renderBudgetInputs();
apiKeyInput.value = loadApiKey();
renderLessons();
fillSettingsForm();
renderGreeting();
dateInput.value = toDateString(new Date());
render();
// Ready to type, without scrolling the headline number off screen
amountInput.focus({ preventScroll: true });
