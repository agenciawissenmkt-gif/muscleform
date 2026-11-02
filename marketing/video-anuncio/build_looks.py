"""Gera os "looks" da cliente usados nos vídeos (o rosto é sempre o dela, só o cabelo muda).

- Cliente: scripts/harness/images/chanel-longo.png (o cabelo real dela é um chanel).
- Cortes novos: fotos reais de cada corte (scripts/harness/images/<corte>.png). A foto do corte
  é alinhada ao rosto da cliente (olhos, nariz, boca e queixo) e recebe o rosto dela com mesclagem
  de Poisson. O cabelo vem inteiro de uma foto, por isso o resultado parece foto e não colagem.
- Cores: só nos fios (máscara = public/hair-assets/<corte>.png), em Lab, mantendo luz, sombra e
  textura dos fios.

Requisitos: numpy, Pillow e opencv-python-headless.
Uso:   python3 marketing/video-anuncio/build_looks.py
Saída: marketing/video-anuncio/assets/looks/<id>.jpg (+ <id>-mask.png para o brilho da revelação)

Os pontos do rosto estão em assets/looks/landmarks.json (MediaPipe Face Landmarker sobre as
fotos de scripts/harness/images).
"""
import json
import os

import cv2
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(HERE, 'assets', 'looks')
with open(os.path.join(OUT, 'landmarks.json')) as _f:
    LANDMARKS = json.load(_f)
BASE = 'chanel-longo'
W = 1024


def load_rgb(name):
    path = os.path.join(ROOT, 'scripts', 'harness', 'images', f'{name}.png')
    return np.asarray(Image.open(path).convert('RGB')).astype(np.float32) / 255.0


def load_hair(name):
    path = os.path.join(ROOT, 'public', 'hair-assets', f'{name}.png')
    return np.asarray(Image.open(path).convert('RGBA'))[..., 3].astype(np.float32) / 255.0


def points(name):
    a = LANDMARKS[name]['align']
    return np.array([a[k] for k in sorted(a)], np.float64)


def oval(name):
    return np.array(LANDMARKS[name]['oval'], np.float64)


def similarity(src, dst):
    """Least-squares rotation + uniform scale + translation (Umeyama) taking src points to dst."""
    ms, md = src.mean(0), dst.mean(0)
    s0, d0 = src - ms, dst - md
    u, sig, vt = np.linalg.svd(d0.T @ s0 / len(src))
    d = np.diag([1.0, np.sign(np.linalg.det(u @ vt))])
    rot = u @ d @ vt
    scale = np.trace(np.diag(sig) @ d) / s0.var(0).sum()
    return np.hstack([scale * rot, (md - scale * rot @ ms)[:, None]])


def apply(m, p):
    return p @ m[:, :2].T + m[:, 2]


# The cut photos are framed tighter at the top than the client photo: once aligned to her face,
# their top rows would be empty. Every look (the client photo included, so they all stay aligned)
# is cropped by this much at the top and sides and scaled back to W x W.
CROP_TOP, CROP_SIDE = 66, 33


def crop(img):
    part = img[CROP_TOP:, CROP_SIDE:W - CROP_SIDE]
    return cv2.resize(np.ascontiguousarray(part), (W, W), interpolation=cv2.INTER_LANCZOS4)


def lab(rgb):
    return cv2.cvtColor(np.ascontiguousarray(rgb, np.float32), cv2.COLOR_RGB2Lab)


def rgb_from_lab(lab_img):
    return np.clip(cv2.cvtColor(np.ascontiguousarray(lab_img, np.float32), cv2.COLOR_Lab2RGB), 0, 1)


def poly_mask(poly):
    m = np.zeros((W, W), np.uint8)
    cv2.fillPoly(m, [np.round(poly).astype(np.int32)], 255)
    return m


def dilate(mask01, px):
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * px + 1, 2 * px + 1))
    return cv2.dilate((mask01 > 0).astype(np.uint8), k) > 0


