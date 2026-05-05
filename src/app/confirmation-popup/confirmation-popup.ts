import { Component } from '@angular/core';
import {MatDialogActions, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-confirmation-popup',
  imports: [MatDialogActions, MatDialogTitle, MatButton],
  templateUrl: './confirmation-popup.html',
  styleUrl: './confirmation-popup.scss',
})
export class ConfirmationPopup {
  constructor(private dialogRef: MatDialogRef<ConfirmationPopup>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    this.dialogRef.close({confirmt: true});
  }
}
