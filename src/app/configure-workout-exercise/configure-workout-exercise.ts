import {Component, Inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {StorageService} from '../services/storage';
import {Exercise, WorkoutExercise} from '../interface/exercise';
import {Router} from '@angular/router';

@Component({
  selector: 'app-configure-workout-exercise',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogTitle,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule
  ],
  templateUrl: './configure-workout-exercise.html',
  styleUrl: './configure-workout-exercise.scss',
})
export class ConfigureWorkoutExercise {
  exercise!: Exercise;
  allExercises: Exercise[] = [];

  exerciseForm = new FormGroup({
    sets: new FormControl(3, [Validators.required, Validators.min(1)]),
    reps: new FormControl(10, [Validators.required, Validators.min(1)]),
    weight: new FormControl(0, [Validators.required, Validators.min(1)]),
  });

  constructor(
    private dialogRef: MatDialogRef<ConfigureWorkoutExercise>,
    private storage: StorageService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: WorkoutExercise
  ) {}

  ngOnInit() {
    if (this.data) {
      this.exerciseForm.patchValue(this.data);
      this.allExercises = this.storage.getArray<Exercise>('all_exercises');
      const foundExercise = this.allExercises.find(ex => ex.id === this.data?.id);
      if (foundExercise) {
        this.exercise = foundExercise;
      }
    }

    if(!this.data || !this.exercise) {
      this.router.navigate(['/']);
    }
  }

  onSave(): void {
    if (this.exerciseForm.valid) {
      const formValue = this.exerciseForm.value;

      const heute = new Date();

      let workoutExercise: WorkoutExercise = {
        id: this.data.id,
        sets: formValue.sets ?? 0,
        reps: formValue.reps ?? 0,
        weight: formValue.weight ?? 0,
        finishedSets: this.data ? this.data.finishedSets : 0,
        lastWeightChange: heute.toLocaleDateString('de-DE', {day: '2-digit', month: 'long', year: 'numeric'})
      };

      this.dialogRef.close({workoutExercise: workoutExercise});
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
