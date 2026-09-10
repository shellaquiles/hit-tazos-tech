// Hit-Tazos Tech — Cards-Specific Renderer
// Especializado en la diagramación, tipografía y marcado de Hit-Cards (Tarjetas cuadradas)

export class CardsRenderer {
  /**
   * Renderiza el HTML de la tarjeta cuadrada clásica Hit-Cards (65x65mm).
   * Estructura sobria de sobremesa: Header editorial con badge de dominio,
   * pista central destacada en Markdown y reverso estructurado de ficha técnica.
   */
  static renderSquareCard(card, options = {}, catalog = null, formatMarkdown = (t) => t, getCardTheme = () => ({})) {
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

    const hitoFormatted = formatMarkdown(card.hito);
    const triviaFormatted = formatMarkdown(card.trivia);
    const creadorFormatted = formatMarkdown(card.autor);

    const theme = getCardTheme(card) || {};

    const volId = card.id ? card.id.split('-')[0].replace('vol', '') : '0';
    const hexPart = card.id ? card.id.split('-')[1].substring(2) : '00';
    const cardNumStr = `${volId}x${hexPart}`;

    const domainName = (catalog?.domains?.[card.domain] || card.domain || '').toUpperCase();
    const tagName = catalog?.tags?.[card.tag] || card.tag || '';
    const volName = catalog?.volumes?.[card.volumen] || card.volumen || '';

    const cardIdAttr = options.id !== undefined ? (options.id ? `id="${options.id}"` : '') : 'id="active-card-3d"';

    return `
      <div class="hittazos-card-3d ${isFlipped ? 'is-flipped' : ''}" ${cardIdAttr} style="--hittazos-bg: ${theme.bg || '#0284c7'}; --card-bg: ${theme.bg || '#0284c7'}; --card-bg-gradient: ${theme.bgGradient || 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)'}; --card-top-hex: ${theme.topHex || theme.bgHex || '#0284c7'}; --card-bottom-hex: ${theme.bottomHex || theme.bgHex || '#0369a1'}; --hittazos-front-bg: ${theme.frontBg || '#111524'}; --card-front-bg: ${theme.frontBg || '#111524'}; --card-text: ${theme.text || '#111111'}; --card-subtext: ${theme.subText || 'rgba(17, 17, 17, 0.75)'}; --card-accent: ${theme.accent || '#38bdf8'};">
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

  /**
   * Renderiza una tarjeta de baraja para la vista en abanico (fanning track).
   */
  static renderFanCard(card, options = {}, catalog = null, formatMarkdown = (t) => t, getCardTheme = () => ({})) {
    const theme = getCardTheme(card) || {};
    const volId = card.id ? card.id.split('-')[0].replace('vol', '') : '0';
    const hexPart = card.id ? card.id.split('-')[1].substring(2) : '00';
    const cardNum = card.globalIndex || (card.index !== undefined ? card.index + 1 : 1);
    const hexId = `#${cardNum.toString(16).toUpperCase().padStart(4, '0')}`;
    const volName = (catalog?.volumes?.[card.volumen] || card.volumen || `VOL ${volId}`).toUpperCase();
    const creador = formatMarkdown(card.autor || '');
    const trivia = formatMarkdown(card.trivia || card.hito || '');
    const hito = formatMarkdown(card.hito || '');
    const domainName = (catalog?.domains?.[card.domain] || card.domain || '').toUpperCase();
    const tagName = catalog?.tags?.[card.tag] || card.tag || '';
    const mode = options.mode || 'gradient';
    const isFlipped = options.isFlipped === true;

    let activeBg = theme.bgGradient || theme.bg || '#0284c7';
    if (mode === 'solid') activeBg = theme.bg || '#0284c7';
    if (mode === 'hybrid') activeBg = (theme.hue > 65 && theme.hue < 210) ? (theme.bg || '#0284c7') : (theme.bgGradient || '#0284c7');

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

  /**
   * Renderiza la cara para impresión dúplex (Print & Play).
   */
  static renderDuplexPrintFace(card, isBack = false, hasBorder = true, catalog = null, formatMarkdown = (t) => t, getCardTheme = () => ({})) {
    const theme = getCardTheme(card) || {};
    const borderCls = hasBorder ? 'has-cut-border' : '';
    const volId = card.id ? card.id.split('-')[0].replace('vol', '') : '0';
    const hexPart = card.id ? card.id.split('-')[1].substring(2) : '00';
    const cardNumStr = `${volId}x${hexPart}`;
    const volName = catalog?.volumes?.[card.volumen] || card.volumen || '';

    if (isBack) {
      const creadorFormatted = formatMarkdown(card.autor);
      const triviaFormatted = formatMarkdown(card.trivia);
      return `
        <div class="print-card-face print-card-back ${borderCls}" style="--card-bg: ${theme.bg || '#0284c7'}; --card-bg-gradient: ${theme.bgGradient || 'none'}; --card-text: ${theme.text || '#111111'}; --card-subtext: ${theme.subText || 'rgba(17,17,17,0.75)'}; --card-accent: ${theme.accent || '#38bdf8'};">
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

    const hitoFormatted = formatMarkdown(card.hito);
    const domainName = (catalog?.domains?.[card.domain] || card.domain || '').toUpperCase();
    const tagName = catalog?.tags?.[card.tag] || card.tag || '';

    return `
      <div class="print-card-face print-card-front ${borderCls}" style="--card-bg: ${theme.bg || '#0284c7'}; --card-front-bg: ${theme.frontBg || '#111524'}; --card-text: ${theme.text || '#111111'}; --card-subtext: ${theme.subText || 'rgba(17,17,17,0.75)'}; --card-accent: ${theme.accent || '#38bdf8'};">
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
