import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';

export interface ConfirmationPopupData {
  title: string;
  cancelLabel: string;
  confirmLabel: string;
  confirmColor: 'primary' | 'warn' | 'accent';
}

@Component({
  selector: 'app-confirmation-popup',
  imports: [MatDialogActions, MatDialogTitle, MatButton],
  templateUrl: './confirmation-popup.html',
  styleUrl: './confirmation-popup.scss',
})
export class ConfirmationPopup {
  constructor(
    private dialogRef: MatDialogRef<ConfirmationPopup>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<ConfirmationPopupData> | null
  ) {}

  get title(): string {
    return this.data?.title ?? 'Möchtest du wirklich löschen?';
  }

  get cancelLabel(): string {
    return this.data?.cancelLabel ?? 'Abbrechen';
  }

  get confirmLabel(): string {
    return this.data?.confirmLabel ?? 'Löschen';
  }

  get confirmColor(): ConfirmationPopupData['confirmColor'] {
    return this.data?.confirmColor ?? 'warn';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close({confirmt: true});
  }
}
