# TailwindMotionTokens

## Project Overview
A Fluent 2 motion token system for Tailwind CSS v4. Four themed CSS files provide animation primitives and alias tokens that generate `animate-*` utility classes.

A live **preview app** (`preview/`) demonstrates all tokens in action across interactive components and full-page block layouts.

## Repository
https://github.com/trv-ops-sector9/tailwind-motionTokens.git

## Stack
- Tailwind CSS v4 (`@theme` block for utility generation)
- Pure CSS custom properties (no JS, no config) — tokens layer
- React 19 + Vite — preview app only
- Radix UI primitives, shadcn/ui components, Sonner toasts — preview only

---

## Project Structure

```
tokens/
├── theme-fluent2.css      # Canonical Fluent 2 spec (owns :root defaults)
├── theme-balanced.css     # Relaxed pacing, softer curves
├── theme-dense.css        # Compressed durations, minimal transforms
└── theme-expressive.css   # Emotive, larger movement, spring overshoot

preview/
├── src/
│   ├── index.css                       # Motion bridge layer + color theme imports
│   ├── App.tsx                         # Root layout, view routing
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppSidebar.tsx          # Nav + sidebar pickers
│   │   │   └── ThemeSwitcher.tsx       # SidebarThemePicker, SidebarMotionPicker, SidebarSpacingSlider
│   │   ├── gallery/
│   │   │   └── ComponentGallery.tsx    # Interactive token demo: Buttons, Cards, Dialog, Tabs, Accordion, Toasts
│   │   ├── blocks/
│   │   │   ├── DashboardBlock.tsx      # Data table, charts, drawer
│   │   │   ├── SettingsBlock.tsx       # Profile/notifications/appearance forms
│   │   │   ├── AuthBlock.tsx           # Sign-in form with validation
│   │   │   └── MarketingBlock.tsx      # Hero, feature cards, testimonials
│   │   └── ui/                         # shadcn/ui components, all wired to motion tokens
│   └── themes/                         # Color theme CSS files (7 themes)
```

---

## Token Architecture

### Two-Layer Token System
1. **Primitive tokens** — Raw duration + easing values in `:root` / `[data-motion-theme="<name>"]`
   - Duration scale: `--motion-duration-ultra-fast` through `--motion-duration-ultra-slow` (7 stops)
   - Easing curves: 9 Fluent 2 named curves (`accelerate-max` → `linear`)
   - Expressive adds: `--motion-curve-spring` and `--motion-curve-bounce`
2. **Alias tokens** — Inside `@theme {}` so Tailwind v4 generates `animate-*` classes. Each alias references primitives via `var()`, never hardcoded values.

### Enter/Exit Archetypes (12 per theme)
- `fade-in / fade-out`
- `slide-up-in / slide-up-out`
- `slide-down-in / slide-down-out`
- `expand-in / expand-out`
- `collapse-in / collapse-out`
- `page-enter / page-exit`

Enter animations use **decelerate** curves. Exit animations use **accelerate** curves.

### Theme Switching
- `theme-fluent2.css` sets `:root` defaults — it is the baseline.
- Other themes activate via `[data-motion-theme="balanced|dense|expressive"]` attribute set on `document.documentElement`.
- Color themes use a separate `data-theme` attribute, also on `document.documentElement`.
- Themes can coexist — all `@keyframes` are prefixed per theme (e.g. `fluent2-fade-in`, `dense-fade-in`).

### Reduced Motion
Every file includes overrides triggered by both:
- `[data-motion-theme="reduced"]`
- `@media (prefers-reduced-motion: reduce)`

All durations collapse to `1ms`, all transforms removed, all aliases point to a simple fade keyframe.

---

## Motion Bridge Layer (`preview/src/index.css`)

The bridge maps theme-agnostic semantic variables to the active theme's primitives. Components use the semantic vars; switching `data-motion-theme` automatically rewires them.

```css
:root, [data-motion-theme="fluent2"] {
  --motion-curve-press-release: var(--motion-curve-easy-ease);
  --motion-curve-navigation:    var(--motion-curve-decelerate-max);
  --motion-curve-expand-in:     var(--motion-curve-decelerate-mid);
  --motion-curve-expand-out:    var(--motion-curve-accelerate-mid);
  --motion-curve-accordion:     var(--motion-curve-easy-ease);
  --anim-fade-in:               var(--animate-fluent2-fade-in);
  /* ... all 12 archetypes */
}

[data-motion-theme="expressive"] {
  --motion-curve-press-release: var(--motion-curve-bounce);   /* snappy overshoot */
  --motion-curve-navigation:    var(--motion-curve-spring);   /* spring slide */
  --motion-curve-expand-in:     var(--motion-curve-spring);   /* spring pop-in */
  --motion-curve-expand-out:    var(--motion-curve-accelerate-max);
  --motion-curve-accordion:     var(--motion-curve-easy-ease-max); /* strong ease, no overshoot */
  --anim-fade-in:               var(--animate-expressive-fade-in);
  /* ... */
}
```

**Semantic bridge variables:**
| Variable | Used by | Expressive value |
|---|---|---|
| `--motion-curve-press-release` | Button/Card press state | `bounce` |
| `--motion-curve-navigation` | Tab pill slide, Toast enter | `spring` |
| `--motion-curve-expand-in/out` | Dialog, Dropdown, Chevron | `spring` / `accelerate-max` |
| `--motion-curve-accordion` | Accordion height + chevron | `easy-ease-max` |

---

## Component Motion Wiring

