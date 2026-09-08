---
name: card-curation-audit
description: >-
  Audita, valida y cura tarjetas de Hit-Tazos Tech. Utiliza este skill cuando se agreguen,
  reemplacen o modifiquen hitos en data/volumes/*.json para validar límites de caracteres,
  reglas anti-spoilers y taxonomía cerrada.
---

# Skill: Auditoría y Curaduría de Tarjetas (Hit-Tazos Tech)

Este skill define el procedimiento riguroso para auditar y curar tarjetas en el repositorio `hit-tazos-tech`.

## Procedimiento de Curaduría

1. **Revisión del Data Contract:**
   Cada tarjeta debe contener los campos:
   - `id`: `volX-0xYY` (hexadecimal de dos dígitos).
   - `volumen`: Slug oficial definido en `data/catalog.json`.
   - `index`: Entero secuencial `0..N-1`.
   - `domain`: Dominio semántico oficial.
   - `tag`: Tag que pertenezca estricta y unívocamente a ese `domain`.
   - `hito`: $\le 145$ caracteres, con el hecho principal en negritas (`**...**`). **Sin revelar el año.**
   - `year`: Entero de 4 dígitos.
   - `autor`: $\le 45$ caracteres.
   - `trivia`: $\le 150$ caracteres.

2. **Auditoría en 4 Niveles (Calidad y Veracidad):**
   - **Nivel 1 (Factual):** Comprobar fecha, autoría, evento, software/hardware, causalidad y cifras contra fuentes oficiales.
   - **Nivel 2 (Fuente):** Toda afirmación debe contar con fuente primaria o secundaria de alta reputación y registrarse en `data/audit.json`.
   - **Nivel 3 (Pedagógico):** **Una carta = una sola idea principal.** Sin sobrecarga cognitiva ni simplificaciones falsas.
   - **Nivel 4 (Editorial):** Cero lenguaje sensacionalista o novelesco (*"revolucionó para siempre"*, *"estándar indiscutible"*, *"colosal"*). Separar hecho histórico (anverso) de la trivia/contexto (reverso).

3. **Auditoría Automatizada de Límites:**
   Ejecutar siempre en la terminal:
   ```bash
   npm test
   ```
   Asegurarse de que reporte `0` violaciones para `autor` ($\le 45$), `hito` ($\le 145$) y `trivia` ($\le 150$).

4. **Verificación de Spoilers Temporales:**
   Revisar que ningún texto en `hito` contenga menciones explícitas de 4 dígitos que delaten el año antes de voltear la tarjeta.

5. **Registro Canónico de Auditoría:**
   Actualizar las entradas correspondientes en `data/audit.json` con su estado (`VERIFIED`, `VERIFIED_REWRITE`, `NEEDS_SOURCE`, `INCORRECT`), hallazgos y fuentes verificadas.
