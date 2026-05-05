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
}

