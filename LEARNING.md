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
