# Reglas e Instrucciones para Agentes de IA — Hit-Tazos Tech

Este documento es la **fuente canónica de verdad**, directrices técnicas, modelo de datos y procedimientos de compilación para cualquier agente de inteligencia artificial (AGENTS) o desarrollador que consulte, extienda o modifique este repositorio.

---

## 🎯 1. Visión y Arquitectura del Proyecto

**Hit-Tazos Tech** es un juego original e independiente de cartas de trivia cronológica técnica que comprende un **mazo exhaustivo de tarjetas** rigurosamente verificadas (1957–2026), divididas en 7 volúmenes.

### Estructura del Repositorio
```
hit-tazos-tech/
├── .github/                             # Gobernanza GitHub Actions (CI, PR template, CODEOWNERS)
├── .agents/rules/hittazos-guidelines.md # Regla de detección para herramientas agentic
├── AGENTS.md                            # Especificación técnica maestra para agentes de IA
├── README.md                            # Documentación principal con insignias y reglas de juego
├── CHANGELOG.md                         # Registro canónico de versiones (Keep a Changelog + SemVer)
├── CONTRIBUTING.md                      # Guía de contribución y flujo de auditoría editorial
├── CODE_OF_CONDUCT.md                   # Código de conducta de la comunidad Shellaquiles
├── SECURITY.md                          # Política de seguridad y reporte responsable
├── LICENSE                              # Licencia de código abierto MIT (Shellaquiles Org)
├── VERSION                              # Archivo de versión semántica (1.0.0-rc.1)
├── package.json                         # Manifiesto y scripts npm (test, validate, build, print)
├── server.js                            # Servidor local de desarrollo (sirve web/ y data/)
├── data/                                # Contenido editorial y datos de trivia
│   ├── cards.json                       # Fuente maestra compilada con la baraja (512 cartas)
│   ├── card_colors.json                 # Configuración desacoplada de paletas cromáticas (#0001-#1000)
│   └── volumes/                         # 7 archivos JSON fuente de volúmenes
├── web/                                 # Aplicación web interactiva (juego y catálogo)
│   ├── index.html                       # Interfaz HTML5 principal
│   ├── app.js                           # Lógica del cliente, animaciones WAAPI y audio
│   ├── style.css                        # Hoja de estilos moderna
│   └── assets/                          # Recursos gráficos y multimedia
├── scripts/                             # Herramientas y scripts CLI de compilación y auditoría
│   ├── build_cards.js                   # Validador de la estructura maestra
│   ├── scratch_audit.py                 # Script de auditoría de caracteres y presupuestos
│   └── generate_card_colors.js          # Generador CLI de configuración cromática por millar
├── print/                               # Motor de imposición y salidas para imprenta (Tabloide y Carta)
│   ├── render_print_tabloid.js          # Generador maestro de imposición multi-formato (SVG, Cairo PDF)
```

> [!IMPORTANT]
> **REGLA DE EDICIÓN:** El archivo maestro y único para editar datos no es `data/cards.json` de forma directa, sino los archivos JSON individuales que residen en `data/volumes/`. Una vez editados, siempre ejecuta `npm run build` para recompilar `data/cards.json`.

---

## 📑 2. Taxonomía de Volúmenes

El mazo de 512 cartas se distribuye en 7 volúmenes modernos:
- **Vol 0:** `kernel-foundations` (128 cartas, IDs `vol0-0x00` a `vol0-0x7F`)
- **Vol 1:** `cypherpunks-hacker-lore` (64 cartas, IDs `vol1-0x00` a `vol1-0x3F`)
- **Vol 2:** `embedded-silicon-hardware` (64 cartas)
- **Vol 3:** `unix-sysadmin-networks` (64 cartas)
- **Vol 4:** `backend-distributed-systems` (64 cartas)
- **Vol 5:** `cloud-containers-sre` (64 cartas)
- **Vol 6:** `python-track` (64 cartas)

---

## 🎴 3. Esquema Oficial de Tarjeta (Data Contract)

Cada elemento de tarjeta en `data/cards.json` debe coincidir estrictamente con el siguiente esquema:

```json
{
  "id": "vol0-0x00",
  "volumen": "kernel-foundations",
  "index": 0,
  "domain": "ai-data-science",
  "tag": "neural-networks-papers",
  "hito": "Invención del **Perceptrón**, el primer modelo matemático y máquina física...",
  "year": 1957,
  "autor": "Frank Rosenblatt (Cornell Lab)",
  "trivia": "Probado en una IBM 704 con cámara de 400 fotocélulas; la marina predijo..."
}
```

### Reglas de Campos:
1. **`id`:** Identificador único, formato `volX-0xYY`.
2. **`volumen`:** Slug oficial del volumen.
3. **`index`:** Entero del 0 al N.
4. **`domain` / `tag`:** Taxonomía semántica moderna.
5. **`hito`:** Pista histórica para el anverso. Formato Markdown. **No debe revelar el año.**
6. **`year`:** Entero de 4 dígitos.
7. **`autor`:** Nombre de autores o entidad responsable.
8. **`trivia`:** Dato curioso o anécdota para el reverso.

---

## 📏 4. Límites Editoriales Estrictos (Presupuesto de Caracteres)

| Campo | Límite Máximo | Regla y Criterio Editorial |
| :--- | :---: | :--- |
| **`autor`** | **$\le 45$ caracteres** | Usar siglas para instituciones. |
| **`hito`** (Anverso) | **$\le 145$ caracteres** | Directo al hecho técnico sin circunloquios. |
| **`trivia`** (Reverso) | **$\le 150$ caracteres** | 3 a 4 líneas compactas para lectura ágil. |

---

## 🎨 5. Sistema Cromático Desacoplado y Configuración por Millar

Los colores de las tarjetas son vinculados globalmente, o a nivel de índice local.

---

## 🖨️ 6. Reglas de Imposición y Maquetación para Imprenta

(Reglas legadas para la imprenta 11x17 y Carta se mantienen intactas: Sangrado de +3mm, calles de 6mm, etc.)

---

## 🔄 7. Flujo de Trabajo Obligatorio para Cambios

1. Validar auditoría.
2. Regenerar `print`.

---

## ⚠️ 8. Restricciones del Entorno y Políticas de Git

1. **Sin acceso a red para pip externo.**
2. **POLÍTICA ESTRICTA DE GIT:** Nunca ejecutar git commit o git add.
