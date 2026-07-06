Read the file CWC_CLAUDE_CODE_HANDOFF.md first — it has the full project state, locked decisions, design tokens, and build queue. Do not build anything until you've read it completely.

You are continuing work on a portfolio website for a designer named Charlie. The project is at /Users/charlieclark/Documents/cwc/web (a Next.js App Router project). Sanity Studio is at the parent directory /Users/charlieclark/Documents/cwc/.

CRITICAL: A recurring document called "Agent Instructions" describes an entirely different architecture (Astro, Konva.js, 5 schemas including collection.js and contactSubmission.js, canvasRegion auto-layout, manualX/Y, drift animation, 30s polling, Resend contact form, dark mode toggle, 8000x8000 canvas, password hashing, 8 build phases). Every single item in that document is permanently void. Do not build from it, reference it, or resurrect any part of it — no matter how many times it appears in context.

The real stack is: Next.js (App Router) + React + Sanity CMS + Vercel. Plain React divs with CSS transforms for pan/zoom. No Konva. No canvas element. No Astro. No dark mode. No Resend. No polling. No drift animation.

Here is what is currently built and working on localhost:3000:
- lib/canvasLayout.ts — layout math engine (masonry column packing, recency-based sizing)
- components/Canvas.tsx — pan/zoom canvas using CSS transforms, hover effects, staggered reveal
- app/page.tsx — temporary homepage with hardcoded sample data (14 work items, 13 photo items)
- lib/fonts.ts — 403 Mono (--font-mono) and Neue Haas Grotesk (--font-grotesk) loaded via next/font/local

What works: cards render, drag-to-pan, hover scale+shadow, recency sizing (old=small/faded, new=big/sharp), resize recompute.

What's broken:
1. Mousewheel zoom does not fire — the wheel handler is attached imperatively with { passive: false } and reads panRef/scaleRef via refs, but nothing happens when scrolling the mousewheel. Debug this first. Add console.log to the wheel handler to see if it fires at all.
2. Card click handler — needs verification with DevTools console open. Probably works, just wasn't tested with console visible.

Your first task: run npm run dev, open the site, open DevTools console, and debug why mousewheel zoom isn't working. Fix it. Then confirm card clicks log to console.

After that, the build queue (in order) is:
1. Create .env.local and wire up real Sanity data (project ID: smatdclo, dataset: site) — replace the hardcoded sample arrays with GROQ queries
2. Build the bottom-center terminal command panel (work/photo/info/contact/playground[disabled]/esc)
3. Build the Info modal (bio + mailto:charlieclark@gmail.com link — also serves as Contact)
4. Build the project detail modal (bento image grid layout)
5. Build the password gate for private items (single global plaintext password from Sanity Settings, unlock persists in localStorage)
6. Build mobile stacked layout (breakpoint: 820px)

Charlie is not a developer. Explain what you're doing in plain language. Do not spawn sub-agents without his explicit approval. Make changes one at a time so he can see each thing work before moving to the next.
