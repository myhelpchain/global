# HelpChain

A task marketplace connecting people who need help with verified skilled workers, featuring escrow-protected payments.

## Stack

- **Frontend**: React 19 + Vite 7 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix UI)
- **State**: Zustand + TanStack React Query
- **Routing**: Wouter
- **Backend/Auth**: Supabase + Firebase
- **Blockchain**: Solana (spl-token)
- **Forms**: React Hook Form + Zod

## Design System

- **Brand color**: `#0C6B38` (deep forest green)
- **Font**: Figtree (Google Fonts)
- **Background**: White `#FFFFFF` / light sections `#F8FAF8`
- **Logo**: `/images/helpchain-logo.png` (served from `client/public/images/`)
- **Currency**: NGN (₦) — formatLocal() from useLocalizationStore
- **Task images**: `https://picsum.photos/seed/{category-slug}/800/400`
- **Profile photos**: `https://i.pravatar.cc/40?img={n}`
- **Avoid**: shadcn Card/Badge/Button in overhauled pages — use plain HTML with inline Tailwind/style

## Overhauled Pages

- `client/src/pages/home.tsx` — Landing page with hero, worker cards, task cards, SVG How-It-Works, 12-category grid, testimonials, Local/Remote task type section
- `client/src/pages/discover.tsx` — Marketplace with cover images, color-coded category badges, grid/list toggle, 26+ categories, Local/Remote badges on task cards
- `client/src/pages/dashboard.tsx` — Green gradient balance card, stat widgets, task list, quick actions sidebar
- `client/src/pages/request-details.tsx` — Cover image, green budget box, status timeline, offers list, hire/decline buttons
- `client/src/pages/profile.tsx` — Cover banner, avatar with camera upload, performance stats, reputation bars, skills chips, sample reviews
- `client/src/pages/messages.tsx` — Preview mode banner, overhauled to match brand (green accent, white cards, demo conversations)
- `client/src/pages/admin-dashboard.tsx` — Firebase auth guard + email-based admin check + Access Denied screen
- `client/src/components/layout/navbar.tsx` — Logo + nav links, notification bell with unread badge, SectorToggle removed

## Security

- `supabase/functions/wallet-api/index.ts` — Firebase JWT verified with `jose` + JWKS (no more decode-only)
- `supabase/functions/task-api/index.ts` — Firebase JWT verified with `jose` + JWKS
- Admin dashboard protected by Firebase auth + email allowlist (`ADMIN_EMAILS`)

## Data / Seed

- `client/src/stores/tasks-store.ts` — 12 diverse seed tasks covering: physical help, tech, errands, home repairs, design, tutoring, cooking, marketing, translation; Nigerian cities (Lagos, Abuja, Port Harcourt); Local and Remote variants
- `client/src/stores/wallet-local-store.ts` — Demo wallet with ₦50k seed balance (local mock)

## Project Layout

```
/
├── client/           # Frontend source
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── stores/
│   │   └── utils/
│   └── public/
├── index.html        # Root HTML entry
├── vite.config.ts    # Vite configuration
├── supabase/         # Supabase config and migrations
└── dist/             # Build output
```

## Development

- Dev server runs on port 5000 (0.0.0.0)
- `npm run dev` — start development server
- `npm run build` — production build

## Deployment

- Configured as a **static** deployment
- Build command: `npm run build`
- Public directory: `dist`
