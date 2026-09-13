#!/usr/bin/env python3
"""
Generador Maestro de Portada Open Graph (Squint Test / Cartel de Rock)
Hit-Tazos Tech — Genera web/assets/og-cover.svg y compila web/assets/og-cover.png
"""
import math
import subprocess
from pathlib import Path

ROOT = Path(__file__).parent.parent
SVG_PATH = ROOT / "web" / "assets" / "og-cover.svg"
PNG_PATH = ROOT / "web" / "assets" / "og-cover.png"
VERSION_FILE = ROOT / "VERSION"

def get_version():
    if VERSION_FILE.exists():
        return VERSION_FILE.read_text(encoding="utf-8").strip()
    return "1.1.1"

def render_arc_text(cx, cy, r, text, start_angle, end_angle, font_size, fill, font_family="'Outfit', sans-serif"):
    chars = list(text)
    n = len(chars)
    if n == 0:
        return ""
    if n == 1:
        angles = [(start_angle + end_angle) / 2]
    else:
        step = (end_angle - start_angle) / (n - 1)
        angles = [start_angle + i * step for i in range(n)]

    out = []
    for char, ang_deg in zip(chars, angles):
        ang_rad = math.radians(ang_deg)
        x = cx + r * math.sin(ang_rad)
        y = cy - r * math.cos(ang_rad)
        out.append(
            f'<text x="{x:.2f}" y="{y:.2f}" font-family="{font_family}" font-size="{font_size}" font-weight="800" '
            f'fill="{fill}" text-anchor="middle" dominant-baseline="central" '
            f'transform="rotate({ang_deg:.1f} {x:.2f} {y:.2f})">{char}</text>'
        )
    return "\n        ".join(out)

