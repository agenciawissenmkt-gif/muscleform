"""Trilha sonora original do anúncio (100% sintetizada aqui, sem samples nem
direitos de terceiros) + efeitos sincronizados com a timeline de video.html.

Uso:  python3 marketing/video-anuncio/audio.py   ->  out/trilha.wav (48 kHz, estéreo)

Estrutura (120 BPM, compassos começam nos segundos ímpares):
  0–7 s   dúvida: pad suave em lá menor + caixinha de música; "tum-tum" no medo
  7–19 s  virada: groove leve e luminoso (Dó maior) enquanto ela testa os looks
  19–22 s assinatura: acorde Cmaj9 + sinos no logo
"""
import os

import numpy as np

SR = 48000
DUR = 22.0
N = int(DUR * SR)
HERE = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(7)

music = np.zeros((2, N))   # dry music bus
send = np.zeros((2, N))    # reverb send
sfx = np.zeros((2, N))     # effects bus (also partly sent to reverb)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


NOTE = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}


def nm(name):
    """'A4' -> midi number"""
    return NOTE[name[:-1]] + 12 * (int(name[-1]) + 1)


def put(bus, sig, t0, pan=0.0, gain=1.0):
    """Mix a mono or stereo signal into a bus at time t0 (s), equal-power pan."""
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


def adsr(n, a, d, s, r, sr=SR):
    a, d, r = int(a * sr), int(d * sr), int(r * sr)
    e = np.full(n, s, dtype=float)
    a = max(a, 1)
    e[:min(a, n)] = np.linspace(0, 1, a)[:min(a, n)]
    if d > 0 and a < n:
        k = min(d, n - a)
        e[a:a + k] = np.linspace(1, s, d)[:k]
    if r > 0:
        k = min(r, n)
        e[n - k:] *= np.linspace(1, 0, k) ** 1.5
    return e


def fft_filter(x, lo=None, hi=None, sr=SR, order=2):
    """Smooth zero-phase band filter in the frequency domain."""
    n = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / sr)
    H = np.ones_like(f)
    if lo:
        H *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** (2 * order))
    if hi:
        H *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    return np.fft.irfft(X * H, n)


def moving_band_noise(d, fc_fn, q=1.2, seed=0):
    """Noise through a band-pass whose center moves over time (STFT overlap-add)."""
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
        bw = fc / q
        Hb = np.exp(-0.5 * ((f - fc) / bw) ** 2)
        seg = np.fft.irfft(np.fft.rfft(x[s:s + win] * w) * Hb, win)
        out[s:s + win] += seg * w
        norm[s:s + win] += w ** 2
    out = out[:n] / np.maximum(norm[:n], 1e-3)
    return out / (np.max(np.abs(out)) + 1e-9)


# ----------------------------------------------------------------- instruments
def pad_note(m, d, cutoff=2200.0, detune=0.09, attack=0.5, release=0.9, voices=3):
    t = tvec(d + release)
    f0 = midi(m)
    out = np.zeros((2, len(t)))
    K = max(1, int(min(cutoff * 2.5, 9000) / f0))
    for v in range(voices):
        cents = (v - (voices - 1) / 2) * detune * 100 / max(1, voices - 1) * 2
        f = f0 * 2 ** (cents / 1200)
        ph = rng.uniform(0, 2 * np.pi)
        sig = np.zeros(len(t))
        for k in range(1, K + 1):
            amp = (1 / k) * np.exp(-(k * f) / cutoff)
            if amp < 0.002:
                break
            sig += amp * np.sin(2 * np.pi * k * f * t + ph * k)
        pan = (v - (voices - 1) / 2) / max(1, (voices - 1) / 2) * 0.6
        a = (pan + 1) * np.pi / 4
        out[0] += sig * np.cos(a)
        out[1] += sig * np.sin(a)
    e = adsr(len(t), attack, 0.6, 0.85, release)
    # slow breathing
    e *= 1 + 0.05 * np.sin(2 * np.pi * 0.35 * t + rng.uniform(0, 6))
    return out * e / voices


