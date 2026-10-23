// The ONLY file allowed to touch localStorage.
// Keeping it in one place means if we ever change how data is saved,
// we only change this file.

const STORAGE_KEY = "budgetApp";

// The shape of a brand new user's data. New features add fields here.
function emptyData() {
  return {
    entries: [],
    settings: {
      // null means "not set": the hours-of-work feature stays hidden
      hourlyWageCents: null,
    },
  };
}

// Fills in defaults for anything missing, for old saves and imported backups.
// Settings is merged on its own so a new setting gets its default too.
function withDefaults(saved) {
  const data = Object.assign(emptyData(), saved);
  data.settings = Object.assign(emptyData().settings, data.settings);
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
