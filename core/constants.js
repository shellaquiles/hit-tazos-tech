// Hit-Tazos Tech — Canonical Game Constants & Configuration

export const GAME_RULES = {
  MAX_ATTEMPTS: 3,
  POINTS_EXACT: 3,
  POINTS_NEAR: 1,
  NEAR_TOLERANCE_YEARS: 2,
  POINTS_REVEAL_PENALTY: 5,
  VICTORY_SHELF_SIZE: 10,
  HOT_STREAK_THRESHOLD: 2,
  MIN_REVEAL_SCORE: 5
};

export const CHRONO_BOUNDS = {
  MIN_YEAR: 1940,
  MAX_YEAR: 2026,
  DEFAULT_YEAR: 1990
};

export const STORAGE_KEYS = {
  SHELF: 'hittazos_shelf',
  SCORE: 'hittazos_score',
  STREAK: 'hittazos_streak',
  REVEALED: 'hittazos_revealed',
  FORMAT: 'hittazos_format',
  VERSION_CHOSEN: 'hittazos_version_chosen'
};

export const CARD_FORMATS = {
  DISC: 'disc',
  CARD: 'card'
};

export const GAME_VERSIONS = {
  TAZO: {
    id: 'tazo',
    format: CARD_FORMATS.DISC,
    name: 'HIT-TAZOS',
    title: 'Hit-Tazo Tech',
    badge: 'Tech',
    icon: 'disc'
  },
  CARDS: {
    id: 'cards',
    format: CARD_FORMATS.CARD,
    name: 'HIT-CARDS',
    title: 'Hit-Cards Tech',
    badge: 'Tech',
    icon: 'layers'
  }
};

// Selectores Canónicos del DOM (DRY)
export const CARD_SELECTORS = {
  ACTIVE_CARD: '.disc-physical, .disc, .tazo-physical, .tazo-disc, .hittazos-card-3d',
  YEAR_STAGE: '#year-target, .disc-year-hero, .tazo-year-hero, .tazo-year-stage, .year-hero-display, .year-center-stage'
};

// Tokens de Animación WAAPI y Transiciones
export const ANIM_CONFIG = {
  FLIP_DURATION: 540,
  SLIDE_EXIT_DURATION: 180,
  SLIDE_ENTER_DURATION: 320,
  SPIN_DURATION: 380,
  SPIN_SETTLE_DURATION: 220,
  SHAKE_DURATION: 440,
  SLAM_SUCCESS_DURATION: 750,
  EASE_ELASTIC: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  EASE_EXIT: 'cubic-bezier(0.4, 0, 1, 1)',
  EASE_SPIN: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  EASE_SHAKE: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)'
};

