#!/usr/bin/env python3
"""
scripts/sync_version.py - Hit-Tazos Tech
Sincronizador y validador de versión canónica única.

Fuente canónica de verdad: VERSION
Archivos gestionados:
- package.json
- data/manifest.json
- data/card_colors.json
- README.md
- web/index.html
- web/assets/og-cover.svg
- scripts/build_cards.js
- scripts/generate_card_colors.js
- print/render_print_tabloid.js

Uso:
  python3 scripts/sync_version.py --check   # Valida coherencia (falla si hay desalineación)
  python3 scripts/sync_version.py --sync    # Sincroniza todos los archivos con VERSION
"""

import sys
import re
import json
import argparse
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

def get_canonical_version() -> str:
    version_file = ROOT_DIR / "VERSION"
    if not version_file.exists():
        print("❌ Error: Archivo canónico VERSION no encontrado.", file=sys.stderr)
        sys.exit(1)
    return version_file.read_text(encoding="utf-8").strip()

def check_or_sync_package_json(canonical_ver: str, sync: bool) -> tuple[bool, str]:
    target = ROOT_DIR / "package.json"
    data = json.loads(target.read_text(encoding="utf-8"))
    curr = data.get("version")
    if curr == canonical_ver:
        return True, f"package.json ({curr})"
    if sync:
        data["version"] = canonical_ver
        target.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        return True, f"package.json (actualizado: {curr} -> {canonical_ver})"
    return False, f"package.json tiene '{curr}', se esperaba '{canonical_ver}'"

def check_or_sync_manifest_json(canonical_ver: str, sync: bool) -> tuple[bool, str]:
    target = ROOT_DIR / "data" / "manifest.json"
    if not target.exists():
        return True, "data/manifest.json (no existe aún)"
    data = json.loads(target.read_text(encoding="utf-8"))
    curr = data.get("version")
    if curr == canonical_ver:
        return True, f"data/manifest.json ({curr})"
    if sync:
        data["version"] = canonical_ver
        target.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        return True, f"data/manifest.json (actualizado: {curr} -> {canonical_ver})"
    return False, f"data/manifest.json tiene '{curr}', se esperaba '{canonical_ver}'"

def check_or_sync_card_colors_json(canonical_ver: str, sync: bool) -> tuple[bool, str]:
    target = ROOT_DIR / "data" / "card_colors.json"
    if not target.exists():
        return True, "data/card_colors.json (no existe aún)"
    data = json.loads(target.read_text(encoding="utf-8"))
    curr = data.get("version")
    if curr == canonical_ver:
        return True, f"data/card_colors.json ({curr})"
    if sync:
        data["version"] = canonical_ver
        target.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        return True, f"data/card_colors.json (actualizado: {curr} -> {canonical_ver})"
    return False, f"data/card_colors.json tiene '{curr}', se esperaba '{canonical_ver}'"

def check_or_sync_readme(canonical_ver: str, sync: bool) -> tuple[bool, str]:
    target = ROOT_DIR / "README.md"
    content = target.read_text(encoding="utf-8")
    badge_pattern = r'(\[!\[Version\]\(https://img\.shields\.io/badge/version-)([^-\)]+(?:--[^\)]+)?)(-orange\.svg)'
    match = re.search(badge_pattern, content)
    if not match:
        return False, "README.md: No se encontró el badge de versión"
    curr_badge_val = match.group(2).replace('--', '-')
    if curr_badge_val == canonical_ver:
        return True, f"README.md ({curr_badge_val})"
    if sync:
        safe_badge_ver = canonical_ver.replace('-', '--')
        new_content = re.sub(badge_pattern, rf'\g<1>{safe_badge_ver}\g<3>', content)
        target.write_text(new_content, encoding="utf-8")
        return True, f"README.md (actualizado: {curr_badge_val} -> {canonical_ver})"
    return False, f"README.md badge tiene '{curr_badge_val}', se esperaba '{canonical_ver}'"

