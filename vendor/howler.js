/**
 * Howler.js lightweight offline driver / compatible Howl implementation
 * Supports Howler API: new Howl({ src, volume, html5 }), play(), stop(), volume()
 * Zero-dependency standalone implementation with audio pooling for low latency
 */
(function (root) {
  'use strict';

  // Si Howl ya fue cargado por CDN, respetarlo
  if (typeof root.Howl === 'function') return;

  class Howl {
    constructor(options = {}) {
      this._src = Array.isArray(options.src) ? options.src[0] : options.src;
      this._volume = typeof options.volume === 'number' ? options.volume : 1.0;
      this._pool = [];
      this._poolSize = options.pool || 5;
      this._muted = false;
      this._initPool();
    }

    _initPool() {
      if (!this._src || typeof Audio === 'undefined') return;
      for (let i = 0; i < this._poolSize; i++) {
        try {
          const audio = new Audio();
          audio.preload = 'auto';
          audio.src = this._src;
          audio.volume = this._volume;
          this._pool.push(audio);
        } catch (_) {}
      }
    }

    _getAudioNode() {
      // Buscar nodo que haya terminado o no esté reproduciéndose
      for (const node of this._pool) {
        if (node.paused || node.ended) {
          return node;
        }
      }
      // Si todos están ocupados, tomar el primero o crear uno nuevo
      if (this._pool.length < 10) {
        try {
          const node = new Audio(this._src);
          node.volume = this._volume;
          this._pool.push(node);
          return node;
        } catch (_) {}
      }
      return this._pool[0] || null;
    }

    play() {
      if (this._muted) return null;
      const audio = this._getAudioNode();
      if (!audio) return null;
      try {
        audio.volume = this._volume;
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Maneja autoplay policy silenciosamente
          });
        }
      } catch (_) {}
      return audio;
    }

    stop() {
      for (const node of this._pool) {
        try {
          node.pause();
          node.currentTime = 0;
        } catch (_) {}
      }
      return this;
    }

    volume(val) {
      if (typeof val === 'number') {
        this._volume = Math.max(0, Math.min(1, val));
        for (const node of this._pool) {
          node.volume = this._volume;
        }
        return this;
      }
      return this._volume;
    }

    unload() {
      this.stop();
      for (const node of this._pool) {
        node.src = '';
      }
      this._pool = [];
    }
  }

  root.Howl = Howl;
  root.Howler = {
    volume: function(val) {
      if (typeof val === 'number') root.Howler._volume = val;
      return root.Howler._volume || 1;
    },
    mute: function() {},
    unload: function() {}
  };
})(typeof window !== 'undefined' ? window : this);
