// Hit-Tazos Tech - Application Core Engine with Curated Lucide Icons

class HitTazosEngine {
  constructor() {
    this.cards = [];
    this.cardColors = {};
    this.activeDeck = [];
    this.filteredCatalog = [];
    this.playerShelf = [];
    this.currentIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.activeGroup = 'ALL';
    this.soundEnabled = true;
    this.audioCtx = null;
    this.attemptCount = 0;   // intentos en la tarjeta actual
    this.maxAttempts = 3;    // máximo de intentos antes de revelar
    this.cardSolved = false; // si ya se acertó/resolvió la carta actual

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
    this.btnReveal = document.getElementById('btn-reveal');
    this.btnNext = document.getElementById('btn-next');
    this.btnPrev = document.getElementById('btn-prev');
    this.btnShuffle = document.getElementById('btn-shuffle');
    this.shelfCardsContainer = document.getElementById('shelf-cards-container');
    this.shelfCounter = document.getElementById('shelf-counter');
    this.shelfProgressFill = document.getElementById('shelf-progress-fill');
    this.counterTotal = document.getElementById('counter-total');
    this.attemptTracker = document.getElementById('attempt-tracker');
    this.attemptDots    = document.getElementById('attempt-dots');
    this.attemptLabel   = document.getElementById('attempt-label');

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

  async fetchFirst(urls) {
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (res.ok) return await res.json();
      } catch (e) {
        // Intentar siguiente ruta candidata
      }
    }
    return null;
  }

  async loadData() {
    try {
      const [cards, colorsData, catalogData, manifestData] = await Promise.all([
        this.fetchFirst(['../data/cards.json', 'data/cards.json', '/data/cards.json', 'cards.json']),
        this.fetchFirst(['../data/card_colors.json', 'data/card_colors.json', '/data/card_colors.json', 'card_colors.json']),
        this.fetchFirst(['../data/catalog.json', 'data/catalog.json', '/data/catalog.json', 'catalog.json']),
        this.fetchFirst(['../data/manifest.json', 'data/manifest.json', '/data/manifest.json', 'manifest.json'])
      ]);

      if (cards) {
        this.cards = cards;
      } else {
        throw new Error('Could not load cards.json from data/cards.json or fallbacks');
      }

      if (catalogData) {
        this.catalog = catalogData;
      } else {
        this.catalog = { domains: {}, tags: {}, volumes: {} };
      }

      if (colorsData) {
        this.cardColors = colorsData.cards || colorsData;
      }

      if (manifestData) {
        this.manifest = manifestData;
        this.updatePrintPdfLinks(manifestData);
      }

      // Asignar índice global continuo (1..N) para la correspondencia de color idéntica al mazo de 100 cartas
      this.cards.forEach((c, idx) => {
        c.globalIndex = idx + 1;
      });
      this.activeDeck = [...this.cards];
      this.filteredCatalog = [...this.cards];
      if (this.counterTotal) {
        this.counterTotal.textContent = this.cards.length;
      }

      this.renderActiveArenaCard();
      this.renderCatalog();
      this.refreshIcons();
    } catch (err) {
      console.error('Error fetching cards or colors:', err);
    }
  }

  updatePrintPdfLinks(manifest) {
    if (!manifest) return;
    const version = manifest.version || '1.0.0-rc3';
    const volumesGrid = document.getElementById('official-pdf-volumes-grid');
    if (!volumesGrid) return;

    volumesGrid.innerHTML = '';

    const volumes = manifest.volumes || [];
    volumes.forEach(vol => {
      const card = document.createElement('a');
      card.className = 'pdf-dl-card';
      const filename = vol.pdfFilename || `hit-tazos-tech-${vol.id}-${vol.slug}.pdf`;
      const url = `/assets/print/${filename}`;
      card.setAttribute('href', url);
      card.setAttribute('download', filename);

      card.innerHTML = `
        <div class="pdf-dl-header">
          <span class="pdf-tag format-carta">Carta (8.5 &times; 11 pulg)</span>
          <span class="pdf-ver">${vol.id.toUpperCase()}</span>
        </div>
        <div class="pdf-dl-title">${vol.title}</div>
        <div class="pdf-dl-specs">${vol.cardsCount} cartas &bull; ${vol.pagesCarta} páginas dúplex (6 cartas/pliego)</div>
        <div class="pdf-dl-btn">
          <i data-lucide="file-down"></i> Descargar ${vol.title}
        </div>
      `;
      volumesGrid.appendChild(card);
    });

    this.refreshIcons();
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

    // Print Modal & Duplex Generator
    this.printDialog = document.getElementById('print-dialog');
    this.btnClosePrintModal = document.getElementById('btn-close-print-modal');
    this.btnCancelPrint = document.getElementById('btn-cancel-print');
    this.btnExecutePrint = document.getElementById('btn-execute-print');
    this.printSheetsContainer = document.getElementById('print-sheets-container');
    this.printSelectRange = document.getElementById('print-select-range');
    this.printCropMarks = document.getElementById('print-crop-marks');

    this.btnPrint.addEventListener('click', () => {
      if (this.printDialog && typeof this.printDialog.showModal === 'function') {
        this.printDialog.showModal();
        this.refreshIcons();
      } else {
        window.print();
      }
    });

    if (this.btnClosePrintModal) {
      this.btnClosePrintModal.addEventListener('click', () => this.printDialog.close());
    }
    if (this.btnCancelPrint) {
      this.btnCancelPrint.addEventListener('click', () => this.printDialog.close());
    }
    if (this.btnExecutePrint) {
      this.btnExecutePrint.addEventListener('click', () => {
        this.generatePrintSheets();
        this.printDialog.close();
        setTimeout(() => {
          window.print();
        }, 350);
      });
    }

    // Ribbon Group Selection
    this.groupRibbon.querySelectorAll('.ribbon-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.groupRibbon.querySelectorAll('.ribbon-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const grp = pill.getAttribute('data-volumen');
        this.selectActiveGroup(grp);
      });
    });

    // 3D Card Click & Key Navigation
    this.cardStage.addEventListener('click', (e) => {
      if (e.target.closest('.year-center-stage')) return;
      this.flipCurrentCard();
    });
    this.btnFlip.addEventListener('click', () => this.flipCurrentCard());
    if (this.btnReveal) {
      this.btnReveal.addEventListener('click', () => this.toggleActiveCardYear());
    }
    this.btnNext.addEventListener('click', () => this.nextCard());
    this.btnPrev.addEventListener('click', () => this.prevCard());
    this.btnShuffle.addEventListener('click', () => this.shuffleCurrentDeck());

    // Keyboard Space, R & Arrow support
    window.addEventListener('keydown', (e) => {
      if (document.activeElement === this.inputYear || document.activeElement === this.galleryQuery) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        this.flipCurrentCard();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        this.toggleActiveCardYear();
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

    // No aplicar tilt durante el flip
    if (card.dataset.flipping === '1') return;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    // Con WAAPI el contenedor no rota — solo aplicar el tilt suave del mouse
    card.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    card.style.setProperty('--glare-x', `${glareX}%`);
    card.style.setProperty('--glare-y', `${glareY}%`);
    card.style.setProperty('--glare-opacity', '0.9');
  }

  reset3DTilt() {
    const card = document.getElementById('active-card-3d');
    if (!card) return;
    // Con WAAPI el contenedor no rota — solo limpiar glare
    card.style.transform = '';
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
      this.activeDeck = this.cards.filter(c => c.volumen === grp);
      const name = (this.catalog?.volumes?.[grp] || this.activeDeck[0]?.volumen || `Volumen ${grp}`).toUpperCase();
      this.hudGroupLabel.textContent = grp === 'ALL' ? 'Todos los Volúmenes' : name;
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

  getDomainIconName(domain) {
    const map = {
      'A': 'terminal',
      'B': 'code-2',
      'C': 'server',
      'D': 'cpu',
      'E': 'shield-alert'
    };
    return 'layers'; // simplify for now
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

  renderCenterArtifact(card) {
    const vol = card.volumen || (card.id ? card.id.split('-')[0] : '');
    if (vol === 'python-track' || vol === 'unix-sysadmin-networks') {
      // 1. TERMINAL SHELL - Clean, razor-sharp Unix / Python interactive console
      return `
        <div class="tech-artifact-hero">
          <div class="tech-artifact-svg-wrap" title="Terminal interactiva Python (REPL)">
            <svg class="artifact-svg" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Window base -->
              <rect x="2" y="2" width="156" height="86" rx="8" fill="#090d16" stroke="#38bdf8" stroke-width="1.8" stroke-opacity="0.8"/>
              <rect x="2" y="2" width="156" height="86" rx="8" fill="url(#term-glow)" opacity="0.15"/>
              <!-- Titlebar -->
              <path d="M2 10C2 5.58172 5.58172 2 10 2H150C154.418 2 158 5.58172 158 10V22H2V10Z" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>
              <!-- Window controls -->
              <circle cx="12" cy="12" r="3.5" fill="#ef4444"/>
              <circle cx="22" cy="12" r="3.5" fill="#eab308"/>
              <circle cx="32" cy="12" r="3.5" fill="#22c55e"/>
              <!-- Title text -->
              <text x="80" y="15" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="600" text-anchor="middle" letter-spacing="0.5">python3 -i (repl)</text>
              <!-- Terminal content area -->
              <!-- Prompt line 1 -->
              <text x="12" y="38" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="bold">&gt;&gt;&gt;</text>
              <text x="36" y="38" fill="#f8fafc" font-family="'JetBrains Mono', monospace" font-size="8.5">import</text>
              <text x="74" y="38" fill="#facc15" font-family="'JetBrains Mono', monospace" font-size="8.5">history</text>
              <!-- Prompt line 2 -->
              <text x="12" y="54" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="bold">&gt;&gt;&gt;</text>
              <text x="36" y="54" fill="#818cf8" font-family="'JetBrains Mono', monospace" font-size="8.5">reveal</text>
              <text x="70" y="54" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="8.5">()</text>
              <!-- Cursor -->
              <rect class="svg-cursor-blink" x="84" y="44" width="5.5" height="11" fill="#38bdf8" rx="1"/>
              <!-- Bottom status bar -->
              <line x1="2" y1="72" x2="158" y2="72" stroke="#1e293b" stroke-width="1"/>
              <text x="12" y="82" fill="#64748b" font-family="'JetBrains Mono', monospace" font-size="6.5">UTF-8 • PYTHON 3 • HIT-TAZOS</text>
              <defs>
                <radialGradient id="term-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#38bdf8"/>
                  <stop offset="100%" stop-color="#090d16"/>
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      `;
    } else if (vol === 'kernel-foundations' || vol === 'cypherpunks-hacker-lore') {
      // 2. FLOPPY DISK 3.5" - Iconic form factor, stepped beveled corner, metal shutter, hub & label
      return `
        <div class="tech-artifact-hero">
          <div class="tech-artifact-svg-wrap" title="Disquete de 3.5 pulgadas (1.44 MB)">
            <svg class="artifact-svg" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Disk Shadow -->
              <rect x="7" y="7" width="96" height="96" rx="5" fill="#000000" opacity="0.4"/>

              <!-- Outer Plastic Disk Body (Black/Dark Navy) with stepped top-right corner -->
              <path d="M12 6H86L98 18V98C98 100.2 96.2 102 94 102H12C9.8 102 8 100.2 8 98V10C8 7.8 9.8 6 12 6Z" fill="#141a24" stroke="#06b6d4" stroke-width="2.2" stroke-linejoin="round"/>

              <!-- Inset label / write indent area -->
              <rect x="18" y="44" width="74" height="52" rx="3" fill="#0b0f17" stroke="#1e293b" stroke-width="1.2"/>

              <!-- Classic Paper Adhesive Label -->
              <rect x="22" y="48" width="66" height="44" rx="2" fill="#ffffff"/>
              <!-- Colored header band on label -->
              <path d="M22 50C22 48.9 22.9 48 24 48H86C87.1 48 88 48.9 88 50V56H22V50Z" fill="#0284c7"/>
              <!-- Brand text on header -->
              <text x="55" y="54" fill="#ffffff" font-family="'JetBrains Mono', monospace" font-size="5.5" font-weight="bold" text-anchor="middle" letter-spacing="1">HIT-TAZOS 2HD</text>
              <!-- Handwritten / Typed style title -->
              <text x="55" y="68" fill="#0f172a" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="900" text-anchor="middle">SOURCE CODE</text>
              <!-- Ruled line on label -->
              <line x1="28" y1="74" x2="82" y2="74" stroke="#94a3b8" stroke-width="1.2"/>
              <!-- Capacity and format text -->
              <text x="55" y="84" fill="#64748b" font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="bold" text-anchor="middle">1.44 MB • DISK 01</text>

              <!-- Metal Sliding Shutter (Top) -->
              <rect x="30" y="6" width="50" height="34" rx="2" fill="url(#metal-shutter)" stroke="#64748b" stroke-width="1.4"/>

              <!-- Shutter Read/Write Oval Slot -->
              <rect x="47" y="10" width="16" height="24" rx="3" fill="#070a0f" stroke="#334155" stroke-width="1"/>
              <!-- Exposed Magnetic Media inside slot -->
              <circle cx="55" cy="22" r="5" fill="#1e293b" stroke="#0f172a" stroke-width="1"/>

              <!-- Embossed Drive Insertion Arrow on Shutter -->
              <path d="M37 18L41 12L45 18H37Z" fill="#475569"/>

              <!-- Bottom-Left Write-Protect Tab Notch with slider -->
              <rect x="12" y="90" width="8" height="8" rx="1" fill="#070a0f" stroke="#334155" stroke-width="1"/>
              <rect x="14" y="93" width="4" height="4" fill="#000000"/>

              <!-- Bottom-Right High Density Hole (HD Indicator) -->
              <rect x="88" y="90" width="8" height="8" rx="1" fill="#070a0f" stroke="#334155" stroke-width="1"/>

              <defs>
                <linearGradient id="metal-shutter" x1="30" y1="6" x2="80" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#e2e8f0"/>
                  <stop offset="35%" stop-color="#94a3b8"/>
                  <stop offset="65%" stop-color="#cbd5e1"/>
                  <stop offset="100%" stop-color="#64748b"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      `;
    } else if (vol === 'backend-distributed-systems' || vol === 'cloud-containers-sre') {
      // 3. SERVER RACK & MAGNETIC TAPE REEL - Data center mainframe unit
      return `
        <div class="tech-artifact-hero">
          <div class="tech-artifact-svg-wrap" title="Servidor de centro de datos y bobina de cinta">
            <svg class="artifact-svg" viewBox="0 0 150 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Server Chassis Box -->
              <rect x="3" y="6" width="144" height="78" rx="6" fill="#080e18" stroke="#34d399" stroke-width="1.8"/>

              <!-- Tape reel unit left side -->
              <circle cx="42" cy="45" r="28" fill="#0f172a" stroke="#10b981" stroke-width="1.5"/>
              <circle cx="42" cy="45" r="23" fill="#022c22" stroke="#047857" stroke-dasharray="3 3"/>

              <!-- Rotating reel spokes -->
              <g class="svg-spin-slow" style="transform-origin: 42px 45px;">
                <circle cx="42" cy="30" r="4.5" fill="#34d399"/>
                <circle cx="55" cy="52" r="4.5" fill="#34d399"/>
                <circle cx="29" cy="52" r="4.5" fill="#34d399"/>
                <circle cx="42" cy="45" r="9" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
                <circle cx="42" cy="45" r="3" fill="#ecfdf5"/>
              </g>

              <!-- Tape path ribbon -->
              <path d="M42 18H75V72" stroke="#34d399" stroke-width="2" stroke-opacity="0.6"/>

              <!-- Right side: Drive bays & Activity LED array -->
              <!-- Hot-swap drive bay 1 -->
              <rect x="80" y="16" width="58" height="14" rx="2" fill="#132030" stroke="#334155" stroke-width="1"/>
              <line x1="84" y1="23" x2="114" y2="23" stroke="#475569" stroke-width="1.5"/>
              <circle class="svg-led-green" cx="128" cy="23" r="2.5" fill="#34d399"/>

              <!-- Hot-swap drive bay 2 -->
              <rect x="80" y="34" width="58" height="14" rx="2" fill="#132030" stroke="#334155" stroke-width="1"/>
              <line x1="84" y1="41" x2="114" y2="41" stroke="#475569" stroke-width="1.5"/>
              <circle class="svg-led-amber" cx="128" cy="41" r="2.5" fill="#fbbf24"/>

              <!-- Hot-swap drive bay 3 -->
              <rect x="80" y="52" width="58" height="14" rx="2" fill="#132030" stroke="#334155" stroke-width="1"/>
              <line x1="84" y1="59" x2="114" y2="59" stroke="#475569" stroke-width="1.5"/>
              <circle class="svg-led-green" cx="128" cy="59" r="2.5" fill="#34d399"/>

              <!-- Server rack ears with mounting screws -->
              <circle cx="7" cy="14" r="2" fill="#64748b"/>
              <circle cx="7" cy="76" r="2" fill="#64748b"/>
              <circle cx="143" cy="14" r="2" fill="#64748b"/>
              <circle cx="143" cy="76" r="2" fill="#64748b"/>
            </svg>
          </div>
        </div>
      `;
    } else if (vol === 'embedded-silicon-hardware') {
      // 4. MODERN CPU PROCESSOR - Metallic Heat Spreader (IHS), substrate PCB and gold capacitor array
      return `
        <div class="tech-artifact-hero">
          <div class="tech-artifact-svg-wrap" title="Procesador / CPU & Acelerador de IA">
            <svg class="artifact-svg" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Shadow -->
              <rect x="7" y="7" width="96" height="96" rx="6" fill="#000000" opacity="0.45"/>

              <!-- Green / Dark Teal Substrate PCB Base -->
              <rect x="10" y="10" width="90" height="90" rx="6" fill="#064e3b" stroke="#34d399" stroke-width="1.8"/>
              <!-- PCB Alignment notch at top-left corner -->
              <polygon points="10,18 18,10 10,10" fill="#facc15"/>

              <!-- Gold Contact Pads on PCB corners -->
              <rect x="14" y="14" width="4" height="4" rx="1" fill="#facc15"/>
              <rect x="92" y="14" width="4" height="4" rx="1" fill="#facc15"/>
              <rect x="14" y="92" width="4" height="4" rx="1" fill="#facc15"/>
              <rect x="92" y="92" width="4" height="4" rx="1" fill="#facc15"/>

              <!-- Stepped Nickel-Plated Integrated Heat Spreader (IHS) -->
              <!-- Outer IHS base step -->
              <rect x="18" y="18" width="74" height="74" rx="4" fill="#334155" stroke="#64748b" stroke-width="1.2"/>
              <!-- Main raised metallic lid -->
              <rect x="22" y="22" width="66" height="66" rx="3" fill="url(#ihs-metal)" stroke="#94a3b8" stroke-width="1.5"/>

              <!-- Laser-etched laser specular line -->
              <line x1="24" y1="28" x2="86" y2="28" stroke="#ffffff" stroke-width="1" stroke-opacity="0.4"/>

              <!-- Processor Brand & Architectural Markings -->
              <text x="55" y="42" fill="#0f172a" font-family="'Space Grotesk', sans-serif" font-size="9" font-weight="900" text-anchor="middle" letter-spacing="1">NEURAL CPU</text>
              <text x="55" y="52" fill="#334155" font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="bold" text-anchor="middle">HIT-TAZOS TENSOR-9</text>

              <!-- Center Laser-Etched Hologram Chip Logo -->
              <rect x="43" y="58" width="24" height="18" rx="2" fill="#0f172a" stroke="#0284c7" stroke-width="1"/>
              <!-- 2D matrix data code / core die icon -->
              <rect x="47" y="62" width="4" height="4" fill="#38bdf8"/>
              <rect x="53" y="62" width="4" height="4" fill="#facc15"/>
              <rect x="59" y="62" width="4" height="4" fill="#34d399"/>
              <rect x="47" y="68" width="4" height="4" fill="#f472b6"/>
              <rect x="53" y="68" width="4" height="4" fill="#818cf8"/>
              <rect x="59" y="68" width="4" height="4" fill="#38bdf8"/>

              <!-- Serial / Frequency laser etching -->
              <text x="55" y="83" fill="#475569" font-family="'JetBrains Mono', monospace" font-size="5.5" font-weight="600" text-anchor="middle">5.80 GHz • 128-CORE</text>

              <defs>
                <linearGradient id="ihs-metal" x1="22" y1="22" x2="88" y2="88" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#f1f5f9"/>
                  <stop offset="30%" stop-color="#cbd5e1"/>
                  <stop offset="60%" stop-color="#94a3b8"/>
                  <stop offset="90%" stop-color="#e2e8f0"/>
                  <stop offset="100%" stop-color="#64748b"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      `;
    } else if (vol === 'unix-sysadmin-networks') {
      // 5. CYBER KEYCARD / CRYPTO TOKEN - Smart card with EMV contact chip and holographic crest
      return `
        <div class="tech-artifact-hero">
          <div class="tech-artifact-svg-wrap" title="Tarjeta de acceso criptográfico / Hardware Token">
            <svg class="artifact-svg" viewBox="0 0 150 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Smartcard body with rounded corners -->
              <rect x="3" y="5" width="144" height="80" rx="8" fill="url(#card-bg-grad)" stroke="#fbbf24" stroke-width="1.8"/>

              <!-- Holographic security ribbon -->
              <path d="M3 26H147V34H3V26Z" fill="url(#holo-ribbon)" opacity="0.8"/>

              <!-- Golden EMV Contact Chip -->
              <rect x="20" y="44" width="28" height="22" rx="3" fill="#facc15" stroke="#78350f" stroke-width="1"/>
              <!-- EMV contact grid lines -->
              <line x1="20" y1="55" x2="48" y2="55" stroke="#78350f" stroke-width="1"/>
              <line x1="34" y1="44" x2="34" y2="66" stroke="#78350f" stroke-width="1"/>
              <path d="M28 44V55M40 44V55M28 55V66M40 55V66" stroke="#78350f" stroke-width="0.8"/>

              <!-- Root security shield badge right side -->
              <path d="M124 45L112 50V62C112 70 124 75 124 75C124 75 136 70 136 62V50L124 45Z" fill="#2d1c02" stroke="#fbbf24" stroke-width="1.5"/>
              <circle cx="124" cy="58" r="4" fill="#fbbf24"/>

              <!-- Chip label text -->
              <text x="60" y="54" fill="#fef08a" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="bold">ROOT_ACCESS</text>
              <text x="60" y="64" fill="#ca8a04" font-family="'JetBrains Mono', monospace" font-size="6.5">AUTH: ED25519</text>

              <defs>
                <linearGradient id="card-bg-grad" x1="3" y1="5" x2="147" y2="85" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#1c1204"/>
                  <stop offset="50%" stop-color="#2a1b05"/>
                  <stop offset="100%" stop-color="#0e0902"/>
                </linearGradient>
                <linearGradient id="holo-ribbon" x1="3" y1="30" x2="147" y2="30" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.3"/>
                  <stop offset="25%" stop-color="#38bdf8" stop-opacity="0.8"/>
                  <stop offset="50%" stop-color="#f472b6" stop-opacity="0.8"/>
                  <stop offset="75%" stop-color="#34d399" stop-opacity="0.8"/>
                  <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.3"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      `;
    } else if (vol === 'scifi-pop-culture-cinema' || vol === 'scifi-literature-cyberpunk') {
      // 6. HOLOCUBE / QUANTUM DATA CRYSTAL - Sci-Fi futuristic artifact
      return `
        <div class="tech-artifact-hero">
          <div class="tech-artifact-svg-wrap" title="Cristal de datos cuántico / Holocubo">
            <svg class="artifact-svg" viewBox="0 0 150 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="5" width="140" height="80" rx="8" fill="#080718" stroke="#a855f7" stroke-width="1.8"/>
              <!-- Isometric Holocube wireframe -->
              <polygon points="75,18 105,32 75,46 45,32" fill="#3b0764" stroke="#c084fc" stroke-width="1.5" opacity="0.9"/>
              <polygon points="45,32 75,46 75,74 45,60" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.5" opacity="0.8"/>
              <polygon points="75,46 105,32 105,60 75,74" fill="#2e1065" stroke="#9333ea" stroke-width="1.5" opacity="0.8"/>
              <!-- Central glowing core -->
              <circle cx="75" cy="46" r="6" fill="#f3e8ff"/>
              <circle cx="75" cy="46" r="12" fill="#c084fc" opacity="0.3"/>
              <!-- Data streams & text -->
              <text x="75" y="82" fill="#e9d5ff" font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="bold" text-anchor="middle" letter-spacing="1">CYBERDECK • SPECULATIVE ARCHIVE</text>
            </svg>
          </div>
        </div>
      `;
    } else if (vol === 'cinema-vfx-hacker-culture') {
      // 7. CINEMA CLAPPER & 3D WIREFRAME MESH - VFX & Cinema artifact
      return `
        <div class="tech-artifact-hero">
          <div class="tech-artifact-svg-wrap" title="Claqueta de cine digital y malla de render 3D">
            <svg class="artifact-svg" viewBox="0 0 150 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="5" width="140" height="80" rx="8" fill="#0c0e14" stroke="#06b6d4" stroke-width="1.8"/>
              <!-- Clapper top bars -->
              <rect x="25" y="16" width="100" height="14" rx="2" fill="#1e293b" stroke="#38bdf8" stroke-width="1.2"/>
              <polygon points="35,16 45,16 35,30 25,30" fill="#38bdf8"/>
              <polygon points="55,16 65,16 55,30 45,30" fill="#38bdf8"/>
              <polygon points="75,16 85,16 75,30 65,30" fill="#38bdf8"/>
              <polygon points="95,16 105,16 95,30 85,30" fill="#38bdf8"/>
              <polygon points="115,16 125,16 115,30 105,30" fill="#38bdf8"/>
              <!-- 3D camera wireframe icon -->
              <circle cx="50" cy="55" r="14" fill="#082f49" stroke="#22d3ee" stroke-width="1.4"/>
              <circle cx="50" cy="55" r="7" fill="#0284c7" stroke="#38bdf8" stroke-width="1"/>
              <!-- Wireframe mesh grid right -->
              <line x1="80" y1="42" x2="125" y2="42" stroke="#06b6d4" stroke-width="1" stroke-dasharray="2 2"/>
              <line x1="80" y1="54" x2="125" y2="54" stroke="#06b6d4" stroke-width="1" stroke-dasharray="2 2"/>
              <line x1="80" y1="66" x2="125" y2="66" stroke="#06b6d4" stroke-width="1" stroke-dasharray="2 2"/>
              <line x1="95" y1="36" x2="95" y2="72" stroke="#06b6d4" stroke-width="1" stroke-dasharray="2 2"/>
              <line x1="110" y1="36" x2="110" y2="72" stroke="#06b6d4" stroke-width="1" stroke-dasharray="2 2"/>
              <text x="75" y="82" fill="#bae6fd" font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="bold" text-anchor="middle" letter-spacing="1">RENDERMAN • VFX • CGI PIPELINE</text>
            </svg>
          </div>
        </div>
      `;
    } else {
      // Fallback: Terminal interactiva clásica
      return `
        <div class="tech-artifact-hero">
          <div class="tech-artifact-svg-wrap" title="Terminal interactiva">
            <svg class="artifact-svg" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="156" height="86" rx="8" fill="#090d16" stroke="#38bdf8" stroke-width="1.8" stroke-opacity="0.8"/>
              <text x="80" y="48" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="bold" text-anchor="middle">&gt; HIT-TAZOS TECH</text>
            </svg>
          </div>
        </div>
      `;
    }
  }

  // Generador cromático estructurado en bloques de 10 cartas para Hit-Tazos Tech:
  // Fila 1:
  //  - 01..10: Rosa / Coral cálido
  //  - 11..20: Lavanda / Lila pastel
  //  - 21..30: Salmón / Naranja melocotón
  // Fila 2:
  //  - 31..40: Violeta / Púrpura medio
  //  - 41..50: Arena / Caramelo / Mostaza suave
  //  - 51..60: Amarillo girasol vibrante
  //  - 61..66: Azul cerúleo / Cian brillante
  // Fila 3:
  //  - 67..76: Amarillo canario puro
  //  - 77..86: Verde lima / Menta fresco
  //  - 87..96: Turquesa / Cian cielo
  //  - 97..100+: Rojo carmín / Magenta intenso y morados profundos
  getCardTheme(card) {
    let cardNum = card.globalIndex !== undefined ? card.globalIndex : (card.index !== undefined ? card.index + 1 : 1);
    if (!cardNum || isNaN(cardNum)) {
      const matchNum = (card.id || '').match(/(\d+)$/);
      cardNum = card.index !== undefined ? card.index + 1 : 1;
    }
    if (!cardNum || isNaN(cardNum)) cardNum = 1;

    // Si existe en la configuración desacoplada card_colors.json, usarla directamente
    if (this.cardColors && this.cardColors[cardNum]) {
      const c = this.cardColors[cardNum];
      return {
        hue: c.h,
        bg: c.bg_hsl,
        frontBg: c.front_bg_hsl,
        text: c.text_color,
        subText: c.text_color === '#ffffff' ? 'rgba(255, 255, 255, 0.75)' : 'rgba(17, 17, 17, 0.75)',
        accent: c.accent_hex
      };
    }

    // Bloques de 10 en 10 (0 a 9 repetidos cada 100 cartas)
    const blockIndex = Math.floor(((cardNum - 1) % 100) / 10);
    // Subpaso de 0 a 1 dentro del bloque de 10 cartas (carta 1 es la más clara, carta 10 es la más oscura/saturada)
    const subStep = ((cardNum - 1) % 10) / 9;

    // Familias cromáticas por bloque de 10 oficial de Hit-Tazos Tech:
    // Cada bloque progresa de un tono claro y suave (l1 ~ 72-74%) a un tono más saturado y profundo (l2 ~ 48-52%)
    const paletteBlocks = [
      // 01-10: Bloque Rojo / Carmín cálido (foto: cartas 167-170)
      { h1: 350, h2: 356, s1: 72, s2: 88, l1: 68, l2: 50 },
      // 11-20: Bloque Violeta / Morado medio (foto: cartas 171-175)
      { h1: 268, h2: 276, s1: 58, s2: 78, l1: 72, l2: 52 },
      // 21-30: Bloque Naranja cálido (foto: cartas 177-180)
      { h1: 22, h2: 28, s1: 78, s2: 92, l1: 68, l2: 52 },
      // 31-40: Bloque Lavanda / Malva suave (foto: cartas 181-186)
      { h1: 280, h2: 290, s1: 45, s2: 65, l1: 74, l2: 55 },
      // 41-50: Bloque Amarillo / Ámbar dorado (foto: cartas 187-192)
      { h1: 42, h2: 48, s1: 82, s2: 96, l1: 72, l2: 54 },
      // 51-60: Bloque Lila pálido / Azul pastel (foto: cartas 193-198)
      { h1: 245, h2: 258, s1: 48, s2: 70, l1: 75, l2: 55 },
      // 61-70: Bloque Lima / Verde amarillento fresco
      { h1: 68, h2: 82, s1: 72, s2: 85, l1: 70, l2: 54 },
      // 71-80: Bloque Turquesa / Cian oceánico
      { h1: 172, h2: 192, s1: 62, s2: 82, l1: 70, l2: 52 },
      // 81-90: Bloque Rosa coral / Fucsia suave
      { h1: 335, h2: 345, s1: 68, s2: 86, l1: 72, l2: 52 },
      // 91-100: Bloque Ocre / Canela tostado
      { h1: 32, h2: 38, s1: 65, s2: 82, l1: 70, l2: 52 }
    ];

    const currentBlock = paletteBlocks[blockIndex] || paletteBlocks[0];

    const hue = currentBlock.h1 + (currentBlock.h2 - currentBlock.h1) * subStep;
    const saturation = currentBlock.s1 + (currentBlock.s2 - currentBlock.s1) * subStep;
    const lightness = currentBlock.l1 + (currentBlock.l2 - currentBlock.l1) * subStep;

    const bg = `hsl(${hue.toFixed(1)}, ${saturation.toFixed(0)}%, ${lightness.toFixed(0)}%)`;
    const accent = `hsl(${hue.toFixed(1)}, ${saturation.toFixed(0)}%, ${Math.min(88, lightness + 16).toFixed(0)}%)`;
    const frontBg = `hsl(${hue.toFixed(1)}, 35%, 10%)`;
    const textColor = lightness > 62 ? '#151217' : '#ffffff';

    return {
      hue: hue,
      bg: bg,
      frontBg: frontBg,
      text: textColor,
      subText: textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.75)' : 'rgba(17, 17, 17, 0.75)',
      accent: accent
    };
  }

  buildCardHTML(card, options = {}) {
    const isRevealed = options.isRevealed === true;
    const yearStateClass = isRevealed ? 'is-revealed' : 'is-hidden';

    const hitoFormatted = this.formatMarkdown(card.hito);
    const creadorFormatted = this.formatMarkdown(card.autor);
    const triviaFormatted = this.formatMarkdown(card.trivia);

    // Timeline calculation (1950 - 2026)
    const minYear = 1950;
    const maxYear = 2026;
    const clampedYear = Math.max(minYear, Math.min(maxYear, card.year));
    const percent = ((clampedYear - minYear) / (maxYear - minYear)) * 100;

    const groupIcon = 'layers';
    const eraName = this.getEraLabel(card.year);
    const centerArtifactHTML = this.renderCenterArtifact(card);

    // Número de carta consecutivo (#001..#N)
    const volId = card.id ? card.id.split('-')[0].replace('vol', '') : '0';
    const hexPart = card.id ? card.id.split('-')[1].substring(2) : '00';
    const cardNumStr = `${volId}x${hexPart}`;

    // Tema cromático Hit-Tazos Tech
    const theme = this.getCardTheme(card);

    return `
      <!-- FRONT (Hit-Tazos / Pure Color Matte Face) -->
      <div class="card-sheet sheet-front hittazos-matte-card" style="--hittazos-bg: ${theme.bg}; --card-bg: ${theme.bg}; --hittazos-front-bg: ${theme.frontBg}; --card-front-bg: ${theme.frontBg}; --card-text: ${theme.text}; --card-subtext: ${theme.subText}; --card-accent: ${theme.accent};">
        <div class="card-topbar-minimal">
          <span class="group-badge-tiny">
            <i data-lucide="${groupIcon}"></i>
            ${(this.catalog.domains[card.domain] || card.domain).toUpperCase()}
          </span>
          <span class="category-badge-tiny">${this.catalog.tags[card.tag] || card.tag}</span>
        </div>

        <div class="clue-stage-pure">
          <p class="clue-quote">${hitoFormatted}</p>
        </div>

        <div class="card-footbar-minimal">
          <span class="corner-meta-left">${this.catalog.volumes[card.volumen] || card.volumen}</span>
          <span class="flip-pill"><i data-lucide="rotate-cw"></i> Voltear</span>
          <span class="corner-meta-right">${cardNumStr}</span>
        </div>
      </div>

      <!-- BACK (Hit-Tazos Solid Matte Reveal: Author Top, Year Center, Lore Bottom) -->
      <div class="card-sheet sheet-back hittazos-matte-card" style="--hittazos-bg: ${theme.bg}; --card-bg: ${theme.bg}; --card-text: ${theme.text}; --card-subtext: ${theme.subText}; --card-accent: ${theme.accent};">
        <div class="card-back-top">
          <div class="back-author-title">${creadorFormatted}</div>
        </div>

        <div class="year-center-stage ${yearStateClass}" title="Haz clic para revelar el año [R]">
          <div class="year-mystery-box">
            <div class="year-mystery-digits">????</div>
            <div class="year-reveal-badge">
              <i data-lucide="eye"></i>
              <span>Revelar año</span>
            </div>
          </div>
          <div class="year-digits-hero">${card.year}</div>
        </div>

        <div class="card-back-bottom">
          <div class="back-trivia-phrase">${triviaFormatted}</div>
        </div>

        <div class="card-footbar-minimal">
          <span class="corner-meta-left">${this.catalog.volumes[card.volumen] || card.volumen}</span>
          <span class="corner-meta-right">${volId}x${hexPart}</span>
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
    cardEl.className = `hittazos-card-3d theme-${this.catalog.domains[card.domain] || card.domain}`;
    cardEl.innerHTML = this.buildCardHTML(card, { isRevealed: false });

    this.cardStage.appendChild(cardEl);
    this.hudCardCounter.textContent = `${this.currentIndex + 1} / ${this.activeDeck.length}`;
    this.inputYear.value = '';
    this.guessResultPill.textContent = '';
    this.updateRevealButtonState(false);

    // Reset estado de intentos para la nueva carta
    this.attemptCount = 0;
    this.cardSolved   = false;
    this.renderAttemptTracker(false);
    this.btnSubmitGuess.disabled = false;

    // Update Ambient Aura glow with Card Pop Color
    if (this.ambientAura) {
      const theme = this.getCardTheme(card);
      this.ambientAura.style.background = `radial-gradient(circle, ${theme.bg}55 0%, transparent 70%)`;
    }

    // Interacción de clic en la zona del año para revelar/ocultar
    const yearStage = cardEl.querySelector('.year-center-stage');
    if (yearStage) {
      yearStage.addEventListener('click', (e) => {
        e.stopPropagation(); // no voltear la tarjeta, solo revelar el año
        this.toggleActiveCardYear();
      });
    }

    this.attachArtifactCycler(cardEl, card);
    this.refreshIcons();
  }

  updateRevealButtonState(isRevealed) {
    if (!this.btnReveal) return;
    if (isRevealed) {
      this.btnReveal.innerHTML = `<i data-lucide="eye-off"></i> <span>Ocultar Año</span>`;
      this.btnReveal.classList.add('active');
    } else {
      this.btnReveal.innerHTML = `<i data-lucide="eye"></i> <span>Revelar Año</span>`;
      this.btnReveal.classList.remove('active');
    }
    this.refreshIcons();
  }

  revealActiveCardYear() {
    const cardEl = document.getElementById('active-card-3d');
    if (!cardEl) return;
    const yearStage = cardEl.querySelector('.year-center-stage');
    if (yearStage && yearStage.classList.contains('is-hidden')) {
      yearStage.classList.remove('is-hidden');
      yearStage.classList.add('is-revealed');
      this.updateRevealButtonState(true);
      this.refreshIcons();
    }
  }

  toggleActiveCardYear() {
    const cardEl = document.getElementById('active-card-3d');
    if (!cardEl) return;

    // Si la carta está en el frente, voltearla primero para ver el reverso
    if (!cardEl.classList.contains('is-flipped') && !cardEl.classList.contains('is-unflipping')) {
      this.flipCard(cardEl);
      this.reset3DTilt();
    }

    const yearStage = cardEl.querySelector('.year-center-stage');
    if (!yearStage) return;

    const isHidden = yearStage.classList.contains('is-hidden');
    if (isHidden) {
      yearStage.classList.remove('is-hidden');
      yearStage.classList.add('is-revealed');
      this.updateRevealButtonState(true);
      this.playAudioFeedback('hit');
    } else {
      yearStage.classList.remove('is-revealed');
      yearStage.classList.add('is-hidden');
      this.updateRevealButtonState(false);
      this.playAudioFeedback('flip');
    }
    this.refreshIcons();
  }

  attachArtifactCycler(cardEl, card) {
    const heroEl = cardEl.querySelector('.tech-artifact-hero');
    if (!heroEl) return;
    const artifacts = ['A', 'B', 'C', 'D', 'E'];
    let currentGrp = card.grupo;

    heroEl.style.cursor = 'pointer';
    heroEl.title = 'Haz clic para alternar de artefacto (Terminal, Disquete, Servidor, Chip, Keycard)';
    heroEl.addEventListener('click', (e) => {
      e.stopPropagation(); // don't flip the card when clicking the artifact
      const curIdx = artifacts.indexOf(currentGrp);
      currentGrp = artifacts[(curIdx + 1) % artifacts.length];
      const dummy = { ...card, grupo: currentGrp };
      heroEl.outerHTML = this.renderCenterArtifact(dummy);
      this.refreshIcons();
      this.playAudioFeedback('flip');
      this.attachArtifactCycler(cardEl, { ...card, grupo: currentGrp });
    });
  }

  /** Flip de tarjeta. Usa WAAPI (element.animate) para compatibilidad
   *  total Firefox ESR + Chrome + Safari.
   *  Patrón: animate → onfinish → commitStyles() → cancel()
   *  Los inline styles resultantes siempre ganan en la cascade. */
  flipCard(cardEl) {
    if (!cardEl) return;
    const front = cardEl.querySelector('.sheet-front');
    const back  = cardEl.querySelector('.sheet-back');
    if (!front || !back) return;

    const HALF = 260; // ms — cada mitad del flip
    const EASE = 'cubic-bezier(0.4, 0, 0.6, 1)';
    const P = 'perspective(1400px)';
    cardEl.dataset.flipping = '1';
    cardEl.style.transform = ''; // limpiar tilt del hover

    const commitAndCancel = (anim, el) => {
      try { anim.commitStyles(); } catch(e) {
        // fallback si commitStyles no disponible (no debería pasar en FF ESR 140)
        const kf = anim.effect.getKeyframes();
        if (kf.length) {
          const last = kf[kf.length - 1];
          if (last.opacity !== undefined) el.style.opacity = String(last.opacity);
          if (last.transform !== undefined) el.style.transform = last.transform;
        }
      }
      anim.cancel();
    };

    if (cardEl.classList.contains('is-flipped')) {
      // ── Reverso → Frente ──────────────────────────────────────────────
      const animBack = back.animate([
        { transform: `${P} rotateY(0deg)`,   opacity: 1 },
        { transform: `${P} rotateY(-90deg)`, opacity: 0 }
      ], { duration: HALF, easing: EASE, fill: 'forwards' });

      animBack.onfinish = () => {
        commitAndCancel(animBack, back);
        back.style.pointerEvents = 'none';

        const animFront = front.animate([
          { transform: `${P} rotateY(-90deg)`, opacity: 0 },
          { transform: `${P} rotateY(0deg)`,   opacity: 1 }
        ], { duration: HALF, easing: EASE, fill: 'forwards' });

        animFront.onfinish = () => {
          commitAndCancel(animFront, front);
          // Limpiar transform residual del frente
          front.style.transform = '';
          front.style.pointerEvents = 'auto';
          cardEl.classList.remove('is-flipped');
          cardEl.dataset.flipping = '0';
        };
      };

    } else {
      // ── Frente → Reverso ──────────────────────────────────────────────
      cardEl.classList.add('is-flipped');

      const animFront = front.animate([
        { transform: `${P} rotateY(0deg)`,   opacity: 1 },
        { transform: `${P} rotateY(-90deg)`, opacity: 0 }
      ], { duration: HALF, easing: EASE, fill: 'forwards' });

      animFront.onfinish = () => {
        commitAndCancel(animFront, front);
        front.style.pointerEvents = 'none';

        const animBack = back.animate([
          { transform: `${P} rotateY(-90deg)`, opacity: 0 },
          { transform: `${P} rotateY(0deg)`,   opacity: 1 }
        ], { duration: HALF, easing: EASE, fill: 'forwards' });

        animBack.onfinish = () => {
          commitAndCancel(animBack, back);
          // Limpiar transform residual del reverso
          back.style.transform = '';
          back.style.pointerEvents = 'auto';
          cardEl.dataset.flipping = '0';
        };
      };
    }
  }

  flipCurrentCard() {
    const cardEl = document.getElementById('active-card-3d');
    if (cardEl) {
      this.flipCard(cardEl);
      this.reset3DTilt();
      this.playAudioFeedback('flip');
    }
  }

  /** Renderiza los puntos de intento y la etiqueta de contador */
  renderAttemptTracker(visible) {
    if (!this.attemptTracker) return;
    if (!visible) { this.attemptTracker.style.display = 'none'; return; }
    this.attemptTracker.style.display = 'flex';
    // Puntos: ● usado, ○ disponible
    const dots = Array.from({ length: this.maxAttempts }, (_, i) =>
      `<span class="attempt-dot ${i < this.attemptCount ? 'used' : ''}"></span>`
    ).join('');
    this.attemptDots.innerHTML = dots;
    this.attemptLabel.textContent = `Intento ${Math.min(this.attemptCount + 1, this.maxAttempts)} / ${this.maxAttempts}`;
  }

  /** Devuelve mensaje de pista según diferencia y dirección */
  buildHint(diff, val, correctYear) {
    const direction = val < correctYear ? '↑ más reciente' : '↓ más antiguo';
    const dirColor  = val < correctYear ? '#60a5fa' : '#f97316';
    let temp, tempColor;
    if (diff <= 5)  { temp = '🔥 ¡Caliente!';  tempColor = '#f97316'; }
    else if (diff <= 15) { temp = '🌡️ Tibio';   tempColor = '#facc15'; }
    else            { temp = '❄️ Frío';    tempColor = '#93c5fd'; }
    return `<span style="display:inline-flex;align-items:center;gap:0.5rem;flex-wrap:wrap">
      <span style="color:${dirColor};font-weight:700">${direction}</span>
      <span style="color:${tempColor}">${temp}</span>
      <span style="color:rgba(255,255,255,0.55);font-size:0.82em">(${diff} año${diff !== 1 ? 's' : ''} de diferencia)</span>
    </span>`;
  }

  evaluateGuess() {
    if (this.cardSolved) return; // ya resuelta, no procesar
    const card = this.activeDeck[this.currentIndex];
    const val  = parseInt(this.inputYear.value, 10);
    if (isNaN(val)) {
      this.guessResultPill.innerHTML = `<span style="color:#f87171">Ingresa un año válido (ej. 1995)</span>`;
      return;
    }

    // Voltear la carta si aún está en el frente
    const cardEl = document.getElementById('active-card-3d');
    if (cardEl && !cardEl.classList.contains('is-flipped')) {
      this.flipCard(cardEl);
      this.reset3DTilt();
    }

    this.attemptCount++;
    this.renderAttemptTracker(true);

    const diff = Math.abs(val - card.year);
    const theme = this.getCardTheme(card);

    // ─ Resultado ─────────────────────────────────────────────────────────────
    if (diff === 0) {
      // ✅ Exacto
      this.guessResultPill.innerHTML = `<span style="color:#4ade80;display:inline-flex;align-items:center;gap:0.4rem">
        <i data-lucide="check-circle-2"></i> ¡Exacto! Era ${card.year} &mdash; +3 Puntos
      </span>`;
      this.score += 3; this.streak += 1;
      this.cardSolved = true;
      this.playAudioFeedback('hit');
      this.triggerCyberConfetti(theme.bg);
      this.addToShelf(card);
      this.revealActiveCardYear();
      this.btnSubmitGuess.disabled = true;

    } else if (diff <= 2) {
      // 🟡 Muy cerca (±2 años)
      this.guessResultPill.innerHTML = `<span style="color:#facc15;display:inline-flex;align-items:center;gap:0.4rem">
        <i data-lucide="sparkles"></i> ¡Muy cerca! Era ${card.year} &mdash; +1 Punto
      </span>`;
      this.score += 1; this.streak += 1;
      this.cardSolved = true;
      this.playAudioFeedback('hit');
      this.addToShelf(card);
      this.revealActiveCardYear();
      this.btnSubmitGuess.disabled = true;

    } else if (this.attemptCount < this.maxAttempts) {
      // 🔁 Incorrecto pero quedan intentos — mostrar pista
      this.guessResultPill.innerHTML = this.buildHint(diff, val, card.year);
      this.streak = 0;
      this.playAudioFeedback('miss');
      // Actualizar el label al siguiente intento
      this.attemptLabel.textContent = `Intento ${this.attemptCount + 1} / ${this.maxAttempts}`;

    } else {
      // ❌ Agotados los intentos — revelar sin puntos
      this.guessResultPill.innerHTML = `<span style="color:#f87171;display:inline-flex;align-items:center;gap:0.4rem">
        <i data-lucide="x-circle"></i> Ocurrió en <strong style="color:#fff;margin:0 0.2rem">${card.year}</strong> &mdash; sin puntos
      </span>`;
      this.streak = 0;
      this.cardSolved = true;
      this.playAudioFeedback('miss');
      this.revealActiveCardYear();
      this.btnSubmitGuess.disabled = true;
    }

    // Actualizar dots con estado final del intento
    this.renderAttemptTracker(true);
    this.hudScore.textContent = this.score;
    if (this.hudStreak) this.hudStreak.textContent = this.streak;
    if (this.hudStreakBox) {
      if (this.streak >= 2) this.hudStreakBox.classList.add('streak-hot');
      else this.hudStreakBox.classList.remove('streak-hot');
    }
    this.refreshIcons();
  }

  addToShelf(card) {
    if (this.playerShelf.some(c => c.globalIndex === card.globalIndex)) return;
    this.playerShelf.push(card);
    this.playerShelf.sort((a, b) => a.year - b.year);

    this.shelfCardsContainer.innerHTML = '';
    this.playerShelf.forEach(c => {
      const chip = document.createElement('div');
      chip.className = `shelf-card-chip theme-${c.domain}`;
      const volId = c.id ? c.id.split('-')[0].replace('vol', '') : '0';
      const hexPart = card.id ? card.id.split('-')[1].substring(2) : '00';
      const chipNum = `${volId}x${hexPart}`;
      chip.innerHTML = `
        <div class="shelf-year">${c.year}</div>
        <div class="shelf-id">${chipNum}</div>
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
      const matchGrp = grp === 'ALL' || c.volumen === grp;
      const numStr = c.index !== undefined ? String(c.index) : '';
      const matchQ = !q ||
        c.hito.toLowerCase().includes(q) ||
        c.autor.toLowerCase().includes(q) ||
        c.trivia.toLowerCase().includes(q) ||
        numStr.includes(q) ||
        `#${numStr}`.includes(q);
      return matchGrp && matchQ;
    });

    if (sort === 'YEAR_ASC') {
      this.filteredCatalog.sort((a, b) => a.year - b.year);
    } else if (sort === 'YEAR_DESC') {
      this.filteredCatalog.sort((a, b) => b.year - a.year);
    } else if (sort === 'DECK_ORDER') {
      this.filteredCatalog.sort((a, b) => (a.index !== undefined ? a.index : 0) - (b.index !== undefined ? b.index : 0));
    }

    this.renderCatalog();
  }

  renderCatalog() {
    this.catalogGrid.innerHTML = '';
    const slice = this.filteredCatalog.slice(0, 100);

    slice.forEach(card => {
      const cell = document.createElement('div');
      cell.className = 'catalog-card-cell';

      const cardEl = document.createElement('div');
      cardEl.className = `hittazos-card-3d theme-${this.catalog.domains[card.domain] || card.domain}`;
      cardEl.innerHTML = this.buildCardHTML(card, { isRevealed: false });

      const yearStage = cardEl.querySelector('.year-center-stage');
      if (yearStage) {
        yearStage.addEventListener('click', (e) => {
          e.stopPropagation();
          const isHidden = yearStage.classList.contains('is-hidden');
          if (isHidden) {
            yearStage.classList.remove('is-hidden');
            yearStage.classList.add('is-revealed');
            this.playAudioFeedback('hit');
          } else {
            yearStage.classList.remove('is-revealed');
            yearStage.classList.add('is-hidden');
            this.playAudioFeedback('flip');
          }
          this.refreshIcons();
        });
      }

      cardEl.addEventListener('click', () => {
        this.flipCard(cardEl);
        this.playAudioFeedback('flip');
      });

      cell.appendChild(cardEl);
      this.catalogGrid.appendChild(cell);
    });

    this.refreshIcons();
  }

  /**
   * Generación Milimétrica de Pliegos Dúplex en Tamaño Carta (8.5 x 11 pulg / 215.9 x 279.4 mm)
   * 6 cartas por pliego en rejilla de 2 columnas x 3 filas (65mm x 65mm).
   * Regla de correspondencia Dúplex al voltear por el borde largo:
   *  - Cada fila [A, B] en el Frente se espeja horizontalmente en el Reverso como [B, A].
   */
  generatePrintSheets() {
    if (!this.printSheetsContainer) return;
    this.printSheetsContainer.innerHTML = '';

    const rangeOption = this.printSelectRange ? this.printSelectRange.value : 'SAMPLE_6';
    const cropOption = this.printCropMarks ? this.printCropMarks.value : 'GUIDES';
    const hasBorder = cropOption === 'GUIDES';

    let targetCards = [...this.cards];

    if (rangeOption === 'SAMPLE_6') {
      targetCards = targetCards.slice(0, 6);
    } else if (rangeOption === 'SAMPLE_12') {
      targetCards = targetCards.slice(0, 12);
    } else if (rangeOption.startsWith('VOL_')) {
      const targetVolSlug = rangeOption.replace('VOL_', '');
      targetCards = targetCards.filter(c => c.volumen === targetVolSlug);
    } else if (rangeOption === 'CURRENT_GROUP') {
      const currentActivePill = this.groupRibbon.querySelector('.ribbon-pill.active');
      const activeGrp = currentActivePill ? (currentActivePill.getAttribute('data-volumen') || currentActivePill.getAttribute('data-group')) : 'ALL';
      if (activeGrp && activeGrp !== 'ALL') {
        targetCards = targetCards.filter(c => c.volumen === activeGrp);
      }
    }
    // Si es 'ALL' toma todas las cartas de la baraja completa

    const CARDS_PER_SHEET = 6;
    const totalSheets = Math.ceil(targetCards.length / CARDS_PER_SHEET);

    for (let sheetIdx = 0; sheetIdx < totalSheets; sheetIdx++) {
      const sheetCards = targetCards.slice(sheetIdx * CARDS_PER_SHEET, (sheetIdx + 1) * CARDS_PER_SHEET);
      // Rellenar hasta 6 si el último pliego tiene menos
      while (sheetCards.length < CARDS_PER_SHEET) {
        sheetCards.push(null);
      }

      // --- PLIEGO IMPAR: FRENTES (Orden natural 0..5, 2x3) ---
      const frontSheet = document.createElement('div');
      frontSheet.className = 'print-sheet print-sheet-fronts';
      frontSheet.innerHTML = `
        <div class="sheet-meta-header">
          <span>HIT-TAZOS TECH — CARTA ${sheetIdx + 1} DE ${totalSheets} [CARA A: FRENTES]</span>
          <span>8.5x11 PULG — 6 CARTAS (65x65mm) — CORTE MILIMÉTRICO</span>
        </div>
      `;

      const frontGrid = document.createElement('div');
      frontGrid.className = 'print-grid-6';

      sheetCards.forEach((card) => {
        const box = document.createElement('div');
        box.className = `print-card-box ${hasBorder ? 'print-crop-border' : ''}`;

        if (card) {
          const theme = this.getCardTheme(card);
          const groupIcon = 'layers';
          const hitoFormatted = this.formatMarkdown(card.hito);
          const volId = card.id ? card.id.split('-')[0].replace('vol', '') : '0';
          const hexPart = card.id ? card.id.split('-')[1].substring(2) : '00';
          const cardNumStr = `${volId}x${hexPart}`;

          box.innerHTML = `
            <div class="print-card-face print-face-front" style="--hittazos-bg: ${theme.bg}; --card-bg: ${theme.bg}; --hittazos-front-bg: ${theme.frontBg}; --card-front-bg: ${theme.frontBg};">
              <div class="card-topbar-minimal">
                <span class="group-badge-tiny">
                  <i data-lucide="${groupIcon}"></i>
                  ${this.catalog.domains[card.domain] || card.domain}
                </span>
                <span class="category-badge-tiny">${this.catalog.tags[card.tag] || card.tag}</span>
              </div>
              <div class="clue-stage-pure">
                <p class="clue-quote">${hitoFormatted}</p>
              </div>
              <div class="card-footbar-minimal">
                <span class="corner-meta-left">${this.catalog.volumes[card.volumen] || card.volumen}</span>
                <span class="corner-meta-right">${cardNumStr}</span>
              </div>
            </div>
          `;
        }
        frontGrid.appendChild(box);
      });

      frontSheet.appendChild(frontGrid);
      this.printSheetsContainer.appendChild(frontSheet);

      // --- PLIEGO PAR: REVERSOS (Espejado Horizontal Fila por Fila en 2 columnas: [c1, c0]) ---
      const backSheet = document.createElement('div');
      backSheet.className = 'print-sheet print-sheet-backs';
      backSheet.innerHTML = `
        <div class="sheet-meta-header">
          <span>HIT-TAZOS TECH — CARTA ${sheetIdx + 1} DE ${totalSheets} [CARA B: REVERSOS ESPEJADOS]</span>
          <span>VOLTEAR POR EL BORDE LARGO (LONG EDGE DUPLEX)</span>
        </div>
      `;

      const backGrid = document.createElement('div');
      backGrid.className = 'print-grid-6';

      // 3 filas de 2 columnas: fila 0 -> [1, 0], fila 1 -> [3, 2], fila 2 -> [5, 4]
      const mirroredIndices = [];
      for (let r = 0; r < 3; r++) {
        const base = r * 2;
        mirroredIndices.push(base + 1, base);
      }

      mirroredIndices.forEach(idx => {
        const card = sheetCards[idx];
        const box = document.createElement('div');
        box.className = `print-card-box ${hasBorder ? 'print-crop-border' : ''}`;

        if (card) {
          const theme = this.getCardTheme(card);
          const creadorFormatted = this.formatMarkdown(card.autor);
          const triviaFormatted = this.formatMarkdown(card.trivia);
          const volId = card.id ? card.id.split('-')[0].replace('vol', '') : '0';
          const hexPart = card.id ? card.id.split('-')[1].substring(2) : '00';
          const cardNumStr = `${volId}x${hexPart}`;

          box.innerHTML = `
            <div class="print-card-face print-face-back" style="--hittazos-bg: ${theme.bg}; --card-bg: ${theme.bg};">
              <div class="card-back-top">
                <div class="back-author-title">${creadorFormatted}</div>
              </div>
              <div class="year-center-stage">
                <div class="year-digits-hero">${card.year}</div>
              </div>
              <div class="card-back-bottom">
                <div class="back-trivia-phrase">${triviaFormatted}</div>
              </div>
              <div class="card-footbar-minimal">
                <span class="corner-meta-left">${this.catalog.volumes[card.volumen] || card.volumen}</span>
                <span class="corner-meta-right">${cardNumStr}</span>
              </div>
            </div>
          `;
        }
        backGrid.appendChild(box);
      });

      backSheet.appendChild(backGrid);
      this.printSheetsContainer.appendChild(backSheet);
    }

    this.refreshIcons();
  }
}

// Start on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  window.hitTazos = new HitTazosEngine();
});
