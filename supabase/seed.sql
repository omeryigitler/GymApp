insert into public.exercises (slug, name_tr, name_en, muscle_group_tr, muscle_group_en) values
  ('bench-press-barbell', 'Bench Press (Barbell)', 'Bench Press (Barbell)', 'Göğüs', 'Chest'),
  ('incline-bench-press-dumbbell', 'Incline Bench Press (Dumbbell)', 'Incline Bench Press (Dumbbell)', 'Göğüs', 'Chest'),
  ('deadlift-barbell', 'Deadlift (Barbell)', 'Deadlift (Barbell)', 'Sırt', 'Back'),
  ('lat-pulldown-cable', 'Lat Pulldown (Cable)', 'Lat Pulldown (Cable)', 'Sırt', 'Back'),
  ('squat-barbell', 'Squat (Barbell)', 'Squat (Barbell)', 'Bacak', 'Legs'),
  ('leg-press', 'Leg Press', 'Leg Press', 'Bacak', 'Legs'),
  ('overhead-press-dumbbell', 'Overhead Press (Dumbbell)', 'Overhead Press (Dumbbell)', 'Omuz', 'Shoulders'),
  ('lateral-raise-dumbbell', 'Lateral Raise (Dumbbell)', 'Lateral Raise (Dumbbell)', 'Omuz', 'Shoulders'),
  ('bicep-curl-dumbbell', 'Bicep Curl (Dumbbell)', 'Bicep Curl (Dumbbell)', 'Kol', 'Arms'),
  ('tricep-pushdown-cable', 'Tricep Pushdown (Cable)', 'Tricep Pushdown (Cable)', 'Kol', 'Arms'),
  ('plank', 'Plank', 'Plank', 'Merkez', 'Core'),
  ('treadmill', 'Koşu Bandı', 'Treadmill', 'Kardiyo', 'Cardio')
on conflict (slug) do update set
  name_tr = excluded.name_tr,
  name_en = excluded.name_en,
  muscle_group_tr = excluded.muscle_group_tr,
  muscle_group_en = excluded.muscle_group_en;
