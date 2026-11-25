import { AnimeSeries, Episode, SubtitleCue, VisualTheme } from '../models/anime.model';

function encodeSvgDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

function buildPosterArt(
  title: string,
  jp: string,
  accent: string,
  secondary: string,
  motif: 'torii' | 'cyber' | 'mecha' | 'stars' | 'blade' | 'wave',
): string {
  const motifPath = {
    torii: `<path d="M55 150 H245 M72 172 H228 M92 150 V310 M208 150 V310" stroke="${accent}" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.85"/><circle cx="150" cy="115" r="52" fill="${accent}" opacity="0.22"/>`,
    cyber: `<rect x="65" y="95" width="170" height="190" rx="14" stroke="${accent}" stroke-width="3" fill="none" opacity="0.75"/><path d="M85 260 L150 120 L215 260 Z" stroke="${secondary}" stroke-width="4" fill="${accent}" fill-opacity="0.16"/><line x1="40" y1="210" x2="260" y2="210" stroke="${accent}" stroke-width="2" stroke-dasharray="8 6"/>`,
    mecha: `<polygon points="150,70 230,140 205,270 95,270 70,140" stroke="${accent}" stroke-width="4" fill="${secondary}" fill-opacity="0.18"/><circle cx="150" cy="175" r="30" fill="${accent}" opacity="0.75"/><line x1="150" y1="70" x2="150" y2="270" stroke="#ffffff" stroke-opacity="0.35" stroke-width="2"/>`,
    stars: `<circle cx="150" cy="155" r="68" fill="${accent}" opacity="0.18"/><circle cx="150" cy="155" r="40" stroke="${secondary}" stroke-width="2.5" fill="none" stroke-dasharray="6 5"/><path d="M150 85 L162 143 L220 155 L162 167 L150 225 L138 167 L80 155 L138 143 Z" fill="#fff" opacity="0.85"/>`,
    blade: `<path d="M90 280 L195 80 L212 95 L120 290 Z" fill="${accent}" opacity="0.82"/><circle cx="155" cy="180" r="65" stroke="${secondary}" stroke-width="3" fill="none" opacity="0.5"/>`,
    wave: `<circle cx="150" cy="145" r="64" fill="${accent}" opacity="0.22"/><path d="M30 230 Q90 185 150 230 T270 230 V320 H30 Z" fill="${accent}" opacity="0.45"/><path d="M30 255 Q95 215 160 255 T270 255 V320 H30 Z" fill="${secondary}" opacity="0.5"/>`,
  }[motif];

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0b1021"/>
        <stop offset="55%" stop-color="#141b36"/>
        <stop offset="100%" stop-color="${secondary}" stop-opacity="0.45"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="38%" r="55%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.42"/>
        <stop offset="100%" stop-color="#0b1021" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="300" height="420" fill="url(#bg)"/>
    <rect width="300" height="420" fill="url(#glow)"/>
    <g opacity="0.16" stroke="#ffffff" stroke-width="1">
      <line x1="0" y1="80" x2="300" y2="80"/>
      <line x1="0" y1="340" x2="300" y2="340"/>
      <line x1="36" y1="0" x2="36" y2="420"/>
    </g>
    ${motifPath}
    <text x="24" y="48" fill="${accent}" font-family="system-ui, sans-serif" font-size="13" font-weight="700" letter-spacing="2">${jp}</text>
    <rect x="20" y="330" width="260" height="68" rx="10" fill="#070a14" fill-opacity="0.72"/>
    <text x="34" y="362" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="18" font-weight="800">${title.slice(0, 22)}</text>
    <text x="34" y="384" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" letter-spacing="1.5">ZONELESS STREAM • HD</text>
  </svg>`;
  return encodeSvgDataUri(svg);
}

function buildBannerArt(title: string, jp: string, accent: string, secondary: string): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 500">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#070a14"/>
        <stop offset="50%" stop-color="#121933"/>
        <stop offset="100%" stop-color="${secondary}" stop-opacity="0.55"/>
      </linearGradient>
      <radialGradient id="rg" cx="72%" cy="42%" r="48%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#070a14" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="500" fill="url(#g)"/>
    <rect width="1200" height="500" fill="url(#rg)"/>
    <circle cx="880" cy="215" r="150" stroke="${accent}" stroke-width="2" fill="none" opacity="0.45"/>
    <circle cx="880" cy="215" r="108" stroke="${secondary}" stroke-width="2" stroke-dasharray="10 8" fill="none" opacity="0.6"/>
    <path d="M620 460 L880 90 L1140 460 Z" fill="${accent}" opacity="0.1"/>
    <text x="860" y="232" text-anchor="middle" fill="#ffffff" fill-opacity="0.14" font-family="system-ui, sans-serif" font-size="88" font-weight="900">${jp}</text>
    <text x="880" y="455" text-anchor="middle" fill="${accent}" fill-opacity="0.35" font-family="system-ui, sans-serif" font-size="16" letter-spacing="6">${title.toUpperCase()}</text>
  </svg>`;
  return encodeSvgDataUri(svg);
}