def check_or_sync_web_html(canonical_ver: str, sync: bool) -> tuple[bool, str]:
    target = ROOT_DIR / "web" / "index.html"
    content = target.read_text(encoding="utf-8")
    issues = []

    # 1. <title>HIT-TAZOS Tech v...
    title_pattern = r'<title>HIT-TAZOS Tech v([^\|\s]+)'
    title_match = re.search(title_pattern, content)
    if not title_match or title_match.group(1) != canonical_ver:
        issues.append(f"<title> tiene '{title_match.group(1) if title_match else 'desconocido'}'")

    # 2. og:title
    og_pattern = r'<meta property="og:title" content="HIT-TAZOS Tech v([^\|\s]+)'
    og_match = re.search(og_pattern, content)
    if not og_match or og_match.group(1) != canonical_ver:
        issues.append(f"og:title tiene '{og_match.group(1) if og_match else 'desconocido'}'")

    # 3. twitter:title
    tw_pattern = r'<meta name="twitter:title" content="HIT-TAZOS Tech v([^\s—]+)'
    tw_match = re.search(tw_pattern, content)
    if not tw_match or tw_match.group(1) != canonical_ver:
        issues.append(f"twitter:title tiene '{tw_match.group(1) if tw_match else 'desconocido'}'")

    # 4. JSON-LD "version": "..."
    ld_pattern = r'"version":\s*"([^"]+)"'
    ld_match = re.search(ld_pattern, content)
    if not ld_match or ld_match.group(1) != canonical_ver:
        issues.append(f"JSON-LD tiene '{ld_match.group(1) if ld_match else 'desconocido'}'")

    # 5. brand-version-tag
    tag_pattern = r'<span class="brand-version-tag">v([^<]+)</span>'
    tag_match = re.search(tag_pattern, content)
    if not tag_match or tag_match.group(1) != canonical_ver:
        issues.append(f"brand-version-tag tiene '{tag_match.group(1) if tag_match else 'desconocido'}'")

    # 6. footer-version
    footer_pattern = r'<strong class="footer-version">v([^<]+)</strong>'
    footer_match = re.search(footer_pattern, content)
    if not footer_match or footer_match.group(1) != canonical_ver:
        issues.append(f"footer-version tiene '{footer_match.group(1) if footer_match else 'desconocido'}'")

    if not issues:
        return True, f"web/index.html ({canonical_ver})"

    if sync:
        content = re.sub(title_pattern, f'<title>HIT-TAZOS Tech v{canonical_ver}', content)
        content = re.sub(og_pattern, f'<meta property="og:title" content="HIT-TAZOS Tech v{canonical_ver}', content)
        content = re.sub(tw_pattern, f'<meta name="twitter:title" content="HIT-TAZOS Tech v{canonical_ver}', content)
        content = re.sub(ld_pattern, f'"version": "{canonical_ver}"', content)
        content = re.sub(tag_pattern, f'<span class="brand-version-tag">v{canonical_ver}</span>', content)
        content = re.sub(footer_pattern, f'<strong class="footer-version">v{canonical_ver}</strong>', content)
        target.write_text(content, encoding="utf-8")
        return True, f"web/index.html (actualizado a {canonical_ver})"

    return False, f"web/index.html: {', '.join(issues)}"

def check_or_sync_og_cover_svg(canonical_ver: str, sync: bool) -> tuple[bool, str]:
    target = ROOT_DIR / "web" / "assets" / "og-cover.svg"
    if not target.exists():
        return True, "web/assets/og-cover.svg (no existe)"
    content = target.read_text(encoding="utf-8")
    pattern = r'(font-family="\'JetBrains Mono\', monospace, monospace" font-size="16" font-weight="600" fill="#94a3b8">)v([^<]+)(</text>)'
    match = re.search(pattern, content)
    if not match:
        return False, "web/assets/og-cover.svg: No se encontró la etiqueta de versión"
    curr = match.group(2)
    if curr == canonical_ver:
        return True, f"web/assets/og-cover.svg ({curr})"
    if sync:
        new_content = re.sub(pattern, rf'\g<1>v{canonical_ver}\g<3>', content)
        target.write_text(new_content, encoding="utf-8")
        return True, f"web/assets/og-cover.svg (actualizado: {curr} -> {canonical_ver})"
    return False, f"web/assets/og-cover.svg tiene 'v{curr}', se esperaba 'v{canonical_ver}'"

