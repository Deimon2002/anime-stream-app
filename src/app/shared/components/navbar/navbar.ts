import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AnimeStore } from '../../../core/stores/anime.store';
import { PlayerStore } from '../../../core/stores/player.store';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  private readonly animeStore = inject(AnimeStore);
  private readonly playerStore = inject(PlayerStore);

  readonly inspectorOpen = input(false);
  readonly toggleInspector = output<void>();

  protected readonly stats = this.animeStore.stats;
  protected readonly searchQuery = this.animeStore.searchQuery;
  protected readonly currentAnime = this.playerStore.currentAnime;
  protected readonly currentEpisode = this.playerStore.currentEpisode;
  protected readonly isPlaying = this.playerStore.isPlaying;

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.animeStore.setSearchQuery(value);
  }
}
