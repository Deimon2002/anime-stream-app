import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/catalog/catalog-page').then((m) => m.CatalogPage),
    title: 'KitsunePlay — Catálogo de Anime',
  },
  {
    path: 'anime/:id',
    loadComponent: () =>
      import('./features/detail/anime-detail-page').then((m) => m.AnimeDetailPage),
    title: 'KitsunePlay — Detalle de Serie',
  },
  {
    path: 'watch/:animeId/:episodeId',
    loadComponent: () =>
      import('./features/watch/watch-page').then((m) => m.WatchPage),
    title: 'KitsunePlay — Reproductor',
  },
  {
    path: 'mi-lista',
    loadComponent: () =>
      import('./features/watchlist/watchlist-page').then((m) => m.WatchlistPage),
    title: 'KitsunePlay — Mi Lista',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
