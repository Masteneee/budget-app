# Learning notes

## Decisions

- **Plain `<script>` tags, not ES modules (`import`/`export`).** Modules are blocked
  by the browser when you open `index.html` directly from your disk (`file://`),
  and the app must work that way. So `logic.js` shares its functions as globals in
  the browser, and through `module.exports` for Node (see task 0.1 below).
- **App name is "Budget App" for now.** It's the name in CLAUDE.md. Easy to change
  later: it appears in `<title>` and `<h1>` in `index.html`.
- **The first test checks a real function (`formatCents`) instead of `1 + 1 === 2`.**
  It costs four lines and proves that tests.js can actually load logic.js.
- **Tapping a category button saves the expense (task 1.1).** No separate "Save"
  button: type the amount, tap "Food", done. That's the fastest flow for the
  "under 5 seconds" goal. The note goes above the buttons so you fill it first.
- **Commas count as decimal marks (task 1.1).** "12,50" and "12.50" both mean
  $12.50, because French keyboards in Quebec often use a comma.
- **Amounts allow at most 2 decimals and must be above zero (task 1.1).** "1.234"
  is rejected instead of being rounded silently.
- **"This month" means the calendar month on your device (task 1.2).** Entries from
  earlier months are kept, just not shown. The month switcher comes in task 2.2.
- **Editing happens in a popup (`<dialog>`), and deleting needs a second tap on
  "Yes, delete" (task 1.3).** A built-in dialog is less code than building our
  own overlay, and an in-page confirm looks calmer than the browser's `confirm()` box.
- **Income categories are Job, Gift and Other (task 1.4).** Matches the plan's
  examples (job pay, gifts) plus a catch-all.
- **A negative "Left this month" stays in the calm green colour (task 1.4).** It
  shows "-$7.50" plainly, with no red, per the "no guilt" rule.
- **"Where it went" counts expenses only and hides categories with $0 (task 1.5).**
  Ties are sorted alphabetically so rows don't swap places randomly.
- **Phone layout targets: 48px tap targets, 16px inputs, 2 button columns below
  340px wide (task 1.6).** 48px follows Google's Material guideline (Apple says 44).
- **Chart.js 4.4.1 from jsDelivr, pinned, with an `integrity` hash (task 2.1).**
  jsDelivr serves the exact files published to npm, so the hash was computed
  from the official npm package. If the CDN can't load, the chart is hidden and
  the rest of the app works normally.
- **Doughnut chart, no built-in legend (task 2.1).** The category list below
  the chart gets a coloured dot per row and acts as the legend, so amounts
  are readable without hovering.
- **The month switcher can't go past the current month (task 2.2).** Future
  months would always be empty.
- **After adding an entry, the view jumps to that entry's month (task 2.2).** So
  you always see what you just saved, even if you were browsing an old month.
- **"Compared with last month" lists every category from either month (task 2.2).**
  A category you skipped this month shows as "$30.00 less", and one that's new
  shows as "more". The wording is plain facts with no judgement.
- **Hours of work: rounded to 1 decimal, shown only on expenses, and "< 0.1 h"
  for tiny amounts (task 2.3).** The wage label suggests "after tax" because
  that's what you actually take home, but any number works.
- **Settings live in a "Settings" card at the bottom of the page (task 2.3).**
  An empty wage turns the feature off.
- **Loading a backup replaces all data instead of merging (task 2.4).** Merging
  would need rules for duplicates. A confirm step shows both entry counts first.
  The backup file wraps the data with `app` and `version` fields, so a random
  JSON file is rejected and future formats can be told apart.
- **Goals store each contribution with its date, not just a running total
  (task 3.1).** Task 3.3 needs "how much went to goals this month". Money put
  in a goal doesn't change "Left this month"; "Safe to spend" (3.3) is where
  goal money gets subtracted. Goals can receive money but not give it back,
  to keep this task small.
- **A goal shows "Goal reached!" at 100% and accepts more money after (task 3.1).**
  The bar stops at 100%, and the amount shows the real total ("$450.00 of $400.00").
- **Budgets live in their own "Monthly budgets" card, and progress shows inside
  "Where it went" (task 3.2).** Over-plan bars turn a calm slate blue, and the
  text says "$10.00 above your $50.00 plan". Budgeted categories show up even
  before you spend in them. The same budgets apply to every month.
- **Safe to spend = (left this month − goal money − bills still to pay) ÷ days
  left, today included (task 3.3).**
  - *Goal money:* a dated goal's monthly share (what was missing at the start of
    the month ÷ months left, rounded up), or what you actually put in this month
    if that's more. Undated or overdue goals count only what you put in this month.
  - *Bills still to pay:* your Bills budget minus Bills spent this month, or $0 with
    no Bills budget.
  - It never goes below $0.00/day; a calm line explains why. It only shows on the
    current month. With no income logged, it asks you to add income instead.
- **"Left this month" got smaller (task 3.3).** "Safe to spend" is now the one
  big number at the top.
- **50/30/20 groups (task 3.4):** Needs = Food, Transport, School, Bills. Wants =
  Fun, Other. Savings = money put into goals that month. Food counts as a need
  even though restaurants are really wants; splitting Food would need a new
  category, which is more than this task asks for.
- **Budget style saves instantly when you tap a choice (task 3.4).** The default
  is "Simple". In 50/30/20 mode, going past the savings target is good, so the
  savings bar never uses the "over" colour.
- **Rollover carries only unspent money, never overspending, and starts the month
  you turn it on (task 3.5).** Turning it off and on again restarts from that
  month. It applies to every budgeted category (Bills included, so "safe to spend"
  uses the rolled-over Bills amount too). Since budgets have no history, past
  months are calculated with today's budget amounts.
- **Task 4.0 recommends Finnhub, with the API key typed into the app's Settings by
  the user and kept in localStorage, never written in the code (task 4.0).**
  Final choice is yours before 4.1. See the task 4.0 section below.
- **Data source: Finnhub, chosen by you after task 4.0 (task 4.1).** The key is
  saved under its own localStorage key (`budgetApp.finnhubKey`), outside the main
  data, so it is never in backup files or the code.
- **The practice wallet counts in US dollars (task 4.1)**, because Finnhub's free
  prices are for US stocks and ETFs. Using $1,000 USD of fake money avoids mixing
  currencies. The budget side of the app is unaffected.
- **Money now shows thousands separators everywhere: $1,000.00 (task 4.1).**
- **Whole shares only in the simulator (task 4.2).** Fractional shares would put
  decimals back into the money math. The cost: with $1,000 you can only buy 1 or
  2 shares of pricier ETFs. Real brokers often allow fractions; that could be a
  later upgrade.
- **Selling part of a holding keeps its average cost the same (task 4.2).** This
  is the "average cost" method Canadian investors use for taxes (the adjusted
  cost base). Values use each holding's last known price, updated by a lookup or
  by "Refresh prices". A "Start over with $1,000" button resets the simulator.
- **Lesson cards live in logic.js as data, and the tests enforce "6 cards, max 80
  words" (task 4.3).** They're collapsible so the Practice tab stays short. The
  fees lesson's "$12,000" example is checked by a test calculation. No card names
  a specific stock or fund.
- **"Practice investing this amount" adds the goal's saved amount (or its target
  if nothing is saved yet) to practice cash, and keeps existing holdings (task 4.4).**
  The practice account now tracks `startCents` (all fake money put in), so
  added money never shows up as a fake "gain". Your real goal is never changed.
- **The projection uses 2%, 5% and 7% a year over 1, 5, 10 and 20 years (task 4.4).**
  Fixed example rates, not predictions, under a clear "past results don't predict
  the future" label. 2% stands in for a savings account.

---

## Task 0.1: Project skeleton (2026-10-23)

### What we built

We created the seven files the whole app will live in. Opening `index.html`
shows a green header with "Budget App" and a white card titled "This month"
that says "Nothing here yet." Nothing is interactive yet. `logic.js` has one
small function, `formatCents`, that turns 1250 into "$12.50". `tests.js` checks
that function and prints "All tests passed". `storage.js` is empty on purpose:
it's a reserved spot for saving data, which starts in task 1.1.

### What each file is for

| File | Job | Who reads it |
|---|---|---|
| `index.html` | The structure: what's on the page | Browser |
| `style.css` | The look: colours, spacing, fonts | Browser |
| `logic.js` | Pure math (totals, dates, money). No page, no saving | Browser and Node |
| `storage.js` | The only file that saves and loads data | Browser |
| `app.js` | Glue: reads forms, shows data, reacts to clicks | Browser |
| `tests.js` | Checks that `logic.js` gives the right answers | Node only |
| `LEARNING.md` | These notes | You |

Why split `logic.js` from `app.js`? Testing code that clicks buttons needs a
browser. Testing code that only does math needs nothing. So we keep the math
pure and tiny, test it heavily, and keep `app.js` thin.

### New concepts

**How the browser loads the files.** The browser reads `index.html` from top to
bottom. When it sees `<link rel="stylesheet">` it fetches the CSS. When it sees
`<script src="...">` it stops, downloads that file, runs it, and only then
continues. That's why the scripts sit at the very end of `<body>`: by the time
they run, every HTML element above already exists.

**Global scope.** In the browser, a function declared at the top level of a
classic script becomes "global": every later script on the same page can use it.
That's how `app.js` can call `formatCents` even though it lives in `logic.js`.
The catch is that order matters. If `app.js` loaded first, `formatCents` wouldn't
exist yet and you'd get `ReferenceError: formatCents is not defined`.

**Node and `module.exports`.** Node is JavaScript running outside the browser, on
your computer. Node does *not* share globals between files. A file must
explicitly hand things over with `module.exports`, and the other file receives
them with `require`. The browser has no `module` variable at all, so we check
`typeof module !== "undefined"` before using it. `typeof` is safe to use on a
variable that doesn't exist (it just returns `"undefined"` instead of crashing).

