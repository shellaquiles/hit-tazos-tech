/**
 * Fuse.js (Lightweight Fuzzy Search Engine)
 * Compatible with Fuse API (keys, weights, search)
 * Zero-dependency standalone implementation
 */
(function (root) {
  'use strict';

  class Fuse {
    constructor(list, options = {}) {
      this.list = list || [];
      this.options = Object.assign({
        keys: [],
        threshold: 0.4,
        minMatchCharLength: 2
      }, options);
    }

    setCollection(list) {
      this.list = list;
    }

    search(pattern) {
      if (!pattern || typeof pattern !== 'string') return [];
      const q = pattern.trim().toLowerCase();
      if (q.length < (this.options.minMatchCharLength || 1)) return [];

      const terms = q.split(/\s+/).filter(Boolean);
      const results = [];

      for (let i = 0; i < this.list.length; i++) {
        const item = this.list[i];
        let bestScore = Infinity;

        for (const keyDef of this.options.keys) {
          const keyName = typeof keyDef === 'string' ? keyDef : keyDef.name;
          const weight = (typeof keyDef === 'object' && keyDef.weight) || 1;
          const val = item[keyName];
          if (!val) continue;

          const text = String(val).toLowerCase();

          // Puntuación por coincidencia exacta
          if (text === q) {
            bestScore = Math.min(bestScore, 0.01 / weight);
            continue;
          }

          // Substring directo
          if (text.includes(q)) {
            bestScore = Math.min(bestScore, 0.1 / weight);
            continue;
          }

          // Coincidencia de todos los términos
          let matchedAll = true;
          let termScore = 0;
          for (const term of terms) {
            const idx = text.indexOf(term);
            if (idx !== -1) {
              termScore += (idx === 0 ? 0.15 : 0.25);
            } else {
              // Búsqueda difusa simple
              let pIdx = 0;
              for (let c = 0; c < text.length && pIdx < term.length; c++) {
                if (text[c] === term[pIdx]) pIdx++;
              }
              if (pIdx === term.length) {
                termScore += 0.35;
              } else {
                matchedAll = false;
                break;
              }
            }
          }

          if (matchedAll) {
            const finalScore = (termScore / terms.length) / weight;
            bestScore = Math.min(bestScore, finalScore);
          }
        }

        if (bestScore <= (this.options.threshold || 0.6)) {
          results.push({ item, score: bestScore, refIndex: i });
        }
      }

      results.sort((a, b) => a.score - b.score);
      return results;
    }
  }

  root.Fuse = Fuse;
})(typeof window !== 'undefined' ? window : this);
