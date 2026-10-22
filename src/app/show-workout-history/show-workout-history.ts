import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Workout} from '../interface/workout';
import {StorageService} from '../services/storage';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-show-workout-history',
  imports: [
    MatButton,
    RouterLink,
    FormsModule
  ],
  templateUrl: './show-workout-history.html',
  styleUrl: './show-workout-history.scss',
})
export class ShowWorkoutHistory implements OnInit {
  workout!: Workout;
  finishedHistory: String[] = [];
  readonly id!: string | null;
  selectedGroup = 'all';
  groups: string[] = [];

  readonly monate: Record<string, number> = {
    Januar: 0, Februar: 1, März: 2, April: 3, Mai: 4, Juni: 5,
    Juli: 6, August: 7, September: 8, Oktober: 9, November: 10, Dezember: 11
  };

  readonly parseGermanDate = (eintrag: String): number => {
    const datumStr = eintrag.split('%')[2] ?? eintrag.split('%')[1];
    const match = datumStr?.match(/(\d+)\.\s+([A-Za-zÄäÖöÜü]+)\s+(\d{4})\s+um\s+(\d{2}):(\d{2})/);
    if (!match) return 0;

    const [, tag, monat, jahr, stunde, minute] = match;
    return new Date(+jahr, this.monate[monat] ?? 0, +tag, +stunde, +minute).getTime();
  };

  constructor(
    private route: ActivatedRoute,
    private storage: StorageService,
    private router: Router,
    private cdr: ChangeDetectorRef){}

  ngOnInit() {
    (this as any).id = this.route.snapshot.paramMap.get('wid');
    const savedGroup = localStorage.getItem('history-group-filter');
    if (savedGroup) {
      this.selectedGroup = savedGroup;
    }

    if (this.id) {
      const workouts = this.storage.getArray<Workout>('workout_plans');
      this.groups = [...new Set(workouts.map(workout => workout.group?.trim() || 'Keine Gruppe'))].sort();

      if (this.selectedGroup !== 'all' && !this.groups.includes(this.selectedGroup)) {
        this.selectedGroup = 'all';
        localStorage.setItem('history-group-filter', this.selectedGroup);
      }

      if (this.id == 'all') {
        this.loadAllHistory(workouts);
      } else {
        const workout = workouts.find(w => w.id === Number(this.id));
        if (workout) {
          this.finishedHistory = [...workout.finishedHistory].reverse();
          this.workout = workout;
        } else {
          this.router.navigate(['/']);
        }
      }
    }

    this.cdr.detectChanges();
  }

  onGroupFilterChange(value: string) {
    const nextValue = value ?? 'all';
    this.selectedGroup = nextValue;
    localStorage.setItem('history-group-filter', nextValue);

    const workouts = this.storage.getArray<Workout>('workout_plans');
    this.loadAllHistory(workouts);
    this.cdr.detectChanges();
  }

  private loadAllHistory(workouts: Workout[]) {
    const filteredWorkouts = this.selectedGroup === 'all'
      ? workouts
      : workouts.filter(workout => (workout.group?.trim() || 'Keine Gruppe') === this.selectedGroup);

    const entries: String[] = [];

    filteredWorkouts.forEach(workout => {
      const groupName = workout.group?.trim() || 'Keine Gruppe';
      const transformierteEintraege = workout.finishedHistory.map(
        eintrag => `${workout.name}%${groupName}%${eintrag}`
      );

      entries.push(...transformierteEintraege);
    });

    this.finishedHistory = entries.sort((a, b) => this.parseGermanDate(b) - this.parseGermanDate(a));
  }
}
