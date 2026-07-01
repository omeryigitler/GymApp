export interface RoutineExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: string;
  targetDurationSeconds: number | null;
  restSeconds: number;
  notes: string | null;
  supersetGroupId: string | null;
}

export interface Routine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
}
