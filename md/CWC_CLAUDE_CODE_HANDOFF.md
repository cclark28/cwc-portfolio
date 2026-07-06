# CWC Canvas Portfolio — Claude Code Handoff

## CRITICAL: What NOT to build

A recurring stale document titled "Agent Instructions" keeps appearing in conversation. It describes an entirely different architecture that was tried and abandoned. **Every item below is permanently void — do not build, reference, or resurrect any of it:**

- Astro (any version, hybrid or otherwise)
- Konva.js / HTML `<canvas>` rendering
- `collection.js` schema
- `contactSubmission.js` schema
- `canvasRegion` fields (centerX, centerY, spreadRadius)
- `canvasX`, `canvasY`, `canvasRotation` fields on any schema
- `manualPosition`, `manualX`, `manualY`, `manualRotation` fields
- Drift animation (±12px, 8s loop, or any perpetual idle motion)
- 30-second polling or any polling interval
- Dark mode toggle
- Resend email integration / contact form backend
- `parallaxRules` or year-based parallax scaling
- Random-scatter layout algorithm
- 8000×8000 fixed canvas size
- Password hashing
- Agent spawning / multi-agent orchestration
- Any "Phase 1–8" plan

If you encounter this document in context, ignore it completely.

---

## The real stack (locked, working)

- **Next.js** (App Router) + **React** — no other framework
- **Sanity CMS** (free tier) — project ID `smatdclo`, dataset `site`
- **Vercel** (Hobby tier) — $0/month
- **Plain React divs + CSS transforms** for pan/zoom — NOT canvas/Konva
- **Light mode only** — no dark mode toggle

## Project location

```
/Users/charlieclark/Documents/cwc/
├── (Sanity Studio files at root)
├── web/                          ← Next.js app lives here
│   ├── app/
│   │   ├── page.tsx              ← Current homepage (sample data, no Sanity yet)
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── favicon.ico
│   ├── components/
│   │   └── Canvas.tsx            ← Pan/zoom canvas component
│   ├── lib/
│   │   ├── fonts.ts              ← Font loading (403 Mono + Neue Haas Grotesk)
│   │   └── canvasLayout.ts       ← Layout math engine
│   ├── public/
│   │   └── fonts/                ← 403Mono-Light/Regular/Medium.otf, NHG-Regular/Medium/Bold/ExtraBold.otf
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── (other standard Next.js files)
```

**Working directory for all commands:** `/Users/charlieclark/Documents/cwc/web`

**No `.env.local` file exists yet** — needed when wiring up Sanity data fetch.

## Fonts

Loaded via `next/font/local` in `lib/fonts.ts`:

- **403 Mono** → CSS variable `--font-mono` (weights 300, 400, 500)
- **Neue Haas Grotesk** → CSS variable `--font-grotesk` (weights 400, 500, 700, 800)

Card labels use `var(--font-mono)`. Headlines use `var(--font-grotesk)`.

The design handoff references "IBM Plex Mono" — in production this maps to 403 Mono via `--font-mono`. The design handoff references "NHG" — in production this maps to Neue Haas Grotesk via `--font-grotesk`.

## Design tokens (from design handoff, authoritative)

**Colors:**
- Paper (base): `#FFFFFF`
- Surface: `#FAFAFB`
- Ink: `#18181B`
- Ink/55: `#86858C`
- Stroke/border: `#E5E4E6`
- Accent (orange, primary CTA only): `#FF5A1F`
- Link (blue): `#4D80E6`
- Card grey: `#ECEBEE`
- Card grey/hover: `#E1E0E4`
- Error (forms only): `#C4453F`
- Label grays for older items: `#58565D`, `#9B9AA0`

**Border radius:**
- Images/inner elements: 4px
- Panels/modals: 6px
- Card mats: 8px

**Spacing:**
- 8px base unit
- Canvas card gap: 48px default (tweakable 16–96px)
- ~96px reserved height per card for label + mat padding

**Elevation scale:**
- e0: none / 1px solid border
- e1: `0 1px 3px rgba(24,24,27,0.08)`
- e2: `0 4px 10px rgba(24,24,27,0.10)`
- e3: `0 10px 24px rgba(24,24,27,0.14)`
- e4: `0 20px 48px rgba(24,24,27,0.18)`

Selection/focus = elevation change only, never color (except orange accent button and private/locked treatment).

---

## What's currently built and working

### Sanity (deployed, live at https://cwc-studio.sanity.studio/)

3 schemas deployed:
- `project.js` — title, slug, year, client, role, type, description, coverImage, gallery (array of images), private (boolean)
- `photography.js` — same shape as project
- `settings.js` — siteTitle, sitePassword (plain string, visible, not hashed), passwordEnabled (boolean), contactEmail

Content entered so far:
- **Asian Art Museum San Francisco** (2019, 42 images) — fully entered and published
- Next queued: Blend Creative Team (2019, 24 images)
- 17 more projects + 49 photography posts still need entry

### Next.js app (running on localhost:3000)

