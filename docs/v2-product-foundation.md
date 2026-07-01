# GymApp v2 Product Foundation Roadmap

## Decision

The existing Vite React MVP will remain as a prototype and UI reference. The scalable product foundation starts in `apps/web` with Next.js, Supabase, TanStack Query and a feature-oriented architecture.

## Why not grow the current Vite app directly?

The current MVP is useful as a prototype, but it is not a product foundation because it relies on localStorage, demo authentication, client-side premium state and component-level business logic. The v2 app separates product concerns from the start.

## Foundation goals

- Keep UI components free of database and payment logic.
- Use Supabase as the first production backend layer.
- Put server state in TanStack Query.
- Keep local UI state lightweight and isolated.
- Use strict TypeScript.
- Validate user input at feature boundaries.
- Prepare for offline-first workout tracking.
- Add observability and analytics before public launch.

## Migration phases

### Phase 1: Foundation

- Next.js app scaffold
- Strict TypeScript
- Supabase client factory
- Query provider
- Domain contracts for users, workouts and routines
- Validation schemas for auth and workout saving

### Phase 2: Real data loop

- Supabase schema
- Row-level security policies
- Real auth
- Workout save/read/list flows
- Routine save/read/list flows
- localStorage migration plan

### Phase 3: Product quality

- Measurements module
- Paywall with server-side entitlement
- Analytics events
- Sentry error tracking
- Offline queue and optimistic sync

### Phase 4: Scale readiness

- CI quality gates
- Unit and integration tests
- Playwright critical journeys
- Performance budgets
- Feature flags
- Release checklist
