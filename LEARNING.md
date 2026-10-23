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
