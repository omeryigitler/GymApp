import { z } from "zod";

const setSchema = z.object({
  weightKg: z.number().nonnegative().nullable(),
  reps: z.number().int().positive().nullable(),
  done: z.boolean()
});

const exerciseSchema = z.object({
  exerciseId: z.string().min(1),
  exerciseName: z.string().min(1),
  sets: z.array(setSchema).min(1)
});

export const workoutSaveSchema = z.object({
  name: z.string().trim().min(1),
  exercises: z.array(exerciseSchema).min(1)
});

export type WorkoutSaveInput = z.infer<typeof workoutSaveSchema>;
