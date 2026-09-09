// Automated Unit Tests for Hit-Tazos Tech Game Rules
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  evaluateGuess, 
  calculateHint, 
  sortShelfChronological, 
  checkVictory, 
  formatCardIdNumber,
  formatCollectorNumber 
} from '../web/core/rules.js';
import { GAME_RULES } from '../web/core/constants.js';

describe('Hit-Tazos Tech — Game Rules & Scoring Engine', () => {

  test('Acierto Exacto (diff === 0): otorga +3 puntos, +1 racha y gana carta', () => {
    const res = evaluateGuess(1969, 1969, 1);
    assert.equal(res.outcome, 'EXACT');
    assert.equal(res.diff, 0);
    assert.equal(res.scoreDelta, 3);
    assert.equal(res.streakDelta, 1);
    assert.equal(res.wonCard, true);
    assert.equal(res.cardSolved, true);
    assert.equal(res.hint, null);
  });

  test('Margen Cercano (diff === 1 o diff === 2): otorga +1 punto, +1 racha y gana carta', () => {
    const resPlusOne = evaluateGuess(1970, 1969, 1);
    assert.equal(resPlusOne.outcome, 'NEAR');
    assert.equal(resPlusOne.scoreDelta, 1);
    assert.equal(resPlusOne.streakDelta, 1);
    assert.equal(resPlusOne.wonCard, true);
    assert.equal(resPlusOne.cardSolved, true);

    const resMinusTwo = evaluateGuess(1967, 1969, 1);
    assert.equal(resMinusTwo.outcome, 'NEAR');
    assert.equal(resMinusTwo.scoreDelta, 1);
    assert.equal(resMinusTwo.streakDelta, 1);
    assert.equal(resMinusTwo.wonCard, true);
  });

  test('Fallo con intentos restantes (intento 1 de 3): sin puntos, rompe racha y entrega pista', () => {
    const res = evaluateGuess(1990, 1969, 1, 3);
    assert.equal(res.outcome, 'MISS_RETRY');
    assert.equal(res.scoreDelta, 0);
    assert.equal(res.resetStreak, true);
    assert.equal(res.wonCard, false);
    assert.equal(res.cardSolved, false);
    assert.equal(res.attemptsRemaining, 2);
    assert.ok(res.hint !== null);
    assert.equal(res.hint.direction, 'OLDER'); // 1990 > 1969 => Más antiguo
    assert.equal(res.hint.temperature, 'COLD'); // diff = 21 > 15
  });

  test('Fallo al agotar los 3 intentos: bloquea tiro y no otorga puntos ni carta', () => {
    const res = evaluateGuess(1995, 1969, 3, 3);
    assert.equal(res.outcome, 'EXHAUSTED');
    assert.equal(res.scoreDelta, 0);
    assert.equal(res.resetStreak, true);
    assert.equal(res.wonCard, false);
    assert.equal(res.cardSolved, true);
    assert.equal(res.attemptsRemaining, 0);
  });

  test('Pistas térmicas y direccionales cualitativas (Anti-Spoiler)', () => {
    // Caliente (diff <= 5)
    const hintHot = calculateHint(1973, 1969);
    assert.equal(hintHot.temperature, 'HOT');
    assert.equal(hintHot.direction, 'OLDER');

    // Tibio (diff <= 15)
    const hintWarm = calculateHint(1960, 1969);
    assert.equal(hintWarm.temperature, 'WARM');
    assert.equal(hintWarm.direction, 'MORE_RECENT');

    // Frío (diff > 15)
    const hintCold = calculateHint(2010, 1969);
    assert.equal(hintCold.temperature, 'COLD');
    assert.equal(hintCold.direction, 'OLDER');
  });

  test('Ordenamiento cronológico inmutable del estante', () => {
    const unsorted = [
      { id: 'vol0-0x02', year: 2008 },
      { id: 'vol0-0x01', year: 1971 },
      { id: 'vol0-0x03', year: 1983 }
    ];
    const sorted = sortShelfChronological(unsorted);
    assert.deepEqual(sorted.map(c => c.year), [1971, 1983, 2008]);
    // Comprobar que no mutó el array original
    assert.equal(unsorted[0].year, 2008);
  });

  test('Condición de victoria a las 10 cartas', () => {
    const smallShelf = Array.from({ length: 9 }, (_, i) => ({ id: `card-${i}`, year: 1990 + i }));
    assert.equal(checkVictory(smallShelf, 10), false);

    const winningShelf = Array.from({ length: 10 }, (_, i) => ({ id: `card-${i}`, year: 1990 + i }));
    assert.equal(checkVictory(winningShelf, 10), true);
  });

  test('Formato canónico de ID y Collector Number', () => {
    assert.equal(formatCardIdNumber('vol0-0x3F'), '0x3F');
    assert.equal(formatCardIdNumber('vol5-0x12'), '5x12');
    assert.equal(formatCollectorNumber({ globalIndex: 7 }), '007');
    assert.equal(formatCollectorNumber({ index: 41 }), '042');
  });

});
