# Hit-Tazos Tech 🕹️💻

[![Version](https://img.shields.io/badge/version-1.0.0-orange.svg?style=flat-square)](./CHANGELOG.md) [![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](./LICENSE) [![Python](https://img.shields.io/badge/python-3.8%2B-3776AB.svg?style=flat-square&logo=python&logoColor=white)](https://www.python.org/) [![Node](https://img.shields.io/badge/node-%3E%3D18-339933.svg?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/) [![Ecosystem](https://img.shields.io/badge/shellaquiles-ecosystem-9D2449.svg?style=flat-square)](https://github.com/shellaquiles)

Juego original e independiente de trivia cronológica técnica centrado en el ecosistema de **Tecnología, Desarrollo de Software, Infraestructura, Inteligencia Artificial y Cultura Hacker**, con un marcado énfasis en el **Universo Python**.

El juego comprende un **mazo exhaustivo de tarjetas de trivia cronológica técnica** rigurosamente verificadas, listas para jugar en mesa o explorar interactivamente en la web.

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
* **🔄 Formato Dual (Tazo vs. Tarjeta):** Alterna en tiempo real entre la vista retro de **Tazo Físico Circular** (con ranuras y notchings) y la de **Tarjeta Cuadrada** clásica usando el botón en cabecera o la tecla <kbd>T</kbd>.
* **🔍 Explorador y Catálogo:** Visualización en cuadrícula con el **"Orden del Mazo (Bloques de Color)"**, donde se aprecia la transición tonal continua de 10 en 10 de claro a oscuro, además de filtros por grupo y búsqueda en tiempo real.
* **🔊 Audio y FX:** Efectos de sonido retro sintetizados con Web Audio API y confeti dinámico con la paleta de cada tarjeta al acertar.

## 🕹️ Dinámica y Reglas del Juego Web (Modo Arcade)

La aplicación web (`web/`) implementa un juego arcade interactivo de trivia cronológica técnica con físicas 3D de moneda, pistas térmicas y persistencia:

### 🎯 Objetivo de la Partida
Coleccionar **10 Tazos ganados** en tu Línea de Tiempo Personal adivinando los años de los hitos tecnológicos.

### 🎲 Mecánica de Turno y Disparo
1. **Lectura del Hito:** El Tazo se presenta en su anverso mostrando el hito histórico, autor(es) y tags temáticos (el año permanece oculto).
2. **Ajuste de Año:** Usa el **Dial Cronológico** (deslizador retro), los botones de paso o los atajos de teclado (<kbd>+</kbd> / <kbd>-</kbd> / <kbd>&uarr;</kbd> / <kbd>&darr;</kbd>).
3. **Lanzar Tiro:** Pulsa el botón **¡LANZAR TIRO!** o la tecla <kbd>Enter</kbd>.

### 🏹 Tiros Disponibles (3 Intentos por Tarjeta)
El HUD superior muestra **3 micro-tazos indicadores** que representan tus tiros disponibles para la tarjeta actual:
* **Tiro Acertado:** Ganas la tarjeta y sumas puntos.
* **Tiro Fallido:** Consume 1 tiro y muestra una pista cualitativa sin revelar la cifra:
  * **Dirección:** `↑ Más reciente` (el año real es posterior) o `↓ Más antiguo` (el año real es anterior).
  * **Temperatura:** `🔥 ¡Caliente!` ($\le 5$ años de diferencia), `🌡️ Tibio` ($\le 15$ años) o `❄️ Frío` ($> 15$ años).
* **Último Tiro:** Cuando solo queda 1 intento, el indicador pulsa en color ámbar/fuego de advertencia.
* **Agotar los 3 tiros:** Si fallas el tercer tiro, el Tazo se voltea automáticamente, revela su año sin sumar puntos y el tiro queda bloqueado.

### 🏆 Sistema de Puntuación y Racha
| Acontecimiento | Puntos | Racha | Línea de Tiempo |
| :--- | :---: | :---: | :---: |
| 🎯 **Año Exacto** | **+3 Puntos** | **+1 Racha** | Se agrega a Tazos Ganados |
| 🟡 **Muy Cerca ($\pm 2$ años)** | **+1 Punto** | **+1 Racha** | Se agrega a Tazos Ganados |
| ❄️ **Tiro Fallido** | **0 Puntos** | **Se reinicia a 0** | Quedan intentos restantes |
| ❌ **3 Intentos Agotados** | **0 Puntos** | **Se reinicia a 0** | No se agrega al estante |
| 👁️ **Revelar Año (Compra)** | **-5 Puntos** | **Se reinicia a 0** | Tiro bloqueado |

* **Modo "On Fire" (`streak-hot`):** Al hilar **2 o más aciertos consecutivos**, la pastilla de Racha en el HUD emite un resplandor carmesí brillante.

### 👁️ Revelar Año (-5 Puntos)
* Puedes tocar la pastilla **REVELAR (-5 PTS)** en el reverso o el botón inferior para conocer la respuesta histórica.
* **Regla estricta:** No se permiten puntos negativos. Si tienes menos de 5 puntos (`score < 5`), el año **no se revela** y el tiro sigue disponible.
* Al revelar con éxito, se descuentan 5 puntos y el tiro se bloquea para ese Tazo.

### 💾 Persistencia en Caché y Memoria de Tazos
* Todo Tazo resuelto o revelado se guarda de forma persistente en **IndexedDB** (`idb-keyval`) con respaldo en `localStorage`.
* Si vuelves a navegar a un Tazo ya resuelto, el juego recuerda su estado: el tiro permanece deshabilitado y no se puede volver a adivinar.
* **Inspección de Tazos Ganados:** Haz clic sobre cualquier ficha de tu línea de tiempo para traerla al escenario 3D e inspeccionar su anverso, reverso y lore.

### 🔀 Barajeo y Reinicio
* **Barajeo automático:** Al iniciar la app, recargar la página o cambiar de mazo/volumen, la baraja se mezcla aleatoriamente mediante Fisher-Yates.
* **Reiniciar Partida:** Puedes pulsar el botón de reinicio en el header, en el estante de Tazos Ganados o pulsar <kbd>Shift</kbd>+<kbd>R</kbd> para vaciar la línea de tiempo, resetear puntos/racha y limpiar la caché de tarjetas resueltas.

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
6. **Victoria:** El primer jugador en acumular 10 tarjetas en orden cronológico estricto gana la partida.

---

## 🖨️ Impresión Profesional (Tabloide, Carta y Super Tabloide)

El repositorio incluye un motor de imposición profesional para imprenta optimizado para hojas estándar **Tabloide (11 × 17 pulg)**, **Carta (8.5 × 11 pulg)** y **Super Tabloide (12 × 18 pulg)** para tarjetas cuadradas de **$65 \times 65\text{ mm}$**:

```bash
# Compilar baraja completa para los 3 formatos (Tabloide, Carta y Super Tabloide)
npm run print

# Compilar un formato específico:
npm run print:tabloide        # 11x17 pulg (15 cartas/pliego)
npm run print:8x11            # 8.5x11 pulg (6 cartas/pliego)
npm run print:carta           # Alias de 8x11

# Generar muestras de prueba:
npm run print:test            # Muestra para los 3 formatos
npm run print:test:tabloide   # Muestra de 1 pliego Tabloide (15 cartas)
npm run print:test:8x11       # Muestra de 1 pliego Carta (6 cartas)
```

### Salidas y Archivos de Distribución Oficial:
* **[`print/v1.0.0/hit-tazos-tech-v1.0.0-tabloide.pdf`](./print/v1.0.0/hit-tazos-tech-v1.0.0-tabloide.pdf)**: Documento vectorial de 78 páginas ($11 \times 17\text{ pulg}$) con fuentes TrueType (`Noto Sans`, `WinAnsi`), sin rasterizado. Rejilla de $3 \times 5$ cartas por pliego con reversos espejados `[2, 1, 0]`, pie de autoría oficial de **shellaquiles.org** y metadatos PDF completos.
* **[`print/v1.0.0/hit-tazos-tech-v1.0.0-carta.pdf`](./print/v1.0.0/hit-tazos-tech-v1.0.0-carta.pdf)**: Documento vectorial de 192 páginas ($8.5 \times 11\text{ pulg}$) con fuentes TrueType (`Noto Sans`, `WinAnsi`). Rejilla de $2 \times 3$ cartas por pliego con reversos espejados `[1, 0]` para coincidencia milimétrica en cualquier impresora doméstica o de oficina.
* **[`print/v1.0.0/hit-tazos-tech-v1.0.0-super-tabloide.pdf`](./print/v1.0.0/hit-tazos-tech-v1.0.0-super-tabloide.pdf)**: Documento vectorial de 64 páginas ($12 \times 18\text{ pulg}$) con rejilla de $3 \times 6$ cartas por pliego para prensas digitales de gran formato.
* **[`print/v1.0.0/svg/`](./print/v1.0.0/svg/)**: Pliegos SVG individuales vectoriales organizados por formato (`tabloide/`, `carta/`, `super_tabloide/`) con capas editables y metadatos Dublin Core (`dc:creator = shellaquiles.org`, `dc:relation = https://shellaquiles.org`).
* **[`data/manifest.json`](./data/manifest.json):** Manifiesto JSON canónico del mazo con versión, autoría, rangos cronológicos y sumarios editoriales.

---

## 📚 Taxonomía de la Baraja (8 Volúmenes / 576 Cartas)

La baraja completa consta de **576 cartas** rigurosamente investigadas y estructuradas en 8 volúmenes canónicos:

| Volumen | Slug | Cartas | Descripción y Enfoque Temático |
| :--- | :--- | :---: | :--- |
| **Vol 0** | `kernel-foundations` | 128 | Bases de la computación, arquitectura von Neumann, lógica binaria, teoría de la información y algoritmos madre. |
| **Vol 1** | `cypherpunks-hacker-lore` | 64 | Criptografía asimétrica, manifiestos cypherpunk, ciberseguridad, FOSS, P2P y leyendas de la red. |
| **Vol 2** | `embedded-silicon-hardware` | 64 | Microprocesadores clásicos, silicio, microcontroladores, arquitecturas RISC/CISC, GPUs y hardware embebido. |
| **Vol 3** | `unix-sysadmin-networks` | 64 | Filosofía UNIX, protocolos de red (TCP/IP, DNS, HTTP), administración de sistemas y software libre. |
| **Vol 4** | `backend-distributed-systems` | 64 | Arquitecturas distribuidas, motores de bases de datos, paradigmas backend, colas de mensajes y concurrencia. |
| **Vol 5** | `cloud-containers-sre` | 64 | Contenedores, orquestación con Kubernetes, nubes públicas, observabilidad, CI/CD e ingeniería SRE. |
| **Vol 6** | `python-track` | 64 | Historia de Python, PEPs emblemáticos, GIL, runtimes, ecosistemas web/asíncronos y herramientas modernas. |
| **Vol 7** | `scifi-pop-culture-cinema` | 64 | Literatura especulativa, clásicos ciberpunk, cine hacker, efectos visuales (CGI/VFX) y cultura pop técnica. |

---

## 🛠️ Especificaciones Técnicas y Desarrollo

Para desarrolladores, diseñadores y agentes de inteligencia artificial:
* Consulta [**`AGENTS.md`**](./AGENTS.md) para la **especificación técnica maestra**, incluyendo el contrato JSON de datos, presupuestos estrictos de caracteres ($\le 45$ autor, $\le 145$ hito, $\le 150$ trivia), matemáticas del sistema cromático HSL, fórmulas de imposición y flujo obligatorio de compilación.

### 🔤 Soporte Offline y Tipografías Locales
La aplicación web utiliza por defecto las familias tipográficas modernas **Outfit** y **Space Grotesk**. Para garantizar una experiencia óptima y totalmente funcional en entornos desconectados (sin acceso a internet / air-gapped):
1. **Directivas `@font-face` locales:** El repositorio incluye los 6 archivos TrueType (`.ttf`) oficiales en [`web/assets/fonts/`](./web/assets/fonts/), configurados en [`web/style.css`](./web/style.css) como respaldo local automático en caso de que Google Fonts no esté disponible.
2. **Instalación en el sistema operativo (opcional para imprenta):** Para desarrolladores que generen pliegos de imprenta mediante Cairo (`rsvg-convert`) sin dependencias de red, estas fuentes pueden instalarse directamente en el sistema:
   ```bash
   # En distribuciones Linux:
   mkdir -p ~/.local/share/fonts
   cp web/assets/fonts/*.ttf ~/.local/share/fonts/
   fc-cache -f -v
   ```

### 🏷️ Gobernanza y Sincronización de Versión
La versión canónica del proyecto reside exclusivamente en el archivo [`VERSION`](./VERSION). Para evitar inconsistencias entre metadatos (`package.json`, `data/manifest.json`, `README.md`, `index.html`, `og-cover.svg`), se incluye un verificador automático:
```bash
# Validar paridad de versión:
npm run version:check

# Sincronizar automáticamente todos los archivos con VERSION:
npm run version:sync
```

### 🧪 Suite de Pruebas Automatizadas y Calidad de Código
El proyecto cuenta con un pipeline de calidad integral y una suite de pruebas unitarias nativas (`node --test`) para garantizar la precisión factual de los datos, la estabilidad del motor y la prevención de regresiones:

```bash
# Ejecutar suite completa (Versión + Auditoría de 576 cartas + Pruebas unitarias + Sintaxis):
npm test

# Ejecutar únicamente pruebas unitarias (17 tests en ~160ms):
npm run test:unit
```

#### Arquitectura Modular del Cliente Web (`web/core/`):
La lógica del cliente opera con **ES Modules nativos sin empaquetadores (Zero-Bundler)** estructurados bajo el principio de responsabilidad única (SRP):
- **`web/core/constants.js`:** Reglas canónicas (`GAME_RULES`), límites temporales y paletas cromáticas.
- **`web/core/rules.js`:** Motor de cálculo con funciones puras para puntuación (+3 exacto, +1 cercano $\pm2$) y pistas térmicas anti-spoiler.
- **`web/core/storage.js`:** `StorageAdapter` con persistencia dual asíncrona (IndexedDB + LocalStorage) y validación de esquemas en tiempo de ejecución.
- **`web/core/state.js`:** `GameState` reactivo con patrón **Observer (Pub/Sub)** desacoplado de la interfaz gráfica.
- **`web/core/audio.js`:** `AudioEngine` encapsulado con Howler para efectos de audio retro sin fugas de contexto.
- **`web/core/renderer.js`:** `CardRenderer` para generación segura de Tazos circulares (arco seguro $r=112$) y tarjetas cuadradas.
- **`web/app.js`:** Orquestador de vistas, atajos de teclado y gestos táctiles.

---

## 📄 Comunidad y Licencia

Desarrollado bajo la licencia MIT como parte del ecosistema de proyectos de **shellaquiles.org**.

- 📜 [Licencia MIT](./LICENSE)
- 📋 [Historial de Cambios (Changelog)](./CHANGELOG.md)
- 🤝 [Guía de Contribución](./CONTRIBUTING.md)
- 🛡️ [Política de Seguridad](./SECURITY.md)
- 📜 [Código de Conducta](./CODE_OF_CONDUCT.md)
