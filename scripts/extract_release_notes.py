#!/usr/bin/env python3
"""
Extrae las notas de release de la versión canónica actual desde CHANGELOG.md
y las escribe en RELEASE_NOTES.md para el comando gh release create.
"""
import pathlib
import re
import sys

def main():
    root = pathlib.Path(__file__).resolve().parent.parent
    version_file = root / "VERSION"
    changelog_file = root / "CHANGELOG.md"
    output_file = root / "RELEASE_NOTES.md"

    if not version_file.exists() or not changelog_file.exists():
        print("Error: VERSION o CHANGELOG.md no encontrados.", file=sys.stderr)
        sys.exit(1)

    version = version_file.read_text(encoding="utf-8").strip()
    changelog = changelog_file.read_text(encoding="utf-8")

    pattern = rf"## \[{re.escape(version)}\][^\n]*\n(.*?)(?=\n## \[|\Z)"
    match = re.search(pattern, changelog, re.DOTALL)

    if match and match.group(1).strip():
        notes = match.group(1).strip()
    else:
        notes = f"Hit-Tazos Tech versión {version}"

    output_file.write_text(notes + "\n", encoding="utf-8")
    print(f"✅ Notas de release para v{version} extraídas ({len(notes)} caracteres) en RELEASE_NOTES.md")

if __name__ == "__main__":
    main()
