// Hit-Tazos Tech — Main Application Orchestrator (ES Module)
import { 
  GAME_RULES, 
  CHRONO_BOUNDS, 
  STORAGE_KEYS, 
  CARD_FORMATS, 
  GAME_VERSIONS,
  CARD_SELECTORS, 
  ANIM_CONFIG 
} from './core/constants.js';
import { evaluateGuess, calculateHint, formatCardIdNumber, formatCollectorNumber } from './core/rules.js';
import { StorageAdapter } from './core/storage.js';
import { GameState } from './core/state.js';
import { AudioEngine } from './core/audio.js';
import { CardRenderer } from './core/renderer.js';

export const CARD_SELECTOR = CARD_SELECTORS.ACTIVE_CARD;
export const YEAR_STAGE_SELECTOR = CARD_SELECTORS.YEAR_STAGE;
export { ANIM_CONFIG };

export class HitTazosApp {
  constructor() {
    this.state = new GameState();
    this.audio = new AudioEngine();
    this.renderer = new CardRenderer();
    this.storage = StorageAdapter;

    this.cards = [];
    this.catalog = { domains: {}, tags: {}, volumes: {} };
    this.cardColors = {};
    this.manifest = null;
    this.filteredCatalog = [];
    this.currentView = 'play';
    this.fuse = null;
    this.touchGestureInstance = null;
    this.fanningGestureInstance = null;
    this.isFanningDragging = false;
    this.justHandledTouch = false;
    this.isTransitioning = false;
    this.pendingIconRefresh = false;
    this.searchDebounceTimer = null;
    this.isFirstTimeOnboarding = false;

    this.initDOM();
    this.bindStateEvents();
    this.bindDOMEvents();
    this.bindKeyboardShortcuts();
    this.initTilt();
    this.initTouchGestures();
    this.initFanningDragToScroll();
    this.loadData();
    this.loadSavedState();
  }

  // ── Métodos Auxiliares de Consulta DOM y Utilidades (DRY) ──────────────────

  getActiveCardElement(container = this.cardStage) {
    if (!container) return null;
    return container.querySelector(CARD_SELECTOR) || container;
  }

  getYearStageElement(cardEl = this.getActiveCardElement()) {
    if (!cardEl) return null;
    return cardEl.querySelector(YEAR_STAGE_SELECTOR);
  }

  setFeedbackPill(html) {
    if (this.guessResultPill) {
      this.guessResultPill.innerHTML = html;
      this.refreshIcons();
    }
  }

  setupDialog(dialogEl, openBtn, closeBtns = []) {
    if (!dialogEl) return;
    openBtn?.addEventListener('click', () => {
      if (typeof dialogEl.showModal === 'function') {
        dialogEl.showModal();
        this.refreshIcons();
      }
    });
    closeBtns.forEach(btn => btn?.addEventListener('click', () => dialogEl.close()));
    dialogEl.addEventListener('click', (e) => {
      if (e.target === dialogEl) dialogEl.close();
    });
  }

  // ── Inicialización de Elementos del DOM ───────────────────────────────────

  initDOM() {
    // Branding y Versiones de Juego
    this.btnBrandVersion = document.getElementById('btn-brand-version');
    this.brandIconGlyph = document.getElementById('brand-icon-glyph');
    this.brandTitleText = document.getElementById('brand-title-text');
    this.brandBadgeText = document.getElementById('brand-badge-text');

    // Modal de Selección de Versión (Hit-Tazo vs Hit-Cards)
    this.versionDialog = document.getElementById('version-select-dialog');
    this.btnCloseVersionModal = document.getElementById('btn-close-version-modal');
    this.optionSelectTazo = document.getElementById('option-select-tazo');
    this.optionSelectCards = document.getElementById('option-select-cards');
    this.btnChooseTazoAction = document.getElementById('btn-choose-tazo-action');
    this.btnChooseCardsAction = document.getElementById('btn-choose-cards-action');
    this.badgeStatusTazo = document.getElementById('badge-status-tazo');
    this.badgeStatusCards = document.getElementById('badge-status-cards');

    // Vistas y Navegación
    this.viewPlay = document.getElementById('view-play');
    this.viewGallery = document.getElementById('view-gallery');
    this.btnTabPlay = document.getElementById('btn-tab-play');
    this.btnTabGallery = document.getElementById('btn-tab-gallery');
    this.btnFormatToggle = document.getElementById('btn-format-toggle');
    this.iconFormatState = document.getElementById('icon-format-state');
    this.btnSound = document.getElementById('btn-sound-toggle');
    this.btnResetGame = document.getElementById('btn-reset-game');
    this.btnResetShelf = document.getElementById('btn-reset-shelf');
    this.btnPrint = document.getElementById('btn-print');

    // Ribbon de Volúmenes
    this.groupRibbon = document.getElementById('group-ribbon');

    // Escenario y Arena de Juego
    this.cardStage = document.getElementById('card-stage');
    this.pileLeft = document.getElementById('pile-left');
    this.pileLeftCards = document.getElementById('pile-left-cards');
    this.pileLeftCount = document.getElementById('pile-left-count');
    this.pileRight = document.getElementById('pile-right');
    this.pileRightCards = document.getElementById('pile-right-cards');
    this.pileRightCount = document.getElementById('pile-right-count');
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
    this.hudAttempts = document.getElementById('hud-attempts');
    this.attemptDots = document.getElementById('attempt-dots');

    // Catálogo y Explorador
    this.galleryQuery = document.getElementById('gallery-query');
    this.selectFilterGroup = document.getElementById('select-filter-group');
    this.selectSortOrder = document.getElementById('select-sort-order');
    this.catalogGrid = document.getElementById('catalog-grid');

    // Modo Abanico y Canto Apilado
    this.btnGalleryViewFan = document.getElementById('btn-gallery-view-fan');
    this.btnGalleryViewGrid = document.getElementById('btn-gallery-view-grid');
    this.galleryFanSection = document.getElementById('gallery-fan-section');
    this.cantoBar = document.getElementById('canto-bar');
    this.cantoCount = document.getElementById('canto-count');
    this.fanningScrollWrapper = document.getElementById('fanning-scroll-wrapper');
    this.fanningTrack = document.getElementById('fanning-track');
    this.btnModeGradient = document.getElementById('btn-mode-gradient');
    this.btnModeSolid = document.getElementById('btn-mode-solid');
    this.btnModeHybrid = document.getElementById('btn-mode-hybrid');

    this.galleryLayout = 'fan';
    this.fanColorMode = 'gradient';

    // Diálogos Modales (Ayuda e Impresión)
    this.btnHelpToggle = document.getElementById('btn-help-toggle');
    this.helpDialog = document.getElementById('help-dialog');
    this.btnCloseHelpModal = document.getElementById('btn-close-help-modal');
    this.btnUnderstoodHelp = document.getElementById('btn-understood-help');
    this.helpCardTerm = document.getElementById('help-card-term');
    this.helpTargetTerm = document.getElementById('help-target-term');
    this.helpNavTerm = document.getElementById('help-nav-term');
    this.printDialog = document.getElementById('print-dialog');
    this.btnClosePrintModal = document.getElementById('btn-close-print-modal');
    this.btnCancelPrint = document.getElementById('btn-cancel-print');
  }

  // ── Conexión Reactiva Estado -> Interfaz (Observer Pattern) ───────────────

