"""Gera os "looks" da cliente usados no vídeo (mesmo rosto, só o cabelo muda).

- Rosto base: scripts/harness/images/chanel-longo.png (o cabelo real dela: chanel).
- Outros cortes: os PNGs transparentes do próprio app (public/hair-assets/*.png),
  posicionados com a mesma matemática do app (largura do rosto + ponto da testa,
  ver src/data/hairAssetManifest.json e LiveTryOnCanvas.tsx).
- Cores: gradient-map sobre a máscara de cabelo, preservando a textura dos fios.

Uso:  python3 marketing/video-anuncio/build_looks.py
Saída: marketing/video-anuncio/assets/looks/<id>.jpg e <id>-mask.png
"""
import json
import os

import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(HERE, 'assets', 'looks')
MANIFEST = json.load(open(os.path.join(ROOT, 'src', 'data', 'hairAssetManifest.json')))
BASE = 'chanel-longo'
W = 1024


def farr(im):
    return np.asarray(im).astype(np.float32) / 255.0


def fimg(a):
    return Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8))


def placed_overlay(hair):
    """Cabelo do app (RGBA) posicionado sobre o rosto base, como o app faz ao vivo."""
    b, h = MANIFEST[BASE], MANIFEST[hair]
    s = b['faceWidth'] / h['faceWidth']
    src = Image.open(os.path.join(ROOT, 'public', 'hair-assets', f'{hair}.png')).convert('RGBA')
    size = round(W * s)
    scaled = src.resize((size, size), Image.LANCZOS)
    ox = round(b['foreheadX'] * W - h['foreheadX'] * W * s)
    oy = round(b['foreheadY'] * W - h['foreheadY'] * W * s)
    canvas = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    canvas.paste(scaled, (ox, oy), scaled)
    return farr(canvas)


def build_cut(hair):
    base = farr(Image.open(os.path.join(ROOT, 'scripts', 'harness', 'images', f'{BASE}.png')).convert('RGB'))
    base_mask = farr(Image.open(os.path.join(ROOT, 'public', 'hair-assets', f'{BASE}.png')).convert('RGBA'))[..., 3]
    if hair == BASE:
        return base, base_mask
    ov = placed_overlay(hair)
    a = ov[..., 3:4]
    return base * (1 - a) + ov[..., :3] * a, np.maximum(base_mask, ov[..., 3])


def lum(c):
    return c[..., 0] * 0.3 + c[..., 1] * 0.59 + c[..., 2] * 0.11


def set_lum(c, l):
    """SetLum do modo de mesclagem 'color' (W3C compositing), o mesmo do app."""
    c = c + (l - lum(c))[..., None]
    L = lum(c)[..., None]
    n = c.min(-1, keepdims=True)
    x = c.max(-1, keepdims=True)
    c = np.where(n < 0, L + (c - L) * L / np.maximum(L - n, 1e-6), c)
    x = c.max(-1, keepdims=True)
    c = np.where(x > 1, L + (c - L) * (1 - L) / np.maximum(x - L, 1e-6), c)
    return np.clip(c, 0, 1)


def hex2rgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32) / 255.0


# Versões fotorrealistas de tons do catálogo do app (src/data/haircolors.ts).
PROFILES = {
    'cobre': dict(mean=0.27, stops=['#2e1309', '#6e3218', '#b05a30', '#e9a272']),      # Loiro Médio Cobre 7.4
    'mel': dict(mean=0.44, stops=['#3f2c1c', '#8a6744', '#c49c6c', '#f0dcb6']),        # Loiro Médio Dourado 7.3
    'vinho': dict(mean=0.12, stops=['#140405', '#460f15', '#772027', '#ad5258']),      # Vinho (Burgundy)
    'rosa': dict(mean=0.56, stops=['#7a4a55', '#c48b99', '#e8b9c5', '#fff1f4']),       # Rosa Pastel
    'caramelo': dict(mean=0.33, stops=['#2e1b10', '#7a4b28', '#b9814a', '#e9c08a']),   # Loiro Escuro Dourado Acobreado 6.34
    'chocolate': dict(mean=0.16, stops=['#1a0f09', '#4a2c1c', '#7a5038', '#b88a66']),  # Castanho Médio Marrom 4.7
}


def recolor(rgb, mask, profile):
    p = PROFILES[profile]
    stops = np.stack([hex2rgb(s) for s in p['stops']])
    Y = lum(rgb)
    hair = mask > 0.6
    core = farr(fimg(mask).filter(ImageFilter.MinFilter(5))) > 0.85
    gamma = float(np.clip(np.log(p['mean']) / np.log(max(float(np.average(Y[hair])), 1e-3)), 0.2, 2.5))
    Lt = np.clip(Y, 1e-4, 1) ** gamma
    blur = farr(fimg(Y).filter(ImageFilter.GaussianBlur(2.5)))
    Lt = np.clip(Lt + np.where(core, Y - blur, 0) * (0.5 + 1.2 * p['mean']), 0, 1)
    lo, hi = np.percentile(Lt[hair], 1.5), np.percentile(Lt[hair], 99.6)
    t = np.clip((Lt - lo) / max(hi - lo, 1e-4), 0, 1)
    seg = np.clip(t * 3, 0, 2.9999)
    i = np.floor(seg).astype(int)
    f = (seg - i)[..., None]
    out = set_lum(stops[i] * (1 - f) + stops[i + 1] * f, Lt)
    a = farr(fimg(mask).filter(ImageFilter.GaussianBlur(0.8)))[..., None]
    return rgb * (1 - a) + out * a


LOOKS = {
    'natural': ('chanel-longo', None),
    'cobre': ('chanel-longo', 'cobre'),
    'mel': ('chanel-longo', 'mel'),
    'vinho': ('chanel-longo', 'vinho'),
    'rosa': ('chanel-longo', 'rosa'),
    'chocolate': ('chanel-longo', 'chocolate'),
    'ondulado': ('ondulado-longo', None),
    # corte + cor juntos (o Beauty and self faz os dois de uma vez)
    'ondulado-cobre': ('ondulado-longo', 'cobre'),
    'wolf-mel': ('wolf-cut', 'mel'),
    'camadas-caramelo': ('long-layers', 'caramelo'),
}
# Máscaras de cabelo só para os looks que recebem o brilho da revelação no vídeo.
MASKS = {'natural', 'ondulado-cobre'}


def main():
    os.makedirs(OUT, exist_ok=True)
    cache = {}
    for look, (cut, color) in LOOKS.items():
        if cut not in cache:
            cache[cut] = build_cut(cut)
        rgb, mask = cache[cut]
        img = recolor(rgb, mask, color) if color else rgb
        fimg(img).save(os.path.join(OUT, f'{look}.jpg'), quality=93)
        if look not in MASKS:
            print('look', look)
            continue
        m = (np.clip(mask, 0, 1) * 255).astype(np.uint8)
        white = np.full((W, W), 255, np.uint8)
        Image.fromarray(np.dstack([white, white, white, m])).resize((512, 512), Image.LANCZOS).save(
            os.path.join(OUT, f'{look}-mask.png'), optimize=True)
        print('look', look)


if __name__ == '__main__':
    main()
