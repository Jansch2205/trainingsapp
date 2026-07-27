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
  finishedHistory: String[] = [];
  readonly id!: string | null;

  readonly monate: Record<string, number> = {
    Januar: 0, Februar: 1, März: 2, April: 3, Mai: 4, Juni: 5,
    Juli: 6, August: 7, September: 8, Oktober: 9, November: 10, Dezember: 11
  };

  readonly parseGermanDate = (eintrag: String): number => {
    const datumStr = eintrag.split('%')[1];
    const match = datumStr?.match(/(\d+)\.\s+([A-Za-zÄäÖöÜü]+)\s+(\d{4})\s+um\s+(\d{2}):(\d{2})/);
    if (!match) return 0;

    const [, tag, monat, jahr, stunde, minute] = match;
    return new Date(+jahr, this.monate[monat] ?? 0, +tag, +stunde, +minute).getTime();
  };

  constructor(
    private route: ActivatedRoute,
    private storage: StorageService,
    private router: Router){}

  ngOnInit() {
    (this as any).id = this.route.snapshot.paramMap.get('wid');
    if (this.id) {
      const workouts = this.storage.getArray<Workout>('workout_plans');
      if(this.id == "all") {
        for (let workout of workouts) {
          const transformierteEintraege = workout.finishedHistory.map(
            eintrag => `${workout.name}%${eintrag}`
          );

          this.finishedHistory.push(...transformierteEintraege);
          this.finishedHistory.sort((a, b) => this.parseGermanDate(b) - this.parseGermanDate(a));
        }
      } else {
        let workout = workouts.find(w => w.id === Number(this.id));
        if(workout){
          this.finishedHistory = workout.finishedHistory.reverse()
          this.workout = workout;
        }
        else {
          this.router.navigate(['/']);
        }
      }
    }
  }
}
