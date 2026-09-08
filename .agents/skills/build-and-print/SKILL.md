---
name: build-and-print
description: >-
  Compila la baraja maestra de Hit-Tazos Tech y genera las salidas oficiales de imprenta
  (Tabloide 11x17, Carta 8.5x11 y Super Tabloide 12x18). Utiliza este skill tras modificar volúmenes
  o al preparar entregables PDF para impresión.
---

# Skill: Pipeline de Compilación e Imposición (Hit-Tazos Tech)

Este skill describe el flujo de compilación maestro del mazo y renderizado de pliegos para imprenta.

## Procedimiento de Ejecución

1. **Compilación de la Baraja Maestra:**
   Combina los 8 volúmenes de `data/volumes/*.json` y actualiza `data/cards.json` y `data/manifest.json`:
   ```bash
   npm run build
   ```

2. **Generación de Salidas de Imprenta:**
   Renderiza los pliegos SVG vectoriales y compila los PDFs de distribución oficial mediante Cairo (`rsvg-convert` + `pdfunite`):
   ```bash
   # Compilar los 3 formatos (Tabloide, Carta y Super Tabloide):
   npm run print

   # O compilar un formato específico:
   npm run print:tabloide   # 11x17 pulg (15 cartas/pliego)
   npm run print:8x11       # 8.5x11 pulg (6 cartas/pliego)
   ```

3. **Verificación de Entregables:**
   Confirmar que los archivos PDF oficiales se hayan generado en `print/v{VERSION}/`:
   - `print/v{VERSION}/hit-tazos-tech-v{VERSION}-tabloide.pdf`
   - `print/v{VERSION}/hit-tazos-tech-v{VERSION}-carta.pdf`
   - `print/v{VERSION}/hit-tazos-tech-v{VERSION}-super-tabloide.pdf`
   - Pliegos SVG individuales en `print/v{VERSION}/svg/{tabloide|carta|super_tabloide}/`
