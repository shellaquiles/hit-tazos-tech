# Reglas e Instrucciones para Agentes de IA — Hit-Tazos Tech

Este documento es la **fuente canónica de verdad**, directrices técnicas, modelo de datos y procedimientos de compilación para cualquier agente de inteligencia artificial (AGENTS) o desarrollador que consulte, extienda o modifique este repositorio.

---

## 🎯 1. Visión y Arquitectura del Proyecto

**Hit-Tazos Tech** es un juego original e independiente de cartas de trivia cronológica técnica que comprende **531 tarjetas** rigurosamente verificadas (1957–2026), divididas en 5 grandes grupos temáticos y 24 categorías.

### Estructura del Repositorio
```
hit-tazos-tech/
├── AGENTS.md                            # Especificación técnica maestra para agentes de IA
├── .agents/rules/hittazos-guidelines.md # Regla de detección para herramientas agentic
├── cards.json                           # Archivo compilado de distribución (barajado oficial #001-#531)
├── card_colors.json                     # Configuración desacoplada de paletas cromáticas (#0001-#1000)
├── generate_card_colors.js              # Generador CLI de configuración cromática por millar
├── build_cards.js                       # Compilador y barajador determinista maestro
├── render_print_tabloid.js              # Generador de pliegos vectoriales (SVG, Cairo PDF, HTML)
├── scratch_audit.py                     # Script de auditoría de caracteres y presupuestos
├── tabloide_editable.pdf                # PDF vectorial de 60 páginas con fuentes TrueType reales
├── tabloide_impresion.html              # Vista previa interactiva en navegador para impresión
├── tabloide_pliegos_svg/                # 60 archivos SVG individuales con capas editables
└── grupo_[a-e]_*/                       # 24 archivos JSON fuente de categorías
    ├── grupo_a_python/                  # A1 a A5 (194 tarjetas)
    ├── grupo_b_software_web/            # B1 a B5 (120 tarjetas)
    ├── grupo_c_devops_infra/            # C1 a C4 (77 tarjetas)
    ├── grupo_d_ia_datos/                # D1 a D4 (65 tarjetas)
    └── grupo_e_cultura_hacker/          # E1 a E6 (75 tarjetas)
```

> [!IMPORTANT]
> **REGLA DE EDICIÓN:** Los archivos fuente son exclusivamente los 24 archivos JSON en `grupo_*/*.json`. **NUNCA modificar `cards.json` a mano.** Siempre se modifica el archivo de categoría correspondiente y luego se ejecuta `node build_cards.js`.

---

## 📑 2. Taxonomía Exhaustiva de Grupos y Categorías

| Grupo | Código | Categoría Específica | Rango Temporal | Archivo JSON Fuente |
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
| | `B5` | Bases de Datos y Almacenamiento | 1970 – 2025 | [`grupo_b_software_web/B5_bases_de_datos_almacenamiento.json`](./grupo_b_software_web/B5_bases_de_datos_almacenamiento.json) |
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

---

## 🎴 3. Esquema Oficial de Tarjeta (Data Contract)

Cada elemento de tarjeta en los archivos JSON debe coincidir estrictamente con el siguiente esquema:

```json
{
  "grupo": "A",
  "grupo_nombre": "Universo Python",
  "categoria": "A1",
  "categoria_nombre": "Python Core, Sintaxis y PEPs",
  "hito": "Unificación definitiva de tipos primitivos y clases (*new-style classes*) con herencia obligatoria de `object` en el **PEP 252**.",
  "year": 2001,
  "creador": "*Guido van Rossum*",
  "dato_curioso": "Resolvió la anomalía donde tipos nativos y clases de usuario diferían, unificando tipos y clases bajo el mismo modelo.",
  "card_number": 1,
  "dificultad": 2
}
```

