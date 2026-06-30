# Supabase Setup Checklist

## 1. Create or link a project

```bash
supabase login
supabase link --project-ref <project-ref>
```

## 2. Apply migrations

```bash
supabase db push
```

This applies:

- `20260630214000_initial_product_schema.sql`
- `20260630215000_profile_bootstrap.sql`

## 3. Seed starter exercises

```bash
supabase db seed
```

## 4. Configure auth redirect URLs

Add the local and production callback URLs in the Supabase dashboard:

```txt
http://localhost:3001/auth/callback
https://your-production-domain.com/auth/callback
```

## 5. Add environment variables

In `apps/web/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 6. Verify RLS

Before public launch, verify that each user can only access their own rows in:

- profiles
- routines
- routine_exercises
- workouts
- workout_exercises
- workout_sets
- measurements
- water_logs

The exercises table is intentionally readable by all authenticated and anonymous users because it is static product catalog data.
