# Cursor Prompt: JustThemeSwitcher Component Library

## Project Setup

Scaffold a **Vite + React + TypeScript + Tailwind CSS v4 + shadcn/ui** app in this directory. No Framer Motion.

```bash
npm create vite@latest . -- --template react-ts
npm install
npm install tailwindcss @tailwindcss/vite
npx shadcn@latest init
```

Configure vite.config.ts with the `@tailwindcss/vite` plugin and `@` path alias. Set up tsconfig paths for `@/*` → `./src/*`.

---

## Architecture Overview

The app has three sections accessed via **sidebar navigation** using **state-based view switching** (no router, no URL changes — just a `useState` or context for the active view):

1. **Component Gallery** — one shadcn component per category, static showcase
2. **Block Pages** — 4 skeletal mock layouts
3. **Theme Switcher** — floating pill, bottom-right corner, always visible

---

## Theme System (CRITICAL — build this first)

### How it works

- A single `@theme` block in `src/index.css` defines the default shadcn tokens so Tailwind v4 generates utility classes (`bg-primary`, `text-foreground`, etc.).
- Theme CSS files live in `src/themes/` and override CSS custom properties using `[data-theme="theme-name"]` attribute selectors.
- All theme files are statically imported into `src/index.css` — no dynamic loading.
- The `<html>` element gets a `data-theme` attribute. Switching themes = changing this attribute.
- No persistence — theme resets to default (shadcn) on page refresh.

### Theme token contract

Each theme file MUST override ALL of these tokens:

**Colors (from shadcn):**
```
--background, --foreground
--card, --card-foreground
--popover, --popover-foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--border, --input, --ring
--sidebar, --sidebar-foreground, --sidebar-primary, --sidebar-primary-foreground
--sidebar-accent, --sidebar-accent-foreground, --sidebar-border, --sidebar-ring
--chart-1 through --chart-5
```

**Fonts:**
```
--font-sans: primary font family
--font-mono: code font family
```

**Radius:**
```
--radius: base border radius (shadcn derives sm/md/lg/xl from this)
```

**Extended tokens (themes CAN override, wire into custom CSS where needed):**
```
--spacing-1 through --spacing-12 (4px base unit scale: 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48)
--letter-spacing-tight, --letter-spacing-normal, --letter-spacing-wide
--line-height-tight, --line-height-normal, --line-height-relaxed
--shadow-sm, --shadow-md, --shadow-lg, --shadow-xl
```

### The 4 theme files

#### 1. `src/themes/default.css` — shadcn default
No overrides needed — the base `@theme` block in index.css IS the default. This file exists only as the identity/fallback and can be empty or contain a `[data-theme="default"]` block that re-states the defaults.

