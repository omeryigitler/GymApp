import { describe, expect, it } from "vitest";
import { quickRoutineSchema } from "./quick-routine-schema";

const exerciseId = "11111111-1111-4111-8111-111111111111";

describe("quickRoutineSchema", () => {
  it("accepts a valid quick routine input", () => {
    const result = quickRoutineSchema.safeParse({
      name: "Upper body starter",
      exerciseId,
      targetSets: "3",
      targetReps: "8-12",
      restSeconds: "90",
      notes: "Start light"
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Upper body starter");
      expect(result.data.targetSets).toBe(3);
      expect(result.data.restSeconds).toBe(90);
    }
  });

  it("rejects an empty routine name", () => {
    const result = quickRoutineSchema.safeParse({
      name: "   ",
      exerciseId,
      targetSets: 3,
      targetReps: "8-12",
      restSeconds: 90
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid exercise ids", () => {
    const result = quickRoutineSchema.safeParse({
      name: "Upper body starter",
      exerciseId: "lat-pulldown",
      targetSets: 3,
      targetReps: "8-12",
      restSeconds: 90
    });

    expect(result.success).toBe(false);
  });

  it("rejects zero target sets", () => {
    const result = quickRoutineSchema.safeParse({
      name: "Upper body starter",
      exerciseId,
      targetSets: 0,
      targetReps: "8-12",
      restSeconds: 90
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty target reps value", () => {
    const result = quickRoutineSchema.safeParse({
      name: "Upper body starter",
      exerciseId,
      targetSets: 3,
      targetReps: "   ",
      restSeconds: 90
    });

    expect(result.success).toBe(false);
  });

  it("rejects negative rest seconds", () => {
    const result = quickRoutineSchema.safeParse({
      name: "Upper body starter",
      exerciseId,
      targetSets: 3,
      targetReps: "8-12",
      restSeconds: -15
    });

    expect(result.success).toBe(false);
  });
});
