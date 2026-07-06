# Portfolio Site — Handoff

**Prepared for Charlie Clark — July 2026**

Everything you need to manage and maintain your site.

---

## What This Site Is

Your portfolio is a **canvas-style website** where project cards are scattered across the screen like photographs on a table. Visitors can pan around and zoom in/out to browse your work. The cards are grouped into three sections: **Work**, **Photography**, and **Playground**.

All content is managed through **Sanity** (your content management system). When you add, edit, or remove content in Sanity, the changes show up on your live site the next time someone loads the page — no rebuilding or coding required.

---

## Key Details

| Item | Value |
|------|-------|
| Project folder | `~/Documents/cwc` |
| Website code | `~/Documents/cwc/web` |
| Sanity Studio | `~/Documents/cwc` (root) |
| Sanity project ID | `smatdclo` |
| Sanity dataset | `site` (private) |
| Dev site URL | http://localhost:3000 |
| Sanity Studio URL | http://localhost:3333 |

---

## How to Start the Site Locally

You need to run two things in Terminal:

**1. Start the website**

```
cd ~/Documents/cwc/web && npm run dev
```

This starts your portfolio site at **localhost:3000**.

**2. Start Sanity Studio**

```
cd ~/Documents/cwc && npm run dev
```

This starts the content editor at **localhost:3333**.

*Tip: Open two separate Terminal windows so both can run at the same time.*

---

## Managing Content in Sanity

Open **localhost:3333** in your browser to access Sanity Studio. This is where you add, edit, and remove all your content.

### Work (Projects)

Your design projects. Each entry has:

- **Title** — the project name
- **Slug** — a URL-friendly version of the title (auto-generated)
- **Year** — affects card size on the canvas (newer = bigger)
- **Client** — who the work was for
- **Role** — your role on the project
- **Type** — the discipline or category tag
- **Cover Image** — the thumbnail shown on the canvas card
- **Gallery** — images and/or videos shown in the detail view
- **Description** — rich text about the project
- **Private** — toggle to blur the card on the canvas

### Photography

Same fields as Work. Use this for your photography entries.

### Playground

Experimental or side projects. Same fields as Work, plus:

- **Tags** — a text list of tags (instead of a single type)
- **External URL** — optional link to a live project

### About (Info Panel)

A single document that controls the Info panel on your site:

- **Headline** — the main line at the top of the panel
- **Bio** — a paragraph about you
- **Current Role** — your job title
- **Location** — where you are based
- **Contact Email** — shown as a clickable link

### Settings

A single document for site-wide settings:

- **Site Password** — password visitors need to enter (if enabled)
- **Password Enabled** — toggle the password gate on/off
- **Command Module** — configure the bottom toolbar (show/hide buttons, custom labels, placeholder text)

*Note: About and Settings are singleton documents — there is only one of each and they cannot be deleted or duplicated.*

---

## Uploading Images

When adding images to a gallery in Sanity:

- You can drag and drop multiple files at once into the gallery field
- Sanity handles the upload and hosting automatically
- Images and videos are both supported in gallery fields
- Cover images are single-file uploads (one image per entry)

---

## How the Canvas Works

### Card sizing

Cards get bigger or smaller based on their **year**. Newer projects appear larger, more vivid, and cast more shadow. Older projects are smaller, more muted, and flatter.

### Scattered layout

Cards are arranged in an organic, scattered pattern — like photos tossed on a table. Each card has a slight random rotation and offset. The layout is consistent (same arrangement every time) because it uses a formula based on each project's unique ID.

### Section clusters

Work, Photography, and Playground cards are grouped into separate clusters on the canvas, spread out horizontally with gaps between them.

### Navigation

- Click and drag to pan around the canvas
- Scroll to zoom in and out
- Use the command module (bottom toolbar) to jump to a section
- Click any card to open its detail view

---

## The Command Module (Bottom Toolbar)

The toolbar at the bottom of the screen has buttons for navigating sections (Work, Photography, Playground), opening Info, and toggling Help. All configurable from Sanity under Settings > Command Module:

- **Show/Hide buttons** — toggle each button on or off
- **Custom labels** — rename any button
- **Placeholder text** — change the hint text shown in the toolbar

---

## File Map (For Future Developers)

If you ever need a developer to make changes, here are the key files:

| File | What it does |
|------|-------------|
| `web/app/page.tsx` | Main page — fetches all data from Sanity |
| `web/lib/sanity.ts` | Sanity connection and all data queries |
| `web/lib/canvasLayout.ts` | The layout engine (card positions, scatter, sizing) |
| `web/components/Canvas.tsx` | The pan/zoom canvas view |
| `web/components/HomeClient.tsx` | Main UI component (ties everything together) |
| `web/components/Terminal.tsx` | The command module / bottom toolbar |
| `web/components/InfoModal.tsx` | The Info/About panel |
| `web/components/ProjectDetailModal.tsx` | Detail view when you click a card |
| `web/components/MobileLayout.tsx` | Mobile-specific layout |
| `schemaTypes/project.js` | Sanity schema for Work projects |
| `schemaTypes/photography.js` | Sanity schema for Photography |
| `schemaTypes/playground.js` | Sanity schema for Playground |
| `schemaTypes/about.js` | Sanity schema for the Info panel content |
| `schemaTypes/settings.js` | Sanity schema for site settings |
| `web/.env.local` | Environment variables (Sanity keys) |

---

## Known Quirks

- The project schema has a field called `discipline` but the data query reads from a field called `type`. Tags display correctly, but the naming is inconsistent behind the scenes. A developer should align these if editing the schema.

- The site uses `force-dynamic` mode, meaning every page load fetches fresh data from Sanity. This keeps content up to date but means the site relies on the Sanity API being available.

- The Sanity dataset is **private**, so an API token is required. This token lives in `web/.env.local` and should not be shared publicly.

---

## Common Tasks Cheat Sheet

**Add a new project** — Open Sanity Studio > click Project (or Photography or Playground) > click the + button > fill in the fields > click Publish.

**Edit existing content** — Click on any entry in Sanity Studio, make your changes, and click Publish. Changes appear on the site immediately (just refresh the page).

**Hide a project from the canvas** — Toggle the Private checkbox on any entry. The card will still appear but with a blurred overlay and a lock icon.

**Change the bottom toolbar** — Go to Settings > expand Command Module > toggle buttons on/off, rename labels, or change the placeholder text.

**Update the Info panel** — Go to About in Sanity Studio > edit headline, bio, role, location, or email > Publish.

**Enable/disable the password gate** — Go to Settings > toggle Password Enabled on or off > set your password > Publish.

---

## Suggested Next Steps

- Restart the dev server and review all recent changes visually
- Check that the scattered canvas layout feels right — card positions and rotations
- Review the Playground section if you have added any entries
- Test the command module buttons and their labels from Sanity
- Confirm the Info panel pulls your content from Sanity correctly
- Look into deploying the site (Vercel is a natural fit for Next.js projects)
