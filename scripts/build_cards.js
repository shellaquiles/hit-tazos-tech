const fs = require('fs');
const path = require('path');

const VOLUMES_DIR = path.join(__dirname, '../data/volumes');
const CARDS_FILE = path.join(__dirname, '../data/cards.json');
const MANIFEST_FILE = path.join(__dirname, '../data/manifest.json');

console.log('🔄 Compilando mazo Hit-Tazos Tech desde volúmenes...');

if (!fs.existsSync(VOLUMES_DIR)) {
  console.error(`❌ Error: No se encontró el directorio ${VOLUMES_DIR}`);
  process.exit(1);
}

const files = fs.readdirSync(VOLUMES_DIR).filter(f => f.endsWith('.json'));
files.sort(); // vol0, vol1...

let allCards = [];

for (const file of files) {
  const filePath = path.join(VOLUMES_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  allCards = allCards.concat(data);
}

if (allCards.length !== 640) {
  console.error(`❌ Error de validación: Se esperaban 640 cartas, pero hay ${allCards.length}.`);
  process.exit(1);
}

// Generate compiled output
fs.writeFileSync(CARDS_FILE, JSON.stringify(allCards, null, 2), 'utf8');

// Generate manifest
const manifest = {
  compiledAt: new Date().toISOString(),
  totalCards: allCards.length,
  version: '1.0.0-rc.1',
  volumes: files.length
};

fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf8');

console.log(`✅ ${allCards.length} tarjetas compiladas exitosamente en: ${CARDS_FILE}`);
console.log(`📋 Manifiesto oficial generado en: ${MANIFEST_FILE}`);
console.log('🎉 Compilación completada con éxito.');
