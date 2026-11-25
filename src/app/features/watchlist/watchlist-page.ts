import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnimeStore } from '../../core/stores/anime.store';
import { AnimeCard } from '../../shared/components/anime-card/anime-card';

@Component({
  selector: 'app-watchlist-page',
  imports: [RouterLink, AnimeCard],
  templateUrl: './watchlist-page.html',
  styleUrl: './watchlist-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchlistPage {
  private readonly animeStore = inject(AnimeStore);

  protected readonly watchlist = this.animeStore.watchlist;
  protected readonly continueWatching = this.animeStore.continueWatching;

  protected clearHistory(): void {
    this.animeStore.clearHistory();
  }
}
