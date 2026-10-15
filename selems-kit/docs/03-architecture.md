# 03 — Architecture

## Overview

```
Browser ──► Vercel (Next.js App Router)
              │  Server Components: fetchQuery/preloadQuery → Convex (public content, SSR/ISR)
              │  Client Components: useQuery/useMutation → Convex (availability, booking, admin)
              ▼
            Convex
              ├─ database (rooms, bookings, content…)
              ├─ file storage (admin photo uploads)
              ├─ Convex Auth (staff sessions)
              ├─ Resend component (email queue, retries, webhooks)
              ├─ rate limiter component
              └─ crons (reminders, no-show flags, review requests, sitemap ping)
```

## Repository layout

```
.
├─ app/
│  ├─ (site)/
│  │  ├─ layout.tsx                  # SiteHeader, SiteFooter, MobileBookBar, Hotel JSON-LD
│  │  ├─ page.tsx                    # /
│  │  ├─ rooms/page.tsx              # /rooms
│  │  ├─ rooms/[slug]/page.tsx       # /rooms/vip-suite …
│  │  ├─ book/page.tsx               # booking flow (client island inside server shell)
│  │  ├─ booking/[ref]/page.tsx      # guest's booking page (needs ?t=token)
│  │  ├─ dining/page.tsx
│  │  ├─ facilities/page.tsx
│  │  ├─ gallery/page.tsx
│  │  ├─ contact/page.tsx
│  │  ├─ akure-guide/page.tsx
│  │  ├─ offers/[slug]/page.tsx      # optional landing per offer
│  │  ├─ privacy/page.tsx
│  │  └─ terms/page.tsx              # booking terms & cancellation policy
│  ├─ admin/
│  │  ├─ login/page.tsx
│  │  └─ (panel)/                    # requires session; AdminShell layout
│  │     ├─ layout.tsx
│  │     ├─ page.tsx                 # Today
│  │     ├─ reservations/page.tsx
│  │     ├─ reservations/[id]/page.tsx
│  │     ├─ availability/page.tsx
│  │     ├─ rooms/page.tsx  rooms/[id]/page.tsx  rooms/units/page.tsx
│  │     ├─ content/[page]/page.tsx  # home, rooms, dining, facilities, gallery, contact, akure-guide
│  │     ├─ offers/page.tsx  faqs/page.tsx  gallery/page.tsx
│  │     ├─ inquiries/page.tsx  reviews/page.tsx
│  │     ├─ staff/page.tsx           # admin only
│  │     └─ settings/page.tsx        # admin only
│  ├─ api/revalidate/route.ts        # on-demand ISR, called by Convex
│  ├─ sitemap.ts  robots.ts  manifest.ts
│  ├─ opengraph-image.tsx            # default OG; rooms have their own
│  ├─ not-found.tsx  error.tsx
│  └─ globals.css                    # Tailwind v4 + @theme tokens
├─ components/{ui,site,admin,seo}/
├─ emails/                           # React Email templates
├─ lib/
│  ├─ dates.ts                       # Lagos-date helpers (no Date arithmetic elsewhere)
│  ├─ money.ts                       # kobo ↔ naira, formatter
│  ├─ seo.ts                         # metadata builders, JSON-LD builders
│  └─ convex-server.ts               # fetchQuery wrapper with cache tags
├─ convex/
│  ├─ schema.ts  auth.ts  auth.config.ts  http.ts  crons.ts  convex.config.ts
│  ├─ lib/{auth.ts,availability.ts,pricing.ts,validators.ts,refs.ts}
│  ├─ public/{rooms.ts,content.ts,booking.ts,inquiries.ts}
│  ├─ admin/{reservations.ts,availability.ts,rooms.ts,content.ts,staff.ts,settings.ts,uploads.ts}
│  ├─ emails.ts  revalidate.ts  seed.ts  users.ts
├─ content/seed.json  content/images.md
├─ public/images/…                    # seed photos (SEO file names)
├─ e2e/ (playwright)   tests/ (vitest, convex-test)
└─ next.config.ts  middleware.ts or proxy.ts (whichever the current Next.js major uses)
```

