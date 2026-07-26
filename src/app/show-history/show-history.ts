import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { MatCardModule } from '@angular/material/card';

import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';

import { Exercise, WorkoutExercise } from '../interface/exercise';
import { Workout } from '../interface/workout';
import { StorageService } from '../services/storage';
import { History } from '../interface/history';
import {MatButton} from '@angular/material/button';

Chart.register(...registerables);

@Component({
  selector: 'app-show-history',
  standalone: true,
  imports: [
    BaseChartDirective,
    CommonModule,
    MatCardModule,
    MatButton,
    RouterLink
  ],
  templateUrl: './show-history.html',
  styleUrl: './show-history.scss',
})
export class ShowHistory implements OnInit {
  workoutExercise!: WorkoutExercise;
  exercise!: Exercise;
  workout!: Workout;
  historyData: History[] = [];

  constructor(
    private route: ActivatedRoute,
    private storage: StorageService,
    private router: Router
  ) {}

  public lineChartData!: ChartConfiguration<'line'>['data'];

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: 'nearest',
        intersect: true,
        displayColors: false,
        callbacks: {
          title: (items) => {
            const timestamp = items[0]?.parsed?.x;
            if (timestamp === null || timestamp === undefined) return '';

            return `Datum: ${new Date(timestamp).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit'
            })}`;
          },
          label: (context) => {
            return `Gewicht: ${context.parsed.y} kg`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        title: { display: false },
        ticks: {
          color: '#b0b0b0',
          maxTicksLimit: 5,
          maxRotation: 0,
          callback: (value) => {
            if (typeof value !== 'number') return '';
            return new Date(value).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit'
            });
          }
        },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      y: {
        title: {
          display: true,
          text: 'kg',
          color: '#b0b0b0'
        },
        ticks: { color: '#b0b0b0' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        beginAtZero: false
      }
    }
  };

  ngOnInit() {
    const workoutId = Number(this.route.snapshot.paramMap.get('wid'));
    const exId = Number(this.route.snapshot.paramMap.get('exid'));

    const workouts = this.storage.getArray<Workout>('workout_plans');
    const foundWorkout = workouts.find(w => w.id === workoutId);

    const exercises = this.storage.getArray<Exercise>('all_exercises');
    const foundExercise = exercises.find(ex => ex.id === exId);

    if (!foundExercise || !foundWorkout) {
      this.router.navigate(['/exercise', workoutId, exId]);
      return;
    }

    this.workout = foundWorkout;
    this.exercise = foundExercise;
    const foundWorkoutExercise = foundWorkout.workoutExercises.find(ex => ex.id === exId);

    if (!foundWorkoutExercise) {
      this.router.navigate(['/exercise', workoutId, exId]);
      return;
    }

    this.workoutExercise = foundWorkoutExercise;
    this.historyData = this.workoutExercise.weightHistory || [];

    if (this.historyData.length === 0) return;

    // 1. Nach Datum sortieren
    const sortedHistory = [...this.historyData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 2. Ersten und letzten Timestamps bestimmen
    const firstTimestamp = new Date(sortedHistory[0].date).getTime();
    const lastTimestamp = new Date(sortedHistory[sortedHistory.length - 1].date).getTime();

    // 3. X-Achse exakt begrenzen und Freiräume entfernen
    this.lineChartOptions = {
      ...this.lineChartOptions,
      scales: {
        ...this.lineChartOptions.scales,
        x: {
          ...this.lineChartOptions.scales?.['x'],
          min: firstTimestamp - 24 * 60 * 60 * 1000 * 5,
          max: lastTimestamp + 24 * 60 * 60 * 1000 * 10,
          bounds: 'data'
        }
      }
    };

    // 4. Daten zuweisen
    this.lineChartData = {
      datasets: [
        {
          data: sortedHistory.map(h => ({
            x: new Date(h.date).getTime(),
            y: h.weight
          })),
          stepped: true,
          borderColor: '#3f51b5',
          pointRadius: 3,
          pointHoverRadius: 10,
          pointHitRadius: 15
        }
      ]
    };
  }
}
