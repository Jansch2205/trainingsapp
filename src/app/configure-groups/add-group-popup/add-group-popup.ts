import {Component, OnInit} from '@angular/core';
import { MatButton } from '@angular/material/button';
import {MatDialogActions, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {StorageService} from '../../services/storage';
import {Workout} from '../../interface/workout';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {Exercise} from '../../interface/exercise';

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
    MatError,
    MatOption,
    MatSelect,
    FormsModule
  ],
  templateUrl: './add-group-popup.html',
  styleUrl: './add-group-popup.scss',
})
export class AddGroupPopup implements OnInit {
  name = "";
  workouts: Workout[] = [];
  selectedWorkouts: Workout[] = [];

  constructor(
    private dialogRef: MatDialogRef<AddGroupPopup>,
    private storage: StorageService,
  ) {}

  ngOnInit() {
    this.workouts = this.storage.getArray<Workout>('workout_plans');
  }

  onSave(): void {
    this.selectedWorkouts.forEach(workout => {
      const index = this.workouts.findIndex(w => w.id === workout.id);
      if (index > -1) {
        this.workouts[index].group = this.name;
        console.log(this.workouts[index].group);
      }
    })
    this.storage.saveArray<Workout>('workout_plans', this.workouts);
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
