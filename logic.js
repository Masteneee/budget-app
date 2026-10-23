// Pure functions only: same input always gives the same output,
// and nothing here touches the page (DOM) or localStorage.
// That is what makes these functions easy to test with Node.

const EXPENSE_CATEGORIES = ["Food", "Transport", "Fun", "School", "Bills", "Other"];
const INCOME_CATEGORIES = ["Job", "Gift", "Other"];

function categoriesFor(type) {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

// Money is stored in cents (1250 = $12.50) because computers can't
// store most decimals exactly: 0.1 + 0.2 gives 0.30000000000000004.
function formatCents(cents) {
  // The minus goes before the "$": -$5.00, not $-5.00
  const sign = cents < 0 ? "-" : "";
  const dollars = (Math.abs(cents) / 100).toFixed(2);
  // Commas every 3 digits before the dot: 1234567.89 -> 1,234,567.89.
  // The pattern finds spots followed by groups of exactly 3 digits.
  const withCommas = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return sign + "$" + withCommas;
}

// Turns what the user typed ("12", "12.5", "12,50") into cents (1250).
// Returns null when the text isn't a positive amount.
// We split the text instead of using parseFloat so no decimal
// rounding error can sneak in.
function parseAmountToCents(text) {
  // Quebec keyboards often type a comma as the decimal mark
  const cleaned = String(text).trim().replace(",", ".");
  // Digits, then optionally a dot and 1 or 2 more digits
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    return null;
  }
  const parts = cleaned.split(".");
  const dollars = Number(parts[0]);
  // "5" after the dot means 50 cents, not 5, so pad to 2 digits
  const cents = parts.length > 1 ? Number(parts[1].padEnd(2, "0")) : 0;
  const total = dollars * 100 + cents;
  return total > 0 ? total : null;
}

// "YYYY-MM-DD" in the user's local time zone. toISOString() would use
// UTC, which turns 9 pm in Montreal into tomorrow's date.
function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

// "2026-10-23" -> "2026-10". Text comparison works because the
// format always has the same length and puts the year first.
function monthKey(dateString) {
  return dateString.slice(0, 7);
}

function entriesInMonth(entries, month) {
  return entries.filter((entry) => monthKey(entry.date) === month);
}

// Newest date first. Entries are saved in the order they were added,
// so reversing first puts the latest one on top when dates are equal
// (sort keeps the existing order for ties).
function sortNewestFirst(entries) {
  return [...entries].reverse().sort((a, b) => b.date.localeCompare(a.date));
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2026-10-23" -> "Oct 23". We read the numbers ourselves because
// new Date("2026-10-23") is treated as UTC midnight, which is still
// Oct 22 in Montreal.
function formatShortDate(dateString) {
  const month = Number(dateString.slice(5, 7));
  const day = Number(dateString.slice(8, 10));
  return MONTH_NAMES[month - 1] + " " + day;
}

const FULL_MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

// "2026-10" -> "October 2026"
function formatMonthLabel(month) {
  return FULL_MONTH_NAMES[Number(month.slice(5, 7)) - 1] + " " + month.slice(0, 4);
}

// shiftMonth("2026-01", -1) -> "2025-12". Counting months from year 0
// turns "previous month" into simple subtraction, even across years.
function shiftMonth(month, change) {
  const totalMonths = Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7)) - 1 + change;
  const year = Math.floor(totalMonths / 12);
  const monthNumber = (totalMonths % 12) + 1;
  return year + "-" + String(monthNumber).padStart(2, "0");
}

// "2027-03-01" -> "Mar 1, 2027", for dates that may be in another year
function formatLongDate(dateString) {
  return formatShortDate(dateString) + ", " + dateString.slice(0, 4);
}

// Returns a new array where the entry with this id has the changes
// applied. We never modify the old array, which keeps bugs local.
function updateEntry(entries, id, changes) {
  return entries.map((entry) => (entry.id === id ? Object.assign({}, entry, changes) : entry));
}

function removeEntry(entries, id) {
  return entries.filter((entry) => entry.id !== id);
}

// Adds up money in and money out for a list of entries.
// Works on any list, so the caller decides which month to pass in.
function monthTotals(entries) {
  let inCents = 0;
  let outCents = 0;
  for (const entry of entries) {
    if (entry.type === "income") {
      inCents += entry.amountCents;
    } else {
      outCents += entry.amountCents;
    }
  }
  return { inCents: inCents, outCents: outCents, leftCents: inCents - outCents };
}

