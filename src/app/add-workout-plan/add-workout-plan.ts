import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatError, MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {Exercise, WorkoutExercise} from '../interface/exercise';
import {MatDialog} from '@angular/material/dialog';
import {StorageService} from '../services/storage';
import {MatOption, MatSelect, MatSelectChange} from '@angular/material/select';
import {AddExercisePopup} from '../add-exercise-popup/add-exercise-popup';
import {Workout} from '../interface/workout';
import {FormsModule} from '@angular/forms';
import {ConfigureWorkoutExercise} from '../configure-workout-exercise/configure-workout-exercise';

@Component({
  selector: 'app-add-workout-plan',
  imports: [
    MatButton,
    RouterLink,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    FormsModule,
    MatError
  ],
  templateUrl: './add-workout-plan.html',
  styleUrl: './add-workout-plan.scss',
})
export class AddWorkoutPlan implements OnInit {
  name = ""
  exercise: Exercise[] = []
  allExercises: Exercise[] = []
  existingWorkoutExercises: WorkoutExercise[] = [];

  constructor(
    private dialog: MatDialog,
    private storage: StorageService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.allExercises = this.storage.getArray<Exercise>('all_exercises');
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      const workouts = this.storage.getArray<Workout>('workout_plans');
      const workout = workouts.find(w => w.id === Number(id));

      if (workout) {
        this.name = workout.name;
        this.existingWorkoutExercises = [...workout.workoutExercises];

        this.exercise = [];
        this.existingWorkoutExercises.forEach(we => {
          const found = this.allExercises.find(e => e.id === we.id);
          if (found) {
            this.exercise.push(found);
          }
        });

        this.cdr.detectChanges();
      }
    }
  }

  addExercise() {
    const dialogRef = this.dialog.open(AddExercisePopup, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe((result: { exercise: Exercise } | false) => {
      if (result) {
        this.allExercises = [...this.allExercises, result.exercise];
        this.exercise = [...this.exercise, result.exercise];

        this.storage.saveArray<Exercise>('all_exercises', this.allExercises);
        this.cdr.detectChanges();
      }
    });
  }

  saveWorkout() {
    let workouts = this.storage.getArray<Workout>('workout_plans');
    const id = this.route.snapshot.paramMap.get('id');

    let workoutExercises: WorkoutExercise[] = this.exercise.map(ex => {
      const savedConfig = this.existingWorkoutExercises.find(we => we.id === ex.id);

      if (savedConfig) {
        return savedConfig;
      } else {
        return {
          id: ex.id,
          reps: 10,
          sets: 3,
          weight: 0,
          finishedSets: 0
        };
      }
    });

    if (id) {
      const index = workouts.findIndex(w => w.id === Number(id));
      if (index !== -1) {
        workouts[index] = {
          id: Number(id),
          name: this.name,
          workoutExercises: workoutExercises,
          started: false
        };
      }
    } else {
      let workout = {
        id: Date.now(),
        name: this.name,
        workoutExercises: workoutExercises,
        started: false
      };
      workouts.unshift(workout);
    }

    this.storage.saveArray<Workout>('workout_plans', workouts);
  }

  compareExercises(ex1: Exercise, ex2: Exercise): boolean {
    return ex1 && ex2 ? ex1.id === ex2.id : ex1 === ex2;
  }

  onSelectionChange(event: MatSelectChange) {
    const currentSelection = event.value as Exercise[];

    const updatedOrder = this.exercise.filter(ex =>
      currentSelection.some(s => s.id === ex.id)
    );

    currentSelection.forEach(s => {
      const isNew = !updatedOrder.some(ex => ex.id === s.id);
      if (isNew) {
        updatedOrder.push(s);
      }
    });

    this.exercise = updatedOrder;
    this.cdr.detectChanges();
  }

  // FUNKTIONIERT NOCH NICHT
  configureExercise(exercise: Exercise): void {
    return;
    let workoutExercise = {id: exercise.id, reps: 10, sets: 3, weight: 0, finishedSets: 0};

    const dialogRef = this.dialog.open(ConfigureWorkoutExercise, {
      width: '300px',
      data: workoutExercise
    });

    dialogRef.afterClosed().subscribe((result: { workoutExercise: WorkoutExercise } | false) => {
      if (result) {

      }
    });
  }
}
