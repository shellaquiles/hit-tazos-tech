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
const { execSync, spawnSync } = require('child_process');

const CARDS_FILE = path.join(__dirname, '../data/cards.json');
const CATALOG_FILE = path.join(__dirname, '../data/catalog.json');
const CONFIG_FILE = path.join(__dirname, '../data/card_colors.json');
const PRINT_DIR = path.resolve(__dirname);
const ROOT_DIR = path.resolve(__dirname, '..');
const CARDS_JSON_PATH = path.join(ROOT_DIR, 'data', 'cards.json');

let APP_VERSION = '1.0.0-rc.1';
try {
  APP_VERSION = fs.readFileSync(path.join(ROOT_DIR, 'VERSION'), 'utf8').trim();
} catch (e) {
  try {
    APP_VERSION = require('../package.json').version;
  } catch (_) {}
}

const ORG_NAME = 'Shellaquiles Org';
const ORG_URL = 'https://shellaquiles.org';
const REPO_URL = 'https://github.com/shellaquiles/hit-tazos-tech';

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
let catalog = { domains: {}, tags: {}, volumes: {} };
try {
  catalog = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'));
} catch (e) {
  console.warn('⚠️ No se encontró catalog.json, usando slugs nativos.');
}

try {
  cardColorsConfig = require('../data/card_colors.json');
} catch (e) {
  // Configuración ausente
}

function getCardTheme(card) {
  let cardNum = card.globalIndex !== undefined ? card.globalIndex : (card.index !== undefined ? card.index + 1 : 1);
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

const FORMAT_CONFIGS = {
  '11x17': {
    id: '11x17',
    name: 'Tabloide',
    label: '11 × 17 PULGADAS (279.4 × 431.8 mm) — TABLOIDE',
    shortLabel: '11 × 17 PULGADAS — TABLOIDE',
    widthInches: 11.0,
    heightInches: 17.0,
    cols: 3,
    rows: 5,
    cardsPerSheet: 15,
    svgDir: path.join(PRINT_DIR, 'pliegos_svg'),
    pdfPath: path.join(PRINT_DIR, 'tabloide_editable.pdf')
  },
  'carta': {
    id: 'carta',
    name: 'Carta',
    label: '8.5 × 11 PULGADAS (215.9 × 279.4 mm) — CARTA',
    shortLabel: '8.5 × 11 PULGADAS — CARTA',
    widthInches: 8.5,
    heightInches: 11.0,
    cols: 2,
    rows: 3,
    cardsPerSheet: 6,
    svgDir: path.join(PRINT_DIR, 'pliegos_carta_svg'),
    pdfPath: path.join(PRINT_DIR, 'carta_editable.pdf')
  },
  '12x18': {
    id: '12x18',
    name: 'Super Tabloide',
    label: '12 × 18 PULGADAS (304.8 × 457.2 mm) — SUPER TABLOIDE',
    shortLabel: '12 × 18 PULGADAS — SUPER TABLOIDE',
    widthInches: 12.0,
    heightInches: 18.0,
    cols: 3,
    rows: 6,
    cardsPerSheet: 18,
    svgDir: path.join(PRINT_DIR, 'pliegos_12x18_svg'),
    pdfPath: path.join(PRINT_DIR, 'super_tabloide_editable.pdf')
  }
};

function resolveFormat(formatStr) {
  const f = (formatStr || '').toLowerCase().trim();
  if (f === 'all' || f === 'ambos' || f === 'both') return 'all';
  if (f === 'carta' || f === 'letter' || f === '8.5x11' || f === '8.5*11') return 'carta';
  if (f === '11x17' || f === 'tabloide' || f === 'tabloid') return '11x17';
  if (f === '12x18' || f === 'supertabloide' || f === 'super-tabloide') return '12x18';
  return 'all';
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    range: 'ALL',        // 'ALL', 'sample', '15', '6', etc.
    crop: 'marks',       // 'marks' (cruces pro), 'guides' (guías punteadas), 'clean'
    format: 'all',       // 'all' (Tabloide y Carta), '11x17' (Tabloide), 'carta' (Carta), '12x18'
    svg: false,          // Exportar hojas SVG
    pdfEditable: false   // Exportar PDF vectorial editable con rsvg-convert y Cairo
  };

  args.forEach(arg => {
    if (arg === '--svg') options.svg = true;
    if (arg === '--pdf-editable' || arg === '--editable' || arg === '--pdf') {
      options.pdfEditable = true;
      options.svg = true;
    }
    if (arg.startsWith('--range=')) options.range = arg.split('=')[1];
    if (arg.startsWith('--crop=')) options.crop = arg.split('=')[1];
    if (arg.startsWith('--format=')) options.format = resolveFormat(arg.split('=')[1]);
  });

  // Si no se especifica nada, generar SVG + PDF editable por defecto
  if (!options.svg && !options.pdfEditable) {
    options.svg = true;
    options.pdfEditable = true;
  }

  return options;
}

