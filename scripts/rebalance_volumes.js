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

let allItems = [];
let fileData = [];

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
        fileData.push({ filePath, list });
        allItems.push(...list);
      }
    } catch (err) {
      console.error(`Error reading ${filePath}:`, err.message);
    }
  }
}

// Sort all items to keep a consistent logical order (by legacy_card_number)
allItems.sort((a, b) => (a.legacy_card_number || 0) - (b.legacy_card_number || 0));

// Assign exactly 128 per volume
const cardToVol = new Map();
allItems.forEach((item, index) => {
  const vol = Math.floor(index / 128);
  const key = `${item.categoria}|${item.hito}|${item.creador}|${item.year}`;
  cardToVol.set(key, vol);
});

// Update category files
let updatedFiles = 0;
for (const data of fileData) {
  const updatedList = data.list.map(item => {
    const key = `${item.categoria}|${item.hito}|${item.creador}|${item.year}`;
    const vol = cardToVol.get(key);
    item.volumen = vol;
    return item;
  });
  fs.writeFileSync(data.filePath, JSON.stringify(updatedList, null, 2) + '\n', 'utf8');
  updatedFiles++;
}

console.log(`Rebalanced 512 cards into 4 volumes of 128. Updated ${updatedFiles} files.`);
