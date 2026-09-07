# HITSTER: Tech, Python & Hacker Edition 🕹️💻

Edición de trivia cronológica estilo **HITSTER** adaptada al ecosistema de **Tecnología, Desarrollo de Software, Infraestructura, Inteligencia Artificial y Cultura Hacker**, con un marcado énfasis en el **Universo Python**.

El corpus actual comprende **531 hitos históricos verificados (1957 – 2026)** distribuidos en **5 Grupos Principales** y **24 Categorías Temáticas**, compilados y barajados como una baraja física real.

---

## 🎨 Sistema de Diseño Físico y Paleta Cromática

El diseño y la organización de las cartas replican fielmente la experiencia de una baraja de mesa **HITSTER original**:

1. **Alineación de Años No Lineal (Barajado Físico):**  
   En las cartas físicas, los años no están ordenados cronológicamente; están barajados para evitar que los jugadores puedan deducir la fecha a partir del número de carta o de la posición en el mazo.
2. **Consecutivo Oficial (`card_number`):**  
   Cada carta tiene impreso un número consecutivo (`#001` a `#531`) en la esquina inferior derecha tanto del frente como del reverso. No se utiliza un campo `id` redundante.
3. **Bloques de Color de 10 en 10:**  
   Las cartas se organizan en familias cromáticas mate cada 10 cartas:
   - `001 – 010`: Bloque Carmín / Rojo cálido
   - `011 – 020`: Bloque Violeta / Morado medio
   - `021 – 030`: Bloque Naranja cálido
   - `031 – 040`: Bloque Lavanda / Malva suave
   - `041 – 050`: Bloque Amarillo / Ámbar dorado
   - `051 – 060`: Bloque Lila pálido / Azul pastel
   - `061 – 070`: Bloque Lima / Verde fresco
   - `071 – 080`: Bloque Turquesa / Cian oceánico
   - `081 – 090`: Bloque Rosa coral / Fucsia suave
   - `091 – 100`: Bloque Ocre / Canela tostado
   *(El ciclo se repite con elegancia en las siguientes centenas).*
4. **Gradiente Tonal Interno (Claro $\rightarrow$ Oscuro):**  
   Dentro de cada bloque de 10 tarjetas, el tono evoluciona de manera continua: la primera tarjeta (ej. `#001`) tiene un tono claro y suave ($L \approx 72\%$), y la décima tarjeta (ej. `#010`) alcanza el tono más saturado y profundo ($L \approx 50\%$).
5. **Acabado Mate Puro (Flat Matte):**  
   Tipografía de palo seco sobria y legible, sin degradados ruidosos ni efectos glossy, con el año centrado a gran escala en el reverso y la pista/cita limpia en el anverso.

---

## 📑 Taxonomía de Grupos y Categorías

