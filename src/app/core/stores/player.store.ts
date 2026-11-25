import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { AudioTrack, SubtitleTrack } from '../models/anime.model';
import { clamp, formatTime } from '../utils/time.util';
import { AnimeStore } from './anime.store';

export type QualityOption = '1080p' | '720p' | '480p';

/**
 * Signal-first reactive state store for the active video player session.
 * Drives playback, intro skip, timed subtitles, and next-episode transitions
 * without Zone.js dirty checking.
 */
@Injectable({ providedIn: 'root' })
export class PlayerStore {
  private readonly animeStore = inject(AnimeStore);

  readonly #animeId = signal<string>('');
  readonly #episodeId = signal<string>('');
  readonly #isPlaying = signal(false);
  readonly #currentTime = signal(0);
  readonly #duration = signal(0);
  readonly #volume = signal(0.8);
  readonly #isMuted = signal(false);
  readonly #playbackRate = signal(1);
  readonly #selectedAudio = signal<AudioTrack>('jp');
  readonly #selectedSubtitle = signal<SubtitleTrack>('es');
  readonly #selectedQuality = signal<QualityOption>('1080p');
  readonly #autoplayNext = signal(true);
  readonly #isTheaterMode = signal(false);
  readonly #customVideoUrl = signal('');

  /** Automatically resets episode-drawer tab when switching anime */
  readonly activeSidebarTab = linkedSignal<string, 'episodes' | 'details'>({
    source: () => this.#animeId(),
    computation: () => 'episodes',
  });

  /** Automatically resets up-next dismissed flag when episode changes */
  readonly upNextDismissed = linkedSignal<string, boolean>({
    source: () => this.#episodeId(),
    computation: () => false,
  });

  readonly animeId = this.#animeId.asReadonly();
  readonly episodeId = this.#episodeId.asReadonly();
  readonly isPlaying = this.#isPlaying.asReadonly();
  readonly currentTime = this.#currentTime.asReadonly();
  readonly duration = this.#duration.asReadonly();
  readonly volume = this.#volume.asReadonly();
  readonly isMuted = this.#isMuted.asReadonly();
  readonly playbackRate = this.#playbackRate.asReadonly();
  readonly selectedAudio = this.#selectedAudio.asReadonly();
  readonly selectedSubtitle = this.#selectedSubtitle.asReadonly();
  readonly selectedQuality = this.#selectedQuality.asReadonly();
  readonly autoplayNext = this.#autoplayNext.asReadonly();
  readonly isTheaterMode = this.#isTheaterMode.asReadonly();
  readonly customVideoUrl = this.#customVideoUrl.asReadonly();

  readonly currentAnime = computed(() => {
    const id = this.#animeId();
    return id ? this.animeStore.getAnimeById(id) : undefined;
  });

  readonly currentEpisode = computed(() => {
    const anime = this.currentAnime();
    const epId = this.#episodeId();
    return anime?.episodes.find((ep) => ep.id === epId);
  });

  readonly episodeIndex = computed(() => {
    const anime = this.currentAnime();
    const epId = this.#episodeId();
    if (!anime) return -1;
    return anime.episodes.findIndex((ep) => ep.id === epId);
  });

  readonly nextEpisode = computed(() => {
    const anime = this.currentAnime();
    const idx = this.episodeIndex();
    if (!anime || idx < 0 || idx + 1 >= anime.episodes.length) return undefined;
    return anime.episodes[idx + 1];
  });

  readonly prevEpisode = computed(() => {
    const anime = this.currentAnime();
    const idx = this.episodeIndex();
    if (!anime || idx <= 0) return undefined;
    return anime.episodes[idx - 1];
  });

  readonly progressPercent = computed(() => {
    const dur = this.#duration();
    if (dur <= 0) return 0;
    return clamp((this.#currentTime() / dur) * 100, 0, 100);
  });

  readonly formattedCurrentTime = computed(() => formatTime(this.#currentTime()));
  readonly formattedDuration = computed(() => formatTime(this.#duration()));

  readonly canSkipIntro = computed(() => {
    const ep = this.currentEpisode();
    if (!ep) return false;
    const t = this.#currentTime();
    return t >= ep.introStartSec && t < ep.introEndSec;
  });

  readonly showUpNextBanner = computed(() => {
    const dur = this.#duration();
    const t = this.#currentTime();
    const next = this.nextEpisode();
    if (!next || dur <= 0 || this.upNextDismissed()) return false;
    return dur - t <= 12 && t > 5;
  });

  readonly activeSubtitleText = computed(() => {
    const track = this.#selectedSubtitle();
    if (track === 'off') return '';
    const ep = this.currentEpisode();
    if (!ep) return '';
    const t = this.#currentTime();
    const cue = ep.cues.find((c) => t >= c.startSec && t <= c.endSec);
    if (!cue) return '';
    return track === 'es' ? cue.es : cue.en;
  });

  loadEpisode(animeId: string, episodeId: string): void {
    const anime = this.animeStore.getAnimeById(animeId);
    const episode = anime?.episodes.find((ep) => ep.id === episodeId);
    const saved = this.animeStore.getEpisodeProgress(episodeId);

    this.#animeId.set(animeId);
    this.#episodeId.set(episodeId);
    this.#isPlaying.set(false);
    this.#duration.set(episode?.durationSec ?? 95);

    // Resume from saved spot if not near completion
    const resumeAt =
      saved && !saved.completed && saved.positionSec > 2 ? saved.positionSec : 0;
    this.#currentTime.set(resumeAt);
  }

  setPlaying(playing: boolean): void {
    this.#isPlaying.set(playing);
  }

  syncTime(currentSec: number, durationSec?: number): void {
    const dur = durationSec && durationSec > 0 ? durationSec : this.#duration();
    if (durationSec && durationSec > 0) {
      this.#duration.set(durationSec);
    }
    this.#currentTime.set(clamp(currentSec, 0, dur || currentSec));

    const animeId = this.#animeId();
    const epId = this.#episodeId();
    if (animeId && epId && dur > 0) {
      this.animeStore.recordProgress(animeId, epId, currentSec, dur);
    }
  }

  setVolume(vol: number): void {
    const clamped = clamp(vol, 0, 1);
    this.#volume.set(clamped);
    this.#isMuted.set(clamped === 0);
  }

  toggleMute(): void {
    this.#isMuted.update((muted) => !muted);
  }

  setPlaybackRate(rate: number): void {
    this.#playbackRate.set(rate);
  }

  setAudioTrack(track: AudioTrack): void {
    this.#selectedAudio.set(track);
  }

  setSubtitleTrack(track: SubtitleTrack): void {
    this.#selectedSubtitle.set(track);
  }

  setQuality(quality: QualityOption): void {
    this.#selectedQuality.set(quality);
  }

  toggleAutoplayNext(): void {
    this.#autoplayNext.update((v) => !v);
  }

  toggleTheaterMode(): void {
    this.#isTheaterMode.update((v) => !v);
  }

  setCustomVideoUrl(url: string): void {
    this.#customVideoUrl.set(url.trim());
  }

  dismissUpNext(): void {
    this.upNextDismissed.set(true);
  }
}
