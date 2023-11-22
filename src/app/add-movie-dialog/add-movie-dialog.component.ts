import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-movie-dialog',
  templateUrl: './add-movie-dialog.component.html',
  styleUrls: ['./add-movie-dialog.component.scss']
})
export class AddMovieDialogComponent {
  public title: string = '';

  constructor(
    public dialogRef: MatDialogRef<AddMovieDialogComponent>,
  ) {}


  public cancel() {
    this.dialogRef.close();
  }
}
