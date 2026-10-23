// The ONLY file allowed to touch localStorage.
// Keeping it in one place means if we ever change how data is saved,
// we only change this file.

const STORAGE_KEY = "budgetApp";

// The shape of a brand new user's data. New features add fields here.
function emptyData() {
  return {
    entries: [],
  };
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
  // Fields missing from older saves get their default value
  return Object.assign(emptyData(), saved);
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
