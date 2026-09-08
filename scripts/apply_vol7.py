import json

with open('data/volumes/vol7_scifi-pop-culture-cinema.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

card_updates = {
    "vol7-0x01": {
        "hito": "Estreno de la secuela cinematográfica de **Blade Runner**, explorando la autoconciencia sintética mediante la IA holográfica **Joi**.",
        "trivia": "Roger Deakins ganó su primer premio Óscar a mejor fotografía tras catorce nominaciones por su innovadora iluminación geométrica."
    }
}

for c in cards:
    cid = c['id']
    if cid in card_updates:
        c.update(card_updates[cid])

with open('data/volumes/vol7_scifi-pop-culture-cinema.json', 'w', encoding='utf-8') as f:
    json.dump(cards, f, indent=2, ensure_ascii=False)

print("Applied updates to vol7.")