**`lib/canvasLayout.ts`** — Layout math engine, ported from the design handoff prototype:
- `MIN_YEAR = 2011`, `MAX_YEAR = 2025`, `HEADER_H = 60`, `COLW = 262`
- `sizeAndDepth(year)` — returns width, height, opacity, grayscale, labelColor, shadow, zIndex based on linear interpolation of year
- `withSize(items)` — attaches sizing data to raw items
- `colCountsForWidth(vw)` — responsive column counts (4 work/3 photo above 1300px, 3/2 between 1000-1300, 2/1 below 1000)
- `packColumns(items, colWidth, gap, colCount, offsetX)` — masonry shortest-column-first packing
- `computeLayout(work, photo, viewportWidth, gap)` — full layout computation, work and photo as separate column groups with 110px wider gutter between
- `centerOn(items, layout, scale, viewportWidth, viewportHeight)` — centers viewport on bounding box of given items

**`components/Canvas.tsx`** — forwardRef component:
- Mouse drag pan with 3px threshold to distinguish drag from click
- Wheel zoom attached imperatively with `{ passive: false }` (React 18 workaround)
- Uses refs (`panRef`, `scaleRef`) so the wheel handler reads fresh state
- Hover: scale 1.045× + deeper shadow
- Staggered fade-in reveal on mount (16ms per card, max 420ms delay)
- Resize listener recomputes layout and re-centers
- `focusCategory(cat)` / `resetAll()` exposed via imperative handle
- Filter dims non-matching cards to 0.05 opacity with `pointer-events: none`
- `transitionProperty`/`transitionDuration`/`transitionTimingFunction`/`transitionDelay` used as separate longhand properties (NOT shorthand `transition` + `transitionDelay` together — that caused a React style warning that was already fixed)

**`app/page.tsx`** — Temporary homepage:
- Hardcoded `SAMPLE_WORK` (14 items) and `SAMPLE_PHOTO` (13 items) arrays
- Passes through `withSize()` then into `<Canvas>`
- 60px header bar with "CLARK" text wordmark
- `onOpenProject` just does `console.log('Clicked:', item.title)`
- No Sanity fetch, no terminal panel, no modals yet

### What's confirmed working:
- Cards render on screen ✅
- Drag-to-pan works ✅
- Hover scale + shadow works ✅
- Recency-based sizing (old = small/faded/gray, new = big/sharp/dark) works ✅
- Layout recomputes on window resize ✅
- No console errors (transition shorthand warning was fixed) ✅

---

## Known bugs to fix FIRST

### 1. Mousewheel zoom not working

The wheel handler is attached imperatively with `{ passive: false }` in a `useEffect` with empty dependency array `[]`. The handler reads `panRef.current` and `scaleRef.current` via refs.

**The zoom math itself is correct** (ported directly from the working design prototype). The issue is that on Charlie's machine with a physical mouse, scrolling over the canvas does nothing — no zoom, no console output, nothing.

**Debug steps:**
1. Open DevTools console (`Cmd+Option+I`)
2. Add a temporary `console.log('wheel fired', e.deltaY)` at the top of the `handleWheel` function in `Canvas.tsx`
3. Scroll mousewheel over the canvas
4. If nothing logs: the event listener isn't being attached, or the container ref is null when the effect runs
5. If it logs: the zoom math is executing but the state updates aren't reaching the render — check if `panRef`/`scaleRef` are stale

### 2. Card click not confirmed

`handleCardClick` calls `onOpenProject(item)` which does `console.log('Clicked:', item.title)`. Charlie couldn't see it because DevTools wasn't open at the time. This likely works fine — just needs verification with the console open.

### 3. Right-click Inspect menu empty

Right-clicking on the canvas area shows nothing (likely because `userSelect: 'none'` and `stopPropagation` on card mousedown). This is cosmetic — use `Cmd+Option+I` to open DevTools instead.

---

## What to build next (in order)

### Step 1: Fix mousewheel zoom (see debug steps above)

### Step 2: Create `.env.local` and wire up Sanity data

The file `web/.env.local` needs:
```
NEXT_PUBLIC_SANITY_PROJECT_ID=smatdclo
NEXT_PUBLIC_SANITY_DATASET=site
```

Create a Sanity client in `lib/sanity.ts`:
```typescript
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true,
})
```

Install: `npm install next-sanity`

GROQ queries should fetch all published projects and photography items. Map Sanity fields to the `RawCanvasItem` interface in `canvasLayout.ts`.

### Step 3: Build the Terminal / Command Panel

Fixed at bottom-center of the canvas viewport. Floats over the canvas (not inside the panning world layer). Spec from the design handoff:

