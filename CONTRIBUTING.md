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
   node build_cards.js
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

- **Límites de Caracteres Físicos:**
  - `creador`: $\le 45$ caracteres (usar `*Autor Principal* et al.` si hay más de 2 autores).
  - `hito`: $\le 145$ caracteres (claro, directo, sin spoilers del año).
  - `dato_curioso`: $\le 150$ caracteres (trivia compacta para lectura ágil).
- **JavaScript**: Estándar moderno Vanilla ECMAScript (sin frameworks pesados ni dependencias superfluas en el cliente).
- **Node / Scripts**: Validar con `node --check <archivo>.js`.
- **Git y PRs**: Todo cambio se somete a `main` a través de un Pull Request completando la plantilla correspondiente.
