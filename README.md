# Thatcham Baptist Church — website

A warm, modern, mobile-first website for **Thatcham Baptist Church (TBC)**. Everything leads with
welcome, not institution — guided by the church's calling: **“Love God, love our community, equip one
another to be active disciples of Jesus.”**

> This is a **static site with no backend**. All content is hardcoded for now (no ChurchSuite
> integration, no admin panel). Forms are visual only, and every photo is a clearly-labelled
> placeholder — **only the church logo will be a real image (to be supplied).**

---

## Pages

| Page | File | Purpose |
|------|------|---------|
| Home | `index.html` | Hero, multilingual welcome, strapline, Sunday service, this week, community, latest notices |
| Who We Are | `who-we-are.html` | Story, what we believe, the four pillars, Statement of Faith download |
| What's On | `whats-on.html` | Filterable weekly rhythm — weekly vs monthly/periodic clearly marked — Alpha, small groups |
| The Team | `team.html` | Pastor, coordinator, deacons, and safeguarding designated persons |
| Visit | `visit.html` | The key newcomer page — what to expect, finding us, livestream note, visual contact form |
| Give | `give.html` | Gracious, low-pressure giving options |
| Hiring the Building | `hiring.html` | Rooms available to hire + enquiry contact |
| Safeguarding | `safeguarding.html` | Designated persons + policy download |
| Our Links | `links.html` | Denominational, local and partner links |

Primary navigation keeps to six items (Home, Who We Are, What's On, The Team, Visit, Give). The three
key actions — **Plan a Visit · Watch Live · Give** — are reachable from anywhere via the header
buttons and the fixed mobile action bar. Hiring, Safeguarding and Our Links live in the footer.

Supporting files:

- `css/styles.css` — the whole design system (colours, type, components, responsive, animation)
- `js/main.js` — mobile nav, scroll-in animations, What's On day filter, demo form handling
- `vercel.json` — clean URLs + sensible caching headers

No build step. No dependencies. Just HTML, CSS and a little vanilla JavaScript.

---

## Run it locally

Open `index.html` in a browser — that's it. Or serve it for nicer URLs:

```bash
npx serve .   # then visit http://localhost:3000
```

## Deploy to Vercel

Push this folder to a GitHub repo and “Import Project” at vercel.com — no framework preset needed
(**Other / static**). It deploys as-is. Or run `vercel` from this folder.

---

## Handover notes for going live

Items intentionally left as placeholders for a developer / the church to complete:

1. **Church logo** — the only real image. Drop the supplied logo into `assets/` and swap the inline
   SVG brand mark in the header/footer of each page (and the favicon `data:` URI) for it.
2. **Photography** — every other image is a captioned placeholder (“sample image — replace with real
   church photo”). Replace the `.ph` placeholder blocks with real photos when available.
3. **Contact form** (`visit.html`) — visual only. Point it at a form service (Formspree, ChurchSuite
   forms, Netlify Forms, etc.) or a small serverless function.
4. **Placeholder links** (`href="#"`): the Statement of Faith PDF (Who We Are), the Safeguarding
   policy PDF (Safeguarding), the JustGiving button (Give), the Privacy link (footer), and Churches
   Together in Thatcham (Our Links). Drop in the real URLs.
5. **Map** — the Visit page shows a map placeholder; embed a real Google Map / OpenStreetMap.
6. **Latest notices** (home) — three sample cards showing where weekly notices will go.
7. **External partner links** (Our Links) — sensible best-guess URLs are in place; confirm each
   before going live.

### Real details baked in

- **Address:** Wheelers Green Way, Thatcham, Berkshire, RG19 4YF · **Phone:** 01635 867054
- **Service:** Sunday 10:30am Morning Worship (crèche, JAM for primary up to Year 5, 6Up for Year 6–9),
  livestreamed on YouTube. **There is no evening service.**
- **Socials:** YouTube [@ThatchamBaptistChurch](https://www.youtube.com/@ThatchamBaptistChurch) ·
  Facebook [/thatchambaptist](https://www.facebook.com/thatchambaptist) ·
  Instagram [@thatchambaptist](https://www.instagram.com/thatchambaptist)
- **Safeguarding designated persons:** Penny Judge (Children & Young People,
  safechildren@thatchambaptist.org.uk), Carol Collis (Adults at Risk,
  safeadults@thatchambaptist.org.uk), Robin Appleby (Safeguarding Trustee).

---

## Design at a glance

- **Palette:** warm cream + soft sand, confident terracotta accent, gentle sage — no cold corporate
  blue, no heavy black.
- **Type:** *Fraunces* (display serif) for headings, *Figtree* (humanist sans) for body. Non-Latin
  scripts in the multilingual welcome use *Noto Sans SC* and *Noto Sans Arabic*.
- **Feel:** generous whitespace, soft rounded cards, subtle scroll-in reveals, sticky slim header, and
  a fixed bottom action bar on mobile — **Plan a Visit · Watch Live · Give.**
- **Multilingual welcome:** a designed feature greeting people in English, Ukrainian, Chinese, Spanish
  and Arabic — real text in each script, reflecting TBC's ministry welcoming people from other
  countries.
- **Accessible:** strong contrast, large legible type, keyboard-friendly, `prefers-reduced-motion`
  respected, skip link, hearing loop mentioned on the Visit page.

To rebrand or retune, most changes live in the `:root { … }` custom properties at the top of
`css/styles.css`.