// -------------------------------------------------------------
// Generador de Pliegos SVG para Illustrator / Figma / Inkscape
// -------------------------------------------------------------
function generateSvgSheets(cards, formatConfig, options) {
  const svgDir = formatConfig.svgDir;
  fs.mkdirSync(svgDir, { recursive: true });

  const cols = formatConfig.cols;
  const rows = formatConfig.rows;
  const cardsPerSheet = cols * rows;

  const pageWidthPt = formatConfig.widthInches * 72.0;
  const pageHeightPt = formatConfig.heightInches * 72.0;

  const gridWidthPt = cols * CARD_SIZE_PT + (cols - 1) * GUTTER_PT;
  const gridHeightPt = rows * CARD_SIZE_PT + (rows - 1) * GUTTER_PT;

  const marginXPt = (pageWidthPt - gridWidthPt) / 2.0;
  const marginYPt = (pageHeightPt - gridHeightPt) / 2.0;

  const totalSheets = Math.ceil(cards.length / cardsPerSheet);
  const showMarks = options.crop === 'marks';
  const showGuides = options.crop === 'guides';
  const generatedFiles = [];

  const paperLabel = formatConfig.shortLabel || formatConfig.label;

  for (let s = 0; s < totalSheets; s++) {
    const sheetCards = cards.slice(s * cardsPerSheet, (s + 1) * cardsPerSheet);
    while (sheetCards.length < cardsPerSheet) {
      sheetCards.push(null);
    }

    // --- CARA A: FRENTES ---
    const frontSvgPath = path.join(svgDir, `pliego_${String(s + 1).padStart(2, '0')}_frentes.svg`);
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
      const volId = c.id ? c.id.split('-')[0].replace('vol', '') : '0';
      const hexPart = c.id ? c.id.split('-')[1].substring(2) : '00';
      const numStr = `${volId}x${hexPart}`;
      const grupoText = escapeXml(stripMarkdown(catalog.domains[c.domain] || c.domain).toUpperCase());
      const catText = escapeXml(stripMarkdown(catalog.tags[c.tag] || c.tag));
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

      frontCardsSvg += `    <!-- Tarjeta ${numStr} Frente -->
    <g id="carta_${volId}_${hexPart}_frente">
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
        <text transform="translate(12, 161.5) rotate(-90)" font-family="'Outfit', sans-serif" font-size="5.4" font-weight="500" fill="rgba(255,255,255,0.15)" text-transform="uppercase">${escapeXml(catalog.volumes[c.volumen] || c.volumen)}</text>
        <text x="${(CARD_SIZE_PT - SAFE_MARGIN_PT).toFixed(2)}" y="161.5" font-family="'Space Grotesk', sans-serif" font-size="5.4" font-weight="500" fill="rgba(255,255,255,0.55)" text-anchor="end">${numStr}</text>

        ${showGuides ? `<rect width="${CARD_SIZE_PT.toFixed(2)}" height="${CARD_SIZE_PT.toFixed(2)}" fill="none" stroke="rgba(255,255,255,0.25)" stroke-dasharray="2 2" stroke-width="0.35" />` : ''}
      </g>
    </g>\n`;
    });

    const frontSvgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${(pageWidthPt / MM_TO_PT).toFixed(1)}mm" height="${(pageHeightPt / MM_TO_PT).toFixed(1)}mm" viewBox="0 0 ${pageWidthPt} ${pageHeightPt}" style="background-color: #ffffff;">
  <title>Hit-Tazos Tech v${APP_VERSION} — Pliego ${s + 1} (${paperLabel}) — Shellaquiles Org</title>
  <desc>Juego de cartas de trivia cronológica técnica desarrollado por Shellaquiles Org (${ORG_URL}). Licencia MIT.</desc>
  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:dc="http://purl.org/dc/elements/1.1/">
      <rdf:Description>
        <dc:title>Hit-Tazos Tech v${APP_VERSION} — Pliego ${s + 1} [CARA A: FRENTES]</dc:title>
        <dc:creator>${ORG_NAME} (${ORG_URL})</dc:creator>
        <dc:publisher>${ORG_NAME}</dc:publisher>
        <dc:identifier>${REPO_URL}</dc:identifier>
        <dc:relation>${ORG_URL}</dc:relation>
        <dc:rights>© 2026 ${ORG_NAME}. MIT License.</dc:rights>
        <dc:format>image/svg+xml</dc:format>
        <dc:language>es</dc:language>
      </rdf:Description>
    </rdf:RDF>
  </metadata>
  <g id="encabezado_pliego">
    <text x="${marginXPt.toFixed(2)}" y="${(marginYPt - 22).toFixed(2)}" font-family="'Outfit', sans-serif" font-size="6.8" font-weight="700" fill="#333333">HIT-TAZOS TECH v${APP_VERSION} — PLIEGO ${s + 1} DE ${totalSheets} [CARA A: FRENTES]</text>
    <text x="${(marginXPt + gridWidthPt).toFixed(2)}" y="${(marginYPt - 22).toFixed(2)}" font-family="'Outfit', sans-serif" font-size="6.8" font-weight="700" fill="#333333" text-anchor="end">${paperLabel} · shellaquiles.org</text>
    <text x="${marginXPt.toFixed(2)}" y="${(marginYPt - 12).toFixed(2)}" font-family="'Outfit', sans-serif" font-size="5.4" font-weight="500" fill="#777777">CORTE TERMINADO: 65 × 65 mm · SANGRADO: 3 mm · CALLE: 6 mm</text>
    <text x="${(marginXPt + gridWidthPt).toFixed(2)}" y="${(marginYPt - 12).toFixed(2)}" font-family="'Outfit', sans-serif" font-size="5.4" font-weight="500" fill="#777777" text-anchor="end">DÚPLEX: VOLTEAR POR EL BORDE LARGO (LONG EDGE)</text>
  </g>
  <g id="tarjetas_frente">
