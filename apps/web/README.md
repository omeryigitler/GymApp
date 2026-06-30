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
  app/
  shared/
  entities/
  features/
  widgets/
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

Apply the database foundation from the repository root:

```bash
supabase link --project-ref <project-ref>
supabase db push
supabase db seed
```

The first migration creates profiles, exercises, routines, workouts, workout sets, measurements and water logs with row-level security. The profile bootstrap migration creates a profile row when a Supabase Auth user is created.

## Auth flow

The first real auth implementation uses passwordless email links:

```txt
/auth -> request email link -> /auth/callback -> session exchange -> /dashboard
```

The callback route exchanges the Supabase code for a session, verifies the user, bootstraps the profile row and redirects to the protected dashboard. Middleware refreshes Supabase cookies for `/auth`, `/dashboard`, `/workouts` and `/routines` routes.

## Dashboard data loop

`/dashboard` is protected. It reads the current Supabase user, loads the RLS-protected profile row, then queries recent workouts and routines from Supabase. If no data exists yet, it shows honest empty states instead of fake demo activity.

Logout is handled with a POST route at `/auth/logout`.

## Quick workout save flow

`/workouts/new` is the first real write flow. It reads the exercise catalog from Supabase, validates form input with Zod, then writes one workout, one workout exercise and one completed workout set. This is intentionally narrow so the database write loop is correct before migrating the full MVP workout builder.

## Quick routine save flow

`/routines/new` is the first real routine write flow. It reads the exercise catalog from Supabase, validates form input with Zod, then writes one routine and one routine exercise. This lets the dashboard routine list populate from real user-owned data.

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
