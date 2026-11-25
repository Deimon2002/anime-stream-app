import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnimeStore } from '../../core/stores/anime.store';
import { formatTime } from '../../core/utils/time.util';

@Component({
  selector: 'app-anime-detail-page',
  imports: [RouterLink],
  templateUrl: './anime-detail-page.html',
  styleUrl: './anime-detail-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimeDetailPage {
  private readonly animeStore = inject(AnimeStore);

  /** Bound automatically from route param `/anime/:id` via withComponentInputBinding() */
  readonly id = input.required<string>();

  protected readonly anime = computed(() => this.animeStore.getAnimeById(this.id()));

  protected readonly inWatchlist = computed(() => {
    const current = this.anime();
    return current ? this.animeStore.watchlistIds().includes(current.id) : false;
  });

  /** Resets automatically to episode 1 whenever the route `id` signal changes */
  protected readonly highlightedEpisodeId = linkedSignal<string, string>({
    source: () => this.id(),
    computation: (animeId) => {
      const series = this.animeStore.getAnimeById(animeId);
      return series?.episodes[0]?.id ?? '';
    },
  });

  protected readonly highlightedEpisode = computed(() => {
    const series = this.anime();
    const epId = this.highlightedEpisodeId();
    return series?.episodes.find((ep) => ep.id === epId) ?? series?.episodes[0];
  });

  protected toggleWatchlist(): void {
    const current = this.anime();
    if (current) {
      this.animeStore.toggleWatchlist(current.id);
    }
  }

  protected selectPreview(episodeId: string): void {
    this.highlightedEpisodeId.set(episodeId);
  }

  protected episodeProgressPercent(episodeId: string): number {
    const progress = this.animeStore.watchHistory()[episodeId];
    if (!progress || progress.durationSec <= 0) return 0;
    return Math.min(100, Math.round((progress.positionSec / progress.durationSec) * 100));
  }

  protected formatDuration(sec: number): string {
    return formatTime(sec);
  }
}
