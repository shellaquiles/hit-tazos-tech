// Hit-Tazos Tech — Reactive Game State Manager (Observer / PubSub Pattern)
import { GAME_RULES, CARD_FORMATS } from './constants.js';
import { sortShelfChronological, checkVictory } from './rules.js';

export class GameState {
  constructor() {
    this.score = 0;
    this.streak = 0;
    this.attemptCount = 0;
    this.cardSolved = false;
    this.activeDeck = [];
    this.currentIndex = 0;
    this.revealedCards = new Set();
    this.playerShelf = [];
    this.cardFormat = CARD_FORMATS.DISC;
    this.activeGroup = 'ALL';
    this.soundEnabled = true;

    // Subscriptores de eventos Pub/Sub
    this._listeners = new Map();
  }

  // ── Pub/Sub ───────────────────────────────────────────────────────────────

  subscribe(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
    return () => this.unsubscribe(event, callback);
  }

  unsubscribe(event, callback) {
    if (this._listeners.has(event)) {
      this._listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this._listeners.has(event)) {
      this._listeners.get(event).forEach(cb => {
        try {
          cb(data, this);
        } catch (err) {
          console.error(`Error en listener del evento '${event}':`, err);
        }
      });
    }
  }

  // ── Getters ───────────────────────────────────────────────────────────────

  getCurrentCard() {
    if (!this.activeDeck.length) return null;
    return this.activeDeck[this.currentIndex] || null;
  }

  isCurrentCardRevealed() {
    const c = this.getCurrentCard();
    return c && c.id ? this.revealedCards.has(c.id) : false;
  }

  isShelfComplete() {
    return checkVictory(this.playerShelf);
  }

  // ── Mutaciones de Estado ──────────────────────────────────────────────────

  setActiveDeck(deck, resetIndex = true) {
    this.activeDeck = Array.isArray(deck) ? [...deck] : [];
    if (resetIndex) this.currentIndex = 0;
    this.prepareTurnForCurrentCard();
    this.emit('DECK_CHANGED', { totalCards: this.activeDeck.length });
  }

  prepareTurnForCurrentCard() {
    const card = this.getCurrentCard();
    const isAlreadyRevealed = card?.id ? this.revealedCards.has(card.id) : false;

    if (isAlreadyRevealed) {
      this.cardSolved = true;
      this.attemptCount = GAME_RULES.MAX_ATTEMPTS;
    } else {
      this.cardSolved = false;
      this.attemptCount = 0;
    }

    this.emit('CARD_PREPARED', { card, isAlreadyRevealed });
  }

  applyGuessEvaluation(evalResult, card) {
    this.attemptCount++;

    if (evalResult.wonCard) {
      this.score += evalResult.scoreDelta;
      this.streak += evalResult.streakDelta;
      this.cardSolved = true;
      if (card?.id) this.revealedCards.add(card.id);
      this.addToShelf(card);
      this.emit('SCORE_CHANGED', { score: this.score, streak: this.streak });
      this.emit('GUESS_WON', { evalResult, card });
    } else if (evalResult.outcome === 'EXHAUSTED') {
      this.streak = 0;
      this.cardSolved = true;
      if (card?.id) this.revealedCards.add(card.id);
      this.emit('SCORE_CHANGED', { score: this.score, streak: this.streak });
      this.emit('GUESS_EXHAUSTED', { evalResult, card });
    } else {
      // MISS_RETRY
      this.streak = 0;
      this.emit('SCORE_CHANGED', { score: this.score, streak: this.streak });
      this.emit('GUESS_MISSED', { evalResult, card });
    }

    this.emit('ATTEMPTS_UPDATED', {
      attemptCount: this.attemptCount,
      remaining: Math.max(0, GAME_RULES.MAX_ATTEMPTS - this.attemptCount),
      cardSolved: this.cardSolved
    });
  }

