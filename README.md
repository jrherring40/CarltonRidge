# Carlton Ridge — Villa Marketing Site

Astro + React site for Carlton Ridge, a six-bedroom luxury villa in Holetown, St. James, Barbados.

## Getting started

```bash
npm install
npm run dev
```

Site runs at `http://localhost:4321`.

## Replacing the placeholder photos

`public/images/` currently contains **generated placeholder graphics**, one per filename, so the site renders correctly before real photography is in place. Replace each file with your actual photo **using the exact same filename**, and everything else updates automatically:

```
public/images/
  AerialPlan.jpeg
  ArialSeaview.jpeg
  BedroomByPool.jpeg
  CottageLivingRoom.jpeg
  CottageTerrace.jpeg
  Kitchen.jpeg
  LivingRoom.jpeg
  MasterBathroom.jpeg
  Patio.jpeg
  Pool.jpeg
  PoolTable.jpeg
```

Recommended: export photos at 1600–2400px on the long edge, JPEG quality ~80, to keep page weight down.

## Structure

- `src/pages/` — five pages: Home, The Villa, Gallery, Location, Enquire
- `src/components/` — Header, Footer, Heptagon (signature motif), EnquiryForm (React)
- `src/layouts/BaseLayout.astro` — shared shell
- `src/styles/global.css` — design tokens (color, type) and shared styles

## Design system

| Token | Value | Use |
|---|---|---|
| `--duck-egg` | `#AFC9C4` | Primary accent |
| `--navy` | `#16263A` | Text, dark sections |
| `--gold` | `#B3925A` | CTAs, accents |
| `--sand` | `#F6F3EC` | Light background |

Typefaces: **Cormorant Garamond** (display) + **Jost** (body), loaded via Google Fonts in `global.css`.

The heptagon motif in the hero, footer, and Villa page echoes the shape of Carlton Ridge's actual pool.

## Enquiry form

The Enquire page's form is a static-site-friendly React component: it doesn't post to a backend. Submitting opens the visitor's email client with a pre-filled message (`mailto:`), and there's a matching pre-filled WhatsApp link. Update the two constants at the top of `src/components/EnquiryForm.jsx`:

```js
const OWNER_EMAIL = 'stay@carltonridgevilla.com';
const OWNER_WHATSAPP = '12460000000'; // digits only, with country code
```

If you'd later like real form submissions (e.g. via Formspree or a Cloudflare Pages Function), that's a small follow-up change to this component.

## Deploying (Cloudflare Pages via GitHub)

1. Push this repo to GitHub.
2. In Cloudflare Pages, create a project connected to the repo.
3. Build command: `npm run build` — Output directory: `dist`.
4. Add a custom domain once DNS is pointed at Cloudflare.

## To do before launch

- [ ] Swap in real photography (see above)
- [ ] Update `OWNER_EMAIL` / `OWNER_WHATSAPP` in `EnquiryForm.jsx`
- [ ] Update footer address/contact details if needed
- [ ] Set the real domain in `astro.config.mjs` (`site:`)
- [ ] Add real map coordinates in `src/pages/location.astro` if you want a pin rather than an area search
