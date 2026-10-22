import {Component, Inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {Workout} from '../interface/workout';
import {WorkoutExercise} from '../interface/exercise';

export interface WorkoutExerciseConfigurationSource {
  workout: Workout;
  workoutExercise: WorkoutExercise;
}

interface CopyWorkoutExerciseDialogData {
  exerciseName: string;
  sources: WorkoutExerciseConfigurationSource[];
  isEditMode: boolean;
}

@Component({
  selector: 'app-copy-workout-exercise-popup',
  imports: [MatButton, MatDialogActions, MatDialogContent, MatDialogTitle],
  templateUrl: './copy-workout-exercise-popup.html',
  styleUrl: './copy-workout-exercise-popup.scss',
})
export class CopyWorkoutExercisePopup {
  selectedSource: WorkoutExerciseConfigurationSource | null = null;
  confirmingOverwrite = false;

  constructor(
    private dialogRef: MatDialogRef<CopyWorkoutExercisePopup>,
    @Inject(MAT_DIALOG_DATA) public data: CopyWorkoutExerciseDialogData
  ) {}

  selectSource(source: WorkoutExerciseConfigurationSource): void {
    this.selectedSource = source;
    this.confirmingOverwrite = false;
  }

  onApply(): void {
    if (!this.selectedSource) {
      return;
    }

    if (this.data.isEditMode && !this.confirmingOverwrite) {
      this.confirmingOverwrite = true;
      return;
    }

    this.dialogRef.close({workoutExercise: this.selectedSource.workoutExercise});
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getGroupName(workout: Workout): string {
    return workout.group?.trim() || 'Keine Gruppe';
  }

  isSelected(source: WorkoutExerciseConfigurationSource): boolean {
    return this.selectedSource?.workout.id === source.workout.id;
  }
}
