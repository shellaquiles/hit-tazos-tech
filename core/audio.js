// Hit-Tazos Tech — Modular Audio Engine (Single Responsibility Principle)

export class AudioEngine {
  constructor() {
    this.soundEnabled = true;
    this.clips = null;
    this.initClips();
  }

  initClips() {
    if (typeof Howl === 'function') {
      try {
        this.clips = {
          flip: new Howl({ src: ['assets/sfx/tazo_flip.mp3'], volume: 0.4 }),
          slam: new Howl({ src: ['assets/sfx/tazo_slam.mp3'], volume: 0.7 }),
          hit: new Howl({ src: ['assets/sfx/tazo_win.mp3'], volume: 0.5 }),
          miss: new Howl({ src: ['assets/sfx/tazo_miss.mp3'], volume: 0.4 }),
          tick: new Howl({ src: ['assets/sfx/tazo_tick.mp3'], volume: 0.25 })
        };
      } catch (err) {
        console.warn('AudioEngine: No se pudo inicializar banco Howler, fallback silencioso activo.', err);
        this.clips = null;
      }
    }
  }

  play(clipName) {
    if (!this.soundEnabled || !this.clips || !this.clips[clipName]) return;
    try {
      this.clips[clipName].play();
    } catch (_) {}
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = Boolean(enabled);
  }
}
