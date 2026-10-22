import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatError, MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {Exercise, WorkoutExercise} from '../interface/exercise';
import {MatDialog} from '@angular/material/dialog';
import {StorageService} from '../services/storage';
import {MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {MatOption} from '@angular/material/core';
import {AddExercisePopup} from '../add-exercise-popup/add-exercise-popup';
import {Workout} from '../interface/workout';
import {FormsModule} from '@angular/forms';
import {History} from '../interface/history';
import {CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatIcon} from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CopyWorkoutExercisePopup, WorkoutExerciseConfigurationSource} from '../copy-workout-exercise-popup/copy-workout-exercise-popup';

@Component({
  selector: 'app-add-workout-plan',
  imports: [
    MatButton,
    RouterLink,
    MatFormField,
    MatLabel,
    MatInput,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOption,
    FormsModule,
    MatError,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    MatIcon
  ],
  templateUrl: './add-workout-plan.html',
  styleUrl: './add-workout-plan.scss',
})
export class AddWorkoutPlan implements OnInit {
  name = ""
  exercise: Exercise[] = []
  allExercises: Exercise[] = []
  exerciseSearch = '';
  existingWorkoutExercises: WorkoutExercise[] = [];

  constructor(
    private dialog: MatDialog,
    private storage: StorageService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  get isEditMode(): boolean {
    return this.route.snapshot.paramMap.has('id');
  }

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
      width: '360px',
      maxWidth: '90vw'
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
        let history: History[] = []
        return {
          id: ex.id,
          reps: 10,
          sets: 3,
          weight: 0,
          finishedSets: 0,
          weightHistory: history
        };
      }
    });

    if (id) {
      const index = workouts.findIndex(w => w.id === Number(id));
      if (index !== -1) {
        const existingWorkout = workouts[index];
        workouts[index] = {
          id: Number(id),
          name: this.name,
          workoutExercises: workoutExercises,
          started: false,
          finishedHistory: existingWorkout.finishedHistory,
          group: existingWorkout.group,
          groupOrder: existingWorkout.groupOrder
        };
      }
    } else {
      let workout = {
        id: Date.now(),
        name: this.name,
        workoutExercises: workoutExercises,
        started: false,
        finishedHistory: []
      };
      workouts.unshift(workout);
    }

    this.storage.saveArray<Workout>('workout_plans', workouts);
  }

  compareExercises(ex1: Exercise, ex2: Exercise): boolean {
    return ex1 && ex2 ? ex1.id === ex2.id : ex1 === ex2;
  }

  get filteredExercises(): Exercise[] {
    const search = this.exerciseSearch.trim().toLocaleLowerCase();
    return this.allExercises.filter(exercise =>
      !this.exercise.some(selected => selected.id === exercise.id) &&
      (exercise.name.toLocaleLowerCase().includes(search) ||
        String(exercise.machineNumber).includes(search))
    );
  }

  displayExercise(exercise: Exercise | string | null): string {
    return typeof exercise === 'string' ? exercise : exercise?.name ?? '';
  }

  addExistingExercise(event: MatAutocompleteSelectedEvent): void {
    const exercise = event.option.value as Exercise;
    if (!this.exercise.some(selected => selected.id === exercise.id)) {
      this.exercise = [...this.exercise, exercise];
    }
    this.exerciseSearch = '';
  }

  removeExercise(exerciseId: number): void {
    this.exercise = this.exercise.filter(exercise => exercise.id !== exerciseId);
  }

  dropExercise(event: CdkDragDrop<Exercise[]>): void {
    moveItemInArray(this.exercise, event.previousIndex, event.currentIndex);
  }

  configureExercise(exercise: Exercise): void {
    const currentWorkoutId = Number(this.route.snapshot.paramMap.get('id'));
    const workouts = this.storage.getArray<Workout>('workout_plans');
    const sources: WorkoutExerciseConfigurationSource[] = workouts
      .filter(workout => !this.isEditMode || workout.id !== currentWorkoutId)
      .flatMap(workout => {
        const workoutExercise = workout.workoutExercises.find(item => item.id === exercise.id);
        return workoutExercise ? [{workout, workoutExercise}] : [];
      });

    if (sources.length === 0) {
      this.snackBar.open(
        'Für diese Übung gibt es keine Konfiguration in einem anderen Trainingsplan.',
        'Schließen',
        {duration: 4000}
      );
      return;
    }

    const dialogRef = this.dialog.open(CopyWorkoutExercisePopup, {
      width: 'min(90vw, 420px)',
      data: {
        exerciseName: exercise.name,
        sources,
        isEditMode: this.isEditMode
      }
    });

    dialogRef.afterClosed().subscribe((result: { workoutExercise: WorkoutExercise } | false) => {
      if (result) {
        const currentConfiguration = this.existingWorkoutExercises.find(item => item.id === exercise.id);
        const copiedConfiguration: WorkoutExercise = {
          ...result.workoutExercise,
          id: exercise.id,
          finishedSets: currentConfiguration?.finishedSets ?? 0,
          weightHistory: currentConfiguration?.weightHistory ?? []
        };
        const existingIndex = this.existingWorkoutExercises.findIndex(item => item.id === exercise.id);

        if (existingIndex === -1) {
          this.existingWorkoutExercises = [...this.existingWorkoutExercises, copiedConfiguration];
        } else {
          this.existingWorkoutExercises = this.existingWorkoutExercises.map(item =>
            item.id === exercise.id ? copiedConfiguration : item
          );
        }
      }
    });
  }
}
