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
