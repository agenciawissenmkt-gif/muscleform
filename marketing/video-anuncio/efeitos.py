"""Efeitos sonoros dos três anúncios: poucos, baixos e sempre no momento de uma ação na tela.

Os sons são da biblioteca da Mixkit (Mixkit Sound Effects Free License,
https://mixkit.co/license/#sfxFree: uso livre em anúncios, redes sociais, YouTube, TV etc.,
sem redistribuir o som sozinho). Por isso os arquivos não ficam no repositório: são baixados
para out/musica/efeitos/ (fora do git) na primeira vez.

Usado por trilha_eletronica.py e trilha_propria.py (bus(video, n) devolve a faixa de efeitos).
"""
import os
import shutil
import subprocess
import urllib.request

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, 'out', 'musica', 'efeitos')
SR = 48000

# name: (Mixkit id, where the sound "hits": 'onset' = start of the attack, 'peak' = loudest point)
SOUNDS = {
    'pop': (2356, 'onset'),        # Dry pop up notification alert: balão de mensagem
    'tap': (1109, 'onset'),        # Select click: toque na tela
    'shutter': (1432, 'onset'),    # Camera digital shutter: foto do app
    'swish': (1464, 'peak'),       # Quick swoosh accent: movimento pequeno
    'whoosh': (166, 'peak'),       # Fast small sweep transition: troca de cena
    'sparkle': (3083, 'onset'),    # Magic sparkle touch: revelação do novo visual
    'twinkle': (871, 'onset'),     # Fairy magic sparkle: brilho pequeno
    'scribble': (2369, 'onset'),   # Writing scribble on paper: risco no "Só as pontinhas"
    'logo': (2633, 'peak'),        # Sweeping sparkle presentation intro: ícone e nome no final
}
SOFTEN = {'sparkle', 'twinkle', 'logo'}     # brilhos: agudos um pouco mais suaves

# How far below the music each kind of sound sits (dB under the music's level around the event):
# clicks and taps barely there, the camera, the pen and the logo a little more present.
BELOW = {'pop': 7, 'tap': 12, 'type': 15, 'shutter': 6, 'swish': 10, 'whoosh': 8,
         'sparkle': 9, 'twinkle': 11, 'scribble': 6, 'logo': 6}

# (time in the video, sound). Times are the frames where the action happens.
EVENTS = {
    'indecisao': [
        (0.85, 'pop'),               # "Não sei o que eu quero… 😅"
        (6.95, 'shutter'),           # foto no app
        (7.5, 'tap'), (9.5, 'tap'),
        (11.2, 'sparkle'),           # "Seu novo visual"
        (12.75, 'tap'), (12.88, 'swish'),   # manda no WhatsApp
        (13.5, 'whoosh'),            # mosaico
        (16.0, 'swish'),             # antes/depois
        (17.1, 'pop'),               # "É esse! 😍"
        (19.05, 'logo'),
    ],
    'expectativa': [
        (0.85, 'pop'),               # foto da modelo no chat
        (6.75, 'shutter'),
        (7.5, 'tap'),
        (7.6, 'type'), (7.73, 'type'), (7.86, 'type'), (7.99, 'type'),   # "wolf"
        (8.25, 'tap'), (9.0, 'tap'),
        (10.95, 'sparkle'),          # Wolf Cut no rosto dela
        (11.9, 'tap'), (11.98, 'swish'),    # Comparar
        (13.35, 'whoosh'),
        (15.0, 'pop'), (15.02, 'twinkle'),  # Expectativa = Realidade
        (18.75, 'logo'),
    ],
    'coragem': [
        (0.85, 'pop'),               # "Só as pontinhas, tá? 😬"
        (3.05, 'swish'),             # fotos dos outros anos
        (6.75, 'shutter'),
        (7.5, 'tap'), (8.25, 'tap'), (9.0, 'tap'),
        (9.85, 'twinkle'),           # primeira cor
        (12.8, 'sparkle'),           # Mega Hair + Ruivo
        (14.5, 'whoosh'),
        (15.25, 'scribble'),         # risca "Só as pontinhas"
        (16.65, 'pop'),              # "Amei! 😍"
        (18.75, 'logo'),
    ],
}
TYPE_PITCH = [1.0, 1.07, 0.96, 1.04]   # digitação: o mesmo toque, levemente variado


