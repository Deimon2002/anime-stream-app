import { TestBed } from '@angular/core/testing';
import { AnimeStore } from './anime.store';

describe('AnimeStore (Signals)', () => {
  let store: AnimeStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(AnimeStore);
  });

  it('derives genres and filters catalog reactively by search and genre', () => {
    expect(store.genres()).toContain('Todos');
    expect(store.genres()).toContain('Cyberpunk');

    store.setSelectedGenre('Cyberpunk');
    const cyberpunkTitles = store.filteredAnime().map((a) => a.id);
    expect(cyberpunkTitles).toContain('neon-shinjuku');
    expect(cyberpunkTitles).not.toContain('deep-abyss-song');

    store.setSearchQuery('Shinjuku');
    expect(store.filteredAnime().length).toBe(1);
    expect(store.filteredAnime()[0].id).toBe('neon-shinjuku');

    store.resetFilters();
    expect(store.filteredAnime().length).toBe(store.catalog().length);
  });

  it('toggles watchlist items and records continue-watching progress', () => {
    const targetId = 'neon-shinjuku';
    expect(store.isInWatchlist(targetId)).toBe(false);

    store.toggleWatchlist(targetId);
    expect(store.isInWatchlist(targetId)).toBe(true);

    store.recordProgress('neon-shinjuku', 'neon-shinjuku-ep-1', 45, 90);
    const items = store.continueWatching();
    expect(items.length).toBe(1);
    expect(items[0].percent).toBe(50);
    expect(items[0].progress.completed).toBe(false);
  });
});
