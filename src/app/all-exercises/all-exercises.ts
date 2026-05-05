import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MatButton, MatFabButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {Exercise} from '../interface/exercise';
import {StorageService} from '../services/storage';
import {MatIcon} from '@angular/material/icon';
import {Workout} from '../interface/workout';
import {MatDialog} from '@angular/material/dialog';
import {AddExercisePopup} from '../add-exercise-popup/add-exercise-popup';
import {ConfirmationPopup} from '../confirmation-popup/confirmation-popup';

@Component({
  selector: 'app-all-exercises',
  imports: [
    MatButton,
    RouterLink,
    MatFabButton,
    MatIcon
  ],
  templateUrl: './all-exercises.html',
  styleUrl: './all-exercises.scss',
})
export class AllExercises implements OnInit {
  exercises!: Exercise[];

  constructor(
    private storage : StorageService,
    private dialog : MatDialog,
    private cdr : ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const allExercises = this.storage.getArray<Exercise>('all_exercises');

    this.exercises = allExercises.sort((a, b) => {
      if (a.machineNumber === b.machineNumber) {
        return a.name.localeCompare(b.name);
      }
      return a.machineNumber - b.machineNumber;
    });
  }

  editExercise(exercise: Exercise) {
    const dialogRef = this.dialog.open(AddExercisePopup, {
      width: '300px',
      data: exercise
    });

    dialogRef.afterClosed().subscribe((result: { exercise: Exercise }) => {
      if (result) {
        const updatedEx = result.exercise;

        const index = this.exercises.findIndex(exercise => exercise.id === updatedEx.id);
        if (index > -1) {
          this.exercises[index] = updatedEx;
        }

        this.storage.saveArray<Exercise>('all_exercises', this.exercises);
        this.cdr.detectChanges();
      }
    });
  }

  deleteAll() {
    const dialogRef = this.dialog.open(ConfirmationPopup, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe((result: { confirmt: boolean } | false) => {
      if (result && result.confirmt) {
        this.exercises = [];

        this.storage.saveArray<Exercise>('all_exercises', []);

        let allWorkouts = this.storage.getArray<Workout>('workout_plans');
        allWorkouts = allWorkouts.map(workout => {
          workout.workoutExercises = [];
          return workout;
        });

        this.storage.saveArray<Workout>('workout_plans', allWorkouts);
        this.cdr.detectChanges();
      }
    });
  }

  deleteOnePopup(id: number) {
    const dialogRef = this.dialog.open(ConfirmationPopup, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe((result: { confirmt: boolean } | false) => {
      if (result && result.confirmt) {
        this.deleteOne(id);
      }
    });
  }

  deleteOne(id: number) {
    const index = this.exercises.findIndex(ex => ex.id === id);
    if (index > -1) {
      this.exercises.splice(index, 1);
      this.storage.saveArray<Exercise>('all_exercises', this.exercises);
    }

    let allWorkouts = this.storage.getArray<Workout>('workout_plans');

    allWorkouts = allWorkouts.map(workout => {
      workout.workoutExercises = workout.workoutExercises.filter(ex => ex.id !== id);
      return workout;
    });

    this.storage.saveArray<Workout>('workout_plans', allWorkouts);
    this.cdr.detectChanges();
  }
}
