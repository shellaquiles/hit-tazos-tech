# HITSTER: Tech, Python & Hacker Edition 🕹️💻

Edición de trivia cronológica estilo **HITSTER** adaptada al ecosistema de **Tecnología, Desarrollo de Software, Infraestructura, Inteligencia Artificial y Cultura Hacker**, con un marcado énfasis en el **Universo Python**.

El juego completo comprende un corpus de **~1,500 hitos históricos (1957 – 2026)** organizados en **5 Grupos Principales** y **24 Categorías Específicas**.

---

## 📑 Tabla de Prefijos y Taxonomía

Cada tarjeta posee un identificador único con prefijo de categoría de dos letras/dígitos (`#XX-000`) que permite jugar con mazos monográficos por temática o mezclar todas las cartas en una única partida legendaria.

| Grupo | Código | Categoría Específica | Rango Temporal | Archivo Markdown |
| :--- | :---: | :--- | :---: | :--- |
| **Grupo A: Universo Python** | `**#A1**` | Python Core, Sintaxis y PEPs | 1991 – 2026 | [`grupo_a_python/A1_python_core_sintaxis_peps.md`](./grupo_a_python/A1_python_core_sintaxis_peps.md) |
| | `**#A2**` | Runtimes, Intérpretes y GIL | 1994 – 2026 | [`grupo_a_python/A2_runtimes_interpretes_gil.md`](./grupo_a_python/A2_runtimes_interpretes_gil.md) |
| | `**#A3**` | Gobernanza, Comunidad y Eventos | 1994 – 2026 | [`grupo_a_python/A3_gobernanza_comunidad_eventos.md`](./grupo_a_python/A3_gobernanza_comunidad_eventos.md) |
| | `**#A4**` | Ecosistema Web, APIs y Backend | 2000 – 2025 | [`grupo_a_python/A4_ecosistema_web_apis_backend.md`](./grupo_a_python/A4_ecosistema_web_apis_backend.md) |
| | `**#A5**` | Tooling, Empaquetado y Ola Rust | 1998 – 2026 | [`grupo_a_python/A5_tooling_empaquetado_ola_rust.md`](./grupo_a_python/A5_tooling_empaquetado_ola_rust.md) |
| **Grupo B: Software, Web y Datos** | `**#B1**` | Genealogía de Lenguajes de Programación | 1957 – 2024 | [`grupo_b_software_web/B1_genealogia_lenguajes.md`](./grupo_b_software_web/B1_genealogia_lenguajes.md) |
| | `**#B2**` | Protocolos, Navegadores y Estándares Web | 1989 – 2025 | [`grupo_b_software_web/B2_protocolos_navegadores_estandares.md`](./grupo_b_software_web/B2_protocolos_navegadores_estandares.md) |
| | `**#B3**` | Herramientas Dev y Control de Versiones | 1976 – 2024 | [`grupo_b_software_web/B3_herramientas_dev_vcs.md`](./grupo_b_software_web/B3_herramientas_dev_vcs.md) |
| | `**#B4**` | Plataformas y Cultura Colaborativa | 1999 – 2025 | [`grupo_b_software_web/B4_plataformas_cultura_colaborativa.md`](./grupo_b_software_web/B4_plataformas_cultura_colaborativa.md) |
| | `**#B5**` | Bases de Datos y Almacenamiento | 1979 – 2025 | [`grupo_b_software_web/B5_bases_de_datos_almacenamiento.md`](./grupo_b_software_web/B5_bases_de_datos_almacenamiento.md) |
| **Grupo C: DevOps e Infraestructura** | `**#C1**` | Linux y Sistemas Operativos Clásicos | 1969 – 2024 | [`grupo_c_devops_infra/C1_linux_sistemas_operativos.md`](./grupo_c_devops_infra/C1_linux_sistemas_operativos.md) |
| | `**#C2**` | Contenedores, Aislamiento y Virtualización | 1979 – 2025 | [`grupo_c_devops_infra/C2_contenedores_virtualizacion.md`](./grupo_c_devops_infra/C2_contenedores_virtualizacion.md) |
| | `**#C3**` | Nube Pública y Paradigmas de Cómputo | 2002 – 2026 | [`grupo_c_devops_infra/C3_nube_publica_paradigmas.md`](./grupo_c_devops_infra/C3_nube_publica_paradigmas.md) |
| | `**#C4**` | Automatización e Infraestructura como Código | 1993 – 2024 | [`grupo_c_devops_infra/C4_automatizacion_iac.md`](./grupo_c_devops_infra/C4_automatizacion_iac.md) |
| **Grupo D: Cómputo, IA y Datos** | `**#D1**` | Cómputo Científico y Stack Analítico | 1995 – 2025 | [`grupo_d_ia_datos/D1_computo_cientifico_analitica.md`](./grupo_d_ia_datos/D1_computo_cientifico_analitica.md) |
| | `**#D2**` | Papers y Avances Fundacionales de ML/DL | 1957 – 2023 | [`grupo_d_ia_datos/D2_papers_avances_mldl.md`](./grupo_d_ia_datos/D2_papers_avances_mldl.md) |
| | `**#D3**` | Hitos Competitivos (Máquinas vs. Humanos) | 1997 – 2024 | [`grupo_d_ia_datos/D3_hitos_competitivos_maquinas_humanos.md`](./grupo_d_ia_datos/D3_hitos_competitivos_maquinas_humanos.md) |
| | `**#D4**` | Era LLMs, Pesos Abiertos e Inferencia | 2018 – 2026 | [`grupo_d_ia_datos/D4_era_llms_modelos_abiertos.md`](./grupo_d_ia_datos/D4_era_llms_modelos_abiertos.md) |
| **Grupo E: Cultura Hacker y Leyendas** | `**#E1**` | Movimiento Open Source y Cypherpunks | 1983 – 2024 | [`grupo_e_cultura_hacker/E1_open_source_cypherpunks.md`](./grupo_e_cultura_hacker/E1_open_source_cypherpunks.md) |
| | `**#E2**` | Ciberseguridad, Virus y Vulnerabilidades | 1988 – 2026 | [`grupo_e_cultura_hacker/E2_ciberseguridad_vulnerabilidades.md`](./grupo_e_cultura_hacker/E2_ciberseguridad_vulnerabilidades.md) |
| | `**#E3**` | Desastres de Software y Bugs Críticos | 1962 – 2024 | [`grupo_e_cultura_hacker/E3_desastres_software_bugs.md`](./grupo_e_cultura_hacker/E3_desastres_software_bugs.md) |
| | `**#E4**` | Guerras Santas y Debates Históricos | 1976 – 2024 | [`grupo_e_cultura_hacker/E4_guerras_santas_debates.md`](./grupo_e_cultura_hacker/E4_guerras_santas_debates.md) |
| | `**#E5**` | P2P, Fenómenos de Internet y Guerras Digitales | 1993 – 2025 | [`grupo_e_cultura_hacker/E5_p2p_fenomenos_guerras_digitales.md`](./grupo_e_cultura_hacker/E5_p2p_fenomenos_guerras_digitales.md) |
| | `**#E6**` | Hardware y Microprocesadores Icónicos | 1971 – 2024 | [`grupo_e_cultura_hacker/E6_hardware_microprocesadores.md`](./grupo_e_cultura_hacker/E6_hardware_microprocesadores.md) |

