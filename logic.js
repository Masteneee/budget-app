// Pure functions only: same input always gives the same output,
// and nothing here touches the page (DOM) or localStorage.
// That is what makes these functions easy to test with Node.

// Money is stored in cents (1250 = $12.50) because computers can't
// store most decimals exactly: 0.1 + 0.2 gives 0.30000000000000004.
function formatCents(cents) {
  const dollars = (cents / 100).toFixed(2);
  return "$" + dollars;
}

// In the browser, functions above are already global. Node has no
// globals between files, so tests.js needs them handed over here.
// `module` only exists in Node, which is why we check first.
if (typeof module !== "undefined") {
  module.exports = { formatCents };
}
