import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MatButton, MatMiniFabButton} from '@angular/material/button';
import {Router, RouterLink} from '@angular/router';
import {Workout} from '../interface/workout';
import {StorageService, WORKOUT_GROUP_ORDER_STORAGE_KEY} from '../services/storage';
import {MatDialog} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {ConfirmationPopup} from '../confirmation-popup/confirmation-popup';

@Component({
  selector: 'app-configure-groups',
  imports: [
    MatButton,
    RouterLink,
    MatMiniFabButton,
    MatIcon
  ],
  templateUrl: './configure-groups.html',
  styleUrl: './configure-groups.scss',
})
export class ConfigureGroups implements OnInit {
  workouts: Workout[] = [];
  groups: {name: string, workoutName: string[]}[] = [];

  constructor(
    private storage: StorageService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadGroups();
  }

  loadGroups() {
    this.groups = [];
    this.workouts = this.storage.getArray<Workout>('workout_plans');
    this.workouts.sort((a, b) => {
      const groupA = a.group?.trim() || 'Keine Gruppe';
      const groupB = b.group?.trim() || 'Keine Gruppe';
      if (groupA !== groupB) {
        return groupA.localeCompare(groupB);
      }

      if (a.groupOrder !== undefined || b.groupOrder !== undefined) {
        if (a.groupOrder === undefined) {
          return 1;
        }
        if (b.groupOrder === undefined) {
          return -1;
        }
        if (a.groupOrder !== b.groupOrder) {
          return a.groupOrder - b.groupOrder;
        }
      }

      return a.name.localeCompare(b.name);
    });

    this.workouts.forEach(workout => {
      const groupName = workout.group?.trim() || 'Keine Gruppe';

      const existingGroup = this.groups.find(g => g.name === groupName);

      if (existingGroup) {
        existingGroup.workoutName.push(workout.name);
      } else {
        this.groups.push({
          name: groupName,
          workoutName: [workout.name]
        });
      }
    });

    const availableNames = new Set(this.groups.map(group => group.name));
    const savedOrder = this.storage.getArray<string>(WORKOUT_GROUP_ORDER_STORAGE_KEY);
    const orderedNames = savedOrder.filter(
      (name, index) => availableNames.has(name) && savedOrder.indexOf(name) === index
    );
    const remainingGroups = this.groups
      .filter(group => !orderedNames.includes(group.name))
      .sort((a, b) => {
        if (a.name === 'Keine Gruppe') {
          return 1;
        }
        if (b.name === 'Keine Gruppe') {
          return -1;
        }
        return a.name.localeCompare(b.name);
      });

    orderedNames.push(...remainingGroups.map(group => group.name));
    const groupsByName = new Map(this.groups.map(group => [group.name, group]));
    this.groups = orderedNames
      .map(name => groupsByName.get(name))
      .filter((group): group is {name: string; workoutName: string[]} => group !== undefined);
    this.storage.saveArray(WORKOUT_GROUP_ORDER_STORAGE_KEY, orderedNames);

    this.cdr.detectChanges();
  }

  addGroup() {
    this.router.navigate(['/gruppeHinzufuegen']);
  }

  moveGroup(groupName: string, offset: number): void {
    const currentIndex = this.groups.findIndex(group => group.name === groupName);
    const targetIndex = currentIndex + offset;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= this.groups.length) {
      return;
    }

    [this.groups[currentIndex], this.groups[targetIndex]] =
      [this.groups[targetIndex], this.groups[currentIndex]];
    this.storage.saveArray(
      WORKOUT_GROUP_ORDER_STORAGE_KEY,
      this.groups.map(group => group.name)
    );
  }

  editGroup(group: { name: string; workoutName: string[] }) {
    this.router.navigate(['/gruppeBearbeiten', group.name]);
  }

  deleteOnePopup(name: string) {
    if (name === 'Keine Gruppe') {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationPopup, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe((result: { confirmt: boolean } | false) => {
      if (result && result.confirmt) {
        const workouts = this.storage.getArray<Workout>('workout_plans').map(workout =>
          workout.group?.trim() === name
            ? {...workout, group: undefined}
            : workout
        );

        this.storage.saveArray<Workout>('workout_plans', workouts);
        this.loadGroups();
      }
    });
  }
}
