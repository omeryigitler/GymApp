import { z } from "zod";

const numberFromForm = z.coerce.number();

export const quickWorkoutSetSchema = z.object({
  position: numberFromForm.int().positive(),
  weightKg: numberFromForm.nonnegative("Ağırlık negatif olamaz.").nullable().optional(),
  reps: numberFromForm.int("Tekrar tam sayı olmalı.").positive("Tekrar 1 veya daha fazla olmalı."),
  rpe: numberFromForm.min(1).max(10).nullable().optional()
});

export const quickWorkoutSchema = z.object({
  name: z.string().trim().min(1, "Antrenman adı zorunlu."),
  exerciseId: z.string().uuid("Geçerli bir egzersiz seç."),
  restSeconds: numberFromForm.int().min(0).max(600).default(90),
  sets: z.array(quickWorkoutSetSchema).min(1, "En az bir set gerekli.").max(5),
  notes: z.string().trim().max(500).optional()
});

export type QuickWorkoutInput = z.infer<typeof quickWorkoutSchema>;
