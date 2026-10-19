# Senior Frontend Lab

**English** · [Português](README.pt-BR.md)

An interactive study lab about how a senior frontend engineer thinks. There are six modules, one per topic. In each one you trigger the problem in experiments that really run in the browser, read the code behind it (the broken version next to the working one), get a "Senior take" and finish with a set of questions ("How to decide") that leads to a recommendation for your case.

Plain HTML, CSS and JavaScript: no build step and no dependencies (only the Google Fonts).

Open it at: https://anacsinigaglia.github.io/frontend-senior-lab/en/

Portuguese version: https://anacsinigaglia.github.io/frontend-senior-lab/ (the **PT | EN** switch in the top bar changes the language of the current page).

## Modules

| Module | What you play with | Decision |
| --- | --- | --- |
| [Performance](en/performance.html) | Core Web Vitals (LCP, INP, CLS) measured live; debounce on a customer search; a 50,000-row table with and without virtualization; layout thrashing measured in ms | Is this worth optimizing? |
| [Security](en/seguranca.html) | An XSS comment that reads the token; token in localStorage, memory or an httpOnly cookie; links with a disguised `javascript:` | Where do I store authentication? |
| [Semantics & a11y](en/semantica.html) | A div styled as a button versus a `<button>` on the keyboard; what the screen reader announces; contrast by the WCAG rule | Which element do I use? |
| [Architecture & state](en/arquitetura.html) | Prop drilling, Context or a store: what re-renders; server cache shared by two screens and invalidation after a sale | Where should this state live? |
| [Quality & testing](en/qualidade.html) | Three booleans versus one status; tests that break on refactoring and tests that let the bug through | Which test do I write for this? |
| [Technical decisions](en/decisoes.html) | Weighted trade-off matrix (Context, Zustand or Redux Toolkit); Markdown ADR generator; classifying code review comments | Does this decision need an ADR? |

## Running locally

Open `index.html` (Portuguese) or `en/index.html` (English) directly in the browser, or serve the folder with a static server:

```sh
npx serve .
# or
python3 -m http.server
```

## Structure

| File | What it does |
| --- | --- |
| `index.html` | Home page with the module cards. Marks modules you have already opened as "visited" (read from localStorage). |
| `lab.css` | Shared styles: module bar, experiment benches, code blocks, decision panel and pagination. |
| `lab.js` | Shared script. Exposes `window.Lab` and, on load, reads `data-module` from `<body>` to build the navigation and mark the module as visited. |
| `<module>.html` | One page per module, with the experiments and the decision questions in its own `<script>` at the end of the page. |
| `en/` | The English version: the same pages with the same file names, `<html lang="en">`, and `lab.css`/`lab.js` loaded from `../`. |

File names stay in Portuguese in both versions (`seguranca.html`, `decisoes.html`…), so the language switch only has to swap the folder.

`window.Lab` contains:

- `LANG`: `'en'` when the page's `<html lang>` starts with `en`, otherwise `'pt'`. It sets the language of the shared text (navigation, pagination, the "How to decide" panel and the copy button).
- `MODULES`: ordered list of modules (`slug`, `short` in Portuguese and `en` in English), used by the navigation and pagination.
- `renderNav(slug)`: fills `#modnav` (top bar) and `#pager` (previous/next).
- On load, `lab.js` also adds the **PT | EN** switch at the end of the top bar. It points to the same file in the other folder (`en/<file>` or `../<file>`) and keeps the `#hash`.
- `decision(root, cfg)`: builds the "How to decide" panel inside `root`.
- `markVisited(slug)` and `store(key, value?)`: JSON read and write in localStorage (`store` without a value reads).
- `copyText(text, btn)`: copies to the clipboard and gives feedback on the button.
- `$`, `$$` and `esc`: shortcuts for `querySelector`, `querySelectorAll` and HTML escaping.

## Adding a module

1. Create `novo.html` by copying the structure of an existing page: `<body data-module="novo">`, `<nav id="modnav">` at the top, `<section id="decidir">` at the end of the content and `<nav id="pager">` after it. Load `lab.css` and `lab.js`.
2. Add `{ slug: 'novo', short: 'Nome curto', en: 'Short name' }` to `MODULES` in `lab.js`, at the position where it should appear in the navigation.
3. Add a card `<a class="mod" href="novo.html" data-slug="novo">` to `index.html`, with the "visited" `.pill` badge.
4. Also create `en/novo.html`, the same page translated, with `<html lang="en">` and `../lab.css`/`../lab.js`, and add the card to `en/index.html`.
5. In the page's script, call `Lab.decision`:

```js
Lab.decision(Lab.$('#decidir'), {
  title: 'Decision question?',
  intro: 'Optional.',
  questions: [
    { id: 'a', text: 'First question?', hint: 'Optional.',
      options: [{ v: 'sim', label: 'Yes' }, { v: 'nao', label: 'No' }] },
    { id: 'b', text: 'Only shows when a = sim', when: (r) => r.a === 'sim',
      options: [{ v: 'x', label: 'X' }, { v: 'y', label: 'Y' }] },
  ],
  decide(r) {
    return { tone: 'warn', title: 'Recommendation', body: '<p>Reasoning.</p>', code: 'optional' };
  },
});
```

`when` receives the answers to the previous questions and hides the question when it returns false. `decide` is only called when every visible question has an answer. `tone` is `'good'` (default) or `'warn'`. `title` and `code` are text (the HTML is escaped); `body` is inserted as HTML.

## About the XSS experiment

The Security module deliberately runs a real injected handler: in `innerHTML` mode, the malicious comment's `onerror` runs in your browser and calls a function on the page itself that shows the alert. The token stored in `localStorage` (`access_token`) is fake, created only for the demo, and nothing is sent outside the page.
