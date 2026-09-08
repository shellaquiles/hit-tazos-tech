#!/usr/bin/env node
/**
 * Hit-Tazos Tech - Generador Maestro de Imposición Profesional para Imprenta Offset y Digital
 * Cumple con los estándares de imprenta CDMX:
 *  - 100% Vectorial, sin fuentes rasterizadas (TrueType Cairo / SVG).
 *  - Sangrado técnico (bleed) de 3 mm (8.5 pt) por lado.
 *  - Calles de separación (gutter) de 6 mm (17.0 pt) para doble corte independiente sin orillas vecinas.
 *  - Margen de seguridad tipográfica >= 8 mm (22.7 pt) libre de corte.
 *  - Cruces y marcas de corte (crop marks) profesionales de 5 mm fuera del sangrado.
 *  - Rejilla estándar Tabloide (11x17 pulg): 3 columnas x 5 filas = 15 cartas con pinzas amplias (>36 mm).
 *  - Soporte para Tabloide Rebasado / Super Tabloide (12x18 pulg): 3 columnas x 6 filas = 18 cartas.
 *
 * Uso:
 *   node render_print_tabloid.js [--format=11x17|12x18] [--range=15|18|ALL] [--crop=marks|guides|clean] [--pdf-editable] [--svg] [--pdf]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PRINT_DIR = path.resolve(__dirname);
const ROOT_DIR = path.resolve(__dirname, '..');
const CARDS_JSON_PATH = path.join(ROOT_DIR, 'data', 'cards.json');
const OUTPUT_HTML_PATH = path.join(PRINT_DIR, 'tabloide_impresion.html');
const OUTPUT_CHROME_PDF_PATH = path.join(PRINT_DIR, 'tabloide_impresion.pdf');
const OUTPUT_EDITABLE_PDF_PATH = path.join(PRINT_DIR, 'tabloide_editable.pdf');
const OUTPUT_SVG_DIR = path.join(PRINT_DIR, 'pliegos_svg');

// Medidas tipográficas e imprenta estándar (1 mm = 72 / 25.4 = 2.8346456 pt)
const MM_TO_PT = 72.0 / 25.4;

const CARD_SIZE_MM = 65.0;
const BLEED_MM = 3.0;
const GUTTER_MM = 6.0;
const SAFE_MARGIN_MM = 8.0;

const CARD_SIZE_PT = CARD_SIZE_MM * MM_TO_PT;       // 184.252 pt
const BLEED_PT = BLEED_MM * MM_TO_PT;               // 8.504 pt
const GUTTER_PT = GUTTER_MM * MM_TO_PT;             // 17.008 pt
const SAFE_MARGIN_PT = SAFE_MARGIN_MM * MM_TO_PT;   // 22.677 pt

const CROP_LEN_PT = 5.0 * MM_TO_PT;                 // 14.173 pt (largo de marca de corte)
const CROP_OFFSET_PT = 1.0 * MM_TO_PT;              // 2.835 pt (separación fuera del sangrado)

let cardColorsConfig = null;
try {
  cardColorsConfig = require('../data/card_colors.json');
} catch (e) {
  // Configuración ausente
}

function getCardTheme(card) {
  let cardNum = card.card_number || 1;
  if (cardColorsConfig && cardColorsConfig.cards && cardColorsConfig.cards[cardNum]) {
    const c = cardColorsConfig.cards[cardNum];
    return {
      bg: c.bg_hsl,
      frontBg: c.front_bg_hsl,
      bgHex: c.bg_hex,
      frontBgHex: c.front_bg_hex,
      bgCmyk: c.bg_cmyk || 'cmyk(0%, 0%, 0%, 0%)',
      frontBgCmyk: c.front_bg_cmyk || 'cmyk(0%, 0%, 0%, 90%)',
      accentHex: c.accent_hex,
      textColor: '#111111',
      cornerColor: c.corner_color || 'rgba(255, 255, 255, 0.7)'
    };
  }

  const blockIndex = Math.floor(((cardNum - 1) % 100) / 10);
  const subStep = ((cardNum - 1) % 10) / 9;

  const paletteBlocks = [
    { h1: 350, h2: 356, s1: 72, s2: 88, l1: 70, l2: 54 }, // 01-10: Rojo
    { h1: 268, h2: 276, s1: 58, s2: 78, l1: 72, l2: 56 }, // 11-20: Violeta
    { h1: 22, h2: 28, s1: 78, s2: 92, l1: 70, l2: 54 },   // 21-30: Naranja
    { h1: 280, h2: 290, s1: 45, s2: 65, l1: 74, l2: 58 }, // 31-40: Lavanda
    { h1: 42, h2: 48, s1: 82, s2: 96, l1: 72, l2: 56 },   // 41-50: Amarillo
    { h1: 245, h2: 258, s1: 48, s2: 70, l1: 75, l2: 58 }, // 51-60: Lila
    { h1: 68, h2: 82, s1: 72, s2: 85, l1: 72, l2: 56 },   // 61-70: Lima
    { h1: 172, h2: 192, s1: 62, s2: 82, l1: 72, l2: 54 }, // 71-80: Turquesa
    { h1: 335, h2: 345, s1: 68, s2: 86, l1: 72, l2: 56 }, // 81-90: Rosa
    { h1: 32, h2: 38, s1: 65, s2: 82, l1: 70, l2: 54 }    // 91-100: Ocre
  ];

  const currentBlock = paletteBlocks[blockIndex] || paletteBlocks[0];
  const hue = currentBlock.h1 + (currentBlock.h2 - currentBlock.h1) * subStep;
  const saturation = currentBlock.s1 + (currentBlock.s2 - currentBlock.s1) * subStep;
  const lightness = currentBlock.l1 + (currentBlock.l2 - currentBlock.l1) * subStep;

  function hslToHex(h, s, l) {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  const bgHex = hslToHex(hue, saturation, lightness);
  const frontBgHex = hslToHex(hue, 35, 10);

  return {
    bg: `hsl(${hue.toFixed(1)}, ${saturation.toFixed(0)}%, ${lightness.toFixed(0)}%)`,
    frontBg: `hsl(${hue.toFixed(1)}, 35%, 10%)`,
    bgHex: bgHex,
    frontBgHex: frontBgHex,
    accentHex: bgHex,
    textColor: '#111111',
    cornerColor: 'rgba(255, 255, 255, 0.7)'
  };
}

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripMarkdown(str) {
  if (!str) return '';
  return str
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/&#124;/g, '|');
}

function formatMarkdown(str) {
  if (!str) return '';
  return str
    .replace(/&#124;/g, '|')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

// Divide texto en líneas para SVG nativo respetando el ancho disponible de 49mm
function wrapTextToLines(text, maxCharsPerLine = 28) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}

// Genera marcas de corte (crop marks) exteriores de 5mm en las 4 esquinas de una tarjeta
function generateCropMarksSvg(cutX, cutY, cutW, cutH) {
  const hL1_x1 = (cutX - BLEED_PT - CROP_LEN_PT).toFixed(2);
  const hL1_x2 = (cutX - BLEED_PT - CROP_OFFSET_PT).toFixed(2);
  const hR1_x1 = (cutX + cutW + BLEED_PT + CROP_OFFSET_PT).toFixed(2);
  const hR1_x2 = (cutX + cutW + BLEED_PT + CROP_LEN_PT).toFixed(2);

  const vT1_y1 = (cutY - BLEED_PT - CROP_LEN_PT).toFixed(2);
  const vT1_y2 = (cutY - BLEED_PT - CROP_OFFSET_PT).toFixed(2);
  const vB1_y1 = (cutY + cutH + BLEED_PT + CROP_OFFSET_PT).toFixed(2);
  const vB1_y2 = (cutY + cutH + BLEED_PT + CROP_LEN_PT).toFixed(2);

  const yTop = cutY.toFixed(2);
  const yBot = (cutY + cutH).toFixed(2);
  const xLeft = cutX.toFixed(2);
  const xRight = (cutX + cutW).toFixed(2);

  return `      <!-- Marcas de corte (Crop marks 5mm) -->
      <g stroke="#000000" stroke-width="0.5" stroke-linecap="square">
        <!-- Top-Left -->
        <line x1="${hL1_x1}" y1="${yTop}" x2="${hL1_x2}" y2="${yTop}" />
        <line x1="${xLeft}" y1="${vT1_y1}" x2="${xLeft}" y2="${vT1_y2}" />
        <!-- Top-Right -->
        <line x1="${hR1_x1}" y1="${yTop}" x2="${hR1_x2}" y2="${yTop}" />
        <line x1="${xRight}" y1="${vT1_y1}" x2="${xRight}" y2="${vT1_y2}" />
        <!-- Bottom-Left -->
        <line x1="${hL1_x1}" y1="${yBot}" x2="${hL1_x2}" y2="${yBot}" />
        <line x1="${xLeft}" y1="${vB1_y1}" x2="${xLeft}" y2="${vB1_y2}" />
        <!-- Bottom-Right -->
        <line x1="${hR1_x1}" y1="${yBot}" x2="${hR1_x2}" y2="${yBot}" />
        <line x1="${xRight}" y1="${vB1_y1}" x2="${xRight}" y2="${vB1_y2}" />
      </g>\n`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    range: 'ALL',        // '15', '18', '30', '36', 'ALL'
    crop: 'marks',       // 'marks' (cruces pro), 'guides' (guías punteadas), 'clean'
    format: '11x17',     // '11x17' (Tabloide 3x5 = 15 cartas), '12x18' (Super Tabloide 3x6 = 18 cartas)
    pdf: false,          // Chrome PDF
    svg: false,          // Exportar hojas SVG
    pdfEditable: false   // Exportar PDF vectorial editable con rsvg-convert y Cairo
  };

  args.forEach(arg => {
    if (arg === '--pdf') options.pdf = true;
    if (arg === '--svg') options.svg = true;
    if (arg === '--pdf-editable' || arg === '--editable') {
      options.pdfEditable = true;
      options.svg = true;
    }
    if (arg.startsWith('--range=')) options.range = arg.split('=')[1];
    if (arg.startsWith('--crop=')) options.crop = arg.split('=')[1];
    if (arg.startsWith('--format=')) options.format = arg.split('=')[1];
  });

  // Si no se especifica nada, generar SVG + PDF editable por defecto
  if (!options.pdf && !options.svg && !options.pdfEditable) {
    options.svg = true;
    options.pdfEditable = true;
  }

  return options;
}

// -------------------------------------------------------------
// Generador de Pliegos SVG para Illustrator / Figma / Inkscape
// -------------------------------------------------------------
function generateSvgSheets(cards, options) {
  fs.mkdirSync(OUTPUT_SVG_DIR, { recursive: true });

  const isSuperTabloid = options.format === '12x18';
  const cols = 3;
  const rows = isSuperTabloid ? 6 : 5;
  const cardsPerSheet = cols * rows;

  const pageWidthPt = isSuperTabloid ? 12 * 72 : 11 * 72; // 864 o 792 pt
  const pageHeightPt = isSuperTabloid ? 18 * 72 : 17 * 72; // 1296 o 1224 pt

  const gridWidthPt = cols * CARD_SIZE_PT + (cols - 1) * GUTTER_PT;
  const gridHeightPt = rows * CARD_SIZE_PT + (rows - 1) * GUTTER_PT;

  const marginXPt = (pageWidthPt - gridWidthPt) / 2.0;
  const marginYPt = (pageHeightPt - gridHeightPt) / 2.0;

  const totalSheets = Math.ceil(cards.length / cardsPerSheet);
  const showMarks = options.crop === 'marks';
  const showGuides = options.crop === 'guides';
  const generatedFiles = [];

  const paperLabel = isSuperTabloid
    ? '12 × 18 PULGADAS (304.8 × 457.2 mm) — SUPER TABLOIDE'
    : '11 × 17 PULGADAS (279.4 × 431.8 mm) — TABLOIDE';

  for (let s = 0; s < totalSheets; s++) {
    const sheetCards = cards.slice(s * cardsPerSheet, (s + 1) * cardsPerSheet);
    while (sheetCards.length < cardsPerSheet) {
      sheetCards.push(null);
    }

    // --- CARA A: FRENTES ---
    const frontSvgPath = path.join(OUTPUT_SVG_DIR, `pliego_${String(s + 1).padStart(2, '0')}_frentes.svg`);
    let frontCardsSvg = '';

    sheetCards.forEach((c, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cutX = marginXPt + col * (CARD_SIZE_PT + GUTTER_PT);
      const cutY = marginYPt + row * (CARD_SIZE_PT + GUTTER_PT);

      if (!c) {
        if (showGuides) {
          frontCardsSvg += `    <rect x="${cutX.toFixed(2)}" y="${cutY.toFixed(2)}" width="${CARD_SIZE_PT.toFixed(2)}" height="${CARD_SIZE_PT.toFixed(2)}" fill="none" stroke="#e2e8f0" stroke-width="0.35" />\n`;
        }
        return;
      }

      const theme = getCardTheme(c);
      const cardNumPad = String(c.card_number).padStart(3, '0');
      const numStr = `#${cardNumPad}`;
      const grupoText = escapeXml(stripMarkdown(c.grupo_nombre).toUpperCase());
      const catText = escapeXml(stripMarkdown(c.categoria_nombre));
      const clueText = stripMarkdown(c.hito);

      // Con textos limitados (máx 145 car.), ajuste en ancho 49mm (<= 28 car/línea)
      const clueLines = wrapTextToLines(clueText, 27);
      const clueFontSize = clueLines.length <= 4 ? 9.0 : (clueLines.length === 5 ? 8.6 : 8.2);
      const clueLeading = clueLines.length <= 4 ? 13.0 : (clueLines.length === 5 ? 12.2 : 11.5);

      // Centrado vertical óptico entre divisor (y=38) y zona inferior (y=150)
      const totalClueH = (clueLines.length - 1) * clueLeading;
      const clueStartY = 41 + ((148 - 41) - totalClueH) / 2.0;

      let clueTspans = '';
      clueLines.forEach((line, i) => {
        clueTspans += `<tspan x="${SAFE_MARGIN_PT.toFixed(2)}" y="${(clueStartY + i * clueLeading).toFixed(1)}">${escapeXml(line)}</tspan>`;
      });

      // Dimensiones con rebase (+3mm / 8.5pt hacia cada lado)
      const bleedX = (cutX - BLEED_PT).toFixed(2);
      const bleedY = (cutY - BLEED_PT).toFixed(2);
      const bleedW = (CARD_SIZE_PT + 2 * BLEED_PT).toFixed(2);
      const bleedH = (CARD_SIZE_PT + 2 * BLEED_PT).toFixed(2);

      let marksSvg = '';
      if (showMarks) {
        marksSvg = generateCropMarksSvg(cutX, cutY, CARD_SIZE_PT, CARD_SIZE_PT);
      }

      frontCardsSvg += `    <!-- Tarjeta #${cardNumPad} Frente -->
    <g id="carta_${cardNumPad}_frente">
      ${marksSvg}
      <!-- Fondo con Sangrado Exterior 3mm (71x71 mm) -->
      <rect x="${bleedX}" y="${bleedY}" width="${bleedW}" height="${bleedH}" fill="${theme.frontBgHex}" />

      <!-- Contenido dentro del área de corte (65x65 mm) con margen de seguridad >= 8mm -->
      <g transform="translate(${cutX.toFixed(2)}, ${cutY.toFixed(2)})">
        <!-- Cabecera protegida (>= 8.5mm del borde superior) -->
        <text x="${SAFE_MARGIN_PT.toFixed(2)}" y="25" font-family="'Outfit', sans-serif" font-size="6.5" font-weight="800" fill="${theme.accentHex}">${grupoText}</text>
        <text x="${SAFE_MARGIN_PT.toFixed(2)}" y="34" font-family="'Outfit', sans-serif" font-size="5.8" font-weight="400" fill="#a0aec0">${catText}</text>
        <line x1="${SAFE_MARGIN_PT.toFixed(2)}" y1="38" x2="${(CARD_SIZE_PT - SAFE_MARGIN_PT).toFixed(2)}" y2="38" stroke="rgba(255,255,255,0.18)" stroke-width="0.5" />

        <!-- Pista técnica centrada ópticamente -->
        <text font-family="'Outfit', sans-serif" font-size="${clueFontSize}" font-weight="400" fill="#ffffff">
          ${clueTspans}
        </text>

        <!-- Pie protegido (>= 8mm del borde inferior) -->
        <text x="${SAFE_MARGIN_PT.toFixed(2)}" y="161.5" font-family="'Outfit', sans-serif" font-size="5.4" font-weight="500" fill="rgba(255,255,255,0.45)">${escapeXml(c.categoria)}</text>
        <text x="${(CARD_SIZE_PT - SAFE_MARGIN_PT).toFixed(2)}" y="161.5" font-family="'Space Grotesk', sans-serif" font-size="5.4" font-weight="500" fill="rgba(255,255,255,0.55)" text-anchor="end">${numStr}</text>

        ${showGuides ? `<rect width="${CARD_SIZE_PT.toFixed(2)}" height="${CARD_SIZE_PT.toFixed(2)}" fill="none" stroke="rgba(255,255,255,0.25)" stroke-dasharray="2 2" stroke-width="0.35" />` : ''}
      </g>
    </g>\n`;
    });

    const frontSvgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${(pageWidthPt / MM_TO_PT).toFixed(1)}mm" height="${(pageHeightPt / MM_TO_PT).toFixed(1)}mm" viewBox="0 0 ${pageWidthPt} ${pageHeightPt}" style="background-color: #ffffff;">
  <g id="encabezado_pliego">
    <text x="${marginXPt.toFixed(2)}" y="${(marginYPt - 16).toFixed(2)}" font-family="'Outfit', sans-serif" font-size="7.5" font-weight="700" fill="#555555">HIT-TAZOS TECH — PLIEGO ${s + 1} DE ${totalSheets} [CARA A: FRENTES]</text>
    <text x="${(marginXPt + gridWidthPt).toFixed(2)}" y="${(marginYPt - 16).toFixed(2)}" font-family="'Outfit', sans-serif" font-size="7.5" font-weight="700" fill="#555555" text-anchor="end">${paperLabel} — CORTE 65 × 65 mm (SANGRADO 3 mm)</text>
  </g>
  <g id="tarjetas_frente">
${frontCardsSvg}  </g>
</svg>`;

    fs.writeFileSync(frontSvgPath, frontSvgContent, 'utf8');
    generatedFiles.push(frontSvgPath);

    // --- CARA B: REVERSOS (Espejado Horizontal por Fila: [c2, c1, c0]) ---
    const backSvgPath = path.join(OUTPUT_SVG_DIR, `pliego_${String(s + 1).padStart(2, '0')}_reversos.svg`);
    let backCardsSvg = '';

    for (let r = 0; r < rows; r++) {
      const rowIndices = [r * cols + 2, r * cols + 1, r * cols + 0];

      for (let col = 0; col < cols; col++) {
        const cardIndex = rowIndices[col];
        const c = sheetCards[cardIndex];
        const cutX = marginXPt + col * (CARD_SIZE_PT + GUTTER_PT);
        const cutY = marginYPt + r * (CARD_SIZE_PT + GUTTER_PT);

        if (!c) {
          if (showGuides) {
            backCardsSvg += `    <rect x="${cutX.toFixed(2)}" y="${cutY.toFixed(2)}" width="${CARD_SIZE_PT.toFixed(2)}" height="${CARD_SIZE_PT.toFixed(2)}" fill="none" stroke="#e2e8f0" stroke-width="0.35" />\n`;
          }
          continue;
        }

        const theme = getCardTheme(c);
        const cardNumPad = String(c.card_number).padStart(3, '0');
        const colorMain = '#111111';
        const colorCorner = theme.cornerColor || 'rgba(255, 255, 255, 0.7)';

        // 1. Autor (máx 45 car.): Limpio, centrado, peso 600, no cursiva
        const autorText = stripMarkdown(c.creador);
        const autorLines = wrapTextToLines(autorText, 26);
        const autorFontSize = autorLines.length > 1 ? 8.0 : 8.8;
        const autorLeading = 10.4;
        const autorStartY = autorLines.length > 1 ? 24 : 29.5;
        let autorTspans = '';
        autorLines.forEach((line, i) => {
          autorTspans += `<tspan x="${(CARD_SIZE_PT / 2).toFixed(2)}" y="${autorStartY + i * autorLeading}">${escapeXml(line)}</tspan>`;
        });

        // 2. Trivia (máx 150 car.): En cursiva, masa equilibrada en zona inferior
        const triviaText = stripMarkdown(c.dato_curioso);
        const triviaLines = wrapTextToLines(triviaText, 30);
        const triviaFontSize = triviaLines.length <= 4 ? 7.2 : 6.8;
        const triviaLeading = triviaLines.length <= 4 ? 9.5 : 9.0;
        const triviaStartY = 118;
        let triviaTspans = '';
        triviaLines.forEach((line, i) => {
          triviaTspans += `<tspan x="${(CARD_SIZE_PT / 2).toFixed(2)}" y="${(triviaStartY + i * triviaLeading).toFixed(1)}">${escapeXml(line)}</tspan>`;
        });

        const cleanCardNum = String(c.card_number).padStart(3, '0');

        // Dimensiones con rebase (+3mm / 8.5pt hacia cada lado)
        const bleedX = (cutX - BLEED_PT).toFixed(2);
        const bleedY = (cutY - BLEED_PT).toFixed(2);
        const bleedW = (CARD_SIZE_PT + 2 * BLEED_PT).toFixed(2);
        const bleedH = (CARD_SIZE_PT + 2 * BLEED_PT).toFixed(2);

        let marksSvg = '';
        if (showMarks) {
          marksSvg = generateCropMarksSvg(cutX, cutY, CARD_SIZE_PT, CARD_SIZE_PT);
        }

        backCardsSvg += `    <!-- Tarjeta #${cardNumPad} Reverso -->
    <g id="carta_${cardNumPad}_reverso">
      ${marksSvg}
      <!-- Fondo con Sangrado Exterior 3mm (71x71 mm) -->
      <rect x="${bleedX}" y="${bleedY}" width="${bleedW}" height="${bleedH}" fill="${theme.bgHex}" />

      <!-- Contenido dentro del área de corte (65x65 mm) con margen de seguridad >= 8mm -->
      <g transform="translate(${cutX.toFixed(2)}, ${cutY.toFixed(2)})">
        <!-- Autor protegido (>= 8.5mm del borde superior) -->
        <text font-family="'Outfit', sans-serif" font-size="${autorFontSize}" font-weight="600" fill="${colorMain}" text-anchor="middle">
          ${autorTspans}
        </text>

        <!-- Año Heroico Centrado (y=100 pt, tamaño masivo 52 pt) -->
        <text x="${(CARD_SIZE_PT / 2).toFixed(2)}" y="100" font-family="'Space Grotesk', sans-serif" font-size="52" font-weight="900" letter-spacing="-1.8" fill="${colorMain}" text-anchor="middle">${c.year}</text>

        <!-- Trivia protegida -->
        <text font-family="'Outfit', sans-serif" font-size="${triviaFontSize}" font-weight="400" font-style="italic" fill="${colorMain}" text-anchor="middle">
          ${triviaTspans}
        </text>

        <!-- Metadatos de esquinas protegidos (>= 8mm del borde) -->
        <text x="${SAFE_MARGIN_PT.toFixed(2)}" y="161.5" font-family="'Outfit', sans-serif" font-size="5.4" font-weight="500" fill="${colorCorner}">${escapeXml(c.categoria)}</text>
        <text x="${(CARD_SIZE_PT - SAFE_MARGIN_PT).toFixed(2)}" y="161.5" font-family="'Space Grotesk', sans-serif" font-size="5.4" font-weight="500" fill="${colorCorner}" text-anchor="end">${cleanCardNum}</text>

        ${showGuides ? `<rect width="${CARD_SIZE_PT.toFixed(2)}" height="${CARD_SIZE_PT.toFixed(2)}" fill="none" stroke="rgba(0,0,0,0.18)" stroke-dasharray="2 2" stroke-width="0.35" />` : ''}
      </g>
    </g>\n`;
      }
    }

    const backSvgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${(pageWidthPt / MM_TO_PT).toFixed(1)}mm" height="${(pageHeightPt / MM_TO_PT).toFixed(1)}mm" viewBox="0 0 ${pageWidthPt} ${pageHeightPt}" style="background-color: #ffffff;">
  <g id="encabezado_pliego">
    <text x="${marginXPt.toFixed(2)}" y="${(marginYPt - 16).toFixed(2)}" font-family="'Outfit', sans-serif" font-size="7.5" font-weight="700" fill="#555555">HIT-TAZOS TECH — PLIEGO ${s + 1} DE ${totalSheets} [CARA B: REVERSOS ESPEJADOS]</text>
    <text x="${(marginXPt + gridWidthPt).toFixed(2)}" y="${(marginYPt - 16).toFixed(2)}" font-family="'Outfit', sans-serif" font-size="7.5" font-weight="700" fill="#555555" text-anchor="end">DÚPLEX: VOLTEAR POR EL BORDE LARGO (LONG EDGE DUPLEX)</text>
  </g>
  <g id="tarjetas_reverso">
${backCardsSvg}  </g>
</svg>`;

    fs.writeFileSync(backSvgPath, backSvgContent, 'utf8');
    generatedFiles.push(backSvgPath);
  }

  console.log(`✅ ${generatedFiles.length} pliegos SVG generados en: ${OUTPUT_SVG_DIR}/`);
  return generatedFiles;
}

// -------------------------------------------------------------
// Conversión de SVGs a PDF Vectorial con rsvg-convert y Cairo
// -------------------------------------------------------------
function compileEditablePdf(svgFiles, outputPdfPath) {
  console.log('🔄 Compilando PDF vectorial editable con rsvg-convert (Cairo TrueType)...');
  const tempPdfDir = path.join(ROOT_DIR, '.temp_pdf_pages');
  fs.mkdirSync(tempPdfDir, { recursive: true });

  const tempPdfs = [];
  try {
    svgFiles.forEach((svgPath, index) => {
      const pagePdf = path.join(tempPdfDir, `page_${String(index + 1).padStart(3, '0')}.pdf`);
      execSync(`rsvg-convert -f pdf -o "${pagePdf}" "${svgPath}"`);
      tempPdfs.push(pagePdf);
    });

    execSync(`pdfunite ${tempPdfs.map(p => `"${p}"`).join(' ')} "${outputPdfPath}"`);
    console.log(`🎉 ¡PDF vectorial editable generado exitosamente!\n   📂 ${outputPdfPath}`);
  } catch (err) {
    console.error('⚠️ Error al compilar PDF editable:', err.message);
  } finally {
    tempPdfs.forEach(p => {
      try { fs.unlinkSync(p); } catch (_) {}
    });
    try { fs.rmdirSync(tempPdfDir); } catch (_) {}
  }
}

// -------------------------------------------------------------
// Generador HTML (Vista Previa e Impresión Web)
// -------------------------------------------------------------
function generateHtmlPreview(cards, options) {
  const isSuperTabloid = options.format === '12x18';
  const cols = 3;
  const rows = isSuperTabloid ? 6 : 5;
  const cardsPerSheet = cols * rows;

  const totalSheets = Math.ceil(cards.length / cardsPerSheet);
  const showGuides = options.crop !== 'clean';
  let sheetsHtml = '';

  for (let s = 0; s < totalSheets; s++) {
    const sheetCards = cards.slice(s * cardsPerSheet, (s + 1) * cardsPerSheet);
    while (sheetCards.length < cardsPerSheet) {
      sheetCards.push(null);
    }

    // Frentes
    let frontGridHtml = '';
    sheetCards.forEach((c) => {
      if (!c) {
        frontGridHtml += `<div class="card-cell ${showGuides ? 'has-crop' : ''}"></div>`;
        return;
      }
      const theme = getCardTheme(c);
      const hito = formatMarkdown(c.hito);
      const numStr = `#${String(c.card_number).padStart(3, '0')}`;

      frontGridHtml += `
        <div class="card-cell ${showGuides ? 'has-crop' : ''}">
          <div class="card-bleed" style="--card-bg: ${theme.bg}; --card-front-bg: ${theme.frontBg};">
            <div class="card-cut face-front">
              <div class="topbar">
                <span class="group-title">${c.grupo_nombre}</span>
                <span class="category-name">${c.categoria_nombre}</span>
              </div>
              <div class="clue-stage">
                <p class="clue-text">${hito}</p>
              </div>
              <div class="footbar">
                <span class="cat-tag">${c.categoria}</span>
                <span class="card-num">${numStr}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    sheetsHtml += `
      <section class="sheet ${isSuperTabloid ? 'sheet-12x18' : 'sheet-11x17'}">
        <header class="sheet-meta">
          <span>HIT-TAZOS TECH — PLIEGO ${s + 1} DE ${totalSheets} [CARA A: FRENTES]</span>
          <span>${isSuperTabloid ? '12x18 PULG (305x457 mm)' : '11x17 PULG (279x432 mm)'} — CORTE 65x65mm (SANGRADO 3mm)</span>
        </header>
        <div class="grid-${cols}x${rows}">${frontGridHtml}</div>
      </section>
    `;

    // Reversos Espejados
    const mirroredIndices = [];
    for (let r = 0; r < rows; r++) {
      const base = r * cols;
      mirroredIndices.push(base + 2, base + 1, base);
    }

    let backGridHtml = '';
    mirroredIndices.forEach((idx) => {
      const c = sheetCards[idx];
      if (!c) {
        backGridHtml += `<div class="card-cell ${showGuides ? 'has-crop' : ''}"></div>`;
        return;
      }
      const theme = getCardTheme(c);
      const creador = formatMarkdown(c.creador);
      const trivia = formatMarkdown(c.dato_curioso);
      const cleanCardNum = String(c.card_number).padStart(3, '0');

      backGridHtml += `
        <div class="card-cell ${showGuides ? 'has-crop' : ''}">
          <div class="card-bleed" style="--card-bg: ${theme.bg};">
            <div class="card-cut face-back">
              <div class="back-author">${creador}</div>
              <div class="year-stage">${c.year}</div>
              <div class="back-trivia">${trivia}</div>
              <div class="footbar">
                <span class="cat-tag">${c.categoria}</span>
                <span class="card-num">${cleanCardNum}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    sheetsHtml += `
      <section class="sheet ${isSuperTabloid ? 'sheet-12x18' : 'sheet-11x17'}">
        <header class="sheet-meta">
          <span>HIT-TAZOS TECH — PLIEGO ${s + 1} DE ${totalSheets} [CARA B: REVERSOS ESPEJADOS]</span>
          <span>IMPRESIÓN DÚPLEX: VOLTEAR POR EL BORDE LARGO</span>
        </header>
        <div class="grid-${cols}x${rows}">${backGridHtml}</div>
      </section>
    `;
  }

  const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>HIT-TAZOS Tech — Imposición Profesional con Sangrado 3mm</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Outfit:wght@400;500;600;700;800&family=Space+Grotesk:wght@700;800;900&display=swap');
    @page { size: ${isSuperTabloid ? '12in 18in' : 'tabloid'} portrait; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { background: #dbeafe; font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; align-items: center; padding: 25px 0; }
    .sheet { background: #ffffff; margin-bottom: 30px; box-shadow: 0 12px 32px rgba(15,23,42,0.18); page-break-after: always; break-after: page; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; }
    .sheet-11x17 { width: 279.4mm; height: 431.8mm; }
    .sheet-12x18 { width: 304.8mm; height: 457.2mm; }
    .sheet-meta { position: absolute; top: 10mm; left: 30mm; right: 30mm; display: flex; justify-content: space-between; font-size: 7.5pt; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 0.5pt solid #cbd5e1; padding-bottom: 4px; }
    .grid-3x5 { display: grid; grid-template-columns: repeat(3, 71mm); grid-template-rows: repeat(5, 71mm); gap: 0mm; margin-top: 10mm; }
    .grid-3x6 { display: grid; grid-template-columns: repeat(3, 71mm); grid-template-rows: repeat(6, 71mm); gap: 0mm; margin-top: 10mm; }
    .card-cell { width: 71mm; height: 71mm; position: relative; display: flex; align-items: center; justify-content: center; }
    .has-crop::after { content: ''; position: absolute; width: 65mm; height: 65mm; outline: 0.4pt dashed rgba(255,255,255,0.4); pointer-events: none; z-index: 10; }
    .face-back.has-crop::after { outline-color: rgba(0,0,0,0.25); }
    .card-bleed { width: 71mm; height: 71mm; background: var(--card-bg); display: flex; align-items: center; justify-content: center; }
    .face-front.card-cut { background: var(--card-front-bg); color: #ffffff; }
    .face-back.card-cut { background: var(--card-bg); color: #111111; text-align: center; }
    .card-cut { width: 65mm; height: 65mm; padding: 8mm 8mm; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; }
    .topbar { display: flex; flex-direction: column; gap: 2px; border-bottom: 1px solid rgba(255,255,255,0.18); padding-bottom: 2.5px; }
    .group-title { font-size: 6.4pt; font-weight: 800; text-transform: uppercase; color: var(--card-bg); letter-spacing: 0.4px; }
    .category-name { font-size: 5.6pt; color: rgba(255,255,255,0.7); line-height: 1.25; }
    .clue-stage { flex: 1; display: flex; align-items: center; justify-content: flex-start; padding: 2mm 0; overflow: hidden; }
    .clue-text { font-size: 8.8pt; line-height: 1.4; color: #ffffff; text-align: left; }
    .footbar { display: flex; justify-content: space-between; align-items: flex-end; }
    .cat-tag, .card-num { font-size: 5.2pt; font-weight: 500; color: rgba(255, 255, 255, 0.7); }
    .face-front .cat-tag { color: rgba(255, 255, 255, 0.45); }
    .face-front .card-num { color: rgba(255, 255, 255, 0.55); font-family: 'Space Grotesk', sans-serif; }
    .face-back .card-num { font-family: 'Space Grotesk', sans-serif; }
    .back-author { font-size: 8.4pt; font-weight: 600; line-height: 1.2; min-height: 18px; display: flex; align-items: center; justify-content: center; }
    .year-stage { font-family: 'Space Grotesk', sans-serif; font-size: 50pt; font-weight: 900; letter-spacing: -1.8px; line-height: 0.88; margin: 1px 0; }
    .back-trivia { font-size: 7.2pt; font-style: italic; line-height: 1.35; flex: 1; display: flex; align-items: center; justify-content: center; padding: 0 1mm; }
    @media print { body { background: transparent !important; padding: 0 !important; } .sheet { box-shadow: none !important; margin: 0 !important; } }
  </style>
</head>
<body>${sheetsHtml}</body>
</html>`;

  fs.writeFileSync(OUTPUT_HTML_PATH, fullHtml, 'utf8');
  console.log(`✅ Archivo HTML de pliegos generado: ${OUTPUT_HTML_PATH}`);
}

function main() {
  const options = parseArgs();
  console.log('🎨 HIT-TAZOS TECH - Generador de Imposición Profesional (Sangrado 3mm, Margen 8mm, Crop Marks)');

  if (!fs.existsSync(CARDS_JSON_PATH)) {
    console.error('❌ No se encontró cards.json. Ejecuta primero `node build_cards.js`');
    process.exit(1);
  }

  let cards = JSON.parse(fs.readFileSync(CARDS_JSON_PATH, 'utf8'));
  console.log(`📦 Total de tarjetas disponibles: ${cards.length}`);
  console.log(`📐 Formato de pliego: ${options.format.toUpperCase()} | Marcas: ${options.crop.toUpperCase()}`);

  if (options.range === '15' || options.range === 'SAMPLE_15') {
    cards = cards.slice(0, 15);
    console.log('📄 Rango: Muestra de 1 pliego (15 cartas)');
  } else if (options.range === '18' || options.range === 'SAMPLE_18') {
    cards = cards.slice(0, 18);
    console.log('📄 Rango: Muestra de 1 pliego (18 cartas)');
  } else if (options.range === '30' || options.range === 'SAMPLE_30') {
    cards = cards.slice(0, 30);
    console.log('📄 Rango: Muestra de 2 pliegos (30 cartas)');
  } else {
    console.log(`📄 Rango: Baraja completa de ${cards.length} cartas`);
  }

  // 1. Generar HTML
  generateHtmlPreview(cards, options);

  // 2. Generar SVGs
  let svgFiles = [];
  if (options.svg || options.pdfEditable) {
    svgFiles = generateSvgSheets(cards, options);
  }

  // 3. Generar PDF Editable (TrueType Cairo)
  if (options.pdfEditable && svgFiles.length > 0) {
    compileEditablePdf(svgFiles, OUTPUT_EDITABLE_PDF_PATH);
  }

  // 4. Generar PDF con Chrome Headless si se solicita explícitamente
  if (options.pdf) {
    console.log('🔄 Exportando con Chrome Headless...');
    try {
      execSync(
        `google-chrome --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${OUTPUT_CHROME_PDF_PATH}" "file://${OUTPUT_HTML_PATH}"`,
        { stdio: 'inherit' }
      );
      console.log(`🎉 ¡PDF generado con Chrome!\n   📂 ${OUTPUT_CHROME_PDF_PATH}`);
    } catch (err) {
      console.error('⚠️ Error en Chrome:', err.message);
    }
  }

  console.log('\n✨ Salidas profesionales listas para imprenta:');
  if (options.svg) console.log(`   📂 Hojas SVG (Illustrator/Figma): ${OUTPUT_SVG_DIR}/`);
  if (options.pdfEditable) console.log(`   📂 PDF vectorial editable (Cairo): ${OUTPUT_EDITABLE_PDF_PATH}`);
  if (options.pdf) console.log(`   📂 PDF de Chrome:                 ${OUTPUT_CHROME_PDF_PATH}`);
}

main();
