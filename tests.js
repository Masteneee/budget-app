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

console.log("All tests passed");
