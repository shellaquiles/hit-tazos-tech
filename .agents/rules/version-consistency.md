---
description: Regla de gobernanza y consistencia estricta de versión en Hit-Tazos Tech
globs: ["VERSION", "package.json", "data/manifest.json", "data/card_colors.json", "README.md", "web/index.html", "web/assets/og-cover.svg"]
---

# Hit-Tazos Tech — Coherencia de Versión en Metadatos

Esta regla define el protocolo para evitar divergencias y obsolescencia en las referencias de versión a lo largo del repositorio.

## 1. Fuente Única de Verdad Canónica
- El archivo `VERSION` en la raíz del repositorio es la **única y exclusiva fuente canónica de verdad** (ej. `1.0.0`).
- **Prohibido:** Modificar manualmente versiones en `web/index.html`, `README.md`, `data/manifest.json` o scripts de forma aislada.

## 2. Archivos Vinculados a la Versión Canónica
Los siguientes archivos deben estar en paridad estricta con `VERSION`:
1. `package.json` (`"version"`)
2. `data/manifest.json` (`"version"`)
3. `data/card_colors.json` (`"version"`)
4. `README.md` (insignia shields.io `[![Version]`)
5. `web/index.html` (`<title>`, `og:title`, `twitter:title`, `schema.org/version`, `.brand-version-tag`, `.footer-version`)
6. `web/assets/og-cover.svg` (etiqueta de texto de versión)
7. Fallbacks en `scripts/build_cards.js`, `scripts/generate_card_colors.js` y `print/render_print_tabloid.js`

## 3. Protocolo de Modificación y Bump de Versión
Cuando sea necesario cambiar la versión del proyecto:
1. Actualizar el valor en `VERSION` (ej. `1.0.0`).
2. Ejecutar la sincronización automática:
   ```bash
   npm run version:sync
   # o: python3 scripts/sync_version.py --sync
   ```
3. Si `web/assets/og-cover.svg` fue modificado, regenerar la imagen PNG para redes:
   ```bash
   rsvg-convert -w 1200 -h 630 web/assets/og-cover.svg -o web/assets/og-cover.png
   ```
4. Recompilar la baraja maestra:
   ```bash
   npm run build
   ```
5. Validar con la suite de pruebas:
   ```bash
   npm test
   ```
