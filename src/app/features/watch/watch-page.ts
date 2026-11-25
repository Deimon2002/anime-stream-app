import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AudioTrack, SubtitleTrack } from '../../core/models/anime.model';
import { AnimeStore } from '../../core/stores/anime.store';
import { PlayerStore, QualityOption } from '../../core/stores/player.store';
import { formatTime } from '../../core/utils/time.util';
import { renderAnimeFrame } from './video-canvas-engine';

@Component({
  selector: 'app-watch-page',
  imports: [RouterLink],
  templateUrl: './watch-page.html',
  styleUrl: './watch-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchPage {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly animeStore = inject(AnimeStore);
  protected readonly playerStore = inject(PlayerStore);

  /** Route Signal inputs bound automatically by withComponentInputBinding() */
  readonly animeId = input.required<string>();
  readonly episodeId = input.required<string>();

  private readonly stageRef = viewChild<ElementRef<HTMLElement>>('playerStage');
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('streamCanvas');
  private readonly videoRef = viewChild<ElementRef<HTMLVideoElement>>('nativeVideo');

  protected readonly showSourcePanel = signal(false);
  protected readonly customUrlDraft = signal('');
  protected readonly isFullscreen = signal(false);

  private rafId: number | null = null;
  private lastTickMs = 0;

  constructor() {
    // Load episode whenever route signals change
    effect(() => {
      const aId = this.animeId();
      const eId = this.episodeId();
      if (aId && eId) {
        this.playerStore.loadEpisode(aId, eId);
        this.drawCurrentCanvasFrame();
      }
    });

    // Manage zoneless animation loop for built-in stream mode
    effect(() => {
      const playing = this.playerStore.isPlaying();
      const customUrl = this.playerStore.customVideoUrl();

      this.stopLoop();
      if (playing && !customUrl) {
        this.lastTickMs = performance.now();
        this.startLoop();
      } else {
        this.drawCurrentCanvasFrame();
      }
    });

    // Sync native <video> volume/rate when using a custom MP4/WebM URL
    effect(() => {
      const video = this.videoRef()?.nativeElement;
      if (!video) return;
      video.volume = this.playerStore.volume();
      video.muted = this.playerStore.isMuted();
      video.playbackRate = this.playerStore.playbackRate();
    });

    this.destroyRef.onDestroy(() => {
      this.stopLoop();
    });
  }

  @HostListener('document:keydown', ['$event'])
  protected onKeyDown(event: KeyboardEvent): void {
    const tag = (event.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'k') {
      event.preventDefault();
      this.togglePlay();
    } else if (key === 'j') {
      this.seekRelative(-10);
    } else if (key === 'l') {
      this.seekRelative(10);
    } else if (key === 'm') {
      this.playerStore.toggleMute();
    } else if (key === 'f') {
      this.toggleFullscreen();
    } else if (key === 't') {
      this.playerStore.toggleTheaterMode();
    }
  }

  protected togglePlay(): void {
    const customUrl = this.playerStore.customVideoUrl();
    const video = this.videoRef()?.nativeElement;

    if (customUrl && video) {
      if (video.paused) {
        void video.play().catch(() => undefined);
        this.playerStore.setPlaying(true);
      } else {
        video.pause();
        this.playerStore.setPlaying(false);
      }
      return;
    }

    // Built-in canvas stream: restart if at end
    if (
      !this.playerStore.isPlaying() &&
      this.playerStore.currentTime() >= this.playerStore.duration()
    ) {
      this.playerStore.syncTime(0);
    }
    this.playerStore.setPlaying(!this.playerStore.isPlaying());
  }

  protected seekToPercent(event: Event): void {
    const pct = Number((event.target as HTMLInputElement).value);
    const dur = this.playerStore.duration();
    if (dur <= 0) return;
    const targetSec = (pct / 100) * dur;
    this.seekToSecond(targetSec);
  }

  protected seekRelative(deltaSec: number): void {
    this.seekToSecond(this.playerStore.currentTime() + deltaSec);
  }

  protected skipIntro(): void {
    const ep = this.playerStore.currentEpisode();
    if (!ep) return;
    this.seekToSecond(ep.introEndSec);
  }

  protected playEpisode(epId: string): void {
    const anime = this.playerStore.currentAnime();
    if (!anime) return;
    void this.router.navigate(['/watch', anime.id, epId]);
  }

  protected onVideoTimeUpdate(): void {
    const video = this.videoRef()?.nativeElement;
    if (!video) return;
    this.playerStore.syncTime(video.currentTime, video.duration || undefined);
  }

  protected onVideoEnded(): void {
    this.handleEpisodeEnded();
  }

  protected onAudioChange(event: Event): void {
    const track = (event.target as HTMLSelectElement).value as AudioTrack;
    this.playerStore.setAudioTrack(track);
  }

  protected onSubtitleChange(event: Event): void {
    const track = (event.target as HTMLSelectElement).value as SubtitleTrack;
    this.playerStore.setSubtitleTrack(track);
  }

  protected onRateChange(event: Event): void {
    const rate = Number((event.target as HTMLSelectElement).value);
    this.playerStore.setPlaybackRate(rate);
  }

  protected onQualityChange(event: Event): void {
    const quality = (event.target as HTMLSelectElement).value as QualityOption;
    this.playerStore.setQuality(quality);
    this.drawCurrentCanvasFrame();
  }

  protected onVolumeChange(event: Event): void {
    const vol = Number((event.target as HTMLInputElement).value);
    this.playerStore.setVolume(vol);
  }

  protected applyCustomVideoUrl(): void {
    this.playerStore.setCustomVideoUrl(this.customUrlDraft());
    this.showSourcePanel.set(false);
  }

  protected clearCustomVideoUrl(): void {
    this.customUrlDraft.set('');
    this.playerStore.setCustomVideoUrl('');
    this.showSourcePanel.set(false);
  }

  protected toggleFullscreen(): void {
    const stage = this.stageRef()?.nativeElement;
    if (!stage || typeof document === 'undefined') return;

    if (!document.fullscreenElement) {
      void stage.requestFullscreen?.().then(() => this.isFullscreen.set(true)).catch(() => undefined);
    } else {
      void document.exitFullscreen?.().then(() => this.isFullscreen.set(false)).catch(() => undefined);
    }
  }

  protected episodeProgressPercent(epId: string): number {
    const p = this.animeStore.watchHistory()[epId];
    if (!p || p.durationSec <= 0) return 0;
    return Math.min(100, Math.round((p.positionSec / p.durationSec) * 100));
  }

  protected formatDuration(sec: number): string {
    return formatTime(sec);
  }

  private seekToSecond(sec: number): void {
    const video = this.videoRef()?.nativeElement;
    if (this.playerStore.customVideoUrl() && video) {
      video.currentTime = Math.max(0, Math.min(sec, video.duration || sec));
    }
    this.playerStore.syncTime(sec);
    this.drawCurrentCanvasFrame();
  }

  private startLoop(): void {
    const step = (nowMs: number) => {
      const dtSec = Math.min(0.1, (nowMs - this.lastTickMs) / 1000);
      this.lastTickMs = nowMs;

      const nextTime =
        this.playerStore.currentTime() + dtSec * this.playerStore.playbackRate();
      const dur = this.playerStore.duration();

      if (nextTime >= dur) {
        this.playerStore.syncTime(dur);
        this.drawCurrentCanvasFrame();
        this.handleEpisodeEnded();
        return;
      }

      this.playerStore.syncTime(nextTime);
      this.drawCurrentCanvasFrame();
      this.rafId = requestAnimationFrame(step);
    };

    this.rafId = requestAnimationFrame(step);
  }

  private stopLoop(): void {
    if (this.rafId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private handleEpisodeEnded(): void {
    this.playerStore.setPlaying(false);
    const nextEp = this.playerStore.nextEpisode();
    if (this.playerStore.autoplayNext() && nextEp) {
      this.playEpisode(nextEp.id);
    }
  }

  private drawCurrentCanvasFrame(): void {
    const canvas = this.canvasRef()?.nativeElement;
    const anime = this.playerStore.currentAnime();
    const ep = this.playerStore.currentEpisode();
    if (!canvas || !anime || !ep || typeof canvas.getContext !== 'function') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderAnimeFrame(ctx, canvas.width, canvas.height, {
      theme: ep.theme,
      timeSec: this.playerStore.currentTime(),
      episodeTitle: `EP ${ep.number} — ${ep.title}`,
      japaneseTitle: anime.japaneseTitle,
      accentColor: anime.accentColor,
      secondaryColor: anime.secondaryColor,
      qualityLabel: this.playerStore.selectedQuality(),
    });
  }
}
