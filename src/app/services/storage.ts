import { Injectable } from '@angular/core';

export const WORKOUT_GROUP_ORDER_STORAGE_KEY = 'workout_group_order';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  getArray<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  saveArray<T>(key: string, items: T[]): void {
    localStorage.setItem(key, JSON.stringify(items));
  }
}