${frontCardsSvg}  </g>
  <g id="pie_pliego">
    <text x="${(pageWidthPt / 2).toFixed(2)}" y="${(pageHeightPt - 24).toFixed(2)}" font-family="'Outfit', sans-serif" font-size="5.8" font-weight="500" fill="#777777" text-anchor="middle">© 2026 ${ORG_NAME} · Hit-Tazos Tech v${APP_VERSION} · Licencia MIT · Descarga gratuita y actualizaciones en ${ORG_URL}</text>
  </g>
</svg>`;

    fs.writeFileSync(frontSvgPath, frontSvgContent, 'utf8');
    generatedFiles.push(frontSvgPath);

    // --- CARA B: REVERSOS (Espejado Horizontal por Fila: [cols-1, ..., 0]) ---
    const backSvgPath = path.join(svgDir, `pliego_${String(s + 1).padStart(2, '0')}_reversos.svg`);
    let backCardsSvg = '';

    for (let r = 0; r < rows; r++) {
      const rowIndices = [];
      for (let cIdx = cols - 1; cIdx >= 0; cIdx--) {
        rowIndices.push(r * cols + cIdx);
      }

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
        const volId = c.id ? c.id.split('-')[0].replace('vol', '') : '0';
        const hexPart = c.id ? c.id.split('-')[1].substring(2) : '00';
        const colorMain = '#111111';
        const colorCorner = theme.cornerColor || 'rgba(255, 255, 255, 0.7)';

        // 1. Autor (máx 45 car.): Limpio, centrado, peso 600, no cursiva
        const autorText = stripMarkdown(c.autor || c.creador);
        const autorLines = wrapTextToLines(autorText, 26);
        const autorFontSize = autorLines.length > 1 ? 8.0 : 8.8;
        const autorLeading = 10.4;
        const autorStartY = autorLines.length > 1 ? 24 : 29.5;
        let autorTspans = '';
        autorLines.forEach((line, i) => {
          autorTspans += `<tspan x="${(CARD_SIZE_PT / 2).toFixed(2)}" y="${autorStartY + i * autorLeading}">${escapeXml(line)}</tspan>`;
        });

        // 2. Trivia (máx 150 car.): En cursiva, masa equilibrada en zona inferior
        const triviaText = stripMarkdown(c.trivia || c.dato_curioso);
        const triviaLines = wrapTextToLines(triviaText, 30);
        const triviaFontSize = triviaLines.length <= 4 ? 7.2 : 6.8;
        const triviaLeading = triviaLines.length <= 4 ? 9.5 : 9.0;
        const triviaStartY = 118;
        let triviaTspans = '';
        triviaLines.forEach((line, i) => {
          triviaTspans += `<tspan x="${(CARD_SIZE_PT / 2).toFixed(2)}" y="${(triviaStartY + i * triviaLeading).toFixed(1)}">${escapeXml(line)}</tspan>`;
        });

        const cleanCardNum = `${volId}x${hexPart}`;

        // Dimensiones con rebase (+3mm / 8.5pt hacia cada lado)
        const bleedX = (cutX - BLEED_PT).toFixed(2);
        const bleedY = (cutY - BLEED_PT).toFixed(2);
        const bleedW = (CARD_SIZE_PT + 2 * BLEED_PT).toFixed(2);
        const bleedH = (CARD_SIZE_PT + 2 * BLEED_PT).toFixed(2);

        let marksSvg = '';
        if (showMarks) {
          marksSvg = generateCropMarksSvg(cutX, cutY, CARD_SIZE_PT, CARD_SIZE_PT);
        }

        backCardsSvg += `    <!-- Tarjeta ${cleanCardNum} Reverso -->
    <g id="carta_${volId}_${hexPart}_reverso">
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
        <text transform="translate(12, 161.5) rotate(-90)" font-family="'Outfit', sans-serif" font-size="5.4" font-weight="500" fill="${colorCorner}" text-transform="uppercase">${escapeXml(catalog.volumes[c.volumen] || c.volumen)}</text>
        <text x="${(CARD_SIZE_PT - SAFE_MARGIN_PT).toFixed(2)}" y="161.5" font-family="'Space Grotesk', sans-serif" font-size="5.4" font-weight="500" fill="${colorCorner}" text-anchor="end">${cleanCardNum}</text>

        ${showGuides ? `<rect width="${CARD_SIZE_PT.toFixed(2)}" height="${CARD_SIZE_PT.toFixed(2)}" fill="none" stroke="rgba(0,0,0,0.18)" stroke-dasharray="2 2" stroke-width="0.35" />` : ''}
      </g>
    </g>\n`;
      }
    }

    const backSvgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${(pageWidthPt / MM_TO_PT).toFixed(1)}mm" height="${(pageHeightPt / MM_TO_PT).toFixed(1)}mm" viewBox="0 0 ${pageWidthPt} ${pageHeightPt}" style="background-color: #ffffff;">
  <title>Hit-Tazos Tech v${APP_VERSION} — Pliego ${s + 1} (${paperLabel}) [Reversos] — Shellaquiles Org</title>
  <desc>Juego de cartas de trivia cronológica técnica desarrollado por Shellaquiles Org (${ORG_URL}). Licencia MIT.</desc>
  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:dc="http://purl.org/dc/elements/1.1/">
      <rdf:Description>
        <dc:title>Hit-Tazos Tech v${APP_VERSION} — Pliego ${s + 1} [CARA B: REVERSOS ESPEJADOS]</dc:title>
        <dc:creator>${ORG_NAME} (${ORG_URL})</dc:creator>
        <dc:publisher>${ORG_NAME}</dc:publisher>
        <dc:identifier>${REPO_URL}</dc:identifier>
        <dc:relation>${ORG_URL}</dc:relation>
        <dc:rights>© 2026 ${ORG_NAME}. MIT License.</dc:rights>
        <dc:format>image/svg+xml</dc:format>
        <dc:language>es</dc:language>
      </rdf:Description>
    </rdf:RDF>
  </metadata>
  <g id="encabezado_pliego">
    <text x="${marginXPt.toFixed(2)}" y="${(marginYPt - 22).toFixed(2)}" font-family="'Outfit', sans-serif" font-size="6.8" font-weight="700" fill="#333333">HIT-TAZOS TECH v${APP_VERSION} — PLIEGO ${s + 1} DE ${totalSheets} [CARA B: REVERSOS ESPEJADOS]</text>
    <text x="${(marginXPt + gridWidthPt).toFixed(2)}" y="${(marginYPt - 22).toFixed(2)}" font-family="'Outfit', sans-serif" font-size="6.8" font-weight="700" fill="#333333" text-anchor="end">${paperLabel} · shellaquiles.org</text>
    <text x="${marginXPt.toFixed(2)}" y="${(marginYPt - 12).toFixed(2)}" font-family="'Outfit', sans-serif" font-size="5.4" font-weight="500" fill="#777777">CORTE TERMINADO: 65 × 65 mm · SANGRADO: 3 mm · CALLE: 6 mm</text>
    <text x="${(marginXPt + gridWidthPt).toFixed(2)}" y="${(marginYPt - 12).toFixed(2)}" font-family="'Outfit', sans-serif" font-size="5.4" font-weight="500" fill="#777777" text-anchor="end">DÚPLEX: VOLTEAR POR EL BORDE LARGO (LONG EDGE)</text>
  </g>
  <g id="tarjetas_reverso">
${backCardsSvg}  </g>
  <g id="pie_pliego">
    <text x="${(pageWidthPt / 2).toFixed(2)}" y="${(pageHeightPt - 24).toFixed(2)}" font-family="'Outfit', sans-serif" font-size="5.8" font-weight="500" fill="#777777" text-anchor="middle">© 2026 ${ORG_NAME} · Hit-Tazos Tech v${APP_VERSION} · Licencia MIT · Descarga gratuita y actualizaciones en ${ORG_URL}</text>
  </g>
</svg>`;

    fs.writeFileSync(backSvgPath, backSvgContent, 'utf8');
    generatedFiles.push(backSvgPath);
  }

  console.log(`✅ ${generatedFiles.length} pliegos SVG generados en: ${svgDir}/`);
  return generatedFiles;
}

