# Vídeo de anúncio — Beauty and self

Anúncio de 22 s do **Beauty and self** (provador virtual de cortes e cores com IA para salões), em
dois formatos:

| Arquivo | Formato | Uso |
| --- | --- | --- |
| `out/beauty-and-self-9x16.mp4` | 1080×1920 (9:16) | Reels, Stories, TikTok, Shorts |
| `out/beauty-and-self-16x9.mp4` | 1920×1080 (16:9) | YouTube, tela deitada, site, TV do salão |
| `out/capa-9x16.jpg` / `out/capa-16x9.jpg` | capas | capa do Reels / miniatura do YouTube |

H.264 + AAC, 30 fps, áudio normalizado em −14 LUFS (padrão de Instagram/YouTube). A mensagem
funciona também **sem som**: toda a história está escrita na tela.

## Roteiro

| Tempo | Cena | Texto na tela |
| --- | --- | --- |
| 0–3 s | **Gancho.** A cliente na cadeira; balão digitando; fotos de referência (a modelo do catálogo) surgem em volta, cada uma com um "?" | "Ela senta na cadeira e diz:" · balão "Não sei o que eu quero… 😅" |
| 3–5,5 s | **Dor.** As opções giram, chips "Corte?", "Cor?", "Franja?"; a imagem perde a cor | "E se eu me arrepender?" |
| 5,5–7 s | **Virada.** A cor volta e a foto vira a câmera do app, com o contorno do rosto; clique | "E se ela pudesse ver antes?" |
| 7–9,5 s | **Escolha.** Tela "O que vamos mudar?": Corte + Cor → Mega Hair Ondulado → Ruivo Acobreado → "Veja sua beleza" | "Centenas de cortes e cores · Corte, cor ou os dois." |
| 9,5–11 s | **IA trabalhando.** Tela roxa "Criando seu novo visual", flor abrindo, barra de progresso | "Em segundos…" |
| 11–13,4 s | **Resultado.** "Seu novo visual": a cliente de mega hair ondulado ruivo; toque em "Enviar (WhatsApp…)" | "…ela se vê de cabelo novo." → "E já manda no WhatsApp." |
| 13,4–15,6 s | **Diversão e vitrine.** Mosaico com os looks dela (cor, corte e os dois juntos); um ganha coração | "Ela se diverte…" → "…e se encanta com o trabalho do seu salão." |
| 15,6–18,5 s | **Decisão.** Antes/depois com divisória deslizando; balão "É esse! 😍" | "Ela decide sem medo. Você acerta de primeira." |
| 18,5–22 s | **Assinatura.** A foto vira o ícone do app (a flor abre) | "Beauty and self · Veja antes de mudar. · Provador virtual de cortes e cores com IA, feito para salões de beleza" · botão "Experimente no seu salão" |

Tom: natural, sem "compre já". A venda fica no encantamento: a cliente se vendo e o salão
acertando de primeira.

## Como as imagens foram feitas

- **As telas** reproduzem o app atual (branch `claude/busy-dirac-t4yuzf`): Câmera, "O que vamos
  mudar?", "Criando seu novo visual" e "Seu novo visual", com as cores, fontes (Nunito + Playfair
  Display), ícones e textos do próprio código.
- **As fotos do catálogo** (a modelo com cada corte e as cores vistas de costas) são as do app
  (`src/assets/model/` daquele branch), copiadas para `assets/catalog/`.
- **A cliente** é a mesma do começo ao fim: rosto base `scripts/harness/images/chanel-longo.png`,
  cortes vindos dos PNGs de cabelo do repositório e cores aplicadas só na máscara do cabelo,
  preservando os fios (`build_looks.py`). São simulações do tipo de resultado que o app entrega.
- **Trilha sonora original**, sintetizada do zero em `audio.py`: sem samples, sem direitos de
  terceiros. Pode ser usada em qualquer anúncio.

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
node marketing/video-anuncio/render.mjs --format v --stills 1,8.3,17.5
```

Textos, tempos e posições ficam em `video.html` (`setupTexts`, `heroRectAt`, `TAPS`, `SCREENS`
e o objeto `LAY` de cada formato). Para assistir à animação ao vivo no navegador, sirva a pasta
com qualquer servidor estático e abra `video.html?play=1` (ou `video.html?play=1&format=h`).