def check_or_sync_script_fallbacks(canonical_ver: str, sync: bool) -> tuple[bool, str]:
    # scripts/build_cards.js
    f1 = ROOT_DIR / "scripts" / "build_cards.js"
    c1 = f1.read_text(encoding="utf-8")
    p1 = r"let appVersion = '([^']+)';"
    m1 = re.search(p1, c1)

    # scripts/generate_card_colors.js
    f2 = ROOT_DIR / "scripts" / "generate_card_colors.js"
    c2 = f2.read_text(encoding="utf-8")
    p2 = r"let version = '([^']+)';"
    m2 = re.search(p2, c2)

    # print/render_print_tabloid.js
    f3 = ROOT_DIR / "print" / "render_print_tabloid.js"
    c3 = f3.read_text(encoding="utf-8")
    p3 = r"let APP_VERSION = '([^']+)';"
    m3 = re.search(p3, c3)

    issues = []
    if m1 and m1.group(1) != canonical_ver:
        issues.append(f"build_cards.js ({m1.group(1)})")
    if m2 and m2.group(1) != canonical_ver:
        issues.append(f"generate_card_colors.js ({m2.group(1)})")
    if m3 and m3.group(1) != canonical_ver:
        issues.append(f"render_print_tabloid.js ({m3.group(1)})")

    if not issues:
        return True, "scripts & print fallbacks coherentes"

    if sync:
        if m1 and m1.group(1) != canonical_ver:
            f1.write_text(re.sub(p1, f"let appVersion = '{canonical_ver}';", c1), encoding="utf-8")
        if m2 and m2.group(1) != canonical_ver:
            f2.write_text(re.sub(p2, f"let version = '{canonical_ver}';", c2), encoding="utf-8")
        if m3 and m3.group(1) != canonical_ver:
            f3.write_text(re.sub(p3, f"let APP_VERSION = '{canonical_ver}';", c3), encoding="utf-8")
        return True, "scripts & print fallbacks actualizados"

    return False, f"fallbacks desalineados: {', '.join(issues)}"

def main():
    parser = argparse.ArgumentParser(description="Verificador y sincronizador de versión canónica de Hit-Tazos Tech")
    parser.add_argument("--sync", action="store_true", help="Sincronizar todos los archivos con VERSION")
    parser.add_argument("--check", action="store_true", help="Validar coherencia sin modificar (comportamiento por defecto)")
    args = parser.parse_args()

    sync_mode = args.sync
    canonical_ver = get_canonical_version()
    print(f"📌 Versión Canónica (VERSION): {canonical_ver}")

    validators = [
        ("package.json", check_or_sync_package_json),
        ("data/manifest.json", check_or_sync_manifest_json),
        ("data/card_colors.json", check_or_sync_card_colors_json),
        ("README.md", check_or_sync_readme),
        ("web/index.html", check_or_sync_web_html),
        ("web/assets/og-cover.svg", check_or_sync_og_cover_svg),
        ("Scripts & print fallbacks", check_or_sync_script_fallbacks),
    ]

    all_ok = True
    for name, func in validators:
        ok, msg = func(canonical_ver, sync_mode)
        if ok:
            print(f"  ✅ {msg}")
        else:
            print(f"  ❌ {msg}")
            all_ok = False

    if sync_mode:
        print("\n✨ Sincronización completada exitosamente.")
        sys.exit(0)
    else:
        if all_ok:
            print("\n🎉 Todas las referencias de versión están perfectamente alineadas con VERSION.")
            sys.exit(0)
        else:
            print("\n⚠️ Inconsistencias de versión detectadas. Ejecuta `python3 scripts/sync_version.py --sync` o `npm run version:sync`.", file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    main()