def build_cut(cut, lift=0.0):
    """Photo of `cut` aligned to the client, with the client's face blended in.

    `lift` moves the face up (px) for looks that are never compared side by side with the client
    photo and whose cut photo has even less room above the head."""
    base, base_hair = load_rgb(BASE), load_hair(BASE)
    face = poly_mask(oval(BASE) - [0, lift])
    if cut == BASE:
        return base, base_hair, face
    base_oval = oval(BASE) - [0, lift]
    if lift:
        up = np.float32([[1, 0, 0], [0, 1, -lift]])
        base = cv2.warpAffine(base, up, (W, W), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)
        base_hair = cv2.warpAffine(base_hair, up, (W, W), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    m = similarity(points(cut), points(BASE) - [0, lift])
    top = apply(m, np.array([[0.0, 0.0], [W - 1.0, 0.0]]))[:, 1].max()
    assert top < CROP_TOP, f'{cut}: top of the photo lands at y={top:.0f}, below the crop'
    tgt = np.clip(cv2.warpAffine(load_rgb(cut), m, (W, W), flags=cv2.INTER_LANCZOS4,
                                 borderMode=cv2.BORDER_REPLICATE), 0, 1)
    hair = np.clip(cv2.warpAffine(load_hair(cut), m, (W, W), flags=cv2.INTER_LINEAR,
                                  borderMode=cv2.BORDER_REPLICATE), 0, 1)
    tgt_oval = apply(m, oval(cut))

    # skin of the cut photo (face, ears, neck) takes the client's skin tone, matched locally with a
    # smooth colour field, so the face blends in without a seam and the before/after split matches
    lt, lb = lab(tgt), lab(base)
    skin_t = ((poly_mask(tgt_oval) > 0) & (hair < 0.05) & (lt[..., 0] > 35)).astype(np.float32)
    skin_b = ((poly_mask(base_oval) > 0) & (base_hair < 0.05) & (lb[..., 0] > 35)).astype(np.float32)
    fb, db = smooth_field(lb, skin_b, 30)
    ft, dt = smooth_field(lt, skin_t, 30)
    both = np.minimum(db, dt)
    diff, _ = smooth_field(fb - ft, np.where(both > 0.05, both, 0).astype(np.float32), 45)
    mt = np.median(lt[skin_t > 0], 0)
    chroma = np.sqrt(((lt[..., 1:] - mt[1:]) ** 2).sum(-1))
    w = np.exp(-((chroma / 14) ** 2)) * np.clip((lt[..., 0] - 25) / 15, 0, 1) * (1 - np.clip(hair * 2, 0, 1))
    w = cv2.GaussianBlur(w.astype(np.float32), (0, 0), 3)
    tgt = rgb_from_lab(lt + w[..., None] * diff)

    # face of the client: face oval (jaw pulled in a little, so the jawline and neck of the photo
    # stay), without any hair of either photo, blended with a soft edge
    c = base_oval.mean(0)
    poly = base_oval.copy()
    low = poly[:, 1] > c[1]
    poly[low] = c + (poly[low] - c) * 0.94
    mask = (poly_mask(poly) > 0) & ~dilate(base_hair > 0.25, 6) & ~dilate(hair > 0.2, 4)
    mask = cv2.erode(mask.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)))
    _, lbl, stats, _ = cv2.connectedComponentsWithStats(mask)
    mask = (lbl == 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))).astype(np.float32)
    soft = cv2.GaussianBlur(mask, (0, 0), 7)[..., None]
    out = base * soft + tgt * (1 - soft)
    a = cv2.GaussianBlur(hair, (0, 0), 0.7)[..., None]
    return out * (1 - a) + tgt * a, hair, face


def smooth_field(img, weight, sigma):
    """Normalized convolution: smooth average of `img` over the pixels where `weight` > 0."""
    num = cv2.GaussianBlur(np.ascontiguousarray(img * weight[..., None], np.float32), (0, 0), sigma)
    den = cv2.GaussianBlur(weight, (0, 0), sigma)
    return num / np.maximum(den, 1e-4)[..., None], den


def hex_lab(h):
    h = h.lstrip('#')
    rgb = np.array([[[int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]]], np.float32)
    return lab(rgb)[0, 0]


# shadow, mid tone and highlight of each colour (photo references of dyed hair)
PROFILES = {
    'cobre': ('#3d1408', '#93401c', '#e08a52'),       # Ruivo Acobreado
    'mel': ('#77562f', '#a8814e', '#ecd39e'),         # Loiro Mel
    'vinho': ('#1c0507', '#561422', '#94394a'),       # Vinho
    'rosa': ('#a77180', '#d59cac', '#f8dde4'),        # Rosa Pastel
    'caramelo': ('#5c3518', '#925f30', '#d9a86e'),    # Caramelo
    'chocolate': ('#1f1108', '#4b2e1c', '#8a6047'),   # Castanho Chocolate
}