**Why money is in cents.** Computers store numbers in binary, and most decimals
like 0.1 can't be written exactly in binary (the same way 1/3 can't be written
exactly in decimal: 0.3333...). So `0.1 + 0.2` gives `0.30000000000000004`.
Whole numbers don't have this problem, so we store 1250 cents and only divide
by 100 when showing it.

**`assert`.** A tool built into Node. `assert.strictEqual(a, b)` does nothing if
`a` and `b` are equal, and throws an error (stopping the program) if they're not.
If any check fails, the program never reaches the last line, so "All tests
passed" only prints when everything really passed.

**CSS variables.** `--accent: #3a7d6b;` inside `:root` defines a named colour.
`var(--accent)` uses it. Change it once, and it changes everywhere.

### Key lines of code

```html
<script src="logic.js"></script>
<script src="storage.js"></script>
<script src="app.js"></script>
```
Load order = dependency order. Things that are *used* load before things that
*use* them.

```js
const dollars = (cents / 100).toFixed(2);
```
`toFixed(2)` turns a number into text with exactly 2 decimals, so 5 cents
becomes "0.05" and not "0.05000000001" or "0.1".

```js
if (typeof module !== "undefined") {
  module.exports = { formatCents };
}
```
One file, two worlds: the browser skips this block, Node uses it.

