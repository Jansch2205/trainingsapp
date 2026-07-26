import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Workout} from '../interface/workout';
import {StorageService} from '../services/storage';
import {MatButton} from '@angular/material/button';

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
    private router: Router){}

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
      }
      else {
        this.router.navigate(['/']);
      }
    }
  }

  resetWorkout() {
    const resetExercises = this.workout.workoutExercises.map(ex => ({
      ...ex,
      finishedSets: 0
    }));
    this.workout = {
      ...this.workout,
      workoutExercises: resetExercises
    };

    const heute = new Date();

    this.workout.finishedHistory.push(heute.toLocaleString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));

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
