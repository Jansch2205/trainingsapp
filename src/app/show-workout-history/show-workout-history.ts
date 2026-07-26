import {Component, OnInit} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Workout} from '../interface/workout';
import {StorageService} from '../services/storage';

@Component({
  selector: 'app-show-workout-history',
  imports: [
    MatButton,
    RouterLink
  ],
  templateUrl: './show-workout-history.html',
  styleUrl: './show-workout-history.scss',
})
export class ShowWorkoutHistory implements OnInit {
  workout!: Workout;

  constructor(
    private route: ActivatedRoute,
    private storage: StorageService,
    private router: Router){}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('wid');
    if (id) {
      const workouts = this.storage.getArray<Workout>('workout_plans');
      let workout = workouts.find(w => w.id === Number(id));
      if(workout){
        workout.finishedHistory.reverse()
        this.workout = workout;
      }
      else {
        this.router.navigate(['/']);
      }
    }
  }
}
