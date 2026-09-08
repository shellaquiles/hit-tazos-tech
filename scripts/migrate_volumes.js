const fs = require('fs');
const path = require('path');

const vol0 = [1, 6, 8, 9, 10, 12, 13, 17, 19, 24, 26, 33, 35, 36, 38, 44, 47, 49, 53, 54, 56, 63, 64, 67, 70, 71, 73, 75, 77, 79, 83, 88, 91, 96, 97, 98, 102, 103, 104, 109, 113, 116, 117, 119, 120, 121, 122, 127, 133, 136, 141, 144, 145, 149, 150, 153, 154, 157, 160, 162, 163, 164, 166, 167, 169, 170, 173, 174, 175, 176, 179, 180, 187, 188, 197, 198, 200, 204, 205, 207, 211, 214, 215, 216, 220, 222, 227, 228, 229, 230, 231, 238, 241, 244, 246, 247, 255, 258, 259, 262, 270, 278, 279, 280, 281, 286, 288, 292, 296, 301, 303, 305, 313, 314, 321, 328, 329, 330, 331, 332, 335, 336, 344, 345, 346, 348, 349, 351, 355, 377, 379, 400, 406, 410, 419, 420, 422, 425, 428, 429, 430, 439, 441, 444, 449, 451, 459, 471, 472, 474, 476, 478, 481, 483, 484, 488, 493, 498, 510, 513, 516, 519, 520, 526, 530, 531];
const vol1 = [4, 7, 16, 21, 23, 29, 30, 34, 40, 41, 42, 48, 51, 52, 60, 61, 85, 86, 89, 90, 94, 95, 106, 110, 111, 112, 125, 126, 128, 129, 135, 137, 138, 139, 142, 155, 159, 161, 165, 168, 178, 183, 184, 190, 193, 199, 201, 210, 212, 213, 221, 223, 226, 232, 233, 237, 249, 250, 251, 252, 267, 268, 272, 273, 275, 276, 284, 287, 291, 297, 299, 302, 315, 319, 322, 323, 325, 327, 359, 360, 361, 365, 369, 373, 376, 378, 381, 382, 383, 384, 388, 390, 393, 394, 395, 396, 409, 412, 414, 417, 421, 431, 432, 434, 436, 437, 438, 442, 443, 445, 455, 457, 463, 464, 467, 469, 477, 486, 487, 491, 494, 497, 500, 501, 503, 504, 507, 511, 512, 514, 515, 518, 523, 527, 528, 529];
const vol2 = [2, 11, 14, 15, 18, 25, 28, 31, 37, 45, 66, 68, 69, 78, 80, 81, 87, 92, 99, 100, 107, 114, 130, 131, 134, 156, 158, 171, 181, 189, 192, 196, 202, 218, 219, 224, 234, 235, 240, 242, 253, 256, 260, 262, 265, 266, 271, 274, 277, 285, 289, 290, 298, 300, 304, 306, 307, 310, 318, 320, 324, 326, 334, 337, 338, 341, 350, 362, 363, 370, 374, 375, 380, 386, 387, 389, 391, 392, 397, 401, 402, 404, 407, 411, 413, 415, 416, 418, 423, 427, 440, 446, 447, 450, 452, 458, 460, 461, 462, 465, 466, 468, 470, 473, 480, 482, 485, 490, 492, 502, 506, 508, 509, 521, 522, 524];
const vol3 = [3, 5, 20, 22, 27, 43, 46, 50, 55, 58, 59, 62, 65, 74, 76, 82, 84, 93, 101, 105, 108, 115, 118, 132, 140, 143, 148, 151, 152, 172, 177, 182, 185, 186, 191, 194, 203, 206, 209, 217, 225, 236, 239, 243, 245, 248, 254, 257, 261, 263, 308, 309, 312, 316, 333, 339, 340, 342, 343, 347, 352, 353, 354, 356, 357, 358, 364, 366, 367, 368, 372, 385, 398, 399, 403, 405, 433, 435, 448, 453, 454, 456, 475, 479, 489, 495, 496, 499, 525];

const allVolumes = {0: vol0, 1: vol1, 2: vol2, 3: vol3};
const numToVol = {};

for (const [vol, list] of Object.entries(allVolumes)) {
  for (const num of list) {
    numToVol[num] = parseInt(vol, 10);
  }
}

// Fallback logic for missing cards
let nextVol = 0;
const assignMissingVol = () => {
  const v = nextVol;
  nextVol = (nextVol + 1) % 4;
  return v;
};

const ROOT_DIR = path.resolve(__dirname, '..');
const CATEGORIES_DIR = path.join(ROOT_DIR, 'data', 'categories');
const GROUPS = [
  'grupo_a_python',
  'grupo_b_software_web',
  'grupo_c_devops_infra',
  'grupo_d_ia_datos',
  'grupo_e_cultura_hacker'
];

let updatedFiles = 0;
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
        list.forEach(item => {
          if (item.card_number) {
            item.legacy_card_number = item.card_number;
            let vol = numToVol[item.card_number];
            if (vol !== undefined) {
              item.volumen = vol;
            } else {
              vol = assignMissingVol();
              console.warn(`Card number ${item.card_number} not found in any volume list! Assigning to vol ${vol}`);
              item.volumen = vol;
            }
          }
        });
        
        // Let's reorder fields so it looks good (like in the contract)
        const formattedList = list.map(item => {
           const {
             grupo, grupo_nombre, categoria, categoria_nombre,
             hito, year, creador, dato_curioso, volumen, card_number, legacy_card_number, ...rest
           } = item;
           return {
             grupo, grupo_nombre, categoria, categoria_nombre,
             hito, year, creador, dato_curioso, volumen, card_number, legacy_card_number, ...rest
           };
        });

        fs.writeFileSync(filePath, JSON.stringify(formattedList, null, 2) + '\n', 'utf8');
        updatedFiles++;
      }
    } catch (err) {
      console.error(`Error reading ${filePath}:`, err.message);
    }
  }
}

console.log(`Updated ${updatedFiles} category files.`);
