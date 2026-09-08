---
name: version-manager
description: >-
  Gestiona, valida y sincroniza la versión canónica de Hit-Tazos Tech a través de todos
  los metadatos del proyecto (package.json, README.md, HTML, SVG, manifest y card_colors).
---

# Skill: Gestor y Sincronizador de Versión (Hit-Tazos Tech)

Este skill describe las operaciones para auditar la paridad de versiones o realizar un bump de versión formal en el repositorio.

## 1. Verificación de Consistencia (Check)

Para auditar si existen discrepancias entre el archivo canónico `VERSION` y los metadatos distribuidos:

```bash
npm run version:check
# o directamente:
# python3 scripts/sync_version.py --check
```

Si el comando termina con código `0`, todas las referencias están alineadas. Si falla con código `1`, listará con precisión qué archivos y campos presentan desfase.

## 2. Flujo Completo para Bump de Versión

Para incrementar o cambiar la versión del proyecto:

1. **Editar `VERSION`:**
   Escribir la nueva versión semántica (ej. `1.0.0` o `1.0.0-rc4`):
   ```bash
   echo "1.0.0" > VERSION
   ```

2. **Propagar a Metadatos:**
   ```bash
   npm run version:sync
   ```

3. **Regenerar Portada Social (OpenGraph PNG):**
   ```bash
   rsvg-convert -w 1200 -h 630 web/assets/og-cover.svg -o web/assets/og-cover.png
   ```

4. **Recompilar Baraja y Manifest:**
   ```bash
   npm run build
   ```

5. **Validar Suite Completa:**
   ```bash
   npm test
   ```