// -------------------------------------------------------------
// Inyección de Metadatos Oficiales en PDF con PyPDF2
// -------------------------------------------------------------
function attachPdfMetadata(pdfPath, formatConfig, version) {
  const pyScript = `
import PyPDF2

pdf_path = ${JSON.stringify(pdfPath)}
try:
    reader = PyPDF2.PdfReader(pdf_path)
    writer = PyPDF2.PdfWriter()
    for page in reader.pages:
        writer.add_page(page)

    metadata = {
        '/Title': 'Hit-Tazos Tech v${version} — Mazo Imprimible (${formatConfig.name})',
        '/Author': '${ORG_NAME} (${ORG_URL})',
        '/Subject': 'Juego de cartas y trivia cronológica técnica — Universo Python, Software, DevOps, IA y Cultura Hacker',
        '/Creator': 'Hit-Tazos Tech Imposition Engine — ${ORG_NAME}',
        '/Producer': '${ORG_NAME} (${ORG_URL})',
        '/Keywords': 'hit-tazos, hit-tazos-tech, shellaquiles, shellaquiles.org, trivia, python, linux, devops, ai, open-source, board-game, print-and-play'
    }
    writer.add_metadata(metadata)

    with open(pdf_path, 'wb') as f:
        writer.write(f)
except Exception as e:
    import sys
    sys.stderr.write(str(e))
    sys.exit(1)
`;

  try {
    const res = spawnSync('python3', ['-c', pyScript], { encoding: 'utf8' });
    if (res.status !== 0) {
      throw new Error(res.stderr || res.stdout);
    }
    console.log(`   🏷️  Metadatos incrustados: ${ORG_NAME} · v${version}`);
  } catch (err) {
    console.warn(`   ⚠️ Advertencia al incrustar metadatos PDF: ${err.message}`);
  }
}

