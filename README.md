# Hit-Tazos Tech 🕹️💻

[![Version](https://img.shields.io/badge/version-1.0.0-orange.svg?style=flat-square)](./CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](./LICENSE)
[![Python](https://img.shields.io/badge/python-3.8%2B-3776AB.svg?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Node](https://img.shields.io/badge/node-%3E%3D18-339933.svg?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

Juego de trivia y orden cronológico sobre historia de la computación, software libre, sistemas, IA, silicio y el ecosistema Python. 

Funciona como aplicación web interactiva en el navegador y como juego de cartas físico de 576 tarjetas coleccionables.

---

## 🎮 Jugar en línea

Pruébalo directo en el navegador sin instalar nada:

👉 **[shellaquiles.github.io/hit-tazos-tech](https://shellaquiles.github.io/hit-tazos-tech/)**

La versión web incluye:
* Selector de formato: **Tazo circular 3D** o **Carta cuadrada** ($65 \times 65\text{ mm}$).
* Partida interactiva con dial de años, pistas por proximidad (frío/tibio/caliente) y sonido retro vía Web Audio API.
* Catálogo completo con buscador en tiempo real y vista en abanico.

---

## 🕹️ Cómo se juega

### En la web (Modo Arcade)
* **Objetivo:** Acertar el año de 10 tarjetas para armar tu línea de tiempo.
* **Mecánica:** Lees el hito y su autor (el año viene oculto). Mueves el dial temporal con el ratón o con las teclas `+` / `-` y disparas con `Enter`.
* **Intentos y pistas:** Tienes 3 tiros por tarjeta. Si fallas, el juego te indica la dirección (`↑ Más reciente` / `↓ Más antiguo`) y qué tan cerca estás (caliente $\le 5$ años, tibio $\le 15$, frío $> 15$).
* **Puntos:** 
  * Año exacto: +3 pts.
  * Margen de $\pm 2$ años: +1 pto.
  * Revelar el año cuesta 5 puntos acumulados.

### En mesa (Juego de cartas)
* **Objetivo:** Ser el primero en armar una línea de tiempo con 10 cartas ordenadas de más antigua a más reciente.
* **Preparación:** Cada jugador recibe 1 carta inicial boca arriba (año visible) y 3 fichas de apuesta.
* **Turno:**
  1. El jugador de la izquierda toma una carta del mazo y lee solo el hito del frente (sin ver el año ni el creador).
  2. El jugador en turno decide en qué posición de su línea temporal la coloca (antes, después o entre dos cartas que ya tenga).
  3. Los rivales pueden apostar una ficha a otra posición si creen que está equivocado.
  4. Se voltea la carta: quien tenga la posición correcta se la queda.

---

## 🖨️ Impresión y cartas físicas

El juego es libre bajo licencia MIT y puedes descargar los archivos listos para imprimir en casa o imprenta (*Print & Play*). 

Las cartas están diseñadas en formato cuadrado de **$65 \times 65\text{ mm}$** con esquinas redondeadas ($r=3\text{ mm}$), pensadas para imprimirse en cartulina de **$350\text{ g}$** con barniz mate anti-reflejante.

### Archivo PDF oficial para imprenta (Tamaño Carta)
El PDF vectorial incluye imposición de páginas, marcas de corte y reversos listos para impresión dúplex:

* 📄 **[Descargar PDF Formato Carta (8.5 × 11 pulg)](./print/v1.0.0/hit-tazos-tech-v1.0.0-carta.pdf):** 6 cartas por pliego (192 páginas dúplex para las 576 cartas).
* 🎨 Pliegos vectoriales editables disponibles en [`print/v1.0.0/svg/`](./print/v1.0.0/svg/).

### Adquirir las cartas en preventa
Si prefieres tener el juego físico ya impreso y en caja rígida:
* 💬 **WhatsApp:** [+52 55 4272 2156](https://wa.me/525542722156?text=Hola%20shellaquiles.org%2C%20me%20interesa%20apartar%20la%20edici%C3%B3n%20f%C3%ADsica%20de%20Hit-Cards%20Tech%20en%20preventa)
* ✉️ **Correo:** [preventa@shellaquiles.org](mailto:preventa@shellaquiles.org?subject=Preventa%20Hit-Cards%20Tech%20-%20Edici%C3%B3n%20F%C3%ADsica&body=Hola%20equipo%20de%20shellaquiles.org%2C%0A%0AMe%20gustar%C3%ADa%20solicitar%20informaci%C3%B3n%20para%20apartar%20las%20cartas%20f%C3%ADsicas%20en%20preventa.%0A%0ASaludos.)
* 🌐 **Sitio oficial:** [shellaquiles.org](https://shellaquiles.org)

---

## 📑 Contenido del mazo (576 cartas)

El mazo se divide en 8 volúmenes temáticos:

| Vol | Identificador | Cartas | Temas principales |
| :---: | :--- | :---: | :--- |
| **0** | `kernel-foundations` | 128 | Von Neumann, lógica booleana, teoría de la información y primeros algoritmos. |
| **1** | `cypherpunks-hacker-lore` | 64 | Criptografía asimétrica, manifiestos, FOSS, P2P y cultura hacker. |
| **2** | `embedded-silicon-hardware` | 64 | Microprocesadores clásicos, microcontroladores, arquitecturas CISC/RISC y silicio. |
| **3** | `unix-sysadmin-networks` | 64 | Filosofía Unix, TCP/IP, DNS, protocolos de red y administración de servidores. |
| **4** | `backend-distributed-systems` | 64 | Bases de datos, colas de mensajes, concurrencia y patrones backend. |
| **5** | `cloud-containers-sre` | 64 | Contenedores, Kubernetes, nubes públicas y prácticas SRE. |
| **6** | `python-track` | 64 | PEPs históricos, runtimes, GIL y evolución del lenguaje Python. |
| **7** | `scifi-pop-culture-cinema` | 64 | Cine hacker, ciencia ficción dura y cultura pop tecnológica. |

---

## 💻 Desarrollo local y pruebas

### Levantar el juego localmente
Funciona con Vanilla JS, CSS y HTML5 estándar:

```bash
# Con Node.js:
npm run serve

# O directo con Python:
python3 -m http.server 3333
```

### Pruebas y compilación
```bash
# Ejecutar suite de pruebas (24 tests unitarios, paridad de versión y auditoría):
npm test

# Compilar mazo maestro tras editar tarjetas:
npm run build

# Generar pliegos de imprenta:
npm run print
```

Para especificaciones avanzadas de datos y reglas de auditoría editorial, consulta [**`AGENTS.md`**](./AGENTS.md).

---

## 📄 Licencia

Código y datos bajo licencia MIT de **shellaquiles.org**.

* 📜 [Licencia MIT](./LICENSE)
* 📋 [Changelog](./CHANGELOG.md)
* 🤝 [Guía de Contribución](./CONTRIBUTING.md)
* 🛡️ [Seguridad](./SECURITY.md)
* 📜 [Código de Conducta](./CODE_OF_CONDUCT.md)
