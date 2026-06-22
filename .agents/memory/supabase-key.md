---
name: Supabase key name
description: The Supabase anon key secret is named VITE_SUPABASE_PUBLISHABLE_KEY in Replit Secrets.
---

# Supabase Key Name

The Supabase client key secret in Replit is named `VITE_SUPABASE_PUBLISHABLE_KEY`.

`supabase.ts` reads it as:
```ts
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
```

**Why:** The secret was originally added as PUBLISHABLE_KEY (following Supabase's own naming in their dashboard). The code previously read VITE_SUPABASE_ANON_KEY which caused the Supabase client to silently never initialize.

Do not rename the variable to ANON_KEY without also renaming the Replit Secret.