### Reglas de Campos:
1. **`card_number`:** Entero secuencial (`1` a `531`). Asignado automáticamente por `build_cards.js`.
2. **`grupo` / `grupo_nombre`:** Letra `"A"`..`"E"` y nombre oficial del grupo.
3. **`categoria` / `categoria_nombre`:** Código de 2 caracteres (`"A1"`..`"E6"`) y descripción.
4. **`hito`:** Pista histórica para el anverso. Formato Markdown (`**`, `*`, `` ` ``). **No debe revelar el año.**
5. **`year`:** Entero de 4 dígitos (`1957` – `2026`).
6. **`creador`:** Nombre de autores o entidad responsable.
7. **`dato_curioso`:** Trivia o anécdota para el reverso.
8. **`dificultad`:** Entero `1` (básico), `2` (intermedio) o `3` (avanzado/nicho).
9. **Sin campos obsoletos:** Queda prohibido añadir campos redundantes como `id`, `uuid`, etc.

---

## 📏 4. Límites Editoriales Estrictos (Presupuesto de Caracteres)

Las cartas se imprimen en formato físico cuadrado de **$65 \times 65\text{ mm}$** ($184.25\text{ pt}$). Con los márgenes de seguridad de corte, el área de texto disponible es de apenas ~152 pt. Por ello, **el 100% de las tarjetas debe respetar estos límites**:

| Campo | Límite Máximo | Regla y Criterio Editorial |
| :--- | :---: | :--- |
| **`creador`** | **$\le 45$ caracteres** | Si hay $>2$ autores, usar la fórmula `*Autor Principal* et al.`. Usar siglas para instituciones (`(*MIT*)`, `(*FSF*)`, `(*Google Brain*)`, `(*CWI*)`). |
| **`hito`** (Anverso) | **$\le 145$ caracteres** | Directo al hecho técnico sin circunloquios ni muletillas (*"Nacimiento del...", "Presentación oficial..."*). |
| **`dato_curioso`** (Reverso) | **$\le 150$ caracteres**<br>*(Límite duro: 155)* | 3 a 4 líneas compactas para lectura ágil en voz alta. Debe dejar al menos 30 pt de aire negativo sobre el pie de página. |

> [!CAUTION]
> Antes de finalizar cualquier cambio que altere textos en los JSON, se DEBE ejecutar `python3 scratch_audit.py`. El número de violaciones debe ser exactamente **0**.

---

## 🎨 5. Sistema Cromático Desacoplado y Configuración por Millar

Los colores de las tarjetas son **completamente independientes del contenido editorial y de los textos**; el único identificador que los vincula es el **`card_number`**.

### 5.1 Configuración Externa (`card_colors.json`)
La paleta se encuentra centralizada en [`card_colors.json`](./card_colors.json) (1er millar, cartas `#1` a `#1000`). Esto permite calibrar hexadecimales, luminosidad o contrastes para imprenta y diseño sin alterar los 24 archivos de trivia ni el código fuente.

* **Generador CLI por Millar:**
  ```bash
  # Generar el 1er millar (#1-#1000) -> card_colors.json
  node generate_card_colors.js
  # o con npm:
  npm run colors:generate

  # Generar millares adicionales:
  node generate_card_colors.js --millar=2  # Genera card_colors_millar_2.json (#1001-#2000)
  ```

* **Esquema de Cada Tarjeta en la Configuración:**
  ```json
  "1": {
    "card_number": 1,
    "block_id": 0,
    "block_name": "Rojo / Carmín cálido",
    "h": 350,
    "s": 72,
    "l": 68,
    "bg_hsl": "hsl(350, 72%, 68%)",
    "bg_hex": "#e87386",
    "front_bg_hsl": "hsl(350, 35%, 10%)",
    "front_bg_hex": "#221114",
    "accent_hex": "#e87386",
    "text_color": "#151217"
  }
  ```

### 5.2 Progresión HSL Intra-Bloque y Reglas Visuales

1. **Bloques Cromáticos de 10 en 10 (`card_number`):**
   * Cada bloque de 10 cartas comparte una familia tonal base HSL (Hue, Saturation):
     - `001 – 010`: Carmín / Rojo cálido ($H=350^\circ \rightarrow 356^\circ, S=72\% \rightarrow 88\%$)
     - `011 – 020`: Violeta / Morado ($H=268^\circ \rightarrow 276^\circ, S=58\% \rightarrow 78\%$)
     - `021 – 030`: Naranja cálido ($H=22^\circ \rightarrow 28^\circ, S=78\% \rightarrow 92\%$)
     - `031 – 040`: Lavanda / Malva suave ($H=280^\circ \rightarrow 290^\circ, S=45\% \rightarrow 65\%$)
     - `041 – 050`: Amarillo / Ámbar dorado ($H=42^\circ \rightarrow 48^\circ, S=82\% \rightarrow 96\%$)
     - `051 – 060`: Lila pálido / Azul pastel ($H=245^\circ \rightarrow 258^\circ, S=48\% \rightarrow 70\%$)
     - `061 – 070`: Lima / Verde fresco ($H=68^\circ \rightarrow 82^\circ, S=72\% \rightarrow 85\%$)
     - `071 – 080`: Turquesa / Cian oceánico ($H=172^\circ \rightarrow 192^\circ, S=62\% \rightarrow 82\%$)
     - `081 – 090`: Rosa coral / Fucsia suave ($H=335^\circ \rightarrow 345^\circ, S=68\% \rightarrow 86\%$)
     - `091 – 100`: Ocre / Canela tostado ($H=32^\circ \rightarrow 38^\circ, S=65\% \rightarrow 82\%$)
   *(El ciclo se repite cada 100 cartas dentro del millar).*

2. **Gradiente de Luminosidad Intra-Bloque ($L = 72\% \rightarrow 50\%$):**
   * Dentro de cada bloque de 10 cartas, la primera carta (ej. `#001`) tiene un tono suave y claro ($L \approx 68\%-74\%$).
   * Cada carta consecutiva incrementa su profundidad tonal hasta que la décima carta (ej. `#010`) alcanza el tono más saturado ($L \approx 50\%-54\%$).
   * **Fórmula:** $L = L_1 + (L_2 - L_1) \times \frac{(\text{num} - 1) \pmod{10}}{9}$.

3. **Regla de Textos y Contraste Oficial de Hit-Tazos Tech:**
   * **Textos de Contenido en Negro Puro:** En el reverso (cara del año), **todos los textos principales (autor, año y dato curioso) son negros (`#111111`)**, garantizando máxima legibilidad tipográfica y pureza visual.
   * **Metadatos de Esquinas sin Protagonismo:** El código de categoría (ej. `E3`) y el número de tarjeta (ej. `005`) son datos puramente informativos; se renderizan en tipografía diminuta ($5.2\text{ pt}$) y en color atenuado / blanco suave (`rgba(255, 255, 255, 0.7)`) pegados a las esquinas inferiores para no competir visualmente con la información principal.

---

## 🖨️ 6. Reglas de Imposición y Maquetación para Imprenta (Offset / Digital)

La imposición está diseñada cumpliendo rigurosamente los estándares industriales de impresión **Offset comercial y Prensa Digital** (CDMX / internacional):

### 6.1 Dimensiones y Geometría de Pliego
* **Formato Predeterminado (Tabloide / Doble Carta):** $11 \times 17\text{ pulgadas}$ = $279.4 \times 431.8\text{ mm}$ = **$792 \times 1224\text{ pt}$**.
  * **Rejilla:** **15 cartas por pliego** ($3 \text{ columnas} \times 5 \text{ filas}$).
  * **Hojas totales:** 36 pliegos (72 páginas dúplex frentes/reversos: 35 pliegos completos de 15 cartas + 1 pliego final con 6 cartas).
  * **Márgenes de Hoja:** $X_{\text{offset}} \approx 102.7\text{ pt}$ ($36.2\text{ mm}$), $Y_{\text{offset}} \approx 117.4\text{ pt}$ ($41.4\text{ mm}$). Deja espacio generoso para pinza de máquina (*gripper* $>12\text{ mm}$), crucetas de registro y barras de calibración CMYK.
* **Formato Opcional (Super Tabloide / Extra):** $12 \times 18\text{ pulgadas}$ = $304.8 \times 457.2\text{ mm}$ = **$864 \times 1296\text{ pt}$** (`--format=12x18`).
  * **Rejilla:** **18 cartas por pliego** ($3 \text{ columnas} \times 6 \text{ filas}$, 30 pliegos = 60 páginas dúplex).

### 6.2 Sangrado, Calles y Margen de Seguridad
* **Tamaño Final de Tarjeta (Corte terminado):** $65 \times 65\text{ mm}$ ($184.25 \times 184.25\text{ pt}$).
* **Sangrado / Rebase (Bleed):** **$+3\text{ mm}$** ($8.5\text{ pt}$) exterior por cada lado. Los fondos de color miden **$71 \times 71\text{ mm}$** ($201.26 \times 201.26\text{ pt}$), evitando filos blancos en corte.
* **Calles de Separación (Gutters):** **$6\text{ mm}$** ($17.0\text{ pt}$) entre tarjetas adyacentes para permitir doble corte independiente con guillotina sin rebabas del color contiguo.
* **Margen de Seguridad de Textos:** **$\ge 8\text{ mm}$** ($22.68\text{ pt}$) libre de cualquier texto hacia la línea de corte ($138.9\text{ pt}$ de ancho útil).
* **Marcas de Corte (Crop Marks):** Cruces de corte vectoriales de **$5\text{ mm}$** ($14.17\text{ pt}$) con desplazamiento exterior de **$1\text{ mm}$** fuera del sangrado.

### 6.3 Espacio Cromático CMYK y Dúplex
* **Color CMYK Calibrado:** Cada tarjeta cuenta con valores CMYK precisos (`bg_cmyk` y `front_bg_cmyk`) calculados y desacoplados en `card_colors.json`.
* **Dúplex y Espejado Horizontal:**
  * **Cara A (Páginas Impares — Frentes):** Columnas `[0, 1, 2]`.
  * **Cara B (Páginas Pares — Reversos):** **Espejado horizontal fila por fila `[2, 1, 0]`**.
  * Coincidencia submilimétrica al voltear en borde largo (*flip on long edge*).

### 6.4 Especificaciones Vectoriales para Herramientas de Diseño (Illustrator / Figma / Affinity)
* **Texto nativo vivo:** Utilizar elementos `<text>` y `<tspan>` con fuentes **TrueType incrustadas (`Noto Sans`, codificación `WinAnsi`)**.
* **Prohibido aplanar:** Cero rasterización o conversión de texto a curvas en los pliegos de producción, para permitir edición directa de tipografía y erratas.
* **Aislamiento Bounding Box:** Cada tarjeta delimitada por su `<clipPath>` exacto.

---

## 🔄 7. Flujo de Trabajo Obligatorio para Cambios

Cuando un agente modifique datos en los JSON o en el motor de diseño, debe seguir este orden estricto:

```bash
# 1. Validar que ninguna tarjeta exceda los presupuestos de caracteres
python3 scratch_audit.py
# Debe reportar: Creador > 45: 0 | Hito > 150: 0 | Trivia > 150: 0

# 2. Recompilar el mazo maestro (sincroniza cards.json y numeración #001-#531)
node build_cards.js

# 3. Regenerar los pliegos SVG y el PDF vectorial editable (predeterminado 11x17)
node render_print_tabloid.js --range=ALL
# O para formato Super Tabloide 12x18:
# node render_print_tabloid.js --range=ALL --format=12x18

# 4. Verificar integridad técnica del PDF generado
pdfinfo tabloide_editable.pdf
# Debe verificar: Pages = 72, Page size = 792 x 1224 pts
```

---

## ⚠️ 8. Restricciones del Entorno y Políticas de Git

1. **Sin acceso a red para pip externo:** No intentar ejecutar `pip install` hacia PyPI en el entorno sandbox de ejecución; depender de Node.js nativo, librerías estándar de Python (`json`, `glob`, `os`, `re`) y los binarios del sistema preinstalados en `/usr/bin/` (`rsvg-convert`, `pdfunite`, `pdftoppm`).
2. **POLÍTICA ESTRICTA DE GIT:** **NUNCA ejecutar `git commit` ni `git add` de manera automática** a menos que el usuario lo solicite expresamente en su mensaje. Dejar los cambios en el árbol de trabajo para revisión del usuario.
