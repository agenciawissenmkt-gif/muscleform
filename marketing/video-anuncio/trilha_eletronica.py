"""Trilhas eletrônicas dos três anúncios, editadas a partir de músicas prontas da Mixkit.

Licença das músicas: Mixkit Stock Music Free License (https://mixkit.co/license/#musicFree).
Pode usar de graça em projetos comerciais, posts de redes sociais, anúncios online e YouTube.
Não vale para TV aberta/rádio, CD/DVD e games, e a música não pode ser registrada em
sistemas de direitos (Content ID) nem distribuída sozinha. Por isso os MP3 originais não
ficam no repositório: o script baixa da Mixkit e guarda em out/musica/ (fora do git).

Uso:
  python3 marketing/video-anuncio/trilha_eletronica.py          # gera out/trilha-<video>.wav
  python3 marketing/video-anuncio/trilha_eletronica.py --mux    # e troca o áudio dos MP4 em out/

Edição (o drop da música cai quando o app aparece e a música termina no logo):
  indecisao    "Life is a Dream" (Michael Ramir C.), nu-disco, 120 BPM.
               Introdução filtrada na dúvida, drop em 7,0 s (câmera do app),
               acorde final da música em 19,0 s (nome Beauty and self aparecendo).
  expectativa  "Swish Swed" (Arulo), tech house, 120 BPM.
               Subida de 0 a 6 s, drop em 6,0 s (app), último compasso da música
               a partir de 18,0 s: ela para em 20,0 s, junto com o botão.
  coragem      "Can't Get You Off My Mind" (Michael Ramir C.), future bass,
               acelerada de 150 para 160 BPM (sem mudar o tom) para casar com os
               cortes de 0,75 s do vídeo. Pausa antes do drop em "medo de mudar",
               drop em 6,0 s, últimos 2 compassos de 18 a 21 s.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.request

import numpy as np

import efeitos

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
CACHE = os.path.join(OUT, 'musica')
SR = 48000
TARGET_LUFS = -14.0
WAV_CEILING = -1.7         # true peak of the WAV: about -1 dBTP in the MP4 (AAC adds ~0.5 dB)

TRACKS = {
    'life-is-a-dream': {'id': 837, 'title': 'Life is a Dream', 'artist': 'Michael Ramir C.'},
    'swish-swed': {'id': 201, 'title': 'Swish Swed', 'artist': 'Arulo'},
    'cant-get-you-off-my-mind': {'id': 1210, 'title': "Can't Get You Off My Mind", 'artist': 'Michael Ramir C.'},
}

# segments: (video time where it starts, source time relative to the drop of the track).
# Each segment plays until the next one starts. Source times are whole bars away from the
# drop, so every cut lands on the beat grid of the music.
VIDEOS = {
    'indecisao': {
        'mp4': 'beauty-and-self', 'dur': 22.0, 'track': 'life-is-a-dream', 'tempo': 1.0,
        'drop_guess': 8.07, 'drop_at': 7.0,
        'segments': [(0.0, -7.0), (19.0, 80.0)],   # +80 s = 40 bars: the final chord of the song
        'fade_out': (20.6, 22.0)},
    'expectativa': {
        'mp4': 'beauty-and-self-expectativa', 'dur': 21.0, 'track': 'swish-swed', 'tempo': 1.0,
        'drop_guess': 40.01, 'drop_at': 6.0,
        'segments': [(0.0, -6.0), (18.0, 94.0)],   # +94 s = 47 bars: last bar, the song stops at 20.0 s
        'fade_out': (20.55, 21.0)},
    'coragem': {
        'mp4': 'beauty-and-self-coragem', 'dur': 21.0, 'track': 'cant-get-you-off-my-mind', 'tempo': 160 / 150,
        'drop_guess': 24.0, 'drop_at': 6.0,         # 25.6 s in the original = 24.0 s at 160 BPM
        'segments': [(0.0, -6.0), (18.0, 57.0)],   # +57 s = 38 bars of 1.5 s: the last 2 bars, ends at 21.0 s
        'fade_out': (20.95, 21.0)},
}


def download(track):
    os.makedirs(CACHE, exist_ok=True)
    tid = TRACKS[track]['id']
    path = os.path.join(CACHE, f'{tid}.mp3')
    if os.path.exists(path) and os.path.getsize(path) > 100_000:
        return path
    url = f'https://assets.mixkit.co/music/{tid}/{tid}.mp3'
    print(f'baixando {url}')
    tmp = path + '.part'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=60) as r, open(tmp, 'wb') as f:
            shutil.copyfileobj(r, f)
    except OSError:  # some setups only let curl through the proxy
        subprocess.run(['curl', '-fsSL', '-A', 'Mozilla/5.0', '-o', tmp, url], check=True)
    os.replace(tmp, path)
    return path


def decode(path, tempo):
    """MP3 -> float32 stereo at 48 kHz; tempo != 1 time-stretches without changing the key."""
    filters = []
    if abs(tempo - 1) > 1e-9:
        filters.append(f'rubberband=tempo={tempo:.9f}:transients=crisp:detector=compound:'
                       'window=standard:formant=preserved:pitchq=quality:channels=together')
    filters.append(f'aresample={SR}:resampler=soxr:precision=28')
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-af', ','.join(filters),
                          '-ac', '2', '-f', 'f32le', '-'], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype='<f4').reshape(-1, 2).astype(np.float64)


def find_drop(x, guess, search=0.15):
    """Time of the first big low-end hit (kick/bass) near `guess`: where it reaches 15% of its peak."""
    a = max(0, int((guess - search - 0.1) * SR))
    b = int((guess + search + 0.1) * SR)
    seg = x[a:b].mean(1)
    spec = np.fft.rfft(seg)
    f = np.fft.rfftfreq(len(seg), 1 / SR)
    low = np.fft.irfft(spec * ((f > 25) & (f < 150)), len(seg))
    w = int(0.003 * SR)
    env = np.sqrt(np.convolve(low ** 2, np.ones(w) / w, 'same'))
    lo, hi = int((guess - search) * SR) - a, int((guess + search) * SR) - a
    pk = lo + int(np.argmax(env[lo:hi]))
    i = pk
    while i > 0 and env[i] > 0.15 * env[pk]:
        i -= 1
    return (a + i) / SR


def assemble(x, drop, segments, n):
    """Edit of track `x`: each segment (video time, source time relative to `drop`) plays until the
    next one starts; cuts get a 12 ms crossfade that ends right before the downbeat."""
    t = np.arange(n) / SR

    def src(seg_i):
        v0, rel = segments[seg_i]
        s = np.round((drop + rel + (t - v0)) * SR).astype(int)
        ok = (s >= 0) & (s < len(x))
        out = np.zeros((n, 2))
        out[ok] = x[s[ok]]
        return out

    mix = src(0)
    xf = 0.012
    for k in range(1, len(segments)):
        cut = segments[k][0] - 0.003
        nxt = src(k)
        g = np.clip((t - (cut - xf)) / xf, 0, 1)[:, None]
        mix = mix * np.cos(g * np.pi / 2) + nxt * np.sin(g * np.pi / 2)
    return mix


def fades(mix, fade_in, fade_out):
    t = np.arange(len(mix)) / SR
    mix = mix * np.clip(t / fade_in, 0, 1)[:, None]
    f0, f1 = fade_out
    return mix * (0.5 + 0.5 * np.cos(np.pi * np.clip((t - f0) / (f1 - f0), 0, 1)))[:, None]


def master(mix, path):
    """-14 LUFS, then a look-ahead true-peak limiter keeps the peaks under the ceiling (the original
    masters peak above 0 dBFS); measured again and corrected."""
    loud0, tp0 = measure(mix)
    gain, out = TARGET_LUFS - loud0, mix
    for _ in range(3):
        out, gr = limit(mix * 10 ** (gain / 20), WAV_CEILING)
        loud, tp = measure(out)
        if abs(loud - TARGET_LUFS) < 0.1 and tp <= WAV_CEILING + 0.05:
            break
        gain += TARGET_LUFS - loud
    write_wav(path, out)
    print(f'  {loud0:.1f} LUFS / {tp0:+.1f} dBTP -> {loud:.1f} LUFS / {tp:.1f} dBTP '
          f'(limitador: até {gr:.1f} dB) -> {os.path.relpath(path)}')
    return path


def build(name):
    v = VIDEOS[name]
    x = decode(download(v['track']), v['tempo'])
    drop = find_drop(x, v['drop_guess'])
    print(f'{name}: {TRACKS[v["track"]]["title"]}, drop em {drop:.3f} s da música -> {v["drop_at"]:.2f} s do vídeo')
    n = round(v['dur'] * SR)
    music = fades(assemble(x, drop, v['segments'], n), 0.01, v['fade_out'])
    return master(music + efeitos.bus(name, music), os.path.join(OUT, f'trilha-{name}.wav'))


def limit(mix, ceiling_db, lookahead=0.0015, release=0.1, oversample=4):
    """Look-ahead peak limiter on the 4x-oversampled (true) peak, both channels linked.

    Returns the limited signal and the largest gain reduction in dB."""
    n = len(mix)
    peak = np.abs(mix).max(1)
    for ch in range(2):
        spec = np.fft.rfft(mix[:, ch])
        up = np.zeros(n * oversample // 2 + 1, complex)
        up[:len(spec)] = spec
        y = np.abs(np.fft.irfft(up, n * oversample)) * oversample
        peak = np.maximum(peak, y[:n * oversample].reshape(n, oversample).max(1))
    need = np.minimum(1.0, 10 ** (ceiling_db / 20) / np.maximum(peak, 1e-12))
    la = max(1, int(lookahead * SR))
    # minimum over the next `la` samples, then an `la`-long average: the gain is already down
    # when each peak arrives, without clicks
    g = np.lib.stride_tricks.sliding_window_view(np.concatenate([need, np.ones(la)]), la + 1).min(1)[:n]
    cs = np.concatenate([[0.0], np.cumsum(np.concatenate([np.ones(la), g]))])
    g = (cs[la + 1:la + 1 + n] - cs[:n]) / (la + 1)
    a = np.exp(-1 / (release * SR))
    cur, out = 1.0, np.empty(n)
    for i, v in enumerate(g.tolist()):
        cur = v if v < cur else v + (cur - v) * a
        out[i] = cur
    return mix * out[:, None], -20 * np.log10(out.min())


def measure(mix):
    """Integrated loudness (LUFS) and true peak (dBTP) with ffmpeg's EBU R128 meter."""
    raw = mix.astype('<f4').tobytes()
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-f', 'f32le', '-ar', str(SR), '-ac', '2',
                        '-i', '-', '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       input=raw, capture_output=True, check=True)
    log = r.stderr.decode('utf-8', 'replace')
    summary = log[log.rfind('Summary:'):]
    loud = float(re.search(r'I:\s+(-?[\d.]+) LUFS', summary).group(1))
    tp = float(re.search(r'True peak:\s+Peak:\s+(-?[\d.]+|-inf) dBFS', summary).group(1))
    return loud, tp


