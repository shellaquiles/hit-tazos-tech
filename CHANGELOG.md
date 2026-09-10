# Changelog

Todos los cambios notables en este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-10

### Añadido
- **Separación de Experiencias Dedicadas (Hit-Tazo vs. Hit-Cards)**:
  - Selector inicial de versión (`#version-select-dialog`) con elección explícita entre Hit-Tazo (Tazos 3D físicos) y Hit-Cards (Tarjetas cuadradas de sobremesa 65×65 mm).
  - Acceso directo para alternar versión en cualquier momento desde el isotipo de la cabecera (`#btn-brand-version`).
  - Hojas de estilo desacopladas (`web/css/tazo.css` y `web/css/cards.css`) y renderers especializados (`TazoRenderer` y `CardsRenderer`) sobre el motor lógico unificado.
- **Flujo de Onboarding y Guía Rápida de Juego Adaptativa**:
  - Despliegue automático de la "Guía Rápida de Juego" (`#help-dialog`) inmediatamente después de elegir por primera vez el modo de juego en la pantalla de bienvenida.
  - Adaptación contextual y reactiva de los términos en el modal de ayuda según el formato activo (*"del tazo"* / *"10 tazos"* frente a *"de la tarjeta"* / *"10 cartas"*).
  - Control de primera visita (`isFirstTimeOnboarding`), garantizando que la guía no interrumpa en visitas subsecuentes ni al cambiar de modo desde la cabecera.
- **Pilas de Cartas Laterales para Escritorio ($N=5$)**:
  - Pilas físicas a la izquierda (cartas jugadas / línea de tiempo) y derecha (próximas por jugar en el mazo).
  - Efecto de apilado escalonado tridimensional con cantos visibles de papel marfil 350g, rotaciones angulares orgánicas y micro-tags identificadores.
  - Expansión interactiva en abanico 3D al pasar el cursor (*hover fan-out*) y navegación rápida con clic o teclado (<kbd>P</kbd> / <kbd>N</kbd>).
- **Vista de Galería en Abanico (Modo Explorador)**:
  - Navegación táctil y de ratón con arrastre (*drag*) y gestos swipe izquierda/derecha.
  - Visualización predeterminada del anverso de las cartas con volteo interactivo al reverso.
  - Interfaz depurada sin controles de juego en el modo explorador para una lectura editorial inmersiva.
- **Motor Físico y Renderizado 3D Multi-Plataforma**:
  - Renderizado 3D de disco físico con bisel CNC, ranuras perimetrales (*notchings*), gradiente oscuro neofrost y reflejo especular.
  - Compatibilidad total garantizada en Chromium, Safari y Firefox Gecko mediante directivas optimizadas de matriz 3D y descarte de caras.
  - Animaciones fluidas mediante Web Animations API (WAAPI) y transiciones elásticas.
- **Mecánica Interactiva de Revelado de Año (-5 Puntos)**:
  - Pastilla interactiva de revelado con validación de saldo mínimo (5 puntos) y penalización canónica de -5 pts con bloqueo de tiro.
  - Consistencia tipográfica y visual entre anversos de tazos y cartas con resaltado homogéneo en entidades clave.
- **Arquitectura Modular ES Modules Nativos (`web/core/`)**:
  - `web/core/constants.js`: Constantes canónicas centralizadas (`GAME_RULES`, `CHRONO_BOUNDS`, `STORAGE_KEYS`, paletas y taxonomía).
  - `web/core/rules.js`: Funciones puras de puntuación (+3 exacto, +1 cercano), pistas cualitativas direccionales/térmicas anti-spoiler y ordenamiento cronológico.
  - `web/core/storage.js`: `StorageAdapter` con persistencia dual asíncrona (IndexedDB + fallback a `localStorage`) y validación estricta de esquemas.
  - `web/core/state.js`: `GameState` reactivo con patrón Observer (Pub/Sub) desacoplado del DOM.
  - `web/core/audio.js`: `AudioEngine` encapsulado para retroalimentación sonora retro (`flip`, `slam`, `hit`, `miss`, `tick`).
  - `web/core/renderer.js`: Orquestador `CardRenderer` para generación de plantillas seguras.
- **Suite de Pruebas Unitarias Automatizadas (`tests/`)**:
  - 24 pruebas unitarias en Node.js integradas en el pipeline de verificación `npm test`.
- **Baraja Canónica de 576 Tarjetas Verificadas**:
  - 8 volúmenes temáticos canónicos (`vol0` a `vol7`) rigurosamente investigados y auditados en 4 niveles (factual, fuente, pedagógico, editorial).
- **Motor de Imposición Multiformato para Imprenta**:
  - Generador de pliegos (`render_print_tabloid.js`) para formatos Tabloide (11×17"), Carta (8.5×11") y Super Tabloide (12×18") con reversos espejados, sangrado de 3 mm y calles de 6 mm.
- **Sistema Cromático Desacoplado**:
  - Paletas HSL continuas por millar con gradientes tonales y equivalencias CMYK para imprenta en `data/card_colors.json`.
- **Canales de Preventa Física de Cartas y Filosofía Open Source**:
  - Puntos de contacto dedicados en cabecera (`#btn-preorder-header`), modal de impresión, selector de versión y guía rápida.
  - Enlaces directos preconfigurados para WhatsApp (+52 55 4272 2156) y Correo (`preventa@shellaquiles.org`) sin intermediarios ni pasarelas de pago.
  - Reafirmación del compromiso 100% libre bajo licencia MIT y Print & Play junto con la opción de adquirir cartas físicas de imprenta profesional (65×65 mm, 350g).
