import { TestBed } from '@angular/core/testing';
import { PlayerStore } from './player.store';

describe('PlayerStore (Signals & linkedSignal)', () => {
  let player: PlayerStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    player = TestBed.inject(PlayerStore);
  });

  it('loads an episode and computes intro skip, subtitles, and up-next state', () => {
    player.loadEpisode('sakura-protocol', 'sakura-protocol-ep-1');

    expect(player.currentAnime()?.id).toBe('sakura-protocol');
    expect(player.currentEpisode()?.number).toBe(1);
    expect(player.nextEpisode()?.number).toBe(2);
    expect(player.prevEpisode()).toBeUndefined();

    // During opening window (8s..32s)
    player.syncTime(12);
    expect(player.canSkipIntro()).toBe(true);
    expect(player.activeSubtitleText()).toContain('Saltar Intro');

    // Near the end of the 95s episode
    player.syncTime(88);
    expect(player.canSkipIntro()).toBe(false);
    expect(player.showUpNextBanner()).toBe(true);
  });

  it('resets linkedSignal sidebar tab when switching anime', () => {
    player.loadEpisode('sakura-protocol', 'sakura-protocol-ep-1');
    player.activeSidebarTab.set('details');
    expect(player.activeSidebarTab()).toBe('details');

    player.loadEpisode('neon-shinjuku', 'neon-shinjuku-ep-1');
    expect(player.activeSidebarTab()).toBe('episodes');
  });
});
