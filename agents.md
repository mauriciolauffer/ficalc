This repository contains multiple calculators for financial assets such as real estate and stocks.

## Tech Stack
- **Framework:** UI5 Web Components
- **Language:** TypeScript
- **Package Manager:** pnpm
- **Builder:** vite
- **Testing:** vitest
- **Linter:** oxlint
- **Formatter:** oxfmt

## Architecture
- Each calculator is an isolated webapp.
- No backend or storage required.

## Coding Guidelines
- **Security:** Avoid using `innerHTML` to construct UI elements (e.g., table rows) to prevent XSS vulnerabilities. Use `document.createElement` and `textContent` instead, even for numeric or formatted data.