def pluck(m, d=0.9, bright=1.0, decay=0.55):
    t = tvec(d)
    f0 = midi(m)
    sig = np.zeros(len(t))
    for k in range(1, 14):
        if k * f0 > 12000:
            break
        amp = (1 / k ** 1.25) * (bright if k > 1 else 1)
        tau = decay / (1 + 0.55 * (k - 1))
        sig += amp * np.sin(2 * np.pi * k * f0 * t) * np.exp(-t / tau)
    att = np.minimum(1, t / 0.003)
    click = fft_filter(rng.standard_normal(len(t)) * np.exp(-t / 0.004), lo=2000) * 0.08
    return (sig * att + click) * 0.5


def bell(m, d=2.6, amp=1.0):
    t = tvec(d)
    f0 = midi(m)
    ratios = [1.0, 2.0, 2.76, 4.07, 5.4, 6.8]
    amps = [1.0, 0.45, 0.5, 0.22, 0.18, 0.08]
    decs = [2.2, 1.4, 0.9, 0.6, 0.4, 0.25]
    sig = np.zeros(len(t))
    for r, a, dc in zip(ratios, amps, decs):
        if r * f0 < 16000:
            sig += a * np.sin(2 * np.pi * r * f0 * t) * np.exp(-t / dc)
    return sig * np.minimum(1, t / 0.002) * 0.35 * amp


def kick(amp=1.0, tight=1.0):
    t = tvec(0.6)
    f = 54 + 120 * np.exp(-t / (0.032 * tight))
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / (0.22 * tight))
    click = fft_filter(rng.standard_normal(len(t)) * np.exp(-t / 0.003), lo=1500) * 0.25
    return np.tanh(1.6 * (body + click)) * 0.9 * amp


def clap(amp=1.0):
    t = tvec(0.35)
    n = rng.standard_normal(len(t))
    e = np.zeros(len(t))
    for off in (0.0, 0.009, 0.018):
        e += np.where(t >= off, np.exp(-(t - off) / 0.006), 0)
    e += np.where(t >= 0.024, 0.55 * np.exp(-(t - 0.024) / 0.11), 0)
    return fft_filter(n * e, lo=900, hi=5500) * 0.55 * amp


def hat(open_=False, amp=1.0):
    d = 0.25 if open_ else 0.06
    t = tvec(d)
    n = rng.standard_normal(len(t))
    sig = fft_filter(n, lo=7000, hi=15000) * np.exp(-t / (0.09 if open_ else 0.018))
    return sig * 0.35 * amp


def bass_note(m, d, amp=1.0):
    t = tvec(d)
    f = midi(m)
    sig = np.sin(2 * np.pi * f * t) + 0.32 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    e = adsr(len(t), 0.006, 0.12, 0.7, min(0.06, d * 0.4))
    return np.tanh(1.3 * sig * e) * 0.55 * amp


def pop(f1=900, f2=420, amp=1.0, dur=0.12):
    t = tvec(dur)
    f = f2 + (f1 - f2) * np.exp(-t / 0.018)
    sig = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.035)
    return sig * np.minimum(1, t / 0.0015) * 0.5 * amp


def tap(amp=1.0):
    t = tvec(0.08)
    click = fft_filter(rng.standard_normal(len(t)) * np.exp(-t / 0.0025), lo=2500, hi=9000)
    thump = np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.018)
    return (click * 0.5 + thump * 0.35) * amp


def whoosh(d=0.7, f_from=500, f_to=3500, amp=1.0, seed=1, up_down=True):
    def fc(p):
        if up_down:
            return f_from + (f_to - f_from) * np.sin(np.pi * p)
        return f_from * (f_to / f_from) ** p
    sig = moving_band_noise(d, fc, q=1.4, seed=seed)
    t = tvec(d)[:len(sig)]
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    return sig * e * 0.4 * amp


