---
description: Reglas de maquetación, límites de caracteres y flujo de compilación para Hitster Tech Edition
globs: ["**/*.json", "render_print_tabloid.js", "build_cards.js"]
---

# Hitster Tech Edition — Directrices para Agentes

## 1. Presupuestos de Caracteres Obligatorios
- `creador`: Máximo 45 caracteres (`*Autor* et al.`, siglas como `(*MIT*)`).
- `hito`: Máximo 145 caracteres (pista clara sin circunloquios).
- `dato_curioso`: Máximo 150 caracteres (límite duro 155). 3-4 líneas compactas.

## 2. Flujo de Validación y Compilación
Tras editar cualquier archivo JSON en `grupo_*/*.json`:
1. `python3 scratch_audit.py` (debe dar 0 violaciones).
2. `node build_cards.js` (compila `cards.json`).
3. `node render_print_tabloid.js --range=ALL` (compila los 60 SVGs y `tabloide_editable.pdf`).

## 3. Imposición Dúplex Milimétrica
- Tamaño de hoja: Tabloide ($11 \times 17\text{ pulg}$, $279.4 \times 431.8\text{ mm}$, $792 \times 1224\text{ pt}$).
- Rejilla: 18 cartas por pliego ($3 \times 6$), tamaño $65 \times 65\text{ mm}$ ($184.25\text{ pt}$).
- Reversos: Espejados horizontalmente fila por fila `[2, 1, 0]` para coincidencia en guillotina al voltear por el borde largo.
- Formatos: Texto vectorial nativo con fuentes TrueType (`NotoSans`, `WinAnsi`). Sin rasterización.

## 4. Paleta Cromática Desacoplada (`card_colors.json`)
- Los colores son independientes de los textos y vinculados únicamente por `card_number`.
- Se configuran y generan por millar: `node generate_card_colors.js [--millar=N]`.
- Archivo maestro para 1..1000: `card_colors.json`.

Ver [AGENTS.md](../../AGENTS.md) para la especificación completa.