def build_og_cover():
    ver = get_version()
    top_arc = render_arc_text(100, 100, 74, "HIT-TAZO TECH", -50, 50, 9.5, "#fbbf24")
    bottom_arc = render_arc_text(100, 100, 74, "SHELLAQUILES", 135, 225, 9, "#94a3b8")

    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Fondo Oscuro Profundo Minimalista -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050811"/>
      <stop offset="50%" stop-color="#070c18"/>
      <stop offset="100%" stop-color="#020306"/>
    </linearGradient>

    <!-- Resplandor Focal en la Carta Heroica -->
    <radialGradient id="heroGlow" cx="72%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#0284c7" stop-opacity="0.32"/>
      <stop offset="45%" stop-color="#38bdf8" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#050811" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="brandGlow" cx="25%" cy="40%" r="45%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#050811" stop-opacity="0"/>
    </radialGradient>

    <!-- Sombra Colosal para Destacar en Feeds y Miniaturas Móviles (Drop Shadow Dura y Profunda) -->
    <filter id="heroShadow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="30"/>
      <feOffset dx="-6" dy="32" result="offsetblur"/>
      <feFlood flood-color="#000000" flood-opacity="0.95"/>
      <feComposite in2="offsetblur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <filter id="tazoShadow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="20"/>
      <feOffset dx="0" dy="22" result="offsetblur"/>
      <feFlood flood-color="#000000" flood-opacity="0.96"/>
      <feComposite in2="offsetblur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Cara Azul Saturada de la Tarjeta (Kernel Foundations) -->
    <linearGradient id="cardBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="45%" stop-color="#0369a1"/>
      <stop offset="100%" stop-color="#075985"/>
    </linearGradient>

    <!-- Tazo Dorado CNC Anodizado -->
    <linearGradient id="tazoGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>

    <!-- Canto de Cartulina 350g -->
    <linearGradient id="edgePaper" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
  </defs>

  <!-- 1. Fondo Minimalista Limpio -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect width="1200" height="630" fill="url(#brandGlow)"/>
  <rect width="1200" height="630" fill="url(#heroGlow)"/>

  <!-- Línea de horizonte sutil -->
  <line x1="0" y1="560" x2="1200" y2="560" stroke="#38bdf8" stroke-width="1" opacity="0.15"/>

  <!-- ========================================================== -->
  <!-- 2. ANCLA VISUAL 1 & 3: MITAD IZQUIERDA (SQUINT TEST PURO)   -->
  <!-- ========================================================== -->
  <g transform="translate(80, 110)">
    <!-- Tagline de 2 palabras: TECH TRIVIA -->
    <text x="0" y="32" font-family="'Outfit', -apple-system, sans-serif" font-size="34" font-weight="900" fill="#38bdf8" letter-spacing="4">
      TECH TRIVIA
    </text>

    <!-- LOGO GIGANTE: HIT-TAZOS (Titan Extrabold) -->
    <text x="0" y="145" font-family="'Outfit', -apple-system, sans-serif" font-size="104" font-weight="900" fill="#ffffff" letter-spacing="-3">
      HIT-TAZOS
    </text>

    <!-- GANCHO CORTO TITÁNICO: ¿AÑO EXACTO? -->
    <g transform="translate(0, 275)">
      <text font-family="'Outfit', -apple-system, sans-serif" font-size="64" font-weight="900" fill="#fbbf24" letter-spacing="-1.5">
        ¿AÑO EXACTO?
      </text>
    </g>

    <!-- Sub-marca sutil para aficionados de culto -->
    <g transform="translate(0, 395)">
      <text font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" fill="#94a3b8" letter-spacing="2">
        576 CARTAS · OPEN SOURCE
      </text>
      <!-- Tag Canónico VERSION para sync_version.py -->
      <g display="none"><text font-family="'JetBrains Mono', monospace, monospace" font-size="16" font-weight="600" fill="#94a3b8">v{ver}</text></g>
    </g>
  </g>

  <!-- ========================================================== -->
  <!-- 3. ANCLA VISUAL 2: EL HITO VISUAL (CARTA TITÁNICA + TAZO)  -->
  <!-- ========================================================== -->

  <!-- CARTA CUADRADA TITÁNICA (465 × 465 px, cubre del y=75 al y=540) -->
  <g transform="translate(675, 75) rotate(2.5)" filter="url(#heroShadow)">
    <!-- Canto / Grosor 3D de cartulina 350g -->
    <rect x="6" y="6" width="465" height="465" rx="26" fill="url(#edgePaper)"/>
    <!-- Cara Frontal Azul Saturada -->
    <rect width="465" height="465" rx="26" fill="url(#cardBlueGrad)" stroke="rgba(255,255,255,0.4)" stroke-width="2.5"/>
    <!-- Bisel de Luz Especular Superior de Corte Físico -->
    <line x1="26" y1="2" x2="439" y2="2" stroke="#ffffff" stroke-width="2.5" opacity="0.75"/>
    <rect x="18" y="18" width="429" height="429" rx="20" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>

    <g transform="translate(45, 42)">
      <!-- Taxonomía / Chip Superior -->
      <rect width="180" height="30" rx="7" fill="rgba(0,0,0,0.35)"/>
      <text x="90" y="20" font-family="'Space Grotesk', monospace" font-size="13" font-weight="800" fill="#bae6fd" text-anchor="middle" letter-spacing="1.5">LINUX KERNEL</text>

      <!-- AUTOR HEROICO: LINUS TORVALDS -->
      <text x="188" y="80" font-family="'Outfit', sans-serif" font-size="30" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="-0.5">
        LINUS TORVALDS
      </text>

      <!-- EL AÑO COMO HÉROE ABSOLUTO: 1991 TITÁNICO (164pt, >50% de la superficie) -->
      <g transform="translate(188, 255)">
        <rect x="-175" y="-120" width="350" height="150" rx="20" fill="rgba(0,0,0,0.42)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
        <text x="0" y="0" font-family="'Space Grotesk', sans-serif" font-size="164" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="-6">
          1991
        </text>
      </g>

      <!-- Pie de Tarjeta Limpio -->
      <line x1="0" y1="365" x2="375" y2="365" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
      <text x="188" y="388" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800" fill="rgba(255,255,255,0.85)" text-anchor="middle" letter-spacing="1">
        KERNEL FOUNDATIONS · #0x7A
      </text>
    </g>
  </g>

  <!-- TAZO CIRCULAR 3D EN PRIMER PLANO (Shape Recognition: Círculo + Cuadrado) -->
  <g transform="translate(545, 365)" filter="url(#tazoShadow)">
    <!-- Bisel Dorado CNC de 200px Diámetro -->
    <circle cx="100" cy="100" r="98" fill="url(#tazoGold)"/>
    <circle cx="100" cy="100" r="90" fill="#080e1a"/>
    <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(251, 191, 36, 0.6)" stroke-width="2"/>

    <!-- 4 Notches Físicos Perimetrales -->
    <rect x="94" y="4" width="12" height="12" rx="3" fill="#050811"/>
    <rect x="94" y="184" width="12" height="12" rx="3" fill="#050811"/>
    <rect x="4" y="94" width="12" height="12" rx="3" fill="#050811"/>
    <rect x="184" y="94" width="12" height="12" rx="3" fill="#050811"/>

    <!-- Texto Curvado en Arco Circular -->
    {top_arc}
    {bottom_arc}

    <!-- Núcleo con Rayo Anodizado Dorado -->
    <circle cx="100" cy="100" r="38" fill="#12192c" stroke="#fbbf24" stroke-width="2"/>
    <path d="M 105 78 L 89 100 L 101 100 L 96 122 L 112 96 L 102 96 Z" fill="#fbbf24"/>
  </g>
</svg>"""

    SVG_PATH.write_text(svg_content, encoding="utf-8")
    print(f"SVG generado exitosamente en: {SVG_PATH}")

    cmd = ["rsvg-convert", "-w", "1200", "-h", "630", "-f", "png", str(SVG_PATH), "-o", str(PNG_PATH)]
    subprocess.run(cmd, check=True)
    print(f"PNG compilado exitosamente en: {PNG_PATH}")

if __name__ == "__main__":
    build_og_cover()
