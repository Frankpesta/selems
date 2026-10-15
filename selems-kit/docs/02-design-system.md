# 02 — Design system

The approved screens live on the design canvas ("Selems Hotel Redesign") and their markup is copied into `design-reference/`. Match them closely. Where this document and the canvas disagree, **this document wins** (it reflects decisions taken after the canvas was drawn — see "Changes since the canvas" at the end).

## Direction: "Ijapo Slate & Amber"

Colours come from the hotel itself: the deep navy "E" in the logo and the slate-blue walls of the building, the logo's orange deepened to an amber that passes contrast, and the green velvet headboards in the suites. A high-contrast Didone display face (Bodoni Moda) gives the international-hotel register; a clean grotesque (Instrument Sans) carries everything else. Square corners (2px radius) on public UI; slightly softer (4–6px) in admin. Real photography does the emotional work, so ornament stays minimal.

## Tokens (Tailwind v4 `@theme` in `app/globals.css`)

```css
@theme {
  /* colour */
  --color-ink: #17222D;        /* primary text, dark bands, nav on hero */
  --color-ink-2: #0F171E;      /* footer */
  --color-slate: #3E5566;      /* secondary dark, chart bars, avatars */
  --color-stone: #F3F4F2;      /* page background (cool off-white) */
  --color-paper: #FFFFFF;      /* alternating sections, cards */
  --color-mist: #E7EAE8;       /* placeholder fills, subtle panels */
  --color-line: #DCE1E1;       /* hairlines */
  --color-line-strong: #C9D0D2;/* input borders, table rules */
  --color-muted: #5E6E79;      /* eyebrows, captions (AA on stone) */
  --color-body: #3B4B57;       /* secondary body text */
  --color-amber: #A4561B;      /* primary action, links, focus ring */
  --color-amber-dark: #86460F; /* hover */
  --color-amber-soft: #EDE2D7; /* tag background */
  --color-amber-tint: #E3A16A; /* accents on dark backgrounds only */
  --color-velvet: #3F5A4C;     /* offer band */
  /* semantic (admin) */
  --color-ok: #1F6A3A;   --color-ok-bg: #E3EFE6;
  --color-warn: #8A4B0C; --color-warn-bg: #FBEEDC;
  --color-bad: #A3291F;  --color-bad-bg: #F8E1DF;
  --color-info: #24527A; --color-info-bg: #E2EAF2;

  /* type */
  --font-display: "Bodoni Moda", Didot, "Bodoni 72", Georgia, serif;
  --font-sans: "Instrument Sans", system-ui, -apple-system, "Segoe UI", sans-serif;

  /* radius */
  --radius-sm: 2px;  --radius-md: 4px;  --radius-lg: 6px;
}
```

Map shadcn's CSS variables (`--background`, `--foreground`, `--primary`, `--ring`, `--border`, …) onto these tokens so shadcn components inherit the palette. The public site is light-only by design; the admin may add a dark mode later (not in scope).

Load fonts with `next/font/google` (`Bodoni_Moda` with `opsz` axis, weights 400–700 + italic; `Instrument_Sans` 400–700), `display: 'swap'`, exposed as CSS variables.

## Type scale

| Role | Font | Size (desktop / phone) | Weight | Notes |
|---|---|---|---|---|
| Hero H1 | display | clamp(44px, 6vw, 84px) | 500 | line-height 1.08, `text-wrap: balance` |
| Page H1 | display | clamp(40px, 5vw, 68px) | 500 | |
| Section H2 | display | 48px / 32px | 500 | |
| Card H3 | display | 26px | 500 | room names |
| Eyebrow | sans | 12px, uppercase, tracking .18em | 600 | colour muted (amber-tint on dark) |
| Lede | sans | 18px / 17px | 400 | max 62ch, colour body |
| Body | sans | 16px | 400 | line-height 1.6 |
| Small | sans | 14px | 400 | |
| Prices | sans | inherit | 600 | `tabular-nums` |

## Spacing and layout

- Content container: max-width 1240px, side gutter 24px (16px on phones), centred.
- Section rhythm: 96–112px vertical on desktop, 64–72px on phones. Alternate `stone` and `paper` backgrounds between sections; dark `ink` bands for hero and CTAs; `velvet` only for the offer band.
- Grids: 2/3/4 columns collapsing to 1 below 760px (4 → 2 below 980px).
- Navigation collapses to a menu sheet below 1100px; "Book a room" moves into the sheet and the sticky bottom bar on phones.

## Components (build in `components/site` unless shadcn has it)

