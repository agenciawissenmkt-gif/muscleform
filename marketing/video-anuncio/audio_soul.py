"""Trilha original no clima soul/gospel para os vídeos 2 e 3 (sintetizada aqui,
sem samples e sem trechos de músicas de terceiros) + efeitos sincronizados.

Uso:
  python3 marketing/video-anuncio/audio_soul.py expectativa
  python3 marketing/video-anuncio/audio_soul.py coragem

Gera, em out/:
  trilha-<video>.wav   música + efeitos, −14 LUFS (para o anúncio)
  efeitos-<video>.wav  só os efeitos, −18 LUFS (para colocar outra música no app da rede social)

Estrutura: 80 BPM, compassos de 3 s, 7 compassos = 21 s
  0–6 s  dúvida: piano elétrico, órgão baixinho, estalos de dedo
  6–15 s groove: bumbo, caixa com palmas, chimbal em tercinas, baixo
  15–18 s pico: coral "uuh", palmas, virada maior (IV–V)
  18–21 s assinatura: acorde final, sinos
"""
import json
import os
import subprocess
import sys
import wave

import numpy as np

SR = 48000
DUR = 21.0
N = int(DUR * SR)
BEAT = 0.75
HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = (sys.argv[1] if len(sys.argv) > 1 else 'expectativa').strip()
assert VIDEO in ('expectativa', 'coragem'), 'use: expectativa | coragem'
rng = np.random.default_rng(11 if VIDEO == 'expectativa' else 23)

music = np.zeros((2, N))
send = np.zeros((2, N))
sfx = np.zeros((2, N))
sfx_send = np.zeros((2, N))   # reverb send of the effects (kept for the effects-only version)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


NOTE = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}


def nm(name):
    name = name.replace('Bb', 'A#').replace('Eb', 'D#').replace('Ab', 'G#')
    return NOTE[name[:-1]] + 12 * (int(name[-1]) + 1)


def put(bus, sig, t0, pan=0.0, gain=1.0):
    if sig.ndim == 1:
        a = (pan + 1) * np.pi / 4
        sig = np.stack([sig * np.cos(a), sig * np.sin(a)])
    i0 = int(round(t0 * SR))
    if i0 >= N:
        return
    j0 = max(0, -i0)
    i0 = max(0, i0)
    n = min(sig.shape[1] - j0, N - i0)
    if n > 0:
        bus[:, i0:i0 + n] += sig[:, j0:j0 + n] * gain


def tvec(d):
    return np.arange(int(d * SR)) / SR


def fft_filter(x, lo=None, hi=None, order=2):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    Hh = np.ones_like(f)
    if lo:
        Hh *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** (2 * order))
    if hi:
        Hh *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    return np.fft.irfft(X * Hh, len(x))


