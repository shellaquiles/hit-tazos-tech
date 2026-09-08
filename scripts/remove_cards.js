const fs = require('fs');
const path = require('path');

const cardsToRemove = [32, 39, 72, 123, 124, 146, 147, 195, 208, 264, 269, 294, 311, 317, 371, 408, 424, 426, 505];
const setToRemove = new Set(cardsToRemove);

const ROOT_DIR = path.resolve(__dirname, '..');
const CATEGORIES_DIR = path.join(ROOT_DIR, 'data', 'categories');
const GROUPS = [
  'grupo_a_python',
  'grupo_b_software_web',
  'grupo_c_devops_infra',
  'grupo_d_ia_datos',
  'grupo_e_cultura_hacker'
];

let removedCount = 0;
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
        const filteredList = list.filter(item => {
          if (setToRemove.has(item.legacy_card_number)) {
            removedCount++;
            console.log(`Removing card ${item.legacy_card_number}: ${item.hito.substring(0, 30)}...`);
            return false;
          }
          return true;
        });
        
        if (filteredList.length !== list.length) {
          fs.writeFileSync(filePath, JSON.stringify(filteredList, null, 2) + '\n', 'utf8');
        }
      }
    } catch (err) {
      console.error(`Error reading ${filePath}:`, err.message);
    }
  }
}

console.log(`Total removed: ${removedCount}. Target was 19.`);
