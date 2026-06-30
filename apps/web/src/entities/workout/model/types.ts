export type WorkoutSetType = "normal" | "warmup" | "dropset";

export interface WorkoutSet {
  id: string;
  weightKg: number | null;
  reps: number | null;
  completed: boolean;
  type: WorkoutSetType;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  name: string;
  startedAt: string;
  finishedAt: string | null;
  exercises: WorkoutExercise[];
}
