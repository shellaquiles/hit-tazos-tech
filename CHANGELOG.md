# Changelog

Todos los cambios notables en este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-rc4] - 2026-09-09

### Añadido
- **Arquitectura modular desacoplada en ES Modules nativos (`web/core/`)**:
  - `web/core/constants.js`: Constantes centralizadas (`GAME_RULES`, `CHRONO_BOUNDS`, `STORAGE_KEYS`, paletas y taxonomía).
  - `web/core/rules.js`: Motor de cálculo con funciones puras para puntuación (+3 exacto, +1 cercano), pistas térmicas y ordenamiento cronológico.
  - `web/core/storage.js`: `StorageAdapter` con almacenamiento dual asíncrono (IndexedDB + fallback a `localStorage`) y validación estricta de esquemas de datos.
  - `web/core/state.js`: `GameState` reactivo con patrón Observer (Pub/Sub) desacoplado del DOM.
  - `web/core/audio.js`: `AudioEngine` encapsulado con Howler para efectos retro (`flip`, `slam`, `hit`, `miss`, `tick`).
  - `web/core/renderer.js`: `CardRenderer` para generación de plantillas seguras de Tazos y Tarjetas cuadradas.
- **Suite de pruebas unitarias automatizadas (`tests/`)**:
  - 17 tests unitarios en Node.js (`tests/rules.test.js`, `tests/state.test.js`, `tests/renderer.test.js`) integrados en el comando canónico `npm test` y `npm run test:unit`.
- **Soporte de Formato Dual (Tazo circular vs. Tarjeta cuadrada)**:
  - Alternador interactivo mediante botón en cabecera y atajo de teclado <kbd>T</kbd>.
- **Estética Cyber-Industrial y Estructura Física en 4 Capas (Tazos Neofrost 2026)**:
  - Bisel exterior maquinado CNC en titanio con rebaje circular concéntrico de 12 mm y reflejo especular satinado.
  - Núcleo central (face plate) con gradientes radiales oscuros profundos (`radial-gradient`) que preservan el fondo oscuro.
  - Paletas de tonos joya oscuros por volumen/dominio: Kernel (petróleo/cian glacial), Python (índigo profundo/azul eléctrico/oro), Hacker Lore (carbón/verde fósforo/carmesí), Silicon Hardware (cobre ahumado/ámbar), Cloud (azul espacial/turquesa), AI (amatista/magenta láser) y Sci-Fi (obsidiana cósmica/púrpura).
  - Micro-marcas láser de corte en cuadrantes y chips traslúcidos para tags y sintaxis.
  - Reflejo metálico maquinado / anisotrópico reactivo al puntero (`mix-blend-mode: color-dodge`) en escalas metálicas puras (sin gradientes arcoíris).
- **Sistema de Escalas de Edición y Rarezas Coleccionables**:
  - `edition-standard`: Acabado policarbonato oscuro mate con tonalidad de dominio.
  - `edition-silver`: Bisel plateado cromado con reflejo platino.
  - `edition-gold`: Hitos fundacionales históricos con bisel latón pulido y reflejo ámbar/dorado satinado.
  - `edition-holographic` (Black Chrome): Edición limitada en negro azabache con bisel de cromo pulido de alto contraste.
- **Barajeo inicial y por volumen garantizado**:
  - Algoritmo Fisher-Yates integrado en `setActiveDeck(deck, resetIndex, shuffle)` activado por defecto en la carga inicial (`init`) y al alternar entre volúmenes.
- **Vista de Galería en Abanico (Fanning Card Gallery)**:
  - Visualización en abanico interactivo con selector de modos cromáticos y navegación fluida.
- **Rediseño modular de la Guía Rápida de Juego (`#help-dialog`)**:
  - 3 pasos gráficos escaneables, pastillas de puntuación claras y atajos de teclado agrupados por función.

### Cambiado
- **Rediseño de Modal de Descarga e Impresión**:
  - Cuadrícula compacta de 2 columnas de alto contraste para descarga de PDFs vectoriales oficiales por volumen.
  - Retiro de la sección redundante de impresión directa en navegador (`printDuplexInBrowser`), centralizando la producción en los pliegos oficiales de imprenta.
- **Ajuste de seguridad tipográfica en discos circulares**:
  - Radio SVG de texto curvado ajustado a $r=112$ y márgenes perimetrales en `disc-core` para evitar colisión con las ranuras físicas perimetrales.
- **Limpieza de dependencias duplicadas**:
  - Eliminada carga redundante de Howler.js en `web/index.html`.

## [1.0.0] - 2026-09-08

### Añadido
- **Mazo canónico de 576 tarjetas de trivia cronológica técnica** distribuidas en 8 volúmenes temáticos (`vol0` a `vol7`), rigurosamente investigadas y auditadas en 4 niveles (factual, fuente, pedagógico, editorial).
- **Motor de imposición multiformato para imprenta** (`render_print_tabloid.js`): Tabloide (11×17"), Carta (8.5×11") y Super Tabloide (12×18") con reversos espejados, sangrado de 3 mm, calles de 6 mm y fuentes TrueType incrustadas.
- **Sistema cromático desacoplado** (`card_colors.json`): Paletas HSL por millar con gradiente tonal y coordenadas CMYK para imprenta.
- **Aplicación web interactiva**: Juego multi-intento con animaciones WAAPI, catálogo con filtros por volumen/dominio/tag, orden cronológico y búsqueda libre.
- **Pipeline de auditoría y compilación**: `audit_deck.py` (4 niveles), `build_cards.js` (baraja maestra) y `sync_version.py` (gobernanza de versión).
- **Especificación canónica para agentes de IA** (`AGENTS.md`) e infraestructura de gobernanza (`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `.github/`).
