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
  { id: 0, name: 'Rojo / Carmín cálido', h1: 350, h2: 356, s1: 72, s2: 88, l1: 70, l2: 54 },
  { id: 1, name: 'Violeta / Morado medio', h1: 268, h2: 276, s1: 58, s2: 78, l1: 72, l2: 56 },
  { id: 2, name: 'Naranja cálido', h1: 22, h2: 28, s1: 78, s2: 92, l1: 70, l2: 54 },
  { id: 3, name: 'Lavanda / Malva suave', h1: 280, h2: 290, s1: 45, s2: 65, l1: 74, l2: 58 },
  { id: 4, name: 'Amarillo / Ámbar dorado', h1: 42, h2: 48, s1: 82, s2: 96, l1: 72, l2: 56 },
  { id: 5, name: 'Lila pálido / Azul pastel', h1: 245, h2: 258, s1: 48, s2: 70, l1: 75, l2: 58 },
  { id: 6, name: 'Lima / Verde fresco', h1: 68, h2: 82, s1: 72, s2: 85, l1: 72, l2: 56 },
  { id: 7, name: 'Turquesa / Cian oceánico', h1: 172, h2: 192, s1: 62, s2: 82, l1: 72, l2: 54 },
  { id: 8, name: 'Rosa coral / Fucsia suave', h1: 335, h2: 345, s1: 68, s2: 86, l1: 72, l2: 56 },
  { id: 9, name: 'Ocre / Canela tostado', h1: 32, h2: 38, s1: 65, s2: 82, l1: 70, l2: 54 }
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
      front_bg_hsl: `hsl(${hue}, 35%, 10%)`,
      front_bg_hex: frontBgHex,
      front_bg_cmyk: frontBgCmyk.string,
      accent_hex: accentHex,
      text_color: textColor,
      corner_color: cornerColor
    };
  }

  let version = '1.0.0-rc.1';
  try {
    version = fs.readFileSync(path.join(__dirname, '..', 'VERSION'), 'utf8').trim();
  } catch (_) {}

  return {
    description: 'Hit-Tazos Tech - Paleta cromática oficial independiente por card_number',
    version: version,
    author: 'Shellaquiles Org (https://shellaquiles.org)',
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
