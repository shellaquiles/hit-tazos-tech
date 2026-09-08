---
description: Reglas de maquetación, límites de caracteres y flujo de compilación para Hit-Tazos Tech
globs: ["**/*.json", "render_print_tabloid.js", "build_cards.js"]
---

# Hit-Tazos Tech — Directrices para Agentes

## 1. Presupuestos de Caracteres Obligatorios (Data Contract)
- `autor`: Máximo 45 caracteres (`*Autor* et al.`, siglas como `(*MIT*)`).
- `hito`: Máximo 145 caracteres en Markdown (pista clara sin revelar el año).
- `trivia`: Máximo 150 caracteres (3-4 líneas compactas para lectura ágil).

## 2. Protocolo de Auditoría Rigurosa y Calidad Editorial
- **Auditoría en 4 niveles:** 1. Factual (fechas, personas, causalidad), 2. Fuente (primaria/secundaria contrastada), 3. Pedagógico (sin simplificaciones engañosas), 4. Editorial (cero sensacionalismo).
- **Regla de oro:** Una carta = una sola idea principal. Separar rigurosamente el hecho histórico (anverso) de la trivia/contexto (reverso).
- **Tono sobrio:** Prohibidos superlativos y lenguaje novelesco (*"revolucionó para siempre"*, *"estándar indiscutible"*, *"colosal"*).
- Registro maestro de auditoría respaldado con fuentes en `data/audit.json`.

## 3. Flujo de Validación y Compilación
Tras editar cualquier archivo JSON en `data/volumes/*.json`:
1. `npm test` o `python3 scripts/scratch_audit.py` (debe dar 0 violaciones).
2. `npm run build` (compila `data/cards.json` y `data/manifest.json`).
3. `npm run print` (compila pliegos SVG y PDFs vectoriales oficiales: Tabloide, Carta y Super Tabloide).

## 4. Imposición Dúplex Milimétrica
- Formatos: Tabloide (11×17", 15 cartas/pliego), Carta (8.5×11", 6 cartas/pliego) y Super Tabloide (12×18", 18 cartas/pliego).
- Tamaño de carta: $65 \times 65\text{ mm}$ ($184.25\text{ pt}$) con sangrado de +3 mm y calles de 6 mm.
- Reversos: Espejados horizontalmente fila por fila para coincidencia perfecta al voltear por el borde largo.
- Salidas PDF oficiales: `hit-tazos-tech-v{VERSION}-{formato}.pdf` con metadatos incrustados y fuentes TrueType (`Noto Sans`).

## 5. Estructura de Volúmenes y Paleta Cromática
- El mazo consta de 576 cartas distribuidas en 8 volúmenes canónicos (`vol0` a `vol7`).
- Los colores están desacoplados en `data/card_colors.json` y se configuran por millar (`scripts/generate_card_colors.js`).

Ver [AGENTS.md](../../AGENTS.md) para la especificación completa.