function createCues(epTitle: string, themeLabel: string): SubtitleCue[] {
  return [
    {
      startSec: 1,
      endSec: 7,
      es: `「${epTitle}」 — La transmisión comienza en el sector ${themeLabel}.`,
      en: `"${epTitle}" — Transmission begins in the ${themeLabel} sector.`,
    },
    {
      startSec: 8,
      endSec: 18,
      es: '♪ [Tema de apertura suena — Pulsa "Saltar Intro" para avanzar] ♪',
      en: '♪ [Opening theme playing — Press "Skip Intro" to jump ahead] ♪',
    },
    {
      startSec: 19,
      endSec: 36,
      es: 'Si las señales no responden a tiempo, toda la red perderá sincronía.',
      en: 'If the signals fail to respond in time, the entire grid will desync.',
    },
    {
      startSec: 37,
      endSec: 54,
      es: 'Activa el núcleo reactivo. No necesitamos zonas para sentir el cambio.',
      en: 'Activate the reactive core. We do not need zones to feel the change.',
    },
    {
      startSec: 55,
      endSec: 78,
      es: '¡Ahí viene! Mantén la formación hasta el próximo episodio.',
      en: 'Here it comes! Hold formation until the next episode.',
    },
    {
      startSec: 79,
      endSec: 118,
      es: 'Continuará en el siguiente capítulo...',
      en: 'To be continued in the next chapter...',
    },
  ];
}

function makeEpisodes(
  animeId: string,
  theme: VisualTheme,
  themeLabel: string,
  titles: Array<{ title: string; synopsis: string; durationSec?: number }>,
): Episode[] {
  return titles.map((item, idx) => ({
    id: `${animeId}-ep-${idx + 1}`,
    number: idx + 1,
    title: item.title,
    synopsis: item.synopsis,
    durationSec: item.durationSec ?? 95,
    introStartSec: 8,
    introEndSec: 32,
    theme,
    cues: createCues(item.title, themeLabel),
  }));
}

