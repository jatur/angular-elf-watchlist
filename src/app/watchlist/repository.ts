import { Injectable } from '@angular/core';
import { createStore, select, setProp, withProps } from '@ngneat/elf';
import { addEntities, deleteEntities, getActiveId, resetActiveId, selectActiveId, selectAllEntities, selectAllEntitiesApply, setActiveId, setEntities, updateEntities, withActiveId, withEntities } from '@ngneat/elf-entities';
import { entitiesStateHistory } from '@ngneat/elf-state-history';
import { combineLatest, map, Observable, switchMap } from 'rxjs';
import { WatchlistEntry } from './watchlistEntry';
import { SearchFilterProperties } from './search-filter-properties';
import { WatchedFilter } from './watched-filter';

const watchListStore = createStore(
  {name: 'watchlist'},
  withProps<SearchFilterProperties>({
    searchText: '',
    watched: WatchedFilter.ALL
  }),
  withEntities<WatchlistEntry>(),
  withActiveId()
);

export const watchListStoreHistory = entitiesStateHistory(watchListStore);

watchListStore.update(setEntities([
  {
    id: crypto.randomUUID(),
    watched: false,
    title: 'Star Wars I',
  },
  {
    id: crypto.randomUUID(),
    watched: false,
    title: 'Star Wars II'
  },
  {
    id: crypto.randomUUID(),
    watched: false,
    title: 'Lord of the Rings'
  },
  {
    id: crypto.randomUUID(),
    watched: false,
    title: 'titanic'
  },
  {
    id: crypto.randomUUID(),
    watched: false,
    title: 'Test'
  }
  ]
))



@Injectable({ providedIn: 'root'})
export class Repository {

  getAll$(): Observable<WatchlistEntry[]> {
    return watchListStore.pipe(selectAllEntities());
  }

  getFilteredMovies$(): Observable<WatchlistEntry[]> {
    return combineLatest([
      watchListStore.pipe(select((state) => state.searchText)),
      watchListStore.pipe(select((state) => state.watched))
    ]).pipe(
      switchMap(([searchText, watched]) => watchListStore.pipe(
      selectAllEntitiesApply({filterEntity: (movie) => this.passesSearchTextFilter(movie, searchText) && this.passesWatchedFilter(movie,watched)},
      ))));
}

  private passesSearchTextFilter(movie: WatchlistEntry, searchText: string): boolean {
    if (searchText.length > 0) {
      return movie.title.toLowerCase().includes(searchText.toLowerCase());
    }
    return true;
  }

  private passesWatchedFilter(movie: WatchlistEntry, watched: WatchedFilter): boolean {
    switch(watched) {
      case WatchedFilter.WATCHED: return movie.watched;
      case WatchedFilter.UNWATCHED: return !movie.watched;
      case WatchedFilter.ALL:
      default:
        return true;
    }
  }

  addMovie(title: string): void {
    watchListStore.update(addEntities({
      watched: false,
      title: title,
      id: crypto.randomUUID()
    }));
  }

  updateWatched(id: string): void {
    watchListStore.update(
      updateEntities(id, (entity) => ({
        ...entity,
        watched: !entity.watched,
      }))
    );
  }

  public updateSearchText(searchText: string) {
    watchListStore.update(setProp('searchText', searchText));
  }

  public updateWatchedFilter(watchedFilter: WatchedFilter) {
    console.log(watchedFilter);
    watchListStore.update(setProp('watched', watchedFilter));
  }

  public deleteMovie(id: string): void {
    watchListStore.update(deleteEntities(id))
  }

  public undo(): void {
    watchListStoreHistory.undo();
  }

  public redo(): void {
    watchListStoreHistory.redo();
  }

  public selectMovie(id: string) {
    console.log(watchListStore.query(getActiveId));
    const activeId = watchListStore.query(getActiveId);
    if (activeId !== undefined && activeId !== id) {
      watchListStore.update(resetActiveId());
    } else {
      watchListStore.update(setActiveId(id));
    }
  }

  public getSelectedId$(): Observable<string | undefined> {
    return watchListStore.pipe(selectActiveId(), map(entity => entity?.id));
  }
}
