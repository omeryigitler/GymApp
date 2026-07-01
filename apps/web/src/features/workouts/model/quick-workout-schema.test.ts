import { describe, expect, it } from "vitest";
import { quickWorkoutSchema } from "./quick-workout-schema";

const exerciseId = "11111111-1111-4111-8111-111111111111";

function validInput() {
  return {
    name: "Push day",
    exerciseId,
    restSeconds: "90",
    sets: [
      {
        position: 1,
        weightKg: 80,
        reps: "8",
        rpe: 8
      },
      {
        position: 2,
        weightKg: 75,
        reps: "10",
        rpe: 8.5
      }
    ],
    notes: "Controlled tempo"
  };
}

describe("quickWorkoutSchema", () => {
  it("accepts a valid quick workout input with multiple sets", () => {
    const result = quickWorkoutSchema.safeParse(validInput());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Push day");
      expect(result.data.restSeconds).toBe(90);
      expect(result.data.sets).toHaveLength(2);
      expect(result.data.sets[0].reps).toBe(8);
      expect(result.data.sets[1].weightKg).toBe(75);
    }
  });

  it("rejects an empty workout name", () => {
    const input = validInput();
    const result = quickWorkoutSchema.safeParse({ ...input, name: "   " });

    expect(result.success).toBe(false);
  });

  it("rejects invalid exercise ids", () => {
    const input = validInput();
    const result = quickWorkoutSchema.safeParse({ ...input, exerciseId: "bench-press" });

    expect(result.success).toBe(false);
  });

  it("rejects workouts without sets", () => {
    const input = validInput();
    const result = quickWorkoutSchema.safeParse({ ...input, sets: [] });

    expect(result.success).toBe(false);
  });

  it("rejects zero reps inside a set", () => {
    const input = validInput();
    const result = quickWorkoutSchema.safeParse({
      ...input,
      sets: [{ position: 1, weightKg: 80, reps: 0, rpe: 8 }]
    });

    expect(result.success).toBe(false);
  });

  it("rejects negative weight inside a set", () => {
    const input = validInput();
    const result = quickWorkoutSchema.safeParse({
      ...input,
      sets: [{ position: 1, weightKg: -1, reps: 8, rpe: 8 }]
    });

    expect(result.success).toBe(false);
  });

  it("rejects rpe outside the 1 to 10 range", () => {
    const input = validInput();
    const result = quickWorkoutSchema.safeParse({
      ...input,
      sets: [{ position: 1, weightKg: 80, reps: 8, rpe: 11 }]
    });

    expect(result.success).toBe(false);
  });
});
