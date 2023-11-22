import {Component, DestroyRef, inject} from '@angular/core';
import {FormBuilder, NonNullableFormBuilder} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { selectActiveId } from '@ngneat/elf-entities';
import { debounceTime, Observable, tap } from 'rxjs';
import { AddMovieDialogComponent } from '../add-movie-dialog/add-movie-dialog.component';
import { WatchlistEntry } from './watchlistEntry';
import { Repository } from './repository';
import { WatchedFilter } from './watched-filter';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss']
})
export class WatchlistComponent {

  private readonly repository = inject(Repository);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);

  protected watchedFilterTypes = WatchedFilter;

  protected searchForm = this.fb.group({
      searchText: [''],
      watched: [this.watchedFilterTypes.ALL]
  });



  protected movies$: Observable<WatchlistEntry[]> = this.repository.getFilteredMovies$();
  protected selected$: Observable<string | undefined> = this.repository.getSelectedId$().pipe(tap(selectec => console.log(selectec)));



  constructor() {
    this.searchForm.controls.searchText.valueChanges
      .pipe(debounceTime(200), takeUntilDestroyed())
      .subscribe(searchText => {
        if (searchText) {
          this.repository.updateSearchText(searchText)
        }
      });

    this.searchForm.controls.watched.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(watched => {
        if (watched) {
          this.repository.updateWatchedFilter(watched)
        }
      });
  }

  protected updateWatched(id: string): void {
    this.repository.updateWatched(id);
  }

  protected deleteMovie(id: string): void {
    this.repository.deleteMovie(id);
  }

  protected openAddDialog(): void {
    const dialogRef = this.dialog.open(AddMovieDialogComponent);
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.repository.addMovie(data);
      }
    })
  }

  public undo() {
    this.repository.undo();
  }

  public redo() {
    this.repository.redo();
  }

  public selectMovie(movie: WatchlistEntry) {
    this.repository.selectMovie(movie.id);
  }
}
