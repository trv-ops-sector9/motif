# Motif — AI Assistant Context

## What this project is

Motif is a **motion token system for Tailwind CSS v4**. It provides four named motion themes (Fluent 2, Balanced, Dense, Expressive) as pure CSS files, plus a live preview app that demonstrates all tokens across interactive components and full-page application mock-ups.

The core deliverable is the `tokens/` directory — four CSS files that can be dropped into any Tailwind v4 project. The `preview/` app is a demonstration artifact built in React 19 + Vite.

**Repository:** https://github.com/trv-ops-sector9/motif.git

---

## Project structure

```
tokens/
├── theme-fluent2.css      # Canonical Fluent 2 spec. Sets :root defaults.
├── theme-balanced.css     # Relaxed pacing, softer curves
├── theme-dense.css        # Compressed durations, minimal transforms
└── theme-expressive.css   # Spring overshoot on enter, bounce on press, fast exits

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
│   │   │   └── MarketingBlock.tsx      # Landing page → workspace page-transition demo
│   │   └── ui/                         # shadcn/ui components, all wired to motion tokens
│   └── themes/                         # 7 color theme CSS files
```

---

## Token architecture

### Two layers

**Layer 1 — Primitive tokens** (bound to `:root` and `[data-motion-theme="..."]`)
- 7 duration stops: `--motion-duration-ultra-fast` through `--motion-duration-ultra-slow`
- 9 easing curves: all named Fluent 2 cubic-beziers (`accelerate-max`, `accelerate-mid`, `accelerate-min`, `decelerate-max`, `decelerate-mid`, `decelerate-min`, `easy-ease-max`, `easy-ease`, `linear`)
- Expressive adds: `--motion-curve-spring` and `--motion-curve-bounce` (both have overshoot)

**Layer 2 — Alias tokens** (inside `@theme {}` blocks, generates `animate-*` Tailwind utilities)
- 12 animation archetypes × 4 themes = 48 aliases total
- Each alias is a complete animation shorthand: `<keyframe-name> <duration-var> <curve-var> both`
- Duration and curve values are `var()` references — they resolve at runtime, not build time
- This is what enables runtime theme switching without recompiling CSS

### 12 archetypes per theme
`fade-in`, `fade-out`, `slide-up-in`, `slide-up-out`, `slide-down-in`, `slide-down-out`, `expand-in`, `expand-out`, `collapse-in`, `collapse-out`, `page-enter`, `page-exit`

Enter animations use decelerate curves. Exit animations use accelerate curves. This mirrors Fluent 2 directionality spec.

### Theme switching
- `theme-fluent2.css` sets `:root` — it is always the baseline.
- Other themes activate via `[data-motion-theme="balanced|dense|expressive"]` on `document.documentElement`.
- All `@keyframes` are prefixed per theme (`fluent2-fade-in`, `dense-fade-in`, etc.) so themes coexist without collision.
- `[data-motion-theme="reduced"]` and `@media (prefers-reduced-motion: reduce)` both collapse all durations to `1ms` and remove all transforms. Every theme file implements this.

---

## The motion bridge layer (`preview/src/index.css`)

Components never reference theme-specific curve variables. They use semantic intent variables that the bridge layer maps to the active theme's primitives.

**Semantic variables:**

| Variable | Purpose | Fluent 2 value | Expressive value |
|---|---|---|---|
| `--motion-curve-press-release` | Button/card tap feedback | `easy-ease` | `bounce` (overshoot) |
| `--motion-curve-navigation` | Tab pill slide, toast enter | `decelerate-max` | `spring` (overshoot) |
| `--motion-curve-expand-in` | Dialog, dropdown open | `decelerate-mid` | `spring` |
| `--motion-curve-expand-out` | Dialog, dropdown close | `accelerate-mid` | `accelerate-max` |
| `--motion-curve-accordion` | Accordion height + chevron | `easy-ease` | `easy-ease-max` |
| `--anim-fade-in` (and all 12 archetypes) | Maps to active theme's alias | `var(--animate-fluent2-fade-in)` | `var(--animate-expressive-fade-in)` |

The bridge also maps each of the 12 `--anim-*` shorthand variables to the correct theme alias, so components use `animation: var(--anim-fade-in)` and the bridge decides which theme's keyframe plays.

---

## Component motion wiring — key details

### Button (`ui/button.tsx`)
```
[transition-property:color,background-color,border-color,scale]
[transition-duration:var(--motion-duration-fast)]
[transition-timing-function:var(--motion-curve-press-release)]
active:scale-[0.97]
```
**Rule:** Never add `active:scale-*` or `transition-transform` at a callsite. `button.tsx` owns press state. Adding scale at the callsite will conflict.

