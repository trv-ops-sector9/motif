# Motif — AI Assistant Context

## What this project is

Motif is a **motion token system for Tailwind CSS v4**. It provides four named motion themes (Standard, Dense, Expressive, Precision) as pure CSS files, plus a live preview app that demonstrates all tokens across interactive components and full-page application mock-ups.

The core deliverable is the `tokens/` directory — four CSS files that can be dropped into any Tailwind v4 project. The `preview/` app is a demonstration artifact built in React 19 + Vite.

---

## Project structure

```
tokens/
├── theme-standard.css     # Default. Neutral ease-out, no personality. Sets :root defaults.
├── theme-dense.css        # Compressed durations, minimal transforms
├── theme-expressive.css   # Spring overshoot on enter, bounce on press, fast exits
└── theme-precision.css    # Fade + blur focus control, no transforms, sub-100ms

preview/
├── src/
│   ├── index.css                       # Motion bridge layer + color theme imports
│   ├── App.tsx                         # Root layout, lazy-loaded view routing
│   ├── components/
│   │   ├── layout/                     # AppSidebar, ThemeSwitcher
│   │   ├── gallery/                    # ComponentGallery — interactive token demo
│   │   ├── blocks/                     # Dashboard, Settings, Auth, Marketing pages
│   │   └── ui/                         # shadcn/ui components with motion wiring
│   └── themes/                         # 2 color theme CSS files (OkLCh) — default + dark-minimal
```

---

## Token architecture

**Layer 1 — Primitive tokens** (`:root` and `[data-motion-theme="..."]`)
- 7 duration stops: `--motion-duration-ultra-fast` through `--motion-duration-ultra-slow`
- Easing curves per theme: Standard (3), Dense (3), Expressive (5), Precision (2)
- Focus control tokens: `--motion-blur-radius` (4–16px per theme), `--motion-overlay-opacity` (0.4–0.6)

**Layer 2 — Alias tokens** (`@theme {}` blocks → `animate-*` Tailwind utilities)
- 13 animation archetypes × 4 themes = 52 aliases (12 spatial + overlay-in/out)
- Each alias: `<keyframe-name> <duration-var> <curve-var> both`
- `var()` references resolve at runtime — enables theme switching without recompiling

**13 archetypes:** `fade-in`, `fade-out`, `slide-up-in`, `slide-up-out`, `slide-down-in`, `slide-down-out`, `expand-in`, `expand-out`, `collapse-in`, `collapse-out`, `page-enter`, `page-exit`, `overlay-in`, `overlay-out`

**Theme switching:** `theme-standard.css` sets `:root` baseline. Others activate via `data-motion-theme` attribute. All keyframes are prefixed per theme to avoid collision. `reduced` mode collapses durations to `1ms` and blur to `0`.

---

## Motion bridge layer (`preview/src/index.css`)

Components use semantic intent variables, never theme-specific ones. The bridge maps:
- `--motion-curve-press-release`, `--motion-curve-navigation`, `--motion-curve-expand-in/out`, `--motion-curve-accordion`
- `--anim-fade-in` through all 13 archetypes (including `--anim-overlay-in/out`) → active theme's alias

---

## Conventions

- **Token files:** `theme-<name>.css`. Keyframes: `<theme>-<archetype>`.
- **Transition-property:** Always list individual properties. Never `all`. Never `transform` (Tailwind v4 uses individual `translate`/`scale` properties — `transition-property: transform` silently fails).
- **`@keyframes` can use `transform`** shorthand. The restriction is on `transition-property` only.
- **Accordion:** Must use height keyframes via `--radix-accordion-content-height`. Never spring/bounce — height overshoot causes layout glitches.
- **Button press:** `button.tsx` owns `active:scale-[0.97]`. Don't add scale at callsites.
- **shadcn/ui:** Edit the `ui/` file directly. Motion wiring lives in the component, not callsite props.
- **`!important`:** Only for overriding third-party hardcoded values (Sonner). Not for general use.
- **No JS token system.** CSS only. The portability of plain CSS is intentional.

---

## Stack

| Layer | Technology |
|---|---|
| Tokens | Pure CSS custom properties |
| Tailwind | v4 with `@tailwindcss/vite` |
| Variants | CVA (class-variance-authority) |
| Primitives | Radix UI |
| Components | shadcn/ui + motion wiring |
| Charts | Recharts |
| Toasts | Sonner |
| Tables | TanStack Table |
| Drag & Drop | dnd-kit |
| Icons | Lucide React + Tabler Icons |
| Build | Vite |
| Framework | React 19 |
| Lint | ESLint (flat config) + TypeScript strict |
