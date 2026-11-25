import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnimeSeries } from '../../../core/models/anime.model';
import { AnimeStore } from '../../../core/stores/anime.store';

@Component({
  selector: 'app-anime-card',
  imports: [RouterLink],
  templateUrl: './anime-card.html',
  styleUrl: './anime-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimeCard {
  private readonly animeStore = inject(AnimeStore);

  readonly anime = input.required<AnimeSeries>();

  protected readonly inWatchlist = computed(() =>
    this.animeStore.watchlistIds().includes(this.anime().id),
  );

  protected readonly firstEpisodeId = computed(
    () => this.anime().episodes[0]?.id ?? '',
  );

  protected toggleWatchlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.animeStore.toggleWatchlist(this.anime().id);
  }
}
