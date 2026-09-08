# Reglas e Instrucciones para Agentes de IA — Hit-Tazos Tech

Este documento es la **fuente canónica de verdad**, directrices técnicas, modelo de datos y procedimientos de compilación para cualquier agente de inteligencia artificial (AGENTS) o desarrollador que consulte, extienda o modifique este repositorio.

---

## 🎯 1. Visión y Arquitectura del Proyecto

**Hit-Tazos Tech** es un juego original e independiente de cartas de trivia cronológica técnica que comprende un **mazo exhaustivo de 576 tarjetas** rigurosamente investigadas y verificadas, divididas en 8 volúmenes canónicos.

### Estructura del Repositorio
```
hit-tazos-tech/
├── .github/                             # Gobernanza GitHub Actions (CI, PR template, CODEOWNERS)
├── .agents/rules/hittazos-guidelines.md # Regla de detección para herramientas agentic
├── AGENTS.md                            # Especificación técnica maestra para agentes de IA
├── README.md                            # Documentación principal con insignias y reglas de juego
├── CHANGELOG.md                         # Registro canónico de versiones (Keep a Changelog + SemVer)
├── CONTRIBUTING.md                      # Guía de contribución y flujo de auditoría editorial
├── CODE_OF_CONDUCT.md                   # Código de conducta de la comunidad Shellaquiles
├── SECURITY.md                          # Política de seguridad y reporte responsable
├── LICENSE                              # Licencia de código abierto MIT (Shellaquiles Org)
├── VERSION                              # Archivo de versión semántica (1.0.0)
├── package.json                         # Manifiesto y scripts npm (test, validate, build, print)
├── server.js                            # Servidor local de desarrollo (sirve web/ y data/)
├── data/                                # Contenido editorial y datos de trivia
│   ├── audit.json                       # Registro canónico de auditoría en 4 niveles y fuentes primarias
│   ├── cards.json                       # Fuente maestra compilada con la baraja (576 cartas)
│   ├── card_colors.json                 # Configuración desacoplada de paletas cromáticas (#0001-#1000)
│   ├── catalog.json                     # Catálogo taxonómico oficial de dominios, tags y volúmenes
│   ├── manifest.json                    # Manifiesto canónico de baraja con metadatos
│   └── volumes/                         # 8 archivos JSON fuente de volúmenes (vol0 a vol7)
├── web/                                 # Aplicación web interactiva (juego y catálogo)
│   ├── index.html                       # Interfaz HTML5 principal
│   ├── app.js                           # Lógica del cliente, animaciones WAAPI y audio
│   ├── style.css                        # Hoja de estilos moderna
│   └── assets/                          # Recursos gráficos, multimedia y fuentes
│       └── fonts/                       # 6 tipografías locales TTF (Outfit y Space Grotesk para modo offline)
├── scripts/                             # Herramientas y scripts CLI canónicos
│   ├── audit_deck.py                    # Validador integral en 4 niveles, presupuestos y anti-spoilers
│   ├── build_cards.js                   # Compilador de la baraja maestra y manifest
│   ├── generate_card_colors.js          # Generador CLI de configuración cromática por millar
│   └── sync_version.py                  # Sincronizador y verificador de paridad de versión canónica
├── print/                               # Motor de imposición y salidas para imprenta (Tabloide, Carta, Super Tabloide)
│   ├── render_print_tabloid.js          # Generador maestro de imposición multi-formato (SVG, Cairo PDF)
```

> [!IMPORTANT]
> **REGLA DE EDICIÓN:** El archivo maestro y único para editar datos no es `data/cards.json` de forma directa, sino los archivos JSON individuales que residen en `data/volumes/`. Una vez editados, siempre ejecuta `npm run build` para recompilar `data/cards.json`.

---

## 📑 2. Taxonomía de Volúmenes

El mazo de 576 cartas se distribuye en 8 volúmenes canónicos:
- **Vol 0:** `kernel-foundations` (128 cartas, IDs `vol0-0x00` a `vol0-0x7F`)
- **Vol 1:** `cypherpunks-hacker-lore` (64 cartas, IDs `vol1-0x00` a `vol1-0x3F`)
- **Vol 2:** `embedded-silicon-hardware` (64 cartas, IDs `vol2-0x00` a `vol2-0x3F`)
- **Vol 3:** `unix-sysadmin-networks` (64 cartas, IDs `vol3-0x00` a `vol3-0x3F`)
- **Vol 4:** `backend-distributed-systems` (64 cartas, IDs `vol4-0x00` a `vol4-0x3F`)
- **Vol 5:** `cloud-containers-sre` (64 cartas, IDs `vol5-0x00` a `vol5-0x3F`)
- **Vol 6:** `python-track` (64 cartas, IDs `vol6-0x00` a `vol6-0x3F`)
- **Vol 7:** `scifi-pop-culture-cinema` (64 cartas, IDs `vol7-0x00` a `vol7-0x3F`)

