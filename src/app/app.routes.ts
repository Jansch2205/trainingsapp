import {Routes} from '@angular/router';
import {AddWorkoutPlan} from './add-workout-plan/add-workout-plan';
import {HomePage} from './home-page';
import {OpenWorkoutPlan} from './open-workout-plan/open-workout-plan';
import {OpenExercise} from './open-workout-plan/open-exercise/open-exercise';
import {AllExercises} from './all-exercises/all-exercises';
import {ConfigureGroups} from './configure-groups/configure-groups';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'workoutHinzufuegen', component: AddWorkoutPlan },
  { path: 'workoutHinzufuegen/:id', component: AddWorkoutPlan },
  { path: 'workout/:id', component: OpenWorkoutPlan },
  { path: 'exercise/:wid/:exid', component: OpenExercise },
  { path: 'exercisesVerwalten', component: AllExercises },
  { path: 'gruppenVerwalten', component: ConfigureGroups },
];
