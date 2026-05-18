# react-page-builder

A headless, UI-agnostic React page builder with a 12-column grid system, drag-free section/component management, and full render-prop customisation. Works in plain React (Vite, CRA) and Next.js App Router.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [ILayoutData format](#ilayoutdata-format)
  - [12-column grid](#12-column-grid)
  - [Component registry](#component-registry)
- [PageBuilder](#pagebuilder)
  - [Props reference](#props-reference)
  - [Controlled vs uncontrolled mode](#controlled-vs-uncontrolled-mode)
  - [Imperative handle (ref API)](#imperative-handle-ref-api)
  - [Edit mode](#edit-mode)
  - [Saving layout](#saving-layout)
- [Render Props](#render-props)
  - [renderAddTrigger](#renderaddtrigger)
  - [renderLayoutPicker](#renderlayoutpicker)
  - [renderSectionControls](#rendersectioncontrols)
  - [renderComponentPicker](#rendercomponentpicker)
  - [renderComponentControls](#rendercomponentcontrols)
- [GridLayout (standalone)](#gridlayout-standalone)
- [LayoutPicker (standalone)](#layoutpicker-standalone)
- [Responsive Behaviour](#responsive-behaviour)
- [CSS Custom Properties](#css-custom-properties)
- [TypeScript Types](#typescript-types)
- [Layout Presets](#layout-presets)
- [Next.js App Router](#nextjs-app-router)
- [Limitations](#limitations)
- [Full Examples](#full-examples)

---

## Installation

```bash
npm install react-page-builder
# or
pnpm add react-page-builder
# or
yarn add react-page-builder
```

**Peer dependencies** (must be installed separately):

```bash
npm install react react-dom
```

React >= 17 is required. No other runtime dependencies.

---

## Quick Start

```tsx
import { useState } from "react";
import { PageBuilder } from "react-page-builder";
import type { ComponentDefinition } from "react-page-builder";

// 1. Define your component registry
const components: ComponentDefinition[] = [
  {
    name: "Hero",
    label: "Hero Banner",
    icon: "🖼️",
    component: ({ editMode }) => (
      <div style={{ padding: 24, background: "#f0f4ff" }}>
        Hero Banner {editMode && <em>(editing)</em>}
      </div>
    ),
    category: "Media",
  },
  {
    name: "Text",
    label: "Text Block",
    icon: "📝",
    component: () => <div style={{ padding: 16 }}>Text content here.</div>,
    category: "Content",
  },
];

// 2. Mount the builder
export default function App() {
  const [editMode, setEditMode] = useState(false);

  return (
    <div>
      <button onClick={() => setEditMode((m) => !m)}>
        {editMode ? "Done" : "Edit Page"}
      </button>

      <PageBuilder
        components={components}
        editMode={editMode}
        onEditModeChange={setEditMode}
        spacing={16}
      />
    </div>
  );
}
```

---

## Core Concepts

### ILayoutData format

`ILayoutData` is the flat array format used to describe a page layout. It is what you persist to a database and what you pass as `defaultValue` / `value`.

```ts
interface ILayoutData {
  Id: string;          // unique item identifier
  SectionId: string;   // groups items into a row; same SectionId = same section
  RowIndex: number;    // section order on the page (0 = top)
  ColumnIndex: number; // column position within the section (0 = leftmost)
  ColumnSpan?: number; // width on 12-col grid (e.g. 8 = 2/3 wide). Default: equal split
  VerticalIndex?: number; // stack order within a column (0 = top). Default: 0
  ComponentName: string;  // key into your ComponentDefinition registry
  componentProps?: Record<string, unknown>; // static props passed to the component
  // runtime-only — never serialized:
  renderComponent?: () => React.ReactElement;
}
```

**Visual mapping:**

```
SectionId "row-a"  (RowIndex 0)
  ColumnIndex 0 (ColumnSpan 8)       ColumnIndex 1 (ColumnSpan 4)
  ┌──────────────────────┐           ┌───────────┐
  │ VerticalIndex 0      │           │ Component │
  ├──────────────────────┤           └───────────┘
  │ VerticalIndex 1      │
  └──────────────────────┘

SectionId "row-b"  (RowIndex 1)
  ColumnIndex 0 (ColumnSpan 4)  ColumnIndex 1 (ColumnSpan 4)  ColumnIndex 2 (ColumnSpan 4)
  ┌────────────┐                ┌────────────┐                 ┌────────────┐
  │ Component  │                │ Component  │                 │ Component  │
  └────────────┘                └────────────┘                 └────────────┘
```

### 12-column grid

Column widths are expressed as spans on a 12-column grid — the same convention as Bootstrap or Tailwind's grid utilities.

| Span | Fraction | Example use |
|------|----------|-------------|
| 12   | 100%     | Full-width banner |
| 6    | 50%      | Two equal columns |
| 4    | 33.3%    | Three equal columns |
| 3    | 25%      | Four equal columns |
| 8    | 66.7%    | Wide left, narrow right |
| 4    | 33.3%    | Narrow left, wide right |

Custom spans are also supported — any positive integers summing to 12, entered via the Custom option in the layout picker (e.g. `3,6,3`).

### Component registry

Each entry in `ComponentDefinition[]` maps a string name to a React component:

```ts
interface ComponentDefinition<P = any> {
  name: string;           // registry key — must match ComponentName in ILayoutData
  label: string;          // displayed in the component picker
  icon?: React.ReactNode; // displayed in the picker (emoji or JSX)
  component: React.ComponentType<P & { editMode?: boolean }>;
  defaultProps?: Partial<P>; // applied when the component is first added
  category?: string;      // used to group items in the picker
  description?: string;   // shown as a subtitle in the picker
}
```

Every registered component receives an `editMode?: boolean` prop automatically — use it to render edit-mode overlays or disable interactions.

---

## PageBuilder

### Props reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `components` | `ComponentDefinition[]` | required | Component registry |
| `defaultValue` | `ILayoutData[]` | `[]` | Initial layout (uncontrolled mode) |
| `value` | `ILayoutData[]` | — | Controlled layout value |
| `onChange` | `(items: SerializableLayoutItem[]) => void` | — | Called on every layout change |
| `editMode` | `boolean` | — | Controlled edit-mode flag |
| `onEditModeChange` | `(isEdit: boolean) => void` | — | Called when edit mode changes |
| `spacing` | `number` | `8` | Gap (px) between sections and stacked components |
| `mobileBreakpoint` | `number` | `768` | Viewport width (px) below which columns stack to single column. Set `0` to disable. |
| `tabletBreakpoint` | `number` | `0` | Viewport width (px) above `mobileBreakpoint` where columns are limited to 2 per row. Set `0` to disable. |
| `onSaveChange` | `(items: SerializableLayoutItem[]) => void` | — | Called when Save is triggered. Omit to hide the Save button. |
| `renderAddTrigger` | `(props) => ReactNode` | — | Replace the "+ Add Section" button |
| `renderLayoutPicker` | `(props) => ReactNode` | — | Replace the layout picker modal |
| `renderSectionControls` | `(props) => ReactNode` | — | Replace the section toolbar (⊞ ⧉ ✕) |
| `renderComponentPicker` | `(props) => ReactNode` | — | Replace the component picker panel |
| `renderComponentControls` | `(props) => ReactNode` | — | Replace the component toolbar (⧉ ✕) |
| `classNames` | `PageBuilderClassNames` | — | CSS class names for structural elements |
| `style` | `React.CSSProperties` | — | Inline style for the root element |
| `ref` | `React.Ref<PageBuilderHandle>` | — | Imperative handle for reset/save |

### Controlled vs uncontrolled mode

**Uncontrolled** — pass `defaultValue` and let the builder manage state internally. Use `ref.current.save()` or `onSaveChange` to extract the layout when needed.

```tsx
<PageBuilder
  components={components}
  defaultValue={myInitialLayout}
  onSaveChange={(layout) => fetch("/api/save", { body: JSON.stringify(layout) })}
/>
```

**Controlled** — pass `value` and `onChange` to manage layout state yourself. You are responsible for updating `value` on every `onChange` call, otherwise the builder will not re-render.

```tsx
const [layout, setLayout] = useState<ILayoutData[]>(initialLayout);

<PageBuilder
  components={components}
  value={layout}
  onChange={(serialized) => {
    // serialized is SerializableLayoutItem[] — safe to store
    setLayout(serialized as ILayoutData[]);
  }}
/>
```

> **Note:** Do not mix `value` and `defaultValue`. Use one or the other.

### Imperative handle (ref API)

Attach a `ref` to get access to two imperative methods:

```tsx
import { useRef } from "react";
import { PageBuilder } from "react-page-builder";
import type { PageBuilderHandle } from "react-page-builder";

const ref = useRef<PageBuilderHandle>(null);

<PageBuilder ref={ref} components={components} onSaveChange={handleSave} />

// In your toolbar:
<button onClick={() => ref.current?.reset()}>Reset</button>
<button onClick={() => ref.current?.save()}>Save</button>
```

| Method | Description |
|--------|-------------|
| `reset()` | Clears all sections and components from the canvas |
| `save()` | Triggers `onSaveChange` with the current serialized layout |

### Edit mode

When `editMode` is `false` (the default), the builder renders as a static read-only page. No controls, pickers, or outlines are shown — safe to embed in a public-facing view.

When `editMode` is `true`:
- Sections get a blue outline on hover
- The ⊞ (change layout), ⧉ (clone), and ✕ (delete) controls appear
- Empty column slots show an "+ Add Component" area
- A "+ Add Section" trigger appears at the bottom of the canvas

Edit mode can be toggled from outside via the `editMode` prop, or the builder can manage it internally when `onEditModeChange` is provided.

### Saving layout

The `onSaveChange` callback receives `SerializableLayoutItem[]` — a plain array with `renderComponent` stripped out, safe to `JSON.stringify` and persist:

```ts
type SerializableLayoutItem = Omit<ILayoutData, "renderComponent">;
```

Store this array in your database. Pass it back as `defaultValue` (or `value`) on the next load.

---

## Render Props

All five builder UI slots have render-prop overrides. When a render prop is `undefined`, the built-in default UI is used — so you only need to provide the slots you want to customise.

### renderAddTrigger

Replaces the "+ Add Section" button at the bottom of the canvas.

```tsx
interface AddTriggerRenderProps {
  onClick: (e: React.MouseEvent) => void;
}
```

```tsx
<PageBuilder
  renderAddTrigger={({ onClick }) => (
    <button onClick={onClick} className="my-add-btn">
      + New Section
    </button>
  )}
/>
```

### renderLayoutPicker

Replaces the layout selection modal. Called in three situations:
1. Clicking "+ Add Section" (root add)
2. Clicking the ⊞ button on a section (change layout)
3. Clicking the "+" divider between sections (add section after)

```tsx
interface LayoutPickerRenderProps {
  presets: typeof LAYOUT_PRESETS; // { single, double, triple, fourColumns, leftWide, rightWide }
  onSelectLayout: (columns: readonly number[]) => void;
  onClose: () => void;
}
```

```tsx
<PageBuilder
  renderLayoutPicker={({ presets, onSelectLayout, onClose }) => (
    <div className="my-layout-modal">
      <div className="backdrop" onClick={onClose} />
      <div className="panel">
        {Object.entries(presets).map(([key, cols]) => (
          <button key={key} onClick={() => { onSelectLayout(cols); onClose(); }}>
            {key}
          </button>
        ))}
      </div>
    </div>
  )}
/>
```

> **Tip:** You can also pass any custom column array to `onSelectLayout`, not just preset values. For example `onSelectLayout([3, 6, 3])`.

### renderSectionControls

Replaces the controls bar (⊞ ⧉ ✕) shown in the top-left of an active section.

```tsx
interface SectionControlsRenderProps {
  nodeId: string;
  onClone: () => void;
  onDelete: () => void;
  onChangeLayout: () => void;   // toggles the layout picker for this section
  isLayoutPickerOpen: boolean;  // whether the layout picker is currently open
}
```

```tsx
<PageBuilder
  renderSectionControls={({ onClone, onDelete, onChangeLayout, isLayoutPickerOpen }) => (
    <div style={{ position: "absolute", top: 4, left: 4, display: "flex", gap: 4, zIndex: 20 }}>
      <button
        onClick={onChangeLayout}
        style={{ background: isLayoutPickerOpen ? "blue" : "white" }}
      >
        Layout
      </button>
      <button onClick={onClone}>Clone</button>
      <button onClick={onDelete} style={{ color: "red" }}>Delete</button>
    </div>
  )}
/>
```

> **Important:** Position your controls with `position: "absolute"` and a `zIndex` above the section content. The section itself has `position: "relative"`.

### renderComponentPicker

Replaces the component picker panel that appears when clicking an empty column slot.

```tsx
interface ComponentPickerRenderProps {
  components: ComponentDefinition[];
  onSelectComponent: (name: string) => void;
  onClose: () => void;
}
```

```tsx
<PageBuilder
  renderComponentPicker={({ components, onSelectComponent, onClose }) => (
    <div className="my-picker">
      <div className="backdrop" onClick={onClose} />
      <div className="panel">
        {components.map((def) => (
          <button
            key={def.name}
            onClick={() => { onSelectComponent(def.name); onClose(); }}
          >
            {def.icon} {def.label}
          </button>
        ))}
      </div>
    </div>
  )}
/>
```

### renderComponentControls

Replaces the controls bar (⧉ ✕) shown in the top-right of an active component.

```tsx
interface ComponentControlsRenderProps {
  nodeId: string;
  onClone: () => void;
  onDelete: () => void;
}
```

```tsx
<PageBuilder
  renderComponentControls={({ onClone, onDelete }) => (
    <div style={{ position: "absolute", top: 4, right: 4, zIndex: 30, display: "flex", gap: 4 }}>
      <button onClick={onClone}>⧉</button>
      <button onClick={onDelete}>✕</button>
    </div>
  )}
/>
```

---

## GridLayout (standalone)

`GridLayout` can be used independently of `PageBuilder` — useful when you have an existing `ILayoutData[]` array and just want to render it as a responsive grid without the editing UI.

```tsx
import { GridLayout } from "react-page-builder";
import type { ILayoutData } from "react-page-builder";

const items: ILayoutData[] = [
  {
    Id: "item-1",
    SectionId: "row-1",
    RowIndex: 0,
    ColumnIndex: 0,
    ColumnSpan: 8,
    VerticalIndex: 0,
    ComponentName: "",
    renderComponent: () => <ArticleCard />,
  },
  {
    Id: "item-2",
    SectionId: "row-1",
    RowIndex: 0,
    ColumnIndex: 1,
    ColumnSpan: 4,
    VerticalIndex: 0,
    ComponentName: "",
    renderComponent: () => <Sidebar />,
  },
];

function MyPage() {
  return (
    <GridLayout
      attributes={items}
      columnSpans={[8, 4]}
      gapPx={24}
      componentGapPx={16}
      mobileBreakpoint={640}
      tabletBreakpoint={1024}
    />
  );
}
```

### GridLayout props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `attributes` | `ILayoutData[]` | required | Layout items to render |
| `columnSpans` | `number[]` | equal split | 12-col width per column. Index matches `ColumnIndex`. |
| `gapPx` | `number` | `16` | Horizontal gap between columns (px) |
| `rowGapPx` | `number` | same as `gapPx` | Vertical gap between rows (px) |
| `componentGapPx` | `number` | `0` | Vertical gap between stacked items within a column (px) |
| `mobileBreakpoint` | `number` | `768` | Below this width all columns stack to 100%. Set `0` to disable. |
| `tabletBreakpoint` | `number` | `0` | Between mobile and this width columns are limited to 2 per row. Set `0` to disable. |
| `className` | `string` | — | Class applied to the root `<div>` |
| `style` | `React.CSSProperties` | — | Inline style for the root `<div>` |

### Stacking items in the same column

Give multiple items the same `ColumnIndex` with different `VerticalIndex` values:

```ts
{ Id: "a", ColumnIndex: 0, VerticalIndex: 0, renderComponent: () => <Header /> },
{ Id: "b", ColumnIndex: 0, VerticalIndex: 1, renderComponent: () => <Body /> },
{ Id: "c", ColumnIndex: 1, VerticalIndex: 0, renderComponent: () => <Sidebar /> },
```

`a` and `b` stack vertically in the left column; `c` sits in the right column, separated by `componentGapPx`.

---

## LayoutPicker (standalone)

The built-in layout picker modal can be used outside of `PageBuilder` — for example in a custom toolbar or settings panel.

```tsx
import { useState } from "react";
import { LayoutPicker, LAYOUT_PRESETS } from "react-page-builder";

function MyToolbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Change Layout</button>
      {open && (
        <LayoutPicker
          presets={LAYOUT_PRESETS}
          onSelectLayout={(cols) => {
            console.log("Selected:", cols); // e.g. [8, 4]
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
          columns={3} // optional: fix the preset grid to 3 columns wide
        />
      )}
    </>
  );
}
```

The picker has a built-in "Custom" option where users can type any column spans summing to 12 (e.g. `3,6,3`), with a live visual preview bar.

---

## Responsive Behaviour

The builder supports three breakpoint tiers, all controlled by props on `PageBuilder` (and directly on `GridLayout`):

| Viewport | Behaviour |
|----------|-----------|
| `>= tabletBreakpoint` | Full layout — all columns at their defined spans |
| `>= mobileBreakpoint` and `< tabletBreakpoint` | Tablet — columns capped at 2 per row, each 50% wide |
| `< mobileBreakpoint` | Mobile — all columns stack to 100% width |

**Example — three-tier responsive:**

```tsx
<PageBuilder
  components={components}
  defaultValue={layout}
  mobileBreakpoint={640}   // < 640px: single column
  tabletBreakpoint={1024}  // 640–1023px: max 2 columns per row
/>
```

**Disable responsive entirely** (always render full desktop layout):

```tsx
<PageBuilder mobileBreakpoint={0} tabletBreakpoint={0} />
```

Breakpoints use `window.matchMedia` inside a `useEffect`, so they are SSR-safe — the initial server render always outputs the desktop layout, and the correct responsive layout is applied after hydration on the client.

---

## CSS Custom Properties

The builder uses CSS custom properties for colours, radii, and shadows. Override them on any ancestor element to theme the built-in controls:

```css
:root {
  --pb-accent:     #0078d4;                    /* active outlines, buttons, layout picker bars */
  --pb-surface:    #ffffff;                    /* picker panel background */
  --pb-border:     #e0e0e0;                    /* borders, dashed slot outlines */
  --pb-text-muted: #666666;                    /* secondary text */
  --pb-radius:     10px;                       /* picker panel border-radius */
  --pb-radius-sm:  6px;                        /* component / section border-radius */
  --pb-shadow:     0 8px 24px rgba(0,0,0,0.18); /* picker panel shadow */
}
```

Custom properties are only used by the **built-in default UI**. When you replace a slot with a render prop, you are fully in control of that slot's styles.

---

## TypeScript Types

All public types are exported from the package root:

```ts
import type {
  // Data types
  ILayoutData,
  SerializableLayoutItem,
  ComponentDefinition,
  PageNode,
  IGridItem,

  // Render-prop argument types
  AddTriggerRenderProps,
  LayoutPickerRenderProps,
  ComponentPickerRenderProps,
  SectionControlsRenderProps,
  ComponentControlsRenderProps,

  // Component prop types
  PageBuilderProps,
  PageBuilderHandle,
  PageBuilderClassNames,
  GridLayoutProps,
  LayoutPickerProps,

  // Constants
  LayoutPresetKey,
} from "react-page-builder";
```

---

## Layout Presets

The built-in presets available in the layout picker:

```ts
const LAYOUT_PRESETS = {
  single:      [12],          // Full width
  double:      [6, 6],        // Two equal columns
  triple:      [4, 4, 4],     // Three equal columns
  fourColumns: [3, 3, 3, 3],  // Four equal columns
  leftWide:    [8, 4],        // Left 2/3, right 1/3
  rightWide:   [4, 8],        // Left 1/3, right 2/3
};
```

Import `LAYOUT_PRESETS` directly if you are building a custom layout picker.

---

## Next.js App Router

The built `dist/index.js` starts with `"use client"`, which marks the entire module as a client bundle for the App Router. No additional configuration is needed when installing from npm.

If you are using the package from a local workspace (not published to npm), add these two settings:

**`next.config.ts`**
```ts
const nextConfig = {
  transpilePackages: ["react-page-builder"],
};
```

**`tsconfig.json`** (path alias pointing at the source)
```json
{
  "compilerOptions": {
    "paths": {
      "react-page-builder": ["./packages/page-builder-core/src/index.ts"]
    }
  }
}
```

---

## Limitations

### No drag-and-drop
Sections and components cannot be reordered by dragging. Reordering requires cloning and deleting, or managing the `value` array directly. Drag-and-drop is not currently implemented.

### No undo/redo
There is no built-in history stack. If you need undo support, manage layout state via the `value` prop and maintain your own history array externally.

### No inline prop editing
The builder does not render a property panel for editing component props. `componentProps` is a static bag passed at layout definition time. To support prop editing, manage component props externally and inject them into `componentProps` in your `value` array.

### Tablet layout is always 2-column
When `tabletBreakpoint` is set, all sections reflow to at most 2 columns per row regardless of their desktop layout. A 3-column section at tablet size becomes a 2-column first row with the third column wrapping to a new row. There is no per-section tablet override.

### No SSR breakpoint matching
Responsive breakpoints are applied client-side via `window.matchMedia`. On the server (SSR/SSG), the desktop layout is always rendered. The correct responsive layout is applied after hydration. This can cause a brief layout flash on mobile on first page load.

### Maximum 4 columns per row (desktop)
The desktop grid supports at most 4 columns per row. Sections with more than 4 columns will overflow into additional rows.

### renderComponent is never serialized
The `renderComponent` field on `ILayoutData` is stripped by `onChange` and `onSaveChange`. Use `componentProps` to carry data that needs to be persisted.

---

## Full Examples

### Example 1 — Default UI with save/reset toolbar

```tsx
"use client"; // Next.js App Router only

import { useRef, useState } from "react";
import { PageBuilder } from "react-page-builder";
import type { ComponentDefinition, PageBuilderHandle, SerializableLayoutItem } from "react-page-builder";

const components: ComponentDefinition[] = [
  { name: "Hero",    label: "Hero",    icon: "🖼️", component: () => <div>Hero</div> },
  { name: "Article", label: "Article", icon: "📝", component: () => <div>Article</div> },
  { name: "Card",    label: "Card",    icon: "🃏", component: () => <div>Card</div> },
];

const initialLayout = [
  { Id: "1", SectionId: "s1", RowIndex: 0, ColumnIndex: 0, ColumnSpan: 12, VerticalIndex: 0, ComponentName: "Hero" },
  { Id: "2", SectionId: "s2", RowIndex: 1, ColumnIndex: 0, ColumnSpan: 6,  VerticalIndex: 0, ComponentName: "Article" },
  { Id: "3", SectionId: "s2", RowIndex: 1, ColumnIndex: 1, ColumnSpan: 6,  VerticalIndex: 0, ComponentName: "Card" },
];

export function App() {
  const ref = useRef<PageBuilderHandle>(null);
  const [editMode, setEditMode] = useState(false);

  const handleSave = (layout: SerializableLayoutItem[]) => {
    localStorage.setItem("layout", JSON.stringify(layout));
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, padding: 8, borderBottom: "1px solid #eee" }}>
        <button onClick={() => ref.current?.reset()}>Reset</button>
        <button onClick={() => setEditMode((m) => !m)}>
          {editMode ? "Done" : "Edit"}
        </button>
        <button onClick={() => ref.current?.save()} style={{ marginLeft: "auto" }}>
          Save
        </button>
      </div>

      <PageBuilder
        ref={ref}
        components={components}
        defaultValue={initialLayout}
        editMode={editMode}
        onEditModeChange={setEditMode}
        onSaveChange={handleSave}
        spacing={16}
        mobileBreakpoint={640}
        tabletBreakpoint={1024}
      />
    </div>
  );
}
```

---

### Example 2 — All render props (fully custom UI)

```tsx
import { useState } from "react";
import { PageBuilder } from "react-page-builder";
import type {
  ComponentDefinition,
  AddTriggerRenderProps,
  LayoutPickerRenderProps,
  SectionControlsRenderProps,
  ComponentPickerRenderProps,
  ComponentControlsRenderProps,
} from "react-page-builder";

const components: ComponentDefinition[] = [/* ... */];

function AddTrigger({ onClick }: AddTriggerRenderProps) {
  return (
    <button
      onClick={onClick}
      style={{ border: "2px dashed #6366f1", borderRadius: 8, padding: "8px 20px" }}
    >
      + Add Section
    </button>
  );
}

function MyLayoutPicker({ presets, onSelectLayout, onClose }: LayoutPickerRenderProps) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div
        style={{ background: "#fff", borderRadius: 12, padding: 24, minWidth: 280 }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ fontWeight: 600, marginBottom: 12 }}>Choose Layout</p>
        {Object.entries(presets).map(([key, cols]) => (
          <button
            key={key}
            onClick={() => { onSelectLayout(cols); onClose(); }}
            style={{ display: "block", width: "100%", padding: "8px 12px", marginBottom: 4, borderRadius: 6, border: "1px solid #e5e7eb", textAlign: "left" }}
          >
            {key} — [{(cols as readonly number[]).join(", ")}]
          </button>
        ))}
        <button onClick={onClose} style={{ marginTop: 8, color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function SectionControls({ onClone, onDelete, onChangeLayout, isLayoutPickerOpen }: SectionControlsRenderProps) {
  return (
    <div style={{ position: "absolute", top: 4, left: 4, zIndex: 20, display: "flex", gap: 4, pointerEvents: "none" }}>
      {[
        { label: "⊞", title: "Layout", action: onChangeLayout, active: isLayoutPickerOpen },
        { label: "⧉", title: "Clone",  action: onClone },
        { label: "✕", title: "Delete", action: onDelete, danger: true },
      ].map(({ label, title, action, active, danger }) => (
        <button
          key={title}
          title={title}
          onClick={(e) => { e.stopPropagation(); action(); }}
          style={{
            pointerEvents: "auto",
            background: active ? "#6366f1" : "#fff",
            color: active ? "#fff" : danger ? "#dc2626" : "#6366f1",
            border: `1px solid ${danger ? "#fca5a5" : "#6366f1"}`,
            borderRadius: 4,
            padding: "2px 8px",
            cursor: "pointer",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function MyComponentPicker({ components, onSelectComponent, onClose }: ComponentPickerRenderProps) {
  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div style={{ position: "fixed", inset: 0 }} onClick={onClose} />
      <div style={{ position: "relative", background: "#fff", borderRadius: 12, padding: 20, minWidth: 260, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
        {components.map((def) => (
          <button
            key={def.name}
            onClick={() => { onSelectComponent(def.name); onClose(); }}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", marginBottom: 4 }}
          >
            <span>{def.icon}</span>
            <span style={{ fontWeight: 500 }}>{def.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ComponentControls({ onClone, onDelete }: ComponentControlsRenderProps) {
  return (
    <div style={{ position: "absolute", top: 4, right: 4, zIndex: 30, display: "flex", gap: 4 }}>
      <button onClick={onClone} style={{ width: 28, height: 28, borderRadius: "50%", background: "#6366f1", color: "#fff", border: "none", cursor: "pointer" }}>⧉</button>
      <button onClick={onDelete} style={{ width: 28, height: 28, borderRadius: "50%", background: "#ef4444", color: "#fff", border: "none", cursor: "pointer" }}>✕</button>
    </div>
  );
}

export function App() {
  const [editMode, setEditMode] = useState(false);

  return (
    <PageBuilder
      components={components}
      editMode={editMode}
      onEditModeChange={setEditMode}
      renderAddTrigger={(p) => <AddTrigger {...p} />}
      renderLayoutPicker={(p) => <MyLayoutPicker {...p} />}
      renderSectionControls={(p) => <SectionControls {...p} />}
      renderComponentPicker={(p) => <MyComponentPicker {...p} />}
      renderComponentControls={(p) => <ComponentControls {...p} />}
    />
  );
}
```

---

### Example 3 — GridLayout standalone (read-only render from server data)

```tsx
import { GridLayout } from "react-page-builder";
import type { ILayoutData } from "react-page-builder";

// Components keyed by ComponentName
const registry: Record<string, React.ComponentType<any>> = {
  Hero: ({ title }) => <div style={{ padding: 24, background: "#f0f4ff" }}>{title}</div>,
  Article: ({ slug }) => <div style={{ padding: 16 }}>Article: {slug}</div>,
  Sidebar: () => <aside style={{ padding: 16, background: "#f9fafb" }}>Sidebar</aside>,
};

function PageRenderer({ layout }: { layout: ILayoutData[] }) {
  const items = layout.map((item) => ({
    ...item,
    renderComponent: () => {
      const Component = registry[item.ComponentName];
      return Component ? <Component {...item.componentProps} /> : <></>;
    },
  }));

  return (
    <GridLayout
      attributes={items}
      columnSpans={items.map((i) => i.ColumnSpan ?? 12)}
      gapPx={24}
      mobileBreakpoint={640}
      tabletBreakpoint={1024}
    />
  );
}
```

---

### Example 4 — Persisting and reloading layout

```tsx
import { useRef, useState } from "react";
import { PageBuilder } from "react-page-builder";
import type { PageBuilderHandle } from "react-page-builder";

const STORAGE_KEY = "my-page-layout";

function App() {
  const ref = useRef<PageBuilderHandle>(null);
  const [editMode, setEditMode] = useState(false);

  const saved = localStorage.getItem(STORAGE_KEY);
  const defaultValue = saved ? JSON.parse(saved) : [];

  return (
    <PageBuilder
      ref={ref}
      components={components}
      defaultValue={defaultValue}
      editMode={editMode}
      onEditModeChange={setEditMode}
      onSaveChange={(layout) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
      }}
    />
  );
}
```
