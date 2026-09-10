// Hit-Tazos Tech — Modular Card & Disc Renderer (Single Responsibility Principle)
import { DOMAIN_PALETTES, DEFAULT_PALETTE, CARD_FORMATS } from './constants.js';

export class CardRenderer {
  constructor(catalog = null, cardColors = null) {
    this.catalog = catalog;
    this.cardColors = cardColors;
  }

  setCatalog(catalog) {
    this.catalog = catalog;
  }

  setCardColors(cardColors) {
    this.cardColors = cardColors;
  }

  formatMarkdown(text) {
    if (!text) return '';
    if (typeof snarkdown === 'function') {
      return snarkdown(text);
    }
    // Fallback nativo
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  getDiscPalette(card) {
    if (!card || !card.domain) return DEFAULT_PALETTE;
    return DOMAIN_PALETTES[card.domain] || DEFAULT_PALETTE;
  }

  getCardTheme(card) {
    let cardNum = card.globalIndex !== undefined ? card.globalIndex : (card.index !== undefined ? card.index + 1 : 1);
    if (!cardNum || isNaN(cardNum)) cardNum = 1;

    if (this.cardColors && (this.cardColors[cardNum] || (this.cardColors.cards && this.cardColors.cards[cardNum]))) {
      const c = this.cardColors[cardNum] || this.cardColors.cards[cardNum];
      const topHex = c.top_hex || c.bg_hex;
      const botHex = c.bottom_hex || c.bg_hex;
      const bgGrad = c.bg_gradient || `linear-gradient(180deg, ${topHex} 0%, ${botHex} 100%)`;
      return {
        hue: c.h,
        bg: c.bg_hsl,
        bgHex: c.bg_hex,
        topHex: topHex,
        bottomHex: botHex,
        bgGradient: bgGrad,
        frontBg: c.front_bg_hsl,
        text: c.text_color || '#111111',
        subText: c.text_color === '#ffffff' ? 'rgba(255, 255, 255, 0.75)' : 'rgba(17, 17, 17, 0.75)',
        accent: c.accent_hex
      };
    }

    // Bloques tonales de 10 en 10 (fallback)
    const blockIndex = Math.floor(((cardNum - 1) % 100) / 10);
    const subStep = ((cardNum - 1) % 10) / 9;

    const paletteBlocks = [
      { h1: 25, h2: 36, s1: 94, s2: 86, l1: 62, l2: 52 },
      { h1: 265, h2: 275, s1: 65, s2: 55, l1: 74, l2: 62 },
      { h1: 348, h2: 358, s1: 84, s2: 76, l1: 60, l2: 50 },
      { h1: 282, h2: 292, s1: 45, s2: 35, l1: 76, l2: 66 },
      { h1: 44, h2: 54, s1: 95, s2: 88, l1: 66, l2: 52 },
      { h1: 198, h2: 208, s1: 72, s2: 60, l1: 72, l2: 58 },
      { h1: 78, h2: 92, s1: 74, s2: 62, l1: 70, l2: 56 },
      { h1: 174, h2: 186, s1: 78, s2: 68, l1: 66, l2: 52 },
      { h1: 330, h2: 342, s1: 84, s2: 74, l1: 68, l2: 54 },
      { h1: 248, h2: 258, s1: 62, s2: 52, l1: 65, l2: 52 }
    ];

    const currentBlock = paletteBlocks[blockIndex] || paletteBlocks[0];
    const hue = currentBlock.h1 + (currentBlock.h2 - currentBlock.h1) * subStep;
    const saturation = currentBlock.s1 + (currentBlock.s2 - currentBlock.s1) * subStep;
    const lightness = currentBlock.l1 + (currentBlock.l2 - currentBlock.l1) * subStep;

    const topS = Math.max(saturation - 6, 20);
    const topL = Math.min(lightness + 6, 85);
    const botS = Math.min(saturation + 6, 100);
    const botL = Math.max(lightness - 6, 40);

    const topHsl = `hsl(${hue.toFixed(1)}, ${topS.toFixed(0)}%, ${topL.toFixed(0)}%)`;
    const botHsl = `hsl(${hue.toFixed(1)}, ${botS.toFixed(0)}%, ${botL.toFixed(0)}%)`;
    const bgGradient = `linear-gradient(180deg, ${topHsl} 0%, ${botHsl} 100%)`;

    const bg = `hsl(${hue.toFixed(1)}, ${saturation.toFixed(0)}%, ${lightness.toFixed(0)}%)`;
    const accent = `hsl(${hue.toFixed(1)}, ${saturation.toFixed(0)}%, ${Math.min(88, lightness + 16).toFixed(0)}%)`;
    const frontBg = `hsl(${hue.toFixed(1)}, 35%, 10%)`;
    const textColor = '#111111';

    return {
      hue,
      bg,
      bgGradient,
      frontBg,
      text: textColor,
      subText: 'rgba(17, 17, 17, 0.75)',
      accent
    };
  }

  buildCardHTML(card, options = {}, format = CARD_FORMATS.DISC) {
    if (format === CARD_FORMATS.CARD) {
      return this.buildSquareCardHTML(card, options);
    }
    return this.buildDiscHTML(card, options);
  }

  buildDiscHTML(card, options = {}) {
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

    const palette = this.getDiscPalette(card);

    const volId = card.id ? card.id.split('-')[0].replace('vol', '') : '0';
    const hexPart = card.id ? card.id.split('-')[1].substring(2) : '00';
    const cardNumStr = `${volId}x${hexPart}`;

    // Determinación de Edición / Rareza
    let rarityClass = 'edition-standard';
    const cardIdx = card.index !== undefined ? card.index : parseInt(hexPart, 16);
    if (card.id === 'vol1-0x00' || card.id === 'vol7-0x00' || cardIdx === 63) {
      rarityClass = 'edition-holographic';
    } else if (cardIdx === 0 || card.id === 'vol0-0x00' || card.id === 'vol3-0x00') {
      rarityClass = 'edition-gold';
    } else if (cardIdx <= 2) {
      rarityClass = 'edition-silver';
    }

    const domainName = (this.catalog?.domains?.[card.domain] || card.domain || '').toUpperCase();
    const tagName = (this.catalog?.tags?.[card.tag] || card.tag || '').toUpperCase();
    const volName = (this.catalog?.volumes?.[card.volumen] || card.volumen || '').toUpperCase();

    const frontTopLabel = `${domainName} • ${tagName}`;
    const frontBottomLabel = `${volName} • #${cardNumStr}`;
    const backTopLabel = `${volName} • #${cardNumStr}`;
    const backBottomLabel = `shellaquiles.org`;

    const discId = options.id !== undefined ? (options.id ? `id="${options.id}"` : '') : 'id="active-card-3d"';
    const uid = (card.id || 'disc').replace(/[^a-zA-Z0-9]/g, '_') + '_' + Math.floor(Math.random() * 1000);
    const topPathF = `curve-tf-${uid}`;
    const botPathF = `curve-bf-${uid}`;
    const topPathB = `curve-tb-${uid}`;
    const botPathB = `curve-bb-${uid}`;

    const accentColor = palette.accent || '#38bdf8';
    const glowColor = palette.glow || 'rgba(56, 189, 248, 0.4)';

    return `
      <div class="disc-physical disc tazo-physical tazo-disc ${rarityClass} ${isFlipped ? 'is-flipped' : ''}" ${discId} style="--disc-c1: ${palette.c1}; --disc-c2: ${palette.c2}; --disc-accent: ${accentColor}; --disc-glow: ${glowColor}; --tazo-c1: ${palette.c1}; --tazo-c2: ${palette.c2};">

        <!-- ANVERSO: DOMINIO + TAG + CITA COMPLETA + ID -->
        <div class="disc-face disc-front disc-face-front tazo-face tazo-front">
          <div class="disc-notches tazo-notches" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>

          <div class="disc-relief-ring ring-outer tazo-relief-ring" aria-hidden="true"></div>
          <div class="disc-relief-ring ring-mid tazo-relief-ring" aria-hidden="true"></div>

          <!-- Arco superior e inferior con radio protegido r=112 -->
          <svg class="disc-ring-text tazo-ring-text" viewBox="0 0 300 300" aria-hidden="true">
            <path id="${topPathF}" d="M 38,150 A 112,112 0 0,1 262,150" fill="none" />
            <path id="${botPathF}" d="M 38,150 A 112,112 0 0,0 262,150" fill="none" />
            <text class="ring-label"><textPath href="#${topPathF}" startOffset="50%" text-anchor="middle">${frontTopLabel}</textPath></text>
            <text class="ring-sub"><textPath href="#${botPathF}" startOffset="50%" text-anchor="middle">${frontBottomLabel}</textPath></text>
          </svg>

          <!-- Centro: Texto del Hito -->
          <div class="disc-core-front tazo-core-front">
            <div class="disc-hito-prose tazo-hito-prose">
              ${hitoFormatted}
            </div>
          </div>

          <div class="disc-foil-reflection tazo-foil-reflection" aria-hidden="true"></div>
        </div>

        <!-- REVERSO: AUTOR ARRIBA + AÑO GIGANTE + TRIVIA LORE ABAJO -->
        <div class="disc-face disc-back disc-face-back tazo-face tazo-back">
          <div class="disc-notches tazo-notches" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>

          <svg class="disc-ring-text tazo-ring-text" viewBox="0 0 300 300" aria-hidden="true">
            <path id="${topPathB}" d="M 38,150 A 112,112 0 0,1 262,150" fill="none" />
            <path id="${botPathB}" d="M 38,150 A 112,112 0 0,0 262,150" fill="none" />
            <text class="ring-label"><textPath href="#${topPathB}" startOffset="50%" text-anchor="middle">${backTopLabel}</textPath></text>
            <text class="ring-sub"><textPath href="#${botPathB}" startOffset="50%" text-anchor="middle">${backBottomLabel}</textPath></text>
          </svg>

          <div class="disc-core-back tazo-core-back">
            <div class="disc-back-author tazo-back-author">${creadorFormatted}</div>

            <div class="disc-year-hero tazo-year-hero ${yearStateClass}" ${hideRevealButton ? '' : 'id="year-target" title="Toca para revelar el año (-5 Pts) [R]"'}>
              <span class="year-number-giant">${card.year}</span>
              ${hideRevealButton ? '' : `
              <div class="year-scratch-badge">
                <i data-lucide="eye"></i>
                <span>REVELAR (-5 PTS)</span>
              </div>
              `}
            </div>

            <div class="disc-back-lore tazo-back-lore">${triviaFormatted}</div>
          </div>

          <div class="disc-foil-reflection tazo-foil-reflection" aria-hidden="true"></div>
        </div>

      </div>
    `;
  }

  buildSquareCardHTML(card, options = {}) {
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

    const theme = this.getCardTheme(card);

    const volId = card.id ? card.id.split('-')[0].replace('vol', '') : '0';
    const hexPart = card.id ? card.id.split('-')[1].substring(2) : '00';
    const cardNumStr = `${volId}x${hexPart}`;

    const domainName = (this.catalog?.domains?.[card.domain] || card.domain || '').toUpperCase();
    const tagName = this.catalog?.tags?.[card.tag] || card.tag || '';
    const volName = this.catalog?.volumes?.[card.volumen] || card.volumen || '';

    const cardIdAttr = options.id !== undefined ? (options.id ? `id="${options.id}"` : '') : 'id="active-card-3d"';

    return `
      <div class="hittazos-card-3d ${isFlipped ? 'is-flipped' : ''}" ${cardIdAttr} style="--hittazos-bg: ${theme.bg}; --card-bg: ${theme.bg}; --card-bg-gradient: ${theme.bgGradient}; --card-top-hex: ${theme.topHex || theme.bgHex}; --card-bottom-hex: ${theme.bottomHex || theme.bgHex}; --hittazos-front-bg: ${theme.frontBg}; --card-front-bg: ${theme.frontBg}; --card-text: ${theme.text}; --card-subtext: ${theme.subText}; --card-accent: ${theme.accent};">
        <div class="card-sheet sheet-front hittazos-matte-card">
          <div class="card-topbar-minimal">
            <span class="group-badge-tiny">
              <i data-lucide="layers"></i>
              ${domainName}
            </span>
            <span class="category-badge-tiny">${tagName}</span>
          </div>

          <div class="clue-stage-pure">
            <p class="clue-quote">${hitoFormatted}</p>
          </div>

          <div class="card-footbar-minimal">
            <span class="corner-meta-left">${volName}</span>
            <span class="flip-pill"><i data-lucide="rotate-cw"></i> Voltear</span>
            <span class="corner-meta-right">#${cardNumStr}</span>
          </div>
        </div>

        <div class="card-sheet sheet-back hittazos-matte-card">
          <div class="card-back-top">
            <div class="back-author-title">${creadorFormatted}</div>
          </div>

          <div class="year-center-stage ${yearStateClass}" ${hideRevealButton ? '' : 'id="year-target" title="Toca para revelar el año (-5 Pts) [R]"'}>
            ${hideRevealButton ? `
              <div class="year-digits-hero">${card.year}</div>
            ` : `
              <div class="year-mystery-box">
                <div class="year-mystery-digits">????</div>
                <div class="year-reveal-badge">
                  <i data-lucide="eye"></i>
                  <span>Revelar (-5 Pts)</span>
                </div>
              </div>
              <div class="year-digits-hero">${card.year}</div>
            `}
          </div>

          <div class="card-back-bottom">
            <div class="back-trivia-phrase">${triviaFormatted}</div>
          </div>

          <div class="card-footbar-minimal">
            <span class="corner-meta-left">${volName}</span>
            <span class="corner-meta-right">#${cardNumStr}</span>
          </div>
        </div>
      </div>
    `;
  }

  buildFanCardHTML(card, options = {}) {
    const theme = this.getCardTheme(card);
    const volId = card.id ? card.id.split('-')[0].replace('vol', '') : '0';
    const hexPart = card.id ? card.id.split('-')[1].substring(2) : '00';
    const cardNum = card.globalIndex || (card.index !== undefined ? card.index + 1 : 1);
    const hexId = `#${cardNum.toString(16).toUpperCase().padStart(4, '0')}`;
    const volName = (this.catalog?.volumes?.[card.volumen] || card.volumen || `VOL ${volId}`).toUpperCase();
    const creador = this.formatMarkdown(card.autor || '');
    const trivia = this.formatMarkdown(card.trivia || card.hito || '');
    const hito = this.formatMarkdown(card.hito || '');
    const domainName = (this.catalog?.domains?.[card.domain] || card.domain || '').toUpperCase();
    const tagName = this.catalog?.tags?.[card.tag] || card.tag || '';
    const mode = options.mode || 'gradient';
    const isFlipped = options.isFlipped === true;

    let activeBg = theme.bgGradient;
    if (mode === 'solid') activeBg = theme.bg;
    if (mode === 'hybrid') activeBg = (theme.hue > 65 && theme.hue < 210) ? theme.bg : theme.bgGradient;

    return `
      <div class="card card-fan hittazos-fan-card ${isFlipped ? 'is-flipped' : ''}" data-card-id="${card.id}" data-card-num="${cardNum}" style="--fan-card-bg: ${activeBg}; background: ${activeBg}; z-index: ${options.zIndex || cardNum};" tabindex="0" role="button" aria-label="Tarjeta ${card.year}: ${card.autor}">
        <div class="card-fan-inner">
          <div class="card-fan-face card-fan-back">
            <div class="card-header-author">${creador}</div>
            <div class="card-year-center">${card.year}</div>
            <div class="card-fan-bottom-area">
              <div class="card-description">“${trivia}”</div>
              <div class="card-meta-footer">
                <span>${volName}</span>
                <span>${hexId}</span>
              </div>
            </div>
          </div>
          <div class="card-fan-face card-fan-front">
            <div class="card-fan-front-top">
              <span class="group-badge-tiny">${domainName}</span>
              <span class="category-badge-tiny">${tagName}</span>
            </div>
            <div class="card-fan-clue">${hito}</div>
            <div class="card-meta-footer">
              <span>${volName}</span>
              <span>#${volId}x${hexPart}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  buildDuplexPrintFaceHTML(card, isBack = false, hasBorder = true) {
    const theme = this.getCardTheme(card);
    const borderCls = hasBorder ? 'has-cut-border' : '';
    const volId = card.id ? card.id.split('-')[0].replace('vol', '') : '0';
    const hexPart = card.id ? card.id.split('-')[1].substring(2) : '00';
    const cardNumStr = `${volId}x${hexPart}`;
    const volName = this.catalog?.volumes?.[card.volumen] || card.volumen || '';

    if (isBack) {
      const creadorFormatted = this.formatMarkdown(card.autor);
      const triviaFormatted = this.formatMarkdown(card.trivia);
      return `
        <div class="print-card-face print-card-back ${borderCls}" style="--card-bg: ${theme.bg}; --card-bg-gradient: ${theme.bgGradient}; --card-text: ${theme.text}; --card-subtext: ${theme.subText}; --card-accent: ${theme.accent};">
          <div class="card-sheet sheet-back hittazos-matte-card">
            <div class="card-back-top">
              <div class="back-author-title">${creadorFormatted}</div>
            </div>
            <div class="year-center-stage is-revealed">
              <div class="year-digits-hero">${card.year}</div>
            </div>
            <div class="card-back-bottom">
              <div class="back-trivia-phrase">${triviaFormatted}</div>
            </div>
            <div class="card-footbar-minimal">
              <span class="corner-meta-left">${volName}</span>
              <span class="corner-meta-right">#${cardNumStr}</span>
            </div>
          </div>
        </div>
      `;
    }

    const hitoFormatted = this.formatMarkdown(card.hito);
    const domainName = (this.catalog?.domains?.[card.domain] || card.domain || '').toUpperCase();
    const tagName = this.catalog?.tags?.[card.tag] || card.tag || '';

    return `
      <div class="print-card-face print-card-front ${borderCls}" style="--card-bg: ${theme.bg}; --card-front-bg: ${theme.frontBg}; --card-text: ${theme.text}; --card-subtext: ${theme.subText}; --card-accent: ${theme.accent};">
        <div class="card-sheet sheet-front hittazos-matte-card">
          <div class="card-topbar-minimal">
            <span class="group-badge-tiny">
              <i data-lucide="layers"></i>
              ${domainName}
            </span>
            <span class="category-badge-tiny">${tagName}</span>
          </div>
          <div class="clue-stage-pure">
            <p class="clue-quote">${hitoFormatted}</p>
          </div>
          <div class="card-footbar-minimal">
            <span class="corner-meta-left">${volName}</span>
            <span class="corner-meta-right">#${cardNumStr}</span>
          </div>
        </div>
      </div>
    `;
  }
}
