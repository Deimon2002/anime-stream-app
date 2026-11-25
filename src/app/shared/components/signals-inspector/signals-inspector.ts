import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { AnimeStore } from '../../../core/stores/anime.store';
import { PlayerStore } from '../../../core/stores/player.store';

@Component({
  selector: 'app-signals-inspector',
  templateUrl: './signals-inspector.html',
  styleUrl: './signals-inspector.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalsInspector {
  private readonly animeStore = inject(AnimeStore);
  private readonly playerStore = inject(PlayerStore);

  readonly closePanel = output<void>();

  protected readonly hasZoneJs =
    typeof (globalThis as { Zone?: unknown }).Zone !== 'undefined';

  protected readonly stats = this.animeStore.stats;
  protected readonly searchQuery = this.animeStore.searchQuery;
  protected readonly selectedGenre = this.animeStore.selectedGenre;
  protected readonly filteredCount = () => this.animeStore.filteredAnime().length;

  protected readonly currentAnime = this.playerStore.currentAnime;
  protected readonly currentEpisode = this.playerStore.currentEpisode;
  protected readonly isPlaying = this.playerStore.isPlaying;
  protected readonly progressPercent = this.playerStore.progressPercent;
  protected readonly formattedCurrentTime = this.playerStore.formattedCurrentTime;
  protected readonly formattedDuration = this.playerStore.formattedDuration;
  protected readonly canSkipIntro = this.playerStore.canSkipIntro;
  protected readonly playbackRate = this.playerStore.playbackRate;
  protected readonly selectedSubtitle = this.playerStore.selectedSubtitle;
}
