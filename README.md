# Thatcham Baptist Church — website redesign demo

A warm, modern, mobile-first demo site for **Thatcham Baptist Church (TBC)**, built to show church
leadership what a refreshed website could feel like. The guiding idea: **“Church is the people, not
the building.”** Everything leads with welcome, not institution.

> This is a **demo**. It's a static site with no backend. Forms are visual only, and every image is a
> clearly-labelled placeholder waiting for real church photography.

---

## What's here

| Page | File | Purpose |
|------|------|---------|
| Home | `index.html` | Hero, service times, “new here”, this week, outreach |
| Who We Are | `who-we-are.html` | Story + beliefs + the four pillars |
| What's On | `whats-on.html` | Filterable weekly rhythm, Alpha, small groups |
| The Team | `team.html` | Pastor, coordinator, deacons, safeguarding |
| Visit | `visit.html` | The key newcomer page — what to expect + contact form |
| Give | `give.html` | Gracious, low-pressure giving options |

Supporting files:

- `css/styles.css` — the whole design system (colours, type, components, responsive, animation)
- `js/main.js` — mobile nav, scroll-in animations, What's On filter, demo form handling
- `vercel.json` — clean URLs + sensible caching headers

No build step. No dependencies. Just HTML, CSS and a little vanilla JavaScript.

---

## Run it locally

Open `index.html` in a browser — that's it. Or serve it for nicer URLs:

```bash
# any static server works, e.g.
npx serve .
# then visit http://localhost:3000
```

## Deploy to Vercel

```bash
npm i -g vercel   # if you don't have it
vercel            # from this folder, follow the prompts
```

Or push this folder to a GitHub repo and “Import Project” at vercel.com — no framework preset needed
(**Other / static**). It deploys as-is.

---

## Handover notes for going live

Things marked in the demo that a developer would wire up for the real site:

1. **Photography** — real photos are now in place. Portraits (team + safeguarding) and section
   images were pulled from the current live site (`thatchambaptist.org.uk`) and live in `assets/`.
   They're the church's own images, so they're fine to keep — but for the polished final site,
   consider a set of fresh, high-resolution, consistently-lit shots (a few portraits are only
   ~300px wide). Swapping any image is just a matter of dropping a new file into `assets/` and
   updating the `src`.
2. **The contact form** (`visit.html`) — currently visual only. Point it at a form service
   (Formspree, ChurchSuite forms, Netlify Forms, etc.) or a small serverless function.
3. **Real links** — the *Statement of Faith* PDF (Who We Are), the *JustGiving* button (Give), and the
   *Privacy* link in the footer are placeholders (`href="#"`). Drop in the real URLs.
4. **Map** — the Visit page shows a map placeholder; embed a real Google Map / OpenStreetMap.
5. **Live stream** — “Watch Live” points at the church YouTube streams tab; confirm it's the right URL.

### Real details already baked in

- **Address:** Wheelers Green Way, Thatcham, Berkshire, RG19 4YF · **Phone:** 01635 867054
- **Services:** Sun 10:30am Morning Worship · 6:30pm Evening Worship (livestreamed)
- **Socials:** YouTube [@ThatchamBaptistChurch](https://www.youtube.com/@ThatchamBaptistChurch) ·
  Facebook [/thatchambaptist](https://www.facebook.com/thatchambaptist) ·
  Instagram [@thatchambaptist](https://www.instagram.com/thatchambaptist)

---

## Design at a glance

- **Palette:** warm cream + soft sand, confident terracotta accent, gentle sage — no cold corporate
  blue, no heavy black.
- **Type:** *Fraunces* (characterful display serif) for headings, *Figtree* (friendly humanist sans)
  for body. Loaded from Google Fonts.
- **Feel:** generous whitespace, soft rounded cards, subtle scroll-in reveals, sticky slim header, and
  a fixed bottom action bar on mobile with the three key actions — **Plan a Visit · Watch Live · Give.**
- **Accessible:** strong contrast, large legible type, keyboard-friendly, `prefers-reduced-motion`
  respected, skip link, hearing-loop mentioned on the Visit page.

To rebrand or retune, most changes live in the `:root { … }` custom properties at the top of
`css/styles.css`.
