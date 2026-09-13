// Hit-Tazos Tech — Pure Game Rules & Scoring Engine
import { GAME_RULES } from './constants.js';

/**
 * Evalúa una predicción cronológica contra el año real de la tarjeta.
 * Retorna resultado puro sin efectos secundarios.
 * 
 * @param {number} guessYear Año ingresado por el jugador
 * @param {number} actualYear Año histórico real
 * @param {number} attemptCount Intentos ya consumidos (1, 2, 3)
 * @param {number} [maxAttempts=3] Máximo de intentos permitidos
 */
export function evaluateGuess(guessYear, actualYear, attemptCount, maxAttempts = GAME_RULES.MAX_ATTEMPTS) {
  const g = parseInt(guessYear, 10);
  const a = parseInt(actualYear, 10);
  const diff = Math.abs(g - a);

  if (diff === 0) {
    return {
      outcome: 'EXACT',
      diff: 0,
      scoreDelta: GAME_RULES.POINTS_EXACT,
      streakDelta: 1,
      wonCard: true,
      cardSolved: true,
      attemptsRemaining: Math.max(0, maxAttempts - attemptCount),
      hint: null
    };
  }

  if (diff <= GAME_RULES.NEAR_TOLERANCE_YEARS) {
    return {
      outcome: 'NEAR',
      diff,
      scoreDelta: GAME_RULES.POINTS_NEAR,
      streakDelta: 1,
      wonCard: true,
      cardSolved: true,
      attemptsRemaining: Math.max(0, maxAttempts - attemptCount),
      hint: null
    };
  }

  if (attemptCount < maxAttempts) {
    return {
      outcome: 'MISS_RETRY',
      diff,
      scoreDelta: 0,
      streakDelta: 0, // Rompe racha
      resetStreak: true,
      wonCard: false,
      cardSolved: false,
      attemptsRemaining: maxAttempts - attemptCount,
      hint: calculateHint(g, a)
    };
  }

  // Agotó los 3 intentos
  return {
    outcome: 'EXHAUSTED',
    diff,
    scoreDelta: 0,
    streakDelta: 0,
    resetStreak: true,
    wonCard: false,
    cardSolved: true, // Bloquea tiro
    attemptsRemaining: 0,
    hint: null
  };
}

/**
 * Calcula pista cualitativa direccional y térmica SIN revelar diferencia numérica exacta.
 * 
 * @param {number} guessYear
 * @param {number} actualYear
 */
export function calculateHint(guessYear, actualYear) {
  const diff = Math.abs(guessYear - actualYear);
  const direction = guessYear < actualYear ? 'MORE_RECENT' : 'OLDER';
  const directionText = guessYear < actualYear ? '↑ Más reciente' : '↓ Más antiguo';

  let temperature, tempText;
  if (diff <= 5) {
    temperature = 'HOT';
    tempText = '🔥 ¡Caliente!';
  } else if (diff <= 15) {
    temperature = 'WARM';
    tempText = '🌡️ Tibio';
  } else {
    temperature = 'COLD';
    tempText = '❄️ Frío';
  }

  return {
    direction,
    directionText,
    temperature,
    tempText
  };
}

/**
 * Ordena inmutablemente la colección del jugador por año cronológico.
 * 
 * @param {Array<Object>} shelf
 * @returns {Array<Object>}
 */
export function sortShelfChronological(shelf) {
  if (!Array.isArray(shelf)) return [];
  return [...shelf].sort((a, b) => (a.year || 0) - (b.year || 0));
}

/**
 * Comprueba si el jugador alcanzó la meta de victoria.
 * 
 * @param {Array<Object>} shelf
 * @param {number} [targetSize=10]
 * @returns {boolean}
 */
export function checkVictory(shelf, targetSize = GAME_RULES.VICTORY_SHELF_SIZE) {
  return Array.isArray(shelf) && shelf.length >= targetSize;
}

/**
 * Formatea el número de identificación de volumen hexadecimal (ej. "vol0-0x1A" -> "0x1A").
 * 
 * @param {string} id
 * @returns {string}
 */
export function formatCardIdNumber(id) {
  if (!id) return '0x00';
  const volId = id.split('-')[0].replace('vol', '') || '0';
  const hexPart = id.split('-')[1]?.substring(2) || '00';
  return `${volId}x${hexPart}`;
}

/**
 * Formatea el número de coleccionista a 3 dígitos (ej. 1 -> "001").
 * 
 * @param {Object} card
 * @returns {string}
 */
export function formatCollectorNumber(card) {
  if (!card) return '001';
  const num = card.globalIndex || (card.index !== undefined ? card.index + 1 : 1);
  return String(num).padStart(3, '0');
}