// Spending per category, biggest first: [{ category: "Food", cents: 4200 }, ...]
// Income is skipped because this answers "where did my money go?"
function totalsByCategory(entries) {
  // An object used as a lookup table: { Food: 4200, Fun: 1500 }
  const totals = {};
  for (const entry of entries) {
    if (entry.type === "income") {
      continue;
    }
    totals[entry.category] = (totals[entry.category] || 0) + entry.amountCents;
  }
  const list = Object.keys(totals).map((category) => ({ category: category, cents: totals[category] }));
  // Biggest first; equal amounts go alphabetically so the order never jumps around
  return list.sort((a, b) => b.cents - a.cents || a.category.localeCompare(b.category));
}

// Per category: this month's spending, last month's, and the change.
// Includes categories that only appear in one of the two months.
function compareMonths(currentEntries, previousEntries) {
  const current = totalsByCategory(currentEntries);
  const previous = totalsByCategory(previousEntries);
  const comparison = [];
  for (const total of current) {
    const before = previous.find((p) => p.category === total.category);
    const previousCents = before ? before.cents : 0;
    comparison.push({
      category: total.category,
      currentCents: total.cents,
      previousCents: previousCents,
      changeCents: total.cents - previousCents,
    });
  }
  // Categories spent on last month but not this month go at the end
  for (const total of previous) {
    if (!current.some((c) => c.category === total.category)) {
      comparison.push({
        category: total.category,
        currentCents: 0,
        previousCents: total.cents,
        changeCents: -total.cents,
      });
    }
  }
  return comparison;
}

// "Food: $40.00 less than last month". Plain facts, no judgement words.
function describeChange(row) {
  if (row.changeCents === 0) {
    return row.category + ": same as last month";
  }
  const direction = row.changeCents < 0 ? "less" : "more";
  return row.category + ": " + formatCents(Math.abs(row.changeCents)) + " " + direction + " than last month";
}

// How many hours of work an expense cost, e.g. $24 at $16/h = 1.5.
// Returns null when no wage is set, so the caller can show nothing.
function hoursOfWork(amountCents, hourlyWageCents) {
  if (!hourlyWageCents) {
    return null;
  }
  // Both are in cents, so the cents cancel out and we get hours
  return amountCents / hourlyWageCents;
}

// 1.5 -> "1.5 h", 2 -> "2 h", 0.03 -> "< 0.1 h"
function formatHours(hours) {
  const rounded = Math.round(hours * 10) / 10;
  if (rounded === 0) {
    return "< 0.1 h";
  }
  // String(2) is "2" and String(1.5) is "1.5", so no ".0" to remove
  return String(rounded) + " h";
}

// One row per category that has spending or a budget this month.
// budgets looks like { Food: 10000, Fun: 5000 } (cents per month).
function budgetRows(entries, budgets) {
  const rows = totalsByCategory(entries).map((total) => ({
    category: total.category,
    spentCents: total.cents,
    budgetCents: budgets[total.category] || null,
  }));
  // Budgeted categories with no spending yet still deserve a row
  for (const category of EXPENSE_CATEGORIES) {
    if (budgets[category] && !rows.some((row) => row.category === category)) {
      rows.push({ category: category, spentCents: 0, budgetCents: budgets[category] });
    }
  }
  for (const row of rows) {
    row.percent = row.budgetCents ? Math.min(100, Math.floor((row.spentCents / row.budgetCents) * 100)) : null;
    row.isOver = row.budgetCents !== null && row.spentCents > row.budgetCents;
  }
  return rows;
}

// Calm, factual wording. Going over is information, not a failure.
function describeBudget(row) {
  if (!row.budgetCents) {
    return "";
  }
  const difference = row.budgetCents - row.spentCents;
  if (difference > 0) {
    return formatCents(difference) + " left of " + formatCents(row.budgetCents);
  }
  if (difference === 0) {
    return "Right on your " + formatCents(row.budgetCents) + " plan";
  }
  return formatCents(-difference) + " above your " + formatCents(row.budgetCents) + " plan";
}

