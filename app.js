// HITSTER Tech Edition - Application Core Engine with Curated Lucide Icons

class HitsterEngine {
  constructor() {
    this.cards = [];
    this.activeDeck = [];
    this.filteredCatalog = [];
    this.playerShelf = [];
    this.currentIndex = 0;
    this.score = 0;
    this.activeGroup = 'ALL';
    this.soundEnabled = true;
    this.audioCtx = null;
    
    this.initAudio();
    this.initDOM();
    this.bindEvents();
    this.loadData();
  }

  initAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
    } catch (e) {
      console.warn('AudioContext not supported.');
    }
  }

  playAudioFeedback(type) {
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
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'hit') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'miss') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.22);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    }
  }

  initDOM() {
    // Views
    this.viewPlay = document.getElementById('view-play');
    this.viewGallery = document.getElementById('view-gallery');
    this.btnTabPlay = document.getElementById('btn-tab-play');
    this.btnTabGallery = document.getElementById('btn-tab-gallery');
    this.btnSound = document.getElementById('btn-sound-toggle');
    this.btnPrint = document.getElementById('btn-print');
    
    // Ribbon
    this.groupRibbon = document.getElementById('group-ribbon');
    
    // Arena elements
    this.cardStage = document.getElementById('card-stage');
    this.hudGroupLabel = document.getElementById('hud-group-label');
    this.hudCardCounter = document.getElementById('hud-card-counter');
    this.hudScore = document.getElementById('hud-score');
    this.inputYear = document.getElementById('input-year');
    this.btnSubmitGuess = document.getElementById('btn-submit-guess');
    this.guessResultPill = document.getElementById('guess-result-pill');
    this.btnFlip = document.getElementById('btn-flip');
    this.btnNext = document.getElementById('btn-next');
    this.btnPrev = document.getElementById('btn-prev');
    this.btnShuffle = document.getElementById('btn-shuffle');
    this.shelfCardsContainer = document.getElementById('shelf-cards-container');
    this.shelfCounter = document.getElementById('shelf-counter');
    this.counterTotal = document.getElementById('counter-total');
    
    // Nudge buttons
    this.btnNudgeMinus5 = document.getElementById('btn-nudge-minus5');
    this.btnNudgeMinus1 = document.getElementById('btn-nudge-minus1');
    this.btnNudgePlus1 = document.getElementById('btn-nudge-plus1');
    this.btnNudgePlus5 = document.getElementById('btn-nudge-plus5');
    
    // Catalog elements
    this.galleryQuery = document.getElementById('gallery-query');
    this.selectFilterGroup = document.getElementById('select-filter-group');
    this.selectSortOrder = document.getElementById('select-sort-order');
    this.catalogGrid = document.getElementById('catalog-grid');
  }

  refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  async loadData() {
    try {
      const res = await fetch('cards.json');
      this.cards = await res.json();
      this.activeDeck = [...this.cards];
      this.filteredCatalog = [...this.cards];
      this.counterTotal.textContent = this.cards.length;
      
      this.renderActiveArenaCard();
      this.renderCatalog();
      this.refreshIcons();
    } catch (err) {
      console.error('Error fetching cards.json:', err);
    }
  }

  bindEvents() {
    // Tab toggle
    this.btnTabPlay.addEventListener('click', () => this.switchView('play'));
    this.btnTabGallery.addEventListener('click', () => this.switchView('gallery'));
    
    // Sound
    this.btnSound.addEventListener('click', () => {
      this.soundEnabled = !this.soundEnabled;
      const icon = document.getElementById('icon-sound-state');
      if (icon) {
        icon.setAttribute('data-lucide', this.soundEnabled ? 'volume-2' : 'volume-x');
        this.refreshIcons();
      }
    });

    // Print
    this.btnPrint.addEventListener('click', () => {
      this.switchView('gallery');
      setTimeout(() => window.print(), 350);
    });

    // Ribbon Group Selection
    this.groupRibbon.querySelectorAll('.ribbon-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.groupRibbon.querySelectorAll('.ribbon-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const grp = pill.getAttribute('data-group');
        this.selectActiveGroup(grp);
      });
    });

    // 3D Card Click & Key Navigation
    this.cardStage.addEventListener('click', () => this.flipCurrentCard());
    this.btnFlip.addEventListener('click', () => this.flipCurrentCard());
    this.btnNext.addEventListener('click', () => this.nextCard());
    this.btnPrev.addEventListener('click', () => this.prevCard());
    this.btnShuffle.addEventListener('click', () => this.shuffleCurrentDeck());
    
    // Keyboard Space & Arrow support
    window.addEventListener('keydown', (e) => {
      if (document.activeElement === this.inputYear || document.activeElement === this.galleryQuery) {
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

    // 3D Tilt Parallax on Mousemove
    this.cardStage.addEventListener('mousemove', (e) => this.handle3DTilt(e));
    this.cardStage.addEventListener('mouseleave', () => this.reset3DTilt());

    // Guess submission
    this.btnSubmitGuess.addEventListener('click', () => this.evaluateGuess());
    this.inputYear.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') this.evaluateGuess();
    });

    // Nudge buttons
    this.btnNudgeMinus5.addEventListener('click', () => this.nudgeYear(-5));
    this.btnNudgeMinus1.addEventListener('click', () => this.nudgeYear(-1));
    this.btnNudgePlus1.addEventListener('click', () => this.nudgeYear(1));
    this.btnNudgePlus5.addEventListener('click', () => this.nudgeYear(5));

    // Gallery search and filter
    this.galleryQuery.addEventListener('input', () => this.filterCatalog());
    this.selectFilterGroup.addEventListener('change', () => this.filterCatalog());
    this.selectSortOrder.addEventListener('change', () => this.filterCatalog());
  }

  handle3DTilt(e) {
    const card = document.getElementById('active-card-3d');
    if (!card) return;
    
    const rect = this.cardStage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    
    const isFlipped = card.classList.contains('is-flipped');
    const baseFlip = isFlipped ? 180 : 0;
    
    card.style.transform = `rotateY(${baseFlip + rotateY}deg) rotateX(${rotateX}deg)`;
  }

  reset3DTilt() {
    const card = document.getElementById('active-card-3d');
    if (!card) return;
    const isFlipped = card.classList.contains('is-flipped');
    card.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
  }

  nudgeYear(delta) {
    const cur = parseInt(this.inputYear.value, 10) || 2000;
    this.inputYear.value = cur + delta;
  }

  switchView(mode) {
    if (mode === 'play') {
      this.viewPlay.classList.add('active');
      this.viewGallery.classList.remove('active');
      this.btnTabPlay.classList.add('active');
      this.btnTabGallery.classList.remove('active');
    } else {
      this.viewGallery.classList.add('active');
      this.viewPlay.classList.remove('active');
      this.btnTabGallery.classList.add('active');
      this.btnTabPlay.classList.remove('active');
      this.refreshIcons();
    }
  }

  selectActiveGroup(grp) {
    this.activeGroup = grp;
    if (grp === 'ALL') {
      this.activeDeck = [...this.cards];
      this.hudGroupLabel.textContent = 'Todos los Grupos';
    } else {
      this.activeDeck = this.cards.filter(c => c.grupo === grp);
      const name = this.activeDeck[0]?.grupo_nombre || `Grupo ${grp}`;
      this.hudGroupLabel.textContent = name;
    }
    this.currentIndex = 0;
    this.renderActiveArenaCard();
  }

  formatMarkdown(str) {
    if (!str) return '';
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  getGroupIconName(grp) {
    const map = {
      'A': 'terminal',
      'B': 'code-2',
      'C': 'server',
      'D': 'cpu',
      'E': 'shield-alert'
    };
    return map[grp] || 'layers';
  }

  buildCardHTML(card) {
    const hitoFormatted = this.formatMarkdown(card.hito);
    const creadorFormatted = this.formatMarkdown(card.creador);
    const triviaFormatted = this.formatMarkdown(card.dato_curioso);

    // Timeline calculation (1950 - 2026)
    const minYear = 1950;
    const maxYear = 2026;
    const clampedYear = Math.max(minYear, Math.min(maxYear, card.year));
    const percent = ((clampedYear - minYear) / (maxYear - minYear)) * 100;

    const groupIcon = this.getGroupIconName(card.grupo);

    return `
      <!-- FRONT -->
      <div class="card-sheet sheet-front">
        <div class="card-topbar">
          <div class="category-chip">
            <i data-lucide="${groupIcon}"></i>
            <span>${card.categoria} • ${card.categoria_nombre}</span>
          </div>
          <div class="id-badge">${card.id}</div>
        </div>

        <div class="vinyl-hero">
          <div class="vinyl-platter">
            <div class="vinyl-spindle-label">
              <i data-lucide="${groupIcon}"></i>
            </div>
          </div>
        </div>

        <div class="clue-stage">
          <p class="clue-statement">${hitoFormatted}</p>
        </div>

        <div class="card-footbar">
          <span class="brand-stamp">HITSTER TECH</span>
          <span class="flip-cue"><i data-lucide="rotate-cw"></i> Voltear</span>
        </div>
      </div>

      <!-- BACK -->
      <div class="card-sheet sheet-back">
        <div class="card-topbar">
          <div class="category-chip">
            <i data-lucide="${groupIcon}"></i>
            <span>${card.grupo_nombre}</span>
          </div>
          <div class="id-badge">${card.id}</div>
        </div>

        <div class="year-revelation">
          <div class="year-digits">${card.year}</div>
        </div>

        <!-- Mini Timeline Spatial Widget -->
        <div class="mini-timeline-widget">
          <div class="timeline-axis">
            <div class="timeline-pin" style="left: ${percent}%;"></div>
          </div>
          <div class="timeline-labels">
            <span>1950</span>
            <span>1975</span>
            <span>2000</span>
            <span>2026</span>
          </div>
        </div>

        <!-- Creator Dossier -->
        <div class="creator-dossier">
          <div class="dossier-icon"><i data-lucide="user"></i></div>
          <div class="dossier-meta">
            <div class="dossier-label">Creador / Autor / Bonus</div>
            <div class="dossier-name">${creadorFormatted}</div>
          </div>
        </div>

        <!-- Lore Box -->
        <div class="lore-container">
          <div class="lore-heading">
            <i data-lucide="lightbulb"></i>
            <span>Dato Curioso / Lore</span>
          </div>
          <div class="lore-body">${triviaFormatted}</div>
        </div>
      </div>
    `;
  }

  renderActiveArenaCard() {
    if (!this.activeDeck.length) return;
    const card = this.activeDeck[this.currentIndex];
    
    this.cardStage.innerHTML = '';
    const cardEl = document.createElement('div');
    cardEl.id = 'active-card-3d';
    cardEl.className = `hitster-card-3d theme-${card.grupo}`;
    cardEl.innerHTML = this.buildCardHTML(card);
    
    this.cardStage.appendChild(cardEl);
    this.hudCardCounter.textContent = `${this.currentIndex + 1} / ${this.activeDeck.length}`;
    this.inputYear.value = '';
    this.guessResultPill.textContent = '';
    
    this.refreshIcons();
  }

  flipCurrentCard() {
    const cardEl = document.getElementById('active-card-3d');
    if (cardEl) {
      cardEl.classList.toggle('is-flipped');
      this.reset3DTilt();
      this.playAudioFeedback('flip');
    }
  }

  evaluateGuess() {
    const card = this.activeDeck[this.currentIndex];
    const val = parseInt(this.inputYear.value, 10);
    if (isNaN(val)) return;

    const cardEl = document.getElementById('active-card-3d');
    if (!cardEl.classList.contains('is-flipped')) {
      cardEl.classList.add('is-flipped');
      this.reset3DTilt();
      this.playAudioFeedback('flip');
    }

    const diff = Math.abs(val - card.year);
    if (diff === 0) {
      this.guessResultPill.innerHTML = `<span style="color: #4ade80; display: inline-flex; align-items: center; gap: 0.35rem;"><i data-lucide="check-circle-2"></i> ¡Exacto! ${card.year} (+3 Puntos)</span>`;
      this.score += 3;
      this.playAudioFeedback('hit');
      this.addToShelf(card);
    } else if (diff <= 2) {
      this.guessResultPill.innerHTML = `<span style="color: #facc15; display: inline-flex; align-items: center; gap: 0.35rem;"><i data-lucide="sparkles"></i> Muy cerca: ${card.year} (+1 Punto)</span>`;
      this.score += 1;
      this.playAudioFeedback('hit');
      this.addToShelf(card);
    } else {
      this.guessResultPill.innerHTML = `<span style="color: #f87171; display: inline-flex; align-items: center; gap: 0.35rem;"><i data-lucide="x-circle"></i> Ocurrió en ${card.year}</span>`;
      this.playAudioFeedback('miss');
    }
    this.hudScore.textContent = this.score;
    this.refreshIcons();
  }

  addToShelf(card) {
    if (this.playerShelf.some(c => c.id === card.id)) return;
    this.playerShelf.push(card);
    this.playerShelf.sort((a, b) => a.year - b.year);
    
    this.shelfCardsContainer.innerHTML = '';
    this.playerShelf.forEach(c => {
      const chip = document.createElement('div');
      chip.className = `shelf-card-chip theme-${c.grupo}`;
      chip.innerHTML = `
        <div class="shelf-year">${c.year}</div>
        <div class="shelf-id">${c.id}</div>
      `;
      this.shelfCardsContainer.appendChild(chip);
    });

    this.shelfCounter.textContent = `${this.playerShelf.length} / 10 cartas para ganar`;
    if (this.playerShelf.length >= 10) {
      this.shelfCounter.innerHTML = `<strong style="color: #4ade80; display: inline-flex; align-items: center; gap: 0.35rem;"><i data-lucide="trophy"></i> ¡Línea de Tiempo Completada! Victoria</strong>`;
      this.refreshIcons();
    }
  }

  nextCard() {
    if (this.currentIndex < this.activeDeck.length - 1) {
      this.currentIndex++;
      this.renderActiveArenaCard();
      this.playAudioFeedback('flip');
    }
  }

  prevCard() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.renderActiveArenaCard();
      this.playAudioFeedback('flip');
    }
  }

  shuffleCurrentDeck() {
    for (let i = this.activeDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.activeDeck[i], this.activeDeck[j]] = [this.activeDeck[j], this.activeDeck[i]];
    }
    this.currentIndex = 0;
    this.renderActiveArenaCard();
    this.playAudioFeedback('flip');
  }

  filterCatalog() {
    const q = this.galleryQuery.value.toLowerCase().trim();
    const grp = this.selectFilterGroup.value;
    const sort = this.selectSortOrder.value;

    this.filteredCatalog = this.cards.filter(c => {
      const matchGrp = grp === 'ALL' || c.grupo === grp;
      const matchQ = !q || 
        c.hito.toLowerCase().includes(q) ||
        c.creador.toLowerCase().includes(q) ||
        c.dato_curioso.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);
      return matchGrp && matchQ;
    });

    if (sort === 'YEAR_ASC') {
      this.filteredCatalog.sort((a, b) => a.year - b.year);
    } else if (sort === 'YEAR_DESC') {
      this.filteredCatalog.sort((a, b) => b.year - a.year);
    } else if (sort === 'ID_ASC') {
      this.filteredCatalog.sort((a, b) => a.id.localeCompare(b.id));
    }

    this.renderCatalog();
  }

  renderCatalog() {
    this.catalogGrid.innerHTML = '';
    const slice = this.filteredCatalog.slice(0, 60);
    
    slice.forEach(card => {
      const cell = document.createElement('div');
      cell.className = 'catalog-card-cell';
      
      const cardEl = document.createElement('div');
      cardEl.className = `hitster-card-3d theme-${card.grupo}`;
      cardEl.innerHTML = this.buildCardHTML(card);
      
      cardEl.addEventListener('click', () => {
        cardEl.classList.toggle('is-flipped');
        this.playAudioFeedback('flip');
      });

      cell.appendChild(cardEl);
      this.catalogGrid.appendChild(cell);
    });

    this.refreshIcons();
  }
}

// Start on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  window.hitster = new HitsterEngine();
});
