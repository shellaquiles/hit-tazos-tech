import json
import re
import os

# Ensure we run from the correct dir
os.chdir('/home/kubrick/www/hitster/data')

# 1. Cargar archivo origen
with open("cards.json", "r", encoding="utf-8") as f:
  cards = json.load(f)

# Limpiar markdown de autores ('*Autor*' -> 'Autor')
def clean_author(raw_author: str) -> str:
  cleaned = raw_author.replace("*", "").strip()
  return re.sub(r"\s+", " ", cleaned)

# Mapeo semántico de categorías legadas a (domain, tag)
TAXONOMY_MAP = {
    # Grupo A: Python
    "A1": ("languages-runtimes", "syntax-peps"),
    "A2": ("languages-runtimes", "cpython-runtime"),
    "A3": ("hacker-culture-web", "python-community"),
    "A4": ("languages-runtimes", "web-frameworks"),
    "A5": ("languages-runtimes", "rust-tooling"),
    # Grupo B: Software, Web y Datos
    "B1": ("languages-runtimes", "programming-languages"),
    "B2": ("systems-networking", "web-standards"),
    "B3": ("systems-networking", "developer-tools"),
    "B4": ("hacker-culture-web", "collaboration-platforms"),
    "B5": ("data-storage", "database-engines"),
    # Grupo C: DevOps e Infraestructura
    "C1": ("systems-networking", "linux-unix-os"),
    "C2": ("cloud-infrastructure", "containers-virt"),
    "C3": ("cloud-infrastructure", "cloud-serverless"),
    "C4": ("cloud-infrastructure", "iac-automation"),
    # Grupo D: Cómputo, IA y Datos
    "D1": ("ai-data-science", "scientific-stack"),
    "D2": ("ai-data-science", "neural-networks-papers"),
    "D3": ("ai-data-science", "competitive-ai"),
    "D4": ("ai-data-science", "llms-generative"),
    # Grupo E: Cultura Hacker y Leyendas
    "E1": ("hacker-culture-web", "cypherpunks-foss"),
    "E2": ("security-exploits", "malware-exploits"),
    "E3": ("security-exploits", "software-disasters"),
    "E4": ("hacker-culture-web", "flame-wars"),
    "E5": ("hacker-culture-web", "p2p-culture"),
    "E6": ("hardware-embedded", "retro-chips-gpus"),
}

# 2. Asignación de legacy_card_number a cada volumen

# Vol 0: Kernel Foundations (128 cartas transversales y fundacionales)
vol0_legacy_ids = [
    # Génesis y Lenguajes (32)
    1, 6, 8, 10, 17, 19, 24, 26, 44, 48, 51, 71, 73, 77, 79, 83, 91, 96, 98,
    109, 117, 120, 136, 145, 160, 167, 169, 176, 207, 222, 228, 230,
    # Sistemas, Redes y Herramientas (32)
    12, 15, 25, 36, 47, 63, 68, 69, 87, 97, 102, 104, 121, 157, 158, 163,
    173, 187, 200, 216, 219, 227, 258, 262, 270, 307, 329, 335, 346, 377,
    400, 513,
    # Datos, Cómputo e IA (32)
    3, 11, 20, 27, 37, 46, 49, 50, 58, 62, 67, 70, 74, 84, 88, 103, 114,
    116, 118, 119, 133, 141, 170, 175, 205, 215, 244, 259, 279, 280, 281,
    314,
    # Cultura Hacker, Exploits y Desastres (32)
    5, 9, 22, 33, 35, 38, 43, 54, 55, 56, 64, 65, 75, 76, 82, 93, 101, 105,
    107, 113, 127, 131, 132, 140, 144, 164, 174, 180, 209, 211, 229, 247,
]

# Vol 1: Cypherpunks, Free Software & Hacker Lore (64 cartas)
vol1_legacy_ids = [
    9, 22, 33, 35, 43, 64, 65, 75, 76, 82, 93, 101, 107, 113, 140, 144,
    151, 172, 174, 177, 180, 182, 186, 198, 209, 211, 229, 245, 247, 248,
    278, 286, 292, 293, 295, 303, 309, 312, 316, 332, 339, 343, 344, 347,
    348, 352, 364, 372, 435, 444, 448, 449, 453, 472, 475, 489, 508, 525,
    530, 225, 246, 263, 356, 451,
]

# Vol 2: Embedded, Silicon & Hardware Hackers (64 cartas)
vol2_legacy_ids = [
    38, 54, 105, 127, 152, 164, 206, 225, 246, 263, 356, 451, 481, 488,
    162, 238, 301, 349, 386, 419, 420, 422, 461, 466, 474, 492, 365, 480,
    358, 468, 524, 14, 99, 100, 116, 148, 149, 231, 289, 338, 341, 416,
    427, 452, 26, 81, 143, 167, 228, 271, 306, 313, 345, 354, 362, 389,
    392, 402, 425, 441, 459, 478, 509, 517,
]

