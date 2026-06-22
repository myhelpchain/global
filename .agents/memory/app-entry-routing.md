---
name: App entry routing
description: How the / route routes users to the right app screen based on auth/onboarding state.
---

# App Entry Routing

`/` maps to `home.tsx`, which is a pure smart router (no visible UI beyond a loading spinner).

## Decision tree (runs after Firebase auth resolves)

1. `user` present → check `localStorage.hc-onboarding-done === "true"` → `/dashboard` or `/onboarding`
2. No user → check `localStorage.hc-intro-seen === "true"` → `/auth` or `/intro`

## localStorage keys used across entry flow

| Key | Set by | Meaning |
|-----|--------|---------|
| `hc-splash-shown` | `SplashScreen` via `AppShell` | Per-session; prevents splash on every navigation |
| `hc-intro-seen` | `intro-onboarding.tsx` on last slide | First-time intro has been seen |
| `hc-onboarding-done` | `onboarding.tsx` `handleComplete()` only | Full 6-step onboarding completed |
| `hc-onboarding-data` | `onboarding.tsx` `handleComplete()` | JSON blob of all onboarding answers |

**Why:** After splash, the SPA starts at `/`. We need to bypass the old marketing landing and route to the correct mobile app screen without a full page reload.

**How to apply:** Any future "where do new users land" logic belongs in `home.tsx`. Do not add routing logic to `AppShell` or `SplashScreen`.

## Onboarding guard
`ProtectedRoute` re-checks `hc-onboarding-done` for every protected route. Users cannot bypass onboarding via direct URL navigation.

The only code path that sets `hc-onboarding-done=true` is `handleComplete()` at the end of step 5 (Preferences) in `onboarding.tsx`. There is no global skip.
