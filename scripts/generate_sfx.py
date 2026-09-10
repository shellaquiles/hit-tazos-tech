#!/usr/bin/env python3
"""
generate_sfx.py
Genera efectos de sonido foley orgánicos y físicos para Hit-Tazos Tech:
- tazo_flip.mp3: Roce suave de disco y aire al voltear (slide/whoosh + snap)
- tazo_slam.mp3: Chasquido seco y sordo de plástico rígido impactando la mesa
- tazo_win.mp3:  Tintineo cálido de marimba/campana orgánica (acorde suave)
- tazo_miss.mp3: Rebote sordo de descarte (thump amortiguado)
- tazo_tick.mp3: Clic mecánico de dial / trinquete (micro-transient táctil)
"""

import os
import math
import random
import struct
import wave
import subprocess

SAMPLE_RATE = 44100

def write_wav(filename, samples):
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        # Normalizar y escribir PCM 16-bit
        max_val = max(max(abs(s) for s in samples), 1e-6)
        scaled = [int(max(-1.0, min(1.0, s / max_val * 0.92)) * 32767) for s in samples]
        data = struct.pack(f'<{len(scaled)}h', *scaled)
        wf.writeframes(data)

def generate_slam():
    # Impacto de plástico rígido (slam/clack)
    # Impulso inicial seco (0-2ms) + resonancia modal de plástico (800-2400Hz) + golpe sordo de mesa (110Hz)
    duration = 0.18
    n_samples = int(SAMPLE_RATE * duration)
    samples = []
    
    random.seed(42)
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        
        # Click percusivo de borde plástico (primeros 5ms)
        click = (random.random() * 2 - 1) * math.exp(-t * 800) if t < 0.015 else 0
        
        # Resonancias del cuerpo de acetato/plástico
        r1 = math.sin(2 * math.pi * 920 * t) * math.exp(-t * 90)
        r2 = math.sin(2 * math.pi * 1650 * t + 0.5) * math.exp(-t * 140) * 0.6
        r3 = math.sin(2 * math.pi * 2380 * t + 1.1) * math.exp(-t * 220) * 0.35
        
        # Resonancia sorda de la madera/mesa de sobremesa
        thud = math.sin(2 * math.pi * 115 * t) * math.exp(-t * 45) * 0.8
        
        val = (click * 1.2 + (r1 + r2 + r3) * 0.7 + thud * 0.5)
        samples.append(val)
    return samples

def generate_flip():
    # Deslizamiento suave de aire y acetato al voltear (slide/whoosh + snap)
    duration = 0.22
    n_samples = int(SAMPLE_RATE * duration)
    samples = []
    
    random.seed(101)
    # Ruido filtrado que baja en frecuencia (whoosh de aire)
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        # Frecuencia central del whoosh: de 1400Hz a 450Hz
        freq = 1400 - (t / duration) * 950
        # Envolvente suave de aire
        env_whoosh = math.sin(math.pi * (t / duration)) ** 1.5
        noise = (random.random() * 2 - 1) * env_whoosh
        
        # Micro chasquido sutil al inicio de la rotación
        snap = math.sin(2 * math.pi * 1800 * t) * math.exp(-t * 250) if t < 0.02 else 0
        
        # Toque final de posada en la mesa
        landing = math.sin(2 * math.pi * 260 * (t - 0.14)) * math.exp(-(t - 0.14) * 80) if t > 0.14 else 0
        
        samples.append(noise * 0.45 + snap * 0.6 + landing * 0.4)
    return samples

def generate_win():
    # Tintineo cálido de canica / marimba acústica (campana suave y orgánica)
    duration = 0.45
    n_samples = int(SAMPLE_RATE * duration)
    samples = []
    
    # Acorde mayor dulce y sutil: C5 (523Hz), E5 (659Hz), G5 (784Hz)
    chord = [
        (523.25, 0.00, 1.0, 14),   # C5 fundamental
        (659.25, 0.04, 0.8, 16),   # E5 leve arpegio
        (783.99, 0.08, 0.7, 18),   # G5
        (1046.50, 0.12, 0.4, 22)   # C6 armónico sutil
    ]
    
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        val = 0
        for freq, delay, amp, decay in chord:
            if t >= delay:
                dt = t - delay
                # Armónicos de madera/metal acústico
                s = (math.sin(2 * math.pi * freq * dt) +
                     0.3 * math.sin(2 * math.pi * freq * 2.75 * dt) * math.exp(-dt * decay * 2) +
                     0.15 * math.sin(2 * math.pi * freq * 4.2 * dt) * math.exp(-dt * decay * 3))
                val += s * amp * math.exp(-dt * decay)
        samples.append(val)
    return samples

def generate_miss():
    # Rebote sordo de descarte (amortiguado)
    duration = 0.15
    n_samples = int(SAMPLE_RATE * duration)
    samples = []
    
    random.seed(88)
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        # Golpe sordo sin brillo metálico: 140Hz y 280Hz con decaimiento rápido
        thud = (math.sin(2 * math.pi * 140 * t) * math.exp(-t * 60) +
                math.sin(2 * math.pi * 280 * t) * math.exp(-t * 90) * 0.5)
        click = (random.random() * 2 - 1) * math.exp(-t * 400) if t < 0.008 else 0
        samples.append(thud * 0.8 + click * 0.3)
    return samples

def generate_tick():
    # Clic táctil de rueda mecánica o trinquete (dial)
    duration = 0.045
    n_samples = int(SAMPLE_RATE * duration)
    samples = []
    
    random.seed(33)
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        # Impulso ultra rápido y nítido de engranaje (2200Hz - 4200Hz, decae en 10ms)
        click = (math.sin(2 * math.pi * 2800 * t) * math.exp(-t * 450) +
                 math.sin(2 * math.pi * 4400 * t) * math.exp(-t * 650) * 0.5 +
                 (random.random() * 2 - 1) * math.exp(-t * 900) * 0.4)
        samples.append(click)
    return samples

def main():
    sfx_dir = os.path.join(os.path.dirname(__file__), '..', 'web', 'assets', 'sfx')
    os.makedirs(sfx_dir, exist_ok=True)
    
    sounds = {
        'tazo_slam': generate_slam(),
        'tazo_flip': generate_flip(),
        'tazo_win':  generate_win(),
        'tazo_miss': generate_miss(),
        'tazo_tick': generate_tick()
    }
    
    for name, samples in sounds.items():
        wav_path = os.path.join(sfx_dir, f"{name}.wav")
        mp3_path = os.path.join(sfx_dir, f"{name}.mp3")
        
        write_wav(wav_path, samples)
        # Convertir a MP3 compacto de 96k (archivos de 3 a 7 KB)
        cmd = ['ffmpeg', '-y', '-i', wav_path, '-b:a', '96k', '-ar', '44100', mp3_path]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        os.remove(wav_path)
        
        size_kb = os.path.getsize(mp3_path) / 1024
        print(f"✅ Generado: {name}.mp3 ({size_kb:.1f} KB)")

if __name__ == '__main__':
    main()
