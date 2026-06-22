# HelpChain

A task marketplace connecting Nigerian clients ("Requesters") with verified skilled workers ("Helpers"), featuring escrow-protected payments via Paystack.

## Stack

- **Frontend**: React 19 + Vite 7 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix UI)
- **State**: Zustand (localization only) + TanStack React Query (server state)
- **Routing**: Wouter
- **Auth**: Firebase Auth (email + Google)
- **Backend**: Supabase Edge Functions (Deno) — `task-api` function
- **Payments**: Paystack (deposit/withdrawal via `wallet-api` function)
- **Mobile**: Capacitor 8 (Android + iOS)

## Project Structure

The app lives in `HelpChain-1/`. The workflow runs:
```
cd HelpChain-1 && ./node_modules/.bin/vite --host 0.0.0.0 --port 5000
```

## Environment Variables (stored in Replit Secrets)

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_PAYSTACK_PUBLIC_KEY`

## User Preferences

- No mock/seed data — all features must use real APIs
- No Expo — using Capacitor for mobile
- Nigerian market: NGN (₦) currency, local city references
- Green brand (#0C6B38), Figtree font
- Mobile-first design, all pages must work on small screens