// Budgets for a month once rollover is applied.
// Unspent budget carries to the next month; overspending is never
// taken back (no guilt). Carrying starts in rolloverStart, the month
// rollover was turned on (null = off), so old months don't count.
// Returns { budgets: {Food: 14000}, carried: {Food: 4000} }.
function effectiveBudgets(entries, budgets, month, rolloverStart) {
  const carried = {};
  if (rolloverStart && rolloverStart < month) {
    // Walk forward one month at a time, from the start up to last month
    for (let m = rolloverStart; m < month; m = shiftMonth(m, 1)) {
      const spentByCategory = {};
      for (const total of totalsByCategory(entriesInMonth(entries, m))) {
        spentByCategory[total.category] = total.cents;
      }
      for (const category of Object.keys(budgets)) {
        const available = budgets[category] + (carried[category] || 0);
        carried[category] = Math.max(0, available - (spentByCategory[category] || 0));
      }
    }
  }
  const result = {};
  for (const category of Object.keys(budgets)) {
    result[category] = budgets[category] + (carried[category] || 0);
  }
  return { budgets: result, carried: carried };
}

// A goal keeps every contribution with its date (not just a total),
// so we can later ask "how much went to goals this month?"
function goalSavedCents(goal) {
  return goal.contributions.reduce((sum, contribution) => sum + contribution.amountCents, 0);
}

// 0 to 100, rounded down so a goal only shows 100% once it's truly reached
function goalPercent(goal) {
  const percent = Math.floor((goalSavedCents(goal) / goal.targetCents) * 100);
  return Math.min(percent, 100);
}

// Months from one "YYYY-MM" to another: monthsBetween("2026-10", "2027-01") is 3
function monthsBetween(fromMonth, toMonth) {
  const toNumber = (month) => Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7));
  return toNumber(toMonth) - toNumber(fromMonth);
}

// How much of a goal's money belongs to this month.
// Dated goals get a fair monthly share of what was missing when the
// month started; if you put in more than that, the real amount counts.
// Undated or overdue goals only count what you actually put in.
function goalMoneyThisMonth(goal, today) {
  const month = monthKey(today);
  let savedBefore = 0;
  let addedThisMonth = 0;
  for (const contribution of goal.contributions) {
    if (monthKey(contribution.date) === month) {
      addedThisMonth += contribution.amountCents;
    } else if (contribution.date < today) {
      savedBefore += contribution.amountCents;
    }
  }
  if (!goal.targetDate || goal.targetDate < today) {
    return addedThisMonth;
  }
  // This month counts too, so a goal due this month has 1 month left
  const monthsLeft = monthsBetween(month, monthKey(goal.targetDate)) + 1;
  const missing = Math.max(0, goal.targetCents - savedBefore);
  // Round up so the monthly shares always add up to the full target
  const monthlyShare = Math.ceil(missing / monthsLeft);
  return Math.max(monthlyShare, addedThisMonth);
}

// The one number at the top: how much can be spent per day for the
// rest of the month after goals and bills are covered.
// today is "YYYY-MM-DD"; passing it in (instead of reading the clock)
// keeps this function pure and testable.
function safeToSpend(entries, goals, budgets, today) {
  const month = monthKey(today);
  const monthEntries = entriesInMonth(entries, month);
  const leftCents = monthTotals(monthEntries).leftCents;

  const goalsCents = goals.reduce((sum, goal) => sum + goalMoneyThisMonth(goal, today), 0);

  // Bills still expected: the Bills plan minus what's already been paid
  const billsPaid = monthEntries
    .filter((entry) => entry.type === "expense" && entry.category === "Bills")
    .reduce((sum, entry) => sum + entry.amountCents, 0);
  const billsCents = budgets.Bills ? Math.max(0, budgets.Bills - billsPaid) : 0;

  const year = Number(today.slice(0, 4));
  const monthNumber = Number(today.slice(5, 7));
  // Day 0 of the next month is the last day of this month
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const daysLeft = daysInMonth - Number(today.slice(8, 10)) + 1;

  const availableCents = leftCents - goalsCents - billsCents;
  const perDayCents = availableCents > 0 ? Math.floor(availableCents / daysLeft) : 0;
  return {
    leftCents: leftCents,
    goalsCents: goalsCents,
    billsCents: billsCents,
    availableCents: availableCents,
    daysLeft: daysLeft,
    perDayCents: perDayCents,
  };
}