```js
const { formatCents } = require("./logic.js");
```
"Destructuring": take the `formatCents` property out of what logic.js exported
and put it in a variable with the same name.

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```
Tells phones to use their real screen width. Without it, phones pretend to be
a 980px-wide desktop and shrink everything.

### Quiz

1. You move `<script src="app.js"></script>` above `<script src="logic.js"></script>`.
   What happens when you open the page, and where would you see it?
2. Why can't `tests.js` just call `formatCents(1250)` directly without the
   `require` line, even though `app.js` can?

**Answers**

<details>
<summary>Show answers</summary>

1. The page still shows the header and "This month" (HTML and CSS are fine),
   but `app.js` runs before `formatCents` exists, so it crashes with
   `ReferenceError: formatCents is not defined`. You'd see it in the browser's
   developer console (F12, then the Console tab).
2. `app.js` runs in the browser, where top-level functions from earlier
   scripts are shared as globals. `tests.js` runs in Node, where every file is
   sealed off. Node only shares what a file puts in `module.exports`, and you
   get it with `require`.

</details>

---

## Task 1.1: Add an expense (2026-10-23)

### What we built

A form at the top of the page. The cursor starts in the big amount box, so you
can type right away. Below it there's an optional note, a date (already set to
today), and six category buttons. Tapping a category saves the expense and shows
"Saved $12.50 in Food". The form then clears itself for the next one. If the
amount is empty or not a number, a calm message asks for one instead. Everything
is saved in the browser's localStorage, so it's still there after a reload. The
list of expenses comes in task 1.2.

### New concepts

**The DOM.** When the browser reads your HTML, it builds a tree of objects in
memory, one per element. That tree is the DOM (Document Object Model).
`document.getElementById("amount")` hands you the object for
`<input id="amount">`, and changing its `.value` or `.textContent` changes
what's on screen.

**Event listener.** A function you hand to the browser saying "call this when X
happens". `button.addEventListener("click", ...)` means "when this button is
clicked, run this". Your code doesn't wait in a loop; the browser calls you.

**Arrow function.** `() => addExpense(category)` is a short way to write a small
function. We need a function here (not `addExpense(category)` directly) because
we want the code to run *later*, on click, not right now while building buttons.

**localStorage.** A small storage box inside the browser, separate for each site.
It survives reloads and closing the browser, but it only holds text. So we turn
our data into text with `JSON.stringify` before saving, and back into objects
with `JSON.parse` when loading.

**JSON.** A text format that looks like JavaScript objects:
`{"amountCents":1250,"category":"Food"}`. Nearly every language can read it.

**Regular expression (regex).** A mini-language for describing text patterns.
`/^\d+(\.\d{1,2})?$/` reads as: start (`^`), one or more digits (`\d+`),
then optionally (`?`) a dot and 1 or 2 digits, then the end (`$`).

**try / catch.** Code inside `try` runs normally. If it throws an error, instead
of crashing the page, the code inside `catch` runs. We use it because saved data
could be broken, or storage could be blocked in private browsing.

### Key lines of code

```js
const cents = parts.length > 1 ? Number(parts[1].padEnd(2, "0")) : 0;
```
In "12.5", the part after the dot is "5", which means 50 cents, not 5. `padEnd(2, "0")`
turns "5" into "50". The `? :` is a short if/else (the "ternary operator"):
`condition ? valueIfTrue : valueIfFalse`.

```js
return Object.assign(emptyData(), saved);
```
Starts from a blank data object and copies the saved fields over it. If a future
version adds a new field (like `goals`), old saves still get a default for it.

```js
button.addEventListener("click", () => addExpense(category));
```
Each button remembers its own `category`. This works because `const category`
inside a `for...of` loop is a fresh variable on each turn of the loop.

```js
const month = String(date.getMonth() + 1).padStart(2, "0");
```
JavaScript counts months from 0 (January is 0), so we add 1. `padStart` turns
"5" into "05" so dates sort correctly as text.

### Quiz

1. Why do we parse "12.5" by splitting the text instead of doing
   `Math.round(parseFloat("12.5") * 100)`?
2. If you remove `amountInput.focus()` at the end of `addExpense`, what would
   change for someone logging 3 expenses in a row?

**Answers**

<details>
<summary>Show answers</summary>

1. The split version never touches decimals, so it's exact by construction and
   easy to reason about. `parseFloat` returns a binary decimal that's slightly
   off (for example `1.005 * 100` gives `100.49999999999999`), and you have to
   remember to round correctly every time. Splitting also lets us reject "1.234"
   instead of rounding it silently.
2. After tapping a category, the focus would stay on the button. They'd have to
   tap the amount box again before typing each new expense. That's one extra tap
   per expense, which works against the "under 5 seconds" goal.

</details>

---

## Task 1.2: Show the list (2026-10-23)

### What we built

Under the form, the "This month" card now lists every expense from the current
month. Each row shows the category in bold, the note in grey below it, and the
amount and date on the right. The newest expense is on top. If two expenses
have the same date, the one you added last comes first. When the month has no
expenses, a friendly line invites you to add the first one. The list redraws
right after each save, so the new expense appears instantly.

### New concepts

**filter.** `array.filter(fn)` builds a new array with only the items where
`fn` returns true. `entries.filter((entry) => monthKey(entry.date) === month)`
keeps this month's entries.

**sort with a compare function.** `array.sort((a, b) => ...)` puts `a` first if
the function returns a negative number and `b` first if it's positive.
`b.date.localeCompare(a.date)` is positive when `b` is a later date, so later
dates go first.

**Why `[...entries]`.** `sort` and `reverse` change the array they're called on.
`[...entries]` (the "spread" syntax) makes a copy first, so the original data
stays in the order it was saved. Changing data you didn't create is a classic
source of hard-to-find bugs.

**Stable sort.** When two items compare as equal, a stable sort keeps them in
their existing order. JavaScript's sort has been stable since 2019. That's why
reversing first works: entries saved later are now earlier in the copy, and the
sort keeps them ahead on ties.

**createElement vs innerHTML.** You can build HTML from a text string with
`innerHTML`, but if a note contained `<img src=x onerror=...>`, the browser
would run it. That's a "cross-site scripting" (XSS) bug. `textContent` always
treats text as plain text. We only use `innerHTML = ""` to empty the list.

**`hidden`.** Setting `element.hidden = true` hides it, the same as
`display: none` in CSS.

**Flexbox.** `display: flex` lays children out in a row. `justify-content:
space-between` pushes the first child to the left edge and the last to the
right. `flex-direction: column` stacks them vertically instead.

### Key lines of code

```js
return [...entries].reverse().sort((a, b) => b.date.localeCompare(a.date));
```
Copy, then reverse (so the latest added comes first), then sort by date with the
newest first. Three steps on one line, read left to right.

```js
const thisMonth = monthKey(toDateString(new Date()));
```
Today becomes "2026-10-23", which becomes "2026-10". That's the month we show.

```js
monthEmpty.hidden = entries.length > 0;
```
A comparison is already true or false, so we can assign it directly instead of
writing an if/else.

```js
// new Date("2026-10-23") is treated as UTC midnight
```
A real trap: in Montreal (UTC-4), UTC midnight is 8 pm the day before. If we
used `new Date(dateString).getDate()`, every expense would show yesterday's
date. Reading the numbers straight from the text avoids it.

### Quiz

1. You add a $5 expense dated Oct 10, then a $7 expense dated Oct 12, then a $3
   expense dated Oct 10. In what order does the list show them?
2. Why is it dangerous to put a user's note into the page with `innerHTML`?

**Answers**

<details>
<summary>Show answers</summary>

1. $7 (Oct 12), then $3 (Oct 10, added last), then $5 (Oct 10). Newest date
   first, and on a tie the later-added one first.
2. `innerHTML` treats the text as HTML, so a note containing a tag (like an
   `<img>` with an `onerror` script) would be run by the browser. With
   `textContent`, it's just shown as letters.

</details>

---

## Task 1.3: Edit and delete (2026-10-23)

### What we built

Every row in the list is now tappable. Tapping one opens a popup with the
expense already filled in: amount, category (a dropdown), note and date. Change
anything and tap Save, and the list updates right away. Cancel closes the popup
without saving. At the bottom there's a quiet "Delete this entry" link. Tapping
it doesn't delete anything yet: it asks "Delete it for good?" with "Yes, delete"
and "Keep it". Only the second tap removes the entry. An empty or invalid amount
gets the same calm message as the add form.

### New concepts

**`<dialog>` and `showModal()`.** A popup built into HTML. `showModal()` opens it
on top of the page, dims everything behind it (that's the `::backdrop`), and
blocks clicks outside it. `close()` hides it again. Pressing Escape also closes it.

**The submit event and `preventDefault()`.** When you press Enter or a
`type="submit"` button inside a `<form>`, the browser fires a "submit" event and
then, by default, reloads the page to send the form somewhere.
`event.preventDefault()` says "don't do your default thing, I'll handle it".
Listening for submit (instead of click on Save) means pressing Enter also saves.

**`map`.** `array.map(fn)` builds a new array of the same length, where each item
is whatever `fn` returns. In `updateEntry`, we return a changed copy for the
matching entry and the same entry for all the others.

**Immutability.** `updateEntry` and `removeEntry` never change the array they
receive; they return a new one. Then `data.entries = ...` swaps in the new
version. It's a bit more typing, but a function can't secretly break data
somewhere else, which makes the functions trivial to test.

**`Object.assign({}, entry, changes)`.** Starts with an empty object `{}`, copies
every field of `entry`, then copies `changes` on top. The result is a new object
with the changes, and `entry` itself is untouched.

**State variable.** `editingId` remembers which entry the popup is showing. The
Save and Delete buttons are created once, so they need this shared variable to
know which entry to act on.

### Key lines of code

```js
return entries.map((entry) => (entry.id === id ? Object.assign({}, entry, changes) : entry));
```
For each entry: is it the one we're editing? If yes, a changed copy. If no, the
same entry unchanged.

```js
editForm.addEventListener("submit", (event) => {
  event.preventDefault();
```
Catch the form being sent, and stop the page reload.

```js
const row = document.createElement("button");
```
The row is a real button, not a `<div>` with a click handler. Buttons work with
the keyboard (Tab, then Enter) and screen readers for free.

```js
editCategory.appendChild(new Option(category, category));
```
`new Option(text, value)` is a shortcut for creating an `<option>` for a
`<select>` dropdown.

### Quiz

1. If you deleted the line `event.preventDefault();`, what would happen when
   you tap Save?
2. `updateEntry(entries, "x", { note: "hi" })` is called, but no entry has id
   "x". What does it return, and is that a problem?

**Answers**

<details>
<summary>Show answers</summary>

1. Our code would still run and save, but then the browser would do its default
   form action and reload the page. You'd see a quick flash, and anything not
   saved would be lost. It works by accident, which is the worst kind of working.
2. It returns a new array with the same entries, nothing changed. That's
   safe: nothing breaks and nothing gets lost. The test file checks this exact case.

</details>

---

## Task 1.4: Income (2026-10-23)

### What we built

The add form now has an "Expense / Income" switch at the top. Choosing Income
swaps the category buttons for Job, Gift and Other. A new card at the very top
shows three numbers for the current month: "Money in", "Money out", and, biggest,
"Left this month" (in minus out). Income rows in the list have a green "+" before
the amount. Editing an income entry shows income categories in the dropdown. We
also fixed `formatCents` so negative amounts read "-$7.50" instead of "$-7.50".

### New concepts

**Accumulator loop.** `monthTotals` starts two counters at 0 and adds each
entry's amount to one of them. This "start at zero, add as you go" pattern is how
most totals are computed.

**`let` vs `const`.** `const` means "this name always points to the same value".
`let` allows reassigning. The totals use `let` because `inCents += ...` changes
them. Use `const` by default, and `let` only when you need to reassign.

**Returning an object.** A function can only return one thing, so `monthTotals`
returns one object with three fields: `{ inCents, outCents, leftCents }`. The
caller picks the fields it needs.

**One `render()` function.** Before, saving called `renderList()`. Now two parts
of the page depend on the data (totals and list), so `render()` updates both.
Every change (add, edit, delete) calls `render()`, so the page can never show
stale totals. This "data changes, then redraw from data" idea is the core of how
modern UI frameworks like React work.

**`aria-pressed`.** An attribute that tells screen readers a button is a toggle
and whether it's on. We also use it in CSS (`button[aria-pressed="true"]`) to
style the selected one, so the look and the accessibility can't disagree.

**CSS Grid.** `grid-template-columns: 1fr 1fr` makes two equal columns.
`grid-column: 1 / -1` makes an item stretch from the first column line to the
last, which is how "Left this month" spans the full width.

### Key lines of code

```js
const sign = cents < 0 ? "-" : "";
const dollars = (Math.abs(cents) / 100).toFixed(2);
return sign + "$" + dollars;
```
`Math.abs` removes the minus sign, so we format the positive number and put the
minus back in front of the "$" ourselves.

```js
return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
```
One small function decides the category list. The add buttons and the edit
dropdown both call it, so they can never disagree.

```js
return { inCents: inCents, outCents: outCents, leftCents: inCents - outCents };
```
"Left" is computed from the other two, never stored. Storing it would mean
keeping three numbers in sync forever.

### Quiz

1. Why does `monthTotals` take a list of entries instead of looking up
   "this month" itself?
2. You log $20 income and then a $30 expense. What do the three numbers at the
   top show?

**Answers**

<details>
<summary>Show answers</summary>

1. So it stays pure and reusable. It doesn't need to know today's date (which
   changes every day and makes tests unreliable), and later the month switcher
   (task 2.2) can pass in any month's entries.
2. Money in $20.00, Money out $30.00, Left this month -$10.00 (shown in the
   same calm green, not red).

</details>

---

## Task 1.5: Totals per category (2026-10-23)

### What we built

A new card called "Where it went" sits between the add form and the list. It
shows how much you spent in each category this month, with the biggest category
on top: for example "Food $42.00", then "Fun $15.00". Only categories you actually
spent in appear, and income isn't counted (it's money coming in, not going
somewhere). Before your first expense, the card says your spending will show up
there. It updates instantly after every add, edit or delete.

### New concepts

**An object as a lookup table.** `const totals = {}` starts empty. Then
`totals["Food"]` reads the Food total and `totals["Food"] = 4200` sets it. It's
like a dictionary: you look up a word (the "key") to get its value. This is
called grouping, and it's one of the most common patterns in programming.

**`|| 0` for a default.** The first time we see "Food", `totals["Food"]` is
`undefined`. `undefined || 0` gives `0`, so we add to 0 instead of getting
`NaN` (Not a Number) from `undefined + 1000`.

**`continue`.** Inside a loop, `continue` skips the rest of this turn and jumps
to the next item. Here it skips income entries.

**`Object.keys`.** Gives an array of an object's keys: `["Fun", "Food", "Bills"]`.
We map over them to turn the lookup table back into a list we can sort.

**Sorting numbers.** `(a, b) => b.cents - a.cents` gives a negative number when
`a` is bigger, so bigger amounts go first. If the amounts are equal, the
subtraction gives `0`, and `0 || ...` moves on to the alphabetical comparison.

**Returning an object from an arrow function.** `(category) => ({ category: ... })`
needs the round brackets around the `{ }`. Without them, JavaScript reads `{` as
the start of a code block, not an object.

### Key lines of code

```js
totals[entry.category] = (totals[entry.category] || 0) + entry.amountCents;
```
"Take the current total for this category (or 0 if there isn't one yet), add this
expense, and store it back."

```js
return list.sort((a, b) => b.cents - a.cents || a.category.localeCompare(b.category));
```
Two sort rules in one line: by amount, and if tied, by name.

### Quiz

1. What would `totalsByCategory` return if you removed `|| 0`?
2. Food and Fun both total $15.00. Which one is listed first, and why?

**Answers**

<details>
<summary>Show answers</summary>

1. Every total would be `NaN`. The first addition would be
   `undefined + amount`, which is `NaN`, and anything plus `NaN` stays `NaN`.
2. Food. The amounts tie, so `b.cents - a.cents` is 0 and the tie-breaker
   sorts alphabetically, and "Food" comes before "Fun" ("o" < "u").

</details>

---

## Task 1.6: Phone-friendly layout (2026-10-23)

### What we built

The app was already one column, so this task polished how it feels on a phone.
Every button and input is now at least 48 pixels tall, so it's easy to hit with
a thumb. Text in inputs is 16px, which stops iPhones from zooming in every time
you tap a field. Buttons no longer wait for a possible double-tap zoom, so they
react instantly. On very narrow screens the category buttons switch to 2 columns
so "Transport" isn't squeezed. Keyboard users get a clear outline on whatever is
focused. We checked at 320, 390 and 1024 pixels wide: no sideways scrolling anywhere.

### The CSS, explained

**`box-sizing: border-box` on everything.** By default, `width: 100%` plus padding
plus border makes an element *wider* than its parent, which causes sideways
scrolling on phones. With `border-box`, the width includes padding and border.
Almost every modern site starts with this rule. `*` means "every element", and
`::before`/`::after` cover the invisible extra boxes CSS can add.

**`min-height: 48px`.** A minimum, not a fixed height: a button can grow if its
text wraps, but never shrinks below a thumb-sized target.

**`font-size: max(16px, 1em)`.** `max()` picks the larger of two values. The input
is at least 16px, and bigger if the surrounding text is bigger. Safari on iPhone
zooms the whole page into any input smaller than 16px, which is disorienting.

**`touch-action: manipulation`.** Tells the browser this element doesn't need
double-tap-to-zoom, so it can fire the tap right away instead of waiting
~300 milliseconds to see if a second tap comes.

**`:focus-visible`.** A "pseudo-class" that applies only when the browser thinks
the user needs to see focus (keyboard, mostly), not after every mouse click or
tap. `outline-offset` leaves a small gap between the element and the outline.

**Media query (`@media (max-width: 340px)`).** The rules inside only apply when
the screen is 340px wide or less. This is the core tool of "responsive design":
one stylesheet that adapts to the screen size.

**`max-width: 600px` + `margin: 0 auto` on `main`** (from task 0.1). On a laptop,
content stays in a readable column centered on the page. On a phone (narrower than
600px), it just fills the width.

**The viewport meta tag** (from task 0.1) is what makes all of this work: without it,
the phone pretends to be 980px wide and none of these sizes mean what they say.

### Key lines of code

```css
@media (max-width: 340px) {
  .category-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
}
```
`repeat(2, 1fr)` is short for `1fr 1fr`: two equal columns. `fr` means
"fraction of the free space".

```css
button:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 3px solid var(--accent);
}
```
A comma between selectors means "apply these rules to all of them".

### Quiz

1. You set an input to `width: 100%; padding: 10px;` without `border-box`. On a
   phone 390px wide, inside a parent 358px wide, how wide is the input really?
2. Why `min-height: 48px` instead of `height: 48px` for buttons?

**Answers**

<details>
<summary>Show answers</summary>

1. 358 + 10 + 10 = 378px, plus the border (1px on each side) = 380px. That's 22px
   wider than its parent, so it pokes out. With `border-box`, it's exactly 358px.
2. If the text ever wraps onto two lines (a long label, or big system fonts),
   a fixed height would cut it off. `min-height` guarantees a minimum and lets
   the button grow when needed.

</details>

---

## Task 2.1: Category chart (2026-10-23)

### What we built

The "Where it went" card now has a doughnut chart above the category list. Each
category has its own calm colour that never changes (Food is always green, Fun
always orange), and each row of the list has a matching coloured dot, so the
list doubles as the chart's legend. Hovering or tapping a slice shows its amount.
The chart redraws after every add, edit or delete, and hides itself when there
are no expenses. If the chart library can't load (no internet), the chart just
doesn't appear and everything else keeps working.

### New concepts

**A library.** Code someone else wrote, packaged so you can use it. Drawing a
doughnut chart by hand means trigonometry, hover detection, animation, screen
sizes... Chart.js has done all of that, tested by millions of sites. We call
`new Chart(canvas, settings)` and it does the work. The trade-off: you depend on
code you didn't write, and you learn its way of doing things.

**A CDN (Content Delivery Network).** A network of servers around the world
that host files (like libraries) and hand them out quickly from whichever server
is closest to you. Instead of copying Chart.js into our repo, we point a
`<script src>` at jsDelivr's copy. Pros: nothing to download or update by hand,
and it's probably already cached in your browser from other sites. Cons: it needs
internet, and you're trusting someone else's server.

**Version pinning.** `chart.js@4.4.1` asks for that exact version. If we wrote
just `chart.js`, a future version with breaking changes could silently break our
app one morning.

**Subresource Integrity (SRI).** The `integrity="sha384-..."` attribute is a
fingerprint of the file. The browser computes the fingerprint of what it
downloads and refuses to run it if it doesn't match. So even if the CDN were
hacked, it couldn't slip different code into our page. `crossorigin="anonymous"`
is required for the browser to check it.

**`<canvas>`.** An HTML element that's a blank drawing surface. Unlike normal
HTML, what's drawn on it isn't made of elements; it's pixels painted by
JavaScript. That's why we added `role="img"` and an `aria-label`: so screen
readers know what it is.

**Graceful degradation.** `typeof Chart === "undefined"` checks whether the
library actually loaded. If not, we skip the chart instead of crashing. The
list underneath has the same information, so nobody loses anything important.

**Keeping one chart instance.** Creating a new Chart on every render would stack
charts on the same canvas and leak memory. We create it once, then replace its
data and call `update()`, which also animates the change nicely.

### Key lines of code

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js"
        integrity="sha384-dug+..." crossorigin="anonymous"></script>
```
Load a pinned, fingerprinted library from a CDN, before our own scripts.

```js
if (typeof Chart === "undefined" || totals.length === 0) {
  chartWrap.hidden = true;
  return;
}
```
Two good reasons to show no chart: the library didn't load, or there's nothing
to draw.

```js
label: (context) => " " + formatCents(context.raw),
```
The chart holds cents (integers, like the rest of the app). We only turn them
into dollars at the very last moment, when showing them, using the same
function as everywhere else.

### Quiz

1. You open the app on a plane with no Wi-Fi. What happens, and why doesn't the
   page crash?
2. What would happen if someone changed one character inside the Chart.js file
   on the CDN?

**Answers**

<details>
<summary>Show answers</summary>

1. The Chart.js script fails to load, so `Chart` is never defined. `renderChart`
   checks `typeof Chart === "undefined"` and hides the chart. Everything else
   (adding, totals, the category list) works because it only needs our own files.
2. Its fingerprint (hash) would no longer match the `integrity` attribute, so the
   browser would refuse to run it. The chart would be missing, just like offline,
   but no unknown code would run on our page.

</details>

---

## Task 2.2: Month switcher (2026-10-23)

### What we built

A bar at the top shows "◀ October 2026 ▶". The arrows move between months, and
everything below follows: the totals, the chart, the category list and the entry
list. The ▶ arrow is greyed out on the current month, since the future is always
empty. Labels adapt too: "Left this month" becomes "Left in September 2026". A new
card, "Compared with last month", lists each category with a plain sentence like
"Food: $40.00 less than last month" or "Fun: $2.00 more than last month". If the
previous month has no spending, it says there's nothing to compare with.

### New concepts

**State drives the page.** `viewMonth` is one variable that says which month
you're looking at. The arrow buttons only change that variable and call
`render()`. Every part of the page reads `viewMonth` when drawing. That's why
adding the switcher was mostly about replacing "this month" with `viewMonth`.

**Month math with a single number.** Months are tricky: before January 2026
comes December 2025. `shiftMonth` turns "2026-01" into one count of months
(2026 × 12 + 0), adds or subtracts, then splits it back with division (`/ 12`
for the year) and remainder (`% 12` for the month). No special case for
January needed.

**`%` (remainder, "modulo").** `14 % 12` is 2: what's left after removing whole
12s. It's how clocks wrap around, and here how months wrap from 12 back to 1.

**`find` and `some`.** `array.find(fn)` returns the first item where `fn` is
true (or `undefined`). `array.some(fn)` returns true if at least one item
matches. We use them to match a category between two months.

**Comparing "YYYY-MM" text.** `viewMonth >= currentMonth` works on text because
the format puts the biggest unit first and always has the same length. "2026-09"
< "2026-10" alphabetically, just like the dates they represent.

**`disabled`.** A disabled button can't be clicked or focused. We style it with
`opacity: 0.4` so it looks unavailable.

**Ternary in an assignment.** `x = isCurrent ? "Left this month" : "Left in ..."`
picks one of two texts in one line.

### Key lines of code

```js
const totalMonths = Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7)) - 1 + change;
const year = Math.floor(totalMonths / 12);
const monthNumber = (totalMonths % 12) + 1;
```
The `- 1` converts months 1–12 to 0–11 so the math works, and `+ 1` converts back.

```js
const direction = row.changeCents < 0 ? "less" : "more";
return row.category + ": " + formatCents(Math.abs(row.changeCents)) + " " + direction + " than last month";
```
The sign of the change decides the word, and the amount is always shown positive.

### Quiz

1. Walk through `shiftMonth("2026-01", -1)` step by step. What's `totalMonths`?
2. You're viewing August and add an expense dated today (in October). What does
   the screen show afterwards, and why did we choose that?

**Answers**

<details>
<summary>Show answers</summary>

1. 2026 × 12 + 1 − 1 − 1 = 24311. Year = floor(24311 / 12) = 2025.
   Month = 24311 % 12 + 1 = 11 + 1 = 12. Result: "2025-12".
2. It jumps to October 2026, where the new entry is. Otherwise the expense would
   be saved but invisible, and you might think it didn't work and add it twice.

</details>

---

## Task 2.3: Hours of work (2026-10-23)

### What we built

A Settings card at the bottom of the page has one field: your hourly wage. Once
you save it, every expense in the list shows a small grey line like "1.5 h of
work" under its amount. A $24 dinner at $16/hour is 1.5 hours of making pizza.
Income rows don't get it (it wouldn't mean anything there). Typing something
that isn't a number shows a calm message. Clearing the field and saving turns
the feature off. The wage is saved with the rest of your data, so it survives reloads.

### New concepts

**Units cancel out.** `amountCents / hourlyWageCents` is (cents) ÷ (cents per
hour) = hours. Since both are in cents, no conversion is needed. Same idea as
in physics: track the units and the formula checks itself.

**`null` as "nothing on purpose".** `hourlyWageCents: null` means "the user
hasn't set this". `hoursOfWork` returns `null` too when there's no wage, and the
page shows nothing. `null` is different from `0`: a wage of 0 would mean
dividing by zero (`Infinity`), so `!hourlyWageCents` rejects both.

**Truthy and falsy.** In a condition, `0`, `""`, `null`, `undefined` and `NaN`
count as false ("falsy"); almost everything else counts as true. `if (!wage)`
is a short way to say "if wage is missing or zero".

**Rounding to one decimal.** `Math.round` only rounds to whole numbers. So we
multiply by 10, round, and divide by 10: 1.96 → 19.6 → 20 → 2.

**Migrating saved data.** Users who saved data before this task have no
`settings` field. `Object.assign(emptyData().settings, data.settings)` fills in
the defaults for anything missing. Without it, `data.settings.hourlyWageCents`
would crash with "Cannot read properties of undefined". Any app that stores data
long-term has to handle old formats like this.

**Shallow copy.** `Object.assign` only copies the top level. If the saved data
has a `settings` object, it replaces the whole default `settings` object (it
doesn't merge inside it). That's why we merge `settings` on its own line.

### Key lines of code

```js
const rounded = Math.round(hours * 10) / 10;
if (rounded === 0) {
  return "< 0.1 h";
}
```
A 30-cent expense would round to "0 h", which reads as "free". "< 0.1 h" is more honest.

```js
data.settings = Object.assign(emptyData().settings, data.settings);
```
Defaults first, then whatever was saved on top.

```js
const hours = entry.type === "expense" ? hoursOfWork(entry.amountCents, data.settings.hourlyWageCents) : null;
```
Only expenses get hours, and only when a wage is set (otherwise `hoursOfWork`
returns `null`).

### Quiz

1. Your wage is $16.10 and you spend $4.50 on a coffee. What does the row show?
2. Why did we need to change `loadData` in storage.js for this feature?

**Answers**

<details>
<summary>Show answers</summary>

1. 450 / 1610 = 0.2795..., × 10 = 2.795, rounded to 3, / 10 = 0.3. So "0.3 h of work".
2. Data saved before this task has no `settings` field. Without the merge,
   reading `data.settings.hourlyWageCents` would crash for every existing user.
   With it, they get the default (`null`, feature off).

</details>

---

## Task 2.4: Export and import (2026-10-23)

### What we built

A Backup card at the bottom of the page has two buttons. "Download backup" saves
a file like `budget-backup-2026-10-23.json` with all your entries and settings.
"Load backup" opens a file picker. The app checks the chosen file before using
it: a file that isn't JSON, isn't one of our backups, or has damaged entries is
refused with "Nothing was changed". A good backup asks "This backup has 2
entries. Replace your current 1 entry with it?" Only "Yes, replace" swaps the
data. Your data now survives clearing the browser or switching devices, as long
as you keep the file.

### New concepts

**Blob and object URL.** A Blob is a chunk of file contents held in memory.
`URL.createObjectURL(blob)` gives it a temporary address. We point a hidden
`<a download="name.json">` link at that address and "click" it in code, and the
browser saves it as a file. No server involved. `revokeObjectURL` frees the memory.

**`JSON.stringify(backup, null, 2)`.** The `2` adds indentation, so the backup
file is readable by humans if you open it in a text editor.

**Reading a file: `async` / `await`.** Reading a file takes time. `await
file.text()` pauses *this function* until the text is ready, while the rest of
the page keeps working. A function that uses `await` must be marked `async`.

**Never trust input.** A backup file could be anything: an old format, a
different app's file, or hand-edited and broken. `checkBackup` (in logic.js, so
it's tested) checks every entry before we let it replace real data. "Validate at
the boundary" (wherever data enters your app) is a core habit for safe code.

**`Array.isArray` and `Number.isInteger`.** `typeof []` is "object", which is
useless for spotting arrays, so we ask `Array.isArray`. `Number.isInteger(12.5)`
is false, which catches amounts that aren't whole cents.

**`forEach` with an index.** `array.forEach((item, index) => ...)` runs a function
for each item and also gives its position, so the message can say "Entry 2 is damaged".

**Hidden file input + `click()`.** The real `<input type="file">` looks different
in every browser and is hard to style. We hide it and have a normal button call
`importFile.click()`, which opens the same file picker.

**Versioning the file format.** `version: 1` costs nothing today. If a future
task changes the format, the import code can see a version-1 file and convert it.

### Key lines of code

```js
const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
const link = document.createElement("a");
link.href = URL.createObjectURL(blob);
link.download = "budget-backup-" + toDateString(new Date()) + ".json";
link.click();
```
Five lines to download a file from a page with no server.

```js
try {
  backup = JSON.parse(await file.text());
} catch (error) {
  backupMessage.textContent = "That file couldn't be read as a backup.";
  return;
}
```
`JSON.parse` throws on anything that isn't valid JSON, so we catch it and
explain calmly instead of crashing.

```js
importFile.value = "";
```
Without this, picking the same file twice in a row wouldn't fire "change" the
second time, because the value didn't change.

### Quiz

1. Why is `checkBackup` in logic.js instead of app.js?
2. Someone edits a backup by hand and writes `"amountCents": 12.5`. What happens
   when they load it?

**Answers**

<details>
<summary>Show answers</summary>

1. It's a pure function (data in, list of problems out), with no page and no
   storage. That means it can be tested in tests.js, and it should be, since it
   guards the user's data.
2. `Number.isInteger(12.5)` is false, so that entry is reported as damaged, and the
   message says "Nothing was changed. Entry N is damaged." Their current data is safe.

</details>

---

## Task 3.1: Savings goals (2026-10-23)

### What we built

A "Savings goals" card. Tap "New goal" and a small form opens: name, target
amount and an optional date. Each goal then shows its name, "$150.00 of
$400.00", a green progress bar, and "37% · by Mar 1, 2027". Under it, an amount
box and an "Add money" button put money into the goal. When the saved amount
reaches the target, the bar is full and the line says "Goal reached!". Each goal
can be deleted with the same two-step confirm as entries. Goals don't depend on
the month you're viewing; they're always shown.

### New concepts

**`reduce`.** `array.reduce((sum, item) => sum + item.amountCents, 0)` walks the
array and carries a running value (`sum`, starting at `0`). It's the same idea as
the accumulator loop in `monthTotals`, written as one expression.

**Storing events instead of totals.** We store each contribution with its date
rather than a single "saved" number. The total is computed when needed. This keeps
history, so we can answer new questions later (like "saved this month?") without
changing the data format. Banks work the same way: a list of transactions, and
the balance is derived from them.

**`<details>` and `<summary>`.** A built-in "click to expand" element. The
`<summary>` is always visible. Clicking it toggles the rest. Setting
`details.open = false` in code closes it.

**A progress bar from two divs.** A grey "track" div with a green "fill" div
inside. We set the fill's width to the percent (`fill.style.width = "37%"`).
`overflow: hidden` and `border-radius` on the track keep the fill's corners
rounded. `transition: width 0.4s` animates the change when you add money.

**ARIA for custom widgets.** A div doesn't mean anything to a screen reader.
`role="progressbar"` plus `aria-valuenow="37"` makes it announce "New bike
progress, 37%". (The native `<progress>` element does this too, but it's hard to
style the same way in every browser.)

**Closures.** Inside `renderGoal`, each goal's "Add money" handler uses `goal`
and `input`, variables from the function that created it. Even after
`renderGoal` has finished, the handler still "remembers" them. That's a
closure, and it's why each goal's button adds to the right goal.

**`Math.floor` for progress.** Rounding 99.6% up would show "100%" before the goal
is actually reached. `Math.floor` always rounds down, so 100% only appears when
it's true. `Math.min(percent, 100)` stops the bar from overflowing past the end.

### Key lines of code

```js
return goal.contributions.reduce((sum, contribution) => sum + contribution.amountCents, 0);
```
The saved amount is never stored; it's always the sum of contributions.

```js
goal.contributions.push({ date: toDateString(new Date()), amountCents: amountCents });
```
Each "Add money" records when and how much.

```js
fill.style.width = percent + "%";
```
CSS from JavaScript: the bar's length is just a width.

```js
targetDate: dateInput.value || null,
```
An empty date field gives `""`; `|| null` stores it as a clear "no date".

### Quiz

1. A goal has a $300 target, and you add $100, then $199.99. What percent shows,
   and why not 100%?
2. Why might storing only `savedCents: 29999` (instead of the contributions list)
   be a problem for task 3.3?

**Answers**

<details>
<summary>Show answers</summary>

1. 29999 / 30000 = 99.996%, and `Math.floor` gives 99%. Showing 100% would claim
   the goal is reached when it's 1 cent short.
2. Task 3.3 needs to know how much went into goals *this month*. A single total
   can't tell you when the money was added; a dated list can.

</details>

---

## Task 3.2: Monthly budget per category (2026-10-23)

### What we built

A new "Monthly budgets" card has one box per expense category. Type a monthly
plan (like 100 for Food) and save. Empty boxes mean "no plan". In "Where it
went", each category with a plan now has a progress bar and a line like "$58.00
left of $100.00". Categories you planned for but haven't spent in yet also show
up, with an empty bar. If you go past a plan, the bar fills in a calm slate blue
and says "$10.00 above your $50.00 plan". No red, no "warning". Categories
without a plan look the same as before.

### New concepts

**`data-*` attributes and `dataset`.** `input.dataset.category = "Food"` adds
`data-category="Food"` to the HTML element. Later, `input.dataset.category`
reads it back. It's the standard way to attach your own information to an
element, here to know which category each box belongs to.

**`querySelectorAll`.** `document.querySelectorAll("#budget-inputs input")` finds
every element matching a CSS selector (here, all inputs inside the budgets box).
It's like `getElementById`, but for many elements and any selector.

**Building a new object, then swapping it in.** The save handler builds
`newBudgets` from scratch and only assigns it to `data.budgets` if every box is
valid. If one box is wrong, we `return` early and the old budgets stay untouched.
No half-saved state.

**Adding computed fields.** `budgetRows` builds rows and then adds `percent` and
`isOver` to each. Computing these in logic.js means app.js doesn't do any math;
it only decides how things look.

**Design choice: colour carries meaning.** Red means danger in most cultures. A
budget going over isn't danger; it's information. So "over" gets a different but
calm colour, and the text gives the fact. Choosing colours is a design decision
with real effects on how people feel about using the app.

### Key lines of code

```js
budgetCents: budgets[total.category] || null,
```
Looks up this category's plan. No entry (`undefined`) becomes a clear `null`.

```js
if (budgets[category] && !rows.some((row) => row.category === category)) {
```
"This category has a plan, and no row exists yet": add an empty one so the plan is visible.

```js
const bar = makeElement("div", budgetRow.isOver ? "progress over" : "progress", "");
```
An element can have several classes separated by spaces. CSS rule
`.progress.over .progress-fill` only applies when both classes are present.

### Quiz

1. You set Food to 100 and Fun to "abc", then tap Save. What happens to the Food budget?
2. Why is the Fun bar's `percent` 100 and not 120 when you spent $60 of $50?

**Answers**

<details>
<summary>Show answers</summary>

1. Nothing is saved, not even Food. The handler stops at the first invalid box
   (`return`) before replacing `data.budgets`, and the message points to Fun.
2. `Math.min(100, ...)` caps it, because a bar can't be fuller than full. The text
   below still gives the real amount ("$10.00 above your $50.00 plan").

</details>

---

## Task 3.3: Safe to spend (2026-10-23)

### What we built

The top card now leads with one big number: "Safe to spend: $80.00 / day". Under
it, a small line shows where it comes from: "$850.00 left − $100.00 for goals −
$30.00 for bills, over 9 days". The goal part is each dated goal's fair share for
this month (a $400 bike due in January, from October, is $100 a month). The bills
part is whatever's left of your Bills budget. If your plans use everything, it
shows $0.00 and says "Your plans use what's left this month, and that's okay."
With no income logged yet, it asks you to add it. The number only appears on
the current month, since it's about the days ahead.

### New concepts

**Passing "today" in.** `safeToSpend(..., today)` takes the date as a parameter
instead of calling `new Date()` inside. A function that reads the clock gives a
different answer every day, so you can't write a test with a fixed expected
result. Passing it in keeps logic.js pure: same inputs, same output, forever.
app.js (which is allowed to be impure) reads the real clock and passes it in.

**Day 0 trick.** `new Date(2026, 10, 0)` asks for "day 0 of November", and
JavaScript rolls back to the last day of October. `.getDate()` then gives 31. It's
a well-known shortcut for "how many days in this month", and it handles leap years
for free (the test checks February 2028 has 29 days).

**`Math.ceil` vs `Math.floor`, on purpose.** Goal shares round *up* (`ceil`), so
three monthly shares of a $100 goal ($33.34 each) cover the whole $100 instead of
leaving a cent behind. The daily amount rounds *down* (`floor`), so "safe" is
never more than you actually have. When rounding money, always ask which
direction is safe.

**Edge cases.** Most of tests.js for this task is about unusual situations: no
data, overdue goals, goals already reached, the last day of the month, a leap
year, planning more than you have. Normal cases are easy to get right; bugs
hide at the edges.

**Testing math by hand first.** Each test comment shows the arithmetic (900 −
150 − 50 = 700 left; 700 − 75 − 30 = 595; 595 / 9 = 66.11). Writing the expected
answer by hand, before running the code, is what makes a test meaningful.

### Key lines of code

```js
const monthsLeft = monthsBetween(month, monthKey(goal.targetDate)) + 1;
const missing = Math.max(0, goal.targetCents - savedBefore);
const monthlyShare = Math.ceil(missing / monthsLeft);
return Math.max(monthlyShare, addedThisMonth);
```
Months left includes this one (+1). `Math.max(0, ...)` handles goals already
passed. If you put in more than the share, the real amount counts.

```js
const daysInMonth = new Date(year, monthNumber, 0).getDate();
const daysLeft = daysInMonth - Number(today.slice(8, 10)) + 1;
```
On Oct 23: 31 − 23 + 1 = 9 days, counting today.

```js
const perDayCents = availableCents > 0 ? Math.floor(availableCents / daysLeft) : 0;
```
Never negative, and rounded down to whole cents.

### Quiz

1. It's November 1. You have a $600 goal due January 31 with nothing saved yet.
   How much does it take from this month?
2. Why does `safeToSpend` take `today` as a parameter instead of using `new Date()`?

**Answers**

<details>
<summary>Show answers</summary>

1. Months left = Nov, Dec, Jan = 3. $600 / 3 = $200 this month.
2. To stay pure and testable. With `new Date()` inside, the result would change
   every day, and the tests would pass today and fail tomorrow. Passing it in
   lets tests use a fixed date.

</details>

---

## Task 3.4: Budget styles (2026-10-23)

### What we built

Settings now has a "Budget style" choice: "Simple: just track" (the default,
which changes nothing) or "50/30/20". Under the choice, two sentences explain the
rule. Choosing 50/30/20 saves right away and shows a new card, "50/30/20 this
month", with three rows: Needs (50%), Wants (30%) and Savings (20%). Each shows
what you actually spent or saved, a bar, and the target based on this month's
income ($1,000 income gives targets of $500, $300 and $200). Savings counts money
you put into goals that month. Without income, the card asks you to add it.

### The 50/30/20 rule, in short

It's a popular rule of thumb from personal finance: after tax, put about half
your income toward things you need, under a third toward things you want, and a
fifth toward savings. It's simple enough to remember, which is its main
strength. For a student with low income and few fixed costs, the numbers can look
very different, and that's fine.

### New concepts

**Radio buttons.** `<input type="radio">` with the same `name` form a group where
only one can be chosen. `radio.checked` reads or sets whether it's chosen. The
`change` event fires when the user picks it.

**`<fieldset>` and `<legend>`.** They group related inputs and give the group a
title. Screen readers announce "Budget style, radio group" so the options make
sense on their own.

**A lookup table for grouping.** `CATEGORY_GROUPS = { Food: "needs", ... }` maps
each category to its group. `spent[CATEGORY_GROUPS[entry.category] || "wants"]`
adds the amount to the right group. The `|| "wants"` is a safety net for any
category not in the table.

**Testing an assumption, not just a function.** The loop in tests.js checks that
every expense category has a group. If someone adds a new category later and
forgets the table, the test fails with a clear message instead of the app silently
mis-counting money.

**A small helper inside a function.** `const group = (key, label, ...) => ({...})`
is an arrow function defined inside `fiftyThirtyTwenty`, used three times to avoid
repeating the same object shape. It only exists inside that function.

**`accent-color`.** A modern CSS property that recolours built-in controls like
radios and checkboxes with one line.

### Key lines of code

```js
spent[CATEGORY_GROUPS[entry.category] || "wants"] += entry.amountCents;
```
Find the group name, then add to that group's total. Square brackets let us use
a variable as the key.

```js
targetCents: Math.floor((incomeCents * percent) / 100),
```
Multiply first, then divide, to keep the math in whole cents as long as
possible, and round down so targets never add up to more than the income.

```js
const isOver = group.key !== "savings" && group.actualCents > group.targetCents;
```
Saving more than 20% isn't "over" anything, it's a win, so it never gets the
over colour.

### Quiz

1. Your income this month is $640. What are the three targets?
2. Why does the test loop over `EXPENSE_CATEGORIES` instead of just testing
   `CATEGORY_GROUPS.Food`?

**Answers**

<details>
<summary>Show answers</summary>

1. Needs $320.00, Wants $192.00, Savings $128.00.
2. To catch the future mistake of adding a category to `EXPENSE_CATEGORIES`
   without giving it a group. A single check would only prove Food works.

</details>

---

## Task 3.5: Rollover (2026-10-23)

### What we built

A checkbox in Settings: "Roll unspent budget over to next month". When it's on,
money you didn't use in a category's budget gets added to next month's budget for
that category. With a $100 Food budget and $60 spent in September, October's Food
budget becomes $140, and the row says "Includes $40.00 rolled over". Going over
budget never shrinks next month; overspending just resets the carry to zero. The
carry starts from the month you turn it on, so switching it on doesn't suddenly
add up leftovers from months ago.

### New concepts

**A classic `for` loop with a custom step.**
`for (let m = rolloverStart; m < month; m = shiftMonth(m, 1))` has three parts:
start value, condition to keep going, and how to move to the next value. Here the
"counter" is a month like "2026-09", and each step moves one month forward.
Any value can be a loop counter, not just numbers.

**Carrying state across loop turns.** `carried` holds each category's leftover
from the previous month. Each turn reads it (to know what was available) and
then overwrites it (with what's left now). This is how running balances work,
in bank accounts and in physics simulations alike.

**Storing *when*, not just *whether*.** A plain `rollover: true` would raise the
question "since when?". Storing `rolloverStart: "2026-10"` answers it, and
`null` still means "off". One field, two pieces of information.

**Checkboxes.** `<input type="checkbox">` is on/off. `event.target` is the
element that fired the event, and `event.target.checked` tells us its new state.

**One source of truth, used everywhere.** `effectiveBudgets` is called by both the
"Where it went" bars and "Safe to spend". If they computed budgets separately,
they could disagree, and the app would show two different truths.

### Key lines of code

```js
const available = budgets[category] + (carried[category] || 0);
carried[category] = Math.max(0, available - (spentByCategory[category] || 0));
```
This month's money = budget + what carried in. Next month's carry = what's
left, but never below zero.

```js
data.settings.rolloverStart = event.target.checked ? monthKey(toDateString(new Date())) : null;
```
On: remember this month. Off: forget.

```js
if (rolloverStart && rolloverStart < month) {
```
Nothing to carry in the start month itself, or when rollover is off.

### Quiz

1. Fun budget $50, rollover on since August. You spend $0 in August, $120 in
   September. What's October's Fun budget?
2. Why not count leftovers from every month since you started using the app?

**Answers**

<details>
<summary>Show answers</summary>

1. August: $50 available, $0 spent, so $50 carries. September: $100 available,
   $120 spent, so the carry is max(0, −20) = 0. October: $50 + $0 = $50.
2. Budgets apply to all months, including ones from before you ever set them. If
   you'd used the app for a year before turning rollover on, a year of "unspent"
   budget (that you never planned) would suddenly appear. Starting the month you
   turn it on matches what you'd expect.

</details>

---

## Task 4.0: Choose a data source (2026-10-23)

### What we did

No code this time: this was research. The practice simulator (Phase 4) needs
stock and ETF prices from somewhere. We compared three free stock-price services
(APIs) on four questions: how much can you use for free, do you need a key, can
a web page call it directly, and what happens if the key ends up in public code.
The answer: Finnhub (recommended), with one important rule about where the key
lives. **You choose before task 4.1.**

### New concepts

**API (Application Programming Interface).** A way for one program to ask
another for data. Here, our app sends a web address like
`.../quote?symbol=AAPL&token=YOUR_KEY` and gets back JSON with the price.

**API key.** A secret string that identifies you to the service, like a library
card. It lets them count your requests (rate limits) and block abuse.

**Rate limit.** How many requests you're allowed in a time window (per minute,
per day). Go over, and the API answers with an error until the window resets.

**CORS (Cross-Origin Resource Sharing).** Browsers block a page on one website
(like `masteneee.github.io`) from reading responses from another website (like
an API), *unless* that API sends a header saying "any website may read me"
(`Access-Control-Allow-Origin`). Our app has no server, so it can only use APIs
that send this header. A server-to-server call doesn't have this rule; it's a
browser safety feature.

**Why a key in public code is a problem.** The repo is public and the site is on
GitHub Pages, so anything in `app.js` can be read by anyone (View Source works).
Bots scan GitHub for keys all day. Someone who copies your key can use up your
free requests (the simulator stops working for you) or get the key banned. With
a free plan there's no bill to run up, but it's still your account.

### Comparison

Facts are from third-party summaries dated 2026, because the providers' own
pages couldn't be reached from the research environment. Free tiers change
often, so check the official pricing pages before signing up.

| | **Finnhub** | **Alpha Vantage** | **Twelve Data** |
|---|---|---|---|
| Free limit | ~60 requests / minute | 25 requests / **day** | 8 / minute, 800 / day |
| Key needed? | Yes (free, no credit card) | Yes (free) | Yes (free) |
| Quote endpoint free? | Yes: price, change, open, high, low | Yes (`GLOBAL_QUOTE`) | Yes (`/quote`) |
| Markets on free plan | US stocks and ETFs | Stocks and ETFs; real-time US data is paid-only | US stocks, forex, crypto |
| Browser calls (CORS) | Reported yes, but sources conflict | Commonly used from browsers; not confirmed | Sources conflict; one check found no CORS headers |
| Licence | Personal, non-commercial | Free for personal use | "Evaluation and development" |
| Main weakness | US only, CORS needs a quick check | 25/day runs out after a few searches | Licence is meant for testing, and CORS is unclear |

### Recommendation: Finnhub

1. **Its limits fit a practice simulator.** Looking up a ticker and refreshing a
   few holdings might be 10 to 20 calls in a session. Finnhub's 60 per minute
   covers that easily. Alpha Vantage's 25 per *day* would run out on day one.
2. **Its free licence matches this app** (personal and educational), unlike Twelve
   Data's "evaluation" licence.
3. **US stocks and ETFs are enough to learn the concepts** (stocks, ETFs,
   diversification) that the lesson cards (4.3) cover.

**How to handle the key: you type it in, it's never in the code.** Settings gets
a "Finnhub API key" box. The key is saved in your browser's localStorage (through
storage.js), so it never appears in the repo or on GitHub Pages. Anyone else
using your published site would need their own free key. This turns the public-code
risk into zero risk, with no server needed.

