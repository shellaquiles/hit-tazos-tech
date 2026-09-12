### Añadido
- **Armonización 100% Circular en Modo Hit-Tazo**:
  - Transformación tridimensional de los mazos laterales (*Tech Trivia* y *Discard*) en auténticas **torres/cilindros 3D de tazos apilados** con cara superior circular concéntrica (`border-radius: 50%`), canto estriado de plástico apilado y bases de contacto elípticas.
  - Rediseño completo del estante de la línea de tiempo inferior (`.shelf-tazo-disc-chip`): cada hito ganado se despliega como un disco circular coleccionable de $118\text{px} \times 118\text{px}$ con sus 4 muescas perimetrales CNC, relieve concéntrico e insignia circular de año.
  - Soporte de interacción táctil y clic en tarjetas/tazos del estante para inspección directa en el visor central sin penalizaciones de tiro.
- **Nuevo Dial de Velocímetro Arqueado Continuo (`web/core/arc-dial.js`)**:
  - Módulo desacoplado ES Modules con cálculo trigonométrico nativo, arco SVG retroiluminado y escala continua de 1950 a 2026.
  - Tipografía agrandada de alta visibilidad (`16.5px`) para marcas de velocímetro y trazos dinámicos de 24px de longitud.
  - Flujo cognitivo natural unificado: **Dial Arqueado $\rightarrow$ Año Objetivo $\rightarrow$ Confirmación de Tiro**.
- **Drawer de Navegación Lateral y Cabecera Enfocada**:
  - Menú lateral deslizante a toda altura (`#drawer-menu`) con accesos directos a Modo Explorador, Guía de Juego, Imprimir & Play, Preventa física de barajas y repositorio GitHub.
  - Cabecera despejada conservando acceso rápido a alternar formato (Hit-Tazo vs. Hit-Cards), marcador reactivo de puntos y racha (*On Fire*).
- **Gamificación Arcade y Micro-Detalles**:
  - Punteros de tiros disponibles (`.attempt-pip`) transformados en micro-tazos 3D con aro metálico, bisel reflectante y núcleo azul neón.
  - Botón "LANZAR TIRO" rediseñado con degradado neón ámbar/naranja translúcido, desenfoque de fondo (*backdrop-filter: blur*) y feedback activo al presionar.

### Cambiado
- **Jerarquía Visual y Balance Espacial Arcade**:
  - Diámetro del tazo central ampliado de $290\text{px}$ a $340\text{px}$, con núcleo expandido al $76\%$ y tipografía nítida con respiro visual (`clamp(0.92rem, 2.5vw, 1.04rem)`).
  - Texto curvado en arcos sobre radio seguro $r=112$ con tipografía blanca pura de alto contraste, trazo oscuro perimetral (`stroke`) y sombra profunda para legibilidad inmediata sobre cualquier paleta cromática.
  - Compactación del escenario central eliminando áreas muertas y reduciendo separación vertical con los controles.
  - Centrado equilibrado de las tarjetas ganadas en la línea de tiempo (`justify-content: center`).

### Corregido
- **Legibilidad y Contraste de Dígitos Ocultos ("????")**:
  - Corrección del reverso de cartas no resueltas: se eliminó el color `#111111` (pensado originalmente para imprenta en papel blanco) y se aplicó cian eléctrico brillante (`#38bdf8`) con resplandor difuso neón y espaciado de letras ampliado (`0.16em`).
  - Rediseño de la pastilla "REVELAR (-5 PTS)" con estética traslúcida y tipografía de alto contraste.
- **Coherencia Física en la Dirección de Animación de Cartas**:
  - Corrección de la translación horizontal en `transitionToCard()`: al pedir la siguiente carta, la actual viaja a la derecha hacia la pila de descarte y la nueva entra desde la torre de robo a la izquierda; al retroceder, la carta viaja hacia la izquierda.
  - Alineación de etiquetas de accesibilidad `title` y `aria-label` en ambas pilas.
