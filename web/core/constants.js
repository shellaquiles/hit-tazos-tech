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
  FORMAT: 'hittazos_format'
};

export const CARD_FORMATS = {
  DISC: 'disc',
  CARD: 'card'
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
    c1: '#00d2d3',
    c2: '#0984e3',
    badgeBg: '#ffe600',
    badgeColor: '#000000'
  },
  'python-ecosystem': {
    c1: '#3867d6',
    c2: '#fed330',
    badgeBg: '#ffe600',
    badgeColor: '#000000'
  },
  'security-exploits': {
    c1: '#eb3b5a',
    c2: '#20bf6b',
    badgeBg: '#ffe600',
    badgeColor: '#000000'
  },
  'unix-internals': {
    c1: '#fa8231',
    c2: '#8854d0',
    badgeBg: '#ffe600',
    badgeColor: '#000000'
  },
  'cloud-devops': {
    c1: '#4b7bec',
    c2: '#2ed573',
    badgeBg: '#ffe600',
    badgeColor: '#000000'
  },
  'silicon-hardware': {
    c1: '#fd9644',
    c2: '#2bcbba',
    badgeBg: '#ffe600',
    badgeColor: '#000000'
  },
  'distributed-systems': {
    c1: '#45aaf2',
    c2: '#a55eea',
    badgeBg: '#ffe600',
    badgeColor: '#000000'
  },
  'ai-data-science': {
    c1: '#8854d0',
    c2: '#f368e0',
    badgeBg: '#ffe600',
    badgeColor: '#000000'
  },
  'scifi-cinema': {
    c1: '#f368e0',
    c2: '#5f27cd',
    badgeBg: '#ffe600',
    badgeColor: '#000000'
  },
  'hacker-lore': {
    c1: '#2ed573',
    c2: '#1e272e',
    badgeBg: '#ffe600',
    badgeColor: '#000000'
  }
};

export const DEFAULT_PALETTE = {
  c1: '#00d2d3',
  c2: '#0984e3',
  badgeBg: '#ffe600',
  badgeColor: '#000000'
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
