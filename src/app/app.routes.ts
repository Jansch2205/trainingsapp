import {Routes} from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home-page').then(m => m.HomePage) },
  {
    path: 'workoutHinzufuegen',
    loadComponent: () => import('./add-workout-plan/add-workout-plan').then(m => m.AddWorkoutPlan)
  },
  {
    path: 'workoutHinzufuegen/:id',
    loadComponent: () => import('./add-workout-plan/add-workout-plan').then(m => m.AddWorkoutPlan)
  },
  {
    path: 'workout/:id',
    loadComponent: () => import('./open-workout-plan/open-workout-plan').then(m => m.OpenWorkoutPlan)
  },
  {
    path: 'exercise/:wid/:exid',
    loadComponent: () => import('./open-workout-plan/open-exercise/open-exercise').then(m => m.OpenExercise)
  },
  {
    path: 'exercisesVerwalten',
    loadComponent: () => import('./all-exercises/all-exercises').then(m => m.AllExercises)
  },
  {
    path: 'gruppenVerwalten',
    loadComponent: () => import('./configure-groups/configure-groups').then(m => m.ConfigureGroups)
  },
  {
    path: 'gruppeHinzufuegen',
    loadComponent: () => import('./configure-groups/group-editor/group-editor').then(m => m.GroupEditor)
  },
  {
    path: 'gruppeBearbeiten/:groupName',
    loadComponent: () => import('./configure-groups/group-editor/group-editor').then(m => m.GroupEditor)
  },
  {
    path: 'gewichtsVerlauf/:wid/:exid',
    loadComponent: () => import('./show-history/show-history').then(m => m.ShowHistory)
  },
  {
    path: 'abschlussVerlauf/:wid',
    loadComponent: () => import('./show-workout-history/show-workout-history').then(m => m.ShowWorkoutHistory)
  },
];
