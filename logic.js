// Pure functions only: same input always gives the same output,
// and nothing here touches the page (DOM) or localStorage.
// That is what makes these functions easy to test with Node.

const EXPENSE_CATEGORIES = ["Food", "Transport", "Fun", "School", "Bills", "Other"];

// Money is stored in cents (1250 = $12.50) because computers can't
// store most decimals exactly: 0.1 + 0.2 gives 0.30000000000000004.
function formatCents(cents) {
  const dollars = (cents / 100).toFixed(2);
  return "$" + dollars;
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

// Returns a new array where the entry with this id has the changes
// applied. We never modify the old array, which keeps bugs local.
function updateEntry(entries, id, changes) {
  return entries.map((entry) => (entry.id === id ? Object.assign({}, entry, changes) : entry));
}

function removeEntry(entries, id) {
  return entries.filter((entry) => entry.id !== id);
}

// In the browser, functions above are already global. Node has no
// globals between files, so tests.js needs them handed over here.
// `module` only exists in Node, which is why we check first.
if (typeof module !== "undefined") {
  module.exports = {
    EXPENSE_CATEGORIES,
    formatCents,
    parseAmountToCents,
    toDateString,
    monthKey,
    entriesInMonth,
    sortNewestFirst,
    formatShortDate,
    updateEntry,
    removeEntry,
  };
}
