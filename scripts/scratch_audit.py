#!/usr/bin/env python3
"""
Script editorial para auditar y optimizar la concisión tipográfica del corpus Hit-Tazos Tech.
Límites editoriales para tarjetas 65x65mm:
  - Creador: <= 45 caracteres
  - Hito:    <= 150 caracteres
  - Trivia:  <= 150 caracteres
"""

import json
import glob
import os
import re

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def audit_corpus():
    files = sorted(glob.glob(os.path.join(ROOT_DIR, 'data', 'categories', 'grupo_*', '*.json')))
    print(f"Archivos a procesar: {len(files)}")
    
    total = 0
    over_creador = 0
    over_hito = 0
    over_trivia = 0

    for f in files:
        with open(f, 'r', encoding='utf-8') as fp:
            cards = json.load(fp)
        for c in cards:
            total += 1
            if len(c.get('creador', '')) > 45:
                over_creador += 1
            if len(c.get('hito', '')) > 150:
                over_hito += 1
            if len(c.get('dato_curioso', '')) > 150:
                over_trivia += 1

    print(f"Total tarjetas: {total}")
    print(f"Creador > 45: {over_creador}")
    print(f"Hito > 150:    {over_hito}")
    print(f"Trivia > 150:  {over_trivia}")

if __name__ == '__main__':
    audit_corpus()
