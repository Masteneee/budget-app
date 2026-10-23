// Run with: node tests.js
// assert throws an error when a check fails, which stops the file
// before it reaches "All tests passed".
const assert = require("assert");
const logic = require("./logic.js");

// formatCents
assert.strictEqual(logic.formatCents(1250), "$12.50");
assert.strictEqual(logic.formatCents(0), "$0.00");
assert.strictEqual(logic.formatCents(-500), "-$5.00");
assert.strictEqual(logic.formatCents(5), "$0.05");

// parseAmountToCents
assert.strictEqual(logic.parseAmountToCents("12"), 1200);
assert.strictEqual(logic.parseAmountToCents("12.5"), 1250);
assert.strictEqual(logic.parseAmountToCents("12,50"), 1250);
assert.strictEqual(logic.parseAmountToCents(" 0.07 "), 7);
assert.strictEqual(logic.parseAmountToCents("0.1"), 10);
assert.strictEqual(logic.parseAmountToCents(""), null);
assert.strictEqual(logic.parseAmountToCents("abc"), null);
assert.strictEqual(logic.parseAmountToCents("0"), null);
assert.strictEqual(logic.parseAmountToCents("-5"), null);
assert.strictEqual(logic.parseAmountToCents("1.234"), null);

// toDateString uses local time, and months start at 0 in JavaScript
assert.strictEqual(logic.toDateString(new Date(2026, 0, 5)), "2026-01-05");
assert.strictEqual(logic.toDateString(new Date(2026, 9, 23, 23, 30)), "2026-10-23");

// monthKey and entriesInMonth
assert.strictEqual(logic.monthKey("2026-10-23"), "2026-10");
const sample = [
  { id: "a", date: "2026-10-01" },
  { id: "b", date: "2026-09-30" },
  { id: "c", date: "2026-10-15" },
  { id: "d", date: "2026-10-15" },
];
assert.deepStrictEqual(logic.entriesInMonth(sample, "2026-10").map((e) => e.id), ["a", "c", "d"]);
assert.deepStrictEqual(logic.entriesInMonth([], "2026-10"), []);

// sortNewestFirst: newest date first, and the later-added entry first on ties
assert.deepStrictEqual(logic.sortNewestFirst(sample).map((e) => e.id), ["d", "c", "a", "b"]);
// It must not change the original array
assert.strictEqual(sample[0].id, "a");

// formatShortDate
assert.strictEqual(logic.formatShortDate("2026-10-23"), "Oct 23");
assert.strictEqual(logic.formatShortDate("2026-01-05"), "Jan 5");

// updateEntry and removeEntry
const twoEntries = [
  { id: "a", amountCents: 100, note: "" },
  { id: "b", amountCents: 200, note: "bus" },
];
const updated = logic.updateEntry(twoEntries, "b", { amountCents: 250 });
assert.deepStrictEqual(updated[1], { id: "b", amountCents: 250, note: "bus" });
assert.strictEqual(updated[0], twoEntries[0]);
assert.strictEqual(twoEntries[1].amountCents, 200); // original untouched
assert.deepStrictEqual(logic.updateEntry(twoEntries, "zzz", { amountCents: 1 }), twoEntries);
assert.deepStrictEqual(logic.removeEntry(twoEntries, "a").map((e) => e.id), ["b"]);
assert.strictEqual(logic.removeEntry(twoEntries, "zzz").length, 2);

// categoriesFor
assert.deepStrictEqual(logic.categoriesFor("income"), ["Job", "Gift", "Other"]);
assert.strictEqual(logic.categoriesFor("expense")[0], "Food");

// monthTotals
assert.deepStrictEqual(logic.monthTotals([]), { inCents: 0, outCents: 0, leftCents: 0 });
assert.deepStrictEqual(
  logic.monthTotals([
    { type: "income", amountCents: 50000 },
    { type: "expense", amountCents: 1250 },
    { type: "expense", amountCents: 750 },
    { type: "income", amountCents: 2000 },
  ]),
  { inCents: 52000, outCents: 2000, leftCents: 50000 }
);
// Spending more than you earned gives a negative "left"
assert.strictEqual(logic.monthTotals([{ type: "expense", amountCents: 300 }]).leftCents, -300);

// totalsByCategory
assert.deepStrictEqual(logic.totalsByCategory([]), []);
assert.deepStrictEqual(
  logic.totalsByCategory([
    { type: "expense", category: "Fun", amountCents: 1500 },
    { type: "expense", category: "Food", amountCents: 1000 },
    { type: "income", category: "Job", amountCents: 99999 },
    { type: "expense", category: "Food", amountCents: 3200 },
    { type: "expense", category: "Bills", amountCents: 1500 },
  ]),
  [
    { category: "Food", cents: 4200 },
    { category: "Bills", cents: 1500 },
    { category: "Fun", cents: 1500 },
  ]
);