  bindStateEvents() {
    // 1. Cambios en puntuación y racha
    this.state.subscribe('SCORE_CHANGED', ({ score, streak }) => {
      if (this.hudScore) this.hudScore.textContent = score;
      if (this.hudStreak) this.hudStreak.textContent = streak;
      if (this.hudStreakBox) {
        if (streak >= GAME_RULES.HOT_STREAK_THRESHOLD) {
          this.hudStreakBox.classList.add('streak-hot');
        } else {
          this.hudStreakBox.classList.remove('streak-hot');
        }
      }
      this.persistGameState();
    });

    // 2. Preparación de tarjeta en arena
    this.state.subscribe('CARD_PREPARED', ({ card, isAlreadyRevealed }) => {
      this.renderActiveArenaCard(card, isAlreadyRevealed);
    });

    // 3. Actualización de intentos / tiros
    this.state.subscribe('ATTEMPTS_UPDATED', ({ remaining, cardSolved }) => {
      this.renderAttemptTracker(remaining, cardSolved);
      if (this.btnSubmitGuess) {
        this.btnSubmitGuess.disabled = cardSolved;
      }
    });

    // 4. Actualización del estante de cartas ganadas
    this.state.subscribe('SHELF_UPDATED', ({ shelf, isVictory }) => {
      this.renderShelf(shelf, isVictory);
      this.persistGameState();
    });

    // 5. Feedback de tiro acertado
    this.state.subscribe('GUESS_WON', ({ evalResult, card }) => {
      const isExact = evalResult.outcome === 'EXACT';
      const ptsText = isExact ? '+3 Puntos' : '+1 Punto';
      const iconName = isExact ? 'check-circle-2' : 'sparkles';
      const badgeBg = isExact ? '#dcfce7' : '#fef3c7';
      const badgeBorder = isExact ? '#bbf7d0' : '#fde68a';
      const textColor = isExact ? '#16a34a' : '#b45309';

      this.setFeedbackPill(`
        <span style="color:${textColor};display:inline-flex;align-items:center;gap:0.4rem;font-weight:700">
          <i data-lucide="${iconName}"></i> ${isExact ? '¡Exacto!' : '¡Muy cerca!'} Era <strong style="color:#0f172a;background:${badgeBg};padding:0.1rem 0.4rem;border-radius:6px;border:1px solid ${badgeBorder};margin:0 0.2rem">${card.year}</strong> &mdash; ${ptsText}
        </span>
      `);

      const theme = this.renderer.getCardTheme(card);
      this.triggerCyberConfetti(theme.bg);
      this.revealActiveCardYear();
    });

    // 6. Feedback de tiro fallado con intentos restantes
    this.state.subscribe('GUESS_MISSED', ({ evalResult }) => {
      if (evalResult.hint) {
        const h = evalResult.hint;
        const dirColor = h.direction === 'MORE_RECENT' ? '#0284c7' : '#ea580c';
        const tempColor = h.temperature === 'HOT' ? '#ea580c' : (h.temperature === 'WARM' ? '#d97706' : '#0284c7');

        this.setFeedbackPill(`
          <span style="display:inline-flex;align-items:center;gap:0.6rem;flex-wrap:wrap">
            <span style="color:${dirColor};font-weight:700">${h.directionText}</span>
            <span style="color:${tempColor};font-weight:700">${h.tempText}</span>
          </span>
        `);
      }
    });

    // 7. Feedback de intentos agotados
    this.state.subscribe('GUESS_EXHAUSTED', ({ card }) => {
      this.setFeedbackPill(`
        <span style="color:#dc2626;display:inline-flex;align-items:center;gap:0.4rem;font-weight:700">
          <i data-lucide="x-circle"></i> Ocurrió en <strong style="color:#0f172a;background:#fee2e2;padding:0.1rem 0.4rem;border-radius:6px;border:1px solid #fecaca;margin:0 0.2rem">${card.year}</strong> &mdash; sin puntos
        </span>
      `);
      this.revealActiveCardYear();
    });

    // 8. Revelado de año con penalización
    this.state.subscribe('YEAR_REVEALED_WITH_PENALTY', ({ card }) => {
      this.setFeedbackPill(`
        <span style="color:#dc2626;display:inline-flex;align-items:center;gap:0.4rem;font-weight:700">
          <i data-lucide="eye"></i> Año revelado (<strong style="color:#0f172a;background:#fee2e2;padding:0.05rem 0.35rem;border-radius:6px;border:1px solid #fecaca">${card?.year || ''}</strong>) &mdash; <strong>-5 Puntos</strong> (Tiro bloqueado)
        </span>
      `);
      this.persistGameState();
    });

    // 9. Cambio de formato (Tazo 3D vs Tarjeta cuadrada)
    this.state.subscribe('FORMAT_CHANGED', ({ format }) => {
      this.updateFormatToggleUI(format);
      this.applyVersionUI(format === CARD_FORMATS.CARD ? GAME_VERSIONS.CARDS : GAME_VERSIONS.TAZO);
      const card = this.state.getCurrentCard();
      if (card) {
        this.renderActiveArenaCard(card, this.state.isCurrentCardRevealed());
      }
      if (this.currentView === 'gallery') {
        this.renderCatalog();
      }
    });

    // 10. Reinicio de partida
    this.state.subscribe('GAME_RESET', () => {
      this.setFeedbackPill(`
        <span style="color:#0284c7;display:inline-flex;align-items:center;gap:0.4rem;font-weight:600">
          <i data-lucide="rotate-ccw"></i> Partida reiniciada &mdash; ¡Mazo barajeado!
        </span>
      `);
      this.audio.play('slam');
    });
  }

  // ── Delegación de Eventos en Contenedores Padre ────────────────────────────

