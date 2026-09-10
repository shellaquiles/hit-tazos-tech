# Changelog

Todos los cambios notables en este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-10

### Añadido
- **Separación de Experiencias Dedicadas (Hit-Tazo vs. Hit-Cards)**:
  - Selector modal de entrada (`#version-dialog`) con elección explícita entre Hit-Tazo (Tazos 3D físicos) y Hit-Cards (Tarjetas cuadradas de mesa 65×65 mm).
  - Acceso directo para alternar versión en cualquier momento haciendo clic en el isotipo de la cabecera.
  - Hojas de estilo desacopladas (`web/css/tazo.css` y `web/css/cards.css`) y renderers especializados (`TazoRenderer` y `CardsRenderer`) preservando el motor lógico compartido.
- **Pilas de Cartas Laterales para Escritorio ($N=5$)**:
  - Pilas físicas a izquierda (cartas jugadas / timeline) y derecha (próximas por jugar) visibles exclusivamente en escritorio.
  - Efecto de apilado escalonado tridimensional con cantos visibles de papel marfil 350g, rotaciones angulares orgánicas y micro-tags identificadores.
  - Expansión interactiva en abanico 3D al pasar el cursor (*hover fan-out*) y navegación con clic o teclas <kbd>P</kbd> / <kbd>N</kbd>.
- **Vista de Galería en Abanico (Modo Explorador)**:
  - Navegación táctil completa con arrastre (*drag*) y gestos swipe izquierda/derecha.
  - Visualización del anverso de las cartas con volteo interactivo al reverso.
  - Ribbons de juego ocultos en el explorador para centrar la experiencia en la lectura editorial.
- **Arquitectura modular desacoplada en ES Modules nativos (`web/core/`)**:
  - `web/core/constants.js`: Constantes centralizadas (`GAME_RULES`, `CHRONO_BOUNDS`, `STORAGE_KEYS`, paletas y taxonomía).
  - `web/core/rules.js`: Motor de cálculo con funciones puras para puntuación (+3 exacto, +1 cercano), pistas térmicas y ordenamiento cronológico.
  - `web/core/storage.js`: `StorageAdapter` con almacenamiento dual asíncrono (IndexedDB + fallback a `localStorage`) y validación estricta de esquemas.
  - `web/core/state.js`: `GameState` reactivo con patrón Observer (Pub/Sub) desacoplado del DOM.
  - `web/core/audio.js`: `AudioEngine` encapsulado con Howler para efectos retro (`flip`, `slam`, `hit`, `miss`, `tick`).
  - `web/core/renderer.js`: Orquestador `CardRenderer` para generación de plantillas seguras.
- **Suite de pruebas unitarias automatizadas (`tests/`)**:
  - 24 tests unitarios en Node.js integrados en el comando canónico `npm test`.
- **Mazo canónico de 576 tarjetas de trivia cronológica técnica** distribuidas en 8 volúmenes temáticos (`vol0` a `vol7`), rigurosamente investigadas y auditadas en 4 niveles (factual, fuente, pedagógico, editorial).
- **Motor de imposición multiformato para imprenta** (`render_print_tabloid.js`): Tabloide (11×17"), Carta (8.5×11") y Super Tabloide (12×18") con reversos espejados, sangrado de 3 mm, calles de 6 mm y fuentes TrueType incrustadas.
- **Sistema cromático desacoplado** (`card_colors.json`): Paletas HSL por millar con gradiente tonal y coordenadas CMYK para imprenta.
- **Especificación canónica para agentes de IA** (`AGENTS.md`) e infraestructura de gobernanza (`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `.github/`).

### Corregido
- **Compatibilidad de giro 3D en Firefox Gecko**:
  - Resuelto el bug de *backface-culling* en Firefox mediante reglas `@supports (-moz-appearance: none)` con `backface-visibility: visible !important` en estado `.is-flipped` y ocultamiento seguro de la cara opuesta.
  - Eliminado `transform-style: preserve-3d` de elementos hoja con `overflow: hidden`, evitando el aplanamiento ilegal del contexto 3D en Gecko.
  - Eliminado `fill: 'forwards'` de las animaciones WAAPI (`slamDisc`) para evitar que Firefox bloquee la capa de aceleración por hardware.
  - Incorporadas propiedades estándar `background-clip: text` para renderizado fiel del año metálico.
- **Lógica de volteo en tiros fallidos**:
  - Tiros errados con intentos restantes (`MISS_RETRY`) ejecutan rebote elástico sobre la mesa manteniendo la cara visible (anverso) sin revelar prematuramente el año.
