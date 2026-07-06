# CWC Portfolio — Session 2 Handoff

## Project Overview
Canvas-style portfolio for Charlie Clark (designer, not developer). All development is automated by Claude.

**Stack:** Next.js 16 App Router, React, Sanity CMS (project `smatdclo`, dataset `site`), Vercel (Hobby tier)
**Repo:** github.com/cclark28/cwc-portfolio
**Live URL:** https://cwc-portfolio-eight.vercel.app
**Sanity Studio:** https://www.sanity.io/manage/project/smatdclo

---

## What's Done

### Core Build (Session 1)
- Canvas component with pan/zoom (CSS transforms, imperative wheel listener with `{ passive: false }`)
- Masonry column layout with recency-based sizing (`canvasLayout.ts`)
- Terminal command bar (work, photo, info, esc, help, playground)
- Info Modal, Project Detail Modal, Password Gate Modal
- Mobile Layout (≤820px breakpoint, completely separate stacked view)
- Sanity data fetching (server component → client component split)
- Fallback to hardcoded sample data when Sanity is empty
- Deployed to Vercel with env vars set

### Session 2 Progress
- **Fixed Vercel deploy** — added `.npmrc` with `legacy-peer-deps=true` to resolve `next-sanity@^9` + Next.js 16 peer dep conflict
- **Sanity import script built** — `scripts/import_to_sanity.py` parses WordPress XML, maps 1,517 local images in `assets/images/` by WP attachment ID, uploads to Sanity CDN, creates documents
- **Import ran successfully** — all 14 work projects and 46 photography posts are in Sanity with cover images

### Code Changes Made But NOT YET PUSHED
These edits are saved to the local filesystem but the git push hasn't happened yet:

1. **`web/components/HomeClient.tsx`** — Replaced `CLARK` text in header with inline SVG logo (from uploaded `Clark-1.svg`)
2. **`web/components/Terminal.tsx`** — Updated to match design mockup:
   - Added placeholder text: `type a command — work, photo, info…`
   - Added dashed separator line between input and commands
   - Added colon to "Available commands:"
   - Added "- back" suffix next to the `esc` chip
   - Used CSS transition longhand (not shorthand) per spec
3. **`web/app/page.tsx`** — Changed JLO from `private: true` to `private: false` in sample data

---

## What Needs to Be Done Next

### Immediate (start of next session)

1. **Push pending code changes:**
   ```
   cd ~/Documents/cwc
   rm -f .git/index.lock
   git add -A
   git commit -m "fix: SVG logo, terminal design match, remove JLO private"
   git push origin main
   ```
   Vercel auto-deploys on push.

2. **Clean up Sanity duplicates:** The import script ran 2-3 times, creating duplicate documents. There are 29 projects (should be 14) and 86 photography (should be 46). Need a script to:
   - Query all documents grouped by slug
   - Keep the newest (most complete) version of each
   - Delete the duplicates

3. **Verify live site** shows real Sanity content instead of sample data after push

### Then

4. **Review the site for visual/data issues:**
   - Check that all cover images display correctly on cards
   - Check that gallery images load in Project Detail Modal
   - Verify "The Dopacetics" photography post (only item missing a cover image)
   - Test terminal commands (work/photo filter, info modal, esc reset)
   - Test mobile layout at ≤820px

5. **Remaining items from original spec (not yet built):**
   - Avatar image for Info Modal (user hasn't provided one yet)
   - Custom domain setup in Vercel (optional)
   - Site password configuration in Sanity settings
   - Content review — user may want to adjust titles, years, descriptions, or reorder gallery images in Sanity Studio

---

## Key Technical Constraints (from original handoff doc)

- **NO:** Astro, Konva.js, canvas rendering, drift animation, dark mode, Resend email, password hashing, agent spawning
- **CSS transitions:** Use longhand properties ONLY (transitionProperty, transitionDuration, etc.) — NEVER shorthand `transition` + `transitionDelay` together
- **Fonts:** 403 Mono (`--font-mono`) and Neue Haas Grotesk (`--font-grotesk`)
- **Light mode only** — background `#FAFAFB`
- **Password:** plain string from Sanity `sitePassword` field, stored in localStorage key `cwc_unlocked`
- **Mobile breakpoint:** ≤820px

---

## File Locations

- **Project root:** `~/Documents/cwc/`
- **Next.js app:** `~/Documents/cwc/web/`
- **Images:** `~/Documents/cwc/assets/images/` (1,517 files)
- **WordPress XML:** `~/Documents/cwc/assets/charlieclark.WordPress.2026-07-04.xml`
- **Import script:** `~/Documents/cwc/scripts/import_to_sanity.py`
- **Sanity schemas:** `~/Documents/cwc/schemaTypes/`
- **Sanity env:** `web/.env.local` — `NEXT_PUBLIC_SANITY_PROJECT_ID=smatdclo`, `NEXT_PUBLIC_SANITY_DATASET=site`

## Sanity API Token (Editor permissions)
```
skezUJWHdVNM1vRnMjh2LQupCepims3T7x6OxLSNAdx8aRBqloqH1WbW6irAMJZ2HO0hxF0z2JoEwvs2VxJd5r8tQp8OpLL3PCGzfACAMfnJpGxrqjQk8jxFU9PLirYp8YvwWeWqSA45MgHopM3WMG0Qg7jBCudkjo2GRRZJG7AnPPj4yOKV
```
