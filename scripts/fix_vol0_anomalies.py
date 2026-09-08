import json

with open('data/volumes/vol0_kernel-foundations.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

for c in cards:
    if c['id'] == 'vol0-0x0F':
        c['hito'] = "Gasto operativo y movilización técnica internacional para mitigar los posibles fallos del cambio de milenio conocidos como el **Efecto Y2K**."
    elif c['id'] == 'vol0-0x7A':
        c['hito'] = "Publicación del mensaje en *comp.os.minix* anunciando el desarrollo del núcleo libre **Linux** para arquitecturas 386 AT."

with open('data/volumes/vol0_kernel-foundations.json', 'w', encoding='utf-8') as f:
    json.dump(cards, f, indent=2, ensure_ascii=False)

print("Fixed vol0 anomalies.")
