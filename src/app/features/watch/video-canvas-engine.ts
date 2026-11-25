import { VisualTheme } from '../../core/models/anime.model';

export interface FrameRenderOptions {
  theme: VisualTheme;
  timeSec: number;
  episodeTitle: string;
  japaneseTitle: string;
  accentColor: string;
  secondaryColor: string;
  qualityLabel: string;
}

/**
 * Renders a deterministic, 60fps-capable anime-style frame at `timeSec`
 * onto a 2D canvas context so seeking, pausing, and speed changes work cleanly.
 */
export function renderAnimeFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: FrameRenderOptions,
): void {
  const { theme, timeSec, episodeTitle, japaneseTitle, accentColor, secondaryColor } = opts;

  // Sky / background gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#070a16');
  grad.addColorStop(0.55, '#121936');
  grad.addColorStop(1, secondaryColor + '66');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle ambient glow
  const glowX = width * (0.68 + Math.sin(timeSec * 0.25) * 0.05);
  const glowY = height * (0.36 + Math.cos(timeSec * 0.2) * 0.04);
  const rad = ctx.createRadialGradient(glowX, glowY, 10, glowX, glowY, width * 0.45);
  rad.addColorStop(0, accentColor + '66');
  rad.addColorStop(1, 'rgba(7,10,22,0)');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, width, height);

  // Theme-specific animated artwork
  if (theme === 'sakura') {
    drawSakuraScene(ctx, width, height, timeSec, accentColor);
  } else if (theme === 'cyberpunk') {
    drawCyberpunkScene(ctx, width, height, timeSec, accentColor, secondaryColor);
  } else if (theme === 'mecha') {
    drawMechaScene(ctx, width, height, timeSec, accentColor, secondaryColor);
  } else if (theme === 'crimson') {
    drawCrimsonScene(ctx, width, height, timeSec, accentColor, secondaryColor);
  } else if (theme === 'ocean') {
    drawOceanScene(ctx, width, height, timeSec, accentColor, secondaryColor);
  } else {
    drawStarlightScene(ctx, width, height, timeSec, accentColor, secondaryColor);
  }

  // Cinematic letterbox bars
  ctx.fillStyle = 'rgba(4, 6, 14, 0.72)';
  ctx.fillRect(0, 0, width, 28);
  ctx.fillRect(0, height - 28, width, 28);

  // Subtle broadcast HUD tag
  ctx.fillStyle = 'rgba(248, 250, 252, 0.72)';
  ctx.font = '600 13px system-ui, sans-serif';
  ctx.fillText(`${japaneseTitle}  •  ${episodeTitle}`, 22, 48);

  ctx.fillStyle = accentColor;
  ctx.font = '700 11px system-ui, sans-serif';
  ctx.fillText(`KITSUNEPLAY ${opts.qualityLabel}`, width - 150, 48);
}

function drawSakuraScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  accent: string,
): void {
  // Moon
  ctx.fillStyle = 'rgba(255, 240, 246, 0.9)';
  ctx.beginPath();
  ctx.arc(w * 0.75, h * 0.28, 54, 0, Math.PI * 2);
  ctx.fill();

  // Torii silhouette
  ctx.fillStyle = 'rgba(10, 12, 24, 0.88)';
  ctx.fillRect(w * 0.22, h * 0.42, 16, h * 0.58);
  ctx.fillRect(w * 0.42, h * 0.42, 16, h * 0.58);
  ctx.fillRect(w * 0.16, h * 0.4, w * 0.34, 16);
  ctx.fillRect(w * 0.19, h * 0.5, w * 0.28, 10);

  // Drifting sakura petals
  ctx.fillStyle = accent;
  for (let i = 0; i < 36; i++) {
    const px = ((i * 97 + t * (45 + (i % 5) * 14)) % (w + 60)) - 30;
    const py = ((i * 53 + t * (28 + (i % 4) * 10) + Math.sin(t + i) * 18) % (h + 40)) - 20;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(t * 1.4 + i);
    ctx.globalAlpha = 0.55 + (i % 3) * 0.15;
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function drawCyberpunkScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  accent: string,
  secondary: string,
): void {
  // Skyline blocks
  for (let i = 0; i < 14; i++) {
    const bw = w / 14;
    const bh = 120 + ((i * 67) % 180);
    ctx.fillStyle = 'rgba(9, 13, 28, 0.88)';
    ctx.fillRect(i * bw, h * 0.72 - bh, bw - 4, bh);
    ctx.fillStyle = i % 2 === 0 ? accent : secondary;
    ctx.globalAlpha = 0.45 + 0.3 * Math.sin(t * 2 + i);
    ctx.fillRect(i * bw + 8, h * 0.72 - bh + 18, bw - 22, 5);
  }
  ctx.globalAlpha = 1;

  // Perspective neon grid floor
  ctx.strokeStyle = accent + '55';
  ctx.lineWidth = 1.5;
  const horizon = h * 0.72;
  for (let i = -8; i <= 8; i++) {
    ctx.beginPath();
    ctx.moveTo(w * 0.5 + i * 35, horizon);
    ctx.lineTo(w * 0.5 + i * 130, h);
    ctx.stroke();
  }
  const offset = (t * 60) % 40;
  for (let y = horizon + offset; y < h; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Neon rain
  ctx.strokeStyle = secondary;
  ctx.globalAlpha = 0.45;
  for (let i = 0; i < 40; i++) {
    const rx = (i * 73 + t * 20) % w;
    const ry = (i * 89 + t * 340) % h;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 4, ry + 18);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawMechaScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  accent: string,
  secondary: string,
): void {
  const cx = w * 0.5;
  const cy = h * 0.52;

  // Rotating orbital HUD rings
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t * 0.35);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([18, 12]);
  ctx.beginPath();
  ctx.arc(0, 0, 145, 0, Math.PI * 2);
  ctx.stroke();

  ctx.rotate(-t * 0.7);
  ctx.strokeStyle = secondary;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.arc(0, 0, 102, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Core energy pulse
  const pulse = 36 + Math.sin(t * 4) * 6;
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(0, 0, pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawCrimsonScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  accent: string,
  secondary: string,
): void {
  // Crimson moon
  ctx.fillStyle = accent + '55';
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.44, 125, 0, Math.PI * 2);
  ctx.fill();

  // Katana energy arc
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  const sweep = (t * 0.9) % (Math.PI * 2);
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.52, 165, sweep, sweep + 1.1);
  ctx.stroke();

  // Rising embers
  ctx.fillStyle = secondary;
  for (let i = 0; i < 35; i++) {
    const x = (i * 83 + Math.sin(t * 2 + i) * 30) % w;
    const y = h - ((i * 41 + t * (65 + (i % 4) * 20)) % h);
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(x, y, 2.5 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawOceanScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  accent: string,
  secondary: string,
): void {
  // Bioluminescent waves
  for (let layer = 0; layer < 3; layer++) {
    ctx.fillStyle = layer % 2 === 0 ? accent + '33' : secondary + '44';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 24) {
      const y = h * (0.58 + layer * 0.09) + Math.sin(x * 0.012 + t * (1.4 + layer * 0.4)) * 18;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }

  // Rising light bubbles
  ctx.strokeStyle = '#e0f2fe';
  for (let i = 0; i < 24; i++) {
    const x = (i * 93 + Math.sin(t + i) * 20) % w;
    const y = h - ((i * 57 + t * 50) % h);
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(x, y, 4 + (i % 5), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawStarlightScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  accent: string,
  secondary: string,
): void {
  // Starfield
  for (let i = 0; i < 60; i++) {
    const x = (i * 137) % w;
    const y = (i * 79) % (h * 0.85);
    ctx.fillStyle = i % 3 === 0 ? accent : i % 2 === 0 ? secondary : '#ffffff';
    ctx.globalAlpha = 0.35 + 0.6 * Math.abs(Math.sin(t * 1.8 + i));
    ctx.beginPath();
    ctx.arc(x, y, 1.5 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