| Component | Spec |
|---|---|
| `UtilityBar` | 38px strip above the header, `ink-2` background, 13px. Left: address. Right: "Front office open 24/7" · phone (`tel:`) · WhatsApp (`wa.me`), separated by 1px dividers. Below 720px only phone and WhatsApp remain, right-aligned. Scrolls away (not sticky). |
| `SiteHeader` | **One row that never wraps** (`flex-wrap: nowrap`, links `white-space: nowrap`). Left: wordmark (display 30px "Selems" + 10.5px tracked "Exclusive Hotel & Suites · Akure", `flex: none`). Centre: 6 links (Rooms & Suites, Dining & Bars, Facilities, Gallery, Akure Guide, Contact), 30px gap. Right: amber "Book a room". The phone number lives in the UtilityBar, not here. Sticky at `top: 0`, 76px tall. Variant `dark` over the home hero. Active link: 1px amber underline. **Below 1100px** links and button collapse into a menu button that opens a shadcn `Sheet` (links, phone, WhatsApp, Book a room); never let items wrap to a second line at any width — add a Playwright visual check at 1100, 1280 and 1440px. |
| `MobileBookBar` | Phones only, fixed bottom, 76px, white, "From ₦35,000 / night" (or this room's rate) + amber button. Hidden on /book. Adds `env(safe-area-inset-bottom)` padding. |
| `Button` | shadcn Button with variants: `amber` (primary), `line` (1px ink outline, fills ink on hover), `light` (outline on dark). Min height 48px (40px `sm`). Radius 2px. Weight 600. |
| `AvailabilityBar` | Check-in, check-out (shadcn `Calendar` range in a `Popover`; native date inputs on phones), guests select, "Check availability" → `/book?checkIn=…&checkOut=…&adults=…`. Overlaps hero bottom by 64px with a soft shadow. |
| `RoomCard` | 4:3 photo, name (display 26px), price right-aligned with "/ night", one-line facts, "Details" (line, sm) + "Book" (amber, sm). Suites carry a `Tag`. |
| `Tag` | 11.5px uppercase, amber-soft background, amber-dark text. |
| `FactsStrip` | 4 cells, hairline-ruled, display numerals 44px. |
| `AmenityRow` | 28px stroke icon (lucide, amber) + title + one line. |
| `FAQ` | shadcn `Accordion`, styled flat with top rules; content also emitted as FAQPage JSON-LD. |
| `Breadcrumbs` | 13px muted; also BreadcrumbList JSON-LD. |
| `Gallery` | CSS columns masonry, figure + caption, filter chips, lightbox (shadcn `Dialog` + keyboard arrows). |
| `BookingSummary` | Sticky card: room photo, name, dates, guests, nightly breakdown, total, policy line. |
| `SiteFooter` | Ink-2 background; logo, address, 3 link columns, phones/email, socials, legal row. |
| `Placeholder` | Never shipped. Dev-only dashed box for missing photos. |

Icons: `lucide-react`, stroke 1.5, never emoji.

## Motion

Restrained. Images fade in on load (150ms). Sticky header gains a hairline shadow after scroll. Hover on room cards: image scales 1.02 over 400ms. No scroll-triggered reveals that hide content at rest. Everything disabled under `prefers-reduced-motion`.

## Admin look

Same tokens, more utilitarian: ink sidebar (240px) with amber-tint active marker, white top bar, stone canvas, white panels (6px radius, 1px line border). Status shown as pills with a dot: ok (green), warn (amber), bad (red), info (blue), mute (grey). Tables use `tabular-nums`, 14px, hairline rows, selected row tinted `#FBF5EF`. Use shadcn `Table`, `Sheet` (details drawer on small screens), `Dialog`, `Form` (react-hook-form + zod), `Toast` (sonner).

## Page-by-page visual spec

The canvas board names map to routes:

| Canvas board | Route | Notes |
|---|---|---|
| Home | `/` | Dark hero (H1 left, 3-photo mosaic right), availability bar overlapping, About + facts, featured rooms (3), offer band (velvet), dining split, amenities grid (6), location (list of distances + exterior photo + map), reviews (3), FAQ, full footer |
| Rooms & Suites | `/rooms` | Intro + filter chips (All, Rooms, Suites, Under ₦50,000) + sort; 3-col grid of 9; "In every room" checklist; compare table; group-booking CTA band |
| Room page — VIP Suite | `/rooms/[slug]` | Breadcrumbs, 5-photo gallery (big + 4), content column (tag, H1, facts, lede, amenities, policies, other rooms) + sticky booking card (dates, guests, live price breakdown, availability line, "Reserve this room") |
| Booking flow | `/book` | Steps: Dates → Room → Your details → Review & reserve → Confirmed. Summary card right. |
| Dining & Bars | `/dining` | Split dark hero, restaurant hours + 3 menu categories, indoor bar (3 photos), outdoor bar, private dining CTA |
| Facilities | `/facilities` | Alternating photo/text rows (front office, restaurant & room service, Wi-Fi & TV, parking, bars), practical details (power, security, laundry) |
| Gallery | `/gallery` | Filter chips + masonry with captions |
| Contact & Location | `/contact` | Three contact ways strip, message form, address, map, directions |
| Akure stay guide | `/akure-guide` | Article layout with sticky table of contents, author/date line, areas grid, CTA card, FAQs |
| Phone — Home / Room / Booking step | — | Phone layouts of the above; note the sticky bottom book bar and the full-screen date picker |
| Admin — Sign in, Today, Reservations, Availability, Rooms & rates, Content & SEO | `/admin/...` | See docs/06 |

## Notes on reading the canvas

1. **No online payment.** Booking step 4 is "Review & reserve" with "Reserve — pay at the hotel". The canvas reflects this; if any "pay online" wording survives anywhere, ignore it.
2. **Roles** are Admin and Staff.
3. Room sizes appear only when real values exist.
4. Brackets like `[2:00 PM]` on the canvas are placeholders: pull real values from Settings, and hide the line if unset.
5. Admin screens show sample guests and figures for layout only.