// -------------------------------------------------------------
// Conversión de SVGs a PDF Vectorial con rsvg-convert y Cairo
// -------------------------------------------------------------
function compileEditablePdf(svgFiles, outputPdfPath, aliasPdfPath, formatConfig) {
  console.log(`🔄 Compilando PDF vectorial editable con rsvg-convert (Cairo TrueType)...`);
  const tempPdfDir = path.join(ROOT_DIR, `.temp_pdf_pages_${formatConfig.name.toLowerCase()}`);
  fs.mkdirSync(tempPdfDir, { recursive: true });

  const tempPdfs = [];
  try {
    svgFiles.forEach((svgPath, index) => {
      const pagePdf = path.join(tempPdfDir, `page_${String(index + 1).padStart(3, '0')}.pdf`);
      execSync(`rsvg-convert -f pdf -o "${pagePdf}" "${svgPath}"`);
      tempPdfs.push(pagePdf);
    });

    execSync(`pdfunite ${tempPdfs.map(p => `"${p}"`).join(' ')} "${outputPdfPath}"`);
    console.log(`   📄 Archivo distribuible compilado: ${path.basename(outputPdfPath)}`);

    // Inyectar metadatos oficiales de Shellaquiles Org
    attachPdfMetadata(outputPdfPath, formatConfig, APP_VERSION);

    console.log(`🎉 ¡PDF vectorial editable listo para distribución!\n   📂 ${outputPdfPath}`);
  } catch (err) {
    console.error('⚠️ Error al compilar PDF editable:', err.message);
  } finally {
    tempPdfs.forEach(p => {
      try { fs.unlinkSync(p); } catch (_) {}
    });
    try { fs.rmdirSync(tempPdfDir); } catch (_) {}
  }
}

