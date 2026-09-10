# Guía de Contribución 🤝

¡Gracias por tu interés en colaborar con **Hit-Tazos Tech**!

Este proyecto es parte del ecosistema de herramientas y aplicaciones de **shellaquiles.org**. Para mantener la alta calidad editorial, rigor cronológico y precisión de imprenta de las cartas, te pedimos seguir estas directrices.

---

## 🛠️ ¿Cómo contribuir?

1. Haz un **Fork** del repositorio.
2. Crea una rama para tu propuesta o corrección (siguiendo las convenciones de ramas de la organización):
   ```bash
   git checkout -b feat/nueva-categoria-o-hitos
   # o bien:
   git checkout -b fix/correccion-dato-historico
   ```
3. Realiza tus cambios en los **archivos fuente originales** (los 8 JSON en `data/volumes/vol*.json`).
   > **Nota clave:** Nunca edites `data/cards.json` a mano; este se autogenera mediante compilación (`npm run build`).

4. **Auditoría obligatoria en 4 niveles y presupuestos:**
   Verifica que ningún texto exceda los presupuestos físicos ($65 \times 65\text{ mm}$), que no haya spoilers temporales, que se cumpla la sobriedad editorial y que todo cambio esté respaldado en `data/audit.json`:
   ```bash
   npm run audit
   # o bien:
   python3 scripts/audit_deck.py
   # El resultado de violaciones debe ser estrictamente 0
   ```

5. **Compilación del mazo maestro:**
   ```bash
   npm run build
   # o bien:
   node scripts/build_cards.js
   ```

6. **Validación de pruebas y sintaxis:**
   ```bash
   npm test
   ```

7. Si modificaste parámetros de imposición o maquetación, regenera los pliegos:
   ```bash
   npm run print:test   # pliego de prueba
   npm run print        # baraja completa
   ```

8. Haz commit de tus cambios y envía un **Pull Request**.

---

## 📝 Convenciones de Código y Editorial

- **Data Contract Canónico (data/volumes/*.json):**
  - **`autor`:** $\le 45$ caracteres (usar `*Autor Principal* et al.` o siglas institucionales como `NASA`, `MIT`, `CERN`).
  - **`hito` (Anverso):** $\le 145$ caracteres (hecho clave en **negritas**, **estrictamente prohibido revelar el año**).
  - **`trivia` (Reverso):** $\le 150$ caracteres (contexto o anécdota técnica en 3-4 líneas compactas).
- **Protocolo de Auditoría en 4 Niveles (`data/audit.json`):**
  1. **Factual:** Precisión de fechas, nombres de software/hardware y causalidad sin anacronismos.
  2. **Fuente Primaria:** Respaldado por RFCs, PEPs, papers o repositorios oficiales en `sources`.
  3. **Pedagógico:** "Una carta = una sola idea principal" sin simplificaciones engañosas.
  4. **Editorial:** Tono sobrio y profesional (cero hipérboles como *"revolucionó para siempre"* o *"el mejor del mundo"*).
- **JavaScript & Arquitectura Frontend:**
  - Estándar nativo **ES Modules (Zero-Bundler)** bajo `web/core/` (`constants.js`, `rules.js`, `storage.js`, `state.js`, `audio.js`, `renderer.js`).
  - Prohibido agregar dependencias pesadas o bundlers obligatorios.
- **Node / Scripts:**
  - Validar sintaxis con `npm test` (incluye `node --check` y pruebas unitarias con Node.js Test Runner).
- **Git y Flujo de Trabajo:**
  - Todo cambio se integra mediante Pull Request utilizando la plantilla oficial de `.github/pull_request_template.md`.