// formatMonthLabel and shiftMonth
assert.strictEqual(logic.formatMonthLabel("2026-10"), "October 2026");
assert.strictEqual(logic.shiftMonth("2026-10", -1), "2026-09");
assert.strictEqual(logic.shiftMonth("2026-01", -1), "2025-12");
assert.strictEqual(logic.shiftMonth("2025-12", 1), "2026-01");
assert.strictEqual(logic.shiftMonth("2026-03", -15), "2024-12");

// compareMonths
const october = [
  { type: "expense", category: "Food", amountCents: 6000 },
  { type: "expense", category: "Fun", amountCents: 2000 },
];
const september = [
  { type: "expense", category: "Food", amountCents: 10000 },
  { type: "expense", category: "Bills", amountCents: 3000 },
  { type: "expense", category: "Fun", amountCents: 2000 },
];
assert.deepStrictEqual(logic.compareMonths(october, september), [
  { category: "Food", currentCents: 6000, previousCents: 10000, changeCents: -4000 },
  { category: "Fun", currentCents: 2000, previousCents: 2000, changeCents: 0 },
  { category: "Bills", currentCents: 0, previousCents: 3000, changeCents: -3000 },
]);
assert.deepStrictEqual(logic.compareMonths([], []), []);
// A brand new category counts as "more than last month"
assert.strictEqual(logic.compareMonths(october, [])[0].changeCents, 6000);

// describeChange
assert.strictEqual(logic.describeChange({ category: "Food", changeCents: -4000 }), "Food: $40.00 less than last month");
assert.strictEqual(logic.describeChange({ category: "Fun", changeCents: 550 }), "Fun: $5.50 more than last month");
assert.strictEqual(logic.describeChange({ category: "Fun", changeCents: 0 }), "Fun: same as last month");

// hoursOfWork and formatHours
assert.strictEqual(logic.hoursOfWork(2400, 1600), 1.5);
assert.strictEqual(logic.hoursOfWork(2400, null), null);
assert.strictEqual(logic.hoursOfWork(2400, 0), null);
assert.strictEqual(logic.formatHours(1.5), "1.5 h");
assert.strictEqual(logic.formatHours(2), "2 h");
assert.strictEqual(logic.formatHours(0.125), "0.1 h");
assert.strictEqual(logic.formatHours(0.03), "< 0.1 h");
assert.strictEqual(logic.formatHours(1.96), "2 h");
assert.strictEqual(logic.formatHours(logic.hoursOfWork(1250, 1610)), "0.8 h");

// plural
assert.strictEqual(logic.plural(1, "entry", "entries"), "1 entry");
assert.strictEqual(logic.plural(0, "entry", "entries"), "0 entries");
assert.strictEqual(logic.plural(3, "entry", "entries"), "3 entries");

// checkBackup
const goodEntry = { id: "a", type: "expense", amountCents: 500, category: "Food", note: "", date: "2026-10-01" };
assert.deepStrictEqual(logic.checkBackup({ app: "budget-app", version: 1, data: { entries: [goodEntry] } }), []);
assert.deepStrictEqual(logic.checkBackup({ app: "budget-app", version: 1, data: { entries: [] } }), []);
assert.strictEqual(logic.checkBackup(null).length, 1);
assert.strictEqual(logic.checkBackup([1, 2]).length, 1);
assert.strictEqual(logic.checkBackup({ app: "other-app" }).length, 1);
assert.strictEqual(logic.checkBackup({ app: "budget-app", data: {} }).length, 1);
assert.deepStrictEqual(
  logic.checkBackup({
    app: "budget-app",
    data: { entries: [goodEntry, Object.assign({}, goodEntry, { amountCents: 12.5 }), null] },
  }),
  ["Entry 2 is damaged.", "Entry 3 is damaged."]
);

// formatLongDate
assert.strictEqual(logic.formatLongDate("2027-03-01"), "Mar 1, 2027");

// goalSavedCents and goalPercent
const bikeGoal = {
  targetCents: 40000,
  contributions: [
    { date: "2026-09-01", amountCents: 10000 },
    { date: "2026-10-01", amountCents: 5000 },
  ],
};
assert.strictEqual(logic.goalSavedCents(bikeGoal), 15000);
assert.strictEqual(logic.goalPercent(bikeGoal), 37); // 37.5 rounds down
assert.strictEqual(logic.goalPercent({ targetCents: 100, contributions: [] }), 0);
assert.strictEqual(logic.goalPercent({ targetCents: 100, contributions: [{ amountCents: 99 }] }), 99);
assert.strictEqual(logic.goalPercent({ targetCents: 100, contributions: [{ amountCents: 250 }] }), 100);

