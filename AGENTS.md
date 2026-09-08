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
├── VERSION                              # Archivo de versión semántica (1.0.0-rc3)
├── package.json                         # Manifiesto y scripts npm (test, validate, build, print)
├── server.js                            # Servidor local de desarrollo (sirve web/ y data/)
├── data/                                # Contenido editorial y datos de trivia
│   ├── cards.json                       # Fuente maestra compilada con la baraja (576 cartas)
│   ├── card_colors.json                 # Configuración desacoplada de paletas cromáticas (#0001-#1000)
│   ├── catalog.json                     # Catálogo taxonómico oficial de dominios, tags y volúmenes
│   └── volumes/                         # 8 archivos JSON fuente de volúmenes
├── web/                                 # Aplicación web interactiva (juego y catálogo)
│   ├── index.html                       # Interfaz HTML5 principal
│   ├── app.js                           # Lógica del cliente, animaciones WAAPI y audio
│   ├── style.css                        # Hoja de estilos moderna
│   └── assets/                          # Recursos gráficos y multimedia
├── scripts/                             # Herramientas y scripts CLI de compilación y auditoría
│   ├── build_cards.js                   # Validador de la estructura maestra y generador de manifest
│   ├── scratch_audit.py                 # Script de auditoría de caracteres y presupuestos
│   └── generate_card_colors.js          # Generador CLI de configuración cromática por millar
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
4. **Nombres Oficiales de Salida:**
   - Los PDFs de distribución se compilan directamente en `print/hit-tazos-tech-v{VERSION}-{formato}.pdf`.
   - Los pliegos SVG individuales se organizan en `print/svg/{formato}/v{VERSION}/`.
   - Nunca generar archivos con sufijos redundantes (`_editable.pdf`).

---

## 🔄 9. Flujo Canónico de Trabajo y Compilación (3 Pasos Obligatorios)

Cada vez que un agente o desarrollador modifique datos editoriales en `data/volumes/*.json` o código de renderizado, **debe ejecutar en orden estricto**:

```bash
# Paso 1: Auditoría de caracteres, esquema y spoilers de fechas
npm test

# Paso 2: Compilación de baraja maestra y actualización de manifest
npm run build

# Paso 3: Regeneración de pliegos y PDFs oficiales de distribución
npm run print
```

---

## ⚠️ 10. Restricciones del Entorno y Políticas de Git

1. **Entorno local sin dependencias pesadas:** La web debe funcionar con Vanilla JS + CSS nativo + HTML5 sin bundlers obligatorios.
2. **Sin acceso a red para pip externo:** Usar únicamente la biblioteca estándar de Python 3 y utilidades CLI instaladas (`rsvg-convert`, `pdfunite`).
3. **POLÍTICA ESTRICTA DE GIT:** **NUNCA ejecutar `git commit` ni `git add`.** El control de versiones es potestad exclusiva del usuario.