---

## 🎴 Estructura de las Tarjetas (Formato Estricto)

Cada tarjeta se representa en las tablas Markdown con exactamente 5 columnas:

| # | Hito / Pista (Frente) | Año (Reverso) | Creador / Bonus | Dato Curioso |
| :--- | :--- | :---: | :--- | :--- |
| **`#ID`** | Descripción técnica del hito sin revelar el año. Alterna obligatoriamente la palabra de arranque. | **`YYYY`** | *Autor, Equipo o Empresa* | Anécdota de trastienda, cifras de rendimiento, bugs históricos o salseo técnico. |

### Reglas de Producción:
1. **Frente (Pista):** Jamás incluye el año. Utiliza formato enriquecido (`**herramienta**`, `*término*`, `` `código/PEP` ``). Nunca inicia dos filas consecutivas con el mismo vocablo.
2. **Reverso (Año):** Centrado y en negrita con 4 dígitos (`**YYYY**`). Verificado con el primer release público, paper o evento histórico formal.
3. **Creador / Bonus:** Nombre del creador, autor principal o entidad responsable en cursivas.
4. **Dato Curioso:** 1-2 oraciones que aportan contexto histórico o cultural para leer en voz alta tras revelar la respuesta.

---

## 🎮 Reglas del Juego (HITSTER Tech Edition)

### Objetivo
Ser el primer jugador o equipo en construir una **Línea de Tiempo cronológicamente correcta de 10 tarjetas**.

### Preparación
1. Baraja las tarjetas del mazo seleccionado (puedes jugar con una sola categoría, con un grupo o con el mazo unificado de 1,500 cartas).
2. Cada jugador recibe **1 tarjeta inicial boca arriba** (con el año visible), que marca el punto de partida de su línea temporal personal.
3. Cada jugador recibe **3 tokens HITSTER** (o fichas/monedas).

### Mecánica del Turno
1. **El Lector:** El jugador a la izquierda toma la carta superior del mazo y lee en voz alta **únicamente** la columna `Hito / Pista (Frente)` sin mostrar el reverso ni revelar el año ni el creador.
2. **La Apuesta Cronológica:** El jugador en turno decide dónde encaja ese hito en su línea de tiempo actual (a la izquierda de todo, entre dos cartas, o a la derecha de todo).
3. **El Robo (Opcional):** Antes de revelar la carta, cualquier otro jugador puede gritar *"¡HITSTER!"* y colocar uno de sus tokens sobre el espacio donde crea que realmente va si sospecha que el jugador en turno se equivocó.
4. **La Revelación:** Se voltea la tarjeta para mostrar el `Año (Reverso)`.
   - Si el jugador en turno acertó: conserva la carta en su línea de tiempo.
   - Si falló y alguien colocó un token acertado: ese rival se queda con la carta para su propia línea de tiempo.
5. **Puntos Bonus:** El jugador puede ganar un token HITSTER extra si antes de revelar la carta acierta con exactitud el `Creador / Bonus` o el año exacto.
6. **Fin del Juego:** El primer jugador en colocar **10 tarjetas en orden cronológico estricto** gana la partida y es coronado como **Principal Architect & Tech Historian**.