def formant(x, peaks):
    """Vowel-like resonances (for the 'ooh' choir)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    Hh = np.zeros_like(f)
    for fc, bw, g in peaks:
        Hh += g * np.exp(-0.5 * ((f - fc) / bw) ** 2)
    return np.fft.irfft(X * Hh, len(x))


def moving_band_noise(d, fc_fn, q=1.4, seed=0):
    g = np.random.default_rng(seed)
    n = int(d * SR)
    x = g.standard_normal(n + 4096)
    win, hop = 2048, 512
    w = np.hanning(win)
    out = np.zeros(n + 4096)
    norm = np.zeros(n + 4096)
    f = np.fft.rfftfreq(win, 1 / SR)
    for s in range(0, n, hop):
        fc = fc_fn(s / n)
        Hb = np.exp(-0.5 * ((f - fc) / (fc / q)) ** 2)
        out[s:s + win] += np.fft.irfft(np.fft.rfft(x[s:s + win] * w) * Hb, win) * w
        norm[s:s + win] += w ** 2
    out = out[:n] / np.maximum(norm[:n], 1e-3)
    return out / (np.max(np.abs(out)) + 1e-9)


# ----------------------------------------------------------------- instruments
def rhodes(m, d=1.4, vel=1.0):
    """FM electric piano: soft bell attack, warm body, stereo tremolo."""
    rel = 0.35
    t = tvec(d + rel)
    f = midi(m)
    idx = (1.4 + 1.4 * vel) * np.exp(-t / 0.22)
    body = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t))
    tine = 0.18 * vel * np.sin(2 * np.pi * f * 7.0 * t) * np.exp(-t / 0.035)
    bark = 0.08 * np.sin(2 * np.pi * 2 * f * t + 0.6 * np.sin(2 * np.pi * f * t)) * np.exp(-t / 0.35)
    e = np.exp(-t / 2.2) * np.minimum(1, t / 0.004)
    k = int(d * SR)
    e[k:] *= np.linspace(1, 0, len(e) - k) ** 2
    sig = (body + tine + bark) * e
    trem = 0.13 * np.sin(2 * np.pi * 4.2 * t)
    return np.stack([sig * (1 + trem), sig * (1 - trem)]) * 0.22 * vel


def organ(m, d, att=0.35, rel=0.8, bright=1.0):
    """Drawbar organ with a gentle rotary-speaker wobble."""
    t = tvec(d + rel)
    f = midi(m)
    lfo = 2 * np.pi * 6.0 * t
    sig = np.zeros(len(t))
    for r, a in [(0.5, 0.55), (1, 1.0), (1.5, 0.45), (2, 0.55 * bright), (3, 0.25 * bright), (4, 0.18 * bright)]:
        fr = f * r
        if fr > 9000:
            continue
        sig += a * np.sin(2 * np.pi * fr * t + (fr * 0.0025 / 6.0) * np.sin(lfo))
    e = np.minimum(1, t / att)
    k = int(d * SR)
    e[k:] *= np.linspace(1, 0, len(e) - k) ** 1.5
    am = 1 + 0.12 * np.sin(lfo + np.pi / 2)
    s = sig * e * am
    return np.stack([s * (1 + 0.1 * np.sin(lfo)), s * (1 - 0.1 * np.sin(lfo))]) * 0.05


def choir(m, d, att=0.6, rel=1.0):
    """'Ooh' choir: detuned saws through vowel formants."""
    t = tvec(d + rel)
    f = midi(m)
    raw = np.zeros(len(t))
    for det in (-0.006, 0.0, 0.0055):
        ff = f * (1 + det) * (1 + 0.004 * np.sin(2 * np.pi * 5.2 * t + det * 300))
        ph = np.cumsum(ff) / SR
        raw += 2 * (ph % 1.0) - 1
    voc = formant(raw, [(320, 70, 1.0), (800, 110, 0.55), (2400, 220, 0.12)])
    e = np.minimum(1, t / att)
    k = int(d * SR)
    e[k:] *= np.linspace(1, 0, len(e) - k) ** 1.5
    v = voc * e
    v /= np.max(np.abs(v)) + 1e-9
    return np.stack([v * 0.9, v]) * 0.07


def bass(m, d, vel=1.0):
    t = tvec(d)
    f = midi(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    e = np.minimum(1, t / 0.008) * np.exp(-t / 1.2)
    k = max(1, int(min(0.08, d * 0.3) * SR))
    e[-k:] *= np.linspace(1, 0, k)
    return np.tanh(1.4 * s * e) * 0.5 * vel


def kick(amp=1.0):
    t = tvec(0.7)
    f = 44 + 120 * np.exp(-t / 0.04)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.32)
    click = fft_filter(rng.standard_normal(len(t)) * np.exp(-t / 0.003), lo=1500) * 0.2
    return np.tanh(1.5 * (body + click)) * 0.9 * amp


def snare(amp=1.0):
    t = tvec(0.45)
    nz = fft_filter(rng.standard_normal(len(t)), lo=1200, hi=8000) * np.exp(-t / 0.13)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.06)
    return (nz * 0.8 + tone * 0.5) * 0.55 * amp


def clap(amp=1.0):
    t = tvec(0.4)
    n = rng.standard_normal(len(t))
    e = np.zeros(len(t))
    for off in (0.0, 0.011, 0.022, 0.031):
        e += np.where(t >= off, np.exp(-(t - off) / 0.006), 0)
    e += np.where(t >= 0.034, 0.6 * np.exp(-(t - 0.034) / 0.14), 0)
    return fft_filter(n * e, lo=800, hi=6000) * 0.5 * amp


def snap(amp=1.0):
    t = tvec(0.12)
    s = fft_filter(rng.standard_normal(len(t)) * np.exp(-t / 0.012), lo=1500, hi=4500)
    return s * 0.6 * amp


def hat(amp=1.0, open_=False):
    d = 0.3 if open_ else 0.07
    t = tvec(d)
    return fft_filter(rng.standard_normal(len(t)), lo=7000, hi=15000) * np.exp(-t / (0.1 if open_ else 0.02)) * 0.32 * amp


def bell(m, d=2.4, amp=1.0):
    t = tvec(d)
    f = midi(m)
    sig = np.zeros(len(t))
    for r, a, dc in zip([1.0, 2.0, 2.76, 4.07, 5.4], [1.0, 0.45, 0.5, 0.22, 0.18], [2.0, 1.3, 0.9, 0.6, 0.4]):
        if r * f < 16000:
            sig += a * np.sin(2 * np.pi * r * f * t) * np.exp(-t / dc)
    return sig * np.minimum(1, t / 0.002) * 0.33 * amp


def pop(f1=900, f2=420, amp=1.0, dur=0.12):
    t = tvec(dur)
    f = f2 + (f1 - f2) * np.exp(-t / 0.018)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.035) * np.minimum(1, t / 0.0015) * 0.5 * amp


def tap(amp=1.0):
    t = tvec(0.08)
    click = fft_filter(rng.standard_normal(len(t)) * np.exp(-t / 0.0025), lo=2500, hi=9000)
    return (click * 0.5 + np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.018) * 0.35) * amp


def key_click(amp=1.0):
    t = tvec(0.05)
    return fft_filter(rng.standard_normal(len(t)) * np.exp(-t / 0.004), lo=3000, hi=10000) * 0.35 * amp


def whoosh(d=0.7, f_from=500, f_to=3500, amp=1.0, seed=1, up_down=True):
    fc = (lambda p: f_from + (f_to - f_from) * np.sin(np.pi * p)) if up_down else (lambda p: f_from * (f_to / f_from) ** p)
    sig = moving_band_noise(d, fc, q=1.4, seed=seed)
    t = tvec(d)[:len(sig)]
    return sig * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2 * 0.4 * amp


def riser(d=0.9, amp=1.0, seed=5):
    sig = moving_band_noise(d, lambda p: 300 * (7000 / 300) ** (p ** 1.4), q=1.6, seed=seed)
    t = tvec(d)[:len(sig)]
    f = 160 * (1000 / 160) ** (t / d)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.15 * (t / d) ** 2
    return (sig * 0.35 + tone) * (t / d) ** 2.2 * amp


def boom(amp=1.0):
    t = tvec(1.6)
    f = 40 + 30 * np.exp(-t / 0.25)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.45)
    rumble = fft_filter(rng.standard_normal(len(t)), hi=180) * np.exp(-t / 0.5) * 0.4
    return np.tanh(1.2 * (body + rumble)) * 0.8 * amp


def crash(amp=1.0):
    t = tvec(2.2)
    s = fft_filter(rng.standard_normal(len(t)), lo=3000, hi=14000) * np.exp(-t / 0.7)
    return s * 0.18 * amp


def shutter(amp=1.0):
    t = tvec(0.16)
    sig = np.zeros(len(t))
    for off, a in ((0.0, 1.0), (0.055, 0.7)):
        m = t >= off
        sig += a * fft_filter(rng.standard_normal(len(t)) * np.where(m, np.exp(-(t - off) / 0.006), 0), lo=1800, hi=9000)
        sig += a * 0.4 * np.where(m, np.sin(2 * np.pi * 900 * (t - off)) * np.exp(-(t - off) / 0.01), 0)
    return sig * 0.6 * amp


def shimmer(t0, base=84, amp=1.0, notes=(0, 4, 7, 12, 16), gap=0.035):
    for i, n in enumerate(notes):
        p = -0.6 + 1.2 * i / max(1, len(notes) - 1)
        s = bell(base + n, d=1.2, amp=0.55 * amp)
        put(sfx, s, t0 + i * gap, pan=p, gain=0.5)
        put(sfx_send, s, t0 + i * gap, pan=p, gain=0.35)
    put(sfx, fft_filter(rng.standard_normal(int(0.5 * SR)), lo=6000) * np.exp(-tvec(0.5) / 0.14) * 0.05 * amp, t0)


# ----------------------------------------------------------------- harmony
# chord per half bar (1.5 s): (rhodes voicing, bass root)
PROG_A = [  # A minor -> C major lift (video 2)
    (['A3', 'C4', 'E4', 'G4', 'B4'], 'A1'), (['F3', 'A3', 'C4', 'E4', 'G4'], 'F1'),
    (['D3', 'F3', 'A3', 'C4', 'E4'], 'D2'), (['E3', 'G#3', 'D4', 'G4'], 'E2'),
    (['A3', 'C4', 'E4', 'G4', 'B4'], 'A1'), (['F3', 'A3', 'C4', 'E4', 'G4'], 'F1'),
    (['C4', 'E4', 'G4', 'D5'], 'C2'), (['B3', 'D4', 'G4', 'A4'], 'B1'),
    (['A3', 'C4', 'E4', 'G4'], 'A1'), (['F3', 'A3', 'C4', 'E4'], 'F1'),
    (['F3', 'A3', 'C4', 'G4'], 'F1'), (['G3', 'B3', 'D4', 'F4'], 'G1'),
    (['C3', 'G3', 'B3', 'D4', 'E4'], 'C2'), (['C3', 'G3', 'B3', 'D4', 'E4'], 'C2'),
]


def transpose(prog, k):
    def tr(n):
        m = nm(n) + k
        names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        return names[m % 12] + str(m // 12 - 1)
    return [([tr(n) for n in v], tr(b)) for v, b in prog]


PROG = PROG_A if VIDEO == 'expectativa' else transpose(PROG_A, 5)   # video 3 in D minor -> F major

# ----------------------------------------------------------------- arrangement
DROP, PEAK, END = 6.0, 15.0, 18.0
for i, (voicing, root) in enumerate(PROG):
    t0 = i * 1.5
    if t0 >= DUR:
        break
    last = t0 >= END
    # rhodes: long chord in the intro/end, rhythmic comping in the groove
    if t0 < DROP or last:
        vel = 0.75 if t0 < DROP else 0.9
        for j, m in enumerate(voicing):
            s = rhodes(nm(m), d=(3.0 if last else 1.45), vel=vel)
            put(music, s, t0 + j * 0.012, gain=0.8)
            put(send, s, t0 + j * 0.012, gain=0.35)
    else:
        for hit, (off, vel, dd) in enumerate([(0.0, 1.0, 0.6), (0.75 * 0.667, 0.7, 0.25), (0.75, 0.85, 0.6), (0.75 * 1.667, 0.6, 0.25)]):
            for j, m in enumerate(voicing):
                s = rhodes(nm(m), d=dd, vel=vel)
                put(music, s, t0 + off + j * 0.008, gain=0.7)
                put(send, s, t0 + off + j * 0.008, gain=0.25)
    # organ pad: quiet in the doubt, opens up in the groove and peak
    og = 0.35 if t0 < DROP else (1.0 if t0 >= PEAK else 0.7)
    for m in voicing[:4]:
        s = organ(nm(m) - (12 if t0 >= PEAK else 0) + 12, 1.5 if not last else 3.0, bright=0.7 if t0 < DROP else 1.0)
        put(music, s, t0, gain=og)
        put(send, s, t0, gain=og * 0.4)
    # bass: from the second bar, steady in the groove
    if t0 >= 3.0:
        r = nm(root)
        if t0 < DROP:
            put(music, bass(r, 1.45, vel=0.7), t0, gain=0.42)
        elif not last:
            for off, d, k in [(0.0, 0.62, 0), (0.75 * 0.667, 0.2, 0), (0.75, 0.55, 12 if i % 2 else 7), (0.75 * 1.667, 0.2, 0)]:
                put(music, bass(r + k, d), t0 + off, gain=0.42)
        else:
            put(music, bass(r, 2.8), t0, gain=0.45)
    # choir: the peak and the signature
    if t0 >= PEAK:
        for m in voicing[1:4]:
            s = choir(nm(m), 1.5 if not last else 3.0)
            put(music, s, t0, gain=1.0)
            put(send, s, t0, gain=0.6)

# drums
for b in range(int(DUR / BEAT)):
    t0 = b * BEAT
    beat_in_bar = b % 4
    if t0 < DROP:
        # intro: finger snaps on the backbeat (video 2) / soft clock ticks (video 3)
        if VIDEO == 'expectativa' and beat_in_bar in (1, 3):
            put(music, snap(), t0, pan=0.25, gain=0.55)
            put(send, snap(), t0, gain=0.25)
        if VIDEO == 'coragem' and 3.0 <= t0 < 5.25:
            put(music, key_click(amp=1.2), t0, pan=-0.2, gain=0.6)
        continue
    if t0 >= END:
        continue
    if beat_in_bar in (0, 2):
        put(music, kick(), t0, gain=0.5)
    if beat_in_bar == 2:
        put(music, kick(amp=0.6), t0 - BEAT / 3, gain=0.4)
    if beat_in_bar in (1, 3):
        put(music, snare(), t0, gain=0.45)
        put(music, clap(amp=1.0 if t0 >= PEAK else 0.6), t0 + 0.004, pan=0.1, gain=0.35)
        put(send, clap(), t0, gain=0.18)
    for k in range(3):   # triplet hats (12/8 feel)
        put(music, hat(amp=1.0 if k == 0 else 0.55), t0 + k * BEAT / 3, pan=0.3, gain=0.2)
# fill into the peak + impacts
for i in range(6):
    put(music, snare(amp=0.3 + 0.12 * i), PEAK - 0.75 + i * 0.125, gain=0.3)
put(music, riser(0.9, amp=0.6, seed=3), PEAK - 0.9, gain=0.5)
put(music, riser(0.85, amp=0.7, seed=4), DROP - 0.85, gain=0.55)
for t0 in (DROP, PEAK):
    put(music, kick(), t0, gain=0.5)
    put(music, crash(), t0, pan=-0.2, gain=0.8)
    put(send, crash(), t0, gain=0.4)
put(music, kick(), END, gain=0.5)
put(music, crash(amp=0.8), END, pan=0.2, gain=0.7)
put(send, crash(), END, gain=0.4)
put(music, boom(amp=0.6), 4.35, gain=0.35)
# bells on the signature
key = 0 if VIDEO == 'expectativa' else 5
for i, n in enumerate([72, 76, 79, 83, 86]):
    s = bell(n + key, d=2.6)
    put(music, s, END + 0.08 + i * 0.09, pan=-0.5 + i * 0.25, gain=0.18)
    put(send, s, END + 0.08 + i * 0.09, gain=0.18)

# ----------------------------------------------------------------- sound effects
if VIDEO == 'expectativa':
    put(sfx, pop(700, 380, amp=0.8), 0.25, gain=0.5)                       # reference photo arrives
    for i in range(5):
        put(sfx, tap(amp=0.35), 0.85 + i * 0.11, pan=-0.2, gain=0.35)      # typing
    put(sfx, pop(820, 460, amp=0.9), 1.4, gain=0.5)                        # "Quero igual a essa!"
    put(sfx, whoosh(0.6, 500, 3000, amp=0.7, seed=31), 2.85, gain=0.5)     # split
    for t0 in (3.3, 3.42):
        put(sfx, pop(600, 320, amp=0.6), t0, gain=0.4)
    put(sfx, pop(300, 140, amp=1.0, dur=0.2), 3.55, gain=0.6)              # "?"
    put(sfx, pop(260, 120, amp=1.0, dur=0.22), 4.35, gain=0.6)             # 1-star review
    put(sfx, whoosh(0.6, 2600, 400, amp=0.6, seed=32, up_down=False), 5.5, gain=0.45)
    put(sfx, shutter(), 6.73, gain=0.8)
    for t0 in (7.5, 8.25, 9.0, 11.9):
        put(sfx, tap(amp=0.9), t0, pan=0.1, gain=0.55)
    for i in range(4):
        put(sfx, key_click(), 7.62 + i * 0.13, pan=0.15, gain=0.6)         # typing "wolf"
    put(sfx, pop(980, 640, amp=0.8, dur=0.1), 8.27, gain=0.45)
    shimmer(9.1, base=79, amp=0.45, notes=(0, 7, 12, 16, 19), gap=0.09)
    shimmer(10.9, base=84, amp=1.0)
    for t0, d in ((12.05, 0.55), (12.6, 0.5)):
        put(sfx, whoosh(d, 900, 2400, amp=0.45, seed=int(t0 * 10)), t0, gain=0.4)
    put(sfx, whoosh(0.8, 400, 3000, amp=0.9, seed=33), 13.3, gain=0.5)
    for t0 in (14.0, 14.12):
        put(sfx, pop(600, 320, amp=0.6), t0, gain=0.4)
    put(sfx, pop(520, 260, amp=1.0, dur=0.18), 15.0, gain=0.6)            # "="
    shimmer(15.02, base=86, amp=0.9)
    put(sfx, whoosh(0.4, 800, 4000, amp=0.5, seed=34), 15.85, gain=0.4)   # review flips
    for i in range(5):                                                      # five stars
        put(sfx, bell(84 + [0, 2, 4, 7, 9][i], d=1.0, amp=0.8), 16.05 + i * 0.07, pan=-0.5 + 0.25 * i, gain=0.3)
else:
    for i in range(5):
        put(sfx, tap(amp=0.35), 0.85 + i * 0.11, pan=-0.2, gain=0.35)
    put(sfx, pop(780, 420, amp=0.9), 1.4, gain=0.5)                        # "Só as pontinhas, tá?"
    for i, t0 in enumerate((3.12, 3.37, 3.62)):                            # old photos
        put(sfx, shutter(amp=0.5), t0, pan=[-0.5, 0.0, 0.5][i], gain=0.45)
    put(sfx, pop(700, 380, amp=0.8), 3.9, gain=0.5)                        # "Hoje"
    put(sfx, whoosh(0.6, 2600, 400, amp=0.6, seed=41, up_down=False), 5.5, gain=0.45)
    put(sfx, shutter(), 6.73, gain=0.8)
    for t0 in (7.5, 8.25, 9.0):
        put(sfx, tap(amp=0.9), t0, pan=0.1, gain=0.55)
    put(sfx, pop(980, 640, amp=0.8, dur=0.1), 8.27, gain=0.45)
    shimmer(9.0, base=79, amp=0.45, notes=(0, 7, 12, 16, 19), gap=0.08)
    for i, t0 in enumerate((9.85, 10.5, 11.25, 12.0)):                     # each result + chip
        shimmer(t0, base=81 + 2 * i, amp=0.6, notes=(0, 4, 7, 12), gap=0.03)
        put(sfx, pop(560 - 30 * i, 260, amp=0.9, dur=0.15), t0, pan=[-0.4, 0.4, -0.3, 0.3][i], gain=0.55)
    shimmer(12.75, base=84, amp=1.0)
    put(sfx, whoosh(0.8, 400, 3000, amp=0.9, seed=42), 14.45, gain=0.5)
    put(sfx, whoosh(0.32, 2500, 7000, amp=0.6, seed=43, up_down=False), 15.25, gain=0.5)   # marker strike
    put(sfx, pop(520, 260, amp=1.0, dur=0.18), 15.6, gain=0.6)            # "Faz tudo!"
    shimmer(15.62, base=86, amp=0.9)
    for t0, d in ((15.25, 0.7), (15.95, 0.65), (16.6, 0.6)):
        put(sfx, whoosh(d, 900, 2400, amp=0.4, seed=int(t0 * 10)), t0, gain=0.35)
    put(sfx, pop(880, 520, amp=0.9), 16.6, gain=0.5)                       # "Amei!"
    shimmer(16.62, base=88, amp=0.7)
put(sfx, whoosh(0.7, 600, 3000, amp=0.8, seed=8), 17.85, gain=0.45)        # to the logo
shimmer(18.5, base=91, amp=0.5, notes=(0, 4, 7, 12, 16), gap=0.07)
put(sfx, pop(640, 360, amp=0.7), 19.95, gain=0.4)                          # CTA
shimmer(20.35, base=91, amp=0.45, notes=(0, 7, 12, 19), gap=0.08)


# ----------------------------------------------------------------- reverb + master
def reverb_ir(rt60=2.1, pre=0.025, seed=3):
    g = np.random.default_rng(seed)
    n = int((rt60 + pre) * SR)
    t = np.arange(n) / SR
    decay = np.exp(-6.9 * np.maximum(t - pre, 0) / rt60) * (t >= pre)
    ir = np.stack([fft_filter(g.standard_normal(n) * decay, lo=200, hi=6500) for _ in range(2)])
    return ir / np.sqrt(np.sum(ir ** 2, axis=1, keepdims=True))


def convolve(x, ir):
    n = x.shape[1] + ir.shape[1]
    nfft = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[:, :x.shape[1]]


tt = np.arange(N) / SR
fade = np.minimum(1, tt / 0.03) * np.clip((DUR - tt) / 0.9, 0, 1) ** 1.5
ir = reverb_ir()


def finish(mix):
    for c in range(2):
        mix[c] = fft_filter(mix[c], lo=28)
    mix = mix * fade
    mix *= 0.16 / (np.sqrt(np.mean(mix ** 2)) + 1e-9)
    mix = np.tanh(1.15 * mix) / np.tanh(1.15)
    return mix * (0.89 / np.max(np.abs(mix)))


def write(mix, path, lufs):
    raw = path.replace('.wav', '-raw.wav')
    pcm = (np.clip(mix.T, -1, 1) * 32767).astype('<i2')
    with wave.open(raw, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    probe = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', raw, '-af', f'loudnorm=I={lufs}:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = json.loads(probe[probe.rindex('{'):probe.rindex('}') + 1])
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', raw, '-af',
                    f"loudnorm=I={lufs}:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",
                    '-ar', str(SR), '-c:a', 'pcm_s16le', path], check=True)
    os.remove(raw)
    print('salvo', path, f"({m['input_i']} LUFS -> {lufs} LUFS)")


out_dir = os.path.join(HERE, 'out')
os.makedirs(out_dir, exist_ok=True)
fx_send = sfx * 0.25 + sfx_send
full = music + sfx * 0.9 + convolve(send + fx_send, ir) * 0.5
write(finish(full), os.path.join(out_dir, f'trilha-{VIDEO}.wav'), -14)
only_fx = sfx * 0.9 + convolve(fx_send, ir) * 0.5
write(finish(only_fx), os.path.join(out_dir, f'efeitos-{VIDEO}.wav'), -18)