| Grupo | Código | Categoría Específica | Rango Temporal | Archivo JSON |
| :--- | :---: | :--- | :---: | :--- |
| **Grupo A: Universo Python** | `A1` | Python Core, Sintaxis y PEPs | 1991 – 2026 | [`grupo_a_python/A1_python_core_sintaxis_peps.json`](./grupo_a_python/A1_python_core_sintaxis_peps.json) |
| | `A2` | Runtimes, Intérpretes y GIL | 1994 – 2026 | [`grupo_a_python/A2_runtimes_interpretes_gil.json`](./grupo_a_python/A2_runtimes_interpretes_gil.json) |
| | `A3` | Gobernanza, Comunidad y Eventos | 1994 – 2026 | [`grupo_a_python/A3_gobernanza_comunidad_eventos.json`](./grupo_a_python/A3_gobernanza_comunidad_eventos.json) |
| | `A4` | Ecosistema Web, APIs y Backend | 2000 – 2025 | [`grupo_a_python/A4_ecosistema_web_apis_backend.json`](./grupo_a_python/A4_ecosistema_web_apis_backend.json) |
| | `A5` | Tooling, Empaquetado y Ola Rust | 1998 – 2026 | [`grupo_a_python/A5_tooling_empaquetado_ola_rust.json`](./grupo_a_python/A5_tooling_empaquetado_ola_rust.json) |
| **Grupo B: Software, Web y Datos** | `B1` | Genealogía de Lenguajes de Programación | 1957 – 2024 | [`grupo_b_software_web/B1_genealogia_lenguajes.json`](./grupo_b_software_web/B1_genealogia_lenguajes.json) |
| | `B2` | Protocolos, Navegadores y Estándares Web | 1989 – 2025 | [`grupo_b_software_web/B2_protocolos_navegadores_estandares.json`](./grupo_b_software_web/B2_protocolos_navegadores_estandares.json) |
| | `B3` | Herramientas Dev y Control de Versiones | 1976 – 2024 | [`grupo_b_software_web/B3_herramientas_dev_vcs.json`](./grupo_b_software_web/B3_herramientas_dev_vcs.json) |
| | `B4` | Plataformas y Cultura Colaborativa | 1999 – 2025 | [`grupo_b_software_web/B4_plataformas_cultura_colaborativa.json`](./grupo_b_software_web/B4_plataformas_cultura_colaborativa.json) |
| | `B5` | Bases de Datos y Almacenamiento | 1979 – 2025 | [`grupo_b_software_web/B5_bases_de_datos_almacenamiento.json`](./grupo_b_software_web/B5_bases_de_datos_almacenamiento.json) |
| **Grupo C: DevOps e Infraestructura** | `C1` | Linux y Sistemas Operativos Clásicos | 1969 – 2024 | [`grupo_c_devops_infra/C1_linux_sistemas_operativos.json`](./grupo_c_devops_infra/C1_linux_sistemas_operativos.json) |
| | `C2` | Contenedores, Aislamiento y Virtualización | 1979 – 2025 | [`grupo_c_devops_infra/C2_contenedores_virtualizacion.json`](./grupo_c_devops_infra/C2_contenedores_virtualizacion.json) |
| | `C3` | Nube Pública y Paradigmas de Cómputo | 2002 – 2026 | [`grupo_c_devops_infra/C3_nube_publica_paradigmas.json`](./grupo_c_devops_infra/C3_nube_publica_paradigmas.json) |
| | `C4` | Automatización e Infraestructura como Código | 1993 – 2024 | [`grupo_c_devops_infra/C4_automatizacion_iac.json`](./grupo_c_devops_infra/C4_automatizacion_iac.json) |
| **Grupo D: Cómputo, IA y Datos** | `D1` | Cómputo Científico y Stack Analítico | 1995 – 2025 | [`grupo_d_ia_datos/D1_computo_cientifico_analitica.json`](./grupo_d_ia_datos/D1_computo_cientifico_analitica.json) |
| | `D2` | Papers y Avances Fundacionales de ML/DL | 1957 – 2023 | [`grupo_d_ia_datos/D2_papers_avances_mldl.json`](./grupo_d_ia_datos/D2_papers_avances_mldl.json) |
| | `D3` | Hitos Competitivos (Máquinas vs. Humanos) | 1997 – 2024 | [`grupo_d_ia_datos/D3_hitos_competitivos_maquinas_humanos.json`](./grupo_d_ia_datos/D3_hitos_competitivos_maquinas_humanos.json) |
| | `D4` | Era LLMs, Pesos Abiertos e Inferencia | 2018 – 2026 | [`grupo_d_ia_datos/D4_era_llms_modelos_abiertos.json`](./grupo_d_ia_datos/D4_era_llms_modelos_abiertos.json) |
| **Grupo E: Cultura Hacker y Leyendas** | `E1` | Movimiento Open Source y Cypherpunks | 1983 – 2024 | [`grupo_e_cultura_hacker/E1_open_source_cypherpunks.json`](./grupo_e_cultura_hacker/E1_open_source_cypherpunks.json) |
| | `E2` | Ciberseguridad, Virus y Vulnerabilidades | 1988 – 2026 | [`grupo_e_cultura_hacker/E2_ciberseguridad_vulnerabilidades.json`](./grupo_e_cultura_hacker/E2_ciberseguridad_vulnerabilidades.json) |
| | `E3` | Desastres de Software y Bugs Críticos | 1962 – 2024 | [`grupo_e_cultura_hacker/E3_desastres_software_bugs.json`](./grupo_e_cultura_hacker/E3_desastres_software_bugs.json) |
| | `E4` | Guerras Santas y Debates Históricos | 1976 – 2024 | [`grupo_e_cultura_hacker/E4_guerras_santas_debates.json`](./grupo_e_cultura_hacker/E4_guerras_santas_debates.json) |
| | `E5` | P2P, Fenómenos de Internet y Guerras Digitales | 1993 – 2025 | [`grupo_e_cultura_hacker/E5_p2p_fenomenos_guerras_digitales.json`](./grupo_e_cultura_hacker/E5_p2p_fenomenos_guerras_digitales.json) |
| | `E6` | Hardware y Microprocesadores Icónicos | 1971 – 2024 | [`grupo_e_cultura_hacker/E6_hardware_microprocesadores.json`](./grupo_e_cultura_hacker/E6_hardware_microprocesadores.json) |
| **Mazo Maestro Compilado** | — | **531 cartas barajadas y numeradas** | 1957 – 2026 | [`cards.json`](./cards.json) |

---

## 🎴 Estructura de las Tarjetas (Esquema Oficial JSON)

Tanto los 24 archivos de categorías como [`cards.json`](./cards.json) siguen el esquema canónico sin identificadores redundantes:

### Ejemplo de Tarjeta:
```json
{
  "grupo": "A",
  "grupo_nombre": "Universo Python",
  "categoria": "A1",
  "categoria_nombre": "Python Core, Sintaxis y PEPs",
  "hito": "Unificación definitiva de tipos primitivos y clases (*new-style classes*) con herencia obligatoria de `object` en el **PEP 252**.",
  "year": 2001,
  "creador": "*Guido van Rossum*",
  "dato_curioso": "Resolvió la histórica anomalía donde `type(1)` devolvía un tipo primitivo pero las instancias de clases creadas por el usuario devolvían la etiqueta genérica `instance`.",
  "card_number": 1
}
```

