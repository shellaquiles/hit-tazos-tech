// HITSTER Tech Edition - Application Core Engine with Curated Lucide Icons

class HitsterEngine {
  constructor() {
    this.cards = [];
    this.activeDeck = [];
    this.filteredCatalog = [];
    this.playerShelf = [];
    this.currentIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.activeGroup = 'ALL';
    this.soundEnabled = true;
    this.audioCtx = null;
    
    this.initAudio();
    this.initDOM();
    this.initFX();
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

    if (type === 'flip') {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.15);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'hit') {
      // Lush multi-oscillator chord (Maj7 arpeggio)
      const freqs = [523.25, 659.25, 783.99, 987.77];
      freqs.forEach((f, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.06);
        gain.gain.setValueAtTime(0.14, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5 + idx * 0.05);
        osc.start(now + idx * 0.06);
        osc.stop(now + 0.5 + idx * 0.05);
      });
    } else if (type === 'miss') {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(170, now);
      osc.frequency.linearRampToValueAtTime(95, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
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
    this.ambientAura = document.getElementById('ambient-card-aura');
    this.hudGroupLabel = document.getElementById('hud-group-label');
    this.hudCardCounter = document.getElementById('hud-card-counter');
    this.hudScore = document.getElementById('hud-score');
    this.hudStreak = document.getElementById('hud-streak');
    this.hudStreakBox = document.getElementById('hud-streak-box');
    this.inputYear = document.getElementById('input-year');
    this.btnSubmitGuess = document.getElementById('btn-submit-guess');
    this.guessResultPill = document.getElementById('guess-result-pill');
    this.btnFlip = document.getElementById('btn-flip');
    this.btnNext = document.getElementById('btn-next');
    this.btnPrev = document.getElementById('btn-prev');
    this.btnShuffle = document.getElementById('btn-shuffle');
    this.shelfCardsContainer = document.getElementById('shelf-cards-container');
    this.shelfCounter = document.getElementById('shelf-counter');
    this.shelfProgressFill = document.getElementById('shelf-progress-fill');
    this.counterTotal = document.getElementById('counter-total');
    
    // Decade quick picker
    this.decadeChips = document.querySelectorAll('.decade-chip');

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

  initFX() {
    this.fxCanvas = document.getElementById('fx-canvas');
    if (!this.fxCanvas) return;
    this.fxCtx = this.fxCanvas.getContext('2d');
    this.particles = [];
    
    const resizeCanvas = () => {
      this.fxCanvas.width = window.innerWidth;
      this.fxCanvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const loop = () => {
      if (this.particles.length > 0) {
        this.fxCtx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);
        for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.18; // gravity
          p.rot += p.vRot;
          p.alpha -= 0.015;
          
          if (p.alpha <= 0) {
            this.particles.splice(i, 1);
            continue;
          }

          this.fxCtx.save();
          this.fxCtx.translate(p.x, p.y);
          this.fxCtx.rotate(p.rot);
          this.fxCtx.globalAlpha = p.alpha;
          this.fxCtx.fillStyle = p.color;
          this.fxCtx.shadowColor = p.color;
          this.fxCtx.shadowBlur = 8;
          this.fxCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          this.fxCtx.restore();
        }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  triggerCyberConfetti(color = '#38bdf8') {
    if (!this.fxCanvas) return;
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight / 2 - 40;
    const palette = [color, '#facc15', '#f472b6', '#34d399', '#ffffff'];

    for (let i = 0; i < 70; i++) {
      const angle = (Math.PI * 2 * i) / 70 + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 9 + 4;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: Math.random() * 8 + 4,
        color: palette[Math.floor(Math.random() * palette.length)],
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2,
        alpha: 1
      });
    }
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

    // Decade Quick Picker
    this.decadeChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const decade = chip.getAttribute('data-decade');
        this.inputYear.value = decade;
        this.inputYear.focus();
        this.playAudioFeedback('flip');
      });
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

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    card.style.setProperty('--glare-x', `${glareX}%`);
    card.style.setProperty('--glare-y', `${glareY}%`);
    card.style.setProperty('--glare-opacity', '0.9');
  }

  reset3DTilt() {
    const card = document.getElementById('active-card-3d');
    if (!card) return;
    const isFlipped = card.classList.contains('is-flipped');
    card.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
    card.style.setProperty('--glare-opacity', '0');
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

  getEraLabel(year) {
    if (year < 1970) return 'Era Pioneros & Mainframes';
    if (year < 1980) return 'Era UNIX & Arpanet';
    if (year < 1990) return 'Era Microordenadores & C';
    if (year < 2000) return 'Era Web & Python';
    if (year < 2008) return 'Era Burbuja .COM & Open Source';
    if (year < 2015) return 'Era Cloud Native & Smartphones';
    if (year < 2022) return 'Era Deep Learning & Contenedores';
    return 'Era LLMs & IA Generativa';
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
    const eraName = this.getEraLabel(card.year);

    return `
      <!-- FRONT -->
      <div class="card-sheet sheet-front">
        <div class="card-glare-effect"></div>
        <div class="corner-bracket bracket-tl"></div>
        <div class="corner-bracket bracket-tr"></div>
        <div class="corner-bracket bracket-bl"></div>
        <div class="corner-bracket bracket-br"></div>

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
        <div class="card-glare-effect"></div>
        <div class="corner-bracket bracket-tl"></div>
        <div class="corner-bracket bracket-tr"></div>
        <div class="corner-bracket bracket-bl"></div>
        <div class="corner-bracket bracket-br"></div>

        <div class="card-topbar">
          <div class="category-chip">
            <i data-lucide="${groupIcon}"></i>
            <span>${card.grupo_nombre}</span>
          </div>
          <div class="id-badge">${card.id}</div>
        </div>

        <div class="year-revelation">
          <div class="era-badge">
            <i data-lucide="sparkles"></i>
            <span>${eraName}</span>
          </div>
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

    // Update Ambient Aura glow
    if (this.ambientAura) {
      const glowColors = {
        'A': 'rgba(56, 189, 248, 0.45)',
        'B': 'rgba(34, 211, 238, 0.45)',
        'C': 'rgba(52, 211, 153, 0.45)',
        'D': 'rgba(244, 114, 182, 0.45)',
        'E': 'rgba(251, 191, 36, 0.45)'
      };
      const glow = glowColors[card.grupo] || 'rgba(56, 189, 248, 0.45)';
      this.ambientAura.style.background = `radial-gradient(circle, ${glow} 0%, transparent 70%)`;
    }
    
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
    }

    const themeColors = {
      'A': '#38bdf8',
      'B': '#22d3ee',
      'C': '#34d399',
      'D': '#f472b6',
      'E': '#fbbf24'
    };
    const cardColor = themeColors[card.grupo] || '#38bdf8';

    const diff = Math.abs(val - card.year);
    if (diff === 0) {
      this.guessResultPill.innerHTML = `<span style="color: #4ade80; display: inline-flex; align-items: center; gap: 0.35rem;"><i data-lucide="check-circle-2"></i> ¡Exacto! ${card.year} (+3 Puntos)</span>`;
      this.score += 3;
      this.streak += 1;
      this.playAudioFeedback('hit');
      this.triggerCyberConfetti(cardColor);
      this.addToShelf(card);
    } else if (diff <= 2) {
      this.guessResultPill.innerHTML = `<span style="color: #facc15; display: inline-flex; align-items: center; gap: 0.35rem;"><i data-lucide="sparkles"></i> Muy cerca: ${card.year} (+1 Punto)</span>`;
      this.score += 1;
      this.streak += 1;
      this.playAudioFeedback('hit');
      this.addToShelf(card);
    } else {
      this.guessResultPill.innerHTML = `<span style="color: #f87171; display: inline-flex; align-items: center; gap: 0.35rem;"><i data-lucide="x-circle"></i> Ocurrió en ${card.year}</span>`;
      this.streak = 0;
      this.playAudioFeedback('miss');
    }

    this.hudScore.textContent = this.score;
    if (this.hudStreak) this.hudStreak.textContent = this.streak;
    if (this.hudStreakBox) {
      if (this.streak >= 2) this.hudStreakBox.classList.add('streak-hot');
      else this.hudStreakBox.classList.remove('streak-hot');
    }

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

    if (this.shelfProgressFill) {
      const pct = Math.min(100, (this.playerShelf.length / 10) * 100);
      this.shelfProgressFill.style.width = `${pct}%`;
    }

    this.shelfCounter.textContent = `${this.playerShelf.length} / 10 cartas para ganar`;
    if (this.playerShelf.length >= 10) {
      this.shelfCounter.innerHTML = `<strong style="color: #4ade80; display: inline-flex; align-items: center; gap: 0.35rem;"><i data-lucide="trophy"></i> ¡Línea de Tiempo Completada! Victoria</strong>`;
      this.triggerCyberConfetti('#facc15');
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
