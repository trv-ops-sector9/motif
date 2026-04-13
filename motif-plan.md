# Motiif — Plan

## Context

Motiif is a motion token system for Tailwind v4, prepared as a portfolio piece targeting Waabi (Senior Product Designer, Driverless Ops). Ships 4 motion themes and 3 color theme pairs (Graphite, Guchi, Tactical). **Live:** https://trv-ops-sector9.github.io/motiif/

---

## Completed

- [x] Cleanup (dead deps, legacy themes)
- [x] Revise motion themes — Standard, Dense, Expressive, Precision
- [x] Color themes — 3 pairs (Graphite, Guchi, Tactical)
- [x] Fleet Ops dashboard — stat cards, chart, alert feed, vehicle table, Leaflet map
- [x] Shared lib/motion.ts
- [x] UI Polish — sidebar rebrand, page headers, page transitions, stagger animations
- [x] Fleet density pass, token page revision, map redesign
- [x] Token editing (duration sliders with live propagation)
- [x] Sidebar polish — accent picker removed, divider added, spacing normalized
- [x] Deploy — GitHub Pages via Actions
- [x] Icons consolidated to Tabler
- [x] ComponentGallery restructured to 2-column card grid
- [x] Per-theme spacing baked into each theme CSS file
- [x] First impression polish, Gallery polish, Token page flat redesign
- [x] Fleet Ops Mission Control — Leaflet map, incident review, vehicle detail, real coords
- [x] Dashboard, Auth, Settings blocks removed — sidebar renamed to "Demos"
- [x] Brand Demo (Volant EV) — landing page, configurator, page transitions
- [x] Fleet Ops — Seattle Metro, route removal, incident card, dot glow/pulse
- [x] Theme overhaul — replaced Brutalist/Vapor/Drive with Guchi + Tactical (PR #20)
- [x] Mode toggle — split button replaced with inline icon toggle (PR #21)
- [x] Graphite theme — new default, Figma/Cursor aesthetic, borderless surfaces (PR #22)
- [x] Default theme removed from switcher
- [x] Fix fleet map dot glow — tint overlay z-index was hiding markers (PR #23)
- [x] Incident button — calm pill badge + chevron (PR #24)
- [x] Header layout — LIVE indicator next to title, incidents button right-aligned
- [x] README rewritten for portfolio
- [x] CLAUDE.md updated to current state
- [x] Mobile spot-check — sidebar collapse on small screens
- [x] Splash page — modal overlay with section cards, logo mark (PR #25)
- [x] Rename to Motiif + MotiifMark logo (PR #26)
- [x] Choose vehicle from list → centers on map
- [x] Fleet Ops + Brand page polish (PR #27)
- [x] Audit fixes — a11y, reduced motion, map labels, Graphite light (PR #28)
- [x] Favicon + browser tab rename (PR #29)
- [x] Fix map dot glow/pulse on prod — Leaflet SVGAnimatedString prevented pathOptions.className; switched to classList.add via add eventHandler
- [x] Token page — removed draggable sliders, replaced with read-only progress bars; fixed 0ms display bug (Tailwind minifies 100ms→.1s in build; fixed with parseDurationMs helper)
- [x] Repo renamed motif → motiif; Vite base path + remote URL updated
- [x] Portfolio screenshots captured (fleet-ops-graphite-dark, fleet-ops-tactical, tokens-graphite-dark, brand-guchi, components-graphite-dark)

---

## In progress — Portfolio case study screenshots

- [x] Fleet Ops — Graphite Dark, vehicle selected (`fleet-ops-graphite-dark.png`)
- [x] Fleet Ops — Tactical theme (`fleet-ops-tactical.png`)
- [ ] Token page — Graphite Dark, duration bars + easing curves visible
- [ ] Brand demo — car hero, full bleed
- [ ] Component gallery or splash modal

---

## Next — Motiif polish (post-portfolio)

- [ ] **Collapsed sidebar controls** — dark/light mode icon in collapsed state, popout dropdown for theme controls (users on narrow screens can't switch themes)
- [ ] **VehicleList/AlertsPanel keyboard a11y** — clickable rows need `role="button"` + keyboard handlers
- [ ] **Fleet Ops status colors as theme tokens** — hardcoded hex for vehicle status colors, should adapt per theme
- [ ] **Tailwind built-in animations → motion tokens** — `animate-ping` (LIVE dot), `animate-spin` (loading spinner) don't respect motion theme system
- [ ] **Graphite dark lightness** — may need further bump toward true Figma/Cursor canvas values
- [ ] **Brand inner page gallery** — image gallery on configure page
- [ ] **Higher-res car hero image** — current image pixelates at full-bleed on wide screens

## Portfolio (outside this repo)

- [ ] **Screen recording of Motiif** — 2min Loom walkthrough: Fleet Ops, theme switching, token system
- [ ] **Case study page** — long-scroll on portfolio site, hook + Loom + screenshots + token system callout + Waabi connection
- [ ] **Update LinkedIn profile**
- [ ] **Rewrite F2 case study** — frame around fleet management + code-first workflow
- [ ] **Add note about 3D video work**
- [ ] **Motion Token Generator under Experiments (if time)**
- [ ] **CV-style message in About**
- [ ] **Work history**

---

## Key Files

- Token CSS: `tokens/theme-*.css` (4 files)
- Bridge layer: `preview/src/index.css`
- Color themes: `preview/src/themes/*.css` (6 files: 3 pairs)
- ThemeSwitcher: `preview/src/components/layout/ThemeSwitcher.tsx`
- Blocks: `preview/src/components/blocks/*.tsx`
- Gallery: `preview/src/components/gallery/ComponentGallery.tsx`
- Tokens: `preview/src/components/gallery/TokensView.tsx`
- Sidebar: `preview/src/components/layout/AppSidebar.tsx`
- Motion helpers: `preview/src/lib/motion.ts`

## Verification

```bash
cd preview && npm run build && npm run lint
```
