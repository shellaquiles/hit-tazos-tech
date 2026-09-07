#!/usr/bin/env node
/**
 * HITSTER Tech Edition - Generador de Imposición Dúplex para Tabloide (11x17)
 * 100% Vectorial, Editable en Adobe Illustrator, Affinity Designer, Figma e Inkscape.
 * 
 * Genera:
 * 1. Pliegos SVG individuales en 'tabloide_pliegos_svg/' con capas (<g id="carta_001">),
 *    textos nativos editables (<text>) y guías de corte milimétricas.
 * 2. PDF vectorial editable 'tabloide_editable.pdf' (compilado con rsvg-convert y Cairo,
 *    con fuentes TrueType, sin Type 3 fonts ni rasterizados).
 * 3. Archivo HTML autoconclusivo 'tabloide_impresion.html' para vista previa o impresión web.
 * 
 * Uso:
 *   node render_print_tabloid.js [--svg] [--pdf-editable] [--pdf] [--range=18|36|ALL] [--crop=guides|clean]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname);
const CARDS_JSON_PATH = path.join(ROOT_DIR, 'cards.json');
const OUTPUT_HTML_PATH = path.join(ROOT_DIR, 'tabloide_impresion.html');
const OUTPUT_CHROME_PDF_PATH = path.join(ROOT_DIR, 'tabloide_impresion.pdf');
const OUTPUT_EDITABLE_PDF_PATH = path.join(ROOT_DIR, 'tabloide_editable.pdf');
const OUTPUT_SVG_DIR = path.join(ROOT_DIR, 'tabloide_pliegos_svg');

// Dimensiones Tabloide (11 x 17 pulgadas / 279.4 x 431.8 mm)
const PAGE_WIDTH_PT = 792.0;    // 11 * 72
const PAGE_HEIGHT_PT = 1224.0;  // 17 * 72
const CARD_SIZE_PT = 184.252;   // 65 mm en puntos
const CARDS_COLS = 3;
const CARDS_ROWS = 6;
const CARDS_PER_SHEET = 18;

const GRID_WIDTH_PT = CARDS_COLS * CARD_SIZE_PT;   // 552.756 pt
const GRID_HEIGHT_PT = CARDS_ROWS * CARD_SIZE_PT;  // 1105.512 pt
const MARGIN_X_PT = (PAGE_WIDTH_PT - GRID_WIDTH_PT) / 2.0;   // ~119.62 pt (42.2 mm)
const MARGIN_Y_PT = (PAGE_HEIGHT_PT - GRID_HEIGHT_PT) / 2.0; // ~59.24 pt (20.9 mm)

let cardColorsConfig = null;
try {
  cardColorsConfig = require('./card_colors.json');
} catch (e) {
  // archivo de configuración ausente o no generado
}

// Paleta de colores Hitster (obtenida de card_colors.json o calculada como respaldo)
function getHitsterCardTheme(card) {
  let cardNum = card.card_number || 1;
  if (cardColorsConfig && cardColorsConfig.cards && cardColorsConfig.cards[cardNum]) {
    const c = cardColorsConfig.cards[cardNum];
    return {
      bg: c.bg_hsl,
      frontBg: c.front_bg_hsl,
      bgHex: c.bg_hex,
      frontBgHex: c.front_bg_hex,
      accentHex: c.accent_hex,
      textColor: '#111111',
      cornerColor: c.corner_color || 'rgba(255, 255, 255, 0.7)'
    };
  }

  const blockIndex = Math.floor(((cardNum - 1) % 100) / 10);
  const subStep = ((cardNum - 1) % 10) / 9;

  const paletteBlocks = [
    { h1: 350, h2: 356, s1: 72, s2: 88, l1: 68, l2: 50 }, // 01-10: Rojo
    { h1: 268, h2: 276, s1: 58, s2: 78, l1: 72, l2: 52 }, // 11-20: Violeta
    { h1: 22, h2: 28, s1: 78, s2: 92, l1: 68, l2: 52 },   // 21-30: Naranja
    { h1: 280, h2: 290, s1: 45, s2: 65, l1: 74, l2: 55 }, // 31-40: Lavanda
    { h1: 42, h2: 48, s1: 82, s2: 96, l1: 72, l2: 54 },   // 41-50: Amarillo
    { h1: 245, h2: 258, s1: 48, s2: 70, l1: 75, l2: 55 }, // 51-60: Lila
    { h1: 68, h2: 82, s1: 72, s2: 85, l1: 70, l2: 54 },   // 61-70: Lima
    { h1: 172, h2: 192, s1: 62, s2: 82, l1: 70, l2: 52 }, // 71-80: Turquesa
    { h1: 335, h2: 345, s1: 68, s2: 86, l1: 72, l2: 52 }, // 81-90: Rosa
    { h1: 32, h2: 38, s1: 65, s2: 82, l1: 70, l2: 52 }    // 91-100: Ocre
  ];

  const currentBlock = paletteBlocks[blockIndex] || paletteBlocks[0];
  const hue = currentBlock.h1 + (currentBlock.h2 - currentBlock.h1) * subStep;
  const saturation = currentBlock.s1 + (currentBlock.s2 - currentBlock.s1) * subStep;
  const lightness = currentBlock.l1 + (currentBlock.l2 - currentBlock.l1) * subStep;

  // HSL a HEX para SVG
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

  return {
    bg: `hsl(${hue.toFixed(1)}, ${saturation.toFixed(0)}%, ${lightness.toFixed(0)}%)`,
    frontBg: `hsl(${hue.toFixed(1)}, 35%, 10%)`,
    bgHex: hslToHex(hue, saturation, lightness),
    frontBgHex: hslToHex(hue, 35, 10),
    accentHex: hslToHex(hue, saturation, lightness),
    textColor: lightness > 62 ? '#151217' : '#ffffff'
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

// Divide texto en líneas para SVG nativo (<text><tspan>)
function wrapTextToLines(text, maxCharsPerLine = 32) {
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

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    range: 'ALL',        // '18', '36', 'ALL'
    crop: 'guides',      // 'guides', 'clean'
    pdf: false,          // Chrome PDF
    svg: false,          // Exportar hojas SVG
    pdfEditable: false   // Exportar PDF editable con rsvg-convert y Cairo
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
  });

  // Si no se especifica nada, generar SVG + PDF editable por defecto para herramientas de diseño
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
  const totalSheets = Math.ceil(cards.length / CARDS_PER_SHEET);
  const hasBorder = options.crop !== 'clean';
  const generatedFiles = [];

  for (let s = 0; s < totalSheets; s++) {
    const sheetCards = cards.slice(s * CARDS_PER_SHEET, (s + 1) * CARDS_PER_SHEET);
    while (sheetCards.length < CARDS_PER_SHEET) {
      sheetCards.push(null);
    }

    // --- CARA A: FRENTES ---
    const frontSvgPath = path.join(OUTPUT_SVG_DIR, `pliego_${String(s + 1).padStart(2, '0')}_frentes.svg`);
    let frontCardsSvg = '';

    sheetCards.forEach((c, idx) => {
      const col = idx % CARDS_COLS;
      const row = Math.floor(idx / CARDS_COLS);
      const x = (MARGIN_X_PT + col * CARD_SIZE_PT).toFixed(2);
      const y = (MARGIN_Y_PT + row * CARD_SIZE_PT).toFixed(2);

      if (!c) {
        if (hasBorder) {
          frontCardsSvg += `    <rect x="${x}" y="${y}" width="${CARD_SIZE_PT.toFixed(2)}" height="${CARD_SIZE_PT.toFixed(2)}" fill="none" stroke="#cccccc" stroke-width="0.35" />\n`;
        }
        return;
      }

      const theme = getHitsterCardTheme(c);
      const cardNumPad = String(c.card_number).padStart(3, '0');
      const numStr = `#${cardNumPad}`;
      const grupoText = escapeXml(stripMarkdown(c.grupo_nombre).toUpperCase());
      const catText = escapeXml(stripMarkdown(c.categoria_nombre));
      const clueText = stripMarkdown(c.hito);
      
      // Con textos limitados (máx 145 caracteres), ajuste tipográfico óptimo
      const clueMaxChars = 30;
      const clueLines = wrapTextToLines(clueText, clueMaxChars);
      const clueFontSize = clueLines.length <= 4 ? 9.2 : (clueLines.length === 5 ? 8.8 : 8.4);
      const clueLeading = clueLines.length <= 4 ? 13.5 : (clueLines.length === 5 ? 12.8 : 12.0);

      // Centrado vertical óptico exacto entre divisor (y=31.5) y pie (y=164)
      const totalClueH = (clueLines.length - 1) * clueLeading;
      const clueStartY = 33 + ((163 - 33) - totalClueH) / 2.0;

      let clueTspans = '';
      clueLines.forEach((line, i) => {
        clueTspans += `<tspan x="16" y="${(clueStartY + i * clueLeading).toFixed(1)}">${escapeXml(line)}</tspan>`;
      });

      frontCardsSvg += `    <g id="carta_${cardNumPad}_frente" transform="translate(${x}, ${y})">
      <clipPath id="clip_frente_${cardNumPad}">
        <rect width="${CARD_SIZE_PT.toFixed(2)}" height="${CARD_SIZE_PT.toFixed(2)}" />
      </clipPath>
      <g clip-path="url(#clip_frente_${cardNumPad})">
        <rect width="${CARD_SIZE_PT.toFixed(2)}" height="${CARD_SIZE_PT.toFixed(2)}" fill="${theme.frontBgHex}" />
        <text x="16" y="19" font-family="'Outfit', sans-serif" font-size="6.4" font-weight="700" fill="${theme.accentHex}">${grupoText}</text>
        <text x="16" y="27" font-family="'Outfit', sans-serif" font-size="5.8" font-weight="400" fill="#a0aec0">${catText}</text>
        <line x1="16" y1="31.5" x2="${(CARD_SIZE_PT - 16).toFixed(2)}" y2="31.5" stroke="rgba(255,255,255,0.15)" stroke-width="0.5" />
        <text font-family="'Outfit', sans-serif" font-size="${clueFontSize}" font-weight="400" fill="#ffffff">
          ${clueTspans}
        </text>
        <text x="12" y="${(CARD_SIZE_PT - 10).toFixed(2)}" font-family="'Outfit', sans-serif" font-size="5.2" font-weight="500" fill="rgba(255,255,255,0.45)">${escapeXml(c.categoria)}</text>
        <text x="${(CARD_SIZE_PT - 12).toFixed(2)}" y="${(CARD_SIZE_PT - 10).toFixed(2)}" font-family="'Space Grotesk', sans-serif" font-size="5.2" font-weight="500" fill="rgba(255,255,255,0.55)" text-anchor="end">${numStr}</text>
      </g>
      ${hasBorder ? `<rect width="${CARD_SIZE_PT.toFixed(2)}" height="${CARD_SIZE_PT.toFixed(2)}" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="0.35" />` : ''}
    </g>\n`;
    });

    const frontSvgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="279.4mm" height="431.8mm" viewBox="0 0 ${PAGE_WIDTH_PT} ${PAGE_HEIGHT_PT}" style="background-color: #ffffff;">
  <g id="encabezado_pliego">
    <text x="${MARGIN_X_PT}" y="${MARGIN_Y_PT - 14}" font-family="'Outfit', sans-serif" font-size="7.5" font-weight="700" fill="#555555">HITSTER TECH EDITION — PLIEGO TABLOIDE ${s + 1} DE ${totalSheets} [CARA A: FRENTES]</text>
    <text x="${MARGIN_X_PT + GRID_WIDTH_PT}" y="${MARGIN_Y_PT - 14}" font-family="'Outfit', sans-serif" font-size="7.5" font-weight="700" fill="#555555" text-anchor="end">11 × 17 PULGADAS (279.4 × 431.8 mm) — CORTE 65 × 65 mm</text>
  </g>
  <g id="tarjetas_frente">
${frontCardsSvg}  </g>
</svg>`;

    fs.writeFileSync(frontSvgPath, frontSvgContent, 'utf8');
    generatedFiles.push(frontSvgPath);

    // --- CARA B: REVERSOS (Espejado Horizontal por Fila: [2, 1, 0]) ---
    const backSvgPath = path.join(OUTPUT_SVG_DIR, `pliego_${String(s + 1).padStart(2, '0')}_reversos.svg`);
    let backCardsSvg = '';

    for (let r = 0; r < CARDS_ROWS; r++) {
      const rowIndices = [r * CARDS_COLS + 2, r * CARDS_COLS + 1, r * CARDS_COLS + 0];

      for (let col = 0; col < CARDS_COLS; col++) {
        const cardIndex = rowIndices[col];
        const c = sheetCards[cardIndex];
        const x = (MARGIN_X_PT + col * CARD_SIZE_PT).toFixed(2);
        const y = (MARGIN_Y_PT + r * CARD_SIZE_PT).toFixed(2);

        if (!c) {
          if (hasBorder) {
            backCardsSvg += `    <rect x="${x}" y="${y}" width="${CARD_SIZE_PT.toFixed(2)}" height="${CARD_SIZE_PT.toFixed(2)}" fill="none" stroke="#cccccc" stroke-width="0.35" />\n`;
          }
          continue;
        }

        const theme = getHitsterCardTheme(c);
        const cardNumPad = String(c.card_number).padStart(3, '0');
        
        // En el juego original Hitster, TODOS los textos donde está el año son NEGROS (#111111)
        const colorMain = '#111111';
        // Metadatos de esquinas discretos, en color diferente para no llamar la atención (blanco sutil)
        const colorCorner = theme.cornerColor || 'rgba(255, 255, 255, 0.7)';

        // 1. Autor (máx 45 chars): Limpio, centrado, peso medio (como 'Flans' en la tarjeta original)
        const autorText = stripMarkdown(c.creador);
        const autorLines = wrapTextToLines(autorText, 28);
        const autorFontSize = autorLines.length > 1 ? 8.0 : 8.8;
        const autorLeading = 10.2;
        const autorStartY = autorLines.length > 1 ? 23 : 28.5;
        let autorTspans = '';
        autorLines.forEach((line, i) => {
          autorTspans += `<tspan x="${(CARD_SIZE_PT / 2).toFixed(2)}" y="${autorStartY + i * autorLeading}">${escapeXml(line)}</tspan>`;
        });

        // 2. Trivia (máx 150 chars): En cursiva en la parte inferior (como 'Bazar' en la original)
        const triviaText = stripMarkdown(c.dato_curioso);
        const triviaMaxChars = 32;
        const triviaLines = wrapTextToLines(triviaText, triviaMaxChars);
        const triviaFontSize = triviaLines.length <= 4 ? 7.4 : 7.0;
        const triviaLeading = triviaLines.length <= 4 ? 9.8 : 9.2;

        // Distribución Hitster: año masivo al centro (y=104) y trivia abajo
        const triviaStartY = 125;
        let triviaTspans = '';
        triviaLines.forEach((line, i) => {
          triviaTspans += `<tspan x="${(CARD_SIZE_PT / 2).toFixed(2)}" y="${(triviaStartY + i * triviaLeading).toFixed(1)}">${escapeXml(line)}</tspan>`;
        });

        // Número de tarjeta limpio sin hash (idéntico a '102' en la tarjeta física original)
        const cleanCardNum = String(c.card_number).padStart(3, '0');

        backCardsSvg += `    <g id="carta_${cardNumPad}_reverso" transform="translate(${x}, ${y})">
      <clipPath id="clip_reverso_${cardNumPad}">
        <rect width="${CARD_SIZE_PT.toFixed(2)}" height="${CARD_SIZE_PT.toFixed(2)}" />
      </clipPath>
      <g clip-path="url(#clip_reverso_${cardNumPad})">
        <rect width="${CARD_SIZE_PT.toFixed(2)}" height="${CARD_SIZE_PT.toFixed(2)}" fill="${theme.bgHex}" />
        <text font-family="'Outfit', sans-serif" font-size="${autorFontSize}" font-weight="600" fill="${colorMain}" text-anchor="middle">
          ${autorTspans}
        </text>
        <text x="${(CARD_SIZE_PT / 2).toFixed(2)}" y="104" font-family="'Space Grotesk', sans-serif" font-size="54" font-weight="900" letter-spacing="-1.8" fill="${colorMain}" text-anchor="middle">${c.year}</text>
        <text font-family="'Outfit', sans-serif" font-size="${triviaFontSize}" font-weight="400" font-style="italic" fill="${colorMain}" text-anchor="middle">
          ${triviaTspans}
        </text>
        <text x="12" y="${(CARD_SIZE_PT - 10).toFixed(2)}" font-family="'Outfit', sans-serif" font-size="5.2" font-weight="500" fill="${colorCorner}">${escapeXml(c.categoria)}</text>
        <text x="${(CARD_SIZE_PT - 12).toFixed(2)}" y="${(CARD_SIZE_PT - 10).toFixed(2)}" font-family="'Space Grotesk', sans-serif" font-size="5.2" font-weight="500" fill="${colorCorner}" text-anchor="end">${cleanCardNum}</text>
      </g>
      ${hasBorder ? `<rect width="${CARD_SIZE_PT.toFixed(2)}" height="${CARD_SIZE_PT.toFixed(2)}" fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="0.35" />` : ''}
    </g>\n`;
      }
    }

    const backSvgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="279.4mm" height="431.8mm" viewBox="0 0 ${PAGE_WIDTH_PT} ${PAGE_HEIGHT_PT}" style="background-color: #ffffff;">
  <g id="encabezado_pliego">
    <text x="${MARGIN_X_PT}" y="${MARGIN_Y_PT - 14}" font-family="'Outfit', sans-serif" font-size="7.5" font-weight="700" fill="#555555">HITSTER TECH EDITION — PLIEGO TABLOIDE ${s + 1} DE ${totalSheets} [CARA B: REVERSOS ESPEJADOS]</text>
    <text x="${MARGIN_X_PT + GRID_WIDTH_PT}" y="${MARGIN_Y_PT - 14}" font-family="'Outfit', sans-serif" font-size="7.5" font-weight="700" fill="#555555" text-anchor="end">DÚPLEX: VOLTEAR POR EL BORDE LARGO</text>
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

    // Unir todas las páginas en un único PDF multipágina
    execSync(`pdfunite ${tempPdfs.map(p => `"${p}"`).join(' ')} "${outputPdfPath}"`);
    console.log(`🎉 ¡PDF vectorial editable generado exitosamente!\n   📂 ${outputPdfPath}`);
  } catch (err) {
    console.error('⚠️ Error al compilar PDF editable:', err.message);
  } finally {
    // Limpiar temporales
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
  const totalSheets = Math.ceil(cards.length / CARDS_PER_SHEET);
  const hasBorder = options.crop !== 'clean';
  let sheetsHtml = '';

  for (let s = 0; s < totalSheets; s++) {
    const sheetCards = cards.slice(s * CARDS_PER_SHEET, (s + 1) * CARDS_PER_SHEET);
    while (sheetCards.length < CARDS_PER_SHEET) {
      sheetCards.push(null);
    }

    // Frentes
    let frontGridHtml = '';
    sheetCards.forEach((c) => {
      if (!c) {
        frontGridHtml += `<div class="card-box ${hasBorder ? 'crop-border' : ''}"></div>`;
        return;
      }
      const theme = getHitsterCardTheme(c);
      const hito = formatMarkdown(c.hito);
      const numStr = `#${String(c.card_number).padStart(3, '0')}`;

      frontGridHtml += `
        <div class="card-box ${hasBorder ? 'crop-border' : ''}">
          <div class="card-face face-front" style="--card-front-bg: ${theme.frontBg}; --card-bg: ${theme.bg};">
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
      `;
    });

    sheetsHtml += `
      <section class="sheet sheet-front">
        <header class="sheet-meta">
          <span>HITSTER TECH EDITION — PLIEGO TABLOIDE ${s + 1} DE ${totalSheets} [CARA A: FRENTES]</span>
          <span>11 &times; 17 PULGADAS (279.4 &times; 431.8 mm) — CORTE 65 &times; 65 mm</span>
        </header>
        <div class="grid-3x6">${frontGridHtml}</div>
      </section>
    `;

    // Reversos Espejados
    const mirroredIndices = [];
    for (let r = 0; r < CARDS_ROWS; r++) {
      const base = r * CARDS_COLS;
      mirroredIndices.push(base + 2, base + 1, base);
    }

    let backGridHtml = '';
    mirroredIndices.forEach((idx) => {
      const c = sheetCards[idx];
      if (!c) {
        backGridHtml += `<div class="card-box ${hasBorder ? 'crop-border' : ''}"></div>`;
        return;
      }
      const theme = getHitsterCardTheme(c);
      const creador = formatMarkdown(c.creador);
      const trivia = formatMarkdown(c.dato_curioso);
      const cleanCardNum = String(c.card_number).padStart(3, '0');

      backGridHtml += `
        <div class="card-box ${hasBorder ? 'crop-border' : ''}">
          <div class="card-face face-back" style="--card-bg: ${theme.bg}; --card-text: #111111;">
            <div class="back-author">${creador}</div>
            <div class="year-stage">${c.year}</div>
            <div class="back-trivia">${trivia}</div>
            <div class="footbar">
              <span class="cat-tag">${c.categoria}</span>
              <span class="card-num">${cleanCardNum}</span>
            </div>
          </div>
        </div>
      `;
    });

    sheetsHtml += `
      <section class="sheet sheet-back">
        <header class="sheet-meta">
          <span>HITSTER TECH EDITION — PLIEGO TABLOIDE ${s + 1} DE ${totalSheets} [CARA B: REVERSOS ESPEJADOS]</span>
          <span>IMPRESIÓN DÚPLEX: VOLTEAR POR EL BORDE LARGO</span>
        </header>
        <div class="grid-3x6">${backGridHtml}</div>
      </section>
    `;
  }

  const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>HITSTER Tech Edition — Imposición Tabloide Dúplex</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Outfit:wght@400;500;600;700;800&family=Space+Grotesk:wght@700;800;900&display=swap');
    @page { size: tabloid portrait; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { background: #e5e5e5; font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; align-items: center; padding: 20px 0; }
    .sheet { width: 279.4mm; height: 431.8mm; background: #ffffff; margin-bottom: 25px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); page-break-after: always; break-after: page; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; }
    .sheet-meta { position: absolute; top: 12mm; left: 42.2mm; right: 42.2mm; display: flex; justify-content: space-between; font-size: 7.5pt; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 0.5pt solid #ddd; padding-bottom: 4px; }
    .grid-3x6 { width: 195mm; height: 390mm; display: grid; grid-template-columns: repeat(3, 65mm); grid-template-rows: repeat(6, 65mm); margin-top: 10mm; }
    .card-box { width: 65mm; height: 65mm; position: relative; overflow: hidden; }
    .crop-border { outline: 0.4pt solid rgba(0, 0, 0, 0.15); }
    .card-face { width: 100%; height: 100%; padding: 4.5mm 4.2mm; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; }
    .face-front { background: var(--card-front-bg); color: #ffffff; }
    .face-back { background: var(--card-bg); color: #111111; text-align: center; }
    .topbar { display: flex; flex-direction: column; gap: 2px; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 3px; }
    .group-title { font-size: 6.4pt; font-weight: 800; text-transform: uppercase; color: var(--card-bg); }
    .category-name { font-size: 5.8pt; color: rgba(255,255,255,0.7); }
    .clue-stage { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2.5mm 0; overflow: hidden; }
    .clue-text { font-size: 9.0pt; line-height: 1.38; color: #ffffff; text-align: left; }
    .footbar { display: flex; justify-content: space-between; align-items: flex-end; }
    .cat-tag, .card-num { font-size: 5.2pt; font-weight: 500; color: rgba(255, 255, 255, 0.7); }
    .face-front .cat-tag { color: rgba(255, 255, 255, 0.45); }
    .face-front .card-num { color: rgba(255, 255, 255, 0.55); font-family: 'Space Grotesk', sans-serif; }
    .face-back .card-num { font-family: 'Space Grotesk', sans-serif; }
    .back-author { font-size: 8.6pt; font-weight: 600; line-height: 1.2; min-height: 20px; display: flex; align-items: center; justify-content: center; }
    .year-stage { font-family: 'Space Grotesk', sans-serif; font-size: 54pt; font-weight: 900; letter-spacing: -1.8px; line-height: 0.9; margin: 2px 0; }
    .back-trivia { font-size: 7.4pt; font-style: italic; line-height: 1.35; flex: 1; display: flex; align-items: center; justify-content: center; padding: 0 1.5mm; }
    @media print { body { background: transparent !important; padding: 0 !important; } .sheet { box-shadow: none !important; margin: 0 !important; } }
  </style>
</head>
<body>${sheetsHtml}</body>
</html>`;

  fs.writeFileSync(OUTPUT_HTML_PATH, fullHtml, 'utf8');
  console.log(`✅ Archivo HTML de pliegos Tabloide generado: ${OUTPUT_HTML_PATH}`);
}

function main() {
  const options = parseArgs();
  console.log('🎨 HITSTER - Generador de Imposición Tabloide (11x17) para Imprenta y Diseño');

  if (!fs.existsSync(CARDS_JSON_PATH)) {
    console.error('❌ No se encontró cards.json. Ejecuta primero `node build_cards.js`');
    process.exit(1);
  }

  let cards = JSON.parse(fs.readFileSync(CARDS_JSON_PATH, 'utf8'));
  console.log(`📦 Total de tarjetas disponibles: ${cards.length}`);

  if (options.range === '18' || options.range === 'SAMPLE_18') {
    cards = cards.slice(0, 18);
    console.log('📄 Rango: Muestra de 1 pliego tabloide (18 cartas)');
  } else if (options.range === '36' || options.range === 'SAMPLE_36') {
    cards = cards.slice(0, 36);
    console.log('📄 Rango: Muestra de 2 pliegos tabloide (36 cartas)');
  } else {
    console.log(`📄 Rango: Baraja completa de ${cards.length} cartas en pliegos tabloide`);
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

  console.log('\n✨ Salidas disponibles para herramientas de diseño:');
  if (options.svg) console.log(`   📂 Hojas SVG (Illustrator/Figma): ${OUTPUT_SVG_DIR}/`);
  if (options.pdfEditable) console.log(`   📂 PDF vectorial editable:        ${OUTPUT_EDITABLE_PDF_PATH}`);
  if (options.pdf) console.log(`   📂 PDF de Chrome:                 ${OUTPUT_CHROME_PDF_PATH}`);
}

main();