#### 2. `src/themes/dark-minimal.css` — Low-contrast muted dark (Vercel/Linear aesthetic)
```
[data-theme="dark-minimal"] { ... }
```
- Near-black backgrounds (#0a0a0a, #111111)
- Gray-on-gray borders (#1f1f1f, #2a2a2a)
- Desaturated accent colors
- Muted foregrounds (#a1a1a1, #ededed)
- Calm, developer-tool aesthetic
- Font: Inter or system-ui

#### 3. `src/themes/fluent-light.css` — Fluent 2 Light
```
[data-theme="fluent-light"] { ... }
```
Map from Microsoft Fluent 2 `webLightTheme` tokens. Key mappings:
- `--background` ← colorNeutralBackground1 (#ffffff)
- `--foreground` ← colorNeutralForeground1 (#242424)
- `--primary` ← colorBrandBackground (#0f6cbd)
- `--primary-foreground` ← colorNeutralForegroundOnBrand (#ffffff)
- `--secondary` ← colorNeutralBackground3 (#f5f5f5)
- `--muted` ← colorNeutralBackground4 (#f0f0f0)
- `--muted-foreground` ← colorNeutralForeground2 (#616161)
- `--accent` ← colorBrandBackground (#0f6cbd)
- `--destructive` ← colorPaletteRedBackground3 (#c4314b)
- `--border` ← colorNeutralStroke1 (#d1d1d1)
- `--input` ← colorNeutralStroke1 (#d1d1d1)
- `--ring` ← colorBrandStroke1 (#0f6cbd)
- `--radius` ← 4px (Fluent medium corner radius)
- `--font-sans` ← "Segoe UI Variable", "Segoe UI", system-ui, sans-serif
- Spacing: 4px base unit (0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56)
- Shadows: Fluent elevation tokens (two-layer: ambient + key shadow)
  - shadow-sm: `0 2px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`
  - shadow-md: `0 4px 8px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)`
  - shadow-lg: `0 8px 16px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.08)`
  - shadow-xl: `0 16px 28px rgba(0,0,0,0.14), 0 8px 16px rgba(0,0,0,0.10)`

#### 4. `src/themes/fluent-dark.css` — Fluent 2 Dark
```
[data-theme="fluent-dark"] { ... }
```
Map from `webDarkTheme`:
- `--background` ← colorNeutralBackground1 (#292929)
- `--foreground` ← colorNeutralForeground1 (#ffffff)
- `--primary` ← colorBrandBackground (#2886de)
- `--primary-foreground` ← colorNeutralForegroundOnBrand (#ffffff)
- `--secondary` ← colorNeutralBackground3 (#3d3d3d)
- `--muted` ← colorNeutralBackground4 (#333333)
- `--muted-foreground` ← colorNeutralForeground2 (#d6d6d6)
- `--destructive` ← colorPaletteRedBackground3 (#d13438)
- `--border` ← colorNeutralStroke1 (#525252)
- `--card` ← colorNeutralBackground2 (#1f1f1f)
- Same font, spacing, and shadow structure as fluent-light but with adjusted shadow opacities

**All color values should be converted to oklch() format** to match shadcn/Tailwind v4 conventions. Use an oklch converter.

---

## Component Gallery

### Structure
A single page/view with 5 category sections. Each section has a heading and renders ONE shadcn component with a realistic usage example:

| Category | Component(s) | What to show |
|----------|-------------|--------------|
| **Inputs** | `<Input>` + `<Button>` | A text input with a submit button side by side |
| **Display** | `<Card>` | A card with title, description, and action buttons |
| **Overlay** | `<Dialog>` | A button that opens a dialog with form content |
| **Navigation** | `<Tabs>` | 3-tab panel with placeholder content in each |
| **Feedback** | `<Alert>` | Default + destructive variant alerts |

### Install these shadcn components:
```bash
npx shadcn@latest add input button card dialog tabs alert
```

### No "add component" UI
This is a static proof of concept. Components will be added manually in code later. Do NOT build any dynamic component-adding feature.

---

## Block Pages

4 skeletal layout pages with proper structure but placeholder/lorem content. Each page should use whatever additional shadcn components it needs (install them).

### 1. Dashboard
- Sidebar (already part of app shell)
- Top bar with page title and user avatar
- Grid of stat cards (4 across)
- A large placeholder chart area
- A recent activity table or list

### 2. Settings
- Vertical tabs or section nav on the left
- Form sections: Profile (inputs), Notifications (switches/checkboxes), Appearance (radio group)
- Save/cancel buttons at bottom

### 3. Auth
- Centered card layout
- Login form: email input, password input, "Remember me" checkbox, submit button
- "Or continue with" social buttons
- Link to "Sign up" (non-functional)

### 4. Marketing
- Hero section with heading, subtext, CTA button
- Feature grid (3 cards)
- Testimonial or quote block
- Simple footer

Keep each page ~50-80 lines. Use placeholder text. The goal is to see how themes affect real layouts, not to build functional pages.

---

## Sidebar Navigation

- Left sidebar, collapsible
- Grouped links:
  - **Gallery** section: "Components" link
  - **Blocks** section: "Dashboard", "Settings", "Auth", "Marketing" links
- Active state styling
- The sidebar itself is a great theme test surface — pay attention to `--sidebar-*` tokens

Use shadcn's `<Sidebar>` component if available, or build a simple one.

```bash
npx shadcn@latest add sidebar
```

---

## Theme Switcher

- **Always visible**, fixed position, **bottom-right corner**
- **Floating pill** shape — small, rounded, unobtrusive
- Shows current theme name
- Dropdown/select to switch between: Default, Dark Minimal, Fluent 2 Light, Fluent 2 Dark
- On selection: sets `document.documentElement.setAttribute('data-theme', selectedTheme)`
- No localStorage, no persistence
- Use shadcn `<Select>` or `<DropdownMenu>` inside the floating container
- Z-index high enough to float above all content

---

## File Structure

```
src/
├── index.css              # @import "tailwindcss", @theme block, imports theme files
├── App.tsx                # Root: sidebar + view switcher + theme switcher
├── themes/
│   ├── default.css        # [data-theme="default"] (re-states base values)
│   ├── dark-minimal.css   # [data-theme="dark-minimal"]
│   ├── fluent-light.css   # [data-theme="fluent-light"]
│   └── fluent-dark.css    # [data-theme="fluent-dark"]
├── components/
│   ├── ui/                # shadcn output directory — DO NOT MODIFY THESE
│   ├── layout/
│   │   ├── AppSidebar.tsx
│   │   └── ThemeSwitcher.tsx
│   ├── gallery/
│   │   └── ComponentGallery.tsx
│   └── blocks/
│       ├── DashboardBlock.tsx
│       ├── SettingsBlock.tsx
│       ├── AuthBlock.tsx
│       └── MarketingBlock.tsx
├── lib/
│   └── utils.ts           # shadcn cn() utility
└── main.tsx
```

---

## Key Constraints

1. **DO NOT modify files in `src/components/ui/`** — shadcn components stay untouched
2. **No Framer Motion** — no animation library
3. **No React Router** — state-based view switching only
4. **No theme persistence** — resets to default on refresh
5. **No `@fluentui/tokens` npm dependency** — Fluent values are hardcoded in CSS
6. **Tailwind v4 CSS-first config** — no `tailwind.config.js` or `tailwind.config.ts`
7. All theme colors in **oklch() format** to match shadcn/Tailwind v4 conventions
