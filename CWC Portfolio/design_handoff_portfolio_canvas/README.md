# Handoff: Charlie Clark Portfolio — Infinite Canvas

## Overview
A designer/photographer portfolio built around a pannable, zoomable "infinite canvas" home view instead of a traditional scrolling homepage. Visitors drag to pan and scroll/pinch to zoom across a field of Work and Photography project cards, use a terminal-style command box to jump to a category or Info, and click any card to open a detail view. A dedicated stacked mobile experience replaces the canvas below ~820px. The whole thing is content-driven from a single project data array (see `cwc-projects-data.js`) — the intent is a future CMS (WordPress XML import was discussed but not built) that would populate that same list.

## About the Design Files
The files in this bundle (`CWC Pages.dc.html`, `CWC Pages Mobile.dc.html`, `CWC Design System.dc.html`) are **HTML/JS design prototypes**, not production code to copy verbatim. They run on a small proprietary templating runtime (`support.js`, "DC" components) that only exists in the design tool — it will not run as-is in a normal web app. Treat these as a precise interactive spec: recreate the visual design, layout, content, and behavior described here using the target codebase's actual stack (React/Next, Vue, plain JS, etc. — pick what fits the project) and its existing conventions. `cwc-projects-data.js` IS plain, framework-free JS/JSON-shaped data and can likely be adapted directly or dropped into a CMS schema.

