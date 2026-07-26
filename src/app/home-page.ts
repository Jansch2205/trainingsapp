import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Workout} from './interface/workout';
import {MatDialog} from '@angular/material/dialog';
import {StorageService} from './services/storage';
import {MatButton, MatFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ConfirmationPopup} from './confirmation-popup/confirmation-popup';
import {Exercise} from './interface/exercise';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'home-page-root',
  imports: [
    MatButton,
    MatIcon,
    MatFabButton,
    RouterLink,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss'
})
export class HomePage implements OnInit {
  workoutPlans: Workout[] = [];
  allExercises: Exercise[] = [];

  constructor(
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private storage: StorageService
  ) {}

  ngOnInit() {
    this.workoutPlans = this.storage.getArray<Workout>('workout_plans');
    this.allExercises = this.storage.getArray<Exercise>('all_exercises');
    setTimeout(() => {
      this.updateAll();
    });
  }

  private updateAll() {
    this.workoutPlans.sort((a, b) => b.id - a.id);

    this.workoutPlans.forEach((workout: Workout) => {
      workout.started = workout.workoutExercises.some(exercise => exercise.finishedSets !== 0);
    });

    this.allExercises.sort((a, b) => b.id - a.id);
    this.storage.saveArray<Workout>('workout_plans', this.workoutPlans);
    this.storage.saveArray<Exercise>('all_exercises', this.allExercises);
    this.cdr.detectChanges();
  }

  deleteOne(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationPopup, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe((result: { confirmt: boolean } | false) => {
      if (result) {
        const index = this.workoutPlans.findIndex(entry => entry.id === id);
        this.workoutPlans.splice(index, 1);
        this.updateAll()
      }
    });
  }

  test() {
    const newWorkout: Workout = {
      id: 1,
      name: 'Ganzkörper A',
      started: false,
      group: 'Kraftaufbau',
      finishedHistory: [],
      workoutExercises: [
        {
          id: 101,
          sets: 3,
          reps: 10,
          weight: 70,
          finishedSets: 0,
          weightHistory: [
            { date: new Date('2026-06-01'), weight: 60.0 },
            { date: new Date('2026-06-05'), weight: 62.5 },
            { date: new Date('2026-06-12'), weight: 65.0 },
            { date: new Date('2026-06-15'), weight: 100.0 },
            { date: new Date('2026-07-02'), weight: 67.5 },
            { date: new Date('2026-07-20'), weight: 70.0 }
          ]
        },
        {
          id: 102,
          sets: 4,
          reps: 8,
          weight: 100,
          finishedSets: 0,
          weightHistory: [
            { date: new Date('2025-01-05'), weight: 65.0 },
            { date: new Date('2026-01-12'), weight: 67.5 },
            { date: new Date('2026-01-18'), weight: 70.0 },
            { date: new Date('2026-01-25'), weight: 70.0 },
            { date: new Date('2026-02-01'), weight: 72.5 },
            { date: new Date('2026-02-08'), weight: 72.5 },
            { date: new Date('2026-02-15'), weight: 75.0 },
            { date: new Date('2026-02-22'), weight: 75.0 },
            { date: new Date('2026-03-01'), weight: 77.5 },
            { date: new Date('2026-03-08'), weight: 77.5 },
            { date: new Date('2026-03-15'), weight: 80.0 },
            { date: new Date('2026-03-22'), weight: 80.0 },
            { date: new Date('2026-03-29'), weight: 82.5 },
            { date: new Date('2026-04-05'), weight: 80.0 },
            { date: new Date('2026-04-12'), weight: 82.5 },
            { date: new Date('2026-04-19'), weight: 85.0 },
            { date: new Date('2026-04-26'), weight: 85.0 },
            { date: new Date('2026-05-03'), weight: 87.5 },
            { date: new Date('2026-05-10'), weight: 87.5 },
            { date: new Date('2026-05-17'), weight: 90.0 },
            { date: new Date('2026-05-24'), weight: 90.0 },
            { date: new Date('2026-05-31'), weight: 92.5 },
            { date: new Date('2026-06-07'), weight: 92.5 },
            { date: new Date('2026-06-14'), weight: 95.0 },
            { date: new Date('2026-06-21'), weight: 95.0 },
            { date: new Date('2026-06-28'), weight: 97.5 },
            { date: new Date('2026-07-05'), weight: 97.5 },
            { date: new Date('2026-07-12'), weight: 100.0 },
            { date: new Date('2026-07-19'), weight: 100.0 },
            { date: new Date('2026-07-26'), weight: 102.5 }
          ]
        }
      ]
    };

    const newExercises: Exercise[] = [
      {
        id: 101,
        name: 'Bankdrücken',
        machineNumber: 12,
        notes: 'Sitzhöhe 3, Schultern fest an die Bank drücken'
      },
      {
        id: 102,
        name: 'Beinpresse',
        machineNumber: 5,
        notes: 'Füße hüftbreit, Knie nicht ganz durchdrücken'
      }
    ];

    const currentWorkouts = this.storage.getArray<Workout>('workout_plans');
    currentWorkouts.push(newWorkout);
    this.storage.saveArray('workout_plans', currentWorkouts);

    const currentExercises = this.storage.getArray<Exercise>('all_exercises');
    currentExercises.push(...newExercises);
    this.storage.saveArray('all_exercises', currentExercises);

    this.workoutPlans = currentWorkouts;
    this.allExercises = currentExercises;
  }
}

