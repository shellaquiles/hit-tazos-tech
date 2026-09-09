// Hit-Tazos Tech - Application Core Engine with Modular Interactive Libraries

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
    this.attemptCount = 0;   // intentos en la tarjeta actual
    this.maxAttempts = 3;    // máximo de intentos antes de revelar
    this.cardSolved = false; // si ya se acertó/resolvió la carta actual
    this.revealedCards = new Set(); // IDs de tazos ya revelados/resueltos (persistidos en caché)
    this.fuse = null;        // instancia Fuse.js
    this.sfx = null;         // clips foley orgánicos Howler.js

    this.initDOM();
    this.initAudioEngine();  // Precarga de los clips reales
    this.initTilt();
    this.bindEvents();
    this.bindKeyboardShortcuts();
    this.initTouchGestures();
    this.loadData();
    this.loadSavedState();
  }

  // 1. Audio Foley Orgánico Real (Howler.js)
  initAudioEngine() {
    if (typeof Howl === 'function') {
      try {
        this.sfx = {
          flip: new Howl({ src: ['assets/sfx/tazo_flip.mp3'], volume: 0.4 }),
          slam: new Howl({ src: ['assets/sfx/tazo_slam.mp3'], volume: 0.7 }),
          hit: new Howl({ src: ['assets/sfx/tazo_win.mp3'], volume: 0.5 }),
          miss: new Howl({ src: ['assets/sfx/tazo_miss.mp3'], volume: 0.4 }),
          tick: new Howl({ src: ['assets/sfx/tazo_tick.mp3'], volume: 0.25 })
        };
      } catch (_) { }
    }
  }

  playAudioFeedback(type) {
    if (!this.soundEnabled || !this.sfx) return;
    try {
      if (this.sfx[type]) {
        // Detiene el sonido previo si es un 'tick' rápido para evitar solapamiento saturado
        if (type === 'tick') this.sfx[type].stop();
        this.sfx[type].play();
      }
    } catch (_) { }
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
    this.chronoDial = document.getElementById('chrono-dial');
    this.displaySelectedYear = document.getElementById('display-selected-year');
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
    this.attemptDots = document.getElementById('attempt-dots');


    // Catalog elements
    this.galleryQuery = document.getElementById('gallery-query');
    this.selectFilterGroup = document.getElementById('select-filter-group');
    this.selectSortOrder = document.getElementById('select-sort-order');
    this.catalogGrid = document.getElementById('catalog-grid');

    // Help & Shortcuts Dialog
    this.btnHelpToggle = document.getElementById('btn-help-toggle');
    this.helpDialog = document.getElementById('help-dialog');
    this.btnCloseHelpModal = document.getElementById('btn-close-help-modal');
    this.btnUnderstoodHelp = document.getElementById('btn-understood-help');

    // Touch gesture debouncing para evitar clics duplicados
    this.justHandledTouch = false;
  }

  // 2. Inclinación 3D y Glare con VanillaTilt
  initTilt() {
    if (typeof VanillaTilt !== 'undefined' && this.cardStage) {
      try {
        VanillaTilt.init(this.cardStage, {
          max: 12,
          speed: 400,
          glare: true,
          "max-glare": 0.25,
          perspective: 1400
        });
      } catch (_) { }
    }
  }

  // 3. Confetti procedural con canvas-confetti (Elimina el elemento <canvas> y loop manual)
  triggerCyberConfetti(accentColor = '#38bdf8') {
    if (typeof confetti === 'function') {
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: [accentColor, '#facc15', '#f472b6', '#34d399', '#ffffff']
        });
      } catch (_) { }
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
      let cards = window.HIT_DECK_DATA?.cards || null;
      let colorsData = window.HIT_DECK_DATA?.cardColors || null;
      let catalogData = window.HIT_DECK_DATA?.catalog || null;
      let manifestData = window.HIT_DECK_DATA?.manifest || null;

      if (!cards) {
        const [fCards, fColors, fCatalog, fManifest] = await Promise.all([
          this.fetchFirst(['../data/cards.json', 'data/cards.json', '/data/cards.json', 'cards.json']),
          this.fetchFirst(['../data/card_colors.json', 'data/card_colors.json', '/data/card_colors.json', 'card_colors.json']),
          this.fetchFirst(['../data/catalog.json', 'data/catalog.json', '/data/catalog.json', 'catalog.json']),
          this.fetchFirst(['../data/manifest.json', 'data/manifest.json', '/data/manifest.json', 'manifest.json'])
        ]);
        cards = fCards;
        colorsData = fColors;
        catalogData = fCatalog;
        manifestData = fManifest;
      }

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

      this.setupSearchIndex();
      this.renderActiveArenaCard();
      this.renderCatalog();
      this.refreshIcons();
    } catch (err) {
      console.error('Error fetching cards or colors:', err);
    }
  }

  updatePrintPdfLinks(manifest) {
    if (!manifest) return;
    const version = manifest.version || '1.0.0';
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

    // Ribbon Group Selection (Deck Selector con feedback táctil y audio)
    this.groupRibbon.querySelectorAll('.ribbon-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.groupRibbon.querySelectorAll('.ribbon-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        const grp = pill.getAttribute('data-volumen');
        this.playAudioFeedback('flip');
        this.selectActiveGroup(grp);
      });
    });

    // Help Modal Triggers
    if (this.btnHelpToggle) {
      this.btnHelpToggle.addEventListener('click', () => {
        if (this.helpDialog && typeof this.helpDialog.showModal === 'function') {
          this.helpDialog.showModal();
          this.refreshIcons();
        }
      });
    }
    if (this.btnCloseHelpModal) {
      this.btnCloseHelpModal.addEventListener('click', () => this.helpDialog?.close());
    }
    if (this.btnUnderstoodHelp) {
      this.btnUnderstoodHelp.addEventListener('click', () => this.helpDialog?.close());
    }

    // Volteo al hacer clic en el disco (excepto si se toca el número de año)
    this.cardStage.addEventListener('click', (e) => {
      if (this.justHandledTouch) return;
      if (e.target.closest('#year-target, .tazo-year-hero, .year-number-giant, .year-scratch-badge')) {
        return; // Clic consumido por el revelador de año
      }
      this.flipCurrentCard();
    });
    this.btnFlip.addEventListener('click', () => this.flipCurrentCard());
    if (this.btnReveal) {
      this.btnReveal.addEventListener('click', () => this.toggleActiveCardYear());
    }
    this.btnNext.addEventListener('click', () => this.nextCard());
    this.btnPrev.addEventListener('click', () => this.prevCard());
    this.btnShuffle.addEventListener('click', () => this.shuffleCurrentDeck());

    // Chrono-Dial time machine slider
    if (this.chronoDial) {
      this.chronoDial.addEventListener('input', () => {
        if (this.displaySelectedYear) {
          this.displaySelectedYear.textContent = this.chronoDial.value;
        }
        this.playAudioFeedback('tick');
      });
    }

    // Botón de Tiro / Slam
    if (this.btnSubmitGuess) {
      this.btnSubmitGuess.addEventListener('click', () => this.evaluateGuess());
    }

    // Gallery search and filter
    this.galleryQuery.addEventListener('input', () => this.filterCatalog());
    this.selectFilterGroup.addEventListener('change', () => this.filterCatalog());
    this.selectSortOrder.addEventListener('change', () => this.filterCatalog());
  }

  // 4. Atajos de Teclado con hotkeys-js (Respetan inputs y modales automáticamente)
  bindKeyboardShortcuts() {
    if (typeof hotkeys === 'function') {
      // Navegación de cartas: Flechas Izquierda / Derecha
      hotkeys('left', (e) => { e.preventDefault(); this.prevCard(); });
      hotkeys('right', (e) => { e.preventDefault(); this.nextCard(); });
      hotkeys('p', () => this.prevCard());
      hotkeys('n', () => this.nextCard());

      // Ajuste de año: Teclas + y - (incluyendo teclado numérico y Shift)
      hotkeys('+,=,num_add,shift+=', (e) => { e.preventDefault(); this.nudgeYear(1); });
      hotkeys('-,num_subtract', (e) => { e.preventDefault(); this.nudgeYear(-1); });
      hotkeys('up', (e) => { e.preventDefault(); this.nudgeYear(1); });
      hotkeys('down', (e) => { e.preventDefault(); this.nudgeYear(-1); });
      hotkeys('shift+up', (e) => { e.preventDefault(); this.nudgeYear(5); });
      hotkeys('shift+down', (e) => { e.preventDefault(); this.nudgeYear(-5); });

      // Lanzar predicción: Enter
      hotkeys('enter', (e) => { e.preventDefault(); this.evaluateGuess(); });

      // Volteo y utilidades
      hotkeys('space', (e) => { e.preventDefault(); this.flipCurrentCard(); });
      hotkeys('r', (e) => { e.preventDefault(); this.toggleActiveCardYear(); });
      hotkeys('s', () => this.btnSound?.click());

      const volumeKeys = [
        'ALL', 'kernel-foundations', 'cypherpunks-hacker-lore',
        'embedded-silicon-hardware', 'unix-sysadmin-networks',
        'backend-distributed-systems', 'cloud-containers-sre',
        'python-track', 'scifi-pop-culture-cinema'
      ];
      for (let i = 0; i <= 8; i++) {
        hotkeys(`${i}`, () => {
          const pill = this.groupRibbon?.querySelector(`[data-volumen="${volumeKeys[i]}"]`);
          if (pill) pill.click();
        });
      }
    } else {
      // Fallback nativo ligero si hotkeys-js no está disponible
      window.addEventListener('keydown', (e) => {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement === this.galleryQuery) return;
        if (e.code === 'Enter' || e.code === 'NumpadEnter') { e.preventDefault(); this.evaluateGuess(); }
        else if (e.code === 'ArrowLeft') { e.preventDefault(); this.prevCard(); }
        else if (e.code === 'ArrowRight') { e.preventDefault(); this.nextCard(); }
        else if (e.key === '+' || e.code === 'NumpadAdd' || e.key === '=') { e.preventDefault(); this.nudgeYear(1); }
        else if (e.key === '-' || e.code === 'NumpadSubtract') { e.preventDefault(); this.nudgeYear(-1); }
        else if (e.code === 'Space') { e.preventDefault(); this.flipCurrentCard(); }
        else if (e.code === 'KeyR') { e.preventDefault(); this.toggleActiveCardYear(); }
        else if (e.code === 'KeyN') this.nextCard();
        else if (e.code === 'KeyP') this.prevCard();
      });
    }
  }

  // 8. Gestos Táctiles con TinyGesture (~1 KB)
  initTouchGestures() {
    const stage = document.getElementById('card-stage');
    if (!stage) return;

    if (typeof TinyGesture === 'function') {
      const gesture = new TinyGesture(stage, {
        // Umbral mínimo de desplazamiento en píxeles para reconocer un swipe
        threshold: (type) => Math.max(30, Math.floor(0.15 * (type === 'x' ? window.innerWidth : window.innerHeight))),
        // Permite que la pantalla siga haciendo scroll vertical si no es un swipe horizontal claro
        diagonalSwipes: false
      });

      // Deslizar a la izquierda: Siguiente carta
      gesture.on('swipeleft', () => {
        this.justHandledTouch = true;
        setTimeout(() => { this.justHandledTouch = false; }, 350);
        if (navigator.vibrate) {
          try { navigator.vibrate(20); } catch (_) { }
        }
        this.nextCard();
        this.playAudioFeedback('flip');
      });

      // Deslizar a la derecha: Carta anterior
      gesture.on('swiperight', () => {
        this.justHandledTouch = true;
        setTimeout(() => { this.justHandledTouch = false; }, 350);
        if (navigator.vibrate) {
          try { navigator.vibrate(20); } catch (_) { }
        }
        this.prevCard();
        this.playAudioFeedback('flip');
      });

      // Deslizar hacia arriba: Revelar / ocultar año rápidamente
      gesture.on('swipeup', () => {
        this.justHandledTouch = true;
        setTimeout(() => { this.justHandledTouch = false; }, 350);
        if (navigator.vibrate) {
          try { navigator.vibrate(15); } catch (_) { }
        }
        this.toggleActiveCardYear();
      });

      // Deslizar hacia abajo: Voltear carta
      gesture.on('swipedown', () => {
        this.justHandledTouch = true;
        setTimeout(() => { this.justHandledTouch = false; }, 350);
        if (navigator.vibrate) {
          try { navigator.vibrate(15); } catch (_) { }
        }
        this.flipCurrentCard();
      });

      // Tap simple: Voltear la carta
      gesture.on('tap', (event) => {
        // Evita voltear si el usuario tocó el botón o área de revelado del año
        if (event && event.target && event.target.closest('#year-target, .tazo-year-hero, .year-number-giant, .year-scratch-badge')) return;
        this.justHandledTouch = true;
        setTimeout(() => { this.justHandledTouch = false; }, 350);
        if (navigator.vibrate) {
          try { navigator.vibrate(12); } catch (_) { }
        }
        this.flipCurrentCard();
      });
    }
  }

  reset3DTilt() {
    const card = document.getElementById('active-card-3d');
    if (!card) return;
    card.style.transform = '';
  }


  nudgeYear(delta) {
    if (!this.chronoDial) return;
    const cur = parseInt(this.chronoDial.value, 10) || 1990;
    const min = parseInt(this.chronoDial.min, 10) || 1940;
    const max = parseInt(this.chronoDial.max, 10) || 2026;
    const nextVal = Math.max(min, Math.min(max, cur + delta));
    this.chronoDial.value = nextVal;
    if (this.displaySelectedYear) this.displaySelectedYear.textContent = nextVal;
    this.playAudioFeedback('tick');
  }

  switchView(mode) {
    if (mode === 'play') {
      this.viewPlay.classList.add('active');
      this.viewGallery.classList.remove('active');
      this.btnTabPlay.classList.add('active');
      this.btnTabPlay.setAttribute('aria-selected', 'true');
      this.btnTabGallery.classList.remove('active');
      this.btnTabGallery.setAttribute('aria-selected', 'false');
    } else {
      this.viewGallery.classList.add('active');
      this.viewPlay.classList.remove('active');
      this.btnTabGallery.classList.add('active');
      this.btnTabGallery.setAttribute('aria-selected', 'true');
      this.btnTabPlay.classList.remove('active');
      this.btnTabPlay.setAttribute('aria-selected', 'false');
      this.refreshIcons();
    }
  }

  selectActiveGroup(grp) {
    this.activeGroup = grp;
    if (grp === 'ALL') {
      this.activeDeck = [...this.cards];
      if (this.hudGroupLabel) this.hudGroupLabel.textContent = 'Mazo Maestro (576 cartas)';
    } else {
      this.activeDeck = this.cards.filter(c => c.volumen === grp);
      const name = (this.catalog?.volumes?.[grp] || this.activeDeck[0]?.volumen || `Volumen ${grp}`).toUpperCase();
      if (this.hudGroupLabel) this.hudGroupLabel.textContent = name;
    }
    this.currentIndex = 0;
    this.renderActiveArenaCard();
  }

  // 5. Formateo de Texto con Snarkdown (~1 KB Markdown Parser)
  formatMarkdown(str) {
    if (!str) return '';
    if (typeof snarkdown === 'function') {
      return snarkdown(str);
    }
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

  getDomainIcon(domain) {
    const map = {
      'languages-runtimes': 'code',
      'security-exploits': 'shield-alert',
      'systems-kernels': 'cpu',
      'distributed-databases': 'database',
      'hardware-chips': 'microchip',
      'networking-protocols': 'network',
      'devops-containers': 'container',
      'ai-data-science': 'brain',
      'python-ecosystem': 'code-2',
      'scifi-cinema': 'sparkles',
      'hacker-lore': 'terminal'
    };
    return map[domain] || 'cpu';
  }

  getTazoPalette(card) {
    const domainPalettes = {
      'languages-runtimes': {
        c1: '#00d2d3', // Turquesa eléctrico
        c2: '#0984e3', // Azul brillante
        badgeBg: '#ffe600',
        badgeColor: '#000000'
      },
      'python-ecosystem': {
        c1: '#3867d6', // Azul Python
        c2: '#fed330', // Amarillo Python
        badgeBg: '#ffe600',
        badgeColor: '#000000'
      },
      'security-exploits': {
        c1: '#ff4757', // Rojo fuego
        c2: '#2ed573', // Verde radioactivo
        badgeBg: '#ffe600',
        badgeColor: '#000000'
      },
      'systems-kernels': {
        c1: '#00a651', // Verde Looney Tunes (Gallo Claudio / Coyote)
        c2: '#006935', // Verde oscuro del surco
        badgeBg: '#ffe600',
        badgeColor: '#000000'
      },
      'hardware-chips': {
        c1: '#ff9f43', // Naranja mecánico
        c2: '#ee5253', // Rojo carmesí
        badgeBg: '#ffe600',
        badgeColor: '#000000'
      },
      'networking-protocols': {
        c1: '#5f27cd', // Morado intenso
        c2: '#48dbfb', // Aqua eléctrico
        badgeBg: '#ffe600',
        badgeColor: '#000000'
      },
      'distributed-databases': {
        c1: '#2e86de', // Azul cobalto
        c2: '#ff9f43', // Naranja
        badgeBg: '#ffe600',
        badgeColor: '#000000'
      },
      'devops-containers': {
        c1: '#0abde3', // Azul cielo
        c2: '#10ac84', // Esmeralda
        badgeBg: '#ffe600',
        badgeColor: '#000000'
      },
      'ai-data-science': {
        c1: '#8854d0', // Amatista
        c2: '#f368e0', // Orquídea neón
        badgeBg: '#ffe600',
        badgeColor: '#000000'
      },
      'scifi-cinema': {
        c1: '#f368e0', // Rosa chicle (Bugs Bunny)
        c2: '#5f27cd', // Morado intenso
        badgeBg: '#ffe600',
        badgeColor: '#000000'
      },
      'hacker-lore': {
        c1: '#2ed573', // Verde ciber
        c2: '#1e272e', // Negro carbón
        badgeBg: '#ffe600',
        badgeColor: '#000000'
      }
    };

    return domainPalettes[card.domain] || {
      c1: '#00d2d3',
      c2: '#0984e3',
      badgeBg: '#ffe600',
      badgeColor: '#000000'
    };
  }

  parseHito(hito) {
    const boldRegex = /\*\*(.*?)\*\*/;
    const match = hito.match(boldRegex);
    if (match) {
      const title = match[1].replace(/`/g, '').trim();
      const cleanHito = hito.replace(/\*\*/g, '').replace(/`/g, '').trim();
      return { title, clue: cleanHito };
    }
    const parts = hito.split(/[,:.]/);
    return { title: parts[0].replace(/`/g, '').trim(), clue: hito.replace(/\*\*/g, '').replace(/`/g, '').trim() };
  }

  buildCardHTML(card, options = {}) {
    const isFlipped = options.isFlipped !== undefined 
      ? options.isFlipped === true 
      : (options.isRevealed === true);
    const showYear = options.showYear !== undefined 
      ? options.showYear === true 
      : (options.isRevealed === true);
    const hideRevealButton = options.hideRevealButton !== undefined 
      ? options.hideRevealButton === true 
      : (options.showYear === true);

    const yearStateClass = showYear ? 'is-revealed' : 'is-hidden';

    const hitoFormatted = this.formatMarkdown(card.hito);
    const triviaFormatted = this.formatMarkdown(card.trivia);
    const creadorFormatted = this.formatMarkdown(card.autor);

    const palette = this.getTazoPalette(card);

    // Mismos metadatos exactos de la tarjeta cuadrada
    const volId = card.id ? card.id.split('-')[0].replace('vol', '') : '0';
    const hexPart = card.id ? card.id.split('-')[1].substring(2) : '00';
    const cardNumStr = `${volId}x${hexPart}`;
    const collectorNum = String(card.globalIndex || (card.index !== undefined ? card.index + 1 : 1)).padStart(3, '0');

    const domainName = (this.catalog?.domains?.[card.domain] || card.domain || '').toUpperCase();
    const tagName = (this.catalog?.tags?.[card.tag] || card.tag || '').toUpperCase();
    const volName = (this.catalog?.volumes?.[card.volumen] || card.volumen || '').toUpperCase();

    // Textos periféricos en los aros SVG
    const frontTopLabel = `${domainName} • ${tagName}`;
    const frontBottomLabel = `${volName} • #${cardNumStr}`;
    const backTopLabel = `${volName} • #${cardNumStr}`;
    const backBottomLabel = `shellaquiles.org`;

    const discId = options.id !== undefined ? (options.id ? `id="${options.id}"` : '') : 'id="active-card-3d"';
    const uid = (card.id || 'tazo').replace(/[^a-zA-Z0-9]/g, '_') + '_' + Math.floor(Math.random() * 1000);
    const topPathF = `curve-tf-${uid}`;
    const botPathF = `curve-bf-${uid}`;
    const topPathB = `curve-tb-${uid}`;
    const botPathB = `curve-bb-${uid}`;

    return `
      <div class="tazo-physical tazo-disc ${isFlipped ? 'is-flipped' : ''}" ${discId} style="--tazo-c1: ${palette.c1}; --tazo-c2: ${palette.c2};">

        <!-- ══════════════════════════════════════════════════════════════ -->
        <!-- ANVERSO: DOMINIO + TAG + CITA COMPLETA + ID                   -->
        <!-- ══════════════════════════════════════════════════════════════ -->
        <div class="tazo-face tazo-front tazo-face-front">
          <div class="tazo-notches" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>

          <div class="tazo-relief-ring ring-outer" aria-hidden="true"></div>
          <div class="tazo-relief-ring ring-mid" aria-hidden="true"></div>

          <!-- Arco superior e inferior -->
          <svg class="tazo-ring-text" viewBox="0 0 300 300" aria-hidden="true">
            <path id="${topPathF}" d="M 22,150 A 128,128 0 0,1 278,150" fill="none" />
            <path id="${botPathF}" d="M 22,150 A 128,128 0 0,0 278,150" fill="none" />
            <text class="ring-label"><textPath href="#${topPathF}" startOffset="50%" text-anchor="middle">${frontTopLabel}</textPath></text>
            <text class="ring-sub"><textPath href="#${botPathF}" startOffset="50%" text-anchor="middle">${frontBottomLabel}</textPath></text>
          </svg>

          <!-- Centro: Texto del Hito (amplio, legible, sin marcos invasivos) -->
          <div class="tazo-core-front">
            <div class="tazo-hito-prose">
              ${hitoFormatted}
            </div>
          </div>

          <div class="tazo-foil-reflection" aria-hidden="true"></div>
        </div>

        <!-- ══════════════════════════════════════════════════════════════ -->
        <!-- REVERSO: AUTOR ARRIBA + AÑO GIGANTE + TRIVIA LORE ABAJO      -->
        <!-- ══════════════════════════════════════════════════════════════ -->
        <div class="tazo-face tazo-back tazo-face-back">
          <div class="tazo-notches" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>

          <svg class="tazo-ring-text" viewBox="0 0 300 300" aria-hidden="true">
            <path id="${topPathB}" d="M 22,150 A 128,128 0 0,1 278,150" fill="none" />
            <path id="${botPathB}" d="M 22,150 A 128,128 0 0,0 278,150" fill="none" />
            <text class="ring-label"><textPath href="#${topPathB}" startOffset="50%" text-anchor="middle">${backTopLabel}</textPath></text>
            <text class="ring-sub"><textPath href="#${botPathB}" startOffset="50%" text-anchor="middle">${backBottomLabel}</textPath></text>
          </svg>

          <!-- Distribución vertical pura: 1. Autor | 2. Año Hero | 3. Lore -->
          <div class="tazo-core-back">
            <!-- 1. Autor / Creador -->
            <div class="tazo-back-author">${creadorFormatted}</div>

            <!-- 2. Año Hero en el centro -->
            <div class="tazo-year-hero ${yearStateClass}" ${hideRevealButton ? '' : 'id="year-target" title="Toca para revelar el año (-5 Pts) [R]"'}>
              <span class="year-number-giant">${card.year}</span>
              ${hideRevealButton ? '' : `
              <div class="year-scratch-badge">
                <i data-lucide="eye"></i>
                <span>REVELAR (-5 PTS)</span>
              </div>
              `}
            </div>

            <!-- 3. Trivia / Lore en cursiva -->
            <div class="tazo-back-lore">${triviaFormatted}</div>
          </div>

          <div class="tazo-foil-reflection" aria-hidden="true"></div>
        </div>

      </div>
    `;
  }

  renderActiveArenaCard() {
    if (!this.activeDeck.length) return;
    const card = this.activeDeck[this.currentIndex];
    const isAlreadyRevealed = card?.id ? this.revealedCards.has(card.id) : false;

    this.cardStage.innerHTML = this.buildCardHTML(card, { isRevealed: isAlreadyRevealed, isFlipped: false });
    if (this.hudCardCounter) this.hudCardCounter.textContent = `${this.currentIndex + 1} / ${this.activeDeck.length}`;
    this.updateRevealButtonState(isAlreadyRevealed);

    if (isAlreadyRevealed) {
      this.cardSolved = true;
      this.attemptCount = this.maxAttempts;
      this.renderAttemptTracker();
      if (this.btnSubmitGuess) this.btnSubmitGuess.disabled = true;
      if (this.guessResultPill) {
        this.guessResultPill.innerHTML = `<span style="color:#64748b;display:inline-flex;align-items:center;gap:0.4rem;font-weight:600">
          <i data-lucide="check-circle-2"></i> Tazo ya resuelto &mdash; Año: <strong style="color:#0f172a;background:#f1f5f9;padding:0.05rem 0.35rem;border-radius:6px;border:1px solid #cbd5e1">${card.year}</strong> (Tiro no disponible)
        </span>`;
      }
    } else {
      // Reset estado de intentos para la nueva carta no resuelta
      this.attemptCount = 0;
      this.cardSolved = false;
      this.renderAttemptTracker();
      if (this.btnSubmitGuess) this.btnSubmitGuess.disabled = false;
      this.guessResultPill.textContent = '';
    }

    // Update Ambient Aura glow with Card Pop Color
    if (this.ambientAura) {
      const theme = this.getCardTheme(card);
      const hue = theme.hue !== undefined ? theme.hue : 215;
      this.ambientAura.style.background = `radial-gradient(circle, hsla(${hue}, 90%, 65%, 0.35) 0%, hsla(${hue}, 80%, 55%, 0.15) 45%, transparent 75%)`;
      document.documentElement.style.setProperty('--current-card-glow', `hsl(${hue}, 90%, 60%)`);
    }

    const yearTarget = this.cardStage.querySelector('#year-target');
    if (yearTarget) {
      yearTarget.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita que el disco se voltee al tocar el año
        this.toggleActiveCardYear();
      });
    }
    this.refreshIcons();
  }

  updateRevealButtonState(isRevealed) {
    if (!this.btnReveal) return;
    if (isRevealed) {
      this.btnReveal.innerHTML = `<i data-lucide="eye-off"></i> <span>Ocultar</span>`;
      this.btnReveal.classList.add('active');
    } else {
      this.btnReveal.innerHTML = `<i data-lucide="eye"></i> <span>Revelar (-5 pts)</span>`;
      this.btnReveal.classList.remove('active');
    }
    this.refreshIcons();
  }

  revealActiveCardYear() {
    const stage = document.getElementById('card-stage');
    const tazoDisc = stage?.querySelector('.tazo-physical, .tazo-disc') || stage;
    if (!tazoDisc) return;
    if (!tazoDisc.classList.contains('is-flipped')) {
      this.flipCard(stage);
    }
    const yearStage = tazoDisc.querySelector('#year-target, .tazo-year-hero, .tazo-year-stage, .year-hero-display, .year-center-stage');
    if (yearStage && yearStage.classList.contains('is-hidden')) {
      yearStage.classList.remove('is-hidden');
      yearStage.classList.add('is-revealed');
      this.updateRevealButtonState(true);
      this.refreshIcons();
    }
    const card = this.activeDeck[this.currentIndex];
    if (card && card.id) {
      this.revealedCards.add(card.id);
      this.persistGameState();
    }
  }

  toggleActiveCardYear() {
    const stage = document.getElementById('card-stage');
    const tazoDisc = stage?.querySelector('.tazo-physical, .tazo-disc') || stage;
    if (!tazoDisc) return;

    // Si el tazo está de frente, voltearlo para ver el reverso
    if (!tazoDisc.classList.contains('is-flipped')) {
      this.flipCard(stage);
    }

    const yearStage = tazoDisc.querySelector('#year-target, .tazo-year-hero, .tazo-year-stage, .year-hero-display, .year-center-stage');
    if (!yearStage) return;

    const isHidden = yearStage.classList.contains('is-hidden');
    if (isHidden) {
      // Dinámica de juego: Revelar año cuesta 5 puntos y bloquea el tiro para esta carta.
      // Regla: No se permiten puntos negativos. Si no alcanzan los puntos (< 5), no se puede revelar el año.
      if (!this.cardSolved) {
        if (this.score < 5) {
          if (this.guessResultPill) {
            this.guessResultPill.innerHTML = `<span style="color:#f59e0b;display:inline-flex;align-items:center;gap:0.4rem;font-weight:600">
              <i data-lucide="alert-triangle"></i> Puntos insuficientes: necesitas al menos 5 pts para revelar el año
            </span>`;
          }
          this.playAudioFeedback('slam');
          this.refreshIcons();
          return;
        }

        // Si el tazo está de frente, voltearlo para ver el reverso
        if (!tazoDisc.classList.contains('is-flipped')) {
          this.flipCard(stage);
        }

        this.score -= 5;
        this.streak = 0;
        this.cardSolved = true;
        if (this.btnSubmitGuess) this.btnSubmitGuess.disabled = true;

        if (this.hudScore) {
          this.hudScore.textContent = this.score;
        }
        if (this.hudStreak) this.hudStreak.textContent = this.streak;
        if (this.hudStreakBox) this.hudStreakBox.classList.remove('streak-hot');

        const card = this.activeDeck[this.currentIndex];
        if (card && card.id) {
          this.revealedCards.add(card.id);
        }
        if (this.guessResultPill) {
          this.guessResultPill.innerHTML = `<span style="color:#dc2626;display:inline-flex;align-items:center;gap:0.4rem;font-weight:700">
            <i data-lucide="eye"></i> Año revelado (<strong style="color:#0f172a;background:#fee2e2;padding:0.05rem 0.35rem;border-radius:6px;border:1px solid #fecaca">${card?.year || ''}</strong>) &mdash; <strong>-5 Puntos</strong> (Tiro bloqueado)
          </span>`;
        }

        this.persistGameState();
        this.playAudioFeedback('slam');
      } else {
        if (!tazoDisc.classList.contains('is-flipped')) {
          this.flipCard(stage);
        }
        this.playAudioFeedback('hit');
      }

      yearStage.classList.remove('is-hidden');
      yearStage.classList.add('is-revealed');
      this.updateRevealButtonState(true);
    } else {
      yearStage.classList.remove('is-revealed');
      yearStage.classList.add('is-hidden');
      this.updateRevealButtonState(false);
      this.playAudioFeedback('flip');
    }
    this.refreshIcons();
  }

  // Volteo del Tazo 3D con tambaleo y física de moneda
  flipCard(containerEl) {
    if (!containerEl) return;
    const tazoDisc = containerEl.querySelector('.tazo-disc') || containerEl;
    if (!tazoDisc) return;

    const isFlipped = tazoDisc.classList.contains('is-flipped');
    const targetRot = isFlipped ? 0 : 180;

    if (typeof tazoDisc.animate === 'function') {
      const flipAnim = tazoDisc.animate([
        { transform: `scale(1) rotateY(${isFlipped ? 180 : 0}deg) rotateZ(0deg)` },
        { transform: `scale(1.14) translateY(-22px) rotateY(${isFlipped ? 90 : 90}deg) rotateZ(${isFlipped ? -12 : 12}deg)`, offset: 0.5 },
        { transform: `scale(1) translateY(0) rotateY(${targetRot}deg) rotateZ(0deg)` }
      ], {
        duration: 540,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      });
      flipAnim.onfinish = () => {
        tazoDisc.style.transform = `rotateY(${targetRot}deg)`;
      };
    } else {
      tazoDisc.style.transform = `rotateY(${targetRot}deg)`;
    }

    if (isFlipped) {
      tazoDisc.classList.remove('is-flipped');
    } else {
      tazoDisc.classList.add('is-flipped');
    }
  }

  flipCurrentCard() {
    const stage = document.getElementById('card-stage');
    if (stage) {
      this.flipCard(stage);
      this.reset3DTilt();
      this.playAudioFeedback('flip');
    }
  }

  // Animación de impacto y giro plástico al comprobar el año (física de tazo)
  slamTazo(isSuccess) {
    const stage = document.getElementById('card-stage');
    const tazoDisc = stage?.querySelector('.tazo-disc') || stage;
    if (!tazoDisc) return;

    if (typeof tazoDisc.animate === 'function') {
      tazoDisc.animate([
        { transform: 'scale(1) rotateY(0deg) rotateZ(0deg)' },
        { transform: 'scale(1.22) translateY(-38px) rotateY(180deg) rotateZ(16deg)', offset: 0.38 },
        { transform: 'scale(0.94) translateY(8px) rotateY(180deg) rotateZ(-7deg)', offset: 0.68 },
        { transform: 'scale(1.03) translateY(-3px) rotateY(180deg) rotateZ(3deg)', offset: 0.85 },
        { transform: 'scale(1) translateY(0) rotateY(180deg) rotateZ(0deg)' }
      ], {
        duration: 750,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        fill: 'forwards'
      });
      tazoDisc.classList.add('is-flipped');
    }

    // Efecto sonoro foley de impacto plástico
    if (this.soundEnabled) {
      this.playAudioFeedback(isSuccess ? 'hit' : 'slam');
    }
  }

  /** Renderiza los indicadores visuales de tiros/intentos disponibles en el HUD */
  renderAttemptTracker() {
    if (!this.attemptDots) return;
    const remaining = Math.max(0, this.maxAttempts - this.attemptCount);
    const isSolved = this.cardSolved;
    const pips = Array.from({ length: this.maxAttempts }, (_, i) => {
      const isAvailable = i < remaining && !isSolved;
      const isCritical = isAvailable && remaining === 1;
      const cls = isAvailable 
        ? (isCritical ? 'attempt-pip critical' : 'attempt-pip') 
        : 'attempt-pip used';
      return `<span class="${cls}" title="${isAvailable ? 'Tiro disponible' : 'Tiro no disponible'}"></span>`;
    }).join('');
    this.attemptDots.innerHTML = pips;
    if (this.attemptTracker) {
      const titleText = isSolved 
        ? 'Tazo ya resuelto — tiros agotados' 
        : `${remaining} de ${this.maxAttempts} tiros disponibles`;
      this.attemptTracker.setAttribute('title', titleText);
      this.attemptTracker.setAttribute('aria-label', titleText);
    }
  }

  /** Devuelve mensaje de pista según diferencia y dirección */
  buildHint(diff, val, correctYear) {
    const direction = val < correctYear ? '↑ Más reciente' : '↓ Más antiguo';
    const dirColor = val < correctYear ? '#0284c7' : '#ea580c';
    let temp, tempColor;
    if (diff <= 5) { temp = '🔥 ¡Caliente!'; tempColor = '#ea580c'; }
    else if (diff <= 15) { temp = '🌡️ Tibio'; tempColor = '#d97706'; }
    else { temp = '❄️ Frío'; tempColor = '#0284c7'; }
    return `<span style="display:inline-flex;align-items:center;gap:0.6rem;flex-wrap:wrap">
      <span style="color:${dirColor};font-weight:700">${direction}</span>
      <span style="color:${tempColor};font-weight:700">${temp}</span>
    </span>`;
  }

  evaluateGuess() {
    if (this.cardSolved) return;
    const card = this.activeDeck[this.currentIndex];
    const val = parseInt(this.chronoDial ? this.chronoDial.value : (this.displaySelectedYear?.textContent || '1990'), 10);
    if (isNaN(val)) return;

    this.attemptCount++;
    this.renderAttemptTracker();

    const diff = Math.abs(val - card.year);
    const theme = this.getCardTheme(card);

    // Animación física del Tazo (Slam / Wobble)
    this.slamTazo(diff <= 2);

    // ─ Resultado ─────────────────────────────────────────────────────────────
    if (diff === 0) {
      // ✅ Exacto
      this.guessResultPill.innerHTML = `<span style="color:#16a34a;display:inline-flex;align-items:center;gap:0.4rem;font-weight:700">
        <i data-lucide="check-circle-2"></i> ¡Exacto! Era <strong style="color:#0f172a;background:#dcfce7;padding:0.1rem 0.4rem;border-radius:6px;border:1px solid #bbf7d0;margin:0 0.2rem">${card.year}</strong> &mdash; +3 Puntos
      </span>`;
      this.score += 3; this.streak += 1;
      this.cardSolved = true;
      this.triggerCyberConfetti(theme.bg);
      this.addToShelf(card);
      this.revealActiveCardYear();
      if (this.btnSubmitGuess) this.btnSubmitGuess.disabled = true;

    } else if (diff <= 2) {
      // 🟡 Muy cerca (±2 años)
      this.guessResultPill.innerHTML = `<span style="color:#b45309;display:inline-flex;align-items:center;gap:0.4rem;font-weight:700">
        <i data-lucide="sparkles"></i> ¡Muy cerca! Era <strong style="color:#0f172a;background:#fef3c7;padding:0.1rem 0.4rem;border-radius:6px;border:1px solid #fde68a;margin:0 0.2rem">${card.year}</strong> &mdash; +1 Punto
      </span>`;
      this.score += 1; this.streak += 1;
      this.cardSolved = true;
      this.addToShelf(card);
      this.revealActiveCardYear();
      if (this.btnSubmitGuess) this.btnSubmitGuess.disabled = true;

    } else if (this.attemptCount < this.maxAttempts) {
      // 🔁 Incorrecto pero quedan intentos — mostrar pista
      this.guessResultPill.innerHTML = this.buildHint(diff, val, card.year);
      this.streak = 0;

    } else {
      // ❌ Agotados los intentos — revelar sin puntos
      this.guessResultPill.innerHTML = `<span style="color:#dc2626;display:inline-flex;align-items:center;gap:0.4rem;font-weight:700">
        <i data-lucide="x-circle"></i> Ocurrió en <strong style="color:#0f172a;background:#fee2e2;padding:0.1rem 0.4rem;border-radius:6px;border:1px solid #fecaca;margin:0 0.2rem">${card.year}</strong> &mdash; sin puntos
      </span>`;
      this.streak = 0;
      this.cardSolved = true;
      this.revealActiveCardYear();
      if (this.btnSubmitGuess) this.btnSubmitGuess.disabled = true;
    }

    // Actualizar dots con estado final del intento
    this.renderAttemptTracker();
    if (this.hudScore) {
      this.hudScore.textContent = this.score;
    }
    if (this.hudStreak) this.hudStreak.textContent = this.streak;
    if (this.hudStreakBox) {
      if (this.streak >= 2) this.hudStreakBox.classList.add('streak-hot');
      else this.hudStreakBox.classList.remove('streak-hot');
    }
    this.persistGameState();
    this.refreshIcons();
  }

  // 6. Búsqueda difusa con Fuse.js
  setupSearchIndex() {
    if (typeof Fuse === 'function' && this.cards && this.cards.length) {
      this.fuse = new Fuse(this.cards, {
        keys: [
          { name: 'hito', weight: 0.5 },
          { name: 'autor', weight: 0.3 },
          { name: 'trivia', weight: 0.1 },
          { name: 'tag', weight: 0.05 },
          { name: 'id', weight: 0.05 }
        ],
        threshold: 0.38,
        ignoreLocation: true
      });
    }
  }

  filterCatalog() {
    const q = this.galleryQuery.value.trim();
    const grp = this.selectFilterGroup.value;
    const sort = this.selectSortOrder.value;

    let results = [];
    if (q) {
      if (this.fuse) {
        results = this.fuse.search(q).map(res => res.item);
      } else {
        const qLow = q.toLowerCase();
        results = this.cards.filter(c =>
          c.hito.toLowerCase().includes(qLow) ||
          c.autor.toLowerCase().includes(qLow) ||
          c.trivia.toLowerCase().includes(qLow) ||
          (c.tag && c.tag.toLowerCase().includes(qLow)) ||
          c.id.toLowerCase().includes(qLow)
        );
      }
    } else {
      results = [...this.cards];
    }

    if (grp !== 'ALL') {
      results = results.filter(c => c.volumen === grp);
    }

    if (sort === 'YEAR_ASC') {
      results.sort((a, b) => a.year - b.year);
    } else if (sort === 'YEAR_DESC') {
      results.sort((a, b) => b.year - a.year);
    } else if (sort === 'DECK_ORDER') {
      results.sort((a, b) => (a.index !== undefined ? a.index : 0) - (b.index !== undefined ? b.index : 0));
    }

    this.filteredCatalog = results;
    this.renderCatalog();
  }

  // 7. Persistencia Asíncrona con idb-keyval (con fallback a localStorage)
  async persistGameState() {
    try {
      const revealedArray = Array.from(this.revealedCards);
      if (typeof idbKeyval !== 'undefined') {
        await idbKeyval.set('hittazos_shelf', this.playerShelf);
        await idbKeyval.set('hittazos_score', this.score);
        await idbKeyval.set('hittazos_streak', this.streak);
        await idbKeyval.set('hittazos_revealed', revealedArray);
      } else if (window.localStorage) {
        localStorage.setItem('hittazos_shelf', JSON.stringify(this.playerShelf));
        localStorage.setItem('hittazos_score', String(this.score));
        localStorage.setItem('hittazos_streak', String(this.streak));
        localStorage.setItem('hittazos_revealed', JSON.stringify(revealedArray));
      }
    } catch (_) { }
  }

  async loadSavedState() {
    try {
      let savedShelf, savedScore, savedStreak, savedRevealed;
      if (typeof idbKeyval !== 'undefined') {
        savedShelf = await idbKeyval.get('hittazos_shelf');
        savedScore = await idbKeyval.get('hittazos_score');
        savedStreak = await idbKeyval.get('hittazos_streak');
        savedRevealed = await idbKeyval.get('hittazos_revealed');
      } else if (window.localStorage) {
        const rawShelf = localStorage.getItem('hittazos_shelf');
        if (rawShelf) savedShelf = JSON.parse(rawShelf);
        const rawScore = localStorage.getItem('hittazos_score');
        if (rawScore !== null) savedScore = parseInt(rawScore, 10);
        const rawStreak = localStorage.getItem('hittazos_streak');
        if (rawStreak !== null) savedStreak = parseInt(rawStreak, 10);
        const rawRevealed = localStorage.getItem('hittazos_revealed');
        if (rawRevealed) savedRevealed = JSON.parse(rawRevealed);
      }

      if (Array.isArray(savedShelf) && savedShelf.length > 0) {
        this.playerShelf = savedShelf;
        this.renderShelf();
        // Todas las cartas ganadas en el estante se consideran reveladas
        this.playerShelf.forEach(c => {
          if (c && c.id) this.revealedCards.add(c.id);
        });
      }
      if (Array.isArray(savedRevealed)) {
        savedRevealed.forEach(id => this.revealedCards.add(id));
      }
      if (typeof savedScore === 'number' && !isNaN(savedScore)) {
        this.score = Math.max(0, savedScore);
        if (this.hudScore) {
          this.hudScore.textContent = this.score;
        }
      }
      if (typeof savedStreak === 'number' && !isNaN(savedStreak)) {
        this.streak = savedStreak;
        if (this.hudStreak) this.hudStreak.textContent = this.streak;
        if (this.hudStreakBox) {
          if (this.streak >= 2) this.hudStreakBox.classList.add('streak-hot');
          else this.hudStreakBox.classList.remove('streak-hot');
        }
      }

      // Si las cartas ya fueron cargadas y la carta actual ya estaba revelada, actualizar UI
      if (this.activeDeck && this.activeDeck.length > 0) {
        this.renderActiveArenaCard();
      }
    } catch (_) { }
  }

  renderShelf() {
    if (!this.shelfCardsContainer) return;
    this.shelfCardsContainer.innerHTML = '';
    this.playerShelf.forEach(c => {
      const chip = document.createElement('div');
      const theme = this.getCardTheme(c);
      chip.className = 'shelf-tazo-chip';
      chip.style.setProperty('--tazo-color', theme.bg);
      const volId = c.id ? c.id.split('-')[0].replace('vol', '') : '0';
      const hexPart = c.id ? c.id.split('-')[1].substring(2) : '00';
      const chipNum = `${volId}x${hexPart}`;
      chip.title = `${c.year} — ${c.autor || ''}`;
      chip.innerHTML = `
        <div class="shelf-tazo-year">${c.year}</div>
        <div class="shelf-tazo-id">${chipNum}</div>
      `;
      this.shelfCardsContainer.appendChild(chip);
    });

    if (this.shelfProgressFill) {
      const pct = Math.min(100, (this.playerShelf.length / 10) * 100);
      this.shelfProgressFill.style.width = `${pct}%`;
    }

    if (this.shelfCounter) {
      if (this.playerShelf.length >= 10) {
        this.shelfCounter.innerHTML = `<strong style="color: #4ade80; display: inline-flex; align-items: center; gap: 0.35rem;"><i data-lucide="trophy"></i> ¡Línea de Tiempo Completada! Victoria</strong>`;
      } else {
        this.shelfCounter.textContent = `${this.playerShelf.length} / 10 tazos para ganar`;
      }
    }
  }

  addToShelf(card) {
    if (this.playerShelf.some(c => c.id === card.id || c.globalIndex === card.globalIndex)) return;
    this.playerShelf.push(card);
    this.playerShelf.sort((a, b) => a.year - b.year);
    this.renderShelf();

    if (this.playerShelf.length >= 10) {
      this.triggerCyberConfetti('#facc15');
      this.refreshIcons();
    }
    this.persistGameState();
  }

  // Transición animada al avanzar o retroceder disco
  transitionToCard(targetIndex, direction = 'next') {
    const stage = document.getElementById('card-stage');
    const currentDisc = stage?.querySelector('.tazo-physical, .tazo-disc');

    const exitX = direction === 'next' ? -260 : 260;
    const enterX = direction === 'next' ? 260 : -260;
    const exitRot = direction === 'next' ? -24 : 24;
    const enterRot = direction === 'next' ? 24 : -24;

    this.playAudioFeedback('flip');

    if (currentDisc && typeof currentDisc.animate === 'function') {
      // 1. Animación de salida: el disco sale rodando de la mesa
      const exitAnim = currentDisc.animate([
        { transform: 'translateX(0) scale(1) rotateZ(0deg)', opacity: 1 },
        { transform: `translateX(${exitX}px) scale(0.85) rotateZ(${exitRot}deg)`, opacity: 0 }
      ], {
        duration: 180,
        easing: 'cubic-bezier(0.4, 0, 1, 1)',
        fill: 'forwards'
      });

      exitAnim.onfinish = () => {
        this.currentIndex = targetIndex;
        this.renderActiveArenaCard();

        const newDisc = stage.querySelector('.tazo-physical, .tazo-disc');
        if (newDisc && typeof newDisc.animate === 'function') {
          // 2. Animación de entrada: el nuevo disco entra resbalando con rebote elástico
          const enterAnim = newDisc.animate([
            { transform: `translateX(${enterX}px) scale(0.85) rotateZ(${enterRot}deg)`, opacity: 0 },
            { transform: 'translateX(0) scale(1) rotateZ(0deg)', opacity: 1 }
          ], {
            duration: 320,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
          });
          enterAnim.onfinish = () => {
            newDisc.style.transform = '';
            newDisc.style.opacity = '';
          };
        }
      };
    } else {
      this.currentIndex = targetIndex;
      this.renderActiveArenaCard();
    }
  }

  nextCard() {
    if (!this.activeDeck.length) return;
    const nextIdx = (this.currentIndex + 1) % this.activeDeck.length;
    this.transitionToCard(nextIdx, 'next');
  }

  prevCard() {
    if (!this.activeDeck.length) return;
    const prevIdx = (this.currentIndex - 1 + this.activeDeck.length) % this.activeDeck.length;
    this.transitionToCard(prevIdx, 'prev');
  }

  shuffleCurrentDeck() {
    const stage = document.getElementById('card-stage');
    const currentDisc = stage?.querySelector('.tazo-physical, .tazo-disc');

    this.playAudioFeedback('slam');

    if (currentDisc && typeof currentDisc.animate === 'function') {
      currentDisc.animate([
        { transform: 'scale(1) rotateZ(0deg)' },
        { transform: 'scale(0.8) rotateZ(180deg)', offset: 0.5 },
        { transform: 'scale(1.05) rotateZ(360deg)', offset: 0.8 },
        { transform: 'scale(1) rotateZ(360deg)' }
      ], {
        duration: 380,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
      });
    }

    for (let i = this.activeDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.activeDeck[i], this.activeDeck[j]] = [this.activeDeck[j], this.activeDeck[i]];
    }
    this.currentIndex = 0;
    setTimeout(() => {
      this.renderActiveArenaCard();
    }, 180);
  }


  renderCatalog() {
    this.catalogGrid.innerHTML = '';
    const slice = this.filteredCatalog.slice(0, 100);

    slice.forEach(card => {
      const cell = document.createElement('div');
      cell.className = 'catalog-card-cell';
      cell.innerHTML = this.buildCardHTML(card, { showYear: true, hideRevealButton: true, isFlipped: false, id: '' });

      const tazoDisc = cell.querySelector('.tazo-disc');
      if (tazoDisc) {
        tazoDisc.addEventListener('click', () => {
          this.flipCard(tazoDisc);
          this.playAudioFeedback('flip');
        });
      }

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
