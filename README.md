# react-page-builder — Monorepo

This repository contains the `react-page-builder` npm package and a Next.js development playground for it.

```
.
├── packages/
│   └── page-builder-core/   ← the npm package (react-page-builder)
└── src/                     ← Next.js demo app (not shipped)
    ├── app/
    ├── components/          ← six demo tabs, each showing a different usage pattern
    └── data/                ← sample layout data used by the demos
```

> **Nothing in `src/` is included in the published package.** The package only ships the compiled `dist/` output. See [What gets published](#what-gets-published).

---

## Getting started

**Prerequisites:** Node >= 18, pnpm >= 9.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The page has six tabs, each demonstrating a different aspect of the builder:

| Tab | Description |
|-----|-------------|
| **Default Builder** | Built-in UI, undo/redo toolbar, dirty-state tracking, external settings panel |
| **Custom UI Builder** | All five render props replaced with a custom indigo design system |
| **Form Builder** | Inline edit mode inside components (fields appear in place while editing) |
| **Form Builder (Panel)** | Same form components but props are edited from a caller-owned side panel |
| **DnD Reorder** | dnd-kit sortable: drag sections up and down to reorder them |
| **DnD Add** | dnd-kit: drag layout presets and widget chips from a sidebar onto the canvas |

---

## Building the package

```bash
pnpm pkg:build       # build once (outputs to packages/page-builder-core/dist/)
pnpm pkg:dev         # build in watch mode during development
```

---

## Package documentation

Full API reference, props table, render props, responsive behavior, and usage examples are in the package README:

[packages/page-builder-core/README.md](packages/page-builder-core/README.md)

---

## What gets published

The package `package.json` declares:

```json
"files": ["dist", "src/styles"]
```

When someone runs `npm install react-page-builder`, they receive:

- `dist/index.js` — ESM build
- `dist/index.cjs` — CommonJS build
- `dist/index.d.ts` — TypeScript declarations
- `src/styles/base.css` — optional base styles

**Not included:**

- `src/` — the Next.js demo app, widget components, and sample layout data
- `packages/page-builder-core/src/` — TypeScript source (consumed from the workspace via a path alias, never published raw)

---

## Workspace layout

This is a pnpm workspace. The Next.js app (`package.json` at root) consumes the package via a workspace reference:

```json
"dependencies": {
  "react-page-builder": "workspace:*"
}
```

The TypeScript path alias in `tsconfig.json` points directly at the package source so no build step is required during local development:

```json
"paths": {
  "react-page-builder": ["./packages/page-builder-core/src/index.ts"]
}
```

For Next.js to transpile the workspace package, `next.config.ts` includes:

```ts
transpilePackages: ["react-page-builder"]
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the Next.js dev server |
| `pnpm build` | Production build of the Next.js app |
| `pnpm type-check` | TypeScript check across the whole workspace |
| `pnpm lint` | ESLint via Next.js |
| `pnpm pkg:build` | Build the `react-page-builder` package |
| `pnpm pkg:dev` | Build the package in watch mode |
