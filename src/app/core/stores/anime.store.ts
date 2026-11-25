import { computed, effect, Injectable, signal } from '@angular/core';
import { ANIME_CATALOG } from '../data/anime-catalog.data';
import {
  AnimeSeries,
  ContinueWatchingItem,
  SortOption,
  WatchProgress,
} from '../models/anime.model';

const WATCHLIST_STORAGE_KEY = 'kitsuneplay.watchlist.v1';
const HISTORY_STORAGE_KEY = 'kitsuneplay.history.v1';

function readStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback;
    }
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

/**
 * Central Signals-based store for the anime catalog, search/filter state,
 * watchlist, and episode watch history (zoneless-ready).
 */
@Injectable({ providedIn: 'root' })
export class AnimeStore {
  readonly #catalog = signal<AnimeSeries[]>(ANIME_CATALOG);
  readonly #searchQuery = signal('');
  readonly #selectedGenre = signal<string>('Todos');
  readonly #sortBy = signal<SortOption>('rating');
  readonly #watchlistIds = signal<string[]>(
    readStorage<string[]>(WATCHLIST_STORAGE_KEY, ['sakura-protocol', 'crimson-katana']),
  );
  readonly #watchHistory = signal<Record<string, WatchProgress>>(
    readStorage<Record<string, WatchProgress>>(HISTORY_STORAGE_KEY, {}),
  );

  // Public readonly signal views
  readonly catalog = this.#catalog.asReadonly();
  readonly searchQuery = this.#searchQuery.asReadonly();
  readonly selectedGenre = this.#selectedGenre.asReadonly();
  readonly sortBy = this.#sortBy.asReadonly();
  readonly watchlistIds = this.#watchlistIds.asReadonly();
  readonly watchHistory = this.#watchHistory.asReadonly();

  /** Sorted unique genre chips derived from the catalog */
  readonly genres = computed(() => {
    const unique = new Set<string>();
    for (const anime of this.#catalog()) {
      for (const genre of anime.genres) {
        unique.add(genre);
      }
    }
    return ['Todos', ...Array.from(unique).sort((a, b) => a.localeCompare(b, 'es'))];
  });

  /** Filtered and sorted anime list */
  readonly filteredAnime = computed(() => {
    const query = this.#searchQuery().trim().toLowerCase();
    const genre = this.#selectedGenre();
    const sort = this.#sortBy();

    const filtered = this.#catalog().filter((anime) => {
      const matchesGenre = genre === 'Todos' || anime.genres.includes(genre);
      if (!matchesGenre) return false;
      if (!query) return true;

      return (
        anime.title.toLowerCase().includes(query) ||
        anime.japaneseTitle.toLowerCase().includes(query) ||
        anime.studio.toLowerCase().includes(query) ||
        anime.genres.some((g) => g.toLowerCase().includes(query))
      );
    });

    return [...filtered].sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === 'year') return b.year - a.year;
      return a.title.localeCompare(b.title, 'es');
    });
  });

  /** Hero spotlight anime */
  readonly featuredAnime = computed(() => this.#catalog()[0]);

  /** Saved watchlist anime items */
  readonly watchlist = computed(() => {
    const ids = new Set(this.#watchlistIds());
    return this.#catalog().filter((anime) => ids.has(anime.id));
  });

  /** Recently watched episodes ordered by timestamp */
  readonly continueWatching = computed<ContinueWatchingItem[]>(() => {
    const catalogMap = new Map(this.#catalog().map((a) => [a.id, a]));
    const items: ContinueWatchingItem[] = [];

    for (const progress of Object.values(this.#watchHistory())) {
      const anime = catalogMap.get(progress.animeId);
      if (!anime) continue;
      const episode = anime.episodes.find((ep) => ep.id === progress.episodeId);
      if (!episode) continue;
      const percent =
        progress.durationSec > 0
          ? Math.min(100, Math.round((progress.positionSec / progress.durationSec) * 100))
          : 0;
      items.push({ anime, episode, progress, percent });
    }

    return items.sort((a, b) => b.progress.lastWatchedAt - a.progress.lastWatchedAt);
  });

  /** Aggregate catalog & user telemetry */
  readonly stats = computed(() => {
    const catalog = this.#catalog();
    const totalEpisodes = catalog.reduce((acc, item) => acc + item.episodes.length, 0);
    const watchedEpisodesCount = Object.values(this.#watchHistory()).filter(
      (p) => p.completed,
    ).length;

    return {
      totalAnime: catalog.length,
      totalEpisodes,
      watchlistCount: this.#watchlistIds().length,
      watchedEpisodesCount,
    };
  });

  constructor() {
    effect(() => {
      writeStorage(WATCHLIST_STORAGE_KEY, this.#watchlistIds());
    });

    effect(() => {
      writeStorage(HISTORY_STORAGE_KEY, this.#watchHistory());
    });
  }

  setSearchQuery(query: string): void {
    this.#searchQuery.set(query);
  }

  setSelectedGenre(genre: string): void {
    this.#selectedGenre.set(genre);
  }

  setSortBy(sort: SortOption): void {
    this.#sortBy.set(sort);
  }

  resetFilters(): void {
    this.#searchQuery.set('');
    this.#selectedGenre.set('Todos');
    this.#sortBy.set('rating');
  }

  getAnimeById(id: string): AnimeSeries | undefined {
    return this.#catalog().find((item) => item.id === id);
  }

  isInWatchlist(animeId: string): boolean {
    return this.#watchlistIds().includes(animeId);
  }

  toggleWatchlist(animeId: string): void {
    this.#watchlistIds.update((ids) =>
      ids.includes(animeId) ? ids.filter((id) => id !== animeId) : [...ids, animeId],
    );
  }

  getEpisodeProgress(episodeId: string): WatchProgress | undefined {
    return this.#watchHistory()[episodeId];
  }

  recordProgress(
    animeId: string,
    episodeId: string,
    positionSec: number,
    durationSec: number,
  ): void {
    if (durationSec <= 0) return;
    const completed = positionSec / durationSec >= 0.9;

    this.#watchHistory.update((history) => ({
      ...history,
      [episodeId]: {
        animeId,
        episodeId,
        positionSec,
        durationSec,
        completed,
        lastWatchedAt: Date.now(),
      },
    }));
  }

  clearHistory(): void {
    this.#watchHistory.set({});
  }
}