def shimmer(t0, base=84, amp=1.0, notes=(0, 4, 7, 12, 16), gap=0.035, pan_from=-0.6, pan_to=0.6):
    for i, n in enumerate(notes):
        p = pan_from + (pan_to - pan_from) * i / max(1, len(notes) - 1)
        s = bell(base + n, d=1.2, amp=0.55 * amp)
        put(sfx, s, t0 + i * gap, pan=p, gain=0.5)
        put(send, s, t0 + i * gap, pan=p, gain=0.35)
    d = 0.5
    sp = fft_filter(rng.standard_normal(int(d * SR)), lo=6000) * np.exp(-tvec(d) / 0.14) * 0.05 * amp
    put(sfx, sp, t0, pan=0.0)


def riser(d=1.45, amp=1.0):
    sig = moving_band_noise(d, lambda p: 300 * (7000 / 300) ** (p ** 1.4), q=1.6, seed=11)
    t = tvec(d)[:len(sig)]
    e = (t / d) ** 2.2
    f = 180 * (1100 / 180) ** (t / d)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.18 * (t / d) ** 2
    return (sig * 0.35 + tone) * e * amp


def boom(amp=1.0):
    t = tvec(1.8)
    f = 38 + 34 * np.exp(-t / 0.25)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.45)
    rumble = fft_filter(rng.standard_normal(len(t)), hi=180) * np.exp(-t / 0.5) * 0.4
    return np.tanh(1.2 * (body + rumble)) * 0.8 * amp


def heartbeat(amp=1.0):
    t = tvec(0.35)
    f = 42 + 30 * np.exp(-t / 0.05)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12) * np.minimum(1, t / 0.008)
    return s * 0.7 * amp


# ----------------------------------------------------------------- arrangement
BEAT = 0.5


def chord_pad(notes, t0, d, cutoff, gain, bus_gain_send=0.5):
    for m in notes:
        s = pad_note(nm(m), d, cutoff=cutoff)
        put(music, s, t0, gain=gain)
        put(send, s, t0, gain=gain * bus_gain_send)


# 1) intro: doubt (A minor colour)
intro = [(['A3', 'C4', 'E4', 'G4', 'B4'], 0.0, 3.0), (['F3', 'A3', 'C4', 'E4'], 3.0, 2.0),
         (['D3', 'F3', 'A3', 'C4', 'E4'], 5.0, 1.0), (['E3', 'A3', 'B3', 'D4'], 6.0, 0.95)]
for notes, t0, d in intro:
    darker = 1400 if t0 < 4 else 900
    chord_pad(notes, t0, d, cutoff=darker, gain=0.15)
# music-box motif
box = [('A5', 0.05), ('E5', 0.55), ('C6', 1.05), ('B5', 1.55), ('E5', 2.05), ('A5', 2.55),
       ('F5', 3.05), ('C6', 3.55), ('A5', 4.05)]
for n_, t0 in box:
    s = pluck(nm(n_), d=1.4, bright=0.6, decay=0.6)
    put(music, s, t0, pan=0.25 if nm(n_) % 2 else -0.25, gain=0.24)
    put(send, s, t0, gain=0.14)
# soft low plucks on the downbeats + a light shaker for motion during the hook
for n_, t0 in [('A2', 0.0), ('A2', 1.0), ('A2', 2.0), ('F2', 3.0), ('F2', 4.0)]:
    put(music, pluck(nm(n_), d=1.2, bright=0.4, decay=0.5), t0, gain=0.27)
for i in range(18):
    t0 = 0.5 + i * BEAT / 2
    if t0 < 4.4:
        put(music, hat(amp=0.55 if i % 2 else 0.8), t0, pan=0.3 if i % 2 else -0.3, gain=0.12)
# the fear: low boom + heartbeat, motif descends
put(music, boom(), 4.45, gain=0.26)
for t0, a in [(4.62, 1.0), (4.86, 0.7), (5.34, 0.9), (5.58, 0.6)]:
    put(music, heartbeat(a), t0, gain=0.38)
for n_, t0 in [('E5', 4.9), ('D5', 5.45)]:
    s = pluck(nm(n_), d=1.6, bright=0.5, decay=0.8)
    put(music, s, t0, gain=0.14)
    put(send, s, t0, gain=0.14)
