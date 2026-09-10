#!/usr/bin/env node
/**
 * Generador de Configuración de Colores por Millar para Hit-Tazos Tech
 *
 * Los colores de las tarjetas son 100% independientes del contenido editorial;
 * el único vínculo es el `card_number`.
 * Este script genera la tabla cromática oficial para tarjetas del 1 al 1000 (1er millar).
 */

const fs = require('fs');
const path = require('path');

const TOTAL_CARDS = 1000;

const PALETTE_BLOCKS = [
  { id: 0, name: 'Naranja Cobre / Ámbar', h1: 25, h2: 36, s1: 94, s2: 86, l1: 62, l2: 52 },
  { id: 1, name: 'Lavanda / Malva', h1: 265, h2: 275, s1: 65, s2: 55, l1: 74, l2: 62 },
  { id: 2, name: 'Rojo Carmín Vivo', h1: 348, h2: 358, s1: 84, s2: 76, l1: 60, l2: 50 },
  { id: 3, name: 'Lila Pastel', h1: 282, h2: 292, s1: 45, s2: 35, l1: 76, l2: 66 },
  { id: 4, name: 'Amarillo Dorado', h1: 44, h2: 54, s1: 95, s2: 88, l1: 66, l2: 52 },
  { id: 5, name: 'Azul Glaciar', h1: 198, h2: 208, s1: 72, s2: 60, l1: 72, l2: 58 },
  { id: 6, name: 'Verde Lima / Pistache', h1: 78, h2: 92, s1: 74, s2: 62, l1: 70, l2: 56 },
  { id: 7, name: 'Turquesa / Océano', h1: 174, h2: 186, s1: 78, s2: 68, l1: 66, l2: 52 },
  { id: 8, name: 'Rosa Coral Fucsia', h1: 330, h2: 342, s1: 84, s2: 74, l1: 68, l2: 54 },
  { id: 9, name: 'Morado Índigo', h1: 248, h2: 258, s1: 62, s2: 52, l1: 65, l2: 52 }
];

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

function generateMillar(millarIndex = 1, startNum = 1, endNum = 1000) {
  const colorsMap = {};

  for (let num = startNum; num <= endNum; num++) {
    const blockIndex = Math.floor(((num - 1) % 100) / 10);
    const subStep = ((num - 1) % 10) / 9;

    const block = PALETTE_BLOCKS[blockIndex];
    const hue = Math.round((block.h1 + (block.h2 - block.h1) * subStep) * 10) / 10;
    const saturation = Math.round(block.s1 + (block.s2 - block.s1) * subStep);
    const lightness = Math.round(block.l1 + (block.l2 - block.l1) * subStep);

    const topS = Math.max(saturation - 6, 20);
    const topL = Math.min(lightness + 6, 85);
    const botS = Math.min(saturation + 6, 100);
    const botL = Math.max(lightness - 6, 40);

    const topHex = hslToHex(hue, topS, topL);
    const botHex = hslToHex(hue, botS, botL);
    const topHsl = `hsl(${hue}, ${topS}%, ${topL}%)`;
    const botHsl = `hsl(${hue}, ${botS}%, ${botL}%)`;
    const bgGradient = `linear-gradient(180deg, ${topHsl} 0%, ${botHsl} 100%)`;

    const bgHex = hslToHex(hue, saturation, lightness);
    const frontBgHex = hslToHex(hue, 35, 10);
    const accentHex = bgHex;
    // En el diseño oficial de Hit-Tazos Tech, todos los textos del reverso son negros
    const textColor = '#111111';
    // Metadatos de esquinas discretos en blanco sutil / color atenuado
    const cornerColor = 'rgba(255, 255, 255, 0.7)';

    function hexToCmyk(hex) {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const k = 1 - Math.max(r, g, b);
      if (k === 1) return { c: 0, m: 0, y: 0, k: 100, string: 'cmyk(0%, 0%, 0%, 100%)' };
      const c = Math.round(((1 - r - k) / (1 - k)) * 100);
      const m = Math.round(((1 - g - k) / (1 - k)) * 100);
      const y = Math.round(((1 - b - k) / (1 - k)) * 100);
      const kPct = Math.round(k * 100);
      return { c, m, y, k: kPct, string: `cmyk(${c}%, ${m}%, ${y}%, ${kPct}%)` };
    }

    const bgCmyk = hexToCmyk(bgHex);
    const frontBgCmyk = hexToCmyk(frontBgHex);

    colorsMap[num] = {
      card_number: num,
      block_id: block.id,
      block_name: block.name,
      h: hue,
      s: saturation,
      l: lightness,
      bg_hsl: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      bg_hex: bgHex,
      bg_cmyk: bgCmyk.string,
      top_hex: topHex,
      bottom_hex: botHex,
      top_hsl: topHsl,
      bottom_hsl: botHsl,
      bg_gradient: bgGradient,
      front_bg_hsl: `hsl(${hue}, 35%, 10%)`,
      front_bg_hex: frontBgHex,
      front_bg_cmyk: frontBgCmyk.string,
      accent_hex: accentHex,
      text_color: textColor,
      corner_color: cornerColor
    };
  }

  let version = '1.0.0-rc4';
  try {
    version = fs.readFileSync(path.join(__dirname, '..', 'VERSION'), 'utf8').trim();
  } catch (_) { }

  return {
    description: 'Hit-Tazos Tech - Paleta cromática oficial independiente por card_number',
    version: version,
    author: 'shellaquiles.org (https://shellaquiles.org)',
    website: 'https://shellaquiles.org',
    license: 'MIT',
    millar: millarIndex,
    total_cards: endNum - startNum + 1,
    start_card: startNum,
    end_card: endNum,
    blocks: PALETTE_BLOCKS.map(b => ({
      id: b.id,
      name: b.name,
      hue_range: [b.h1, b.h2],
      saturation_range: [b.s1, b.s2],
      lightness_range: [b.l1, b.l2]
    })),
    cards: colorsMap
  };
}

// Soporte CLI: --millar=1 (default), --out=card_colors.json
const args = process.argv.slice(2);
let millarIdx = 1;
let customOut = null;

for (const arg of args) {
  if (arg.startsWith('--millar=')) {
    millarIdx = parseInt(arg.split('=')[1], 10) || 1;
  } else if (arg.startsWith('--out=')) {
    customOut = arg.split('=')[1];
  }
}

const startCard = (millarIdx - 1) * 1000 + 1;
const endCard = millarIdx * 1000;
const ROOT_DIR = path.resolve(__dirname, '..');
const outputFilename = customOut || (millarIdx === 1 ? 'card_colors.json' : `card_colors_millar_${millarIdx}.json`);
const outputPath = path.isAbsolute(outputFilename) ? outputFilename : path.join(ROOT_DIR, 'data', outputFilename);

const data = generateMillar(millarIdx, startCard, endCard);
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`✅ Archivo de configuración cromática generado por millar (${millarIdx}º millar): ${outputPath}`);
console.log(`📦 Tarjetas configuradas: ${data.total_cards} (#${data.start_card} - #${data.end_card})`);
