# TailwindMotionTokens

## Project Overview
A Fluent 2 motion token system for Tailwind CSS v4. Four themed CSS files provide animation primitives and alias tokens that generate `animate-*` utility classes. No UI, no components — tokens only.

## Repository
https://github.com/trv-ops-sector9/tailwind-motionTokens.git

## Stack
- Tailwind CSS v4 (`@theme` block for utility generation)
- Pure CSS custom properties (no JS, no config)

## Project Structure
```
tokens/
├── theme-fluent2.css      # Canonical Fluent 2 spec (owns :root defaults)
├── theme-balanced.css     # Relaxed pacing, softer curves
├── theme-dense.css        # Compressed durations, minimal transforms
└── theme-expressive.css   # Emotive, larger movement, bounce moments
```

## Architecture

### Two-Layer Token System
1. **Primitive tokens** — Raw duration + easing values in `:root` / `[data-motion-theme="<name>"]`
   - Duration scale: `--motion-duration-ultra-fast` through `--motion-duration-ultra-slow` (7 stops)
   - Easing curves: 9 Fluent 2 named curves (`accelerate-max` → `linear`)
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
- Other themes activate via `[data-motion-theme="balanced|dense|expressive"]` attribute.
- Themes can coexist — all `@keyframes` are prefixed per theme (e.g. `fluent2-fade-in`, `dense-fade-in`).

### Reduced Motion
Every file includes overrides triggered by both:
- `[data-motion-theme="reduced"]`
- `@media (prefers-reduced-motion: reduce)`

All durations collapse to `1ms`, all transforms removed, all aliases point to a simple fade keyframe.

## Notes
- Expressive theme adds `--motion-curve-bounce: cubic-bezier(0.34, 1.56, 0.64, 1)` for expand/collapse "personality moments."
- Fluent 2 easing values are sourced directly from the Fluent UI codebase.
- CSS `var()` substitution is recursive — alias tokens in `@theme` referencing primitive `var()`s resolve correctly at runtime.
