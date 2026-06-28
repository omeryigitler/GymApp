# Gym App / LiftTrack

A mobile-first workout tracker MVP built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- Demo sign in / sign up flow
- Empty workout tracking
- Routine builder
- Exercise picker
- Set tracking with weight, reps, duration, RPE, and set type
- Rest timer
- Superset linking
- Workout history
- Basic profile, activity, volume, and measurement charts
- Turkish and English UI strings

## Current MVP Notes

This is currently a frontend-only MVP:

- Data is stored in `localStorage` under `lifttrack_data_v2`.
- Authentication is demo-only and does not use a backend yet.
- The paywall is demo-only and does not process real payments yet.
- There is no cloud sync yet.

## Requirements

- Node.js
- npm

## Run Locally

```bash
npm install
npm run dev
```

The Vite dev server runs on port `3000`.

## Checks

```bash
npm run lint
npm run build
```

## Suggested Next Steps

- Add real auth with Firebase, Supabase, or a custom backend.
- Move workout/routine/measurement data from localStorage to a database.
- Add real subscription/payment handling.
- Add tests for routine creation, workout saving, and validation flows.
- Improve full Turkish/English coverage across profile and paywall screens.
