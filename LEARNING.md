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