**First step of 4.1, because CORS sources disagree:** one request from the
browser to confirm Finnhub sends the CORS header. If it doesn't, the fallback is
Alpha Vantage with results cached in localStorage for the day, so a ticker you
already looked up doesn't spend another request.

**Not chosen, but worth knowing:** Yahoo Finance's unofficial endpoints need no
key, but they block browser calls (no CORS) and can break without notice.

### Sources

- [Finnhub free tier summary (apicostcalc, 2026)](https://apicostcalc.com/finnhub.html)
- [Finance::Quote Finnhub module docs (free limits, personal use)](https://metacpan.org/pod/Finance::Quote::Finnhub)
- [Finnhub free tier capabilities (2026)](https://github.com/RaquazaCode/Fintech-AI-SaaS-Using-Google-Antigravity-Skills-Stitch/blob/main/Finnhub%20API%20Free%20Tier%20Capabilities%20(2026).docx.md)
- [Finnhub API listing (CORS example)](https://www.freeapisforyou.in/api/finnhub)
- [Alpha Vantage pricing and free tier (apicostcalc, 2026)](https://apicostcalc.com/alpha-vantage.html)
- [Alpha Vantage pricing 2026 (QVeris)](https://qveris.ai/guides/alpha-vantage-pricing-alternative/?lang=en)
- [Alpha Vantage rate limits (apis.io)](https://apis.io/rate-limits/alpha-vantage/alpha-vantage-rate-limits/)
- [Twelve Data review and pricing](https://stockmarketstack.com/tools/twelve-data)
- [Twelve Data CORS check (shipapis)](https://shipapis.dev/api/twelve-data)
- [Twelve Data API documentation](https://twelvedata.com/docs)
- [Fetch: Cross-Origin Requests (javascript.info)](https://javascript.info/fetch-crossorigin)

### Quiz

1. Your Finnhub key is in `app.js` and the repo is public. Name two things a
   stranger could do with it.
2. Why can't our app just call an API that doesn't send CORS headers, even
   though `curl` on a computer can?

**Answers**

<details>
<summary>Show answers</summary>

1. Use up your free request limit (your simulator stops working), and get your
   key or account blocked for abuse. On a paid plan, they could also run up a bill.
2. CORS is enforced by the browser, to stop one website from reading data from
   another without permission. `curl` isn't a browser, so it doesn't apply the
   rule. Our app only runs in a browser and has no server of its own to make the
   call for it.

</details>

---

## Task 4.1: Simulator wallet (2026-10-23)

### What we built

The header now has two tabs: "Budget" (everything from before) and "Practice".
The Practice tab opens with a soft banner: "Fake money, real prices. This is for
learning how investing works, not advice to buy anything." Below it, your
practice cash: $1,000.00 of fake money. A "Look up a price" box takes a ticker
like VOO or AAPL and shows its latest price from Finnhub, how much it moved today,
and when that price is from. At the bottom, you paste your free Finnhub key once.
It stays in your browser only. Every problem (no key, wrong key, unknown ticker,
too many lookups, no internet) gets its own calm sentence explaining what to do.

### New concepts

**`fetch`.** The browser's built-in way to request a web address from JavaScript.
`await fetch(url)` sends the request and waits for the response without freezing
the page. `response.status` is the HTTP status code (200 OK, 401 not allowed,
429 too many requests), and `await response.json()` reads the body as JSON.

**HTTP status codes.** Three-digit codes in every web response: 2xx means success,
4xx means the request had a problem (401/403: bad key, 404: not found, 429: rate
limit), 5xx means the server had a problem. We check the specific ones we can
explain in plain words.

**When `fetch` throws vs when it doesn't.** A 401 or 429 is still an *answer*,
so `fetch` doesn't throw; we check `response.status`. `fetch` only throws when
no answer arrives at all: offline, DNS failure, or the browser blocking it because
of CORS. That's why the `catch` message is about reaching Finnhub.

**Returning `{ quote }` or `{ problem }`.** `fetchQuote` can end in many ways. It
returns an object with either a `quote` or a `problem` sentence, so the caller
just checks `if (answer.problem)`. Every failure becomes a message for the user,
never a crash.

**`encodeURIComponent`.** Web addresses have special characters (`&`, `?`, `=`,
spaces). This function escapes them so a ticker or key can't break the URL.

**Keeping a secret out of shared files.** The key is stored under a *separate*
localStorage key, so `saveData` and the backup export never touch it. If you
share a backup with someone, your key doesn't go with it. `type="password"`
hides it on screen too.

**Tabs with ARIA.** `role="tablist"`, `role="tab"`, `aria-selected` and
`role="tabpanel"` tell screen readers these buttons switch between views.
Switching is just showing one `<main>` and hiding the other with `hidden`.

**A regex with a lookahead (the commas).** `/\B(?=(\d{3})+(?!\d))/g` finds every
position that's inside the number (`\B`) and followed by one or more groups of
exactly three digits until the end (`(?=...)` checks ahead without consuming).
A comma goes in each of those spots. Regexes like this are hard to read, which is
exactly why it has a comment and five tests.

### Key lines of code

```js
if (!json || typeof json.c !== "number" || json.c <= 0) {
  return null;
}
```
Finnhub answers an unknown ticker with `c: 0` (price zero) instead of an error.
Reading the API's real behaviour, not just the happy path, is half the work.

```js
priceCents: Math.round(json.c * 100),
```
Prices arrive as decimals (189.43). We convert to cents once, at the boundary,
and `Math.round` cleans up tiny float errors (19.99 × 100 = 1998.9999999999998).

```js
} catch (error) {
  return { problem: "Couldn't reach Finnhub. Check your internet connection and try again." };
}
```
No answer at all becomes a calm sentence.

### Check this in your browser

My test environment couldn't reach Finnhub, so the tests used fake answers in
the same format. With your real key, look up `VOO`. If you see a price, CORS
works. If you see "Couldn't reach Finnhub" while online, open the Console (F12)
and look for a CORS error. That would mean we need the fallback from task 4.0.

### Quiz

1. You type a wrong key and look up VOO. Does `fetch` throw? Which message appears?
2. Why is the Finnhub key stored under a separate localStorage key instead of
   inside `data.settings` like the hourly wage?

**Answers**

<details>
<summary>Show answers</summary>

1. No. Finnhub still answers, just with status 401, so `fetch` succeeds and we
   check `response.status`. The message is "Finnhub didn't accept that key. Check
   it in Price data below."
2. Everything in `data` goes into the backup file. A key is a secret: you might
   share or upload a backup without thinking about it. Keeping the key apart
   means backups can never leak it.

</details>

---

## Task 4.2: Buy and sell (2026-10-23)

### What we built

After looking up a price, you can now trade with practice money. Type a number of
shares and the app previews the cost ("3 shares × $100.00 = $300.00. You own 0
shares."), then tap Buy or Sell. The top card shows your practice account total,
your cash and your investments, plus your overall gain or loss since you started
with $1,000. "Your practice investments" lists each holding: shares, average
cost, last price, value and gain or loss, like "+$60.00 (+20.0%)". "Refresh
prices" fetches new prices for everything you hold. You can't spend more cash
than you have or sell shares you don't own; both get a plain message. "Start over
with $1,000" resets everything after a confirm.

### New concepts (investing)

**Cost basis.** The total you paid for the shares you still hold. Buy 3 at $100
and 1 at $160: cost basis $460 for 4 shares.

**Average cost.** Cost basis ÷ shares = $115. It's the price your shares "cost"
on average, and the line your gain or loss is measured from.

**Unrealized vs realized gain.** If the price is now $120, your 4 shares are worth
$480, a +$20 gain, but only on paper ("unrealized"). It becomes real ("realized")
when you sell. Prices can move again before then.

**Why selling doesn't change the average cost.** Selling 1 of 4 shares removes ¼
of the cost basis ($115), so the 3 you keep still average $115. Your gain on the
sold share is $120 − $115 = $5.

### New concepts (code)

**Returning a new object instead of changing the old one.** `buyShares` returns a
brand new `practice` object (or a `problem`). app.js only swaps it in when there's
no problem. A failed trade can't leave the account half-updated.

**Computed property names.** `{ [ticker]: {...} }`: square brackets inside an
object literal use the *value* of `ticker` ("VOO") as the key, not the word "ticker".

**`delete`.** `delete holdings[ticker]` removes a key from an object. We do it on
a copy (`Object.assign({}, practice.holdings)`), never on the original.

**`await` inside a `for...of` loop.** "Refresh prices" asks for one ticker, waits
for the answer, then asks for the next. That's slower than asking for all at once,
but it's gentle on the rate limit and easy to read.

**The `input` event.** Fires on every keystroke in a field. We use it to update
the cost preview live as you type the number of shares.

### Key lines of code

```js
const costRemoved = Math.round((old.costCents * shares) / old.shares);
```
Selling a fraction of your shares removes the same fraction of their cost.

```js
const result = kind === "buy"
  ? buyShares(data.practice, ticker, shares, currentQuote.priceCents)
  : sellShares(data.practice, ticker, shares, currentQuote.priceCents);
if (result.problem) {
  message.textContent = result.problem;
  return;
}
data.practice = result.practice;
```
Try the trade on a copy. Only accept it if it worked.

```js
gainPercent: Math.round((gainCents / holding.costCents) * 1000) / 10,
```
Gain as a percent of what you paid, to one decimal (×1000, round, ÷10).

### Quiz

1. You buy 2 shares at $50, then 2 more at $70. What's your average cost? Then the
   price is $65. What's your gain or loss?
2. You sell 1 of those 4 shares at $65. What's the average cost of the 3 you keep?

**Answers**

<details>
<summary>Show answers</summary>

1. Cost basis = $100 + $140 = $240 for 4 shares, so the average is $60. Value at
   $65 = $260, a gain of +$20 (+8.3%).
2. Still $60. Selling removed ¼ of the cost ($60), leaving $180 for 3 shares.

</details>

---

## Task 4.3: Lesson cards (2026-10-23)

### What we built

The Practice tab has a new "Learn the basics" section with six cards: What is a
stock?, What is an ETF?, Diversification, Fees, Risk vs time, and Why "get rich
quick" fails. Each is a title you tap to open a short plain-language explanation
(60 to 70 words). Only one idea per card, no jargon without an explanation, and
no card tells you to buy anything specific. The fees card has a concrete example:
on $10,000 growing for 30 years, a 1% fee instead of 0.1% costs about $12,000.

### New concepts

**Content as data.** The six lessons are an array of `{ title, text }` objects in
logic.js, and app.js loops over them to build the cards. To fix a typo or add a
card, you edit data, not page code. Keeping content apart from layout is how
most sites work (blogs, apps, games).

**Tests for rules, not just math.** The plan says "max 80 words each". A test
loops over every lesson and fails with the card's title and word count if one is
too long. A rule that a computer checks never gets forgotten.

**Testing a claim in the text.** The fees lesson says "about $12,000". The test
computes 10,000 × 1.059³⁰ − 10,000 × 1.05³⁰ ≈ $12,612, and checks the claim is
within $1,000. If someone changes the example later, the test catches a wrong
number. It's a small habit for anything that states a fact.

**Compound growth.** `Math.pow(1 + rate, years)` is growth on top of growth: each
year's gain also grows in later years. A fee is a negative rate that compounds
too, which is why a "small" 1% does so much damage over 30 years.

**Splitting text into words.** `text.trim().split(/\s+/)` cuts at any run of
spaces, tabs or line breaks. `\s` means "whitespace" and `+` means "one or more",
so double spaces don't count as extra words.

### Key lines of code

```js
assert.ok(words <= 80, '"' + lesson.title + '" has ' + words + " words (max 80)");
```
`assert.ok(condition, message)` fails with your message, so a failure points
straight at the problem card.

```js
const withHighFee = 10000 * Math.pow(1 + 0.06 - 0.01, 30);
```
6% growth minus a 1% fee = 5% a year, for 30 years.

```js
const card = makeElement("details", "lesson", "");
card.appendChild(makeElement("summary", "", lesson.title));
```
Reusing `<details>` (from goals) gives tap-to-open cards with no extra JavaScript.

### Quiz

1. Why does a 1% fee cost so much more than 1% of your money over 30 years?
2. A friend adds a seventh card. What happens when you run `node tests.js`?

**Answers**

<details>
<summary>Show answers</summary>

1. The fee is taken every year from a growing balance, and the money it removes
   would itself have grown in every later year. Like interest, fees compound.
2. The test `assert.strictEqual(logic.LESSONS.length, 6)` fails, because the plan
   calls for 6 cards. If seven is the new plan, update the plan and the test together.

</details>

---

## Task 4.4: Savings link (2026-10-23)

### What we built

Every savings goal now has a "Practice investing this amount" button. Tapping it
takes the money saved in that goal (or the target, if you haven't started yet),
adds it to your practice account as fake money, and switches to the Practice tab.
There, a new card asks "What could $400.00 from "New bike" become?" and shows a
table: the amount after 1, 5, 10 and 20 years at 2%, 5% and 7% a year. Right below,
in bold: "Examples, not predictions. Past results don't predict the future..."
Your real goal stays exactly as it was. The practice account's "since you started
with" amount now includes the added money, so it doesn't look like a gain.

### New concepts

**Compound growth formula.** After `n` years at rate `r`, an amount becomes
`amount × (1 + r)ⁿ`. Each year grows on top of the last. $400 at 7% is $428 after
1 year, but $1,548 after 20. Most of that growth happens in the later years,
which is why starting early matters more than starting big.

**A projection is not a prediction.** Real returns jump around: +20% one year,
−15% the next. A steady 7% line hides that. Showing three rates side by side
(including a savings-account-like 2%) shows a *range* instead of one promise,
and the label says it plainly. Honest presentation of numbers is a skill, not
just a legal disclaimer.

**Tracking what you put in.** `startCents` is the total fake money ever added. Gain
= current total − startCents. Without it, adding $400 would look like a $400
profit. Real investment accounts do the same thing with "contributions".

**`<table>` for tabular data.** Rows and columns of numbers are what tables are
for. `<thead>` and `<tbody>` separate the header from the data, and
`scope="col"` tells screen readers each header belongs to its column.
`font-variant-numeric: tabular-nums` makes every digit the same width, so
amounts line up.

**`scrollIntoView()`.** Scrolls the page so an element is visible. Handy after
switching tabs, so the user lands on what they asked for.

**Changing a function's output without breaking callers.** `buyShares` and
`sellShares` now use `Object.assign({}, practice, {...})` so they keep fields
they don't know about (like `startCents`). The old tests still pass unchanged,
and new tests prove `startCents` survives a trade.

### Key lines of code

```js
return Math.round(cents * Math.pow(1 + ratePercent / 100, years));
```
Compound growth in one line, rounded to whole cents.

```js
return Object.assign({}, practice, {
  cashCents: practice.cashCents + cents,
  startCents: practice.startCents + cents,
});
```
Add money to both cash and "what you put in", so gain or loss stays honest.

```js
const amountCents = saved > 0 ? saved : goal.targetCents;
```
Use real savings when there are some; otherwise imagine the full target.

### Quiz

1. You put $1,000 into the simulator, it grows to $1,100, then you add $400 from a
   goal. What does "gain since you started" show?
2. At 7% a year, roughly how long does money take to double? (Hint: look at the
   table, or try the "rule of 72": 72 ÷ 7.)

**Answers**

<details>
<summary>Show answers</summary>

1. Total $1,500, start $1,400, so +$100.00 (+7.1%). The $400 is counted as money
   put in, not as a gain.
2. About 10 years (72 ÷ 7 ≈ 10.3). The table agrees: $400 becomes $786.86 after
   10 years, nearly double.

</details>
