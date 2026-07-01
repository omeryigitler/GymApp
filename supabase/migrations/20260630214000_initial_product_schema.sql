create extension if not exists pgcrypto;

create type public.subscription_tier as enum ('free', 'pro', 'team');
create type public.workout_set_type as enum ('normal', 'warmup', 'dropset');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  preferred_language text not null default 'tr' check (preferred_language in ('tr', 'en')),
  subscription_tier public.subscription_tier not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_tr text not null,
  name_en text not null,
  muscle_group_tr text not null,
  muscle_group_en text not null,
  created_at timestamptz not null default now()
);

create table public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  position integer not null,
  target_sets integer not null check (target_sets > 0),
  target_reps text not null,
  target_duration_seconds integer check (target_duration_seconds is null or target_duration_seconds >= 0),
  rest_seconds integer not null default 90 check (rest_seconds >= 0),
  notes text,
  superset_group_id uuid,
  created_at timestamptz not null default now(),
  unique (routine_id, position)
);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  routine_id uuid references public.routines(id) on delete set null,
  name text not null,
  started_at timestamptz not null,
  finished_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  position integer not null,
  rest_seconds integer not null default 90 check (rest_seconds >= 0),
  notes text,
  superset_group_id uuid,
  created_at timestamptz not null default now(),
  unique (workout_id, position)
);

create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  position integer not null,
  weight_kg numeric(6,2) check (weight_kg is null or weight_kg >= 0),
  reps integer check (reps is null or reps > 0),
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  rpe numeric(3,1) check (rpe is null or (rpe >= 1 and rpe <= 10)),
  completed boolean not null default false,
  set_type public.workout_set_type not null default 'normal',
  created_at timestamptz not null default now(),
  unique (workout_exercise_id, position)
);

create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_at timestamptz not null default now(),
  weight_kg numeric(5,2),
  chest_cm numeric(5,2),
  shoulders_cm numeric(5,2),
  arms_cm numeric(5,2),
  legs_cm numeric(5,2),
  waist_cm numeric(5,2),
  body_fat_percent numeric(4,1),
  created_at timestamptz not null default now()
);

create table public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  glasses integer not null default 0 check (glasses >= 0 and glasses <= 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index routines_user_id_idx on public.routines(user_id);
create index workouts_user_id_started_at_idx on public.workouts(user_id, started_at desc);
create index measurements_user_id_measured_at_idx on public.measurements(user_id, measured_at desc);
create index water_logs_user_id_log_date_idx on public.water_logs(user_id, log_date desc);

alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.routines enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sets enable row level security;
alter table public.measurements enable row level security;
alter table public.water_logs enable row level security;

create policy profiles_select_own on public.profiles for select using (id = auth.uid());
create policy profiles_insert_own on public.profiles for insert with check (id = auth.uid());
create policy profiles_update_own on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy exercises_read_all on public.exercises for select using (true);

create policy routines_all_own on public.routines for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy routine_exercises_all_own on public.routine_exercises for all using (
  exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid())
) with check (
  exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid())
);

create policy workouts_all_own on public.workouts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy workout_exercises_all_own on public.workout_exercises for all using (
  exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid())
) with check (
  exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid())
);
create policy workout_sets_all_own on public.workout_sets for all using (
  exists (
    select 1 from public.workout_exercises we
    join public.workouts w on w.id = we.workout_id
    where we.id = workout_exercise_id and w.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.workout_exercises we
    join public.workouts w on w.id = we.workout_id
    where we.id = workout_exercise_id and w.user_id = auth.uid()
  )
);

create policy measurements_all_own on public.measurements for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy water_logs_all_own on public.water_logs for all using (user_id = auth.uid()) with check (user_id = auth.uid());
