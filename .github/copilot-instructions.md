# Workout Tracker — Copilot Instructions

## Project Overview
A hypertrophy-focused workout PWA with built-in macro tracking. React 18 + Vite + TypeScript frontend, Supabase (Postgres + Auth + RLS) backend, Railway-hosted API proxy for nutrition API calls.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router
- **Backend**: Supabase (Postgres, Auth, Row Level Security, PostgREST)
- **API Proxy**: Node.js/Express on Railway (proxies USDA + Open Food Facts)
- **Deployment**: Railway (static PWA + API proxy), Supabase Cloud (database)

## Commands
```bash
npm run dev              # Start local Vite dev server
npm run build            # Production build
npx supabase start       # Start local Supabase stack
npx supabase db reset    # Reset local DB and reapply all migrations
npx supabase db push     # Push migrations to remote Supabase
npx supabase gen types typescript --project-id <ref> > src/types/database.ts
railway up               # Deploy to Railway
```

## Architecture Rules
- All database access goes through Supabase client SDK with RLS. Never bypass RLS.
- Every user-facing table has `user_id UUID REFERENCES auth.users(id)` and RLS policies enforcing `auth.uid() = user_id`.
- The `food_cache` table is the only shared table (readable/writable by all authenticated users).
- Nutrition API keys live server-side only in the api-proxy service. Never expose them in frontend code.
- All USDA/Open Food Facts calls go through `/api/food/*` proxy routes, never direct from client.

## Code Style
- Functional components only, no class components.
- Use named exports, not default exports (except for page-level route components).
- Custom hooks go in `src/hooks/` and start with `use`.
- Supabase client singleton in `src/lib/supabase.ts`.
- TypeScript strict mode. No `any` types. Use generated `database.ts` types from Supabase.
- Tailwind for all styling. No CSS files. No inline style objects.
- Minimum 44px touch targets on all interactive elements.
- Support both light and dark mode. Use semantic color tokens (`bg-bg`, `text-foreground`, `bg-surface`, etc.) — never hardcode hex colors. Default to system preference, with a user toggle in Settings.

## File Conventions
- Components: `src/components/ComponentName.tsx` (PascalCase)
- Pages: `src/pages/PageName.tsx` (PascalCase)
- Hooks: `src/hooks/useHookName.ts` (camelCase with use prefix)
- Types: `src/types/` directory
- Migrations: `supabase/migrations/YYYYMMDDHHmmss_description.sql`

## Do NOT
- Use localStorage or sessionStorage for user data. All persistent data goes to Supabase. (Exception: theme preference may use localStorage for flash-free initial load.)
- Create separate CSS/SCSS files. Use Tailwind.
- Import Supabase service key in frontend code.
- Write raw SQL in React components. Use Supabase client SDK methods.
- Hardcode exercise data in components. Always query from the `exercises` table.
- Explain basic lifting terminology in the UI. The user is experienced.
