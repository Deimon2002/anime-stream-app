export type VisualTheme =
  | 'sakura'
  | 'cyberpunk'
  | 'mecha'
  | 'starlight'
  | 'crimson'
  | 'ocean';

export type SortOption = 'rating' | 'year' | 'title';
export type AudioTrack = 'jp' | 'es' | 'en';
export type SubtitleTrack = 'es' | 'en' | 'off';

export interface SubtitleCue {
  startSec: number;
  endSec: number;
  es: string;
  en: string;
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  synopsis: string;
  durationSec: number;
  introStartSec: number;
  introEndSec: number;
  theme: VisualTheme;
  cues: SubtitleCue[];
}

export interface AnimeSeries {
  id: string;
  title: string;
  japaneseTitle: string;
  synopsis: string;
  studio: string;
  year: number;
  rating: number;
  status: 'En emisión' | 'Finalizado';
  genres: string[];
  accentColor: string;
  secondaryColor: string;
  theme: VisualTheme;
  posterUrl: string;
  bannerUrl: string;
  episodes: Episode[];
}

export interface WatchProgress {
  animeId: string;
  episodeId: string;
  positionSec: number;
  durationSec: number;
  completed: boolean;
  lastWatchedAt: number;
}

export interface ContinueWatchingItem {
  anime: AnimeSeries;
  episode: Episode;
  progress: WatchProgress;
  percent: number;
}
