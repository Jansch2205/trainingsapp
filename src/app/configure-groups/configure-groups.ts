import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MatButton, MatFabButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {Workout} from '../interface/workout';
import {StorageService} from '../services/storage';
import {MatDialog} from '@angular/material/dialog';
import {AddGroupPopup} from './add-group-popup/add-group-popup';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-configure-groups',
  imports: [
    MatButton,
    RouterLink,
    MatFabButton,
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
  ) {}

  ngOnInit() {
    this.workouts = this.storage.getArray<Workout>('workout_plans')
    this.workouts.sort((a, b) => a.name.localeCompare(b.name));

    this.workouts.forEach(workout => {
      const groupName = workout.group || 'Keine Gruppe';

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
    this.cdr.detectChanges();
  }

  addGroup() {
    const dialogRef = this.dialog.open(AddGroupPopup, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cdr.detectChanges();
      }
    });
  }

  editGroup(group: { name: string; workoutName: string[] }) {

  }

  deleteOnePopup(name: string) {

  }
}