### Campos y Especificaciones:
1. **`card_number`:** Número entero consecutivo (`1` a `531`) que define la posición en el mazo físico y la gama cromática asignada.
2. **`grupo` / `grupo_nombre`:** Letra mayúscula (`"A"` a `"E"`) y título del grupo temático.
3. **`categoria` / `categoria_nombre`:** Código de dos caracteres (`"A1"` a `"E6"`) y nombre descriptivo.
4. **`hito` (Anverso / Pista):** Descripción directa del hecho histórico sin mencionar el año. Admite Markdown ligero (`**negrita**`, `*cursiva*`, `código`).
5. **`year` (Reverso):** Año histórico verificado (4 dígitos, ej. `1991`).
6. **`creador` (Reverso Superior):** Autor, equipo o institución responsable del hito.
7. **`dato_curioso` (Reverso Inferior):** Anécdota o contexto técnico complementario.

---

## 🛠️ Generación y Compilación Automática (`build_cards.js`)

El repositorio cuenta con un pipeline de compilación automatizado:

```bash
# Compilar y barajar el mazo maestro
npm run build
# o bien directamente:
node build_cards.js
```

### ¿Qué hace el script de build?
1. **Lee y valida** las 24 categorías en las 5 carpetas de grupos.
2. **Aplica un barajado Fisher-Yates** con generador pseudoaleatorio determinista para asegurar una dispersión homogénea de épocas y categorías.
3. **Asigna la numeración correlativa `card_number` (1..531)** eliminando cualquier `id` obsoleto.
4. **Genera [`cards.json`](./cards.json)** y sincroniza automáticamente los 24 archivos `.json` de origen para que conserven la misma numeración.

---

## 💻 Ejecución de la Aplicación Web

La aplicación web funciona sin dependencias pesadas de frontend (Vanilla JS + CSS moderno + HTML5):

```bash
# Servidor local rápido con Python
python3 -m http.server 3333

# Abrir en el navegador:
# http://localhost:3333/
```

### Funcionalidades de la Web:
* **Modo Partida Interactiva:** Tarjeta 3D interactiva que se voltea con clic o barra espaciadora, barra de adivinanza de año con chips de décadas rápidas, racha de aciertos y repisa cronológica para coleccionar 10 cartas.
* **Explorador y Catálogo:** Visualización en cuadrícula con el **"Orden del Mazo (Bloques de Color #1..#531)"**, donde se aprecia la transición continua de 10 en 10 de tonos claros a oscuros, además de filtros por grupo y búsqueda en tiempo real.
* **Impresión Dúplex Milimétrica en Tabloide (2 Caras):** Sistema de impresión para pliegos tamaño **Tabloide / Doble Carta (11 &times; 17 pulg / 279.4 &times; 431.8 mm)** con rejilla de **18 cartas cuadradas exactas por pliego (3 &times; 6, de 6.5 &times; 6.5 cm)**. La Cara A (impar) imprime los frentes y la Cara B (par) imprime los reversos **espejados horizontalmente fila por fila (columnas 3-2-1)**, garantizando coincidencia física milimétrica en guillotina al imprimir a doble cara volteando por el borde largo.
* **Audio y FX:** Efectos de audio retro sintetizados por Web Audio API y confeti con la paleta de la carta al acertar.

---

## 🎮 Reglas de Mesa (HITSTER Tech Edition)

### Objetivo
Ser el primer jugador o equipo en construir una **Línea de Tiempo cronológicamente correcta de 10 tarjetas**.

### Preparación
1. Toma el mazo barajado [`cards.json`](./cards.json) (o las tarjetas impresas correspondientes a sus números `#001` a `#531`).
2. Cada jugador recibe **1 tarjeta inicial boca arriba** (con el año visible), marcando el inicio de su línea temporal personal.
3. Cada jugador recibe **3 tokens HITSTER** (o fichas).

### Mecánica del Turno
1. **El Lector:** El jugador a la izquierda toma la carta superior del mazo y lee en voz alta **únicamente** el texto del frente (`hito`), sin mostrar el reverso ni revelar el año ni el creador.
2. **La Apuesta Cronológica:** El jugador en turno decide dónde encaja ese hito en su línea de tiempo actual (antes, entre dos cartas existentes, o después).
3. **El Desafío HITSTER (Opcional):** Antes de revelar la carta, cualquier rival puede gritar *"¡HITSTER!"* y colocar un token en la posición donde considere que va si cree que el jugador activo se equivocó.
4. **La Revelación:** Se voltea la tarjeta para verificar el año (`year`):
   - Si el jugador activo acertó: conserva la carta en su línea de tiempo.
   - Si falló y un rival colocó su token en la posición correcta: ese rival se queda con la carta.
5. **Puntos Bonus:** Si el jugador adivina con exactitud el año o el creador antes de voltearla, gana un token adicional.
6. **Victoria:** El primer jugador en acumular **10 tarjetas en orden cronológico estricto** gana la partida.