---

## 🎴 3. Esquema Oficial de Tarjeta (Data Contract)

Cada elemento de tarjeta en `data/cards.json` debe coincidir estrictamente con el siguiente esquema:

```json
{
  "id": "vol0-0x00",
  "volumen": "kernel-foundations",
  "index": 0,
  "domain": "ai-data-science",
  "tag": "neural-networks-papers",
  "hito": "Invención del **Perceptrón**, el primer modelo matemático y máquina física...",
  "year": 1957,
  "autor": "Frank Rosenblatt (Cornell Lab)",
  "trivia": "Probado en una IBM 704 con cámara de 400 fotocélulas; la marina predijo..."
}
```

### Reglas de Campos:
1. **`id`:** Identificador único con prefijo de volumen y número hexadecimal de dos dígitos (`volX-0xYY`).
2. **`volumen`:** Slug oficial del volumen según `data/catalog.json`.
3. **`index`:** Entero secuencial de `0` a `N-1`.
4. **`domain` / `tag`:** Taxonomía semántica oficial. **Regla de oro:** Todo `tag` pertenece estricta y unívocamente a un solo `domain`.
5. **`hito`:** Pista histórica para el anverso. Formato Markdown con el hecho/obra principal resaltado en negritas (`**...**`). **Estrictamente prohibido revelar el año.**
6. **`year`:** Entero de 4 dígitos (sin fecha fija de inicio, abarcando desde precursores históricos hasta la actualidad).
7. **`autor`:** Nombre del autor, autores o entidad institucional responsable.
8. **`trivia`:** Dato curioso o anécdota de contexto para el reverso.

---

## 📏 4. Límites Editoriales Estrictos (Presupuesto de Caracteres)

| Campo | Límite Máximo | Regla y Criterio Editorial |
| :--- | :---: | :--- |
| **`autor`** | **$\le 45$ caracteres** | Directo al creador o entidad responsable. Usar siglas para instituciones (ej. `NASA`, `MIT`, `CERN`). |
| **`hito`** (Anverso) | **$\le 145$ caracteres** | Conciso, directo al hecho técnico sin circunloquios. Debe incluir **negritas** para la entidad clave. **Cero spoilers de año.** |
| **`trivia`** (Reverso) | **$\le 150$ caracteres** | Anécdota o detalle técnico de 3 a 4 líneas compactas para lectura ágil en sobremesa. |

---

## 🔬 5. Protocolo de Auditoría Rigurosa en 4 Niveles y Calidad Editorial

Para garantizar que el juego enseñe hechos precisos y verificables sin sesgos novelescos ni simplificaciones falsas, toda tarjeta debe someterse y aprobar una auditoría en 4 niveles registrada en `data/audit.json`:

| Nivel | Qué se audita y valida | Criterio de Aprobación |
| :--- | :--- | :--- |
| **1. Factual** | Fecha, autoría, evento, software/hardware, causalidad y cifras. | Sin datos anacrónicos, atribuciones erróneas o relaciones de causa-efecto inventadas. |
| **2. Fuente** | Existencia de fuente primaria (RFC, PEP, paper, repo oficial, comunicado de vendor) o secundaria de alta reputación. | URL o referencia verificable registrada en `sources`. |
| **3. Pedagógico** | Fidelidad técnica del concepto explicado. | **Regla de oro: Una carta = una sola idea principal.** Explicación limpia sin sobrecarga ni atajos conceptuales engañosos. |
| **4. Editorial** | Tono sobrio, objetivo y profesional. | **Cero sensacionalismo:** Prohibidos términos como *"revolucionó para siempre"*, *"estándar indiscutible"*, *"el más adoptado del planeta"*, *"milagrosa"*, etc. Distinguir estrictamente entre **hecho histórico** (anverso) y **trivia/contexto** (reverso). |

