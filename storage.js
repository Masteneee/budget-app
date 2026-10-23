// The ONLY file allowed to touch localStorage.
// Keeping it in one place means if we ever change how data is saved,
// we only change this file.

const STORAGE_KEY = "budgetApp";
// Kept apart from the rest so it never ends up in a backup file
const API_KEY_STORAGE_KEY = "budgetApp.finnhubKey";

const PRACTICE_START_CENTS = 100000; // $1,000 of fake money

// The shape of a brand new user's data. New features add fields here.
function emptyData() {
  return {
    entries: [],
    goals: [],
    // Monthly limit per category in cents, e.g. { Food: 20000 }
    budgets: {},
    // The paper trading simulator: fake money only
    practice: {
      cashCents: PRACTICE_START_CENTS,
      // All fake money ever put in ($1,000 plus anything added from goals),
      // so "gain or loss" compares against what you started with
      startCents: PRACTICE_START_CENTS,
      // { VOO: { shares: 1, costCents: 51234, lastPriceCents: 51234 } }
      holdings: {},
    },
    settings: {
      // null means "not set": the hours-of-work feature stays hidden
      hourlyWageCents: null,
      // "simple" (just track) or "503020" (needs, wants, savings)
      budgetStyle: "simple",
      // The month rollover was turned on, like "2026-10"; null means off
      rolloverStart: null,
    },
  };
}

// Fills in defaults for anything missing, for old saves and imported backups.
// Settings is merged on its own so a new setting gets its default too.
function withDefaults(saved) {
  const data = Object.assign(emptyData(), saved);
  data.settings = Object.assign(emptyData().settings, data.settings);
  data.practice = Object.assign(emptyData().practice, data.practice);
  return data;
}

function loadData() {
  let saved = null;
  try {
    // localStorage only stores text, so we saved JSON text earlier
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (error) {
    // Broken or blocked storage: start fresh instead of crashing the page
    console.warn("Could not read saved data", error);
  }
  return withDefaults(saved);
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Swaps all saved data for a backup's data and returns the new data
function replaceData(newData) {
  const data = withDefaults(newData);
  saveData(data);
  return data;
}

function loadApiKey() {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || "";
  } catch (error) {
    return "";
  }
}

function saveApiKey(key) {
  if (key) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}