### Button (`ui/button.tsx`)
- `[transition-property:color,background-color,border-color,scale]`
- Duration: `--motion-duration-fast`
- Timing: `--motion-curve-press-release` — bouncy on expressive, smooth elsewhere
- Press state: `active:scale-[0.97]`
- **Rule:** Never add `active:scale-*` or `transition-transform` to a `<Button>` callsite — button.tsx owns the press state.

### Card (`ui/card.tsx`)
- `interactive` prop enables hover lift + press compression
- Hover: `translate: 0 -4px`, `box-shadow: --shadow-lg`
- `[transition-property:translate,box-shadow]` — uses `translate` (individual property), NOT `transform`
- Timing: `--motion-curve-navigation`
- CardDemo in gallery uses JS-controlled `onMouseDown/Up/Enter/Leave` with instant press / animated release

### Tabs (`ui/tabs.tsx`)
- Sliding pill indicator using `MutationObserver` + `requestAnimationFrame` (deferred measurement prevents stutter)
- `useLayoutEffect` for initial measurement (no flash on mount)
- Pill: `bg-primary`, active text: `text-primary-foreground`
- Transition duration: `--motion-duration-moderate` (longer than normal for smooth lateral slide)
- Timing: `--motion-curve-navigation`

### Accordion (`ui/accordion.tsx`)
- Content: `accordion-down/up` keyframes (height-based, NOT scale — Radix requires height animation)
- Timing: `--motion-curve-accordion` — **never** uses spring/bounce (height overshoot causes layout glitches)
- Chevron rotation: same `--motion-curve-accordion` variable
- Duration: `--motion-duration-normal` for both open and close

### Dialog (`ui/dialog.tsx`)
- Overlay: `[animation:var(--anim-fade-in/out)]`
- Content: `[animation:var(--anim-expand-in)]` on open, `[animation:var(--anim-collapse-out)]` on close

### Dropdown / Select (`ui/dropdown-menu.tsx`, `ui/select.tsx`)
- Content: `[animation:var(--anim-slide-up-in/out)]`

### Toasts (Sonner via `index.css`)
- Sonner hardcodes `400ms ease` — overridden with `!important`:
  - Enter transform: `--motion-duration-normal` + `--motion-curve-navigation` (spring for expressive)
  - Exit: `--motion-duration-fast` + `--motion-curve-accelerate-mid`

---

## Expressive Theme Details

The expressive theme is meaningfully different, not just faster/bigger:

- **`--motion-curve-spring: cubic-bezier(0.175, 0.885, 0.32, 1.28)`** — easeOutBack style, ~12% overshoot. Used for all enter animations and navigation.
- **`--motion-curve-bounce: cubic-bezier(0.34, 1.72, 0.64, 1)`** — snappier overshoot for press/release interactions.
- All enter keyframes bake in a `scale(0.92–0.96)` start so the spring timing function creates visible overshoot past `scale(1)` as it settles.
- Durations are energetic (fast: 150ms, normal: 250ms, moderate: 330ms) — shorter than fluent2 to feel alive, not sluggish.
- Exit animations are uniformly fast (`--motion-duration-fast`) with `accelerate-max` — gets out of the way quickly.
- Accordion uses `easy-ease-max` for noticeably stronger easing than other themes without any spring/overshoot.

---

## Critical CSS/Tailwind v4 Rules

- **Use `translate` / `scale` individual properties, NOT `transform` shorthand** — Tailwind v4 generates `translate: ...` and `scale: ...` CSS properties. `transition-property: transform` will NOT catch these. Always use `[transition-property:translate,scale,box-shadow]` etc.
- **`@keyframes` can use `transform`** — inside `@keyframes`, `transform: scale()/translateY()` is fine and composes with individual transform properties.
- **`@theme` variables resolve at runtime** — alias tokens in `@theme` that reference `var(--motion-curve-*)` resolve correctly at runtime even though `@theme` is processed at build time.
- **Accordion must use height keyframes** — `accordion-down/up` animate `height` via `--radix-accordion-content-height`. Scale-based animations (like `expand-in`) do not affect height and will not open the accordion.

---

## Color Themes (7)
Located in `preview/src/themes/`:
`default`, `dark-minimal`, `fluent-light`, `fluent-dark`, `bebop-light`, `bebop-dark`, `nova-dark`

Switched via `data-theme` attribute on `document.documentElement`. Independent of motion theme.

## Spacing
`--spacing` CSS variable on `:root` controls all Tailwind v4 spacing utilities (`calc(var(--spacing) * N)`). The sidebar slider adjusts this at runtime, scaling all gap/padding/margin simultaneously.

---

## MarketingBlock — Workspace (second) page

The `WorkspacePage` inside `MarketingBlock.tsx` is a full dashboard demo page. Clicking any element on the marketing landing page navigates to it via a page-transition animation.

### Sections (top to bottom)
1. **Stat cards** — 4-up grid (Total tasks, Completed, Overdue, Contributors)
2. **Active projects + Team** — project list with progress bars / status badges; team roster with active indicators
3. **Weekly velocity + Activity feed** — 2-col row:
   - Velocity: `RadialBarChart` from recharts via `ChartContainer` (5 weekdays, `--chart-1` → `--chart-5`)
   - Activity: icon + text feed with per-event accent colours
4. **Priority queue + Deadlines + By category** — 3-col row:
   - Priority: P0–P3 labelled task list with assignee avatars
   - Deadlines: milestone list with day-countdown pills + linear progress bars
   - By category: horizontal bar chart (CSS only, no recharts)

### Recharts pattern in MarketingBlock
Uses `RadialBarChart` + `RadialBar` with `background` prop. Config follows the same `ChartConfig` / `ChartContainer` pattern as `DashboardBlock`. Chart colors reference `var(--chart-N)` via config keys mapped to `var(--color-<key>)` inside `ChartContainer`.
