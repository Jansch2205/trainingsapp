import {WorkoutExercise} from './exercise';

export interface Workout {
  id: number
  name: string
  workoutExercises: WorkoutExercise[]
  started: boolean
  lastFinished?: string
  group?: string;
}