def _download(sid):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, f'{sid}.wav')
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        return path
    url = f'https://assets.mixkit.co/active_storage/sfx/{sid}/{sid}.wav'
    tmp = path + '.part'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=60) as r, open(tmp, 'wb') as f:
            shutil.copyfileobj(r, f)
    except OSError:
        subprocess.run(['curl', '-fsSL', '-A', 'Mozilla/5.0', '-o', tmp, url], check=True)
    os.replace(tmp, path)
    return path


def _load(name):
    sid, mode = SOUNDS[name]
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', _download(sid), '-ac', '2', '-ar', str(SR),
                          '-f', 'f32le', '-'], check=True, capture_output=True).stdout
    x = np.frombuffer(raw, '<f4').reshape(-1, 2).astype(np.float64)
    if name in SOFTEN:   # gentle high shelf: -4 dB above ~7 kHz
        spec = np.fft.rfft(x, axis=0)
        f = np.fft.rfftfreq(len(x), 1 / SR)
        spec *= (1 - 0.37 / (1 + np.exp(-(f - 7000) / 900)))[:, None]
        x = np.fft.irfft(spec, len(x), axis=0)
    x /= max(np.abs(x).max(), 1e-9) / 10 ** (-1 / 20)          # peak at -1 dBFS before the event gain
    w = int(0.005 * SR) if mode == 'onset' else int(0.02 * SR)
    env = np.sqrt(np.convolve((x ** 2).mean(1), np.ones(w) / w, 'same'))
    hit = int(np.argmax(env > 0.3 * env.max())) if mode == 'onset' else int(np.argmax(env))
    return x, hit


def _rms_db(x):
    return 10 * np.log10(np.mean(x ** 2) + 1e-12)


def bus(video, music):
    """Stereo effects track for `video`, as long as `music` and levelled against it: each sound sits
    BELOW[sound] dB under the music around it (never measured below the track's overall level
    minus 10 dB, so the effects stay audible in the quiet intros and under the final fade), and
    with their peaks kept under the music's peaks."""
    n = len(music)
    out = np.zeros((n, 2))
    floor = _rms_db(music[np.abs(music).max(1) > 1e-4]) - 10
    cache = {}
    typed = 0
    for t, name in EVENTS[video]:
        key = 'tap' if name == 'type' else name
        if key not in cache:
            cache[key] = _load(key)
        x, hit = cache[key]
        if name == 'type':        # shorter, pitched copies of the tap
            p = TYPE_PITCH[typed % len(TYPE_PITCH)]
            typed += 1
            idx = np.arange(0, len(x) - 1, p)
            x = np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in range(2)], 1)
            hit = int(hit / p)
        env = np.abs(x).max(1)
        active = x[env > 0.1 * env.max()]
        around = music[max(0, int((t - 0.15) * SR)):int((t + 0.45) * SR)]
        level = max(_rms_db(around), floor) - BELOW[name]
        gain = 10 ** ((level - _rms_db(active)) / 20)
        # sharp sounds (camera, glitter, pen) never peak above the music's own peaks minus 4 dB
        cap = 10 ** (-4 / 20) * max(np.abs(around).max(), 10 ** (floor / 20)) / max(env.max(), 1e-9)
        gain = min(gain, cap)
        start = round(t * SR) - hit
        a, b = max(0, start), min(n, start + len(x))
        if b > a:
            out[a:b] += x[a - start:b - start] * gain
    return out
