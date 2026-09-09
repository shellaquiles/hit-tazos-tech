// Automated Unit Tests for GameState Pub/Sub & StorageAdapter
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../web/core/state.js';
import { StorageAdapter } from '../web/core/storage.js';
import { evaluateGuess } from '../web/core/rules.js';

describe('GameState — Reactive State & Observer Pattern', () => {

  test('Subscripción y emisión de eventos Pub/Sub', () => {
    const state = new GameState();
    let scoreEventReceived = null;

    state.subscribe('SCORE_CHANGED', (data) => {
      scoreEventReceived = data;
    });

    const mockCard = { id: 'vol0-0x01', year: 1995 };
    state.setActiveDeck([mockCard]);

    const evalResult = evaluateGuess(1995, 1995, 1);
    state.applyGuessEvaluation(evalResult, mockCard);

    assert.notEqual(scoreEventReceived, null);
    assert.equal(scoreEventReceived.score, 3);
    assert.equal(scoreEventReceived.streak, 1);
    assert.equal(state.isCurrentCardRevealed(), true);
  });

  test('Penalización por revelar año (-5 puntos)', () => {
    const state = new GameState();
    state.score = 6;
    const mockCard = { id: 'vol1-0x05', year: 1991 };
    state.setActiveDeck([mockCard]);

    const success = state.revealYearWithPenalty();
    assert.equal(success, true);
    assert.equal(state.score, 1);
    assert.equal(state.streak, 0);
    assert.equal(state.cardSolved, true);
    assert.equal(state.isCurrentCardRevealed(), true);
  });

  test('Rechazo de revelar año si saldo < 5 puntos', () => {
    const state = new GameState();
    state.score = 4;
    const mockCard = { id: 'vol1-0x05', year: 1991 };
    state.setActiveDeck([mockCard]);

    const success = state.revealYearWithPenalty();
    assert.equal(success, false);
    assert.equal(state.score, 4); // Inalterado
    assert.equal(state.cardSolved, false);
  });

  test('Validadores de esquema en StorageAdapter', () => {
    // Shelf válido
    assert.equal(StorageAdapter.validateShelf([{ id: 'vol0-0x01', year: 1995 }]), true);
    // Shelf corrupto
    assert.equal(StorageAdapter.validateShelf('not-an-array'), false);
    assert.equal(StorageAdapter.validateShelf([{ missingYear: true }]), false);

    // Score
    assert.equal(StorageAdapter.validateScore(10), true);
    assert.equal(StorageAdapter.validateScore(-1), false);
    assert.equal(StorageAdapter.validateScore('10'), false);

    // Revealed
    assert.equal(StorageAdapter.validateRevealed(['vol0-0x01', 'vol0-0x02']), true);
    assert.equal(StorageAdapter.validateRevealed([123]), false);
  });

  test('Hidratación y serialización de estado', () => {
    const state = new GameState();
    state.hydrate({
      score: 12,
      streak: 4,
      shelf: [{ id: 'vol0-0x02', year: 2000 }, { id: 'vol0-0x01', year: 1990 }],
      revealed: ['vol0-0x01', 'vol0-0x02'],
      format: 'card'
    });

    assert.equal(state.score, 12);
    assert.equal(state.streak, 4);
    assert.equal(state.cardFormat, 'card');
    assert.equal(state.playerShelf[0].year, 1990); // Ordenado cronológicamente
    assert.equal(state.revealedCards.has('vol0-0x01'), true);

    const serialized = state.serialize();
    assert.equal(serialized.score, 12);
    assert.deepEqual(serialized.revealed, ['vol0-0x01', 'vol0-0x02']);
  });

});