def recolor(rgb, hair, face, profile):
    """New colour on the hair only. The lightness of every pixel is remapped through the hair's
    own shadow/mid/highlight range onto the new colour's range (so the strands keep their
    texture and shine), and a bit of the original colour variation is kept. Edge pixels are a mix
    of hair and background: the background behind them is estimated and taken out first, so light
    colours get no bright outline."""
    shadow, mid, high = (hex_lab(h) for h in PROFILES[profile])
    # alpha of the hair. The matte of the hair assets is a little too wide in places and leaves out
    # the loose strands around the head: near its edge, alpha is estimated from the colour instead
    # (how far each pixel goes from the background towards the hair colour). The face is left out.
    a0 = np.clip(hair, 0, 1)
    near = dilate(a0 > 0.05, 12)
    bg, _ = smooth_field(rgb, ((~near) * (1 - a0)).astype(np.float32), 14)
    hc, _ = smooth_field(rgb, (a0 > 0.9).astype(np.float32), 12)
    towards = hc - bg
    a_col = np.clip(((rgb - bg) * towards).sum(-1) / np.maximum((towards ** 2).sum(-1), 1e-4), 0, 1)
    inner = cv2.erode((a0 > 0.5).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))) > 0
    bg_lab = lab(np.clip(bg, 0, 1))
    studio = (bg_lab[..., 0] > 55) & (np.hypot(bg_lab[..., 1], bg_lab[..., 2]) < 7)   # grey backdrop behind
    band = dilate(a0 > 0.05, 28) & ~(face > 0) & studio
    a = np.where(inner, a0, np.where(a0 > 0.05, np.minimum(a0, a_col * 1.1), np.where(band, a_col * 0.9, 0)))
    a = np.where(inner | (a >= 0.08), a, 0).astype(np.float32)
    pure = np.where((a > 0.12)[..., None], (rgb - (1 - a)[..., None] * bg) / np.maximum(a, 1e-3)[..., None], rgb)
    pure = np.clip(pure, 0, 1)

    lab_img = lab(pure)
    lum, ca, cb = lab_img[..., 0], lab_img[..., 1], lab_img[..., 2]
    core = a > 0.7
    p8, p50, p97 = np.percentile(lum[core], [8, 50, 97])
    u = np.interp(lum, [p8, p50, p97], [0.0, 0.5, 1.0])
    u = np.where(lum > p97, 1 + (lum - p97) / max(100 - p97, 1.0) * 0.6, u)
    u = np.where(lum < p8, np.maximum((lum - p8) / max(p8, 1.0) * 0.4, -0.15), u)
    # strands on the outline, seen against the backdrop, are not left darker than the shadows
    u = np.where(~inner & studio, np.maximum(u, 0.3), u)

    def ramp(ch):
        lo, md, hi = shadow[ch], mid[ch], high[ch]
        return np.where(u < 0.5, lo + (md - lo) * (u / 0.5), md + (hi - md) * ((u - 0.5) / 0.5))

    new = rgb_from_lab(np.stack([
        np.clip(ramp(0), 0, 100),
        ramp(1) + (ca - ca[core].mean()) * 0.35,
        ramp(2) + (cb - cb[core].mean()) * 0.35,
    ], -1))
    # original = a * pure + (1 - a) * bg  ->  same mix with the new hair colour
    return np.clip(rgb + a[..., None] * (new - pure), 0, 1)


LOOKS = {
    'natural': (BASE, None),
    'cobre': (BASE, 'cobre'),
    'mel': (BASE, 'mel'),
    'vinho': (BASE, 'vinho'),
    'rosa': (BASE, 'rosa'),
    'chocolate': (BASE, 'chocolate'),
    'ondulado': ('ondulado-longo', None),
    'wolf': ('wolf-cut', None),
    # corte + cor juntos (o Beauty and self faz os dois de uma vez)
    'ondulado-cobre': ('ondulado-longo', 'cobre'),
    'wolf-mel': ('wolf-cut', 'mel'),
    'camadas-caramelo': ('long-layers', 'caramelo'),
}
# Rosto mais alto (px) nos looks que só aparecem sozinhos (a foto do corte tem pouco espaço acima da cabeça).
LIFT = {'long-layers': 45}
# Máscaras de cabelo só para os looks que recebem o brilho da revelação no vídeo.
MASKS = {'natural', 'ondulado-cobre', 'wolf', 'mel', 'cobre', 'rosa', 'vinho'}


def save(img, path, **kw):
    Image.fromarray((np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8)).save(path, **kw)


def main():
    os.makedirs(OUT, exist_ok=True)
    cache = {}
    for look, (cut, color) in LOOKS.items():
        if cut not in cache:
            cache[cut] = build_cut(cut, LIFT.get(cut, 0.0))
        rgb, hair, face = cache[cut]
        img = recolor(rgb, hair, face, color) if color else rgb
        save(crop(img), os.path.join(OUT, f'{look}.jpg'), quality=93)
        if look in MASKS:
            alpha = (np.clip(crop(hair), 0, 1) * 255 + 0.5).astype(np.uint8)
            white = np.full((W, W), 255, np.uint8)
            Image.fromarray(np.dstack([white, white, white, alpha])).resize((512, 512), Image.LANCZOS).save(
                os.path.join(OUT, f'{look}-mask.png'), optimize=True)
        print('look', look)


if __name__ == '__main__':
    main()
