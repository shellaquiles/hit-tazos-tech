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
 *  2. Las tarjetas reciben un número consecutivo impreso: card_number (1..531).
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

  // Barajado Fisher-Yates
  const shuffled = [...allCards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Asignar numeración consecutiva 1..N oficial de Hit-Tazos Tech (sin campo 'id')
  shuffled.forEach((card, idx) => {
    card.card_number = idx + 1;
    delete card.id;
  });

  // Guardar cards.json compilado
  const outputPath = path.join(ROOT_DIR, 'data', 'cards.json');
  fs.writeFileSync(outputPath, JSON.stringify(shuffled, null, 2) + '\n', 'utf8');
  console.log(`✅ ${shuffled.length} tarjetas compiladas exitosamente en: ${outputPath}`);

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
