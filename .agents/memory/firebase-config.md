---
name: Firebase config pattern
description: Firebase must be configured via VITE_FIREBASE_* env vars, not hardcoded values.
---

# Firebase Config Pattern

`HelpChain-1/client/src/lib/firebase.ts` must read config from `import.meta.env`:

```ts
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID as string,
};
```

All 6 secrets are set in Replit Secrets. The initialization is wrapped in try/catch so if any are missing, Firebase logs an error and exports null values (graceful degradation).

**Why:** Credentials were previously hardcoded — fixed in Batch 1. Never commit API keys.