  bindDOMEvents() {
    // Vistas principales
    this.btnTabPlay?.addEventListener('click', () => this.switchView('play'));
    this.btnTabGallery?.addEventListener('click', () => this.switchView('gallery'));

    // Selector de Versión desde Ícono de Marca en Header
    this.btnBrandVersion?.addEventListener('click', () => this.openVersionModal());
    this.btnBrandVersion?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.openVersionModal();
      }
    });

    // Modal de Selección de Versión (Opciones Interactivas)
    this.setupDialog(this.versionDialog, null, [this.btnCloseVersionModal]);
    this.optionSelectTazo?.addEventListener('click', () => this.selectGameVersion('tazo'));
    this.optionSelectCards?.addEventListener('click', () => this.selectGameVersion('cards'));
    this.btnChooseTazoAction?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectGameVersion('tazo');
    });
    this.btnChooseCardsAction?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectGameVersion('cards');
    });
    this.optionSelectTazo?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.selectGameVersion('tazo');
      }
    });
    this.optionSelectCards?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.selectGameVersion('cards');
      }
    });

    // Alternar Formato
    this.btnFormatToggle?.addEventListener('click', () => {
      this.state.toggleFormat();
      this.audio.play('tick');
      this.storage.set(STORAGE_KEYS.FORMAT, this.state.cardFormat);
    });

    // Sonido
    this.btnSound?.addEventListener('click', () => {
      const enabled = this.audio.toggleSound();
      const icon = document.getElementById('icon-sound-state');
      if (icon) {
        icon.setAttribute('data-lucide', enabled ? 'volume-2' : 'volume-x');
        this.refreshIcons();
      }
    });

    // Modales de Ayuda e Impresión (DRY con cierre por backdrop nativo)
    this.setupDialog(this.helpDialog, this.btnHelpToggle, [this.btnCloseHelpModal, this.btnUnderstoodHelp]);
    this.setupDialog(this.printDialog, this.btnPrint, [this.btnClosePrintModal, this.btnCancelPrint]);

    // Selección de Volumen vía Ribbon
    this.groupRibbon?.addEventListener('click', (e) => {
      const pill = e.target.closest('.ribbon-pill');
      if (!pill) return;
      this.groupRibbon.querySelectorAll('.ribbon-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      const grp = pill.getAttribute('data-volumen');
      this.audio.play('flip');
      this.selectActiveGroup(grp);
    });

    // Delegación de Eventos en la Arena: Clic en año vs Clic en disco para voltear
    this.cardStage?.addEventListener('click', (e) => {
      if (this.justHandledTouch) return;
      const yearTrigger = e.target.closest(YEAR_STAGE_SELECTOR);
      if (yearTrigger) {
        e.stopPropagation();
        this.toggleActiveCardYear();
        return;
      }
      this.flipCurrentCard();
    });

    // Botones de Acción en la Arena
    this.btnFlip?.addEventListener('click', () => this.flipCurrentCard());
    this.btnReveal?.addEventListener('click', () => this.toggleActiveCardYear());
    this.btnNext?.addEventListener('click', () => this.nextCard());
    this.btnPrev?.addEventListener('click', () => this.prevCard());
    this.btnShuffle?.addEventListener('click', () => this.shuffleCurrentDeck());

    // Interacción con Pilas de Cartas Laterales de Escritorio (N=5)
    this.pileLeft?.addEventListener('click', () => {
      if (this.state.currentIndex > 0) this.prevCard();
    });
    this.pileLeft?.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && this.state.currentIndex > 0) {
        e.preventDefault();
        this.prevCard();
      }
    });

    this.pileRight?.addEventListener('click', () => {
      if (this.state.currentIndex < this.state.activeDeck.length - 1) this.nextCard();
    });
    this.pileRight?.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && this.state.currentIndex < this.state.activeDeck.length - 1) {
        e.preventDefault();
        this.nextCard();
      }
    });

    // Botones de Reinicio
    this.btnResetGame?.addEventListener('click', () => this.confirmResetGame());
    this.btnResetShelf?.addEventListener('click', () => this.confirmResetGame());

    // Botón de Tiro y Dial Cronológico
    this.btnSubmitGuess?.addEventListener('click', () => this.handleGuessSubmission());

    if (this.chronoDial) {
      this.chronoDial.addEventListener('input', (e) => {
        if (this.displaySelectedYear) this.displaySelectedYear.textContent = e.target.value;
        this.audio.play('tick');
      });
    }

    // Delegación de Eventos en el Estante (Tocar ficha para revisitar tarjeta)
    this.shelfCardsContainer?.addEventListener('click', (e) => {
      const chip = e.target.closest('.shelf-disc-chip, .shelf-tazo-chip, .shelf-card-chip');
      if (!chip) return;
      const cardId = chip.getAttribute('data-card-id');
      if (cardId) this.displayWonCardById(cardId);
    });

    // Delegación de Eventos en el Catálogo
    this.catalogGrid?.addEventListener('click', (e) => {
      const cellCard = e.target.closest(CARD_SELECTOR);
      if (cellCard) {
        this.flipCard(cellCard);
        this.audio.play('flip');
      }
    });

    // Búsqueda y Filtros del Catálogo con Debounce Ligero (150ms)
    this.galleryQuery?.addEventListener('input', () => {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = setTimeout(() => this.filterCatalog(), 150);
    });
    this.selectFilterGroup?.addEventListener('change', () => this.filterCatalog());
    this.selectSortOrder?.addEventListener('change', () => this.filterCatalog());

    // Alternancia de Disposición en Catálogo (Abanico vs Cuadrícula)
    this.btnGalleryViewFan?.addEventListener('click', () => {
      this.setGalleryLayout('fan');
    });
    this.btnGalleryViewGrid?.addEventListener('click', () => {
      this.setGalleryLayout('grid');
    });

    // Modos de Acabado Cromático en Abanico
    this.btnModeGradient?.addEventListener('click', () => this.setFanColorMode('gradient'));
    this.btnModeSolid?.addEventListener('click', () => this.setFanColorMode('solid'));
    this.btnModeHybrid?.addEventListener('click', () => this.setFanColorMode('hybrid'));

    // Interacción en la Pista de Abanico: Clic para voltear tarjeta
    this.fanningTrack?.addEventListener('click', (e) => {
      if (this.isFanningDragging) return;
      const cardEl = e.target.closest('.card-fan');
      if (cardEl) {
        cardEl.classList.toggle('is-flipped');
        this.audio.play('flip');
      }
    });

    this.fanningTrack?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const cardEl = e.target.closest('.card-fan');
        if (cardEl) {
          e.preventDefault();
          cardEl.classList.toggle('is-flipped');
          this.audio.play('flip');
        }
      }
    });
  }

  // ── Mapeo Declarativo de Teclado (hotkeys-js con fallback) ────────────────

  bindKeyboardShortcuts() {
    if (typeof hotkeys === 'function') {
      hotkeys('left,p', (e) => {
        e.preventDefault();
        if (this.currentView === 'gallery' && this.galleryLayout === 'fan' && this.fanningScrollWrapper) {
          this.fanningScrollWrapper.scrollBy({ left: -320, behavior: 'smooth' });
        } else {
          this.prevCard();
        }
      });
      hotkeys('right,n', (e) => {
        e.preventDefault();
        if (this.currentView === 'gallery' && this.galleryLayout === 'fan' && this.fanningScrollWrapper) {
          this.fanningScrollWrapper.scrollBy({ left: 320, behavior: 'smooth' });
        } else {
          this.nextCard();
        }
      });
      hotkeys('up,+,=', (e) => { e.preventDefault(); this.nudgeYear(1); });
      hotkeys('down,-', (e) => { e.preventDefault(); this.nudgeYear(-1); });
      hotkeys('enter', (e) => { e.preventDefault(); this.handleGuessSubmission(); });
      hotkeys('space', (e) => { e.preventDefault(); this.flipCurrentCard(); });
      hotkeys('t', (e) => {
        e.preventDefault();
        this.state.toggleFormat();
        this.audio.play('tick');
      });
      hotkeys('v', (e) => {
        e.preventDefault();
        this.openVersionModal();
      });
      hotkeys('r', (e) => { e.preventDefault(); this.toggleActiveCardYear(); });
      hotkeys('shift+r', (e) => { e.preventDefault(); this.confirmResetGame(); });
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
      window.addEventListener('keydown', (e) => {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement === this.galleryQuery) return;
        if (e.code === 'Enter' || e.code === 'NumpadEnter') { e.preventDefault(); this.handleGuessSubmission(); }
        else if (e.code === 'ArrowLeft') {
          e.preventDefault();
          if (this.currentView === 'gallery' && this.galleryLayout === 'fan' && this.fanningScrollWrapper) {
            this.fanningScrollWrapper.scrollBy({ left: -320, behavior: 'smooth' });
          } else {
            this.prevCard();
          }
        }
        else if (e.code === 'ArrowRight') {
          e.preventDefault();
          if (this.currentView === 'gallery' && this.galleryLayout === 'fan' && this.fanningScrollWrapper) {
            this.fanningScrollWrapper.scrollBy({ left: 320, behavior: 'smooth' });
          } else {
            this.nextCard();
          }
        }
        else if (e.key === '+' || e.code === 'NumpadAdd' || e.key === '=') { e.preventDefault(); this.nudgeYear(1); }
        else if (e.key === '-' || e.code === 'NumpadSubtract') { e.preventDefault(); this.nudgeYear(-1); }
        else if (e.code === 'Space') { e.preventDefault(); this.flipCurrentCard(); }
        else if (e.code === 'KeyT') { e.preventDefault(); this.state.toggleFormat(); this.audio.play('tick'); }
        else if (e.code === 'KeyV') { e.preventDefault(); this.openVersionModal(); }
        else if (e.shiftKey && (e.code === 'KeyR' || e.key === 'R')) { e.preventDefault(); this.confirmResetGame(); }
        else if (e.code === 'KeyR') { e.preventDefault(); this.toggleActiveCardYear(); }
        else if (e.code === 'KeyN') this.nextCard();
        else if (e.code === 'KeyP') this.prevCard();
      });
    }
  }

  // ── Gestos Táctiles y Arrastre (TinyGesture + Drag-to-Scroll) ───────────────

  initTouchGestures() {
    if (this.touchGestureInstance && typeof this.touchGestureInstance.destroy === 'function') {
      this.touchGestureInstance.destroy();
      this.touchGestureInstance = null;
    }
    if (this.fanningGestureInstance && typeof this.fanningGestureInstance.destroy === 'function') {
      this.fanningGestureInstance.destroy();
      this.fanningGestureInstance = null;
    }

    // Gestos en el Escenario Principal (Modo Juego)
    if (typeof TinyGesture === 'function' && this.cardStage) {
      try {
        this.touchGestureInstance = new TinyGesture(this.cardStage, {
          threshold: () => 35,
          velocityThreshold: 5,
          diagonalSwipes: false,
          mouseSupport: true
        });

        this.touchGestureInstance.on('swipeleft', () => {
          this.triggerTouch(() => this.nextCard(), 20);
        });

        this.touchGestureInstance.on('swiperight', () => {
          this.triggerTouch(() => this.prevCard(), 20);
        });

        this.touchGestureInstance.on('swipeup', () => {
          this.triggerTouch(() => this.toggleActiveCardYear(), 15);
        });

        this.touchGestureInstance.on('swipedown', () => {
          this.triggerTouch(() => this.flipCurrentCard(), 15);
        });

        this.touchGestureInstance.on('tap', (event) => {
          if (event?.target?.closest('#year-target, .disc-year-hero, .tazo-year-hero, .year-scratch-badge')) return;
          this.triggerTouch(() => this.flipCurrentCard(), 12);
        });
      } catch (_) {}
    }

    // Gestos táctiles en la Pista de Abanico (Modo Explorador)
    if (typeof TinyGesture === 'function' && this.fanningScrollWrapper) {
      try {
        this.fanningGestureInstance = new TinyGesture(this.fanningScrollWrapper, {
          threshold: () => 40,
          velocityThreshold: 5,
          diagonalSwipes: false,
          mouseSupport: false
        });

        this.fanningGestureInstance.on('swipeleft', () => {
          this.fanningScrollWrapper.scrollBy({ left: 320, behavior: 'smooth' });
        });

        this.fanningGestureInstance.on('swiperight', () => {
          this.fanningScrollWrapper.scrollBy({ left: -320, behavior: 'smooth' });
        });
      } catch (_) {}
    }
  }

  initFanningDragToScroll() {
    if (!this.fanningScrollWrapper) return;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasDragged = false;

    this.fanningScrollWrapper.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isDown = true;
      hasDragged = false;
      this.fanningScrollWrapper.classList.add('is-dragging');
      startX = e.pageX - this.fanningScrollWrapper.offsetLeft;
      scrollLeft = this.fanningScrollWrapper.scrollLeft;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const x = e.pageX - this.fanningScrollWrapper.offsetLeft;
      const walk = (x - startX) * 1.5;
      if (Math.abs(walk) > 6) {
        hasDragged = true;
        this.isFanningDragging = true;
      }
      this.fanningScrollWrapper.scrollLeft = scrollLeft - walk;
    });

    window.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      this.fanningScrollWrapper.classList.remove('is-dragging');
      if (hasDragged) {
        setTimeout(() => {
          this.isFanningDragging = false;
        }, 80);
      } else {
        this.isFanningDragging = false;
      }
    });
  }

  triggerTouch(action, vibrateMs = 15) {
    this.justHandledTouch = true;
    setTimeout(() => { this.justHandledTouch = false; }, 350);
    if (navigator.vibrate) {
      try { navigator.vibrate(vibrateMs); } catch (_) {}
    }
    action();
  }

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

        this.cardStage.addEventListener('tiltChange', (event) => {
          const detail = event.detail;
          if (detail && detail.angle !== undefined) {
            this.cardStage.style.setProperty('--tilt-angle', `${detail.angle.toFixed(1)}deg`);
          }
        });

        this.cardStage.addEventListener('pointermove', (e) => {
          const rect = this.cardStage.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const rad = Math.atan2(e.clientY - cy, e.clientX - cx);
          const deg = (rad * (180 / Math.PI) + 360 + 90) % 360;
          this.cardStage.style.setProperty('--tilt-angle', `${deg.toFixed(1)}deg`);
        });
      } catch (_) {}
    }
  }

  reset3DTilt() {
    const card = this.getActiveCardElement();
    if (card) card.style.transform = '';
  }

  // ── Renderizado y Animaciones de la Arena ──────────────────────────────────

  renderActiveArenaCard(card, isAlreadyRevealed) {
    if (!card || !this.cardStage) return;

    this.cardStage.innerHTML = this.renderer.buildCardHTML(card, {
      isRevealed: isAlreadyRevealed,
      isFlipped: false
    }, this.state.cardFormat);

    if (this.hudCardCounter) {
      this.hudCardCounter.textContent = `${this.state.currentIndex + 1} / ${this.state.activeDeck.length}`;
    }

    this.updateRevealButtonState(isAlreadyRevealed);

    if (isAlreadyRevealed) {
      if (this.btnSubmitGuess) this.btnSubmitGuess.disabled = true;
      this.setFeedbackPill(`
        <span style="color:#64748b;display:inline-flex;align-items:center;gap:0.4rem;font-weight:600">
          <i data-lucide="check-circle-2"></i> Tazo ya resuelto &mdash; Año: <strong style="color:#0f172a;background:#f1f5f9;padding:0.05rem 0.35rem;border-radius:6px;border:1px solid #cbd5e1">${card.year}</strong> (Tiro no disponible)
        </span>
      `);
    } else {
      if (this.btnSubmitGuess) this.btnSubmitGuess.disabled = false;
      if (this.guessResultPill) this.guessResultPill.textContent = '';
    }

    // Actualizar brillo ambiental de color
    const theme = this.renderer.getCardTheme(card);
    const hue = theme.hue !== undefined ? theme.hue : 215;
    document.documentElement.style.setProperty('--current-card-glow', `hsl(${hue}, 90%, 60%)`);

    this.highlightActiveShelfChip(card.id);
    this.renderDeckPiles();
    this.refreshIcons();
  }

  renderDeckPiles() {
    if (!this.pileLeftCards || !this.pileRightCards) return;

    const N = 5;
    const currentIndex = this.state.currentIndex;
    const deck = this.state.activeDeck || [];
    const isDisc = this.state.cardFormat === CARD_FORMATS.DISC;

    // 1. Pila Izquierda (Cartas Anteriores / Descarte)
    const totalPast = currentIndex;
    const pastCards = [];
    const startPast = Math.max(0, currentIndex - N);
    for (let i = startPast; i < currentIndex; i++) {
      pastCards.push(deck[i]);
    }

    if (this.pileLeftCount) {
      this.pileLeftCount.textContent = totalPast;
    }
    if (this.pileLeft) {
      if (totalPast === 0) {
        this.pileLeft.classList.add('is-empty');
        this.pileLeft.setAttribute('aria-disabled', 'true');
        this.pileLeft.removeAttribute('title');
      } else {
        this.pileLeft.classList.remove('is-empty');
        this.pileLeft.removeAttribute('aria-disabled');
        const lastCard = pastCards[pastCards.length - 1];
        this.pileLeft.setAttribute('title', `Carta anterior: ${lastCard?.autor || 'Anterior'} (${totalPast} anteriores) [P / ←]`);
      }
    }

    this.pileLeftCards.className = `pile-cards-wrapper ${isDisc ? 'is-disc' : 'is-card'}`;
    if (pastCards.length === 0) {
      this.pileLeftCards.innerHTML = `
        <div class="pile-empty-slot">
          <i data-lucide="inbox"></i>
          <span>Inicio</span>
        </div>
      `;
    } else {
      this.pileLeftCards.innerHTML = this.buildPileCardsHTML(pastCards, false, isDisc);
    }

    // 2. Pila Derecha (Próximas Cartas / Robo)
    const totalUpcoming = Math.max(0, deck.length - 1 - currentIndex);
    const upcomingCards = [];
    const endUpcoming = Math.min(deck.length, currentIndex + 1 + N);
    for (let i = currentIndex + 1; i < endUpcoming; i++) {
      upcomingCards.push(deck[i]);
    }

    if (this.pileRightCount) {
      this.pileRightCount.textContent = totalUpcoming;
    }
    if (this.pileRight) {
      if (totalUpcoming === 0) {
        this.pileRight.classList.add('is-empty');
        this.pileRight.setAttribute('aria-disabled', 'true');
        this.pileRight.removeAttribute('title');
      } else {
        this.pileRight.classList.remove('is-empty');
        this.pileRight.removeAttribute('aria-disabled');
        const nextCard = upcomingCards[0];
        this.pileRight.setAttribute('title', `Siguiente carta: ${nextCard?.autor || 'Siguiente'} (${totalUpcoming} por jugar) [N / →]`);
      }
    }

    this.pileRightCards.className = `pile-cards-wrapper ${isDisc ? 'is-disc' : 'is-card'}`;
    if (upcomingCards.length === 0) {
      this.pileRightCards.innerHTML = `
        <div class="pile-empty-slot">
          <i data-lucide="check-circle-2"></i>
          <span>Final</span>
        </div>
      `;
    } else {
      // In upcoming cards, upcomingCards[0] is the very next card to draw, so it sits on top
      const upcomingOrdered = [...upcomingCards].reverse();
      this.pileRightCards.innerHTML = this.buildPileCardsHTML(upcomingOrdered, true, isDisc);
    }
  }

  buildPileCardsHTML(cards, isUpcoming, isDisc) {
    const M = cards.length;

    // Desfase físico escalonado pronunciado (Efecto Mazo Físico Apilado)
    const LEFT_OFFSETS = [
      { tx: -44, ty: 22, rot: -10.0, htx: -62, hty: 28, hrot: -15.0 },
      { tx: -33, ty: 16, rot: -7.5,  htx: -46, hty: 21, hrot: -11.0 },
      { tx: -22, ty: 11, rot: -5.0,  htx: -31, hty: 14, hrot: -7.5 },
      { tx: -11, ty: 5,  rot: -2.5,  htx: -15, hty: 7,  hrot: -3.5 },
      { tx: 0,   ty: 0,  rot: 0,     htx: 0,   hty: -10, hrot: 0 }
    ];

    const RIGHT_OFFSETS = [
      { tx: 44, ty: 22, rot: 10.0, htx: 62, hty: 28, hrot: 15.0 },
      { tx: 33, ty: 16, rot: 7.5,  htx: 46, hty: 21, hrot: 11.0 },
      { tx: 22, ty: 11, rot: 5.0,  htx: 31, hty: 14, hrot: 7.5 },
      { tx: 11, ty: 5,  rot: 2.5,  htx: 15, hty: 7,  hrot: 3.5 },
      { tx: 0,  ty: 0,  rot: 0,    htx: 0,  hty: -10, hrot: 0 }
    ];

    const DISC_OFFSETS = [
      { tx: 0, ty: 44, rot: -5.0, htx: 0, hty: 58, hrot: -8.0 },
      { tx: 0, ty: 33, rot: 4.0,  htx: 0, hty: 44, hrot: 6.0 },
      { tx: 0, ty: 22, rot: -3.0, htx: 0, hty: 29, hrot: -4.0 },
      { tx: 0, ty: 11, rot: 1.8,  htx: 0, hty: 14, hrot: 2.5 },
      { tx: 0, ty: 0,  rot: 0,    htx: 0, hty: -10, hrot: 0 }
    ];

    const offsetTable = isDisc ? DISC_OFFSETS : (isUpcoming ? RIGHT_OFFSETS : LEFT_OFFSETS);

    return cards.map((card, r) => {
      const slot = 5 - M + r;
      const tf = offsetTable[slot] || offsetTable[r] || offsetTable[4];
      const z = (r + 1) * 3;
      const theme = this.renderer.getCardTheme(card);
      const cardColor = theme.bg || theme.accent || '#0284c7';
      const cssVars = `--tx: ${tf.tx}px; --ty: ${tf.ty}px; --rot: ${tf.rot}deg; --z: ${z}px; --htx: ${tf.htx}px; --hty: ${tf.hty}px; --hrot: ${tf.hrot}deg; --tazo-color: ${theme.bg || cardColor}; --card-bg: ${cardColor}; --disc-accent: ${theme.accent || cardColor}; z-index: ${r + 1};`;
      const isTop = (r === M - 1);

      if (!isTop) {
        const bg = isDisc ? '' : (theme.bgGradient || theme.bg || '#1e293b');
        return `
          <div class="pile-card pile-card-under ${isDisc ? 'deck-stack-disc' : ''}" style="${cssVars} ${bg ? `background: ${bg};` : ''}">
            <div class="pile-card-under-edge"></div>
            ${isDisc ? '<div class="pile-tazoback-rim"></div>' : '<div class="pile-under-deck-line"></div>'}
            ${!isDisc ? `<div class="pile-under-tag">${card.domain ? card.domain.substring(0, 8) : ''}</div>` : ''}
          </div>
        `;
      }

      // Tarjeta Superior (Top Card)
      if (isUpcoming) {
        // Reverso de mazo (Facedown)
        if (isDisc) {
          return `
            <div class="pile-card pile-card-top pile-card-tazoback deck-stack-disc" style="${cssVars}">
              <div class="pile-tazoback-rim"></div>
              <div class="pile-tazoback-core">
                <i data-lucide="disc" class="pile-tazo-icon" style="color: #ffffff; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.6));"></i>
                <span class="pile-tazo-text">HIT-TAZO</span>
              </div>
            </div>
          `;
        } else {
          return `
            <div class="pile-card pile-card-top pile-card-deckback" style="${cssVars}">
              <div class="pile-deckback-inner">
                <div class="pile-deckback-border">
                  <i data-lucide="layers" class="pile-deckback-icon"></i>
                  <span class="pile-deckback-text">HIT-CARDS</span>
                </div>
              </div>
            </div>
          `;
        }
      } else {
        // Carta anterior (Faceup mini con autor y detalles)
        const isRevealed = this.state.revealedCards.has(card.id);
        if (isDisc) {
          return `
            <div class="pile-card pile-card-top pile-card-tazofaceup deck-stack-disc" style="${cssVars}">
              <div class="pile-tazoback-rim"></div>
              <div class="pile-tazofaceup-core">
                <span class="pile-tazofaceup-author">${card.autor || ''}</span>
                ${isRevealed ? `<span class="pile-tazo-year" style="color: ${cardColor};">${card.year}</span>` : `<span class="pile-tazo-id">${card.id}</span>`}
              </div>
            </div>
          `;
        } else {
          const cardBg = theme.bgGradient || theme.bg || '#38bdf8';
          return `
            <div class="pile-card pile-card-top pile-card-faceup" style="${cssVars} background: ${cardBg};">
              <div class="pile-faceup-inner">
                <div class="pile-faceup-top">
                  <span class="pile-faceup-domain">${card.domain ? card.domain.substring(0, 14) : 'TECH'}</span>
                  <span class="pile-faceup-id">${card.id ? card.id.replace('vol', 'v') : ''}</span>
                </div>
                <div class="pile-faceup-author">${card.autor || ''}</div>
                <div class="pile-faceup-footer">
                  ${isRevealed ? `<span class="pile-faceup-year">${card.year}</span>` : `<i data-lucide="clock" class="pile-clock-icon"></i>`}
                </div>
              </div>
            </div>
          `;
        }
      }
    }).join('');
  }

  renderAttemptTracker(remaining, isSolved) {
    if (this.hudAttempts) {
      this.hudAttempts.textContent = isSolved ? '0' : remaining;
    }
    if (this.attemptDots) {
      const pips = Array.from({ length: GAME_RULES.MAX_ATTEMPTS }, (_, i) => {
        const isAvailable = i < remaining && !isSolved;
        const isCritical = isAvailable && remaining === 1;
        const cls = isAvailable ? (isCritical ? 'attempt-pip critical' : 'attempt-pip') : 'attempt-pip used';
        return `<span class="${cls}" title="${isAvailable ? 'Tiro disponible' : 'Tiro no disponible'}"></span>`;
      }).join('');
      this.attemptDots.innerHTML = pips;
    }

    if (this.attemptTracker) {
      const isCards = this.state.cardFormat === CARD_FORMATS.CARD;
      const itemNoun = isCards ? 'Tarjeta' : 'Tazo';
      const titleText = isSolved 
        ? `${itemNoun} ya resuelto — tiros agotados` 
        : `${remaining} de ${GAME_RULES.MAX_ATTEMPTS} tiros disponibles`;
      this.attemptTracker.setAttribute('title', titleText);
      this.attemptTracker.setAttribute('aria-label', titleText);
    }
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

  updateFormatToggleUI(format = this.state.cardFormat) {
    if (!this.btnFormatToggle) return;
    const isCard = format === CARD_FORMATS.CARD;
    const titleText = isCard ? 'Cambiar a vista de Tazo 3D [T]' : 'Cambiar a vista de Tarjeta cuadrada [T]';
    this.btnFormatToggle.setAttribute('title', titleText);
    this.btnFormatToggle.setAttribute('aria-label', titleText);

    if (this.iconFormatState) {
      this.iconFormatState.setAttribute('data-lucide', isCard ? 'disc' : 'square');
      this.refreshIcons();
    }
  }

  // ── Lógica de Tiro y Revelado ──────────────────────────────────────────────

  handleGuessSubmission() {
    if (this.state.cardSolved) return;
    const card = this.state.getCurrentCard();
    if (!card) return;

    const val = parseInt(this.chronoDial ? this.chronoDial.value : (this.displaySelectedYear?.textContent || '1990'), 10);
    if (isNaN(val)) return;

    const nextAttempt = this.state.attemptCount + 1;
    const evalResult = evaluateGuess(val, card.year, nextAttempt);

    // Animación física de impacto y giro
    const shouldFlip = evalResult.wonCard || evalResult.outcome === 'EXHAUSTED';
    this.slamDisc(evalResult.wonCard, shouldFlip);
    this.state.applyGuessEvaluation(evalResult, card);
  }

  toggleActiveCardYear() {
    const disc = this.getActiveCardElement();
    if (!disc) return;

    if (!disc.classList.contains('is-flipped')) {
      this.flipCard(this.cardStage);
    }

    const yearStage = this.getYearStageElement(disc);
    if (!yearStage) return;

    const isHidden = yearStage.classList.contains('is-hidden');
    if (isHidden) {
      if (!this.state.cardSolved) {
        if (this.state.score < GAME_RULES.MIN_REVEAL_SCORE) {
          this.setFeedbackPill(`
            <span style="color:#f59e0b;display:inline-flex;align-items:center;gap:0.4rem;font-weight:600">
              <i data-lucide="alert-triangle"></i> Puntos insuficientes: necesitas al menos 5 pts para revelar el año
            </span>
          `);
          this.audio.play('slam');
          return;
        }

        this.state.revealYearWithPenalty();
        this.audio.play('slam');
      } else {
        this.audio.play('hit');
      }

      yearStage.classList.remove('is-hidden');
      yearStage.classList.add('is-revealed');
      this.updateRevealButtonState(true);
    } else {
      yearStage.classList.remove('is-revealed');
      yearStage.classList.add('is-hidden');
      this.updateRevealButtonState(false);
      this.audio.play('flip');
    }
    this.refreshIcons();
  }

  revealActiveCardYear() {
    const disc = this.getActiveCardElement();
    if (!disc) return;

    if (!disc.classList.contains('is-flipped')) {
      this.flipCard(this.cardStage);
    }

    const yearStage = this.getYearStageElement(disc);
    if (yearStage && yearStage.classList.contains('is-hidden')) {
      yearStage.classList.remove('is-hidden');
      yearStage.classList.add('is-revealed');
      this.updateRevealButtonState(true);
      this.refreshIcons();
    }
  }

  flipCard(containerEl) {
    const disc = this.getActiveCardElement(containerEl);
    if (!disc) return;

    const isFlipped = disc.classList.contains('is-flipped');
    const targetRot = isFlipped ? 0 : 180;

    if (typeof disc.animate === 'function') {
      const flipAnim = disc.animate([
        { transform: `scale(1) rotateY(${isFlipped ? 180 : 0}deg) rotateZ(0deg)` },
        { transform: `scale(1.14) translateY(-22px) rotateY(90deg) rotateZ(${isFlipped ? -12 : 12}deg)`, offset: 0.5 },
        { transform: `scale(1) translateY(0) rotateY(${targetRot}deg) rotateZ(0deg)` }
      ], {
        duration: ANIM_CONFIG.FLIP_DURATION,
        easing: ANIM_CONFIG.EASE_ELASTIC
      });
      flipAnim.onfinish = () => {
        disc.style.transform = `rotateY(${targetRot}deg)`;
      };
    } else {
      disc.style.transform = `rotateY(${targetRot}deg)`;
    }

    if (isFlipped) disc.classList.remove('is-flipped');
    else disc.classList.add('is-flipped');
  }

  flipCurrentCard() {
    if (this.cardStage) {
      this.flipCard(this.cardStage);
      this.reset3DTilt();
      this.audio.play('flip');
    }
  }

  slamDisc(isSuccess, shouldFlip = true) {
    const disc = this.getActiveCardElement();
    if (!disc) return;

    if (shouldFlip) {
      if (typeof disc.animate === 'function') {
        const anim = disc.animate([
          { transform: 'scale(1) rotateY(0deg) rotateZ(0deg)' },
          { transform: 'scale(1.22) translateY(-38px) rotateY(180deg) rotateZ(16deg)', offset: 0.38 },
          { transform: 'scale(0.94) translateY(8px) rotateY(180deg) rotateZ(-7deg)', offset: 0.68 },
          { transform: 'scale(1.03) translateY(-3px) rotateY(180deg) rotateZ(3deg)', offset: 0.85 },
          { transform: 'scale(1) translateY(0) rotateY(180deg) rotateZ(0deg)' }
        ], {
          duration: ANIM_CONFIG.SLAM_SUCCESS_DURATION,
          easing: ANIM_CONFIG.EASE_SPIN
        });
        anim.onfinish = () => {
          disc.style.transform = 'rotateY(180deg)';
        };
      } else {
        disc.style.transform = 'rotateY(180deg)';
      }
      disc.classList.add('is-flipped');
    } else {
      // Tiro fallido con intentos restantes: impacto elástico en mesa sin voltear cara
      if (typeof disc.animate === 'function') {
        disc.animate([
          { transform: 'scale(1) rotateZ(0deg)' },
          { transform: 'scale(1.06) translateY(-12px) rotateZ(-5deg)', offset: 0.3 },
          { transform: 'scale(0.96) translateY(4px) rotateZ(3deg)', offset: 0.65 },
          { transform: 'scale(1) translateY(0) rotateZ(0deg)' }
        ], {
          duration: 380,
          easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        });
      }
    }

    this.audio.play(isSuccess ? 'hit' : 'slam');
  }

  slamTazo(isSuccess, shouldFlip = true) {
    return this.slamDisc(isSuccess, shouldFlip);
  }

  // ── Transición Animada entre Tarjetas (Slide WAAPI + Rebote Elástico) ──────

  transitionToCard(targetIndex, direction = 'next') {
    if (this.isTransitioning) return;
    const currentDisc = this.getActiveCardElement();

    const exitX = direction === 'next' ? -260 : 260;
    const enterX = direction === 'next' ? 260 : -260;
    const exitRot = direction === 'next' ? -24 : 24;
    const enterRot = direction === 'next' ? 24 : -24;

    this.audio.play('flip');

    if (currentDisc && typeof currentDisc.animate === 'function') {
      this.isTransitioning = true;
      // 1. Animación de salida: el elemento actual sale de la mesa con desvanecimiento y rotación
      const exitAnim = currentDisc.animate([
        { transform: 'translateX(0) scale(1) rotateZ(0deg)', opacity: 1 },
        { transform: `translateX(${exitX}px) scale(0.85) rotateZ(${exitRot}deg)`, opacity: 0 }
      ], {
        duration: ANIM_CONFIG.SLIDE_EXIT_DURATION,
        easing: ANIM_CONFIG.EASE_EXIT,
        fill: 'forwards'
      });

      exitAnim.onfinish = () => {
        this.state.goToIndex(targetIndex);

        const newDisc = this.getActiveCardElement();
        if (newDisc && typeof newDisc.animate === 'function') {
          // 2. Animación de entrada: el nuevo elemento entra resbalando con rebote elástico
          const enterAnim = newDisc.animate([
            { transform: `translateX(${enterX}px) scale(0.85) rotateZ(${enterRot}deg)`, opacity: 0 },
            { transform: 'translateX(0) scale(1) rotateZ(0deg)', opacity: 1 }
          ], {
            duration: ANIM_CONFIG.SLIDE_ENTER_DURATION,
            easing: ANIM_CONFIG.EASE_ELASTIC
          });
          enterAnim.onfinish = () => {
            newDisc.style.transform = '';
            newDisc.style.opacity = '';
            this.isTransitioning = false;
          };
        } else {
          this.isTransitioning = false;
        }
      };
    } else {
      this.state.goToIndex(targetIndex);
    }
  }

  nextCard() {
    if (!this.state.activeDeck.length) return;
    const nextIdx = (this.state.currentIndex + 1) % this.state.activeDeck.length;
    this.transitionToCard(nextIdx, 'next');
  }

  prevCard() {
    if (!this.state.activeDeck.length) return;
    const prevIdx = (this.state.currentIndex - 1 + this.state.activeDeck.length) % this.state.activeDeck.length;
    this.transitionToCard(prevIdx, 'prev');
  }

  shuffleCurrentDeck() {
    const currentDisc = this.getActiveCardElement();

    this.audio.play('slam');

    if (currentDisc && typeof currentDisc.animate === 'function') {
      currentDisc.animate([
        { transform: 'scale(1) rotateZ(0deg)' },
        { transform: 'scale(0.8) rotateZ(180deg)', offset: 0.5 },
        { transform: 'scale(1.05) rotateZ(360deg)', offset: 0.8 },
        { transform: 'scale(1) rotateZ(360deg)' }
      ], {
        duration: ANIM_CONFIG.SPIN_DURATION,
        easing: ANIM_CONFIG.EASE_SPIN
      });
    }

    setTimeout(() => {
      this.state.shuffleDeck();
      const newDisc = this.getActiveCardElement();
      if (newDisc && typeof newDisc.animate === 'function') {
        newDisc.animate([
          { transform: 'scale(0.85) rotateZ(180deg)', opacity: 0.5 },
          { transform: 'scale(1) rotateZ(360deg)', opacity: 1 }
        ], {
          duration: ANIM_CONFIG.SPIN_SETTLE_DURATION,
          easing: ANIM_CONFIG.EASE_ELASTIC
        });
      }
    }, 180);
  }

  nudgeYear(delta) {
    if (!this.chronoDial) return;
    const cur = parseInt(this.chronoDial.value, 10) || CHRONO_BOUNDS.DEFAULT_YEAR;
    const nextVal = Math.max(CHRONO_BOUNDS.MIN_YEAR, Math.min(CHRONO_BOUNDS.MAX_YEAR, cur + delta));
    this.chronoDial.value = nextVal;
    if (this.displaySelectedYear) this.displaySelectedYear.textContent = nextVal;
    this.audio.play('tick');
  }

  // ── Renderizado del Estante y Línea de Tiempo ─────────────────────────────

  renderShelf(shelf, isVictory) {
    if (!this.shelfCardsContainer) return;
    this.shelfCardsContainer.innerHTML = '';
    const currentCard = this.state.getCurrentCard();

    shelf.forEach(c => {
      const chip = document.createElement('div');
      const theme = this.renderer.getCardTheme(c);
      const isSelected = currentCard && currentCard.id === c.id;
      chip.className = `shelf-disc-chip shelf-tazo-chip ${isSelected ? 'active' : ''}`;
      chip.style.setProperty('--disc-color', theme.bg);
      chip.style.setProperty('--tazo-color', theme.bg);
      chip.setAttribute('data-card-id', c.id);
      const chipNum = formatCardIdNumber(c.id);
      chip.title = `${c.year} — ${c.autor || ''} (Toca para ver Tazo)`;
      chip.setAttribute('role', 'button');
      chip.setAttribute('tabindex', '0');
      chip.setAttribute('aria-label', `Ver Tazo del año ${c.year}: ${c.autor || ''}`);
      chip.innerHTML = `
        <div class="shelf-disc-year shelf-tazo-year">${c.year}</div>
        <div class="shelf-disc-id shelf-tazo-id">${chipNum}</div>
      `;
      this.shelfCardsContainer.appendChild(chip);
    });

    if (this.shelfProgressFill) {
      const pct = Math.min(100, (shelf.length / GAME_RULES.VICTORY_SHELF_SIZE) * 100);
      this.shelfProgressFill.style.width = `${pct}%`;
    }

    if (this.shelfCounter) {
      if (isVictory) {
        this.shelfCounter.innerHTML = `<strong style="color: #4ade80; display: inline-flex; align-items: center; gap: 0.35rem;"><i data-lucide="trophy"></i> ¡Línea de Tiempo Completada! Victoria</strong>`;
        this.triggerCyberConfetti('#facc15');
      } else {
        const itemNoun = this.state.cardFormat === CARD_FORMATS.CARD ? 'cartas' : 'tazos';
        this.shelfCounter.textContent = `${shelf.length} / ${GAME_RULES.VICTORY_SHELF_SIZE} ${itemNoun} para ganar`;
      }
    }
    this.refreshIcons();
  }

  highlightActiveShelfChip(cardId) {
    if (!this.shelfCardsContainer) return;
    const chips = this.shelfCardsContainer.querySelectorAll('.shelf-disc-chip, .shelf-tazo-chip');
    chips.forEach(chip => {
      if (chip.getAttribute('data-card-id') === cardId) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  displayWonCardById(cardId) {
    let idx = this.state.activeDeck.findIndex(c => c.id === cardId);
    if (idx === -1) {
      const cardObj = this.cards.find(c => c.id === cardId);
      if (cardObj) {
        if (cardObj.volumen && this.catalog?.volumes?.[cardObj.volumen]) {
          this.selectActiveGroup(cardObj.volumen);
        } else {
          this.selectActiveGroup('ALL');
        }
        idx = this.state.activeDeck.findIndex(c => c.id === cardId);
      }
    }

    if (this.currentView !== 'play') {
      this.switchView('play');
    }

    if (idx !== -1) {
      this.transitionToCard(idx, idx >= this.state.currentIndex ? 'next' : 'prev');
    } else {
      this.audio.play('flip');
    }
    if (window.innerWidth <= 768 && this.cardStage) {
      this.cardStage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // ── Navegación y Vistas ───────────────────────────────────────────────────

  switchView(view) {
    this.currentView = view;
    const ribbonWrapper = document.querySelector('.ribbon-wrapper');
    if (view === 'play') {
      if (ribbonWrapper) ribbonWrapper.style.display = '';
      this.viewPlay?.classList.add('active');
      this.viewGallery?.classList.remove('active');
      this.btnTabPlay?.classList.add('active');
      this.btnTabPlay?.setAttribute('aria-selected', 'true');
      this.btnTabGallery?.classList.remove('active');
      this.btnTabGallery?.setAttribute('aria-selected', 'false');
    } else {
      if (ribbonWrapper) ribbonWrapper.style.display = 'none';
      this.viewPlay?.classList.remove('active');
      this.viewGallery?.classList.add('active');
      this.btnTabPlay?.classList.remove('active');
      this.btnTabPlay?.setAttribute('aria-selected', 'false');
      this.btnTabGallery?.classList.add('active');
      this.btnTabGallery?.setAttribute('aria-selected', 'true');
      this.filterCatalog();
    }
    this.audio.play('tick');
    this.refreshIcons();
  }

  selectActiveGroup(groupSlug) {
    this.state.activeGroup = groupSlug;
    if (this.hudGroupLabel) {
      if (groupSlug === 'ALL') {
        this.hudGroupLabel.textContent = 'Mazo Maestro Completo';
      } else {
        const volTitle = this.catalog?.volumes?.[groupSlug]?.title || groupSlug;
        this.hudGroupLabel.textContent = volTitle;
      }
    }

    let nextDeck = groupSlug === 'ALL'
      ? [...this.cards]
      : this.cards.filter(c => c.volumen === groupSlug);

    const currentDisc = this.getActiveCardElement();

    this.audio.play('flip');

    if (currentDisc && typeof currentDisc.animate === 'function') {
      const exitAnim = currentDisc.animate([
        { transform: 'scale(1) rotateY(0deg)', opacity: 1 },
        { transform: 'scale(0.8) rotateY(90deg)', opacity: 0 }
      ], {
        duration: 160,
        easing: 'ease-in'
      });
      exitAnim.onfinish = () => {
        this.state.setActiveDeck(nextDeck, true, true);
        const newDisc = this.getActiveCardElement();
        if (newDisc && typeof newDisc.animate === 'function') {
          newDisc.animate([
            { transform: 'scale(0.8) rotateY(-90deg)', opacity: 0 },
            { transform: 'scale(1) rotateY(0deg)', opacity: 1 }
          ], {
            duration: 260,
            easing: ANIM_CONFIG.EASE_ELASTIC
          });
        }
      };
    } else {
      this.state.setActiveDeck(nextDeck, true, true);
    }
  }

  // ── Catálogo, Búsqueda y Filtros ──────────────────────────────────────────

  setupSearchIndex() {
    if (typeof Fuse === 'function' && this.cards.length) {
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
    const q = this.galleryQuery ? this.galleryQuery.value.trim() : '';
    const grp = this.selectFilterGroup ? this.selectFilterGroup.value : 'ALL';
    const sort = this.selectSortOrder ? this.selectSortOrder.value : 'DEFAULT';

    let results = q && this.fuse ? this.fuse.search(q).map(res => res.item) : [...this.cards];

    if (grp !== 'ALL') {
      results = results.filter(c => c.volumen === grp);
    }

    if (sort === 'YEAR_ASC') results.sort((a, b) => a.year - b.year);
    else if (sort === 'YEAR_DESC') results.sort((a, b) => b.year - a.year);
    else if (sort === 'AUTHOR_ASC') results.sort((a, b) => (a.autor || '').localeCompare(b.autor || ''));

    this.filteredCatalog = results;
    this.renderCatalog();
  }

  setGalleryLayout(layout) {
    this.galleryLayout = layout;
    if (layout === 'fan') {
      this.btnGalleryViewFan?.classList.add('active');
      this.btnGalleryViewGrid?.classList.remove('active');
      if (this.galleryFanSection) this.galleryFanSection.style.display = 'flex';
      if (this.catalogGrid) this.catalogGrid.style.display = 'none';
    } else {
      this.btnGalleryViewFan?.classList.remove('active');
      this.btnGalleryViewGrid?.classList.add('active');
      if (this.galleryFanSection) this.galleryFanSection.style.display = 'none';
      if (this.catalogGrid) this.catalogGrid.style.display = 'grid';
    }
    this.audio.play('tick');
    this.renderCatalog();
  }

  setFanColorMode(mode) {
    this.fanColorMode = mode;
    [this.btnModeGradient, this.btnModeSolid, this.btnModeHybrid].forEach(b => {
      if (!b) return;
      if (b.getAttribute('data-mode') === mode) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
    this.audio.play('tick');
    this.renderFanningTrack(this.filteredCatalog);
  }

  renderCantoBar(cards) {
    if (!this.cantoBar) return;
    this.cantoBar.innerHTML = '';
    if (this.cantoCount) this.cantoCount.textContent = cards.length;

    const frag = document.createDocumentFragment();
    cards.forEach(card => {
      const theme = this.renderer.getCardTheme(card);
      const slice = document.createElement('div');
      slice.className = 'canto-slice';
      slice.style.backgroundColor = theme.topHex || theme.bgHex || theme.bg;
      const hexPart = card.id ? card.id.split('-')[1] : '';
      slice.title = `#${hexPart} | ${card.year} — ${card.autor || ''}`;
      slice.setAttribute('role', 'button');
      slice.setAttribute('tabindex', '0');
      slice.setAttribute('aria-label', `Ir a tarjeta ${card.year}: ${card.autor || ''}`);

      const scrollToTarget = () => {
        const cardEl = this.fanningTrack?.querySelector(`[data-card-id="${card.id}"]`);
        if (cardEl && this.fanningScrollWrapper) {
          const leftPos = cardEl.offsetLeft - (this.fanningScrollWrapper.clientWidth / 2) + (cardEl.clientWidth / 2);
          this.fanningScrollWrapper.scrollTo({ left: Math.max(0, leftPos), behavior: 'smooth' });
          cardEl.focus();
        }
      };

      slice.addEventListener('click', scrollToTarget);
      slice.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          scrollToTarget();
        }
      });

      frag.appendChild(slice);
    });
    this.cantoBar.appendChild(frag);
  }

  renderFanningTrack(cards) {
    if (!this.fanningTrack) return;
    this.fanningTrack.innerHTML = '';
    const frag = document.createDocumentFragment();

    cards.forEach((card, idx) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = this.renderer.buildFanCardHTML(card, {
        mode: this.fanColorMode,
        zIndex: idx + 1
      });
      if (tmp.firstElementChild) {
        frag.appendChild(tmp.firstElementChild);
      }
    });

    this.fanningTrack.appendChild(frag);
    this.refreshIcons();
  }

  renderCatalog() {
    if (this.galleryLayout === 'fan') {
      this.renderCantoBar(this.filteredCatalog);
      this.renderFanningTrack(this.filteredCatalog);
    } else {
      if (!this.catalogGrid) return;
      this.catalogGrid.innerHTML = '';
      const slice = this.filteredCatalog.slice(0, 100);

      slice.forEach(card => {
        const cell = document.createElement('div');
        cell.className = 'catalog-card-cell';
        cell.innerHTML = this.renderer.buildCardHTML(card, {
          showYear: true,
          hideRevealButton: true,
          isFlipped: false,
          id: ''
        }, this.state.cardFormat);
        this.catalogGrid.appendChild(cell);
      });

      this.refreshIcons();
    }
  }



  // ── Carga de Datos y Persistencia ─────────────────────────────────────────

  async fetchFirst(urls) {
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (res.ok) return await res.json();
      } catch (_) {}
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

      if (!cards) throw new Error('No se pudo cargar data/cards.json');

      this.cards = cards;
      this.cards.forEach((c, idx) => { c.globalIndex = idx + 1; });

      if (catalogData) {
        this.catalog = catalogData;
        this.renderer.setCatalog(catalogData);
      }
      if (colorsData) {
        this.cardColors = colorsData.cards || colorsData;
        this.renderer.setCardColors(this.cardColors);
      }
      if (manifestData) {
        this.manifest = manifestData;
        this.updatePrintPdfLinks(manifestData);
      }

      if (this.counterTotal) this.counterTotal.textContent = this.cards.length;

      this.state.setActiveDeck(this.cards, true, true);
      this.filteredCatalog = [...this.cards];
      this.setupSearchIndex();
      this.renderCatalog();
      this.refreshIcons();
    } catch (err) {
      console.error('Error cargando datos:', err);
    }
  }

  updatePrintPdfLinks(manifest) {
    if (!manifest) return;
    const volumesGrid = document.getElementById('official-pdf-volumes-grid');
    if (!volumesGrid) return;

    volumesGrid.innerHTML = '';

    const volumes = manifest.volumes || [];
    volumes.forEach(vol => {
      const card = document.createElement('a');
      card.className = 'pdf-compact-row';
      const filename = vol.pdfFilename || `hit-tazos-tech-${vol.id}-${vol.slug}.pdf`;
      const url = `assets/print/${filename}`;
      card.setAttribute('href', url);
      card.setAttribute('download', filename);

      card.innerHTML = `
        <div class="pdf-row-info">
          <div class="pdf-row-header">
            <span class="pdf-vol-pill">${vol.id.toUpperCase()}</span>
            <span class="pdf-specs-text">${vol.cardsCount} cartas &bull; ${vol.pagesCarta} págs dúplex</span>
          </div>
          <div class="pdf-row-title">${vol.title}</div>
        </div>
        <div class="pdf-row-action" title="Descargar PDF imprimible">
          <i data-lucide="download"></i>
        </div>
      `;
      volumesGrid.appendChild(card);
    });

    this.refreshIcons();
  }

  // ── Gestión de Versiones de Juego (Hit-Tazo vs Hit-Cards) ─────────────────

  openVersionModal() {
    if (!this.versionDialog) return;
    this.updateVersionModalOptions();
    if (typeof this.versionDialog.showModal === 'function') {
      this.versionDialog.showModal();
      this.refreshIcons();
    }
  }

  closeVersionModal() {
    if (this.versionDialog?.open) {
      this.versionDialog.close();
    }
  }

  openHelpModal() {
    if (!this.helpDialog) return;
    if (typeof this.helpDialog.showModal === 'function') {
      this.helpDialog.showModal();
      this.refreshIcons();
    }
  }

  selectGameVersion(versionId) {
    const isCards = versionId === 'cards' || versionId === CARD_FORMATS.CARD;
    const targetFormat = isCards ? CARD_FORMATS.CARD : CARD_FORMATS.DISC;
    const versionObj = isCards ? GAME_VERSIONS.CARDS : GAME_VERSIONS.TAZO;

    const isFirstTime = Boolean(this.isFirstTimeOnboarding);
    this.isFirstTimeOnboarding = false;

    this.state.setFormat(targetFormat);
    this.storage.set(STORAGE_KEYS.FORMAT, targetFormat);
    this.storage.set(STORAGE_KEYS.VERSION_CHOSEN, true);

    this.applyVersionUI(versionObj);
    this.audio.play(isCards ? 'tick' : 'slam');

    this.closeVersionModal();
    if (isFirstTime) {
      setTimeout(() => {
        this.openHelpModal();
      }, 280);
    }
  }

  updateVersionModalOptions() {
    const isCards = this.state.cardFormat === CARD_FORMATS.CARD;
    if (this.optionSelectTazo) {
      this.optionSelectTazo.classList.toggle('active-version', !isCards);
    }
    if (this.optionSelectCards) {
      this.optionSelectCards.classList.toggle('active-version', isCards);
    }
    if (this.badgeStatusTazo) {
      this.badgeStatusTazo.textContent = !isCards ? '✓ Versión Activa' : 'Dial 3D';
    }
    if (this.badgeStatusCards) {
      this.badgeStatusCards.textContent = isCards ? '✓ Versión Activa' : 'Clean Table';
    }
  }

  applyVersionUI(version = GAME_VERSIONS.TAZO) {
    const isCards = version.id === 'cards';
    const itemNoun = isCards ? 'cartas' : 'tazos';
    const itemNounSingular = isCards ? 'tarjeta' : 'tazo';

    if (this.brandTitleText) {
      this.brandTitleText.textContent = version.name;
    }
    if (this.brandIconGlyph) {
      this.brandIconGlyph.setAttribute('data-lucide', version.icon);
    }
    if (this.btnBrandVersion) {
      if (isCards) {
        this.btnBrandVersion.classList.add('version-cards');
      } else {
        this.btnBrandVersion.classList.remove('version-cards');
      }
    }
    if (this.attemptTracker) {
      this.attemptTracker.title = `Tiros disponibles (3 por ${itemNounSingular})`;
    }
    if (this.cardStage) {
      this.cardStage.title = `Toca o pulsa Espacio para voltear el ${isCards ? 'Naipe' : 'Tazo'}`;
    }
    if (this.shelfCounter) {
      const currentShelf = this.state.playerShelf || [];
      const isVictory = currentShelf.length >= GAME_RULES.VICTORY_SHELF_SIZE;
      if (!isVictory) {
        this.shelfCounter.textContent = `${currentShelf.length} / ${GAME_RULES.VICTORY_SHELF_SIZE} ${itemNoun} para ganar`;
      }
    }
    if (this.helpCardTerm) {
      this.helpCardTerm.textContent = isCards ? 'de la tarjeta' : 'del tazo';
    }
    if (this.helpTargetTerm) {
      this.helpTargetTerm.textContent = `${GAME_RULES.VICTORY_SHELF_SIZE} ${itemNoun}`;
    }
    if (this.helpNavTerm) {
      this.helpNavTerm.textContent = `Cambiar ${itemNounSingular}`;
    }
    document.title = `${version.title} — Trivia Cronológica Open Source (576 Tarjetas)`;
    this.updateVersionModalOptions();
    this.refreshIcons();
  }

  async loadSavedState() {
    const savedShelf = await this.storage.get(STORAGE_KEYS.SHELF, [], StorageAdapter.validateShelf);
    const savedScore = await this.storage.get(STORAGE_KEYS.SCORE, 0, StorageAdapter.validateScore);
    const savedStreak = await this.storage.get(STORAGE_KEYS.STREAK, 0, StorageAdapter.validateStreak);
    const savedRevealed = await this.storage.get(STORAGE_KEYS.REVEALED, [], StorageAdapter.validateRevealed);
    const savedFormat = await this.storage.get(STORAGE_KEYS.FORMAT, null);
    const versionChosen = await this.storage.get(STORAGE_KEYS.VERSION_CHOSEN, false);

    const activeFormat = savedFormat || CARD_FORMATS.DISC;

    this.state.hydrate({
      score: savedScore,
      streak: savedStreak,
      shelf: savedShelf,
      revealed: savedRevealed,
      format: activeFormat
    });

    this.applyVersionUI(activeFormat === CARD_FORMATS.CARD ? GAME_VERSIONS.CARDS : GAME_VERSIONS.TAZO);

    // Al cargar por primera vez la página, debe preguntar qué versión desea
    if (!versionChosen && !savedFormat) {
      this.isFirstTimeOnboarding = true;
      setTimeout(() => this.openVersionModal(), 300);
    } else {
      this.isFirstTimeOnboarding = false;
    }
  }

  async persistGameState() {
    const serialized = this.state.serialize();
    await this.storage.set(STORAGE_KEYS.SHELF, serialized.shelf);
    await this.storage.set(STORAGE_KEYS.SCORE, serialized.score);
    await this.storage.set(STORAGE_KEYS.STREAK, serialized.streak);
    await this.storage.set(STORAGE_KEYS.REVEALED, serialized.revealed);
  }

  async confirmResetGame() {
    const confirmed = window.confirm(
      '¿Deseas reiniciar la partida?\n\nSe restablecerán tus puntos, racha, tazos ganados y tarjetas resueltas.'
    );
    if (!confirmed) return;
    await this.storage.clearAllGameState();
    this.state.resetGame();
  }

  triggerCyberConfetti(accentColor = '#38bdf8') {
    if (typeof confetti === 'function') {
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: [accentColor, '#facc15', '#f472b6', '#34d399', '#ffffff']
        });
      } catch (_) {}
    }
  }

  refreshIcons() {
    if (this.pendingIconRefresh) return;
    this.pendingIconRefresh = true;
    requestAnimationFrame(() => {
      this.pendingIconRefresh = false;
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    });
  }
}

// Inicialización automática de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  window.app = new HitTazosApp();
});
