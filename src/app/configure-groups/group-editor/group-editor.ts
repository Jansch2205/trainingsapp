import {Component, OnInit} from '@angular/core';
import {MatButton} from '@angular/material/button';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {StorageService, WORKOUT_GROUP_ORDER_STORAGE_KEY} from '../../services/storage';
import {Workout} from '../../interface/workout';
import {MatOption} from '@angular/material/core';
import {MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatIcon} from '@angular/material/icon';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-group-editor',
  imports: [
    MatButton,
    RouterLink,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatOption,
    MatAutocomplete,
    MatAutocompleteTrigger,
    FormsModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    MatIcon
  ],
  templateUrl: './group-editor.html',
  styleUrl: './group-editor.scss',
})
export class GroupEditor implements OnInit {
  name = "";
  isEditMode = false;
  workouts: Workout[] = [];
  selectedWorkouts: Workout[] = [];
  workoutSearch = '';

  constructor(
    private storage: StorageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.workouts = this.storage.getArray<Workout>('workout_plans');
    const groupName = this.route.snapshot.paramMap.get('groupName');

    if (groupName !== null) {
      this.isEditMode = true;
      this.name = groupName;
      this.selectedWorkouts = this.workouts.filter(
        workout => workout.group?.trim() === groupName
      );
      this.selectedWorkouts.sort((a, b) =>
        (a.groupOrder ?? Number.MAX_SAFE_INTEGER) - (b.groupOrder ?? Number.MAX_SAFE_INTEGER) ||
        this.workouts.indexOf(a) - this.workouts.indexOf(b)
      );
    }
  }

  get filteredWorkouts(): Workout[] {
    const search = this.workoutSearch.trim().toLocaleLowerCase();
    return this.workouts.filter(workout =>
      !this.selectedWorkouts.some(selected => selected.id === workout.id) &&
      (workout.name.toLocaleLowerCase().includes(search) ||
        workout.group?.toLocaleLowerCase().includes(search))
    );
  }

  displayWorkout(workout: Workout | string | null): string {
    return typeof workout === 'string' ? workout : workout?.name ?? '';
  }

  addWorkout(event: MatAutocompleteSelectedEvent): void {
    const workout = event.option.value as Workout;
    if (!this.selectedWorkouts.some(selected => selected.id === workout.id)) {
      this.selectedWorkouts = [...this.selectedWorkouts, workout];
    }
    this.workoutSearch = '';
  }

  removeWorkout(workoutId: number): void {
    this.selectedWorkouts = this.selectedWorkouts.filter(workout => workout.id !== workoutId);
  }

  dropWorkout(event: CdkDragDrop<Workout[]>): void {
    moveItemInArray(this.selectedWorkouts, event.previousIndex, event.currentIndex);
  }

  onSave(): void {
    const cleanName = this.name.trim();

    if (!cleanName) {
      return;
    }

    const selectedOrder = new Map(this.selectedWorkouts.map((workout, index) => [workout.id, index]));
    const workoutsToPersist = this.workouts.map(workout => {
      const order = selectedOrder.get(workout.id);
      const isSelected = order !== undefined;
      const wasInEditedGroup = this.isEditMode &&
        workout.group?.trim() === this.route.snapshot.paramMap.get('groupName');

      return {
        ...workout,
        group: isSelected ? cleanName : wasInEditedGroup ? undefined : workout.group,
        groupOrder: isSelected ? order : wasInEditedGroup ? undefined : workout.groupOrder,
      };
    });

    this.storage.saveArray<Workout>('workout_plans', workoutsToPersist);

    if (this.isEditMode) {
      const oldName = this.route.snapshot.paramMap.get('groupName');
      const order = this.storage.getArray<string>(WORKOUT_GROUP_ORDER_STORAGE_KEY);
      const groupIndex = order.indexOf(oldName ?? '');
      if (groupIndex !== -1) {
        order[groupIndex] = cleanName;
        this.storage.saveArray(WORKOUT_GROUP_ORDER_STORAGE_KEY, order);
      }
    }

    this.router.navigate(['/gruppenVerwalten']);
  }
}