// budgetRows
const budgetEntries = [
  { type: "expense", category: "Food", amountCents: 4200 },
  { type: "expense", category: "Fun", amountCents: 6000 },
  { type: "expense", category: "Other", amountCents: 300 },
];
assert.deepStrictEqual(logic.budgetRows(budgetEntries, { Food: 10000, Fun: 5000, Bills: 8000 }), [
  { category: "Fun", spentCents: 6000, budgetCents: 5000, percent: 100, isOver: true },
  { category: "Food", spentCents: 4200, budgetCents: 10000, percent: 42, isOver: false },
  { category: "Other", spentCents: 300, budgetCents: null, percent: null, isOver: false },
  { category: "Bills", spentCents: 0, budgetCents: 8000, percent: 0, isOver: false },
]);
assert.deepStrictEqual(logic.budgetRows([], {}), []);

// describeBudget
assert.strictEqual(logic.describeBudget({ spentCents: 4200, budgetCents: 10000 }), "$58.00 left of $100.00");
assert.strictEqual(logic.describeBudget({ spentCents: 10000, budgetCents: 10000 }), "Right on your $100.00 plan");
assert.strictEqual(logic.describeBudget({ spentCents: 11200, budgetCents: 10000 }), "$12.00 above your $100.00 plan");
assert.strictEqual(logic.describeBudget({ spentCents: 300, budgetCents: null }), "");

// monthsBetween
assert.strictEqual(logic.monthsBetween("2026-10", "2027-01"), 3);
assert.strictEqual(logic.monthsBetween("2026-10", "2026-10"), 0);

// goalMoneyThisMonth (today is Oct 23, 2026)
const today = "2026-10-23";
// $400 needed by Jan 2027, $100 saved before October: $300 over 4 months = $75
const datedGoal = {
  targetCents: 40000,
  targetDate: "2027-01-15",
  contributions: [{ date: "2026-09-10", amountCents: 10000 }],
};
assert.strictEqual(logic.goalMoneyThisMonth(datedGoal, today), 7500);
// Putting in $20 this month doesn't lower the share; putting in $90 raises it
datedGoal.contributions.push({ date: "2026-10-05", amountCents: 2000 });
assert.strictEqual(logic.goalMoneyThisMonth(datedGoal, today), 7500);
datedGoal.contributions.push({ date: "2026-10-06", amountCents: 7000 });
assert.strictEqual(logic.goalMoneyThisMonth(datedGoal, today), 9000);
// No date: only what was actually added this month
const undatedGoal = { targetCents: 50000, targetDate: null, contributions: [{ date: "2026-10-01", amountCents: 1500 }] };
assert.strictEqual(logic.goalMoneyThisMonth(undatedGoal, today), 1500);
// Overdue goal: treated like an undated one
const overdueGoal = { targetCents: 50000, targetDate: "2026-09-01", contributions: [] };
assert.strictEqual(logic.goalMoneyThisMonth(overdueGoal, today), 0);
// Already reached before this month: nothing more is needed
const doneGoal = { targetCents: 1000, targetDate: "2026-12-01", contributions: [{ date: "2026-08-01", amountCents: 1000 }] };
assert.strictEqual(logic.goalMoneyThisMonth(doneGoal, today), 0);
// $100 due in December = 3 months (Oct, Nov, Dec). $33.333... rounds up
// to $33.34 so the three shares cover the full $100
const unevenGoal = { targetCents: 10000, targetDate: "2026-12-31", contributions: [] };
assert.strictEqual(logic.goalMoneyThisMonth(unevenGoal, today), 3334);
// Due this month: the whole missing amount belongs to this month
const dueNowGoal = { targetCents: 10000, targetDate: "2026-10-31", contributions: [] };
assert.strictEqual(logic.goalMoneyThisMonth(dueNowGoal, today), 10000);