// Which 50/30/20 group each expense category belongs to
const CATEGORY_GROUPS = {
  Food: "needs",
  Transport: "needs",
  School: "needs",
  Bills: "needs",
  Fun: "wants",
  Other: "wants",
};

// Compares a month with the 50/30/20 rule: 50% of income for needs,
// 30% for wants, 20% for savings (money put into goals that month).
function fiftyThirtyTwenty(entries, goals, month) {
  const monthEntries = entriesInMonth(entries, month);
  const incomeCents = monthTotals(monthEntries).inCents;
  const spent = { needs: 0, wants: 0 };
  for (const entry of monthEntries) {
    if (entry.type === "expense") {
      spent[CATEGORY_GROUPS[entry.category] || "wants"] += entry.amountCents;
    }
  }
  let savedCents = 0;
  for (const goal of goals) {
    for (const contribution of goal.contributions) {
      if (monthKey(contribution.date) === month) {
        savedCents += contribution.amountCents;
      }
    }
  }
  const group = (key, label, percent, actualCents) => ({
    key: key,
    label: label,
    percent: percent,
    // Round down so the three targets never add up to more than the income
    targetCents: Math.floor((incomeCents * percent) / 100),
    actualCents: actualCents,
  });
  return {
    incomeCents: incomeCents,
    groups: [
      group("needs", "Needs", 50, spent.needs),
      group("wants", "Wants", 30, spent.wants),
      group("savings", "Savings", 20, savedCents),
    ],
  };
}

// plural(1, "entry", "entries") -> "1 entry"; plural(3, ...) -> "3 entries"
function plural(count, one, many) {
  return count + " " + (count === 1 ? one : many);
}

// Checks that something read from a backup file looks like our data
// before we let it replace everything. Returns a list of problems;
// an empty list means the backup is fine.
function checkBackup(backup) {
  if (!backup || typeof backup !== "object" || backup.app !== "budget-app") {
    return ["This file isn't a Budget App backup."];
  }
  if (!backup.data || !Array.isArray(backup.data.entries)) {
    return ["The backup has no list of entries."];
  }
  const problems = [];
  backup.data.entries.forEach((entry, index) => {
    const ok =
      entry &&
      typeof entry.id === "string" &&
      (entry.type === "expense" || entry.type === "income") &&
      Number.isInteger(entry.amountCents) &&
      entry.amountCents > 0 &&
      typeof entry.category === "string" &&
      typeof entry.note === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(entry.date);
    if (!ok) {
      problems.push("Entry " + (index + 1) + " is damaged.");
    }
  });
  return problems;
}

// " aapl " -> "AAPL". Returns null for anything that can't be a ticker.
// Tickers are 1 to 10 letters or digits, sometimes with "." or "-" (BRK.B).
function normalizeTicker(text) {
  const ticker = String(text).trim().toUpperCase();
  return /^[A-Z][A-Z0-9.-]{0,9}$/.test(ticker) ? ticker : null;
}

// Turns Finnhub's /quote answer into our own shape, in cents.
// Finnhub answers an unknown ticker with all zeros instead of an error,
// so a price of 0 means "not found" (returns null).
function parseQuote(ticker, json) {
  if (!json || typeof json.c !== "number" || json.c <= 0) {
    return null;
  }
  return {
    ticker: ticker,
    priceCents: Math.round(json.c * 100),
    changeCents: Math.round((json.d || 0) * 100),
    changePercent: json.dp || 0,
    // Finnhub gives seconds since 1970; JavaScript dates use milliseconds
    time: json.t ? json.t * 1000 : null,
  };
}

// "+$1.20 (+0.64%) today". The sign is shown either way, no colours.
function describeDayChange(quote) {
  const sign = quote.changeCents > 0 ? "+" : "";
  const percent = quote.changePercent.toFixed(2);
  const percentSign = quote.changePercent > 0 ? "+" : "";
  return sign + formatCents(quote.changeCents) + " (" + percentSign + percent + "%) today";
}

// ---------- Paper trading ----------
// practice looks like:
// { cashCents: 48766, holdings: { VOO: { shares: 1, costCents: 51234, lastPriceCents: 51234 } } }
// costCents is the total paid for the shares still held (the "cost basis").

