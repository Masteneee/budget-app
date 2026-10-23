// Run with: node tests.js
// assert throws an error when a check fails, which stops the file
// before it reaches "All tests passed".
const assert = require("assert");
const logic = require("./logic.js");

// formatCents
assert.strictEqual(logic.formatCents(1250), "$12.50");

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

console.log("All tests passed");
