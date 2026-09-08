import json, re

with open('data/volumes/vol6_python-track.json') as f:
    cards = json.load(f)

print(f"Auditing {len(cards)} cards in vol6...")

# Let's check each card
for c in cards:
    cid = c['id']
    y = c['year']
    a = c['autor']
    h = c['hito']
    t = c['trivia']
    tag = c['tag']
    
    # 1. Budget checks
    errs = []
    if len(a) > 45:
        errs.append(f"autor > 45 ({len(a)})")
    if len(h) > 145:
        errs.append(f"hito > 145 ({len(h)})")
    if len(t) > 150:
        errs.append(f"trivia > 150 ({len(t)})")
    if not re.search(r'\*\*.*?\*\*', h):
        errs.append("No bold in hito")
        
    # Check 4-digit years in hito
    fours = re.findall(r'\b(19\d\d|20\d\d)\b', h)
    if fours:
        errs.append(f"Year spoiler in hito: {fours}")
        
    if errs:
        print(f"[{cid}] ERRORS: {errs}")