// Whole shares only, 1 to 10000. Returns null for anything else.
function parseShares(text) {
  const cleaned = String(text).trim();
  if (!/^\d+$/.test(cleaned)) {
    return null;
  }
  const shares = Number(cleaned);
  return shares >= 1 && shares <= 10000 ? shares : null;
}

// Returns { practice } with a new practice object, or { problem }.
// The old object is never changed.
function buyShares(practice, ticker, shares, priceCents) {
  const costCents = shares * priceCents;
  if (costCents > practice.cashCents) {
    return {
      problem: "That costs " + formatCents(costCents) + " and you have " +
        formatCents(practice.cashCents) + " in practice cash.",
    };
  }
  const old = practice.holdings[ticker] || { shares: 0, costCents: 0 };
  const holdings = Object.assign({}, practice.holdings, {
    [ticker]: {
      shares: old.shares + shares,
      costCents: old.costCents + costCents,
      lastPriceCents: priceCents,
    },
  });
  return { practice: { cashCents: practice.cashCents - costCents, holdings: holdings } };
}

function sellShares(practice, ticker, shares, priceCents) {
  const old = practice.holdings[ticker];
  if (!old || old.shares < shares) {
    const owned = old ? old.shares : 0;
    return { problem: "You own " + plural(owned, "share", "shares") + " of " + ticker + "." };
  }
  const holdings = Object.assign({}, practice.holdings);
  if (old.shares === shares) {
    delete holdings[ticker];
  } else {
    // Selling part of a holding removes the same fraction of its cost,
    // so the average cost of the shares you keep doesn't change
    const costRemoved = Math.round((old.costCents * shares) / old.shares);
    holdings[ticker] = {
      shares: old.shares - shares,
      costCents: old.costCents - costRemoved,
      lastPriceCents: priceCents,
    };
  }
  return { practice: { cashCents: practice.cashCents + shares * priceCents, holdings: holdings } };
}

// Everything worth showing about one holding at a given price
function holdingStats(holding, priceCents) {
  const valueCents = holding.shares * priceCents;
  const gainCents = valueCents - holding.costCents;
  return {
    shares: holding.shares,
    averageCostCents: Math.round(holding.costCents / holding.shares),
    valueCents: valueCents,
    gainCents: gainCents,
    // One decimal place; cost is never 0 because we only hold bought shares
    gainPercent: Math.round((gainCents / holding.costCents) * 1000) / 10,
  };
}

// Totals for the whole practice account, using each holding's last known price
function portfolioStats(practice, startCents) {
  let holdingsCents = 0;
  for (const ticker of Object.keys(practice.holdings)) {
    const holding = practice.holdings[ticker];
    holdingsCents += holding.shares * holding.lastPriceCents;
  }
  const totalCents = practice.cashCents + holdingsCents;
  return {
    cashCents: practice.cashCents,
    holdingsCents: holdingsCents,
    totalCents: totalCents,
    gainCents: totalCents - startCents,
  };
}

// "+$12.00 (+2.4%)" or "-$3.00 (-1.0%)": the sign says it all, no colours
function describeGain(gainCents, gainPercent) {
  const sign = gainCents > 0 ? "+" : "";
  const percentSign = gainPercent > 0 ? "+" : "";
  return sign + formatCents(gainCents) + " (" + percentSign + gainPercent.toFixed(1) + "%)";
}

// In the browser, functions above are already global. Node has no
// globals between files, so tests.js needs them handed over here.
// `module` only exists in Node, which is why we check first.
if (typeof module !== "undefined") {
  module.exports = {
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    categoriesFor,
    formatCents,
    parseAmountToCents,
    toDateString,
    monthKey,
    entriesInMonth,
    sortNewestFirst,
    formatShortDate,
    updateEntry,
    removeEntry,
    monthTotals,
    totalsByCategory,
    formatMonthLabel,
    shiftMonth,
    compareMonths,
    describeChange,
    hoursOfWork,
    formatHours,
    checkBackup,
    plural,
    formatLongDate,
    goalSavedCents,
    goalPercent,
    budgetRows,
    describeBudget,
    monthsBetween,
    goalMoneyThisMonth,
    safeToSpend,
    CATEGORY_GROUPS,
    fiftyThirtyTwenty,
    effectiveBudgets,
    normalizeTicker,
    parseQuote,
    describeDayChange,
    parseShares,
    buyShares,
    sellShares,
    holdingStats,
    portfolioStats,
    describeGain,
  };
}