export const DOMAIN_PALETTES = {
  'languages-runtimes': {
    c1: '#0f172a',
    c2: '#0e7490',
    accent: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.4)',
    badgeBg: '#0f172a',
    badgeColor: '#38bdf8'
  },
  'python-ecosystem': {
    c1: '#1e1b4b',
    c2: '#312e81',
    accent: '#60a5fa',
    secondaryAccent: '#facc15',
    glow: 'rgba(96, 165, 250, 0.4)',
    badgeBg: '#1e1b4b',
    badgeColor: '#60a5fa'
  },
  'security-exploits': {
    c1: '#18181b',
    c2: '#27272a',
    accent: '#4ade80',
    secondaryAccent: '#f43f5e',
    glow: 'rgba(74, 222, 128, 0.4)',
    badgeBg: '#18181b',
    badgeColor: '#4ade80'
  },
  'unix-internals': {
    c1: '#0f172a',
    c2: '#1e293b',
    accent: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.4)',
    badgeBg: '#0f172a',
    badgeColor: '#38bdf8'
  },
  'cloud-devops': {
    c1: '#082f49',
    c2: '#0369a1',
    accent: '#2dd4bf',
    glow: 'rgba(45, 212, 191, 0.4)',
    badgeBg: '#082f49',
    badgeColor: '#2dd4bf'
  },
  'silicon-hardware': {
    c1: '#291a10',
    c2: '#431407',
    accent: '#fb923c',
    glow: 'rgba(251, 146, 60, 0.4)',
    badgeBg: '#291a10',
    badgeColor: '#fb923c'
  },
  'distributed-systems': {
    c1: '#082f49',
    c2: '#0f172a',
    accent: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.4)',
    badgeBg: '#082f49',
    badgeColor: '#38bdf8'
  },
  'ai-data-science': {
    c1: '#2e1065',
    c2: '#3b0764',
    accent: '#e879f9',
    glow: 'rgba(232, 121, 249, 0.4)',
    badgeBg: '#2e1065',
    badgeColor: '#e879f9'
  },
  'scifi-cinema': {
    c1: '#09090b',
    c2: '#18181b',
    accent: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.4)',
    badgeBg: '#09090b',
    badgeColor: '#a855f7'
  },
  'hacker-lore': {
    c1: '#18181b',
    c2: '#27272a',
    accent: '#4ade80',
    glow: 'rgba(74, 222, 128, 0.4)',
    badgeBg: '#18181b',
    badgeColor: '#4ade80'
  }
};

export const DEFAULT_PALETTE = {
  c1: '#0f172a',
  c2: '#0e7490',
  accent: '#38bdf8',
  glow: 'rgba(56, 189, 248, 0.4)',
  badgeBg: '#0f172a',
  badgeColor: '#38bdf8'
};

export const DOMAIN_ICONS = {
  'languages-runtimes': 'binary',
  'python-ecosystem': 'terminal',
  'security-exploits': 'shield-alert',
  'unix-internals': 'server',
  'cloud-devops': 'cloud',
  'silicon-hardware': 'cpu',
  'distributed-systems': 'network',
  'ai-data-science': 'brain',
  'scifi-cinema': 'sparkles',
  'hacker-lore': 'terminal'
};

// Configuración Canónica de URLs Externas y Analítica UTM
export const UTM_CONFIG = {
  SOURCE: 'webapp',
  CAMPAIGN: 'hit-tazos-tech',
  MEDIUM: {
    HEADER: 'header',
    FOOTER: 'footer',
    MODAL: 'modal',
    HELP: 'help'
  }
};

/**
 * Construye o decora una URL con parámetros analíticos UTM estandarizados
 * @param {string} url - URL base o completa
 * @param {Object} [options] - Parámetros opcionales
 * @returns {string} URL con query string UTM
 */
export function buildUtmUrl(url, { source = UTM_CONFIG.SOURCE, medium = 'web', campaign = UTM_CONFIG.CAMPAIGN } = {}) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('utm_source', source);
    if (medium) parsed.searchParams.set('utm_medium', medium);
    if (campaign) parsed.searchParams.set('utm_campaign', campaign);
    return parsed.toString();
  } catch {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}utm_source=${encodeURIComponent(source)}&utm_medium=${encodeURIComponent(medium)}&utm_campaign=${encodeURIComponent(campaign)}`;
  }
}

export const EXTERNAL_URLS = {
  GITHUB_REPO: buildUtmUrl('https://github.com/shellaquiles/hit-tazos-tech', { medium: UTM_CONFIG.MEDIUM.FOOTER }),
  GITHUB_RELEASE: buildUtmUrl('https://github.com/shellaquiles/hit-tazos-tech/releases/latest', { medium: UTM_CONFIG.MEDIUM.FOOTER, campaign: 'release' }),
  ORG_HEADER: buildUtmUrl('https://shellaquiles.org', { medium: UTM_CONFIG.MEDIUM.HEADER }),
  ORG_FOOTER: buildUtmUrl('https://shellaquiles.org', { medium: UTM_CONFIG.MEDIUM.FOOTER })
};
