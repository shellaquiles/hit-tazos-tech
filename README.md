# Hit-Tazos Tech 🕹️💻

[![Version](https://img.shields.io/badge/version-1.0.0-orange.svg?style=flat-square)](./CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](./LICENSE)
[![Python](https://img.shields.io/badge/python-3.8%2B-3776AB.svg?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Node](https://img.shields.io/badge/node-%3E%3D18-339933.svg?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Ecosystem](https://img.shields.io/badge/shellaquiles-ecosystem-9D2449.svg?style=flat-square)](https://github.com/shellaquiles)

Juego original e independiente de trivia cronológica técnica centrado en la historia de la computación, software libre, sistemas operativos, arquitectura de computadoras, IA y el ecosistema Python.

Funciona como aplicación web interactiva en el navegador y como juego de cartas físico con una **baraja maestra de 576 tarjetas coleccionables** rigurosamente investigadas y auditadas en 4 niveles.

---

## 🎮 Jugar en línea

Pruébalo directo en el navegador sin instalar nada:

🌐 **[shellaquiles.github.io/hit-tazos-tech](https://shellaquiles.github.io/hit-tazos-tech/)**

La versión web incluye:
* **Experiencia dual dedicada:** Alterna entre el **Tazo circular 3D** (con bisel maquinado CNC y ranuras *notchings*) y la **Carta cuadrada de sobremesa** ($65 \times 65\text{ mm}$).
* **Partida interactiva:** Dial cronológico retro, pistas cualitativas anti-spoiler por proximidad (frío/tibio/caliente), racha de aciertos y sonido sintetizado vía Web Audio API.
* **Pilas 3D laterales ($N=5$):** Montones interactivos escalonados a izquierda (historial) y derecha (mazo) con cantos visibles de papel 350g y expansión en abanico al pasar el cursor.
* **Catálogo y explorador:** Buscador tolerante a fallas en tiempo real y vista en abanico interactiva (*Fanning Mode*).

---

## 🕹️ Cómo se juega

### En la web (Modo Arcade)
* **Objetivo:** Acertar el año de 10 tarjetas para armar tu línea de tiempo personal.
* **Mecánica de turno:** Lees el hito y su autoría en el anverso (el año permanece oculto). Ajustas el dial temporal con el ratón o con las teclas <kbd>+</kbd> / <kbd>-</kbd> / <kbd>&uarr;</kbd> / <kbd>&darr;</kbd> y lanzas tu predicción con <kbd>Enter</kbd>.
* **Intentos y pistas (3 tiros por tarjeta):** Si fallas, el juego te indica la dirección (`↑ Más reciente` / `↓ Más antiguo`) y qué tan cerca estás (🔥 caliente $\le 5$ años, 🌡️ tibio $\le 15$, ❄️ frío $> 15$) sin revelar la cifra exacta.
* **Puntuación y penalización:**
  * **Año exacto:** +3 puntos y +1 a la racha.
  * **Margen cercano ($\pm 2$ años):** +1 punto y +1 a la racha.
  * **Revelar año:** Cuesta 5 puntos acumulados y bloquea el tiro de la tarjeta.

### En mesa (Juego de cartas)
* **Objetivo:** Ser el primer jugador en armar una línea de tiempo con 10 cartas ordenadas cronológicamente de la más antigua a la más reciente.
* **Preparación:** Cada jugador recibe 1 carta inicial boca arriba (año visible) en su estante y 3 fichas de apuesta.
* **Turno:**
  1. El jugador a la izquierda toma una carta del mazo central y lee únicamente el hito histórico del anverso (sin revelar el año ni el autor).
  2. El jugador en turno decide en qué posición de su línea temporal colocarla (antes, después o entre dos cartas que ya posea).
  3. Los rivales pueden apostar una ficha a otra posición si consideran que la colocación es errónea.
  4. Se voltea la carta: quien haya acertado la posición cronológica correcta se la queda en su línea de tiempo.

---

## 🖨️ Impresión y Cartas Físicas

El proyecto es **100% libre bajo licencia MIT** y descargable en PDFs vectoriales con imposición milimétrica (*Print & Play*). 

Las cartas físicas están diseñadas en formato cuadrado de **$65 \times 65\text{ mm}$** con esquinas redondeadas ($r=3\text{ mm}$), pensadas para imprimirse en cartulina de **$350\text{ g}$** con barniz mate anti-reflejante y guardarse en caja rígida coleccionable.

### Archivo PDF oficial para imprenta (Formato Carta)
Los PDFs vectoriales ya incluyen imposición de páginas, marcas de corte de 3 mm, calles de separación de 6 mm y reversos espejados automáticos:

* 📄 **[Formato Carta (8.5 × 11 pulg)](./print/v1.0.0/hit-tazos-tech-v1.0.0-carta.pdf):** Rejilla estándar de $2 \times 3$ cartas (6 cartas por pliego, 192 páginas dúplex para el mazo completo de 576 cartas).
* 🎨 Pliegos vectoriales editables disponibles en [`print/v1.0.0/svg/`](./print/v1.0.0/svg/).

### Adquirir las cartas físicas en preventa
Si prefieres adquirir la edición física profesional producida en fábrica (cartas suajadas de 350g, barniz mate y caja rígida de colección):
* 💬 **WhatsApp directo:** [+52 55 4272 2156](https://wa.me/525542722156?text=Hola%20shellaquiles.org%2C%20me%20interesa%20apartar%20la%20edici%C3%B3n%20f%C3%ADsica%20de%20Hit-Cards%20Tech%20en%20preventa)
* ✉️ **Correo electrónico:** [preventa@shellaquiles.org](mailto:preventa@shellaquiles.org?subject=Preventa%20Hit-Cards%20Tech%20-%20Edici%C3%B3n%20F%C3%ADsica&body=Hola%20equipo%20de%20shellaquiles.org%2C%0A%0AMe%20gustar%C3%ADa%20solicitar%20informaci%C3%B3n%20para%20apartar%20las%20cartas%20f%C3%ADsicas%20en%20preventa.%0A%0ASaludos.)
* 🌐 **Sitio oficial y comunidad:** [shellaquiles.org](https://shellaquiles.org)

---

## 📑 Contenido del Mazo (576 Cartas)

La baraja maestra se divide en 8 volúmenes temáticos rigurosamente auditados:

| Vol | Identificador | Cartas | Temas principales |
| :---: | :--- | :---: | :--- |
| **0** | `kernel-foundations` | 128 | Arquitectura Von Neumann, lógica booleana, teoría de la información, primeros compiladores y algoritmos fundacionales. |
| **1** | `cypherpunks-hacker-lore` | 64 | Criptografía asimétrica, PGP, manifiestos cypherpunk, FOSS, redes P2P y cultura hacker histórica. |
| **2** | `embedded-silicon-hardware` | 64 | Microprocesadores clásicos, microcontroladores, arquitecturas CISC/RISC, buses y litografía de silicio. |
| **3** | `unix-sysadmin-networks` | 64 | Filosofía Unix, sockets BSD, TCP/IP, DNS, protocolos de red y administración de servidores. |
| **4** | `backend-distributed-systems` | 64 | Motores de bases de datos, colas de mensajes, consenso distribuido y patrones de arquitectura backend. |
| **5** | `cloud-containers-sre` | 64 | Contenedores cgroups/namespaces, orquestación con Kubernetes, nubes públicas y prácticas SRE. |
| **6** | `python-track` | 64 | PEPs históricos, evolución de CPython, GIL, tipado estático, asyncio y ecosistema científico. |
| **7** | `scifi-pop-culture-cinema` | 64 | Cine hacker de culto, literatura cyberpunk, ciencia ficción dura y mitología tecnológica pop. |

---

## 💻 Desarrollo y Arquitectura Técnica

### Levantar el cliente web localmente
El cliente web está construido en **Vanilla JS + CSS moderno + HTML5** sin empaquetadores (*Zero-Bundler*):

```bash
# Con Node.js:
npm run serve

# O directamente con Python:
python3 -m http.server 3333

# Abrir en el navegador:
# http://localhost:3333/
```

### Pipeline de Verificación y Compilación
```bash
# 1. Ejecutar suite de calidad integral (Paridad de versión + Auditoría 4 niveles + 24 tests unitarios):
npm test

# 2. Compilar mazo maestro y manifiesto oficial tras editar volúmenes:
npm run build

# 3. Generar pliegos y PDFs oficiales de imprenta:
npm run print
```

### Arquitectura Modular (`web/core/`):
- **`web/core/constants.js`:** Constantes canónicas (`GAME_RULES`), límites temporales y paletas cromáticas.
- **`web/core/rules.js`:** Funciones puras de puntuación (+3 exacto, +1 cercano $\pm2$) y pistas térmicas anti-spoiler.
- **`web/core/storage.js`:** `StorageAdapter` con almacenamiento dual asíncrono (IndexedDB + LocalStorage) y validación de esquemas.
- **`web/core/state.js`:** `GameState` reactivo con patrón **Observer (Pub/Sub)** desacoplado de la interfaz.
- **`web/core/audio.js`:** `AudioEngine` encapsulado para sintetizar efectos retro con Web Audio API.
- **`web/core/renderer.js`:** Orquestador unificado con soporte dual:
  - `web/core/tazo-renderer.js`: Disco físico circular 3D y texto curvado SVG ($r=112$).
  - `web/core/cards-renderer.js`: Tarjetas cuadradas de sobremesa ($65 \times 65\text{ mm}$).
- **`web/app.js`:** Orquestador del cliente web, gestor de eventos DOM, gestos táctiles y atajos de teclado.

Para especificaciones avanzadas de datos, consulta [**`AGENTS.md`**](./AGENTS.md).

---

## 📄 Comunidad y Licencia

Desarrollado bajo licencia MIT como parte del ecosistema de herramientas libres de **shellaquiles.org**.

* 📜 [Licencia MIT](./LICENSE)
* 📋 [Historial de Versiones (Changelog)](./CHANGELOG.md)
* 🤝 [Guía de Contribución](./CONTRIBUTING.md)
* 🛡️ [Política de Seguridad](./SECURITY.md)
* 📜 [Código de Conducta](./CODE_OF_CONDUCT.md)
