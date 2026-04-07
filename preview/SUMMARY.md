# JustThemeSwitcherComLibrary

A local component library and design-system playground built with React, Tailwind CSS v4, and shadcn/ui primitives. Its primary purpose is to let you preview UI components and page-level blocks across multiple visual themes in real time — no page reload, no config change, just a dropdown.

---

## What It Is

A Vite + React + TypeScript dev app that renders a curated set of UI components and realistic page "blocks" (dashboard, settings, auth, marketing) alongside a floating theme switcher. Switching themes instantly repaints every token-driven color, radius, font, and shadow across the entire UI.

It is not a published npm package — it is a personal reference environment for building, testing, and comparing theme systems.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Bundler | Vite 6 |
| Framework | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Primitives | Radix UI (via shadcn/ui component shells) |
| Icons | Lucide React |

---

## How Theming Works

The entire theming system is built on three cooperating layers — no React context, no runtime JS theme logic beyond a single `setAttribute` call.

### Layer 1 — CSS custom properties per theme

Each theme lives in its own file under `src/themes/`. A theme is a single CSS rule block scoped to a `[data-theme="…"]` attribute selector, overriding a fixed set of design tokens:

```
src/themes/
  default.css        ← shadcn/ui default (light, achromatic)
  dark-minimal.css   ← dark, achromatic
  fluent-light.css   ← Microsoft Fluent 2, blue, light
  fluent-dark.css    ← Microsoft Fluent 2, blue, dark
  bebop-light.css    ← Microsoft Copilot–inspired, violet, light
  bebop-dark.css     ← Microsoft Copilot–inspired, violet, dark
```

Every file defines the same ~35 tokens: `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, five `--sidebar-*` pairs, five `--chart-*` colors, `--radius`, `--font-sans`, `--font-mono`, and four `--shadow-*` scales.

### Layer 2 — Tailwind v4 `@theme inline` bridge

`src/index.css` imports all theme files then maps every custom property into Tailwind's design system via `@theme inline`:

```css
@theme inline {
  --color-primary: var(--primary);
  --color-background: var(--background);
  --radius-lg: var(--radius);
  /* …and so on for every token */
}
```

This means Tailwind utility classes like `bg-primary`, `text-muted-foreground`, `ring-ring`, and `rounded-lg` automatically track whatever theme is active — no class-name juggling.

### Layer 3 — ThemeSwitcher sets `data-theme` on `<html>`

`src/components/layout/ThemeSwitcher.tsx` renders a floating pill (bottom-right) with a `<Select>` dropdown. On change it calls:

```ts
document.documentElement.setAttribute("data-theme", value);
```

That single attribute swap causes the correct `[data-theme="…"]` rule block to win the cascade, overriding `:root` defaults, and the whole UI repaints instantly through Tailwind's variable bindings.

---

## App Structure

```
src/
  App.tsx                          ← Root layout: sidebar + main + theme switcher
  main.tsx                         ← React entry point
  index.css                        ← Tailwind imports, @theme inline bridge, base layer
  themes/                          ← One CSS file per theme
  lib/
    utils.ts                       ← cn() helper (clsx + tailwind-merge)
  components/
    layout/
      AppSidebar.tsx               ← Collapsible sidebar, nav between views
      ThemeSwitcher.tsx            ← Floating dropdown, sets data-theme on <html>
    gallery/
      ComponentGallery.tsx         ← Showcases individual UI primitives
    blocks/
      DashboardBlock.tsx           ← Realistic dashboard page layout
      SettingsBlock.tsx            ← Settings / preferences page layout
      AuthBlock.tsx                ← Sign-in / sign-up page layout
      MarketingBlock.tsx           ← Landing / marketing page layout
    ui/
      button, card, input, select, dialog, tabs, badge,
      avatar, checkbox, switch, radio-group, table,
      calendar, tooltip, alert, label, separator …
```

### Views

| View | What it shows |
|---|---|
| **Components** | Individual shadcn/ui primitives in a gallery layout |
| **Dashboard** | Charts, stats, data table — a typical SaaS inner page |
| **Settings** | Form-heavy preferences page |
| **Auth** | Login/signup screens |
| **Marketing** | Hero, features, CTA — a public-facing landing page |

---

## Themes Reference

| Theme key | Style | Primary hue | Radius |
|---|---|---|---|
| `default` | shadcn default, achromatic light | — | 10px |
| `dark-minimal` | Achromatic dark | — | 10px |
| `fluent-light` | Microsoft Fluent 2, light | Blue 247° | 4px |
| `fluent-dark` | Microsoft Fluent 2, dark | Blue 247° | 4px |
| `bebop-light` | Microsoft Copilot–inspired, light | Violet 291° | 8px |
| `bebop-dark` | Microsoft Copilot–inspired, dark | Violet 291° | 8px |

---

## Adding a New Theme

1. Create `src/themes/your-theme.css` with a `[data-theme="your-theme"]` block. Copy any existing theme as a template and adjust the token values.
2. Add `@import "./themes/your-theme.css";` to `src/index.css`.
3. Add `{ value: "your-theme", label: "Your Theme Label" }` to the `THEMES` array in `src/components/layout/ThemeSwitcher.tsx`.

No other changes are needed.

---

## Running Locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. The theme switcher is in the bottom-right corner.
