### Optimizado
- **Rediseño Open Graph para Miniaturas Móviles ("Squint Test")**:
  - Implementación de una composición limpia y brutalista en `web/assets/og-cover.svg` y `web/assets/og-cover.png` basada en 3 anclas visuales de alto contraste (`HIT-TAZOS`, `¿AÑO EXACTO?` y la tarjeta colosal con el año `1991` titánico junto al tazo 3D).
  - Eliminación total del ruido secundario para garantizar legibilidad y reconocimiento icónico instantáneo en feeds móviles (WhatsApp, X/Twitter y LinkedIn).
- **Script Canónico de Portada Social (`scripts/generate_og_cover.py`)**:
  - Generador automatizado y determinista del banner vectorial y raster oficial a 1200×630 px.
- **SEO On-Page y Schema.org Enriquecido**:
  - Marcado estructurado JSON-LD con entidad `Game` y ofertas diferenciadas para juego libre Print & Play y preventa de la edición física.
  - Títulos y meta descripciones orientados a maximizar el CTR en búsquedas de cultura dev y juegos de mesa.

### Corregido
- **Rutas Canónicas de Descarga de PDFs en Sitemap**:
  - Corrección en `web/sitemap.xml` para dirigir la descarga directa de los 8 volúmenes a los assets de GitHub Releases (`https://github.com/shellaquiles/hit-tazos-tech/releases/latest/download/`), manteniendo el repositorio ligero.