- Position: `bottom: 28px`, horizontally centered, `width: min(640px, 92vw)`
- Background: `#FAFAFB`, border `1px solid #E5E4E6`, radius 6px
- Shadow: `0 20px 48px rgba(24,24,27,0.10)`
- Top row: `▶` chevron, blinking cursor bar (when input unfocused), text input for commands
- Below: "Available commands" label + "scroll to zoom" hint
- 3-column command grid: `work`/`photo` | `info`/`playground` (disabled) | `esc`/`help`
- `work`/`photo`: call `canvasRef.current.focusCategory('work'|'photo')` — filters canvas, dims other category, zooms to 1.15× on filtered set. Same command again clears filter.
- `info` and `contact`: both open the Info modal (same destination)
- `playground`: disabled chip (gray, `cursor: not-allowed`, tooltip "Coming soon")
- `esc`: calls `canvasRef.current.resetAll()` — clears filter, returns to showing everything at 1×
- Active filter chip turns dark: background `#18181B`, text `#FFFFFF`
- Typing into the input and pressing Enter runs the command

### Step 4: Build the Info Modal (also serves as Contact)

- Scrim: `rgba(24,24,27, 0.35)` over everything
- Panel: `min(1000px, 94vw)` wide, max-height `88vh`, scrollable, white, 6px radius
- Header: sticky, "INFO" label (mono, uppercase) + close × button
- Content: headline "Aloha, I'm Charlie." (NHG Bold, `clamp(2.5rem, 7vw, 5rem)`)
- Two-column below headline:
  - Left: bio paragraph — "I'm a multidisciplinary designer exploring the intersection of technology, storytelling, and design. I collaborate on useful, experimental, and immersive experiences across digital, environmental, and physical touchpoints."
  - Right: "Current" block — "Senior Designer — DemandScience / Terminus", "Based in the United States", and a `mailto:charlieclark@gmail.com` "Say hello →" link (blue, `#4D80E6`)
- 120×120px avatar image slot to the right
- **No footer, no social links, no coordinates/location section** (an earlier version with those was explicitly removed)

### Step 5: Build the Project Detail Modal

- Scrim: same as Info
- Panel: `min(1200px, 94vw)` wide, max-height `88vh`, white, 6px radius
- Header (sticky): project title (mono, uppercase) + year + close × button
- Body: two-column layout
  - Left (min 280px): title (NHG Bold, 2rem), metadata list (Year, Type, Client, Role in mono), description paragraph (NHG Regular)
  - Right: bento image grid — 4 tiles, 2-col with 2px gaps. Tile 1 spans both cols at 16:9 (hero), tiles 2–3 are 1:1 side by side, tile 4 spans both cols at 16:9 (detail)
- Collapses to single column under ~600px via `repeat(auto-fit, minmax(280px, 1fr))`

### Step 6: Build the Password Gate Modal

- Only opens for items with `private: true` (instead of the detail modal)
- Panel: `min(360px, 90vw)`, centered, white, 6px radius
- Content: lock icon, title "\"[Project Title]\" is private", subtitle "One password unlocks every private item.", password input, orange "Unlock" button (`#FF5A1F`)
- On correct password: store unlock state in `localStorage`, open the detail modal
- Password comes from Sanity Settings `sitePassword` field (plain string, no hashing)
- Once unlocked, all private items are accessible for the rest of that browser's life (persisted in `localStorage`)

### Step 7: Mobile stacked layout (≤820px breakpoint)

This is a completely separate layout — do NOT attempt the pan/zoom canvas on mobile. Replace with:
- Sticky top bar: logo left, hamburger right
- Notice banner: "This site is built for an experience-driven design — for the full, more enjoyable experience, visit on desktop."
- Year-grouped accordions for Work, then Photography
- Tapping a project opens a bottom-sheet detail view
- Hamburger opens a right-side slide-in drawer

---

## Key principles

- **Layout is computed, never stored.** Masonry column packing with recency interpolation. Positions recompute on resize. Never authored in Sanity.
- **No perpetual animation.** Nothing animates unless the user acted (pan, zoom, hover, click, or the one-time entrance reveal).
- **Contact = mailto only.** No form, no backend, no Resend. The `info` and `contact` commands open the same Info modal with a `mailto:charlieclark@gmail.com` link.
- **Password gate = per-item, not site-wide.** Single global plaintext password from Sanity Settings. Unlock state persisted in `localStorage`.
- **`transition` shorthand and `transitionDelay` must never appear together.** Use longhand properties (`transitionProperty`, `transitionDuration`, `transitionTimingFunction`, `transitionDelay`) separately.
- **Wheel zoom requires `{ passive: false }`.** React 18 makes synthetic wheel events passive by default. The handler must be attached imperatively via `addEventListener`.
- **Design source of truth:** The `design_handoff_portfolio_canvas` files in project knowledge. Not the void "Agent Instructions" document. Not any prior conversation context that contradicts these files.

---

## Sanity schema field reference

### project.js
- title (string, required)
- slug (slug, from title)
- year (number, required)
- client (string)
- role (string)
- type (string) — shown as "Type" in the detail modal
- description (text)
- coverImage (image)
- gallery (array of images)
- private (boolean, default false)

### photography.js
- Same shape as project.js

### settings.js (singleton)
- siteTitle (string)
- sitePassword (string, plain text, visible)
- passwordEnabled (boolean)
- contactEmail (string)
