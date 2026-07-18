# CWC Portfolio — Project Status & Documentation

**Last updated:** July 10, 2026 (evening session)
**Version:** v1.2.0
**Live URL:** [charleswclark.com](https://www.charleswclark.com)
**Repository:** GitHub → Vercel (auto-deploys on push to `main`)

---

## Table of Contents

1. [What This Is](#what-this-is)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [How to Run Locally](#how-to-run-locally)
5. [How to Deploy](#how-to-deploy)
6. [Content Management (Sanity)](#content-management-sanity)
7. [Site Architecture](#site-architecture)
8. [Component Map](#component-map)
9. [Design System](#design-system)
10. [Responsive Breakpoints](#responsive-breakpoints)
11. [Animations & Interactions](#animations--interactions)
12. [Canvas Layout Engine](#canvas-layout-engine)
13. [Backup System](#backup-system)
14. [Full Changelog](#full-changelog)
15. [Current State](#current-state)
16. [Known Issues](#known-issues)
17. [Next Steps](#next-steps)
18. [Terminal Commands Reference](#terminal-commands-reference)

---

## What This Is

A portfolio website for Charlie Clark — multidisciplinary designer and art director. The site is built around a canvas-style interface where project cards scatter like photos tossed on a table. Visitors pan, zoom, and click cards to explore work across three categories: Work, Photography, and Playground.

The site opens with a full-screen hero/landing page (Mont Blanc typographic style), then scrolls down into the interactive canvas. A command module at the bottom lets visitors filter, navigate, and discover easter eggs.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) |
| CMS | Sanity v3 (Studio + Content Lake) |
| Hosting | Vercel (Hobby plan) |
| Fonts | Geist Sans + Geist Mono (WOFF2, self-hosted) |
| Images | next/image with Sanity CDN |
| Styling | Inline styles + CSS keyframes (no Tailwind in production) |

**Sanity details:**
- Project ID: `smatdclo`
- Dataset: `site` (private — requires auth token)
- Studio URL: deployed via `npx sanity deploy`

---

## Project Structure

```
~/Documents/cwc/
├── web/                          # Next.js app
│   ├── app/
│   │   ├── page.tsx              # Homepage — fetches all Sanity data
│   │   ├── layout.tsx            # Root layout, fonts, metadata
│   │   ├── globals.css           # Keyframes, media queries
│   │   ├── not-found.tsx         # Custom 404
│   │   ├── robots.ts             # Robots.txt generation
│   │   ├── sitemap.ts            # Sitemap generation
│   │   ├── work/[slug]/page.tsx  # Individual work SEO pages
│   │   └── photo/[slug]/page.tsx # Individual photo SEO pages
│   ├── components/
│   │   ├── HomeClient.tsx        # Main UI orchestrator
│   │   ├── Canvas.tsx            # Pan/zoom card canvas
│   │   ├── Terminal.tsx          # Command module
│   │   ├── LocationClock.tsx     # Clock + location panel
│   │   ├── InfoModal.tsx         # About/contact modal
│   │   ├── ProjectDetailModal.tsx# Project detail view
│   │   ├── MobileLayout.tsx      # Phone layout (accordion)
│   │   └── PasswordGateModal.tsx # Password protection
│   ├── lib/
│   │   ├── sanity.ts             # Sanity client + GROQ queries
│   │   ├── canvasLayout.ts       # Layout math engine
│   │   ├── useScrambleText.ts    # Typewriter decode hook
│   │   └── fonts.ts              # Font loading
│   ├── public/                   # Static assets, favicon
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── .env.local                # Sanity token (not in git)
├── schemaTypes/                  # Sanity schemas
│   ├── project.js                # Work projects
│   ├── photography.js            # Photo entries
│   ├── playground.js             # Playground items
│   ├── about.js                  # About/hero content
│   ├── settings.js               # Site settings
│   └── index.js                  # Schema registry
├── scripts/
│   └── backup.sh                 # Backup/restore system
├── .backups/                     # Timestamped backups (gitignored)
├── sanity.config.js              # Sanity Studio config
├── sanity.cli.js                 # Sanity CLI config
├── package.json                  # Root (Sanity Studio deps)
└── PROJECT-STATUS.md             # This file
```

---

## How to Run Locally

You need two terminal windows:

**Terminal 1 — Website:**
```bash
cd ~/Documents/cwc/web && npm run dev
```
Opens at `localhost:3000`

**Terminal 2 — Sanity Studio:**
```bash
cd ~/Documents/cwc && npm run dev
```
Opens at `localhost:3333`

---

## How to Deploy

**Website (Vercel):**
```bash
cd ~/Documents/cwc && git add -A && git commit -m "your message" && git push
```
Vercel auto-deploys from `main` branch. Takes about 40–50 seconds.

**Sanity Studio:**
```bash
cd ~/Documents/cwc && npx sanity deploy
```
This deploys the Studio interface (where you edit content). Content changes in Studio are live immediately — no deploy needed for content.

---

## Content Management (Sanity)

All site content is managed through Sanity Studio. No code changes needed for content updates.

### Content Types

| Type | What It Is | Fields |
|------|-----------|--------|
| **Work** | Design projects | Title, slug, year, client, role, tags, description, cover image, gallery, private toggle |
| **Photography** | Photo entries | Title, slug, year, description, cover image, gallery, private toggle |
| **Playground** | Experiments/side projects | Title, slug, year, tags, description, cover image, gallery, external URL, private toggle |
| **About** | Hero + info panel content | Headline, bio, roles, location, email, timezone, GPS coords, hero text, availability |
| **Settings** | Site-wide config | Password toggle, password value, command module visibility/labels |

### How Content Flows

1. You create/edit content in Sanity Studio
2. The website fetches fresh data on every page load (`force-dynamic` mode)
3. No rebuild or deploy needed — changes appear within seconds
4. Unpublishing a card automatically closes gaps in the canvas layout

### About & Settings

These are **singleton** documents in Sanity — you can't delete or duplicate them. They control:

- **About:** Everything on the hero landing page (name, roles, bio, tagline) and the info modal (headline, bio, current role, location, email). Also controls the LocationClock data (city, country, timezone, GPS coordinates).
- **Settings:** Password gate (toggle + password field) and command module configuration (show/hide individual buttons, custom labels, placeholder text, hint text).

---

## Site Architecture

### Page Flow

```
Hero Landing Page (full viewport)
    ↓ scroll or click "View Work"
Canvas Section (sticky, full viewport)
    ├── Header (CLARK logo)
    ├── Canvas (pan/zoom/click cards)
    ├── Terminal (command module, bottom center)
    ├── LocationClock (bottom right, desktop only)
    └── Version indicator (bottom left)
```

### Data Flow

```
Sanity Content Lake
    ↓ GROQ queries (server-side)
page.tsx (Server Component)
    ↓ props
HomeClient.tsx (Client Component — orchestrator)
    ├── Canvas.tsx (card rendering + interactions)
    ├── Terminal.tsx (command input + chips)
    ├── LocationClock.tsx (clock + location)
    ├── InfoModal.tsx (about panel)
    ├── ProjectDetailModal.tsx (project detail)
    └── MobileLayout.tsx (phone-only accordion)
```

### Rendering Strategy

- `force-dynamic` export on `page.tsx` — every request fetches fresh from Sanity
- `useCdn: false` — required because the dataset is private
- GROQ queries filter out drafts: `!(_id in path("drafts.**"))`
- Descriptions are Portable Text in Sanity, normalized to plain strings via `normalizeDesc()`

---

## Component Map

### HomeClient.tsx — The Orchestrator

The brain of the site. Manages:

- **Screen mode:** mobile / tablet / desktop detection with hydration-safe mounting
- **Scroll tracking:** Hero → Canvas transition with snap behavior
- **Command handling:** Routes terminal commands to the right action
- **Easter eggs:** Unknown commands trigger card-fall animation + witty messages (40 quips + 60 rotating design quotes/facts)
- **State:** Active filter, selected item, password gate, fallen cards, past-hero flag

### Canvas.tsx — The Interactive Canvas

Pan/zoom card surface. Card states:

- **Pile:** Cards start jumbled in a casual stack (initial load)
- **Organized:** Cards spread into categorized clusters (after first command)
- **Filtered:** Only one category visible, others fade to 5% opacity
- **Fallen:** Cards tumble off screen (unknown command easter egg)

Interactions: mouse drag to pan, scroll wheel to zoom, single-finger touch pan, two-finger pinch zoom, click/tap to open project detail.

### Terminal.tsx — Command Module

Fixed bottom-center input with command chips. Features:

- Typewriter scramble animation on all text (using shared `useScrambleText` hook)
- Collapse/expand toggle
- 3-column chip grid (drops to 2 columns on narrow tablets)
- Active state highlighting on filtered category
- Configurable via Sanity Settings

### LocationClock.tsx — Data Panel

Bottom-right fixed panel showing:

- Rotating availability message (mailto link, cycles every 12 seconds)
- Live clock in configured timezone
- City, Country
- GPS coordinates
- All text has scramble-decode animation on load
- Hidden on tablets via CSS

### ProjectDetailModal.tsx — Project Detail

Swiss-style layout with:

- 25/75 split sections (stacks on narrow screens via flexWrap)
- Section labels: (01) Project overview, (02) Details
- Metadata table (services, client, role, year)
- Gallery with paired images + divider lines
- Researched stats/facts for select projects

### MobileLayout.tsx — Phone Layout

Accordion-based layout for screens under 480px:

- Sticky header with hamburger menu
- "Visit on desktop" notice
- Year-grouped accordion sections per category
- Slide-in drawer menu with category navigation
- Same modals (Info, ProjectDetail, PasswordGate)

---

## Design System

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#FAFAFB` | Page, canvas, cards |
| Foreground | `#18181B` | Primary text, headings |
| Secondary | `#58565D` | Body text, descriptions |
| Muted | `#9B9AA0` | Labels, metadata |
| Faint | `#C4C3C8` | GPS coords, timestamps |
| Border | `#E5E4E6` | Dividers, card borders |
| Surface | `#ECEBEE` | Chips, buttons, hover states |
| Link | `#4D80E6` | Email links |

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Hero name | Geist Grotesk | 700 | clamp(4rem, 12vw, 9rem) |
| Hero roles | Geist Grotesk | 700 | clamp(1.5rem, 4vw, 2.75rem) |
| Modal headline | Geist Grotesk | 700 | clamp(2rem, 4vw, 3rem) |
| Body text | Geist Grotesk | 400–500 | 0.875rem–1rem |
| Mono labels | Geist Mono | 400–500 | 0.5rem–0.8125rem |
| Card labels | Geist Mono | 500 | 0.6875rem |

### Card Sizing

Cards scale by year — newer projects are bigger and more vivid:

- Width: 130px (2011) → 260px (2025)
- Aspect ratio: 16:9
- Opacity: 68% (old) → 100% (new)
- Grayscale: 35% (old) → 0% (new)
- Shadow: none (old) → elevated (new)
- Z-index: 0 (old) → 100 (new)

---

## Responsive Breakpoints

| Mode | Width | Layout | Key Differences |
|------|-------|--------|----------------|
| **Mobile** | ≤480px | MobileLayout (accordion) | No canvas, hamburger menu, year-grouped lists |
| **Tablet** | 481–1024px | Canvas (same as desktop) | Tighter hero padding (24px), LocationClock hidden, terminal grid 2-col below 680px |
| **Desktop** | >1024px | Full experience | All features visible |

### Hydration Safety

The server always renders the desktop layout. After React hydrates on the client, a `mounted` flag enables the mobile check. This prevents a React hydration crash (error #300) that would occur if the server rendered desktop but the client immediately swapped to MobileLayout.

Additionally, all `useScrambleText` hooks must be called **before** the `if (isMobile) return <MobileLayout />` early exit in HomeClient.tsx. React requires hooks to run in the same order every render — if hooks are called after a conditional return, the hook count changes when `isMobile` flips, and React crashes. The scramble text values are computed but simply unused when the mobile path renders.

### Responsive Units Used

- `clamp()` for font sizes and spacing
- `min()` for component widths (e.g., LocationClock, Terminal, drawer)
- `vw` units for relative sizing
- CSS media queries in `globals.css` for structural changes

---

## Animations & Interactions

### CSS Keyframes (globals.css)

| Animation | Duration | What It Does |
|-----------|----------|-------------|
| `card-float` | 6–13s per card | Gentle ambient drift (staggered per card) |
| `card-wiggle` | 0.5s | Hover wobble + slight scale up |
| `card-fall` | 0.6–1.1s | Cards tumble off screen (easter egg) |
| `hero-bounce` | 2s | "View Work" button pulse |
| `modal-backdrop-in` | 0.25s | Modal overlay fade in |
| `modal-content-in` | 0.3s | Modal slide up + fade |
| `skeleton-pulse` | infinite | Image loading placeholder |

### Scramble Text Animation

Shared `useScrambleText` hook creates a typewriter-decode effect. Random characters resolve to the target string over time. Used on:

- Hero name, roles, bio, tagline
- LocationClock (city, coords, availability)
- Terminal (placeholder, labels, chips)

Each instance has a staggered delay for a cascading reveal effect.

### Card State Transitions

All card transitions use `0.55s ease-out` for position, `0.45s ease` for opacity/transform. This creates smooth, organic movement when:

- Filtering categories (matching cards move to center, others fade)
- Resetting view (cards return to pile)
- Easter egg fall (each card has unique delay + rotation)

---

## Canvas Layout Engine

**File:** `web/lib/canvasLayout.ts`

### How Cards Get Positioned

1. **Sizing:** `sizeAndDepth(year)` assigns width, height, opacity, grayscale, shadow, z-index based on project year
2. **Grid:** Cards sort by year (newest first), placed in a loose grid with `cols = ceil(sqrt(count * 1.8))`
3. **Jitter:** Each card gets seeded random offset from grid center (25% of cell size)
4. **Overlap nudge:** If a card overlaps a previously placed card by >30px in both axes, it shifts away
5. **Gap closing:** After all cards are placed, scans for large horizontal/vertical gaps and shifts cards inward to close them (so unpublishing cards doesn't leave holes)

### Layout Modes

| Mode | Function | When |
|------|----------|------|
| `computeLayout` | Full scatter with category clusters | Default organized view |
| `computeFilteredLayout` | Single category centered | After filter command |
| `computePileLayout` | Jumbled stack at centroid | Initial load + reset |
| `centerOn` | Calculate pan/scale to frame items | Every layout change |

### Seeded Randomness

All randomness is seeded from the card's Sanity document ID (`seedFromId`). This means:

- Same card always gets the same position, rotation, and animation timing
- Layout is consistent across page loads
- Adding/removing cards only affects their own positions

---

## Backup System

**Script:** `~/Documents/cwc/scripts/backup.sh`

### Commands

```bash
# Save a backup (timestamp-only label)
cd ~/Documents/cwc && ./scripts/backup.sh save

# List all backups
cd ~/Documents/cwc && ./scripts/backup.sh list

# Restore a specific backup (creates emergency backup first)
cd ~/Documents/cwc && ./scripts/backup.sh restore 20260710_081007
| `20260715_083402` | Post-v1.3.0 Grok handoff & scope wrangler verification |
```

### What Gets Backed Up

**Web directory:** components, app, lib, public, package.json, next.config.ts, tsconfig.json, postcss.config.mjs, eslint.config.mjs, vercel.json, .env.local

**Root level:** sanity.config.js, sanity.cli.js, all schemaTypes/*, package.json, .gitignore, eslint.config.mjs

### Current Backups

| Backup | Description |
|--------|------------|
| `20260710_090635` | Post-hooks fix for mobile crash |
| `20260710_081007` | Post-responsive breakpoints |
| `20260715_083402` | Post-v1.3.0 Grok handoff & scope wrangler verification |
| `20260710_075130` | Mid-responsive work |
| `20260710_074932_pre-gap-fix` | Before canvas gap-closing logic |
| `20260709_193117_post-july9-edits` | After July 9 session |
| `20260706_181613_pre-error-fixes` | Last stable pre-July-9 state |
| `20260706_120437_clock-easter-egg-v7` | After clock + easter eggs |
| `20260706_10xxxx` series | Progressive build snapshots |

### Restore Compatibility

The restore command auto-detects backup format:
- **New format:** Has a `web/` subdirectory
- **Old format:** Files at backup root (pre-July 10 backups)

An emergency backup of the current state is always created before any restore.

---

## Full Changelog

### July 5, 2026 — Initial Build

- Next.js + Sanity CMS setup
- Canvas pan/zoom with scattered cards
- Project detail modal
- Basic mobile layout
- Vercel deployment

### July 6, 2026 — Polish & Features

- SEO pages for individual projects/photos
- Sitemap and robots.txt
- Card animations (float, wiggle)
- next/image optimization
- WOFF2 font conversion
- Touch support (pinch zoom, pan)
- Mobile accordion layout with drawer menu
- Accessibility (skip link, ARIA, keyboard nav)
- Favicon and custom 404
- Terminal command module with scramble text animation
- Collapse/expand toggle for terminal
- Version indicator (v1.0.0 → v1.2.0)
- Scatter-in entrance animation (cards start piled, spread on command)
- Swiss-style project detail modal (25/75 split)
- Card-fall easter egg for unknown commands
- 40 witty messages + 60 daily-rotating design quotes
- Location clock with live time, GPS, availability
- Hero landing page with scroll-to-reveal
- About/hero content editable via Sanity
- Backup/restore system
- Full codebase audit and bug fixes

### July 9, 2026 — Content & Studio

- Playground section added to Sanity Studio
- AI search optimization (llms.txt, enhanced meta)
- Full bio added to site
- **Rolled back** to July 6 state due to errors from these changes
- Re-applied canvas gap-closing logic only

### July 10, 2026 — Responsive & Stability

- Responsive breakpoints: mobile (<480px), tablet (481–1024px), desktop (>1024px)
- Tablet gets canvas experience (was getting mobile layout at <820px)
- Hero padding and bio text scale for tablet
- LocationClock hidden on tablets via CSS
- Terminal grid responsive (2 columns on narrow tablets)
- ProjectDetailModal stacks layout on narrow screens
- Gallery images wrap instead of forcing side-by-side
- Hydration crash fix (mounted guard for mobile/desktop swap)
- **Rules of Hooks fix** — moved `useScrambleText` calls above the `if (isMobile) return` early exit so hook count stays consistent across renders (this was the actual mobile crash)
- Backup system rewritten: full-project, timestamp-only labels, backwards-compatible restore
- TypeScript compiles clean throughout

---

## Current State

### What's Working

- Desktop experience: hero → scroll → canvas → terminal → modals ✅
- Tablet (768px): hero scales, canvas works, terminal fits, clock hidden ✅
- All Sanity content types pulling correctly ✅
- Card interactions (pan, zoom, click, filter, reset, fall) ✅
- Easter eggs (40 quips + 60 design facts) ✅
- Scramble text animations ✅
- Password protection ✅
- SEO pages for individual projects ✅
- Vercel auto-deploy on push ✅
- Backup system ✅
- TypeScript clean ✅

### What's Pending Verification

- **Mobile (<480px):** Rules of Hooks fix applied (moved `useScrambleText` hooks above conditional return). Needs push + verification on a real phone.
- **Cross-browser:** Not yet tested on Safari, Firefox, or Edge
- **Narrow tablet (481–680px):** Terminal 2-column grid not yet visually confirmed

---

## Known Issues

1. **Sanity schema naming inconsistency:** Project schema field is called `discipline` but GROQ query reads from `type`. Tags display correctly but field naming is mismatched. Low priority — cosmetic only.

2. **Duplicate schema files:** Some schema types exist as both `.js` and `.ts` files (e.g., `photography.js` and `photography.ts`). Only the `.js` versions are active. The `.ts` files should be cleaned up.

3. **AI search optimization rolled back:** The llms.txt file, enhanced meta tags, and AI crawler permissions from July 9 were rolled back with the July 6 restore. These can be re-added when ready.

4. **Info modal design:** Currently a simple 2-column layout. A 3-column redesign with photo and scramble text was planned but not started.

5. **Sanity Studio deploy:** The hosted Studio may not reflect the Playground section. Run `cd ~/Documents/cwc && npx sanity deploy` to update.

---

## Next Steps

### Immediate (before calling it "done")

1. **Push the hooks fix** and verify mobile works on the live site:
   ```bash
   cd ~/Documents/cwc && git add -A && git commit -m "Fix mobile crash: move hooks above conditional return to satisfy Rules of Hooks" && git push
   ```

2. **Test mobile on a real phone** — open charleswclark.com on your phone and verify:
   - MobileLayout loads (accordion view, not canvas)
   - "Visit on desktop" notice appears
   - Hamburger menu opens/closes
   - Cards open in detail modal
   - Info modal works

3. **Cross-browser testing** — check charleswclark.com in:
   - Safari (Mac + iOS)
   - Firefox
   - Chrome (already tested)
   - Edge (if available)

4. **Final backup:**
   ```bash
   cd ~/Documents/cwc && ./scripts/backup.sh save
   ```

### Short-Term Enhancements

5. **Info modal redesign** — 3-column layout with:
   - Photo/headshot column
   - Bio with scramble text animation
   - Links/social column

6. **Re-add AI search optimization** — llms.txt, enhanced meta, AI crawler permissions (rolled back with July 6 restore)

7. **Deploy Sanity Studio** with Playground section:
   ```bash
   cd ~/Documents/cwc && npx sanity deploy
   ```

8. **Clean up duplicate schema files** — remove unused `.ts` versions

### Medium-Term (saboteur.one + polish)

9. **saboteur.one** — Charlie's other project, waiting until portfolio is complete

10. **Performance audit** — Lighthouse score, Core Web Vitals, image optimization check

11. **Analytics** — Vercel Analytics or a lightweight alternative to track visitor behavior

12. **Custom domain email** — if moving off Gmail for professional contact

13. **Case study pages** — deeper project write-ups beyond the current card → modal flow

14. **Dark mode** — the design system's neutral grays would translate well

### Long-Term (growth)

15. **Blog/writing section** — design thinking, process posts

16. **Motion/video support** — embedded video in project galleries

17. **Client portal** — password-protected area for active client work-in-progress

18. **Internationalization** — if targeting non-English markets

---

## Terminal Commands Reference

These commands work in the terminal module at the bottom of the canvas:

| Command | What It Does |
|---------|-------------|
| `work` | Filter to work projects (toggle) |
| `photo` | Filter to photography (toggle) |
| `playground` | Filter to playground (toggle) |
| `info` | Open about/contact modal |
| `contact` | Same as info |
| `esc` | Clear filter, reset to pile view |
| `help` | Show help panel |
| *anything else* | Cards fall off screen + witty message |

**Navigation:** Drag to pan, scroll to zoom, click a card to open it.

---

*This document lives at `~/Documents/cwc/PROJECT-STATUS.md` and should be updated as the project evolves.*

| `20260715_083402` | Post-v1.3.0 Grok handoff & scope wrangler verification |