function processFormat(formatConfig, allCards, options) {
  console.log(`\n======================================================`);
  console.log(`📐 Procesando formato: ${formatConfig.name.toUpperCase()} (${formatConfig.label})`);
  console.log(`   Rejilla: ${formatConfig.cols} col x ${formatConfig.rows} filas (${formatConfig.cardsPerSheet} cartas por pliego)`);
  console.log(`======================================================`);

  let cards = allCards;
  if (options.range === 'sample' || options.range === '1sheet') {
    cards = allCards.slice(0, formatConfig.cardsPerSheet);
    console.log(`📄 Rango: Muestra de 1 pliego (${cards.length} cartas)`);
  } else if (!isNaN(parseInt(options.range, 10)) && options.range !== 'ALL') {
    const limit = parseInt(options.range, 10);
    cards = allCards.slice(0, limit);
    console.log(`📄 Rango: Muestra limitada a ${cards.length} cartas`);
  } else {
    console.log(`📄 Rango: Baraja completa de ${cards.length} cartas`);
  }

  // 1. Generar SVGs
  let svgFiles = [];
  if (options.svg || options.pdfEditable) {
    svgFiles = generateSvgSheets(cards, formatConfig, options);
  }

  // 2. Generar PDF Editable (TrueType Cairo)
  if (options.pdfEditable && svgFiles.length > 0) {
    compileEditablePdf(svgFiles, formatConfig.pdfPath, formatConfig.aliasPdfPath, formatConfig);
  }

  return {
    format: formatConfig.name,
    svgCount: svgFiles.length,
    svgDir: formatConfig.svgDir,
    pdfPath: formatConfig.pdfPath
  };
}

function main() {
  const options = parseArgs();
  console.log(`🎨 HIT-TAZOS TECH v${APP_VERSION} - Imposición Profesional (${ORG_NAME} · ${ORG_URL})`);

  if (!fs.existsSync(CARDS_JSON_PATH)) {
    console.error('❌ No se encontró cards.json. Ejecuta primero `node scripts/build_cards.js`');
    process.exit(1);
  }

  const cards = JSON.parse(fs.readFileSync(CARDS_JSON_PATH, 'utf8'));
  cards.forEach((c, idx) => c.globalIndex = idx + 1);
  console.log(`📦 Total de tarjetas disponibles: ${cards.length}`);
  console.log(`📐 Modo de formato: ${options.format.toUpperCase()} | Marcas: ${options.crop.toUpperCase()}`);

  const formatsToProcess = [];
  if (options.format === 'all') {
    formatsToProcess.push(FORMAT_CONFIGS['11x17']);
    formatsToProcess.push(FORMAT_CONFIGS['carta']);
  } else if (FORMAT_CONFIGS[options.format]) {
    formatsToProcess.push(FORMAT_CONFIGS[options.format]);
  } else {
    console.error(`❌ Formato desconocido: ${options.format}. Formatos disponibles: 11x17, carta, 12x18, all`);
    process.exit(1);
  }

  const results = [];
  for (const fmt of formatsToProcess) {
    results.push(processFormat(fmt, cards, options));
  }

  console.log('\n======================================================');
  console.log(`✨ RESUMEN DE DISTRIBUCIÓN — HIT-TAZOS TECH v${APP_VERSION} (${ORG_URL})`);
  for (const res of results) {
    console.log(`  📄 Formato [${res.format.toUpperCase()}]:`);
    if (options.svg) console.log(`     📂 SVGs (${res.svgCount} pliegos): ${res.svgDir}/`);
    if (options.pdfEditable) {
      console.log(`     📕 PDF Oficial de Distribución: ${path.basename(res.pdfPath)}`);
      console.log(`        └─ Ruta: ${res.pdfPath}`);
    }
  }
  console.log('======================================================\n');
}

main();
