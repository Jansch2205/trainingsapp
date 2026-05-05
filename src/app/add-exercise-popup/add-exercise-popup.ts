import {Component, Inject, OnInit} from '@angular/core';
import { MatButton } from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import { Exercise } from '../interface/exercise';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {StorageService} from '../services/storage'; // ReactiveFormsModule wichtig!

@Component({
  selector: 'app-add-exercise-popup',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogTitle,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatError
  ],
  templateUrl: './add-exercise-popup.html',
  styleUrl: './add-exercise-popup.scss',
})
export class AddExercisePopup implements OnInit {
  exerciseExists = false;
  isEditMode = false;

  exerciseForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    machineNumber: new FormControl(0),
    notes: new FormControl('', []),
  });

  constructor(
    private dialogRef: MatDialogRef<AddExercisePopup>,
    private storage: StorageService,
    @Inject(MAT_DIALOG_DATA) public data: Exercise | null
  ) {
  }

  ngOnInit() {
    if (this.data) {
      this.isEditMode = true;
      this.exerciseForm.patchValue(this.data);
    }
  }

  onSave(): void {
    if (this.exerciseForm.valid) {
      const formValue = this.exerciseForm.value;
      const allExercises = this.storage.getArray<Exercise>('all_exercises');

      const alreadyExists = allExercises.some(ex =>
        ex.name.toLowerCase() === formValue.name?.toLowerCase() &&
        ex.id !== this.data?.id
      );

      if (alreadyExists) {
        this.exerciseExists = true;
        return;
      }

      let exercise: Exercise = {
        id: this.data ? this.data.id : Date.now(),
        name: formValue.name ?? '',
        machineNumber: formValue.machineNumber ?? 0,
        notes: formValue.notes ?? '',
      };

      this.dialogRef.close({exercise: exercise});
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
