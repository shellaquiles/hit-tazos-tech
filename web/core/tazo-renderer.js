// Hit-Tazos Tech — Tazo-Specific Physical Disc Renderer
// Especializado en la física, geometría y marcado de Hit-Tazo (Tazos 3D circulares)

export class TazoRenderer {
  /**
   * Renderiza el HTML del disco 3D físico de Hit-Tazo.
   * Cuenta con radio seguro r=112 en el arco SVG, ranuras perimetrales (notchings)
   * y estructura física en capas (bisel CNC, face plate y foil reflection).
   */
  static renderDisc(card, options = {}, catalog = null, formatMarkdown = (t) => t, getDiscPalette = () => ({})) {
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

    const palette = getDiscPalette(card) || {};

    const volId = card.id ? card.id.split('-')[0].replace('vol', '') : '0';
    const hexPart = card.id ? card.id.split('-')[1].substring(2) : '00';
    const cardNumStr = `${volId}x${hexPart}`;

    // Determinación de Edición / Rareza del Tazo
    let rarityClass = 'edition-standard';
    const cardIdx = card.index !== undefined ? card.index : parseInt(hexPart, 16);
    if (card.id === 'vol1-0x00' || card.id === 'vol7-0x00' || cardIdx === 63) {
      rarityClass = 'edition-holographic';
    } else if (cardIdx === 0 || card.id === 'vol0-0x00' || card.id === 'vol3-0x00') {
      rarityClass = 'edition-gold';
    } else if (cardIdx <= 2) {
      rarityClass = 'edition-silver';
    }

    const domainName = (catalog?.domains?.[card.domain] || card.domain || '').toUpperCase();
    const tagName = (catalog?.tags?.[card.tag] || card.tag || '').toUpperCase();
    const volName = (catalog?.volumes?.[card.volumen] || card.volumen || '').toUpperCase();

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
      <div class="disc-physical disc tazo-physical tazo-disc ${rarityClass} ${isFlipped ? 'is-flipped' : ''}" ${discId} style="--disc-c1: ${palette.c1 || '#0f172a'}; --disc-c2: ${palette.c2 || '#1e293b'}; --disc-accent: ${accentColor}; --disc-glow: ${glowColor}; --tazo-c1: ${palette.c1 || '#0f172a'}; --tazo-c2: ${palette.c2 || '#1e293b'};">

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
}