### Card (`ui/card.tsx`)
- `interactive` prop enables hover lift + press compression
- Hover: `translate: 0 -4px`, `box-shadow: --shadow-lg`
- Uses `[transition-property:translate,box-shadow]` — NOT `transition-property:transform`
- Timing: `--motion-curve-navigation`
- Gallery CardDemo uses JS `onMouseDown/Up/Enter/Leave` for instant press / animated release (intentional — feels more responsive than CSS-only)

### Tabs (`ui/tabs.tsx`)
- Sliding pill indicator via `MutationObserver` + `requestAnimationFrame`
- `useLayoutEffect` for initial measurement (synchronous, prevents flash on mount)
- Subsequent changes deferred via rAF (prevents measurement race with DOM updates)
- Pill: `bg-primary`. Active text: `text-primary-foreground`
- Transition: `--motion-duration-moderate` + `--motion-curve-navigation`

### Accordion (`ui/accordion.tsx`)
- Animates `height` via `--radix-accordion-content-height` CSS custom property (set by Radix)
- Uses `accordion-down/up` keyframes, NOT `expand-in/out`
- **Never use spring or bounce here** — height overshoot causes visible layout glitches
- `--motion-curve-accordion` is deliberately excluded from spring on expressive theme; uses `easy-ease-max` instead

### Dialog (`ui/dialog.tsx`)
- Overlay: `animation: var(--anim-fade-in)` / `var(--anim-fade-out)`
- Content: `animation: var(--anim-expand-in)` on open, `animation: var(--anim-collapse-out)` on close
- Uses Radix `data-state` attributes to trigger animations

### Dropdown / Select (`ui/dropdown-menu.tsx`, `ui/select.tsx`)
- Content: `[animation:var(--anim-slide-up-in/out)]`

### Toasts (Sonner via `index.css`)
- Sonner hardcodes `transition: all 400ms ease` internally
- Overridden with `!important` in index.css targeting Sonner's CSS variables
- Enter: `--motion-duration-normal` + `--motion-curve-navigation` (spring for expressive)
- Exit: `--motion-duration-fast` + `--motion-curve-accelerate-mid`

---

## Critical CSS/Tailwind v4 rules

**Individual transform properties.** Tailwind v4 generates `translate` and `scale` as individual CSS properties. `transition-property: transform` will NOT intercept them. Always use `[transition-property:translate,scale,box-shadow]` etc. This is a silent failure mode — the transition appears to do nothing.

**`@keyframes` can use `transform`.** Inside `@keyframes` blocks, `transform: scale() translateY()` is correct and composes with individual transform properties. The restriction is on `transition-property`, not on keyframe declarations.

**`@theme` variables resolve at runtime.** Alias tokens in `@theme {}` that reference `var(--motion-curve-*)` work correctly at runtime even though `@theme` is processed at build time. This is what makes runtime theme switching work.

**Accordion must use height keyframes.** Radix Accordion measures and sets `--radix-accordion-content-height` on the content element. Animating `scale` will not open the accordion — the height stays at its measured value. The `accordion-down/up` keyframes animate `height` from `0` to `var(--radix-accordion-content-height)`.

**Expressive keyframes bake in initial scale.** Expressive enter keyframes start at scale(0.80–0.96) so the spring timing function has room to overshoot scale(1). Without an initial scale below 1, a spring curve landing at 1.0 shows no visible overshoot.

---

## Expressive theme details

The expressive theme is meaningfully different, not just faster/bigger:

- **`--motion-curve-spring: cubic-bezier(0.175, 0.885, 0.32, 1.28)`** — easeOutBack style, ~12% overshoot. Used for all enter animations and navigation.
- **`--motion-curve-bounce: cubic-bezier(0.34, 1.72, 0.64, 1)`** — snappier overshoot for press/release interactions.
- All enter keyframes bake in a `scale(0.80–0.96)` start so the spring timing function creates visible overshoot past `scale(1)` as it settles.
- Durations are energetic (fast: 150ms, normal: 250ms, moderate: 330ms) — shorter than fluent2 to feel alive, not sluggish.
- Exit animations are uniformly fast (`--motion-duration-fast`) with `accelerate-max` — gets out of the way quickly.
- Accordion uses `easy-ease-max` for noticeably stronger easing than other themes without any spring/overshoot.

---

## Color themes

7 themes in `preview/src/themes/`: `default`, `dark-minimal`, `fluent-light`, `fluent-dark`, `bebop-light`, `bebop-dark`, `nova-dark`.

All use OkLCh color space. Each defines: background, foreground, card, primary, secondary, accent, destructive, border, input, ring, sidebar variants, chart colors (`--chart-1` through `--chart-5`), and shadows (sm/md/lg/xl).

Switched via `data-theme` attribute on `document.documentElement`. Completely independent of motion theme. Both coexist.

---

## Preview app — the four block views

