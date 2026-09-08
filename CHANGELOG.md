# Changelog

Todos los cambios notables en este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-08

### Añadido
- **Mazo canónico de 576 tarjetas de trivia cronológica técnica** distribuidas en 8 volúmenes temáticos (`vol0` a `vol7`), rigurosamente investigadas y auditadas en 4 niveles (factual, fuente, pedagógico, editorial).
- **Motor de imposición multiformato para imprenta** (`render_print_tabloid.js`): Tabloide (11×17"), Carta (8.5×11") y Super Tabloide (12×18") con reversos espejados, sangrado de 3 mm, calles de 6 mm y fuentes TrueType incrustadas.
- **Sistema cromático desacoplado** (`card_colors.json`): Paletas HSL por millar con gradiente tonal y coordenadas CMYK para imprenta.
- **Aplicación web interactiva**: Juego multi-intento con animaciones WAAPI, catálogo con filtros por volumen/dominio/tag, orden cronológico y búsqueda libre.
- **Pipeline de auditoría y compilación**: `audit_deck.py` (4 niveles), `build_cards.js` (baraja maestra) y `sync_version.py` (gobernanza de versión).
- **Especificación canónica para agentes de IA** (`AGENTS.md`) e infraestructura de gobernanza (`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `.github/`).
