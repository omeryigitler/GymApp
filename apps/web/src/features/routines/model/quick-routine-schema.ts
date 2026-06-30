import { z } from "zod";

const numberFromForm = z.coerce.number();

export const quickRoutineSchema = z.object({
  name: z.string().trim().min(1, "Routine name is required."),
  exerciseId: z.string().uuid("Select a valid exercise."),
  targetSets: numberFromForm.int("Sets must be an integer.").positive("Sets must be at least 1."),
  targetReps: z.string().trim().min(1, "Target reps are required."),
  restSeconds: numberFromForm.int("Rest must be an integer.").min(0, "Rest cannot be negative."),
  notes: z.string().trim().max(500).optional()
});

export type QuickRoutineInput = z.infer<typeof quickRoutineSchema>;
