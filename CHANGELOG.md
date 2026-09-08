# Changelog

Todos los cambios notables en este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-rc2] - 2026-09-08

### Añadido
- **Expansión a 576 cartas y 8 volúmenes canónicos**: Integración del nuevo Volumen 7 (`scifi-pop-culture-cinema`, 64 cartas), abarcando literatura especulativa (*Frankenstein*, Ada Lovelace, Verne, Orwell), clásicos ciberpunk (*Neuromante*, *Snow Crash*), anime (*Akira*, *Ghost in the Shell*), cine y VFX (*2001*, *Blade Runner*, *Star Wars*, *Terminator*, *Jurassic Park*, *The Matrix*, *Iron Man*) y cultura pop/series tech (*El Santo*, *Pirates of Silicon Valley*, *The Social Network*, *Silicon Valley* HBO, *Mr. Robot*, *Snowden*, *The Playlist*).
- **Soporte de imposición para formato Super Tabloide (12×18 pulg)**: 64 pliegos dúplex (18 cartas/pliego) compilados junto con Tabloide (78 pliegos) y Carta (192 pliegos).
- **Convención oficial de nombres para imprenta**: Archivos versionados directos (`hit-tazos-tech-v1.0.0-rc2-tabloide.pdf`, `hit-tazos-tech-v1.0.0-rc2-carta.pdf`, `hit-tazos-tech-v1.0.0-rc2-super-tabloide.pdf`) y estructuración de pliegos SVG en `print/svg/{formato}/v{version}/`.

### Cambiado
- **Generalización intemporal de la línea de tiempo**: Eliminada la restricción de inicio fija `1957`, abarcando desde los pioneros históricos (1818 en literatura y protomáquinas) hasta la era moderna y el presente.
- **Barajeo determinista de IDs de tarjetas**: Desvinculación de la relación año-ID en el Volumen 7 (`vol7-0x00` a `vol7-0x3F`) para garantizar un reto imparcial de deducción en mesa.
- **Catálogo y selector web**: Opciones de orden cronológico intuitivas (*Más antiguo a más reciente* / *Más reciente a más antiguo*).

## [1.0.0-rc.1] - 2026-09-07

### Añadido
- **Mazo canónico de tarjetas de trivia técnica**: Dividido en grupos temáticos y categorías rigurosamente investigadas y auditadas.
- **Sistema cromático desacoplado por millar (`card_colors.json`)**: Paletas HSL intra-bloque con gradiente tonal (de suave a profundo cada 10 cartas) y coordenadas CMYK para imprenta.
- **Generador cromático CLI (`generate_card_colors.js`)**: Soporte para generación modular por lotes de 1,000 cartas.
- **Compilador y barajador determinista (`build_cards.js`)**: Generación y verificación del archivo maestro `cards.json` a partir de los 24 archivos fuente JSON.
- **Motor de imposición y maquetación para imprenta (`render_print_tabloid.js`)**:
  - Salida predeterminada para pliegos Tabloide/Doble Carta (11×17 pulgadas, 15 cartas por pliego, 72 páginas dúplex).
  - Salida opcional Super Tabloide (12×18 pulgadas, 18 cartas por pliego, 60 páginas dúplex).
  - Generación de 72 pliegos vectoriales SVG limpios con capas organizadas (`tabloide_pliegos_svg/`).
  - Generación de PDF vectorial editable (`tabloide_editable.pdf`) con fuentes TrueType incrustadas (`Noto Sans`, codificación `WinAnsi`).
  - Espejado horizontal fila por fila en reversos `[2, 1, 0]` para coincidencia submilimétrica al corte con guillotina.
  - Sangrado exterior de +3 mm, calles de separación de 6 mm y cruces de corte vectoriales.
- **Aplicación web interactiva (`index.html`, `app.js`, `style.css`)**:
  - Animaciones 3D de volteo de tarjeta con Web Animations API (WAAPI) y corrección de perspectiva/mirroring.
  - Flujo de juego multi-intento con pistas de dirección (más reciente / más antiguo), temperatura (frío, tibio, caliente) y contador visual de intentos.
  - Barra cronológica interactiva con chips de décadas, repisa coleccionable de 10 cartas y medidor de racha.
  - Catálogo completo con filtrado por categoría, grupo, búsqueda de texto libre y selector de orden (mazo barajado vs. cronológico).
  - Efectos de sonido retro sintetizados mediante Web Audio API y confeti dinámico con la paleta de la tarjeta acertada.
- **Auditoría editorial automatizada (`scratch_audit.py`)**: Script para validación estricta de presupuestos de caracteres (creador ≤ 45, hito ≤ 145, dato curioso ≤ 150) con 0 violaciones.
- **Especificación canónica para agentes de IA (`AGENTS.md`)**: Reglas de arquitectura, esquema de datos, límites editoriales, geometría de imprenta y flujo de trabajo.
- **Infraestructura de gobernanza y comunidad**: Adopción de lineamientos de la organización Shellaquiles (`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `.github/`).