# Vol 3: Unix, SysAdmin & Networks (64 cartas)
vol3_legacy_ids = [
    25, 36, 47, 57, 68, 80, 97, 104, 121, 134, 149, 171, 173, 192, 270,
    282, 285, 290, 296, 307, 324, 326, 334, 335, 350, 363, 374, 377, 387,
    397, 411, 413, 415, 423, 430, 440, 450, 460, 462, 468, 470, 471, 473,
    478, 482, 485, 490, 498, 502, 506, 509, 513, 517, 520, 522, 18, 28,
    45, 66, 156, 181, 196, 224, 235,
]

# Vol 4: Backend Architecture & Distributed Systems (64 cartas)
vol4_legacy_ids = [
    11, 37, 49, 114, 119, 130, 170, 189, 205, 218, 244, 253, 256, 265, 280,
    320, 404, 446, 476, 483, 6, 81, 143, 160, 167, 207, 231, 238, 271, 301,
    306, 313, 345, 354, 362, 386, 389, 392, 402, 422, 427, 459, 461, 466,
    492, 28, 45, 66, 156, 181, 196, 224, 235, 298, 300, 318, 337, 370,
    375, 380, 391, 407, 418, 447,
]

# Vol 5: Cloud, Containers & SRE (64 cartas)
vol5_legacy_ids = [
    2, 14, 15, 18, 28, 45, 57, 66, 68, 78, 80, 99, 100, 122, 134, 163,
    171, 173, 181, 188, 192, 196, 224, 234, 235, 240, 260, 266, 277, 282,
    289, 298, 300, 318, 334, 337, 338, 341, 370, 375, 380, 391, 397, 401,
    407, 416, 418, 425, 441, 447, 452, 458, 465, 480, 490, 506, 513, 521,
    522, 524, 69, 97, 104, 121,
]

# Vol 6: The Python Track (64 cartas)
vol6_legacy_ids = [
    4, 7, 16, 21, 23, 29, 30, 34, 40, 41, 42, 52, 60, 61, 85, 86,
    89, 90, 94, 95, 106, 110, 111, 112, 125, 126, 128, 129, 135, 137, 138,
    139, 142, 153, 154, 155, 159, 161, 165, 168, 178, 179, 183, 184, 190,
    193, 197, 199, 201, 204, 210, 212, 213, 214, 220, 221, 223, 226, 232,
    233, 237, 241, 249, 250,
]

# 3. Mapeo de Volúmenes y Slugs
VOLUMES_CONFIG = {
    "vol0": ("kernel-foundations", 128),
    "vol1": ("cypherpunks-hacker-lore", 64),
    "vol2": ("embedded-silicon-hardware", 64),
    "vol3": ("unix-sysadmin-networks", 64),
    "vol4": ("backend-distributed-systems", 64),
    "vol5": ("cloud-containers-sre", 64),
    "vol6": ("python-track", 64),
}

VOLUMES_CARD_LISTS = {
    "vol0": vol0_legacy_ids,
    "vol1": vol1_legacy_ids,
    "vol2": vol2_legacy_ids,
    "vol3": vol3_legacy_ids,
    "vol4": vol4_legacy_ids,
    "vol5": vol5_legacy_ids,
    "vol6": vol6_legacy_ids,
}

# Indexar cartas originales por legacy_card_number
cards_by_legacy = {c["legacy_card_number"]: c for c in cards if "legacy_card_number" in c}

output_cards = []

for vol_prefix, target_ids in VOLUMES_CARD_LISTS.items():
  vol_slug, expected_count = VOLUMES_CONFIG[vol_prefix]
  selected_cards = []
  for lid in target_ids:
    if lid in cards_by_legacy:
      selected_cards.append(cards_by_legacy[lid])
    else:
      print(f"Warning: Legacy ID {lid} not found in cards.json!")

  # Ordenar cronológicamente dentro de cada volumen
  selected_cards = sorted(
      selected_cards, key=lambda x: (x.get("year", 0), x.get("categoria", ""))
  )

  for index, raw_card in enumerate(selected_cards):
    cat = raw_card["categoria"]
    domain, tag = TAXONOMY_MAP.get(cat, ("systems-networking", "foundations"))

    transformed_card = {
        "id": f"{vol_prefix}-0x{index:02X}",
        "volumen": vol_slug,
        "index": index,
        "domain": domain,
        "tag": tag,
        "hito": raw_card["hito"],
        "year": raw_card["year"],
        "autor": clean_author(raw_card["creador"]),
        "trivia": raw_card["dato_curioso"],
    }
    output_cards.append(transformed_card)

# 4. Guardar archivo final
with open("cards_contract.json", "w", encoding="utf-8") as f:
  json.dump(output_cards, f, indent=2, ensure_ascii=False)

print(
    f"Archivo generado exitosamente con {len(output_cards)} cartas en"
    " cards_contract.json"
)
