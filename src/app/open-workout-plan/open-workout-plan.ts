import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Workout} from '../interface/workout';
import {StorageService} from '../services/storage';
import {MatButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmationPopup} from '../confirmation-popup/confirmation-popup';

@Component({
  selector: 'app-open-workout-plan',
  imports: [
    MatButton,
    RouterLink
  ],
  templateUrl: './open-workout-plan.html',
  styleUrl: './open-workout-plan.scss',
})
export class OpenWorkoutPlan implements OnInit {
  workout!: Workout;

  constructor(
    private route: ActivatedRoute,
    private storage: StorageService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private dialog: MatDialog){}

  get isStarted(): boolean {
    return this.workout.workoutExercises.some(exercise => exercise.finishedSets !== 0);
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const workouts = this.storage.getArray<Workout>('workout_plans');
      let workout = workouts.find(w => w.id === Number(id));
      if(workout){
        this.workout = workout;
        if(!this.workout.finishedHistory) {
          this.workout.finishedHistory = [];
        }
        this.promptToFinishIfAllExercisesAreComplete();
      }
      else {
        this.router.navigate(['/']);
      }
    }
  }

  private promptToFinishIfAllExercisesAreComplete(): void {
    const allExercisesComplete = this.workout.workoutExercises.length > 0 &&
      this.workout.workoutExercises.every(exercise => exercise.finishedSets >= exercise.sets);

    if (!allExercisesComplete) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationPopup, {
      width: 'min(90vw, 420px)',
      data: {
        title: 'Alle Übungen sind abgeschlossen. Möchtest du das Training beenden?',
        cancelLabel: 'Nein',
        confirmLabel: 'Ja',
        confirmColor: 'primary'
      }
    });

    dialogRef.afterClosed().subscribe((result: { confirmt: boolean } | false) => {
      if (result && result.confirmt) {
        this.resetWorkout(true);
        this.router.navigate(['/']);
      }
    });
  }

  resetWorkout(saveDate: boolean) {
    if (!this.isStarted) {
      return;
    }

    const resetExercises = this.workout.workoutExercises.map(ex => ({
      ...ex,
      finishedSets: 0
    }));
    this.workout = {
      ...this.workout,
      workoutExercises: resetExercises,
      started: false
    };

    if (saveDate) {
      const heute = new Date();
      this.workout.finishedHistory.push(heute.toLocaleString('de-DE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    }

    let workouts = this.storage.getArray<Workout>('workout_plans');
    const index = workouts.findIndex(w => w.id === this.workout.id);

    if (index !== -1) {
      workouts[index] = this.workout;
      this.storage.saveArray<Workout>('workout_plans', workouts);
      this.cdr.detectChanges();
    }
  }

  getName(id: number): string {
    const allExercises = this.storage.getArray<Workout>('all_exercises');
    const foundExercise = allExercises.find(ex => ex.id === id);
    if (foundExercise) {
      return foundExercise.name;
    }
    return ""
  }
}