  revealYearWithPenalty() {
    const card = this.getCurrentCard();
    if (!card || this.cardSolved) return false;
    if (this.score < GAME_RULES.MIN_REVEAL_SCORE) return false;

    this.score -= GAME_RULES.POINTS_REVEAL_PENALTY;
    this.streak = 0;
    this.cardSolved = true;
    if (card.id) this.revealedCards.add(card.id);

    this.emit('SCORE_CHANGED', { score: this.score, streak: this.streak });
    this.emit('YEAR_REVEALED_WITH_PENALTY', { card, score: this.score });
    this.emit('ATTEMPTS_UPDATED', {
      attemptCount: this.attemptCount,
      remaining: 0,
      cardSolved: true
    });
    return true;
  }

  addToShelf(card) {
    if (!card) return;
    if (this.playerShelf.some(c => c.id === card.id || c.globalIndex === card.globalIndex)) return;
    this.playerShelf.push(card);
    this.playerShelf = sortShelfChronological(this.playerShelf);
    this.emit('SHELF_UPDATED', { shelf: this.playerShelf, isVictory: this.isShelfComplete() });
  }

  nextCard() {
    if (!this.activeDeck.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.activeDeck.length;
    this.prepareTurnForCurrentCard();
    this.emit('CARD_NAVIGATED', { direction: 'next', currentIndex: this.currentIndex });
  }

  prevCard() {
    if (!this.activeDeck.length) return;
    this.currentIndex = (this.currentIndex - 1 + this.activeDeck.length) % this.activeDeck.length;
    this.prepareTurnForCurrentCard();
    this.emit('CARD_NAVIGATED', { direction: 'prev', currentIndex: this.currentIndex });
  }

  goToIndex(targetIndex) {
    if (targetIndex >= 0 && targetIndex < this.activeDeck.length) {
      this.currentIndex = targetIndex;
      this.prepareTurnForCurrentCard();
      this.emit('CARD_NAVIGATED', { direction: 'direct', currentIndex: this.currentIndex });
    }
  }

  shuffleDeck() {
    for (let i = this.activeDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.activeDeck[i], this.activeDeck[j]] = [this.activeDeck[j], this.activeDeck[i]];
    }
    this.currentIndex = 0;
    this.prepareTurnForCurrentCard();
    this.emit('DECK_SHUFFLED', { currentIndex: 0 });
  }

  toggleFormat() {
    this.cardFormat = this.cardFormat === CARD_FORMATS.CARD ? CARD_FORMATS.DISC : CARD_FORMATS.CARD;
    this.emit('FORMAT_CHANGED', { format: this.cardFormat });
  }

  setFormat(format) {
    if (format === CARD_FORMATS.CARD || format === CARD_FORMATS.DISC) {
      this.cardFormat = format;
      this.emit('FORMAT_CHANGED', { format: this.cardFormat });
    }
  }

  resetGame() {
    this.score = 0;
    this.streak = 0;
    this.attemptCount = 0;
    this.cardSolved = false;
    this.playerShelf = [];
    this.revealedCards.clear();
    this.shuffleDeck();
    this.emit('GAME_RESET');
    this.emit('SCORE_CHANGED', { score: 0, streak: 0 });
    this.emit('SHELF_UPDATED', { shelf: [], isVictory: false });
  }

  // ── Hidratación y Serialización ───────────────────────────────────────────

  hydrate({ score, streak, shelf, revealed, format }) {
    if (typeof score === 'number' && score >= 0) this.score = score;
    if (typeof streak === 'number' && streak >= 0) this.streak = streak;
    if (Array.isArray(shelf)) {
      this.playerShelf = sortShelfChronological(shelf);
      this.playerShelf.forEach(c => {
        if (c?.id) this.revealedCards.add(c.id);
      });
    }
    if (Array.isArray(revealed)) {
      revealed.forEach(id => this.revealedCards.add(id));
    }
    if (format === CARD_FORMATS.CARD || format === CARD_FORMATS.DISC) {
      this.cardFormat = format;
    }

    this.emit('STATE_HYDRATED', this.serialize());
  }

  serialize() {
    return {
      score: this.score,
      streak: this.streak,
      shelf: this.playerShelf,
      revealed: Array.from(this.revealedCards),
      format: this.cardFormat
    };
  }
}
