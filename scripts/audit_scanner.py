#!/usr/bin/env python3
"""
Herramienta de Auditoría y Verificación de 4 Niveles para Hit-Tazos Tech.
Audita data/volumes/*.json generando data/audit.json.
"""

import json
import os
import re
import sys

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT_DIR, 'data')
VOLUMES_DIR = os.path.join(DATA_DIR, 'volumes')
AUDIT_FILE = os.path.join(DATA_DIR, 'audit.json')

# Términos sensacionalistas o hipérboles que deben ser mitigados / eliminados
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
    r'\bdominando\b',
    r'\bsalvando la web\b',
    r'\bpuerta trasera estatal\b',
    r'\bpor casualidad al notar que ssh consum[ií]a 500\s?ms\b',
    r'\bdesvi[oó] al cohete hacia venus\b'
]

def scan_issues(card):
    issues = []
    text = (card.get('hito', '') + ' ' + card.get('trivia', '')).lower()
    for pat in SENSATIONAL_PATTERNS:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            issues.append(f"Término o giro hiperbólico: '{m.group(0)}'")
    
    autor = card.get('autor', '')
    hito = card.get('hito', '')
    trivia = card.get('trivia', '')
    
    if len(autor) > 45:
        issues.append(f"Autor excede límite ({len(autor)} > 45)")
    if len(hito) > 145:
        issues.append(f"Hito excede límite ({len(hito)} > 145)")
    if len(trivia) > 150:
        issues.append(f"Trivia excede límite ({len(trivia)} > 150)")
        
    return issues

if __name__ == '__main__':
    vol_file = os.path.join(VOLUMES_DIR, 'vol0_kernel-foundations.json')
    with open(vol_file, 'r', encoding='utf-8') as f:
        cards = json.load(f)
    print(f"Auditoría preliminar de {vol_file} ({len(cards)} cartas):")
    flagged = 0
    for c in cards:
        issues = scan_issues(c)
        if issues:
            flagged += 1
            print(f"- {c['id']} ({c['year']}): {', '.join(issues)}")
    print(f"Total señaladas con heurística inicial en Vol 0: {flagged}/{len(cards)}")