Open the `.dc.html` files directly in a browser to see them run (they're self-contained).

## Fidelity
**High-fidelity.** Colors, type, spacing, component states, and interaction behavior (pan/zoom math, hover states, reveal animation, filtering) are all intentional and specified — recreate them precisely, not just "in the spirit of."

## Screens / Views

### 1. Home Canvas (desktop, `CWC Pages.dc.html`)
- Full-viewport layout: a **60px solid header bar** (background `#FAFAFB`, 1px bottom border `#E5E4E6`) containing only the centered Clark wordmark (`assets/clark-logo.svg`, 20px tall), then a **pannable canvas region** filling the rest of the viewport (`100vh - 60px`).
- The header bar is a separate, non-scrolling layout region — the canvas beneath it is clipped to its own box so panned content can never render underneath/behind the header. Do not implement the header as an absolutely-positioned overlay on top of the canvas; keep it a real, separate flex-row sibling above the canvas.
- **Canvas background**: solid `#FAFAFB` (design-system "Surface" token). No texture/pattern in the final approved state (a paper-grain texture was tried and explicitly rejected).
- **Cards**: each project is a "mat" — a white (`#FFFFFF`) rounded card, `8px` border-radius, `12px` internal padding, subtle box-shadow (`0 1px 2px rgba(24,24,27,.05), 0 4px 10px rgba(24,24,27,.05)` at rest). Inside the mat: an image block at `4px` border-radius filling the mat's inner width at a 16:9 aspect ratio, and the project title + year below the image (not overlaid on it), in IBM Plex Mono 500, 0.6875rem, uppercase, clamped to 2 lines with ellipsis overflow.
- **No stroke/dashed border and no "Drop an image / browse files" caption should appear on these cards** — the image area should look like a plain, clean placeholder block (light gray, no border) until a real photo is dropped in.
- **Hover state**: the whole card mat scales to `1.045×` and its shadow deepens (`0 14px 30px rgba(24,24,27,.16)`), transition `0.18s ease`. This is a "does it feel alive" affordance — the title stays static below.
- **Recency-driven sizing** ("newer work should look more prominent"): each card's size and visual weight is computed purely from its `year` field, linearly interpolated between `MIN_YEAR=2011` and `MAX_YEAR=2025`:
  - width: 130px (oldest) → 260px (newest); height = width × 9/16
  - opacity: 0.68 → 1.0
  - grayscale filter: 35% (oldest) → 0% (newest)
  - label color: light gray `#9B9AA0` (oldest) → mid gray `#58565D` → near-black `#18181B` (newest, t>0.6)
  - drop shadow on the mat: only added once `t > 0.65` (i.e., roughly the last ~5 years), else the subtle default shadow
- **Layout algorithm**: cards are NOT hand-placed; they're packed into columns (masonry-style, shortest-column-first) with a fixed gap (default 48px, tweakable) between cards and ~96px reserved per item for its label + mat padding, so cards never overlap or crowd each other's text. Work and Photography are two separate column groups side by side, with a wider gutter between the two groups. Column count adapts to viewport width: 4 work-cols/3 photo-cols above 1300px, 3/2 between 1000–1300px, 2/1 below 1000px (down to the 820px mobile handoff).
- **Pan**: click-drag anywhere on empty canvas (not on a card) to pan; cards keep fixed positions in the layout (viewport moves, like a map), with a spring-like `transform 0.35s ease` easing back in once you release, except mid-drag/mid-wheel where the transition is disabled for direct 1:1 tracking.
- **Zoom**: mouse wheel / trackpad scroll zooms in/out, centered on the cursor position, clamped between 0.4× and 2.2×.
- **Entrance animation**: on load, all cards fade/scale in staggered by ~16ms per card (max 420ms delay), and the terminal panel "types out" a demo string ("try work, photo, or info") character by character before settling to an idle blinking cursor.
- **Selection has no color** — private items are the only ones with a persistent visual treatment (see below); nothing else changes color on select, only elevation/scale on hover.

### 2. Terminal / Command Panel (bottom-center, floats over the canvas)
- Fixed at `bottom: 28px`, horizontally centered, width `min(640px, 92vw)`, background `#FAFAFB`, border `1px solid #E5E4E6`, radius 6px, drop shadow `0 20px 48px rgba(24,24,27,.10)`.
- Top row: a `▶` chevron icon, a blinking text-cursor bar (only while the input is unfocused/idle), and a real text `<input>` where the visitor can type `work`, `photo`, `info`, or `contact` and press Enter to navigate — this doubles as the "type where you want to go" affordance.
- Below: "Available commands" label + "scroll to zoom" hint, then a 3-column command grid: `work`/`photo` | `info`/`playground` | `esc`/`help`. Clicking a command chip does the same thing as typing it.
- `work` / `photo`: filters the canvas to just that category, dimming (opacity ~0.05, `pointer-events:none`) the other category, and re-centers/zooms (1.15×) the viewport on the visible set. Clicking the same command again clears the filter and returns to showing both categories at 1× scale, re-centered.
- `info`: opens the Info modal (see below). `contact` is intentionally the same destination as `info` (no separate contact page/form).
- `playground` chip is visibly disabled (light gray, `cursor:not-allowed`, tooltip "Coming soon") — it's a placeholder for future personal experiments the owner will add later; do not build a page for it yet.
- `esc`: resets filter, view, and pan back to the default centered-on-everything state.

### 3. Project Detail Modal (opens on card click)
- Centered modal, scrim `rgba(24,24,27,.35)`, panel `min(1200px, 94vw)` wide, max-height `88vh`, white, 6px radius, big soft shadow. Header row (sticky) shows title (mono, uppercase) + year, and a close (×) button that returns to the canvas.
- Body: two-column layout — left column (min 280px) has the full title (NHG Bold, 2rem), a label/value metadata list (Year, Type, Client, Role) in IBM Plex Mono, and a description paragraph in NHG Regular. Right side is an image "bento": 4 tiles in a 2-col grid with 2px gaps — tile 1 spans both columns at 16:9 ("hero"), tiles 2–3 are 1:1 side by side, tile 4 spans both columns at 16:9 again ("detail"). Each tile has a small numbered circular badge (1–4) top-left — **this badge is the intended drag-handle for reordering which image is "first"/largest** once a real CMS exists; it's not wired to real drag behavior yet, just the visual affordance.
- Footer note (in the actual build, replace with real UI/tooltip, not visible copy): tiles should auto-size from each image's real aspect ratio rather than being force-cropped into fixed slots — most source images are natively 16:9 or 9:16.
- On narrower viewports the two-column grid should collapse via `repeat(auto-fit, minmax(280px,1fr))` (i.e., single column under ~600px).

### 4. Password Gate Modal (opens instead of the detail modal, only for `private: true` projects)
- Same modal chrome as above but small (`min(360px, 90vw)`), centered content: lock icon, `"{title}" is private`, subcopy **"One password unlocks every private item"** (confirmed product decision: one global password, not per-project), a password input, and an orange (`#FF5A1F`) "Unlock" button. In this prototype, clicking Unlock always succeeds (no real auth) — wire real validation in the build.
- On the canvas itself, a private card is shown with its image blurred (`backdrop-filter: blur(6px)` + white 40%-opacity wash) plus a centered lock icon and a "PRIVATE" mono label — this is a per-item flag on the project record, not a site-wide gate.

### 5. Info Modal (also serves as "Contact")
- Centered, `min(1000px, 94vw)` wide, white, scrollable if content exceeds `88vh`.
- Content: large editorial headline "Aloha, I'm Charlie." (NHG Bold, `clamp(2.5rem, 7vw, 5rem)`), a two-column row below it — left: a short bio paragraph; right: a "Current" block (role, company, "Based in the United States", and a `mailto:` "Say hello →" link) — with a small square (120×120px) avatar photo slot to the right of the whole block. There is intentionally **no footer/social-links/signature area** in the approved version — an earlier version with a coordinates/location footer was explicitly removed.
- Real copy to use verbatim: bio — "I'm a multidisciplinary designer exploring the intersection of technology, storytelling, and design. I collaborate on useful, experimental, and immersive experiences across digital, environmental, and physical touchpoints." Role: "Senior Designer — DemandScience / Terminus." Email: `charlieclark@gmail.com`.

### 6. Mobile (separate file: `CWC Pages Mobile.dc.html`, ≤ ~820px)
Below the desktop breakpoint, do **not** attempt the pan/zoom canvas — replace it entirely with this stacked, scrollable page (simulated here inside a `max-width:420px` centered "phone frame" for review purposes only; in production this is just the normal responsive layout, not a literal frame):
- Sticky top bar: logo left, hamburger icon right, background `#FAFAFB`.
- A single professional notice banner right below the header: *"This site is built for an experience-driven design — for the full, more enjoyable experience, visit on desktop."* (light gray `#ECEBEE` box).
- Below that: **Work**, then **Photography**, each rendered as year-grouped accordions (a bordered card per year, header row = the year, then each project as a tappable row with its title; private items show a small lock glyph). This avoids an endless flat scroll — grouping by year is the agreed content structure for mobile.
- Hamburger opens a right-side slide-in drawer (scrim + drawer panel) with `work` / `photo` / `info` shortcuts; `work`/`photo` just close the drawer (already on the combined list), `info` opens the Info view.
- Tapping a project opens a **bottom-sheet-style** detail view (slides up from the bottom, rounded top corners, `max-height:90vh`, scrollable) — a simplified single-column version of the desktop detail modal (title, year/type/client, description, then 2 stacked full-width 16:9 image slots).
- Info is a full-screen view (not a modal) with the same content as desktop's Info but stacked in one column with a smaller avatar (100×100).
- **Important layout note**: all modals/drawers on mobile must be constrained to the phone-frame's own width (`left:50%; transform:translateX(-50%); width:min(420px,100vw)` in this prototype) rather than the full browser viewport — in production this just means normal responsive containers, but don't let any overlay ignore its parent's max-width.

## Interactions & Behavior Summary
- Pan: mousedown+drag on empty canvas → translate the world layer 1:1 with cursor movement; a small (`>3px`) movement threshold distinguishes a pan from a click so clicking a card still works reliably after a previous pan (this exact bug — a stale "was dragging" flag blocking all future clicks — was hit and fixed during design; make sure the real implementation resets any such flag on the very next interaction, not just on drag-end).
- Zoom: wheel event, centered on cursor, exponential scale factor, clamped 0.4–2.2×.
- Filtering (work/photo): re-centers and zooms to 1.15× on the filtered set's bounding box; toggling the same filter again clears it back to 1× showing everything.
- Card click vs. drag: a card click should only fire if the preceding pointer-down→up sequence did not exceed the drag threshold.
- Responsive column re-flow: recompute the packed layout (and re-center the pan) whenever the window resizes or the card-gap value changes — don't just rely on CSS reflow, since positions are computed in JS.
- All animations are 150–450ms ease, no perpetual/idle motion — nothing should animate unless the user acted (pan, zoom, hover, click, load-once entrance).

## State Management
Needed state (see `CWC Pages.dc.html`'s `Component` class for the reference shape):
- `pan {x,y}`, `scale` — current viewport transform
- `dragging`, `dragMoved`, `dragStart`, `panStart` — pan gesture tracking
- `filter` (`null | 'work' | 'photo'`) — active category filter
- `view` (`'canvas' | 'detail' | 'gate' | 'info'`) and `activeId` — which overlay is open and for which project
- `cmdText` / terminal input value, plus the intro-typing state (can be dropped in production — it's a one-time load animation, not persistent app state)
- `gateInput` — password field value (replace with real auth state)
- Computed layout (`{ [projectId]: {x,y} }`) — recomputed from the project list + current column counts, not stored as authored data

## Design Tokens
Pull the authoritative token list from `CWC Design System.dc.html` (all sections, especially Color/Type/Grid & Spacing/Card & Button States). Key values used throughout this build:
- **Colors**: Paper `#FFFFFF`, Surface `#FAFAFB`, Ink `#18181B`, Ink/55 `#86858C`, Stroke `#E5E4E6`, Accent (orange, primary CTA only) `#FF5A1F`, Link (blue) `#4D80E6`, Card grey `#ECEBEE` / hover `#E1E0E4`, Error (forms only) `#C4453F`. Mid-tone label grays used for "older item" fade: `#58565D`, `#9B9AA0`.
- **Type**: Headlines in "NHG" (Neue Haas Grotesk stand-in; ships as `NHG-Regular/Medium/Bold.otf`), weight 700 for display/headings, 400 for body. UI/meta text in IBM Plex Mono (300/400/500), uppercase with `0.02–0.04em` letter-spacing for labels.
- **Radius**: 4px on images/inner elements, 6px on panels/modals, 8px on the card mats.
- **Spacing**: 8px base unit elsewhere in the system; this canvas uses a dedicated packing gap (default 48px, tweakable 16–96px) between cards plus ~96px reserved height per card for its label and mat padding.
- **Elevation**: e0 (none) → e4, per the design system's shadow scale; selection/focus is communicated via elevation only, never a color change (except the private/locked treatment and the orange primary button).

## Assets
- `assets/clark-logo.svg` — wordmark, used in the header, mobile header, password gate, 404, and favicon context. Real project photography/screenshots are NOT included — every image area in these files is a placeholder (`<image-slot>`, a drag-and-drop stand-in from the design tool) waiting for real assets; source them from the existing charleswclark.com WordPress media library.
- Real project content (titles, years, clients, descriptions) was pulled from the live site (charleswclark.com) and its WordPress export, and lives in `cwc-projects-data.js` — treat this as seed/sample data for the eventual CMS, not final copy to hardcode forever.

## Files
- `CWC Pages.dc.html` — desktop canvas experience (source of truth for the primary flow)
- `CWC Pages Mobile.dc.html` — mobile stacked experience
- `CWC Design System.dc.html` — full token/component reference (color, type, grid, buttons, forms, empty states, icons, lightbox, motion, loading, mobile drawer, cursors, spacing rules)
- `cwc-projects-data.js` — plain JS module with the real project list, sizing/aging logic, and year-grouping helper; shared by both the desktop and mobile files
- `image-slot.js`, `support.js` — design-tool runtime files; not needed in the production build, included only so the `.dc.html` files still open and run for reference
