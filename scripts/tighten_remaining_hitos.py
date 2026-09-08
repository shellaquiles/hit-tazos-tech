import json

# Corrections to keep every hito strictly <= 145 chars:
tightens = {
    "data/volumes/vol2_embedded-silicon-hardware.json": {
        "vol2-0x26": "Presentación de la arquitectura **NVIDIA Blackwell**, uniendo dos dados de silicio con enlaces de 10 TB/s para cómputo masivo de IA.",
        "vol2-0x29": "Adopción de formatos de punto flotante microscópicos (**FP8** y **FP4**) para inferencia y entrenamiento eficiente de redes neuronales.",
        "vol2-0x2D": "Lanzamiento de **Rocket** (**rkt**) por CoreOS, promoviendo runtimes de contenedores seguros, componibles y desacoplados de demonios.",
        "vol2-0x31": "Presentación de **Elixir**, aportando sintaxis moderna, polimorfismo por protocolos y metaprogramación sobre la máquina BEAM de Erlang."
    },
    "data/volumes/vol4_backend-distributed-systems.json": {
        "vol4-0x3F": "Lanzamiento de **BadgerDB**, motor clave-valor embebido en Go optimizado para memorias SSD mediante separación de claves y valores (WiscKey)."
    },
    "data/volumes/vol5_cloud-containers-sre.json": {
        "vol5-0x10": "Lanzamiento de **Podman 1.0**, permitiendo gestionar contenedores y pods OCI sin demonio en segundo plano ni privilegios root.",
        "vol5-0x38": "Lanzamiento de **Cilium**, plataforma de red, seguridad y observabilidad para Kubernetes gobernada mediante programas **eBPF** en el kernel.",
        "vol5-0x3B": "Lanzamiento de **Thanos**, añadiendo almacenamiento de series temporales de largo plazo y consultas federadas a Prometheus."
    }
}

for path, updates in tightens.items():
    with open(path, 'r', encoding='utf-8') as f:
        cards = json.load(f)
    for c in cards:
        if c['id'] in updates:
            c['hito'] = updates[c['id']]
            assert len(c['hito']) <= 145, f"{c['id']} still > 145 ({len(c['hito'])})"
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(cards, f, indent=2, ensure_ascii=False)

print("Tightened all remaining hitos strictly <= 145 chars.")
