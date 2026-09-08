import json

with open('data/volumes/vol6_python-track.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

# Card updates for Block 1 (0x00 - 0x0F) and Block 2 (0x10 - 0x1F)
card_updates = {
    "vol6-0x00": {
        "year": 2019,
        "autor": "Larry Hastings y Pablo Galindo",
        "hito": "Delimitación de parámetros posicionales estrictos mediante el símbolo `/` con la especificación del **PEP 570**.",
        "trivia": "Permitió diseñar APIs seguras donde los nombres de argumentos internos pueden alterarse sin romper el código consumidor."
    },
    "vol6-0x05": {
        "year": 2024,
        "autor": "Brandt Bucher y Faster CPython Team",
        "domain": "languages-runtimes",
        "tag": "cpython-runtime",
        "hito": "Inclusión del compilador JIT experimental (*Tier 2 Copy-and-Patch*) en **Python 3.13** para acelerar el bytecode en caliente.",
        "trivia": "Compila plantillas de código máquina nativo eliminando la sobrecarga del bucle central del evaluador de instrucciones."
    },
    "vol6-0x06": {
        "year": 2005,
        "autor": "PyCon Committee",
        "domain": "hacker-culture-web",
        "tag": "python-community",
        "hito": "Institucionalización de los **Development Sprints** presenciales de varios días tras finalizar las conferencias de PyCon.",
        "trivia": "Sentar a novatos y veteranos codo a codo en sprints impulsó el cierre de bugs y forjó futuros *core developers*."
    },
    "vol6-0x09": {
        "year": 2007,
        "autor": "Jeffrey Yasskin",
        "domain": "languages-runtimes",
        "tag": "syntax-peps",
        "hito": "Establecimiento de la jerarquía numérica abstracta (`Number`, `Real`, `Integral`) en el módulo `numbers` vía **PEP 3141**.",
        "trivia": "Empleó clases base abstractas (*ABCs*) para permitir que librerías externas como *NumPy* interactuaran con los tipos nativos."
    },
    "vol6-0x16": {
        "year": 2010,
        "autor": "Antoine Pitrou",
        "domain": "languages-runtimes",
        "tag": "cpython-runtime",
        "hito": "Rediseño radical del paso de hilos en el núcleo con la llegada del **New GIL** en el intérprete de CPython.",
        "trivia": "Reemplazó el conteo de 100 bytecodes por un temporizador (`switch_interval`), erradicando batallas destructivas entre hilos."
    },
    "vol6-0x1F": {
        "year": 2023,
        "autor": "Victor Stinner y CPython Core Team",
        "domain": "languages-runtimes",
        "tag": "rust-tooling",
        "hito": "Eliminación definitiva del módulo histórico `distutils` de la biblioteca estándar de CPython en **Python 3.12**.",
        "trivia": "Tras una década de avisos con el PEP 632, forzó a la comunidad a migrar de `setup.py` hacia estándares en `pyproject.toml`."
    }
}

for c in cards:
    cid = c['id']
    if cid in card_updates:
        c.update(card_updates[cid])

with open('data/volumes/vol6_python-track.json', 'w', encoding='utf-8') as f:
    json.dump(cards, f, indent=2, ensure_ascii=False)

print("Applied updates to vol6 blocks 1 & 2.")