# the turn: riser into the drop
put(music, riser(1.45), 5.55, gain=0.55)

# 2) groove: light and luminous (C major) — 7 s .. 19 s
groove = [(['C4', 'E4', 'G4', 'C5'], 'C2', 7.0, 2.0), (['A3', 'C4', 'E4', 'G4'], 'A1', 9.0, 2.0),
          (['F3', 'A3', 'C4', 'E4'], 'F2', 11.0, 2.0), (['G3', 'B3', 'D4', 'G4'], 'G2', 13.0, 2.0),
          (['C4', 'E4', 'G4', 'C5'], 'C2', 15.0, 2.0), (['F3', 'A3', 'C4', 'F4'], 'F2', 17.0, 1.0),
          (['G3', 'B3', 'D4', 'G4'], 'G2', 18.0, 1.0)]
pad_bus = np.zeros((2, N))
for notes, root, t0, d in groove:
    for m in notes:
        s = pad_note(nm(m), d, cutoff=2600, attack=0.08, release=0.5)
        put(pad_bus, s, t0, gain=0.07)
    # bass on 8ths with octave bounce
    r = nm(root)
    steps = int(d / (BEAT / 2))
    for i in range(steps):
        m = r + (12 if i % 4 == 2 else 0)
        put(music, bass_note(m, BEAT / 2 * 0.92, amp=1.0 if i % 2 == 0 else 0.75), t0 + i * BEAT / 2, gain=0.24)
    # off-beat chord stabs
    for i in range(int(d / BEAT)):
        for m in notes[1:]:
            s = pluck(nm(m), d=0.35, bright=0.8, decay=0.12)
            put(music, s, t0 + i * BEAT + BEAT / 2, pan=0.0, gain=0.05)
            put(send, s, t0 + i * BEAT + BEAT / 2, gain=0.03)

# drums
kicks = [7.0 + i * BEAT for i in range(22)]          # 7.0 .. 17.5, then a breath before the logo
for k in kicks:
    put(music, kick(amp=1.0), k, gain=0.42)
for i in range(22):
    t0 = 7.0 + i * BEAT
    if i % 2 == 1:
        put(music, clap(), t0, gain=0.3)
        put(send, clap(), t0, gain=0.12)
    for j in range(2):
        put(music, hat(amp=0.8 if j else 1.0), t0 + j * BEAT / 2 + BEAT / 4, pan=0.35, gain=0.22)
    if i % 2 == 0:
        put(music, hat(open_=True, amp=0.6), t0 + BEAT / 2, pan=-0.3, gain=0.16)
# build into the logo: short snare/clap roll + riser 18.0..19.0
for i in range(8):
    put(music, clap(amp=0.35 + 0.08 * i), 18.0 + i * 0.125, gain=0.18)
put(music, riser(0.95, amp=0.8), 18.05, gain=0.4)

# sidechain pumping on the pad bus
duck = np.ones(N)
tt = np.arange(N) / SR
for k in kicks:
    m = tt >= k
    duck[m] *= 1 - 0.55 * np.exp(-(tt[m] - k) / 0.13)
music += pad_bus * duck
send += pad_bus * duck * 0.4

# lead melody (C major pentatonic plucks)
lead = {
    7.0: ['E5', None, 'G5', None, 'A5', 'G5', None, 'E5', 'C6', None, 'A5', None, 'G5', None, 'E5', None],
    11.0: ['A5', None, 'C6', None, 'D6', 'C6', None, 'A5', 'G5', None, 'B5', None, 'D6', None, 'G5', None],
    15.0: ['E5', None, 'G5', None, 'C6', 'D6', None, 'E6', 'F5', None, 'A5', 'C6', 'D6', None, 'G5', 'B5'],
}
for t0, seq in lead.items():
    for i, n_ in enumerate(seq):
        if n_:
            s = pluck(nm(n_), d=0.9, bright=1.0, decay=0.42)
            put(music, s, t0 + i * BEAT / 2, pan=0.15, gain=0.13)
            put(send, s, t0 + i * BEAT / 2, gain=0.1)

