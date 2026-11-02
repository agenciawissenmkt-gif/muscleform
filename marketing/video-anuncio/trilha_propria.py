"""Versões dos anúncios com as músicas escolhidas pelo cliente (uma música por vídeo) + efeitos.

As músicas são comerciais e não têm licença para anúncio: os arquivos não vão para o repositório
(que é público) e os vídeos gerados ficam em out/com-musica-propria/ (também fora do git).
Coloque os MP3 em out/musica/proprias/ com estes nomes (ou passe --pasta <dir>):

  indecisao    lose_control.mp3   Teddy Swims, "Lose Control" (The Village Sessions)
               O refrão entra em 11,2 s, junto com "Seu novo visual"; a pausa da banda antes dele
               cai no "Criando seu novo visual". A música termina suave no logo.
  expectativa  norole.mp3         J. Cole, "No Role Modelz", só trechos instrumentais (a letra é
               explícita): introdução até 6 s, a batida com o grave entra quando o app abre.
  coragem      memories.mp3       "memories", acelerada de 77,5 para 80 BPM (sem mudar o tom) para
               casar com os cortes de 0,75 s. "Looking through my memories" entra com as fotos
               dos outros anos (3 s); a linha com palavrão do começo da faixa fica de fora.

Uso:
  python3 marketing/video-anuncio/trilha_propria.py [--pasta DIR] [--mux] [video ...]
"""
import os
import sys

import efeitos
from trilha_eletronica import (
    OUT,
    SR,
    VIDEOS,
    assemble,
    decode,
    fades,
    find_drop,
    master,
    mux,
)

DEST = os.path.join(OUT, 'com-musica-propria')

# drop: a downbeat measured in the original file (seconds) and the video time where it lands;
# segments: (video time, source time in the original file); tempo: time-stretch factor
SONGS = {
    'indecisao': {'file': 'lose_control.mp3', 'tempo': 1.0, 'drop': (40.49, 11.2),
                  'segments': [(0.0, 40.49 - 11.2)], 'fade_in': 0.4, 'fade_out': (20.2, 22.0)},
    'expectativa': {'file': 'norole.mp3', 'tempo': 1.0, 'drop': (144.0, 6.0),
                    'segments': [(0.0, 16.77 - 6.0), (6.0, 144.0)], 'fade_in': 0.05, 'fade_out': (19.2, 21.0)},
    'coragem': {'file': 'memories.mp3', 'tempo': 80 / 77.5, 'drop': (12.48, 3.0),
                'segments': [(0.0, 12.48 - 3.0 * 80 / 77.5)], 'fade_in': 0.3, 'fade_out': (19.4, 21.0)},
}


def build(name, folder):
    s = SONGS[name]
    r = s['tempo']
    x = decode(os.path.join(folder, s['file']), r)
    nominal, at = s['drop']
    drop = find_drop(x, nominal / r, search=0.1)          # time in the (stretched) decoded track
    # segments relative to the drop, in the time of the decoded track
    segs = [(v0, (src - nominal) / r) for v0, src in s['segments']]
    print(f'{name}: {s["file"]}, batida de referência em {drop * r:.3f} s da música -> {at:.2f} s do vídeo')
    n = round(VIDEOS[name]['dur'] * SR)
    music = fades(assemble(x, drop, segs, n), s['fade_in'], s['fade_out'])
    os.makedirs(DEST, exist_ok=True)
    return master(music + efeitos.bus(name, music), os.path.join(DEST, f'trilha-{name}.wav'))


if __name__ == '__main__':
    argv = sys.argv[1:]
    folder = os.path.join(OUT, 'musica', 'proprias')
    if '--pasta' in argv:
        i = argv.index('--pasta')
        folder = argv[i + 1]
        del argv[i:i + 2]
    names = [a for a in argv if not a.startswith('--')] or list(SONGS)
    for nm in names:
        assert nm in SONGS, f'use: {" | ".join(SONGS)}'
        wav = build(nm, folder)
        if '--mux' in argv:
            for fmt in ('9x16', '16x9'):
                src = os.path.join(OUT, f'{VIDEOS[nm]["mp4"]}-{fmt}.mp4')
                mux(src, wav, os.path.join(DEST, os.path.basename(src)), VIDEOS[nm]['dur'])
