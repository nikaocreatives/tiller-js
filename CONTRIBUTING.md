# Contributing to Tiller.js

Thanks for your interest in contributing! This is a small, focused library — contributions that stay true to that are most welcome.

## Getting started

No build step required. Clone the repo and open the demo pages directly in Chrome or Edge (WebHID is not supported in other browsers).

```bash
git clone https://github.com/chasturansky/tiller-js.git
cd tiller-js
```

Open any file in `demo/` directly in your browser or serve the folder locally:

```bash
npx serve .
```

## Project structure

```
src/index.js          ← The entire library (one file, no dependencies)
demo/                 ← Demo pages
docs/index.html       ← Documentation page
```

## Making changes

- **The library lives entirely in `src/index.js`** — keep it that way. No dependencies, no build step.
- **New events or methods** should follow the existing patterns — chainable `.on()`, async LED methods.
- **Demo pages** are a good place to validate new features hands-on.

## Submitting a PR

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Test with a physical Tiller device if possible
4. Open a pull request with a clear description of what changed and why

## Reporting bugs

Use the [bug report template](https://github.com/chasturansky/tiller-js/issues/new?template=bug_report.md). Include your browser version — WebHID behavior can vary between Chrome releases.
