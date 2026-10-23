// Run with: node tests.js
// assert throws an error when a check fails, which stops the file
// before it reaches "All tests passed".
const assert = require("assert");
const { formatCents } = require("./logic.js");

assert.strictEqual(formatCents(1250), "$12.50");

console.log("All tests passed");
