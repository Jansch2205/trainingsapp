import {WorkoutExercise} from './exercise';

export interface Workout {
  id: number;
  name: string;
  workoutExercises: WorkoutExercise[];
  started: boolean;
  finishedHistory: string[];
  group?: string;
}