### Estados Oficiales de Auditoría (`status`):
- `🟢 VERIFIED`: Factualmente impecable, redacción sobria y fuente primaria verificada.
- `🟡 VERIFIED_REWRITE`: Hecho histórico válido, pero requirió reescritura para eliminar hipérboles, sobrecarga o simplificación engañosa.
- `🟠 NEEDS_SOURCE`: Hecho plausible que requiere confirmación documental de cifras o atribuciones.
- `🔴 INCORRECT`: Error fáctico manifiesto que fue corregido en fecha, autor o contenido.

---

## 🎲 6. Desvinculación de IDs vs. Años (Barajeo Obligatorio)

1. **Impredecibilidad:** Los IDs dentro de cada volumen (`volX-0x00` a `volX-0xNN`) **deben estar barajeados aleatoriamente (shuffle)** y nunca correlacionados con el año histórico (`year`).
2. **Orden en archivo:** El archivo JSON del volumen se almacena ordenado por `index` / `id`, manteniendo los años cronológicamente dispersos para que sea imposible deducir el año a partir del identificador de la tarjeta durante la partida.

---

## 🎨 7. Sistema Cromático Desacoplado y Configuración por Millar

1. Los colores de las tarjetas residen desacoplados en `data/card_colors.json`, asignando paletas tonales HSL continuas (bloques de 10 en 10 con gradientes de luminosidad y saturación) y coordenadas CMYK para imprenta.
2. Cada tarjeta recibe un `globalIndex` (1 a 576) en tiempo de compilación/ejecución para vincular su identidad cromática.
3. Se generan y auditan por millar mediante `node scripts/generate_card_colors.js`.

---

## 🖨️ 8. Reglas de Imposición y Maquetación para Imprenta

1. **Formatos Oficiales:**
   - **`11x17` (Tabloide):** Rejilla de $3 \times 5$ cartas por pliego (15 cartas/pliego, 78 páginas dúplex para 576 cartas).
   - **`8x11` (Carta):** Rejilla de $2 \times 3$ cartas por pliego (6 cartas/pliego, 192 páginas dúplex para 576 cartas).
   - **`12x18` (Super Tabloide):** Rejilla de $3 \times 6$ cartas por pliego (18 cartas/pliego, 64 páginas dúplex).
2. **Geometría de Pliego:**
   - Tamaño de carta final de corte: **$65 \times 65\text{ mm}$**.
   - Sangrado técnico exterior (**bleed**): **$+3\text{ mm}$** por lado.
   - Calles de separación entre cartas (**gutter**): **$6\text{ mm}$** para doble corte limpio e independiente en guillotina.
   - Margen de seguridad tipográfica: **$\ge 8\text{ mm}$** libre de textos respecto al borde de corte.
3. **Reversos Espejados:**
   - En Tabloide: cada fila $[A, B, C]$ en el anverso se espeja como $[C, B, A]$ en el reverso.
   - En Carta: cada fila $[A, B]$ en el anverso se espeja como $[B, A]$ en el reverso.
4. **Nombres y Estructura Oficial de Salida:**
   - **Organización interna de imprenta por versión:** Todo el material de imprenta se organiza localmente bajo su versión semántica: `print/v{VERSION}/{formato}/` (ej. `print/v1.0.0/carta/`, `print/v1.0.0/tabloide/`, `print/v1.0.0/super_tabloide/`).
   - **Nombres canónicos permanentes para SEO:** Los PDFs no incluyen sufijo de versión en su nombre de archivo (ej. `hit-tazos-tech-vol0-kernel-foundations.pdf`, `hit-tazos-tech-carta.pdf`, `hit-tazos-tech-tabloide.pdf`). La versión semántica y autoría se preservan en los metadatos internos del documento (`DOCINFO` via Ghostscript).
   - **Distribución web en `assets/print/`:** En la web pública y en producción, los PDFs descargables por volumen se sirven de forma canónica desde `assets/print/hit-tazos-tech-vol{X}-{slug}.pdf`.
   - **Exclusión de Git en rama principal:** Los archivos binarios pesados (`print/**/*.pdf`, `print/**/svg/`, `web/assets/print/*.pdf`) están estrictamente ignorados en `.gitignore` para mantener limpio el historial del repositorio.
   - **Publicación automática:** En cada despliegue a la rama `gh-pages` vía GitHub Actions (`deploy-pages.yml`), se generan los PDFs en formato Carta por volumen y se copian a `assets/print/` en el artefacto de despliegue.

---

## 🔄 9. Flujo Canónico de Trabajo y Compilación (3 Pasos Obligatorios)

