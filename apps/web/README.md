# GymApp v2 Web Foundation

This app is the new product-grade foundation for GymApp. The existing Vite app remains in the repository as the UI and prototype reference. This directory is where the scalable product architecture starts.

## Stack

- Next.js App Router
- React 19
- Supabase for auth, Postgres and row-level security
- TanStack Query for server state
- Zustand for lightweight client/UI state
- Zod for input validation
- Vitest and Playwright for quality gates

## Architecture

The codebase follows a feature-oriented structure inspired by Feature-Sliced Design:

```txt
src/
  app/                 # Next.js app router, providers and route entrypoints
  shared/              # shared config, database types, query client, Supabase client
  entities/            # domain models such as user, workout and routine
  features/            # business use cases such as auth and workout saving
  widgets/             # composed product sections such as dashboard and product shell
```

## Local setup

```bash
cd apps/web
cp .env.example .env.local
npm install
npm run dev
```

The v2 app runs on port `3001` so it does not conflict with the existing Vite MVP on port `3000`.

## Supabase setup

Add these values to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Database tables and row-level security policies should be added before replacing the MVP localStorage flows.

## Migration principle

Do not copy the old MVP component tree directly. Migrate feature by feature:

1. Auth
2. Workout creation and saving
3. Routine library
4. Measurements
5. Subscription and paywall
6. Offline sync
7. Analytics and error tracking

Each migrated feature must have validation, typed data contracts and a clear boundary between UI, business logic and data access.
