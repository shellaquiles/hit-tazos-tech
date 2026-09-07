// HITSTER Tech Edition - Interactive Card Application

class HitsterApp {
  constructor() {
    this.cards = [];
    this.filteredCards = [];
    this.currentIndex = 0;
    this.score = 0;
    this.soundEnabled = true;
    this.audioCtx = null;
    
    this.initElements();
    this.initAudio();
    this.bindEvents();
    this.loadCards();
  }

  initElements() {
    this.viewPlay = document.getElementById('view-play');
    this.viewGallery = document.getElementById('view-gallery');
    this.btnTabPlay = document.getElementById('btn-tab-play');
    this.btnTabGallery = document.getElementById('btn-tab-gallery');
    this.btnSound = document.getElementById('btn-sound-toggle');
    this.btnPrint = document.getElementById('btn-print');
    
    // Arena elements
    this.arenaCardContainer = document.getElementById('arena-card-container');
    this.btnFlip = document.getElementById('btn-flip-card');
    this.btnNext = document.getElementById('btn-next-card');
    this.btnPrev = document.getElementById('btn-prev-card');
    this.btnShuffle = document.getElementById('btn-shuffle-deck');
    this.gameCounter = document.getElementById('game-card-counter');
    this.gameScore = document.getElementById('game-score');
    this.inputGuessYear = document.getElementById('input-guess-year');
    this.btnCheckGuess = document.getElementById('btn-check-guess');
    this.guessFeedback = document.getElementById('guess-feedback');
    this.counterTotal = document.getElementById('counter-total');
    
    // Gallery elements
    this.gallerySearch = document.getElementById('gallery-search');
    this.selectGroup = document.getElementById('select-group');
    this.selectSort = document.getElementById('select-sort');
    this.cardsGridContainer = document.getElementById('cards-grid-container');
  }

  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    } catch (e) {
      console.warn('Web Audio API not supported in this browser.');
    }
  }

  playSound(type) {
    if (!this.soundEnabled || !this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    if (type === 'flip') {
      // Whoosh sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'success') {
      // High chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'miss') {
      // Low buzz
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  }

  async loadCards() {
    try {
      const res = await fetch('cards.json');
      this.cards = await res.json();
      this.filteredCards = [...this.cards];
      this.counterTotal.textContent = this.cards.length;
      
      this.renderCurrentArenaCard();
      this.renderGallery();
    } catch (err) {
      console.error('Error loading cards.json:', err);
    }
  }

  bindEvents() {
    // Tab switching
    this.btnTabPlay.addEventListener('click', () => this.switchView('play'));
    this.btnTabGallery.addEventListener('click', () => this.switchView('gallery'));
    
    // Sound toggle
    this.btnSound.addEventListener('click', () => {
      this.soundEnabled = !this.soundEnabled;
      this.btnSound.textContent = this.soundEnabled ? '🔊' : '🔇';
    });

    // Print
    this.btnPrint.addEventListener('click', () => {
      this.switchView('gallery');
      setTimeout(() => window.print(), 300);
    });

    // Arena actions
    this.btnFlip.addEventListener('click', () => this.flipCurrentCard());
    this.arenaCardContainer.addEventListener('click', () => this.flipCurrentCard());
    this.btnNext.addEventListener('click', () => this.nextCard());
    this.btnPrev.addEventListener('click', () => this.prevCard());
    this.btnShuffle.addEventListener('click', () => this.shuffleDeck());
    
    // Guess year check
    this.btnCheckGuess.addEventListener('click', () => this.checkGuess());
    this.inputGuessYear.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') this.checkGuess();
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (document.activeElement === this.inputGuessYear || document.activeElement === this.gallerySearch) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        this.flipCurrentCard();
      } else if (e.code === 'ArrowRight') {
        this.nextCard();
      } else if (e.code === 'ArrowLeft') {
        this.prevCard();
      }
    });

    // Gallery filters
    this.gallerySearch.addEventListener('input', () => this.filterGallery());
    this.selectGroup.addEventListener('change', () => this.filterGallery());
    this.selectSort.addEventListener('change', () => this.filterGallery());
  }

  switchView(viewName) {
    if (viewName === 'play') {
      this.viewPlay.classList.add('active');
      this.viewGallery.classList.remove('active');
      this.btnTabPlay.classList.add('active');
      this.btnTabGallery.classList.remove('active');
    } else {
      this.viewGallery.classList.add('active');
      this.viewPlay.classList.remove('active');
      this.btnTabGallery.classList.add('active');
      this.btnTabPlay.classList.remove('active');
    }
  }

  formatMarkdownText(text) {
    if (!text) return '';
    let res = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
    return res;
  }

  createCardElement(card, isFlipped = false) {
    const cardEl = document.createElement('div');
    cardEl.className = `hitster-card theme-${card.grupo} ${isFlipped ? 'is-flipped' : ''}`;
    
    const formattedHito = this.formatMarkdownText(card.hito);
    const formattedCreator = this.formatMarkdownText(card.creador);
    const formattedTrivia = this.formatMarkdownText(card.dato_curioso);

    cardEl.innerHTML = `
      <!-- Frente -->
      <div class="card-face card-front">
        <div class="card-header-row">
          <div class="category-badge">
            <span>●</span> ${card.categoria} • ${card.categoria_nombre}
          </div>
          <div class="card-id-tag">${card.id}</div>
        </div>

        <div class="vinyl-emblem-wrap">
          <div class="vinyl-disc">
            <div class="vinyl-center">💿</div>
          </div>
        </div>

        <div class="clue-body">
          <p class="clue-text">${formattedHito}</p>
        </div>

        <div class="card-footer-row">
          <span class="timeline-callout">HITSTER TECH</span>
          <span class="flip-prompt">Girar ↻</span>
        </div>
      </div>

      <!-- Reverso -->
      <div class="card-face card-back">
        <div class="card-header-row">
          <div class="category-badge">
            <span>●</span> ${card.grupo_nombre}
          </div>
          <div class="card-id-tag">${card.id}</div>
        </div>

        <div class="year-hero">
          <div class="year-number">${card.year}</div>
          <div class="year-subtitle">Año del Hito</div>
        </div>

        <div class="creator-pill">
          <div class="creator-icon">👤</div>
          <div class="creator-meta">
            <div class="creator-label">Creador / Autor / Bonus</div>
            <div class="creator-name">${formattedCreator}</div>
          </div>
        </div>

        <div class="trivia-box">
          <div class="trivia-header">
            <span>💡</span> Dato Curioso
          </div>
          <div class="trivia-text">${formattedTrivia}</div>
        </div>
      </div>
    `;

    return cardEl;
  }

  renderCurrentArenaCard() {
    if (!this.cards.length) return;
    const card = this.cards[this.currentIndex];
    
    this.arenaCardContainer.innerHTML = '';
    const cardEl = this.createCardElement(card, false);
    cardEl.id = 'current-active-card';
    this.arenaCardContainer.appendChild(cardEl);
    
    this.gameCounter.textContent = `${this.currentIndex + 1} / ${this.cards.length}`;
    this.inputGuessYear.value = '';
    this.guessFeedback.textContent = '';
  }

  flipCurrentCard() {
    const cardEl = document.getElementById('current-active-card');
    if (cardEl) {
      cardEl.classList.toggle('is-flipped');
      this.playSound('flip');
    }
  }

  checkGuess() {
    const card = this.cards[this.currentIndex];
    const val = parseInt(this.inputGuessYear.value, 10);
    if (isNaN(val)) return;

    const cardEl = document.getElementById('current-active-card');
    if (!cardEl.classList.contains('is-flipped')) {
      cardEl.classList.add('is-flipped');
      this.playSound('flip');
    }

    const diff = Math.abs(val - card.year);
    if (diff === 0) {
      this.guessFeedback.innerHTML = `<span style="color: #4ade80;">¡EXACTO! (+3 Pts) 🎯</span>`;
      this.score += 3;
      this.playSound('success');
    } else if (diff <= 2) {
      this.guessFeedback.innerHTML = `<span style="color: #facc15;">¡Muy cerca! (${card.year}) (+1 Pt) ✨</span>`;
      this.score += 1;
      this.playSound('success');
    } else {
      this.guessFeedback.innerHTML = `<span style="color: #f87171;">Ocurrió en ${card.year} ❌</span>`;
      this.playSound('miss');
    }
    this.gameScore.textContent = this.score;
  }

  nextCard() {
    if (this.currentIndex < this.cards.length - 1) {
      this.currentIndex++;
      this.renderCurrentArenaCard();
      this.playSound('flip');
    }
  }

  prevCard() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.renderCurrentArenaCard();
      this.playSound('flip');
    }
  }

  shuffleDeck() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
    this.currentIndex = 0;
    this.renderCurrentArenaCard();
    this.playSound('flip');
  }

  filterGallery() {
    const query = this.gallerySearch.value.toLowerCase().trim();
    const group = this.selectGroup.value;
    const sort = this.selectSort.value;

    this.filteredCards = this.cards.filter(c => {
      const matchGroup = group === 'ALL' || c.grupo === group;
      const matchQuery = !query || 
        c.hito.toLowerCase().includes(query) ||
        c.creador.toLowerCase().includes(query) ||
        c.dato_curioso.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query);
      return matchGroup && matchQuery;
    });

    if (sort === 'YEAR_ASC') {
      this.filteredCards.sort((a, b) => a.year - b.year);
    } else if (sort === 'YEAR_DESC') {
      this.filteredCards.sort((a, b) => b.year - a.year);
    } else if (sort === 'ID_ASC') {
      this.filteredCards.sort((a, b) => a.id.localeCompare(b.id));
    }

    this.renderGallery();
  }

  renderGallery() {
    this.cardsGridContainer.innerHTML = '';
    
    // Render first 60 to keep initial DOM lightweight, then lazy load
    const toRender = this.filteredCards.slice(0, 100);
    toRender.forEach(card => {
      const itemWrapper = document.createElement('div');
      itemWrapper.className = 'grid-card-item';
      
      const cardEl = this.createCardElement(card, false);
      cardEl.addEventListener('click', () => {
        cardEl.classList.toggle('is-flipped');
        this.playSound('flip');
      });

      itemWrapper.appendChild(cardEl);
      this.cardsGridContainer.appendChild(itemWrapper);
    });
  }
}

// Boot application
window.addEventListener('DOMContentLoaded', () => {
  window.app = new HitsterApp();
});
