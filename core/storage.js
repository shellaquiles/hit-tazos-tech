// Hit-Tazos Tech — Unified Storage Adapter (Adapter Pattern with Schema Validation)
import { STORAGE_KEYS } from './constants.js';

export class StorageAdapter {
  /**
   * Obtiene un valor desde IndexedDB o localStorage de forma transparente.
   * Si se provee un validador y el valor no lo satisface, devuelve el fallback.
   * 
   * @param {string} key
   * @param {*} fallback
   * @param {Function} [validator]
   * @returns {Promise<*>}
   */
  static async get(key, fallback = null, validator = null) {
    let raw = null;
    try {
      if (typeof idbKeyval !== 'undefined') {
        raw = await idbKeyval.get(key);
      } else if (typeof window !== 'undefined' && window.localStorage) {
        const item = localStorage.getItem(key);
        if (item !== null) {
          raw = JSON.parse(item);
        }
      }
    } catch (_) {
      raw = null;
    }

    if (raw === null || raw === undefined) {
      return fallback;
    }

    if (typeof validator === 'function') {
      try {
        if (!validator(raw)) return fallback;
      } catch (_) {
        return fallback;
      }
    }

    return raw;
  }

  /**
   * Guarda un valor en IndexedDB y localStorage de manera segura y sincronizada.
   * 
   * @param {string} key
   * @param {*} value
   * @returns {Promise<void>}
   */
  static async set(key, value) {
    try {
      if (typeof idbKeyval !== 'undefined') {
        await idbKeyval.set(key, value);
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (_) {}
  }

  /**
   * Elimina una clave de ambos motores de persistencia.
   * 
   * @param {string} key
   * @returns {Promise<void>}
   */
  static async remove(key) {
    try {
      if (typeof idbKeyval !== 'undefined') {
        await idbKeyval.del(key);
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (_) {}
  }

  /**
   * Limpia todas las claves del juego.
   * 
   * @returns {Promise<void>}
   */
  static async clearAllGameState() {
    const keys = [
      STORAGE_KEYS.SHELF,
      STORAGE_KEYS.SCORE,
      STORAGE_KEYS.STREAK,
      STORAGE_KEYS.REVEALED
    ];
    for (const k of keys) {
      await this.remove(k);
    }
  }

  // ── Validadores de Esquema ────────────────────────────────────────────────

  static validateShelf(shelf) {
    if (!Array.isArray(shelf)) return false;
    return shelf.every(c => c && typeof c === 'object' && typeof c.year === 'number');
  }

  static validateScore(score) {
    return typeof score === 'number' && !isNaN(score) && score >= 0;
  }

  static validateStreak(streak) {
    return typeof streak === 'number' && !isNaN(streak) && streak >= 0;
  }

  static validateRevealed(revealed) {
    return Array.isArray(revealed) && revealed.every(id => typeof id === 'string');
  }
}