def write_wav(path, mix):
    """24-bit PCM WAV."""
    ints = np.clip(np.round(mix * 8388607), -8388608, 8388607).astype('<i4')
    data = ints.view(np.uint8).reshape(-1, 4)[:, :3].tobytes()
    head = b''.join([
        b'RIFF', (36 + len(data)).to_bytes(4, 'little'), b'WAVE',
        b'fmt ', (16).to_bytes(4, 'little'), (1).to_bytes(2, 'little'), (2).to_bytes(2, 'little'),
        SR.to_bytes(4, 'little'), (SR * 6).to_bytes(4, 'little'), (6).to_bytes(2, 'little'),
        (24).to_bytes(2, 'little'), b'data', len(data).to_bytes(4, 'little')])
    with open(path, 'wb') as f:
        f.write(head + data)


def mux(src_mp4, wav, dst_mp4, dur):
    """Video stream of `src_mp4` (copied, not re-encoded) + `wav` as AAC -> `dst_mp4`."""
    os.makedirs(os.path.dirname(dst_mp4), exist_ok=True)
    tmp = os.path.join(os.path.dirname(dst_mp4), '.tmp-' + os.path.basename(dst_mp4))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src_mp4, '-i', wav, '-map', '0:v:0', '-map', '1:a:0',
                    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-ar', str(SR), '-shortest',
                    '-movflags', '+faststart', tmp], check=True)
    info = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                                      '-of', 'json', tmp], check=True, capture_output=True).stdout)
    got = float(info['format']['duration'])
    assert abs(got - dur) < 0.06, f'{tmp}: duração {got}'
    os.replace(tmp, dst_mp4)
    print(f'  áudio em {os.path.relpath(dst_mp4)}')


def mux_all(name, wav, dst_dir=OUT):
    """Audio of the 9:16 and 16:9 versions of `name` (video taken from out/)."""
    for fmt in ('9x16', '16x9'):
        src = os.path.join(OUT, f'{VIDEOS[name]["mp4"]}-{fmt}.mp4')
        if not os.path.exists(src):
            print(f'  (sem {os.path.relpath(src)}, renderize o vídeo primeiro)')
            continue
        mux(src, wav, os.path.join(dst_dir, os.path.basename(src)), VIDEOS[name]['dur'])


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    names = args or list(VIDEOS)
    for nm in names:
        assert nm in VIDEOS, f'use: {" | ".join(VIDEOS)}'
        wav = build(nm)
        if '--mux' in sys.argv:
            mux_all(nm, wav)