// safeToSpend: $900 in, $200 out, $75 goal share, $50 of a $80 Bills plan
// paid, 9 days left in October (23 to 31)
const safeEntries = [
  { type: "income", category: "Job", amountCents: 90000, date: "2026-10-01" },
  { type: "expense", category: "Food", amountCents: 15000, date: "2026-10-10" },
  { type: "expense", category: "Bills", amountCents: 5000, date: "2026-10-02" },
  { type: "expense", category: "Food", amountCents: 99999, date: "2026-09-10" }, // other month
];
const safeGoal = { targetCents: 40000, targetDate: "2027-01-15", contributions: [{ date: "2026-09-10", amountCents: 10000 }] };
assert.deepStrictEqual(logic.safeToSpend(safeEntries, [safeGoal], { Bills: 8000 }, today), {
  leftCents: 70000,
  goalsCents: 7500,
  billsCents: 3000,
  availableCents: 59500,
  daysLeft: 9,
  perDayCents: 6611, // 59500 / 9 = 6611.1, rounded down
});
// Nothing logged: zero everywhere, last day of a 30-day month has 1 day left
assert.deepStrictEqual(logic.safeToSpend([], [], {}, "2026-11-30"), {
  leftCents: 0, goalsCents: 0, billsCents: 0, availableCents: 0, daysLeft: 1, perDayCents: 0,
});
// More planned than available: per day stays at 0, never negative
assert.strictEqual(logic.safeToSpend(safeEntries, [safeGoal], { Bills: 900000 }, today).perDayCents, 0);
// February 2028 has 29 days (leap year)
assert.strictEqual(logic.safeToSpend([], [], {}, "2028-02-01").daysLeft, 29);

// fiftyThirtyTwenty: $1000 income; needs $420 (Food + Bills), wants $100,
// savings $150 put into a goal in October
const ruleEntries = [
  { type: "income", category: "Job", amountCents: 100000, date: "2026-10-01" },
  { type: "expense", category: "Food", amountCents: 30000, date: "2026-10-03" },
  { type: "expense", category: "Bills", amountCents: 12000, date: "2026-10-04" },
  { type: "expense", category: "Fun", amountCents: 10000, date: "2026-10-05" },
  { type: "expense", category: "Fun", amountCents: 5000, date: "2026-09-05" }, // other month
];
const ruleGoals = [
  { contributions: [{ date: "2026-10-10", amountCents: 15000 }, { date: "2026-09-10", amountCents: 9999 }] },
];
assert.deepStrictEqual(logic.fiftyThirtyTwenty(ruleEntries, ruleGoals, "2026-10"), {
  incomeCents: 100000,
  groups: [
    { key: "needs", label: "Needs", percent: 50, targetCents: 50000, actualCents: 42000 },
    { key: "wants", label: "Wants", percent: 30, targetCents: 30000, actualCents: 10000 },
    { key: "savings", label: "Savings", percent: 20, targetCents: 20000, actualCents: 15000 },
  ],
});
// No income: targets are 0, nothing crashes
assert.strictEqual(logic.fiftyThirtyTwenty([], [], "2026-10").groups[0].targetCents, 0);
// Every expense category belongs to a group
for (const category of logic.EXPENSE_CATEGORIES) {
  assert.ok(logic.CATEGORY_GROUPS[category], category + " has no 50/30/20 group");
}

// effectiveBudgets: Food $100/month, Fun $50/month, rollover since August
const rollEntries = [
  { type: "expense", category: "Food", amountCents: 6000, date: "2026-08-10" }, // $40 Food left
  { type: "expense", category: "Food", amountCents: 15000, date: "2026-09-10" }, // $140 available, $10 over
  { type: "expense", category: "Fun", amountCents: 2000, date: "2026-09-12" }, // $100 available, $80 left
  { type: "expense", category: "Food", amountCents: 99999, date: "2026-07-01" }, // before rollover started
];
const baseBudgets = { Food: 10000, Fun: 5000 };
assert.deepStrictEqual(logic.effectiveBudgets(rollEntries, baseBudgets, "2026-10", "2026-08"), {
  budgets: { Food: 10000, Fun: 13000 },
  carried: { Food: 0, Fun: 8000 },
});
// September: only August counts so far
assert.deepStrictEqual(logic.effectiveBudgets(rollEntries, baseBudgets, "2026-09", "2026-08").budgets, {
  Food: 14000,
  Fun: 10000,
});
// The month rollover starts gets nothing extra yet, and "off" means plain budgets
assert.deepStrictEqual(logic.effectiveBudgets(rollEntries, baseBudgets, "2026-08", "2026-08").budgets, baseBudgets);
assert.deepStrictEqual(logic.effectiveBudgets(rollEntries, baseBudgets, "2026-10", null).budgets, baseBudgets);
// Works across a year boundary
assert.strictEqual(logic.effectiveBudgets([], { Fun: 5000 }, "2027-02", "2026-12").budgets.Fun, 15000);

console.log("All tests passed");
