import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MatButton, MatFabButton} from '@angular/material/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StorageService } from '../../services/storage';
import {Exercise, WorkoutExercise} from '../../interface/exercise';
import { Workout } from '../../interface/workout';
import {AddExercisePopup} from '../../add-exercise-popup/add-exercise-popup';
import {MatDialog} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {ConfigureWorkoutExercise} from '../../configure-workout-exercise/configure-workout-exercise';

@Component({
  selector: 'app-open-exercise',
  standalone: true,
  imports: [MatButton, RouterLink, MatFabButton, MatIcon],
  templateUrl: './open-exercise.html',
  styleUrl: './open-exercise.scss',
})
export class OpenExercise implements OnInit {
  exercise!: Exercise;
  workoutExercise!: WorkoutExercise;
  workout!: Workout;

  constructor(
    private route: ActivatedRoute,
    private storage: StorageService,
    private dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const workoutId = Number(this.route.snapshot.paramMap.get('wid'));
    const exId = Number(this.route.snapshot.paramMap.get('exid'));

    const workouts = this.storage.getArray<Workout>('workout_plans');
    const foundWorkout = workouts.find(w => w.id === workoutId);

    if (!foundWorkout) {
      this.router.navigate(['/']);
      return;
    }

    this.workout = foundWorkout;
    const foundWorkoutExercise = this.workout.workoutExercises.find(ex => ex.id === exId);

    if (!foundWorkoutExercise) {
      this.router.navigate(['/workout', this.workout.id]);
      return;
    }

    this.workoutExercise = foundWorkoutExercise;

    const allExercises = this.storage.getArray<Exercise>('all_exercises');
    const foundExercise = allExercises.find(ex => ex.id === exId);

    if (!foundExercise) {
      this.router.navigate(['/workout', this.workout.id]);
      return;
    }

    this.exercise = foundExercise;
  }

  finishSet() {
    if (this.workoutExercise.finishedSets >= this.workoutExercise.sets) return;

    this.workoutExercise.finishedSets++;

    this.saveWorkoutToStorage();

    if (this.workoutExercise.finishedSets === this.workoutExercise.sets) {
      this.router.navigate(['/workout', this.workout.id]);
    }
  }

  private saveWorkoutToStorage() {
    const workouts = this.storage.getArray<Workout>('workout_plans');
    const index = workouts.findIndex(w => w.id === this.workout.id);

    if (index !== -1) {
      workouts[index] = this.workout;
      this.storage.saveArray<Workout>('workout_plans', workouts);
    }
  }

  editExercise() {
    const dialogRef = this.dialog.open(ConfigureWorkoutExercise, {
      width: '300px',
      data: this.workoutExercise
    });

    dialogRef.afterClosed().subscribe((result: { workoutExercise: WorkoutExercise } | false) => {
      if (result) {
        const updatedEx = result.workoutExercise;

        this.workoutExercise = { ...updatedEx };

        const index = this.workout.workoutExercises.findIndex(ex => ex.id === updatedEx.id);
        if (index !== -1) {
          this.workout.workoutExercises[index] = updatedEx;
        }

        let allWorkouts = this.storage.getArray<Workout>('workout_plans');

        const workoutIndex = allWorkouts.findIndex(w => w.id === this.workout.id);
        if (workoutIndex !== -1) {
          allWorkouts[workoutIndex] = this.workout;
        }

        this.storage.saveArray<Workout>('workout_plans', allWorkouts);
        this.cdr.detectChanges();
      }
    });
  }
}
