import json

with open('data/volumes/vol6_python-track.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

# Card updates for Block 3 (0x20 - 0x2F) and Block 4 (0x30 - 0x3F)
card_updates = {
    "vol6-0x21": {
        "year": 2007,
        "autor": "Python Software Foundation",
        "domain": "hacker-culture-web",
        "tag": "python-community",
        "hito": "Lanzamiento del **PSF Grants Program** para financiar eventos, conferencias comunitarias y sprints locales en todo el mundo.",
        "trivia": "Ha repartido millones de dólares en becas para talleres, sprints de código y congresos en África, América Latina y Asia."
    },
    "vol6-0x39": {
        "year": 2011,
        "autor": "Kenneth Reitz",
        "domain": "languages-runtimes",
        "tag": "web-frameworks",
        "hito": "Lanzamiento de **Requests**, la emblemática biblioteca cliente HTTP concebida bajo el lema *HTTP for Humans*.",
        "trivia": "Reemplazó la farragosa y arcaica API de `urllib2`, convirtiéndose en el paquete de Python más descargado de la historia."
    },
    "vol6-0x3F": {
        "year": 2004,
        "autor": "Tim Peters",
        "domain": "hacker-culture-web",
        "tag": "python-community",
        "hito": "Formalización de **The Zen of Python** en el **PEP 20**, recopilando los 19 principios rectores de la filosofía del lenguaje.",
        "trivia": "Incluido secretamente como huevo de pascua en el intérprete al ejecutar `import this`, compuesto como un poema de aforismos."
    }
}

for c in cards:
    cid = c['id']
    if cid in card_updates:
        c.update(card_updates[cid])

with open('data/volumes/vol6_python-track.json', 'w', encoding='utf-8') as f:
    json.dump(cards, f, indent=2, ensure_ascii=False)

print("Applied updates to vol6 blocks 3 & 4.")
