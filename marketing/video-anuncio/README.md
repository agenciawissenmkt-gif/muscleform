# Vídeo de anúncio — Your Beauty

Anúncio de ~22 s do Your Beauty (provador virtual de cabelo para salões), em dois formatos:

| Arquivo | Formato | Uso |
| --- | --- | --- |
| `out/your-beauty-9x16.mp4` | 1080×1920 (9:16) | Reels, Stories, TikTok, Shorts |
| `out/your-beauty-16x9.mp4` | 1920×1080 (16:9) | YouTube, tela deitada, site, TV do salão |
| `out/capa-9x16.jpg` / `out/capa-16x9.jpg` | capas | capa do Reels / miniatura do YouTube |

H.264 + AAC, 30 fps, áudio normalizado em −14 LUFS (padrão de Instagram/YouTube). A mensagem
funciona também **sem som**: toda a história está escrita na tela.

## Roteiro

| Tempo | Cena | Texto na tela |
| --- | --- | --- |
| 0–3 s | **Gancho.** A cliente na cadeira; balão digitando; miniaturas dela com outros looks surgem ao redor, cada uma com um "?" | "Ela senta na cadeira e diz:" · balão "Não sei o que eu quero… 😅" |
| 3–5,5 s | **Dor.** As opções giram, chips "Corte?", "Cor?", "Franja?"; a imagem perde a cor | "E se eu me arrepender?" |
| 5,5–7 s | **Virada.** A cor volta, a foto encolhe e vira a câmera do app | "E se ela pudesse ver antes?" |
| 7–13 s | **Solução.** Réplica da tela *Experimentar*: o dedo toca nas cores (Cobre 7.4, Dourado 7.3, Rosa Pastel) e nos cortes (Ondulado Longo, Wolf Cut); o cabelo muda ao vivo | "Ao vivo, na câmera · Só o cabelo muda." → "Ela testa. Compara. Se vê." |
| 13–15,5 s | **Entretenimento + vitrine.** Mosaico com 9–10 looks dela; um ganha coração | "Enquanto espera, ela se diverte…" → "…e se encanta com o trabalho do seu salão." |
| 15,5–18,5 s | **Decisão.** Antes/depois com divisória deslizando; balão "É esse! 😍" | "Ela decide sem medo. Você acerta de primeira." |
| 18,5–22 s | **Assinatura.** A foto vira o logo | "Your Beauty · Veja antes de mudar. · O provador virtual de cabelo do seu salão de beleza" · botão "Experimente no seu salão" |

Tom: natural, sem "compre já". A venda fica no encantamento: a cliente se vendo e o salão
acertando de primeira.

## Como as imagens foram feitas

- **Mesma pessoa do começo ao fim.** O rosto base é `scripts/harness/images/chanel-longo.png`.
  Os outros cortes são os PNGs de cabelo do próprio app (`public/hair-assets/`), encaixados com a
  mesma matemática que o app usa ao vivo (`src/data/hairAssetManifest.json`).
- **Cores** são versões fotorrealistas de tons do catálogo do app, aplicadas só na máscara de
  cabelo, preservando a textura dos fios (`build_looks.py`).
- **Trilha sonora original**, sintetizada do zero em `audio.py`: sem samples, sem direitos de
  terceiros. Pode ser usada em qualquer anúncio.
- **Fontes da marca** (Playfair Display e Plus Jakarta Sans, licença OFL) em `assets/fonts/`.

## Como editar e renderizar de novo

Requisitos: Node 18+ com Playwright (Chromium), Python 3 com numpy + Pillow, ffmpeg.

```bash
# 1) (opcional) regerar os looks da cliente
python3 marketing/video-anuncio/build_looks.py

# 2) regerar a trilha (out/trilha.wav)
python3 marketing/video-anuncio/audio.py

# 3) renderizar os dois formatos
node marketing/video-anuncio/render.mjs --format v --audio marketing/video-anuncio/out/trilha.wav
node marketing/video-anuncio/render.mjs --format h --audio marketing/video-anuncio/out/trilha.wav

# quadros soltos para revisão
node marketing/video-anuncio/render.mjs --format v --stills 1,7.9,17.5
```

Textos, tempos e posições ficam em `video.html` (funções `setupTexts`, `LOOK_CHANGES`, `TAPS`
e o objeto `LAY` de cada formato). Para assistir à animação ao vivo no navegador, sirva a pasta
com qualquer servidor estático e abra `video.html?play=1` (ou `video.html?play=1&format=h`).
