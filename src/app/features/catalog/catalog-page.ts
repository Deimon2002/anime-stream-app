import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SortOption } from '../../core/models/anime.model';
import { AnimeStore } from '../../core/stores/anime.store';
import { AnimeCard } from '../../shared/components/anime-card/anime-card';

@Component({
  selector: 'app-catalog-page',
  imports: [RouterLink, AnimeCard],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPage {
  private readonly animeStore = inject(AnimeStore);

  protected readonly featured = this.animeStore.featuredAnime;
  protected readonly genres = this.animeStore.genres;
  protected readonly selectedGenre = this.animeStore.selectedGenre;
  protected readonly sortBy = this.animeStore.sortBy;
  protected readonly filteredAnime = this.animeStore.filteredAnime;
  protected readonly continueWatching = this.animeStore.continueWatching;
  protected readonly searchQuery = this.animeStore.searchQuery;

  protected readonly featuredInWatchlist = computed(() =>
    this.animeStore.watchlistIds().includes(this.featured().id),
  );

  protected selectGenre(genre: string): void {
    this.animeStore.setSelectedGenre(genre);
  }

  protected onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as SortOption;
    this.animeStore.setSortBy(value);
  }

  protected toggleFeaturedWatchlist(): void {
    this.animeStore.toggleWatchlist(this.featured().id);
  }

  protected resetFilters(): void {
    this.animeStore.resetFilters();
  }
}