export const ANIME_CATALOG: AnimeSeries[] = [
  {
    id: 'sakura-protocol',
    title: 'Sakura Protocol: Zero',
    japaneseTitle: '桜プロトコル・ゼロ',
    synopsis:
      'En un Neo-Kioto suspendido entre cerezos holográficos, Aoi descubre un código capaz de reescribir recuerdos sin depender del tiempo lineal.',
    studio: 'Studio Kaze',
    year: 2026,
    rating: 9.4,
    status: 'En emisión',
    genres: ['Sci-Fi', 'Drama', 'Cyberpunk'],
    accentColor: '#ff5c8a',
    secondaryColor: '#7c3aed',
    theme: 'sakura',
    posterUrl: buildPosterArt('Sakura Protocol', '桜ゼロ', '#ff5c8a', '#7c3aed', 'torii'),
    bannerUrl: buildBannerArt('Sakura Protocol: Zero', '桜プロトコル', '#ff5c8a', '#7c3aed'),
    episodes: makeEpisodes('sakura-protocol', 'sakura', 'Neo-Kioto', [
      {
        title: 'Pétalos sin latencia',
        synopsis: 'Aoi intercepta una señal fantasma bajo el santuario antiguo durante la tormenta primaveral.',
      },
      {
        title: 'Eco en el santuario',
        synopsis: 'El consejo de red intenta sellar el distrito 7 mientras el núcleo despierta.',
      },
      {
        title: 'Frecuencia carmesí',
        synopsis: 'Ren revela el verdadero propósito del protocolo Zero y su costo en memorias.',
      },
      {
        title: 'Primavera asíncrona',
        synopsis: 'La batalla sobre el monorriel decide el futuro de los archivos perdidos.',
      },
    ]),
  },
  {
    id: 'neon-shinjuku',
    title: 'Neon Shinjuku 2099',
    japaneseTitle: 'ネオン新宿 2099',
    synopsis:
      'Una mensajera cibernética y un hacker retirado recorren los niveles subterráneos de Tokio enfrentando corporaciones de IA.',
    studio: 'Mappa Nova',
    year: 2025,
    rating: 9.1,
    status: 'Finalizado',
    genres: ['Cyberpunk', 'Acción', 'Thriller'],
    accentColor: '#22d3ee',
    secondaryColor: '#ec4899',
    theme: 'cyberpunk',
    posterUrl: buildPosterArt('Neon Shinjuku', 'ネオン新宿', '#22d3ee', '#ec4899', 'cyber'),
    bannerUrl: buildBannerArt('Neon Shinjuku 2099', 'ネオン新宿', '#22d3ee', '#ec4899'),
    episodes: makeEpisodes('neon-shinjuku', 'cyberpunk', 'Shinjuku-09', [
      {
        title: 'Lluvia de neón',
        synopsis: 'Kira acepta transportar un paquete cifrado que nadie más se atreve a tocar.',
      },
      {
        title: 'Cortafuegos vivo',
        synopsis: 'La persecución por la autopista elevada termina en el mercado negro.',
      },
      {
        title: 'Fantasma en la matriz',
        synopsis: 'Un antiguo aliado reaparece dentro de los servidores de Kurogane Corp.',
      },
      {
        title: 'Sobrecarga de pulso',
        synopsis: 'El apagón total de la ciudad abre la última ventana de escape.',
      },
    ]),
  },
  {
    id: 'aegis-valkyrie',
    title: 'Aegis Frame: Valkyrie',
    japaneseTitle: 'イージス・ヴァルキリー',
    synopsis:
      'Pilotos jóvenes sincronizan mechas orbitales mediante enlaces neuronales directos para defender las colonias lunares.',
    studio: 'Sunrise Works',
    year: 2026,
    rating: 8.9,
    status: 'En emisión',
    genres: ['Mecha', 'Acción', 'Sci-Fi'],
    accentColor: '#f59e0b',
    secondaryColor: '#3b82f6',
    theme: 'mecha',
    posterUrl: buildPosterArt('Aegis Valkyrie', 'ヴァルキリー', '#f59e0b', '#3b82f6', 'mecha'),
    bannerUrl: buildBannerArt('Aegis Frame: Valkyrie', 'イージス', '#f59e0b', '#3b82f6'),
    episodes: makeEpisodes('aegis-valkyrie', 'mecha', 'Órbita L4', [
      {
        title: 'Despegue en órbita L4',
        synopsis: 'El escuadrón Valkyrie realiza su primera salida real ante un enjambre desconocido.',
      },
      {
        title: 'Blindaje resonante',
        synopsis: 'Hana supera el límite de sincronización para proteger el ascensor espacial.',
      },
      {
        title: 'El hangar silencioso',
        synopsis: 'Secretos de la primera guerra orbital salen a la luz tras una inspección.',
      },
    ]),
  },
  {
    id: 'astral-chronicles',
    title: 'Crónicas del Velo Astral',
    japaneseTitle: '星幽のクロニクル',
    synopsis:
      'Una cartógrafa de constelaciones viaja en un tren celeste buscando las siete estrellas que sostienen el cielo nocturno.',
    studio: 'CoMix Atelier',
    year: 2024,
    rating: 9.3,
    status: 'Finalizado',
    genres: ['Fantasía', 'Aventura', 'Drama'],
    accentColor: '#a78bfa',
    secondaryColor: '#38bdf8',
    theme: 'starlight',
    posterUrl: buildPosterArt('Velo Astral', '星幽クロニクル', '#a78bfa', '#38bdf8', 'stars'),
    bannerUrl: buildBannerArt('Crónicas del Velo Astral', '星幽', '#a78bfa', '#38bdf8'),
    episodes: makeEpisodes('astral-chronicles', 'starlight', 'Vía Celeste', [
      {
        title: 'Andén entre las nubes',
        synopsis: 'El expreso nocturno parte puntualmente con rumbo a la primera constelación.',
      },
      {
        title: 'El faro de Orión',
        synopsis: 'Una tormenta solar amenaza con borrar los mapas estelares de Lía.',
      },
      {
        title: 'Polvo de cometa',
        synopsis: 'Un pasajero misterioso intercambia un reloj detenido por un boleto dorado.',
      },
    ]),
  },
  {
    id: 'crimson-katana',
    title: 'Espada del Alba Carmesí',
    japaneseTitle: '紅蓮の暁',
    synopsis:
      'En una era feudal alternativa, un espadachín errante forja un pacto con el espíritu del fuego para romper una maldición ancestral.',
    studio: 'Ufotable Studio',
    year: 2025,
    rating: 9.5,
    status: 'En emisión',
    genres: ['Acción', 'Fantasía', 'Sobrenatural'],
    accentColor: '#ef4444',
    secondaryColor: '#f97316',
    theme: 'crimson',
    posterUrl: buildPosterArt('Alba Carmesí', '紅蓮の暁', '#ef4444', '#f97316', 'blade'),
    bannerUrl: buildBannerArt('Espada del Alba Carmesí', '紅蓮の暁', '#ef4444', '#f97316'),
    episodes: makeEpisodes('crimson-katana', 'crimson', 'Monte Kurenai', [
      {
        title: 'Cenizas en la nieve',
        synopsis: 'El despertar de la hoja carmesí ilumina el valle congelado.',
      },
      {
        title: 'Duelo bajo la luna roja',
        synopsis: 'Dos estilos de esgrima chocan en el puente colgante de madera.',
      },
      {
        title: 'Juramento de brasas',
        synopsis: 'La forja secreta revela el origen del demonio de la montaña.',
      },
    ]),
  },
  {
    id: 'deep-abyss-song',
    title: 'Canto del Abismo Azul',
    japaneseTitle: '蒼き深淵の歌',
    synopsis:
      'Buzos de ciudades sumergidas descubren ruinas musicales capaces de calmar a los leviatanes que rodean la fosa marina.',
    studio: 'Kyoto Wave',
    year: 2024,
    rating: 8.8,
    status: 'Finalizado',
    genres: ['Aventura', 'Misterio', 'Slice of Life'],
    accentColor: '#38bdf8',
    secondaryColor: '#14b8a6',
    theme: 'ocean',
    posterUrl: buildPosterArt('Abismo Azul', '蒼き深淵', '#38bdf8', '#14b8a6', 'wave'),
    bannerUrl: buildBannerArt('Canto del Abismo Azul', '蒼き深淵', '#38bdf8', '#14b8a6'),
    episodes: makeEpisodes('deep-abyss-song', 'ocean', 'Fosa Coral', [
      {
        title: 'Inmersión al crepúsculo',
        synopsis: 'Primera expedición acústica hacia los arcos bioluminiscentes.',
      },
      {
        title: 'Resonancia de coral',
        synopsis: 'El sonar capta una melodía que responde exactamente a la voz de Sora.',
      },
      {
        title: 'Ciudad bajo la marea',
        synopsis: 'Las compuertas de cristal se abren por primera vez en cien años.',
      },
    ]),
  },
];
