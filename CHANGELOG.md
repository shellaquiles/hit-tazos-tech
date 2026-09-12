# Changelog

Todos los cambios notables en este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-09-11

### Añadido
- **Armonización 100% Circular en Modo Hit-Tazo**:
  - Transformación tridimensional de los mazos laterales (*Tech Trivia* y *Discard*) en auténticas **torres/cilindros 3D de tazos apilados** con cara superior circular concéntrica (`border-radius: 50%`), canto estriado de plástico apilado y bases de contacto elípticas.
  - Rediseño completo del estante de la línea de tiempo inferior (`.shelf-tazo-disc-chip`): cada hito ganado se despliega como un disco circular coleccionable de $118\text{px} \times 118\text{px}$ con sus 4 muescas perimetrales CNC, relieve concéntrico e insignia circular de año.
  - Soporte de interacción táctil y clic en tarjetas/tazos del estante para inspección directa en el visor central sin penalizaciones de tiro.
- **Nuevo Dial de Velocímetro Arqueado Continuo (`web/core/arc-dial.js`)**:
  - Módulo desacoplado ES Modules con cálculo trigonométrico nativo, arco SVG retroiluminado y escala continua de 1950 a 2026.
  - Tipografía agrandada de alta visibilidad (`16.5px`) para marcas de velocímetro y trazos dinámicos de 24px de longitud.
  - Flujo cognitivo natural unificado: **Dial Arqueado $\rightarrow$ Año Objetivo $\rightarrow$ Confirmación de Tiro**.
- **Drawer de Navegación Lateral y Cabecera Enfocada**:
  - Menú lateral deslizante a toda altura (`#drawer-menu`) con accesos directos a Modo Explorador, Guía de Juego, Imprimir & Play, Preventa física de barajas y repositorio GitHub.
  - Cabecera despejada conservando acceso rápido a alternar formato (Hit-Tazo vs. Hit-Cards), marcador reactivo de puntos y racha (*On Fire*).
- **Imposición Profesional y Marcas de Corte Perimetrales (`print/render_print_tabloid.js`)**:
  - Eliminación de marcas de corte internas en las calles intermedias (*gutters* de 6 mm) para evitar riesgos de filetes negros al corte en guillotina industrial.
  - Implementación de marcas de corte perimetrales de 5 mm exclusivamente en los márgenes exteriores del pliego (`generatePerimeterCropMarksSvg`), manteniendo el interior limpio.
  - Suite de pruebas unitarias automatizadas (`tests/print_imposition.test.js`) con validación de geometría en Carta y Tabloide.
- **Gamificación Arcade y Micro-Detalles**:
  - Punteros de tiros disponibles (`.attempt-pip`) transformados en micro-tazos 3D con aro metálico, bisel reflectante y núcleo azul neón.
  - Botón "LANZAR TIRO" rediseñado con degradado neón ámbar/naranja translúcido, desenfoque de fondo (*backdrop-filter: blur*) y feedback activo al presionar.

### Cambiado
- **Jerarquía Visual y Balance Espacial Arcade**:
  - Diámetro del tazo central ampliado de $290\text{px}$ a $340\text{px}$, con núcleo expandido al $76\%$ y tipografía nítida con respiro visual (`clamp(0.92rem, 2.5vw, 1.04rem)`).
  - Texto curvado en arcos sobre radio seguro $r=112$ con tipografía blanca pura de alto contraste, trazo oscuro perimetral (`stroke`) y sombra profunda para legibilidad inmediata sobre cualquier paleta cromática.
  - Compactación del escenario central eliminando áreas muertas y reduciendo separación vertical con los controles.
  - Centrado equilibrado de las tarjetas ganadas en la línea de tiempo (`justify-content: center`).
- **Alineación Flexbox y Layout Arcade Móvil**:
  - Centrado responsivo de las filas de acción y botones principales mediante Flexbox.
  - Optimización de proporciones, tipografía y respiro visual en pantallas móviles para el modo Hit-Tazo y el nuevo dial continuo.

### Corregido
- **Legibilidad y Contraste de Dígitos Ocultos ("????")**:
  - Corrección del reverso de cartas no resueltas: se eliminó el color `#111111` (pensado originalmente para imprenta en papel blanco) y se aplicó cian eléctrico brillante (`#38bdf8`) con resplandor difuso neón y espaciado de letras ampliado (`0.16em`).
  - Rediseño de la pastilla "REVELAR (-5 PTS)" con estética traslúcida y tipografía de alto contraste.
- **Coherencia Física en la Dirección de Animación de Cartas**:
  - Corrección de la translación horizontal en `transitionToCard()`: al pedir la siguiente carta, la actual viaja a la derecha hacia la pila de descarte y la nueva entra desde la torre de robo a la izquierda; al retroceder, la carta viaja hacia la izquierda.
  - Alineación de etiquetas de accesibilidad `title` y `aria-label` en ambas pilas.

## [1.0.0] - 2026-09-10

### Añadido
- **Separación de Experiencias Dedicadas (Hit-Tazo vs. Hit-Cards)**:
  - Selector inicial de versión (`#version-select-dialog`) con elección explícita entre Hit-Tazo (Tazos 3D físicos) y Hit-Cards (Tarjetas cuadradas de sobremesa 65×65 mm).
  - Acceso directo para alternar versión en cualquier momento desde el isotipo de la cabecera (`#btn-brand-version`).
  - Hojas de estilo desacopladas (`web/css/tazo.css` y `web/css/cards.css`) y renderers especializados (`TazoRenderer` y `CardsRenderer`) sobre el motor lógico unificado.
- **Capturas de Pantalla y Previsualización Visual**:
  - Incorporación de galería visual en `README.md` con capturas de alta resolución de la app web (`docs/screenshots/`): selector de versión, dial 3D de Hit-Tazo, sobremesa de Hit-Cards y guía rápida de juego.
  - Script automatizado `scripts/capture_screenshots.mjs` vía Chrome DevTools Protocol (`npm run screenshots`).
- **Actualización y Expansión Integral de Documentación**:
  - `README.md`: Nueva sección de arquitectura de software desacoplada (`web/core/`), especificación técnica de la experiencia dual (Hit-Tazo 3D vs Hit-Cards), catálogo detallado de los 8 volúmenes canónicos con enlaces de descarga directa a los PDFs de imprenta oficial, y tabla exhaustiva de controles y atajos de teclado.
  - `AGENTS.md`: Documentación formal del flujo de publicación y release automatizado con `gh` CLI (`.github/workflows/release.yml`), script extractor [`scripts/extract_release_notes.py`](file:///home/kubrick/www/hitster/scripts/extract_release_notes.py), y directrices actualizadas para agentes de IA.
  - `CONTRIBUTING.md` & `CODE_OF_CONDUCT.md`: Guías de contribución técnica y editorial enriquecidas con el protocolo de auditoría en 4 niveles (factual, fuente primaria, pedagógico y sobriedad editorial).
  - Modal de Ayuda Web (`#help-dialog`): Guía rápida enriquecida con diagramas conceptuales de los dos modos de juego, reglas de penalización de revelado de año (-5 pts) y navegación por teclado (<kbd>P</kbd>/<kbd>N</kbd>, <kbd>V</kbd>/<kbd>T</kbd>, <kbd>Enter</kbd>, <kbd>Shift+R</kbd>).
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
