// Hit-Tazos Tech — Modular Card & Disc Renderer Orchestrator
// Coordina los renderers especializados TazoRenderer (Hit-Tazo) y CardsRenderer (Hit-Cards)

import { DOMAIN_PALETTES, DEFAULT_PALETTE, CARD_FORMATS } from './constants.js';
import { TazoRenderer } from './tazo-renderer.js';
import { CardsRenderer } from './cards-renderer.js';

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
    let html = '';
    if (typeof snarkdown === 'function') {
      html = snarkdown(text);
    } else {
      // Fallback nativo
      html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
    }
    // Evitar puntuaciones huérfanas en saltos de línea (ej. "Datadog , unificando")
    return html.replace(/\s+([,.:;!?])/g, '$1');
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
    return TazoRenderer.renderDisc(
      card,
      options,
      this.catalog,
      (t) => this.formatMarkdown(t),
      (c) => this.getDiscPalette(c),
      (c) => this.getCardTheme(c)
    );
  }

  buildSquareCardHTML(card, options = {}) {
    return CardsRenderer.renderSquareCard(
      card,
      options,
      this.catalog,
      (t) => this.formatMarkdown(t),
      (c) => this.getCardTheme(c)
    );
  }

  buildFanCardHTML(card, options = {}) {
    return CardsRenderer.renderFanCard(
      card,
      options,
      this.catalog,
      (t) => this.formatMarkdown(t),
      (c) => this.getCardTheme(c)
    );
  }

  buildDuplexPrintFaceHTML(card, isBack = false, hasBorder = true) {
    return CardsRenderer.renderDuplexPrintFace(
      card,
      isBack,
      hasBorder,
      this.catalog,
      (t) => this.formatMarkdown(t),
      (c) => this.getCardTheme(c)
    );
  }
}
export { TazoRenderer, CardsRenderer };
