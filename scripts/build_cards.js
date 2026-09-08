#!/usr/bin/env node
/**
 * Hit-Tazos Tech - Card Compiler & Deck Shuffler
 * 
 * Compila y baraja automáticamente todas las tarjetas de las 24 categorías
 * ubicadas en los 5 grupos de contenido:
 *  - grupo_a_python
 *  - grupo_b_software_web
 *  - grupo_c_devops_infra
 *  - grupo_d_ia_datos
 *  - grupo_e_cultura_hacker
 * 
 * Reglas de diseño oficial de Hit-Tazos Tech:
 *  1. Los años y categorías están distribuidos de forma no lineal (barajados).
 *  2. Las tarjetas reciben un número consecutivo impreso: card_number (1..N).
 *  3. Cada tarjeta conserva su id único correlacionado al número (#CAT-XXX).
 *  4. Guarda el mazo unificado y listo para consumo en cards.json.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CATEGORIES_DIR = path.join(ROOT_DIR, 'data', 'categories');
const GROUPS = [
  'grupo_a_python',
  'grupo_b_software_web',
  'grupo_c_devops_infra',
  'grupo_d_ia_datos',
  'grupo_e_cultura_hacker'
];

function loadAllCategoryCards() {
  const allCards = [];
  const categoryMap = new Map();

  for (const grp of GROUPS) {
    const grpPath = path.join(CATEGORIES_DIR, grp);
    if (!fs.existsSync(grpPath)) continue;

    const files = fs.readdirSync(grpPath).filter(f => f.endsWith('.json')).sort();
    for (const file of files) {
      const filePath = path.join(grpPath, file);
      try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          categoryMap.set(path.join('data', 'categories', grp, file), list);
          allCards.push(...list);
        }
      } catch (err) {
        console.error(`Error leyendo ${filePath}:`, err.message);
      }
    }
  }

  return { allCards, categoryMap };
}

// PRNG con semilla fija para tener aleatoriedad balanceada y reproducible
function createPRNG(seed = 1337) {
  let s = seed;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function build() {
  console.log('🔄 Compilando mazo Hit-Tazos Tech...');
  const { allCards, categoryMap } = loadAllCategoryCards();
  console.log(`📦 Tarjetas encontradas en categorías: ${allCards.length}`);

  const rng = createPRNG(1337);

  // Agrupar por volumen
  const volumes = { 0: [], 1: [], 2: [], 3: [] };
  allCards.forEach(card => {
    const v = card.volumen !== undefined ? card.volumen : 0;
    if (!volumes[v]) volumes[v] = [];
    volumes[v].push(card);
  });

  const shuffled = [];
  
  // Barajar cada volumen de forma independiente
  for (let v = 0; v <= 3; v++) {
    const volCards = volumes[v] || [];
    for (let i = volCards.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [volCards[i], volCards[j]] = [volCards[j], volCards[i]];
    }
    
    // Asignar numeración local (1..N) dentro del volumen
    volCards.forEach((card, idx) => {
      card.card_number = idx + 1;
      card.card_number_hex = "0x" + card.card_number.toString(16).toUpperCase().padStart(2, '0');
      delete card.id;
    });
    
    shuffled.push(...volCards);
  }

  // Guardar cards.json compilado
  const outputPath = path.join(ROOT_DIR, 'data', 'cards.json');
  fs.writeFileSync(outputPath, JSON.stringify(shuffled, null, 2) + '\n', 'utf8');
  console.log(`✅ ${shuffled.length} tarjetas compiladas exitosamente en: ${outputPath}`);

  // Generar manifest.json oficial con metadatos de autoría y distribución
  let version = '1.0.0-rc.1';
  try {
    version = fs.readFileSync(path.join(ROOT_DIR, 'VERSION'), 'utf8').trim();
  } catch (_) {}

  const manifest = {
    name: 'hit-tazos-tech',
    title: 'Hit-Tazos Tech — Trivia Cronológica Técnica',
    version: version,
    description: 'Juego de trivia cronológica técnica de hitos verificados (1957–2026) sobre Python, Software, DevOps, IA y Cultura Hacker.',
    author: 'Shellaquiles Org (https://shellaquiles.org)',
    website: 'https://shellaquiles.org',
    repository: 'https://github.com/shellaquiles/hit-tazos-tech',
    license: 'MIT',
    year_range: { min: 1957, max: 2026 },
    groups_count: 5,
    categories_count: 24,
    build_date: new Date().toISOString()
  };
  const manifestPath = path.join(ROOT_DIR, 'data', 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`📋 Manifiesto oficial generado en: ${manifestPath}`);

  // Actualizar también los archivos por categoría manteniendo sus nuevos card_number y sin 'id'
  const cardById = new Map();
  shuffled.forEach(c => {
    // Clave basada en hito y creador para ubicar la tarjeta original
    const key = `${c.categoria}|${c.hito}|${c.creador}|${c.year}`;
    cardById.set(key, c);
  });

  let updatedFiles = 0;
  for (const [relPath, originalList] of categoryMap.entries()) {
    const fullPath = path.join(ROOT_DIR, relPath);
    const updatedList = originalList.map(item => {
      const key = `${item.categoria}|${item.hito}|${item.creador}|${item.year}`;
      const matched = cardById.get(key);
      const copy = { ...item };
      delete copy.id;
      if (matched) {
        copy.card_number = matched.card_number;
      }
      return copy;
    });
    fs.writeFileSync(fullPath, JSON.stringify(updatedList, null, 2) + '\n', 'utf8');
    updatedFiles++;
  }

  console.log(`📁 ${updatedFiles} archivos de categorías sincronizados.`);
  console.log('🎉 Compilación de cartas completada con éxito.');
}

build();
