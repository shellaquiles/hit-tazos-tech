// Automated Unit Tests for Print Imposition & Perimeter Crop Marks
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const {
  generatePerimeterCropMarksSvg,
  FORMAT_CONFIGS,
  CARD_SIZE_PT,
  BLEED_PT,
  GUTTER_PT,
  CROP_LEN_PT,
  CROP_OFFSET_PT
} = require('../print/render_print_tabloid.js');

describe('Print Imposition — Marcas de Corte Perimetrales (Sin Guías Interiores)', () => {

  test('Carta (2 cols x 3 rows): Genera exactamente 20 marcas exteriores y ninguna interior', () => {
    const cols = 2;
    const rows = 3;
    const pageWidthPt = 8.5 * 72;
    const pageHeightPt = 11.0 * 72;
    const gridWidthPt = cols * CARD_SIZE_PT + (cols - 1) * GUTTER_PT;
    const gridHeightPt = rows * CARD_SIZE_PT + (rows - 1) * GUTTER_PT;
    const marginXPt = (pageWidthPt - gridWidthPt) / 2.0;
    const marginYPt = (pageHeightPt - gridHeightPt) / 2.0;

    const svg = generatePerimeterCropMarksSvg(cols, rows, marginXPt, marginYPt);

    assert.ok(svg.includes('<g id="marcas_corte_pliego"'));

    // Extraer todas las líneas SVG
    const lineMatches = [...svg.matchAll(/<line x1="([^"]+)" y1="([^"]+)" x2="([^"]+)" y2="([^"]+)" \/>/g)];
    // 4 cortes X (2 cols * 2) arriba + 4 abajo + 6 cortes Y (3 rows * 2) izq + 6 der = 20 marcas
    assert.equal(lineMatches.length, 20);

    const gridLeft = marginXPt;
    const gridRight = marginXPt + gridWidthPt;
    const gridTop = marginYPt;
    const gridBottom = marginYPt + gridHeightPt;

    lineMatches.forEach(match => {
      const x1 = parseFloat(match[1]);
      const y1 = parseFloat(match[2]);
      const x2 = parseFloat(match[3]);
      const y2 = parseFloat(match[4]);

      // Cada marca debe estar 100% afuera del área de cartas y sangrado
      const isTop = y1 < gridTop - BLEED_PT && y2 < gridTop - BLEED_PT;
      const isBottom = y1 > gridBottom + BLEED_PT && y2 > gridBottom + BLEED_PT;
      const isLeft = x1 < gridLeft - BLEED_PT && x2 < gridLeft - BLEED_PT;
      const isRight = x1 > gridRight + BLEED_PT && x2 > gridRight + BLEED_PT;

      assert.ok(
        isTop || isBottom || isLeft || isRight,
        `La marca (${x1}, ${y1}) -> (${x2}, ${y2}) debe estar en el perímetro exterior y no dentro de las calles interiores.`
      );
    });
  });

  test('Tabloide (3 cols x 5 rows): Genera exactamente 32 marcas exteriores', () => {
    const cols = 3;
    const rows = 5;
    const pageWidthPt = 11.0 * 72;
    const pageHeightPt = 17.0 * 72;
    const gridWidthPt = cols * CARD_SIZE_PT + (cols - 1) * GUTTER_PT;
    const gridHeightPt = rows * CARD_SIZE_PT + (rows - 1) * GUTTER_PT;
    const marginXPt = (pageWidthPt - gridWidthPt) / 2.0;
    const marginYPt = (pageHeightPt - gridHeightPt) / 2.0;

    const svg = generatePerimeterCropMarksSvg(cols, rows, marginXPt, marginYPt);
    const lineMatches = [...svg.matchAll(/<line x1="([^"]+)" y1="([^"]+)" x2="([^"]+)" y2="([^"]+)" \/>/g)];

    // 6 cortes X arriba + 6 abajo + 10 cortes Y izq + 10 der = 32 marcas
    assert.equal(lineMatches.length, 32);
  });

  test('Pliegos renderizados: Las tarjetas individuales no contienen marcas internas', () => {
    // Generar pliego de prueba para Carta
    execSync('node print/render_print_tabloid.js --format=8x11 --range=6 --svg', {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'pipe'
    });

    const vMatch = fs.readFileSync(path.resolve(__dirname, '../VERSION'), 'utf8').trim();
    const frontSvgPath = path.resolve(__dirname, `../print/v${vMatch}/carta/svg/pliego_01_frentes.svg`);
    const backSvgPath = path.resolve(__dirname, `../print/v${vMatch}/carta/svg/pliego_01_reversos.svg`);

    assert.ok(fs.existsSync(frontSvgPath), 'Debe existir pliego_01_frentes.svg');
    assert.ok(fs.existsSync(backSvgPath), 'Debe existir pliego_01_reversos.svg');

    const frontSvg = fs.readFileSync(frontSvgPath, 'utf8');
    const backSvg = fs.readFileSync(backSvgPath, 'utf8');

    // Debe contener el grupo perimetral en el pliego
    assert.ok(frontSvg.includes('<g id="marcas_corte_pliego"'));
    assert.ok(backSvg.includes('<g id="marcas_corte_pliego"'));

    // Las tarjetas individuales NO deben contener marcas de corte
    assert.ok(!frontSvg.includes('<!-- Marcas de corte (Crop marks 5mm) -->'));
    assert.ok(!backSvg.includes('<!-- Marcas de corte (Crop marks 5mm) -->'));

    // El encabezado no debe colisionar con las marcas superiores
    // Marcas superiores terminan en marginYPt - BLEED_PT - CROP_OFFSET_PT - CROP_LEN_PT
    // En Carta: marginYPt ≈ 102.61, marca superior termina en ≈ 77.10
    // Encabezado línea 2 está en marginYPt - 28 ≈ 74.61 (por encima de 77.10)
    assert.ok(frontSvg.includes('y="74.61"'));
    assert.ok(frontSvg.includes('y="64.61"'));
  });

});
