import {History} from './history';

export interface Exercise {
  id: number;
  name: string;
  machineNumber: number;
  notes: string;
}

export interface WorkoutExercise {
  id: number;
  sets: number;
  reps: number;
  weight: number;
  finishedSets: number;
  weightHistory: History[];
}