# 3) signature: Cmaj9 + bells on the logo (19 s)
put(music, kick(amp=1.0, tight=1.6), 19.0, gain=0.5)
put(music, boom(amp=0.5), 19.0, gain=0.25)
for m in ['C3', 'G3', 'E4', 'B4', 'D5']:
    s = pad_note(nm(m), 2.4, cutoff=2400, attack=0.05, release=1.2)
    put(music, s, 19.0, gain=0.07)
    put(send, s, 19.0, gain=0.07)
put(music, bass_note(nm('C2'), 2.0), 19.0, gain=0.2)
for i, n_ in enumerate(['C6', 'E6', 'G6', 'B6', 'D7']):
    s = bell(nm(n_), d=2.8)
    put(music, s, 19.05 + i * 0.09, pan=-0.5 + i * 0.25, gain=0.2)
    put(send, s, 19.05 + i * 0.09, gain=0.2)

# ----------------------------------------------------------------- sound effects
def shutter(amp=1.0):
    """Camera shutter: two crisp mechanical clicks."""
    d = 0.16
    t = tvec(d)
    sig = np.zeros(len(t))
    for off, a in ((0.0, 1.0), (0.055, 0.7)):
        m = t >= off
        burst = rng.standard_normal(len(t)) * np.where(m, np.exp(-(t - off) / 0.006), 0)
        sig += a * fft_filter(burst, lo=1800, hi=9000)
        sig += a * 0.4 * np.where(m, np.sin(2 * np.pi * 900 * (t - off)) * np.exp(-(t - off) / 0.01), 0)
    return sig * 0.6 * amp


# hook: bubble, typing, reference photos, questions
put(sfx, whoosh(0.8, 300, 2200, amp=0.6, seed=2), 0.0, gain=0.6)
put(sfx, pop(700, 380, amp=0.8), 0.86, gain=0.5)
for i in range(6):
    put(sfx, tap(amp=0.35), 0.95 + i * 0.1, pan=-0.2, gain=0.35)
for i in range(6):
    put(sfx, pop(620 + 90 * i, 330 + 40 * i, amp=0.7), 1.6 + i * 0.16, pan=-0.6 + 0.24 * i, gain=0.5)
for i, t0 in enumerate([3.0, 3.5, 4.0]):
    put(sfx, pop(520 - 40 * i, 220, amp=1.0, dur=0.16), t0, pan=[-0.4, 0.4, -0.2][i], gain=0.75)
    put(sfx, tap(amp=0.7), t0, gain=0.4)
put(sfx, whoosh(0.7, 2600, 400, amp=0.7, seed=3, up_down=False), 4.38, gain=0.5)
put(sfx, whoosh(1.0, 700, 4000, amp=0.8, seed=4), 5.85, gain=0.45)
# the app: photo, choices, generating, result
put(sfx, shutter(), 6.93, gain=0.8)
for t0 in [7.5, 8.0, 8.5, 9.0, 9.5, 12.75]:
    put(sfx, tap(amp=0.9), t0, pan=0.1, gain=0.55)
for t0 in [8.02, 9.02]:
    put(sfx, pop(980, 640, amp=0.8, dur=0.1), t0, pan=0.15, gain=0.45)
for t0 in [7.6, 12.25]:
    put(sfx, whoosh(0.35, 1200, 3200, amp=0.35, seed=int(t0 * 10)), t0, gain=0.35)
shimmer(9.62, base=79, amp=0.45, notes=(0, 7, 12, 16, 19), gap=0.09)
put(sfx, riser(1.3, amp=0.35), 9.9, gain=0.3)
shimmer(11.2, base=84, amp=1.0)
for i, n_ in enumerate(['C6', 'E6', 'G6']):
    put(sfx, bell(nm(n_), d=1.6, amp=0.7), 11.22 + i * 0.03, pan=-0.3 + 0.3 * i, gain=0.3)
