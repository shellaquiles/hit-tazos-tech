# Hit-Tazos Tech 🕹️💻

[![Version](https://img.shields.io/badge/version-1.0.0--rc.1-orange.svg?style=flat-square)](./CHANGELOG.md) [![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](./LICENSE) [![Python](https://img.shields.io/badge/python-3.8%2B-3776AB.svg?style=flat-square&logo=python&logoColor=white)](https://www.python.org/) [![Node](https://img.shields.io/badge/node-%3E%3D18-339933.svg?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/) [![Ecosystem](https://img.shields.io/badge/shellaquiles-ecosystem-9D2449.svg?style=flat-square)](https://github.com/shellaquiles)

Juego original e independiente de trivia cronológica técnica centrado en el ecosistema de **Tecnología, Desarrollo de Software, Infraestructura, Inteligencia Artificial y Cultura Hacker**, con un marcado énfasis en el **Universo Python**.

El juego comprende un **mazo exhaustivo de tarjetas de trivia cronológica (1957 – 2026)** organizadas en 5 grandes grupos temáticos y 24 categorías, listas para jugar en mesa o explorar interactivamente en la web.

---

## 🚀 Inicio Rápido (Jugar en el Navegador)

La aplicación web funciona sin dependencias pesadas de frontend (Vanilla JS + CSS moderno + HTML5):

```bash
# Iniciar servidor local
npm run serve
# o bien:
# python3 -m http.server 3333

# Abrir en el navegador:
# http://localhost:3333/
```

### Modos de la Aplicación Web:
* **🕹️ Partida Interactiva:** Tarjeta 3D que se voltea con animación WAAPI o barra espaciadora, flujo multi-intento con pistas direccionales (más reciente / más antiguo) y temperatura (frío/tibio/caliente), chips de décadas, racha de aciertos y repisa cronológica para coleccionar 10 cartas.
* **🔍 Explorador y Catálogo:** Visualización en cuadrícula con el **"Orden del Mazo (Bloques de Color)"**, donde se aprecia la transición tonal continua de 10 en 10 de claro a oscuro, además de filtros por grupo y búsqueda en tiempo real.
* **🔊 Audio y FX:** Efectos de sonido retro sintetizados con Web Audio API y confeti dinámico con la paleta de cada tarjeta al acertar.

---

## 🎮 Reglas de Juego en Mesa

### Objetivo
Ser el primer jugador o equipo en construir una **Línea de Tiempo cronológicamente correcta de 10 tarjetas**.

### Preparación
1. Toma el mazo barajado [`cards.json`](./data/cards.json) (o las tarjetas impresas con su numeración correlativa).
2. Cada jugador recibe **1 tarjeta inicial boca arriba** (con el año visible), marcando el inicio de su línea temporal personal.
3. Cada jugador recibe **3 tokens** (fichas o monedas de juego).

### Mecánica del Turno
1. **El Lector:** El jugador a la izquierda toma la carta superior del mazo y lee en voz alta **únicamente** el texto del frente (`hito`), sin mostrar el reverso ni revelar el año ni el creador.
2. **La Apuesta Cronológica:** El jugador en turno decide dónde encaja ese hito en su línea de tiempo actual (antes, entre dos cartas existentes, o después).
3. **El Desafío (Opcional):** Antes de revelar la carta, cualquier rival puede levantar un token y colocarlo en la posición donde considere que va, si cree que el jugador activo se equivocó.
4. **La Revelación:** Se voltea la tarjeta para verificar el año (`year`):
   - Si el jugador activo acertó: conserva la carta en su línea de tiempo.
   - Si falló y un rival colocó su token en la posición correcta: ese rival se queda con la carta.
5. **Puntos Bonus:** Si el jugador adivina con exactitud el año o el creador antes de voltearla, gana un token adicional.
6. **Victoria:** El primer jugador en acumular **10 tarjetas en orden cronológico estricto** gana la partida.

---

## 🖨️ Impresión Profesional en Tabloide (11×17 pulg)

El repositorio incluye un motor de imposición profesional para imprenta optimizado para hojas estándar **Tabloide / Doble Carta (11 &times; 17 pulgadas)** y **Carta / Letter (8.5 &times; 11 pulgadas)** para tarjetas cuadradas de **$65 \times 65\text{ mm}$**:

```bash
# Compilar baraja completa para ambos formatos (Tabloide y Carta)
npm run print

# Compilar específicamente por formato:
npm run print:tabloide   # 72 páginas dúplex (rejilla 3x5, 15 cartas/pliego)
npm run print:carta      # 178 páginas dúplex (rejilla 2x3, 6 cartas/pliego)

# Generar muestras de prueba (1 pliego):
npm run print:test            # Muestra de 1 pliego para ambos formatos
npm run print:test:tabloide   # Muestra de 1 pliego Tabloide (15 cartas)
npm run print:test:carta      # Muestra de 1 pliego Carta (6 cartas)
```

### Salidas y Archivos de Distribución Oficial:
* **[`print/hit-tazos-tech-v1.0.0-rc.1-tabloide.pdf`](./print/hit-tazos-tech-v1.0.0-rc.1-tabloide.pdf)** *(alias `tabloide_editable.pdf`)*: Documento vectorial de 72 páginas ($11 \times 17\text{ pulg}$) con fuentes TrueType (`Noto Sans`, `WinAnsi`), sin rasterizado. Rejilla de $3 \times 5$ cartas por pliego con reversos espejados `[2, 1, 0]`, pie de autoría oficial de **Shellaquiles Org** y metadatos PDF completos.
* **[`print/hit-tazos-tech-v1.0.0-rc.1-carta.pdf`](./print/hit-tazos-tech-v1.0.0-rc.1-carta.pdf)** *(alias `carta_editable.pdf`)*: Documento vectorial de 178 páginas ($8.5 \times 11\text{ pulg}$) con fuentes TrueType (`Noto Sans`, `WinAnsi`). Rejilla de $2 \times 3$ cartas por pliego con reversos espejados `[1, 0]` para coincidencia milimétrica en cualquier impresora doméstica o de oficina.
* **[`print/pliegos_svg/`](./print/pliegos_svg/):** 72 pliegos SVG individuales tamaño Tabloide con capas vectoriales editables y metadatos Dublin Core (`dc:creator = Shellaquiles Org`, `dc:relation = https://shellaquiles.org`).
* **[`print/pliegos_carta_svg/`](./print/pliegos_carta_svg/):** 178 pliegos SVG individuales tamaño Carta con capas vectoriales editables y metadatos Dublin Core.
* **[`data/manifest.json`](./data/manifest.json):** Manifiesto JSON canónico del mazo con versión, autoría, rangos cronológicos y sumarios editoriales.

---

## 📚 Los 5 Grandes Grupos Temáticos

| Grupo | Código | Descripción y Enfoque | Rango |
| :--- | :---: | :--- | :---: |
| **Universo Python** | `A1` – `A5` | Core, PEPs, GIL, runtimes alternativos, ecosistema ASGI/WSGI y herramientas modernas en Rust. | 1991 – 2026 |
| **Software, Web y Datos** | `B1` – `B5` | Lenguajes pioneros, estándares W3C/ECMAScript, control de versiones, foros y bases de datos. | 1957 – 2025 |
| **DevOps e Infraestructura** | `C1` – `C4` | Unix, Linux, contenedores, nubes públicas, Kubernetes e infraestructura como código. | 1969 – 2026 |
| **Cómputo, IA y Datos** | `D1` – `D4` | Cómputo científico, papers fundacionales de ML/DL, hitos competitivos y la era de los LLMs. | 1957 – 2026 |
| **Cultura Hacker y Leyendas** | `E1` – `E6` | Cypherpunks, ciberseguridad, bugs históricos, guerras santas, P2P y procesadores icónicos. | 1962 – 2026 |

---

## 🛠️ Especificaciones Técnicas y Desarrollo

Para desarrolladores, diseñadores y agentes de inteligencia artificial:
* Consulta [**`AGENTS.md`**](./AGENTS.md) para la **especificación técnica maestra**, incluyendo el contrato JSON de datos, presupuestos estrictos de caracteres ($\le 45$ autor, $\le 145$ hito, $\le 150$ trivia), matemáticas del sistema cromático HSL, fórmulas de imposición y flujo obligatorio de compilación.

---

## 📄 Comunidad y Licencia

Desarrollado bajo la licencia MIT como parte del ecosistema de proyectos de **Shellaquiles Org**.

- 📜 [Licencia MIT](./LICENSE)
- 📋 [Historial de Cambios (Changelog)](./CHANGELOG.md)
- 🤝 [Guía de Contribución](./CONTRIBUTING.md)
- 🛡️ [Política de Seguridad](./SECURITY.md)
- 📜 [Código de Conducta](./CODE_OF_CONDUCT.md)
