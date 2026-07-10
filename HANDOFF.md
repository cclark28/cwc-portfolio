# CWC Portfolio — Handoff Summary
**Date:** July 9, 2026  
**Site:** [charleswclark.com](https://www.charleswclark.com)

---

## What's Live

- **Next.js + Sanity CMS portfolio** deployed on Vercel (project: `cwc-portfolio`)
- **Domain:** charleswclark.com pointing to Vercel via Squarespace DNS (A records → 76.76.21.21)
- **SSL:** Active, HTTPS working
- **Images:** Loading from Sanity CDN (API token set in Vercel env vars)
- **AI search optimization:** llms.txt, enhanced JSON-LD, AI crawler permissions in robots.txt, full career bio in crawlable content
- **Sections:** Work Projects, Photography Series, Playground — all managed through Sanity

## Sanity CMS

- **Project ID:** smatdclo
- **Dataset:** site
- **Studio:** Needs `npx sanity deploy` from `~/Documents/cwc` to update the hosted Studio
- **Sidebar sections:** Work Projects, Photography Series, Playground, Site Settings, About / Hero
- **Hero text** (name, roles, tagline, availability, bio) is all editable under About / Hero
- **API Token:** Set in both Vercel env vars and local `web/.env.local` as `SANITY_API_TOKEN`

## Key Files

| File | What it does |
|------|-------------|
| `web/app/page.tsx` | Homepage — fetches all content from Sanity, renders canvas + crawlable bio |
| `web/app/layout.tsx` | Global layout, JSON-LD structured data, metadata |
| `web/app/robots.ts` | AI crawler permissions (GPTBot, ClaudeBot, etc.) |
| `web/public/llms.txt` | Machine-readable profile for AI search engines |
| `web/app/sitemap.ts` | Auto-generated sitemap from Sanity content |
| `web/.env.local` | Local environment variables (Sanity token) |
| `sanity.config.js` | Sanity Studio config with custom desk structure |
| `schemaTypes/` | All Sanity schemas (project, photography, playground, about, settings) |
| `web/components/` | React components (Canvas, HomeClient, Terminal, etc.) |
| `scripts/backup.sh` | Backup script — run with a label to snapshot the project |

## Backups

- Latest: `pre-error-fixes` at `.backups/20260706_181613_pre-error-fixes`
- Run `bash scripts/backup.sh <label>` to create a new one

## What Still Needs Doing

1. **Deploy Sanity Studio** — Run `cd ~/Documents/cwc && npx sanity deploy` so the hosted Studio shows Playground in the sidebar
2. **#45 — Redesign Info modal** — 3-column layout with Charlie's photo + scramble animation
3. **#46 — TypeScript check + backup**
4. **saboteur.one** — Charlie said to wait until the portfolio is done

## Git Info

- **Repo:** https://github.com/cclark28/cwc-portfolio.git
- **Branch:** main
- **Latest commit:** `0b585e2` — "Add AI search optimization and Sanity Studio Playground"
- Pushes to main auto-deploy on Vercel

## Environment

- **Vercel:** Hobby plan, project `cwc-portfolio` under `cclark28s-projects`
- **DNS:** Squarespace → Vercel
- **Node/Next.js:** App Router
- **Styling:** Tailwind + custom CSS
- **Fonts:** Custom WOFF2 (mono + grotesk)