Cada vez que un agente o desarrollador modifique datos editoriales en `data/volumes/*.json` o código de renderizado, **debe ejecutar en orden estricto**:

```bash
# Paso 1: Auditoría integral en 4 niveles (Data Contract, presupuestos, anti-spoilers y audit.json)
npm run audit
# o bien: python3 scripts/audit_deck.py
npm test

# Paso 2: Compilación de baraja maestra y actualización de manifest
npm run build

# Paso 3: Regeneración de pliegos y PDFs oficiales de distribución
npm run print
```

---

## 🏷️ 10. Gobernanza y Sincronización de Versión Canónica

1. **Fuente Única de Verdad:** El archivo `VERSION` en la raíz del repositorio es la única fuente autorizada de la versión semántica actual (ej. `1.0.0`).
2. **Validación Automática:** `npm test` incluye la verificación de coherencia (`python3 scripts/sync_version.py --check`) que asegura que `package.json`, `data/manifest.json`, `data/card_colors.json`, `README.md`, `web/index.html` y `web/assets/og-cover.svg` estén estrictamente alineados.
3. **Propagación:** Para actualizar todos los metadatos tras cambiar `VERSION`, se ejecuta:
   ```bash
   npm run version:sync
   ```

---

## 🔤 11. Tipografías Locales y Soporte Offline

1. La web consume por defecto Google Fonts en entornos con conexión.
2. Como respaldo para entornos desconectados (offline / air-gapped) y para usuarios que clonen el repositorio, `web/assets/fonts/` contiene los archivos TrueType oficiales (`Outfit-Bold.ttf`, `Outfit-Medium.ttf`, `Outfit-Regular.ttf`, `SpaceGrotesk-Bold.ttf`, `SpaceGrotesk-Medium.ttf`, `SpaceGrotesk-Regular.ttf`).
3. `web/style.css` declara directivas `@font-face` locales apuntando a estos archivos como fallback garantizado.
4. Para la imposición con Cairo (`rsvg-convert`), estas fuentes pueden instalarse en el sistema operativo del desarrollador (`~/.local/share/fonts`).

---

## ⚠️ 12. Restricciones del Entorno y Políticas de Git

1. **Entorno local sin dependencias pesadas:** La web debe funcionar con Vanilla JS + CSS nativo + HTML5 sin bundlers obligatorios.
2. **Sin acceso a red para pip externo:** Usar únicamente la biblioteca estándar de Python 3 y utilidades CLI instaladas (`rsvg-convert`, `pdfunite`).
3. **POLÍTICA ESTRICTA DE GIT:** **NUNCA ejecutar `git commit` ni `git add`.** El control de versiones es potestad exclusiva del usuario.

---

## 🧩 13. Directriz de Desarrollo Web: "Don't Reinvent the Wheel" y Micro-Librerías

Para evitar el **síndrome NIH (Not Invented Here)** y no escribir código utilitario de bajo nivel repetitivo o frágil:

1. **"Don't reinvent the wheel":** Prohibido programar motores de partículas, sintetizadores de audio complejos desde cero, parsers ad-hoc o gestores táctiles trigonométricos a mano cuando existen soluciones maduras y estándar.
2. **"Off-the-shelf libraries":** Utilizar soluciones listas para usar mediante CDN en HTML estático sin bundlers obligatorios.
3. **"Drop-in replacement":** Toda librería integrada debe funcionar como reemplazo directo sin desarmar la arquitectura central del motor ni su persistencia.
4. **"Micro-libraries / Zero-dependencies (1 a 5 KB)":** Priorizar librerías ultra-ligeras y modulares de un solo propósito:
   - **`canvas-confetti`:** Efecto de confeti y partículas.
   - **`zzfx`:** Audio procedural y sonidos de impacto sin AudioContext manual.
   - **`vanilla-tilt`:** Parallax 3D y reflejo especular (*glare*).
   - **`hotkeys-js`:** Mapeo declarativo de teclado ignorando inputs de texto.
   - **`fuse.js`:** Búsqueda difusa tolerante a fallas en el catálogo.
   - **`snarkdown`:** Parser de Markdown a HTML estándar.
   - **`idb-keyval`:** Persistencia asíncrona en IndexedDB con API tipo clave-valor.
   - **`tinygesture`:** Reconocimiento de gestos táctiles móviles (`swipe`, `tap`) respetando el scroll vertical.



