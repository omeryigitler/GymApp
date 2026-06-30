import { describe, expect, it } from "vitest";
import { quickWorkoutSchema } from "./quick-workout-schema";

const exerciseId = "11111111-1111-4111-8111-111111111111";

describe("quickWorkoutSchema", () => {
  it("accepts a valid quick workout input", () => {
    const result = quickWorkoutSchema.safeParse({
      name: "Push day",
      exerciseId,
      weightKg: 80,
      reps: "8",
      rpe: 8,
      notes: "Controlled tempo"
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Push day");
      expect(result.data.reps).toBe(8);
      expect(result.data.weightKg).toBe(80);
    }
  });

  it("rejects an empty workout name", () => {
    const result = quickWorkoutSchema.safeParse({
      name: "   ",
      exerciseId,
      weightKg: 80,
      reps: 8,
      rpe: 8
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid exercise ids", () => {
    const result = quickWorkoutSchema.safeParse({
      name: "Push day",
      exerciseId: "bench-press",
      weightKg: 80,
      reps: 8,
      rpe: 8
    });

    expect(result.success).toBe(false);
  });

  it("rejects zero reps", () => {
    const result = quickWorkoutSchema.safeParse({
      name: "Push day",
      exerciseId,
      weightKg: 80,
      reps: 0,
      rpe: 8
    });

    expect(result.success).toBe(false);
  });

  it("rejects negative weight", () => {
    const result = quickWorkoutSchema.safeParse({
      name: "Push day",
      exerciseId,
      weightKg: -1,
      reps: 8,
      rpe: 8
    });

    expect(result.success).toBe(false);
  });

  it("rejects rpe outside the 1 to 10 range", () => {
    const result = quickWorkoutSchema.safeParse({
      name: "Push day",
      exerciseId,
      weightKg: 80,
      reps: 8,
      rpe: 11
    });

    expect(result.success).toBe(false);
  });
});