## Routing, old-URL redirects

Configure permanent (308) redirects in `next.config.ts` for every URL the WordPress site exposes, so existing Google rankings and backlinks carry over:

| Old | New |
|---|---|
| `/room/` | `/rooms` |
| `/rooms/diplomatic-suite/` | `/rooms/diplomatic-suite` |
| `/rooms/business/` | `/rooms/business-room` |
| `/rooms/executive-double/` | `/rooms/executive-double` |
| `/rooms/executive-suite/` | `/rooms/executive` |
| `/rooms/royal-suite/` | `/rooms/royal-suite` |
| `/rooms/vip-suite/` | `/rooms/vip-suite` |
| `/rooms/pent-house/` | `/rooms/penthouse` |
| `/rooms/deluxe-room/` | `/rooms/deluxe-room` |
| `/rooms/standard-room/` | `/rooms/standard-room` |
| `/facilities/` | `/facilities` |
| `/gallery/` | `/gallery` |
| `/contact/` | `/contact` |
| `/reservations`, `/reservations%20`, `/reservations/` | `/book` |
| `/wp-content/uploads/:path*` | `/gallery` (or map the 19 known files to their new `/images/...` paths) |
| `/wp-admin`, `/wp-login.php` | `/admin/login` |

Set `trailingSlash: false`. Crawl the live site once more before launch (`wget --spider` or Screaming Frog) and add any URL this table misses.

## Rendering and caching

| Surface | Strategy |
|---|---|
| Public pages | Static generation with on-demand revalidation. Server Components call `fetchQuery(api.public.*)` wrapped in `unstable_cache`/`cache` tags (or the current Next.js caching primitive): tags `content:<page>`, `rooms`, `room:<slug>`, `offers`, `faqs`, `gallery`, `settings`. `generateStaticParams` for room slugs. |
| Revalidation | When an admin saves content, rates, offers or photos, the Convex mutation schedules `internal.revalidate.run` (action) which POSTs `{ tags: [...] }` to `/api/revalidate` with header `x-revalidate-secret`. The route calls `revalidateTag` for each tag. Fallback `revalidate = 3600` on every page. |
| Live availability | Client components (`useQuery(api.public.booking.searchAvailability, …)`) on `/book` and the room page booking card. Never cached. |
| Admin | Fully client-side Convex (`useQuery`), protected by Convex Auth; `noindex`. |

## Environment variables

| Name | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Vercel + local | Convex deployment URL |
| `CONVEX_DEPLOY_KEY` | Vercel (build) | `npx convex deploy` in build step |
| `NEXT_PUBLIC_SITE_URL` | Vercel | `https://selemsexclusivehotel.com` (canonical base) |
| `REVALIDATE_SECRET` | Vercel + Convex | Shared secret for `/api/revalidate` |
| `SITE_URL` | Convex | Same as above, for email links and revalidation calls |
| `RESEND_API_KEY` | Convex | Resend |
| `RESEND_WEBHOOK_SECRET` | Convex | Delivery/bounce webhooks |
| `EMAIL_FROM` | Convex | `Selems Hotel <bookings@selemsexclusivehotel.com>` (verify domain in Resend: SPF, DKIM, DMARC) |
| `STAFF_ALERT_EMAILS` | Convex | Comma-separated front-desk recipients |
| `JWT_PRIVATE_KEY`, `JWKS`, `SITE_URL` | Convex | Required by Convex Auth (generate per its docs) |
| `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Vercel / Convex | Optional bot protection on booking and contact forms |
| `NEXT_PUBLIC_GA_ID` | Vercel | Google Analytics 4 (load with `@next/third-parties`, after consent) |

## Deployment

- Convex: one `dev` deployment per developer, one `prod`. Vercel build command: `npx convex deploy --cmd 'pnpm build'`.
- Domain: keep `selemsexclusivehotel.com` (apex) with `www` → apex redirect. Move DNS only at launch; lower TTL 48h before.
- Email domain: verify in Resend before launch; keep any existing mailboxes' MX records intact.
- Backups: enable Convex scheduled backups (daily) and export before each schema migration.