### ComponentGallery (`/components`)
Interactive showcase of every UI component with live prop controls. Demonstrates: Button (variants, sizes, states, icons), Card (standard + interactive), Dialog, Tabs (sliding pill), Accordion, Toasts, Dropdown, Select, Radio, Checkbox, Switch, Toggle, Badge, Avatar, Tooltip.

### DashboardBlock (`/dashboard`)
Revenue stat cards, draggable/sortable data table (dnd-kit + TanStack Table), line area chart (recharts), drawer trigger.

### SettingsBlock (`/settings`)
Tabbed form: Profile, Notifications, Appearance. Form controls with save state machine (idle → saving → saved with toast feedback).

### AuthBlock (`/auth`)
Sign-in form with email/password validation, password visibility toggle, loading + success states.

### MarketingBlock (`/marketing`)
Two views connected by a page-enter animation:
1. **Landing page** — hero, 3 feature cards, 2 testimonials, CTAs
2. **WorkspacePage** (triggered by clicking landing page elements):
   - Stat cards (Total tasks, Completed, Overdue, Contributors)
   - Active projects list with progress bars + team roster
   - 2-col row: weekly velocity `RadialBarChart` (recharts) + activity feed
   - 3-col row: priority queue (P0–P3 tasks with avatars) + deadlines (milestone list with countdown pills) + by-category horizontal bar chart (CSS-only, no recharts)

---

## Sidebar controls

**Motion theme picker** — sets `data-motion-theme` on `document.documentElement`. Options: Fluent 2, Balanced, Dense, Expressive, Reduced.

**Color theme picker** — sets `data-theme` on `document.documentElement`. Options: 7 themes.

**Spacing slider** — sets `--spacing` CSS variable on `:root` (0.20–0.35rem, default 0.25rem). Scales all Tailwind spacing utilities globally (gap, padding, margin, width/height). Labels: Compact / Default / Spacious.

---

## Stack

| Layer | Technology |
|---|---|
| Tokens | Pure CSS custom properties |
| Tailwind | v4 with `@tailwindcss/vite` plugin |
| Component variants | CVA (class-variance-authority) |
| Primitives | Radix UI |
| Components | shadcn/ui (with motion wiring added) |
| Charts | Recharts |
| Toasts | Sonner |
| Tables | TanStack Table (React) |
| Drag & Drop | dnd-kit |
| Icons | Lucide React + Tabler Icons |
| Build | Vite |
| Framework | React 19 |
| Validation | Zod |

---

## What's working well

- Runtime theme switching with no CSS recompilation — genuinely clean DX
- Semantic bridge variable pattern — components are fully theme-agnostic
- Reduced motion handling — both media query and data attribute work correctly
- Expressive spring/bounce curves — visible and distinct without being distracting
- MutationObserver + rAF tabs pattern — smooth with no measurement flicker
- Recharts chart colors wired to CSS custom properties — theme-aware charts
- Height animation on accordion — correct approach for Radix-managed height
- All 4 block views render with appropriate animations for every theme

## What still needs work

- **Workspace back navigation** — from WorkspacePage back to the landing page is missing; there's a page-enter animation in but no page-exit out
- **MarketingBlock chart labels** — RadialBarChart lacks axis/legend labels
- **Mobile responsiveness** — Preview app has some container queries but isn't fully tuned for small screens
- **Token documentation** — no standalone usage guide for the tokens themselves (beyond this file and README.md)
- **No TypeScript types for token values** — `type MotionTheme = "fluent2" | "balanced" | "dense" | "expressive" | "reduced"` would be useful for consumer projects
- **preview/package.json name** is `tailwind-motion-tokens-preview` — left over from original project name, should be updated to `motif-preview`

---

## Conventions

- **Token file naming** — `theme-<name>.css`. Always prefix with `theme-`.
- **Keyframe naming** — `<theme>-<archetype>` (e.g. `expressive-expand-in`). Never share keyframes across themes — keeps files self-contained and predictable.
- **Semantic variable naming** — `--motion-curve-<intent>` for curves, `--anim-<archetype>` for animation shorthands.
- **Component transition-property** — always list individual properties explicitly. Never `transition-property: all`. Never `transition-property: transform`.
- **Accordion rule** — never use spring or bounce on height animations. `--motion-curve-accordion` is a hard constraint.
- **Button press state** — `button.tsx` owns `active:scale-[0.97]`. Do not add scale to callsites.
- **shadcn/ui components** — prefer editing the file in `ui/` over wrapping. Motion wiring lives in the component file, not on callsite class props.
- **`!important`** — only used where third-party libraries (Sonner) hardcode values that cannot be overridden otherwise. Not for general use.
- **No JS token system** — tokens are CSS only. If you're tempted to add a token generator, don't. The portability and simplicity of plain CSS is intentional.
