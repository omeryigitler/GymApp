import { Exercise } from '../types';

export function ExercisePicker({ onClose }: { onPick: (ex: Exercise) => void; onClose: () => void }) {
  return (
    <div>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