put(sfx, whoosh(0.55, 1500, 6000, amp=0.5, seed=21), 11.18, gain=0.35)
put(sfx, whoosh(0.32, 800, 5000, amp=0.5, seed=22, up_down=False), 12.8, gain=0.35)
# mosaic, choice, before/after, logo
put(sfx, whoosh(0.8, 400, 3000, amp=0.9, seed=5), 13.35, gain=0.55)
for i in range(9):
    put(sfx, pop(560 + 50 * (i % 4), 300, amp=0.55), 13.78 + i * 0.05, pan=-0.6 + 0.15 * i, gain=0.4)
put(sfx, bell(nm('E6'), d=1.6, amp=0.9), 15.08, gain=0.35)
put(sfx, bell(nm('B6'), d=1.4, amp=0.6), 15.15, gain=0.25)
put(sfx, whoosh(0.7, 500, 3500, amp=0.9, seed=6), 15.55, gain=0.5)
for t0, d in [(16.2, 0.75), (16.95, 0.65), (17.6, 0.6)]:
    put(sfx, whoosh(d, 900, 2400, amp=0.45, seed=int(t0 * 10)), t0, gain=0.4)
put(sfx, pop(880, 520, amp=0.9), 17.1, gain=0.5)
shimmer(17.12, base=86, amp=0.9)
put(sfx, whoosh(0.7, 600, 3000, amp=0.8, seed=8), 18.45, gain=0.45)
shimmer(19.0, base=91, amp=0.5, notes=(0, 4, 7, 12, 16), gap=0.07)
put(sfx, pop(640, 360, amp=0.7), 20.45, gain=0.4)
shimmer(20.85, base=91, amp=0.45, notes=(0, 7, 12, 19), gap=0.08)

# ----------------------------------------------------------------- reverb + master
def reverb_ir(rt60=1.9, pre=0.02, seed=3):
    g = np.random.default_rng(seed)
    n = int((rt60 + pre) * SR)
    t = np.arange(n) / SR
    ir = np.zeros((2, n))
    decay = np.exp(-6.9 * np.maximum(t - pre, 0) / rt60) * (t >= pre)
    for c in range(2):
        noise = g.standard_normal(n) * decay
        ir[c] = fft_filter(noise, lo=200, hi=7000)
    ir /= np.sqrt(np.sum(ir ** 2, axis=1, keepdims=True))
    return ir


def convolve(x, ir):
    n = x.shape[1] + ir.shape[1]
    nfft = 1 << (n - 1).bit_length()
    X = np.fft.rfft(x, nfft)
    Hh = np.fft.rfft(ir, nfft)
    return np.fft.irfft(X * Hh, nfft)[:, :x.shape[1]]


send += sfx * 0.25
wet = convolve(send, reverb_ir())
mix = music + sfx * 0.9 + wet * 0.55
for c in range(2):
    mix[c] = fft_filter(mix[c], lo=28)
# fades
fade_in = np.minimum(1, np.arange(N) / (0.03 * SR))
fade_out = np.clip((DUR - tt) / 0.9, 0, 1) ** 1.5
mix *= fade_in * fade_out
# gentle glue + soft limit
rms = np.sqrt(np.mean(mix ** 2))
mix *= 0.16 / (rms + 1e-9)
mix = np.tanh(1.15 * mix) / np.tanh(1.15)
peak = np.max(np.abs(mix))
mix *= 0.89 / peak

out_dir = os.path.join(HERE, 'out')
os.makedirs(out_dir, exist_ok=True)
pcm = (np.clip(mix.T, -1, 1) * 32767).astype('<i2')
path = os.path.join(out_dir, 'trilha.wav')
import wave
with wave.open(path, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
import json
import subprocess
raw = path.replace('.wav', '-raw.wav')
os.replace(path, raw)
probe = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
m = json.loads(probe[probe.rindex('{'):probe.rindex('}') + 1])
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', raw, '-af',
                f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",
                '-ar', str(SR), '-c:a', 'pcm_s16le', path], check=True)
os.remove(raw)
print('trilha salva em', path, f"(entrada {m['input_i']} LUFS -> -14 LUFS)")
