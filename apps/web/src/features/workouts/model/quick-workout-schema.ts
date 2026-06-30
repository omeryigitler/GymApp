import { z } from "zod";

const numberFromForm = z.coerce.number();

export const quickWorkoutSchema = z.object({
  name: z.string().trim().min(1, "Antrenman adı zorunlu."),
  exerciseId: z.string().uuid("Geçerli bir egzersiz seç."),
  weightKg: numberFromForm.nonnegative("Ağırlık negatif olamaz.").nullable().optional(),
  reps: numberFromForm.int("Tekrar tam sayı olmalı.").positive("Tekrar 1 veya daha fazla olmalı."),
  rpe: numberFromForm.min(1).max(10).nullable().optional(),
  notes: z.string().trim().max(500).optional()
});

export type QuickWorkoutInput = z.infer<typeof quickWorkoutSchema>;
