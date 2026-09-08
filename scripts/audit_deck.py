#!/usr/bin/env python3
"""
CLI Oficial de Auditoría en 4 Niveles para Hit-Tazos Tech.
Valida:
  1. Integridad de Data Contract (id, volumen, index, domain, tag, hito, year, autor, trivia).
  2. Presupuestos Físicos: autor <= 45, hito <= 145, trivia <= 150.
  3. Regla Pedagógica: Hito con entidad principal en negritas (**...**).
  4. Regla Anti-Spoilers: Cero menciones explícitas del año histórico en el anverso (hito).
  5. Cero Sensacionalismo: Detección de giros hiperbólicos o novelescos.
  6. Sincronización con data/audit.json (verificación y fuentes documentadas).
"""

import json
import glob
import os
import re
import sys

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT_DIR, 'data')
VOLUMES_DIR = os.path.join(DATA_DIR, 'volumes')
AUDIT_FILE = os.path.join(DATA_DIR, 'audit.json')

SENSATIONAL_PATTERNS = [
    r'\brevolucion[oó]\b',
    r'\bpara siempre\b',
    r'\best[aá]ndar indiscutible\b',
    r'\bel m[aá]s adoptado del planeta\b',
    r'\bmilagros[ao]s?\b',
    r'\bcolosal\b',
    r'\bapocalipsis\b',
    r'\b[uú]nica garant[ií]a\b',
    r'\btodos los editores modernos\b',
    r'\bpulveriz[oó]\b',
    r'\bexplosi[oó]n de adopci[oó]n\b',
    r'\bcatapult[oó] al estrellato\b',
    r'\bsalvando la web\b'
]

def audit_all():
    files = sorted(glob.glob(os.path.join(VOLUMES_DIR, '*.json')))
    if not files:
        print("❌ Error: No se encontraron archivos en data/volumes/")
        sys.exit(1)

    audit_data = {}
    if os.path.exists(AUDIT_FILE):
        with open(AUDIT_FILE, 'r', encoding='utf-8') as f:
            audit_data = json.load(f)

    total_cards = 0
    violations = []
    seen_ids = set()

    for path in files:
        vol_name = os.path.basename(path)
        with open(path, 'r', encoding='utf-8') as f:
            cards = json.load(f)
        
        for c in cards:
            total_cards += 1
            cid = c.get('id', f'unknown-{total_cards}')
            
            # Duplicados de ID
            if cid in seen_ids:
                violations.append(f"[{cid}] ID duplicado en el mazo.")
            seen_ids.add(cid)

            # Campos obligatorios
            for field in ['id', 'volumen', 'index', 'domain', 'tag', 'hito', 'year', 'autor', 'trivia']:
                if field not in c:
                    violations.append(f"[{cid}] Falta campo requerido '{field}'.")

            # Presupuestos
            autor = c.get('autor', '')
            hito = c.get('hito', '')
            trivia = c.get('trivia', '')
            year = c.get('year')

            if len(autor) > 45:
                violations.append(f"[{cid}] autor excede 45 caracteres ({len(autor)}).")
            if len(hito) > 145:
                violations.append(f"[{cid}] hito excede 145 caracteres ({len(hito)}).")
            if len(trivia) > 150:
                violations.append(f"[{cid}] trivia excede 150 caracteres ({len(trivia)}).")

            # Negrita obligatoria en hito
            if not re.search(r'\*\*.*?\*\*', hito):
                violations.append(f"[{cid}] hito no contiene entidad principal en negritas (**...**).")

            # Anti-spoilers: año histórico en hito
            if year:
                y_str = str(year)
                if re.search(r'\b' + y_str + r'\b', hito):
                    violations.append(f"[{cid}] SPOILER FÁCTICO: Hito menciona el año de la tarjeta ({y_str}).")

            # Sensacionalismo
            full_text = f"{hito} {trivia}"
            for pat in SENSATIONAL_PATTERNS:
                m = re.search(pat, full_text, re.IGNORECASE)
                if m:
                    violations.append(f"[{cid}] Giro sensacionalista detectado: '{m.group(0)}'.")

            # Verificación en audit.json
            if cid not in audit_data:
                violations.append(f"[{cid}] No se encuentra registrado en data/audit.json.")
            else:
                entry = audit_data[cid]
                if entry.get('status') not in ('VERIFIED', 'VERIFIED_REWRITE'):
                    violations.append(f"[{cid}] Estado de auditoría no aprobado: {entry.get('status')}.")
                if not entry.get('sources'):
                    violations.append(f"[{cid}] No cuenta con fuentes documentadas en audit.json.")

    print(f"============================================================")
    print(f"📊 REPORTE DE AUDITORÍA EN 4 NIVELES (HIT-TAZOS TECH)")
    print(f"============================================================")
    print(f"• Archivos de volumen evaluados: {len(files)}")
    print(f"• Tarjetas auditadas: {total_cards}")
    print(f"• Tarjetas en data/audit.json: {len(audit_data)}")
    print(f"• Violaciones encontradas: {len(violations)}")
    print(f"============================================================")

    if violations:
        print("❌ DETALLE DE VIOLACIONES:")
        for v in violations[:30]:
            print(f"  - {v}")
        if len(violations) > 30:
            print(f"  ... y {len(violations) - 30} violaciones más.")
        sys.exit(1)
    else:
        print("✅ BARAYA 100% AUDITADA: Cumple estrictamente con Data Contract,")
        print("   presupuestos físicos, anti-spoilers, sobriedad editorial y fuentes.")
        sys.exit(0)

if __name__ == '__main__':
    audit_all()
