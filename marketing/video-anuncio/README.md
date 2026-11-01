# Vídeos de anúncio — Beauty and self

Três anúncios de ~21–22 s do **Beauty and self** (provador virtual de cortes e cores com IA para
salões), cada um sobre uma dor diferente, em 9:16 (Reels, Stories, TikTok, Shorts) e 16:9
(YouTube, tela deitada, TV do salão).

| Vídeo | Dor | Arquivos em `out/` |
| --- | --- | --- |
| 1. **Indecisão** | "Não sei o que eu quero… 😅" | `beauty-and-self-9x16.mp4`, `-16x9.mp4`, `-9x16-sem-audio.mp4`, `-16x9-sem-audio.mp4`, `capa-9x16.jpg`, `capa-16x9.jpg` |
| 2. **Expectativa x Realidade** | "Quero igual a essa! 😍" (foto da internet) | `beauty-and-self-expectativa-9x16.mp4`, `-16x9.mp4`, `-9x16-sem-audio.mp4`, `-16x9-sem-audio.mp4`, `capa-expectativa-*.jpg` |
| 3. **Só as pontinhas** | medo de mudar, anos com o mesmo cabelo | `beauty-and-self-coragem-9x16.mp4`, `-16x9.mp4`, `-9x16-sem-audio.mp4`, `-16x9-sem-audio.mp4`, `capa-coragem-*.jpg` |

H.264 + AAC, 30 fps, áudio em −14 LUFS (padrão de Instagram/YouTube). As mensagens funcionam
também **sem som**: toda a história está escrita na tela.

## Música

- **Vídeo 1:** trilha pop leve, original (`audio.py`).
- **Vídeos 2 e 3:** trilha original no clima soul/gospel (80 BPM, piano elétrico, órgão, palmas,
  coral), composta e sintetizada em `audio_soul.py`. Não copia melodia nem trecho de nenhuma
  música e pode ser usada em anúncio pago.
- **Versões `-sem-audio`:** sem música e sem efeitos (áudio mudo), para colocar a música direto no
  editor do Instagram/TikTok ou na Biblioteca de áudio do YouTube Studio.

> Músicas comerciais (por exemplo, "Lose Control", de Teddy Swims) não podem entrar no arquivo do
> anúncio sem licença: a Meta recusa anúncios com música protegida e o YouTube bloqueia ou
> silencia o vídeo. Em **post orgânico**, se a música aparecer na biblioteca do Instagram para a
> sua conta, dá para adicioná-la por lá sobre a versão `-sem-audio` (Reels → Áudio → pesquise a
> música → escolha o trecho). Contas comerciais costumam ter só a biblioteca livre de direitos, e
> post impulsionado precisa de música livre de direitos.

## Roteiros

### 1. Indecisão (`video.html`, 22 s)

Cliente na cadeira: "Não sei o que eu quero… 😅" → "Corte? Cor? Franja?" → "E se eu me
arrepender?" → "E se ela pudesse ver antes?" → no app: Corte + Cor, Mega Hair Ondulado,
Ruivo Acobreado, "Veja sua beleza" → "Em segundos…" → "Seu novo visual" → "E já manda no
WhatsApp." → mosaico "Ela se diverte… e se encanta com o trabalho do seu salão." → antes/depois
"É esse! 😍", "Ela decide sem medo. Você acerta de primeira." → "Veja antes de mudar."

### 2. Expectativa x Realidade (`video-expectativa.html`, 21 s)

| Tempo | Cena | Texto |
| --- | --- | --- |
| 0–3 s | Conversa: a cliente manda a foto de uma modelo com wolf cut (12,4 mil curtidas) | "Ela chega com uma foto da internet:" · "Quero igual a essa! 😍" |
| 3–6 s | "Expectativa" (a modelo) ao lado de "Realidade?" (a cliente, sem cor, com um "?"), avaliação de 1 estrela | "Mas o rosto é outro…" → "E se não ficar igual?" |
| 6–9 s | A foto vira a câmera do app; na busca ela digita "wolf" e escolhe Wolf Cut | "E se ela visse no rosto dela?" → "Ela pesquisa o corte da foto…" |
| 9–13,4 s | "Criando seu novo visual" → "Seu novo visual" → toque em "Comparar" | "Em segundos…" → "…e vê como fica no rosto dela." |
| 13,4–18 s | Expectativa **=** Realidade; a avaliação vira 5 estrelas: "Ficou perfeito! Igualzinho à foto 😍" | "Agora, expectativa e realidade combinam." → "Menos retrabalho. Mais elogios." |
| 18–21 s | A foto vira o ícone do app | "Beauty and self · Veja antes de cortar." · "Experimente no seu salão" |

### 3. Só as pontinhas (`video-coragem.html`, 21 s)

| Tempo | Cena | Texto |
| --- | --- | --- |
| 0–3 s | A cliente na cadeira | "Toda semana alguém senta e diz:" · "Só as pontinhas, tá? 😬" |
| 3–6 s | Fotos de 2019, 2021, 2023 e "Hoje": sempre o mesmo cabelo; a imagem perde a cor | "Há anos com o mesmo cabelo…" → "…porque tem medo de mudar." |
| 6–9 s | Câmera do app → modo Cor → Loiro Mel → "Veja sua beleza" | "E se ela testasse sem compromisso?" → "Ela testa sem medo…" |
| 9–14,5 s | Resultados em sequência, no ritmo da música: Loiro Mel, Ruivo Acobreado, Rosa Pastel, Vinho e, por fim, Mega Hair Ondulado + Ruivo Acobreado | "Loiro? Ruivo? Rosa? Vinho?" → "…até achar o seu." |
| 14,5–18 s | "Só as pontinhas" é riscado e vira **"Faz tudo! 🔥"**; antes/depois; "Amei! 😍" | "Mais coragem pra ela. Mais serviço pro salão." |
| 18–21 s | Ícone do app | "Beauty and self · Veja antes. Mude sem medo." · "Experimente no seu salão" |

## Como as imagens foram feitas

- **As telas** reproduzem o app atual (branch `claude/busy-dirac-t4yuzf`): Câmera, "O que vamos
  mudar?" (com busca), "Criando seu novo visual" e "Seu novo visual", com as cores, fontes (Nunito +
  Playfair Display), ícones e textos do próprio código.
- **As fotos do catálogo** (a modelo com cada corte e as cores vistas de costas) são as do app,
  copiadas para `assets/catalog/`.
- **A cliente** é a mesma em todos os vídeos: rosto base `scripts/harness/images/chanel-longo.png`,
  cortes vindos dos PNGs de cabelo do repositório e cores aplicadas só na máscara do cabelo
  (`build_looks.py`). São simulações do tipo de resultado que o app entrega.

## Como editar e renderizar de novo

Requisitos: Node 18+ com Playwright (Chromium), Python 3 com numpy + Pillow, ffmpeg.

```bash
# looks da cliente (opcional) e trilhas
python3 marketing/video-anuncio/build_looks.py
python3 marketing/video-anuncio/audio.py                 # vídeo 1 -> out/trilha.wav
python3 marketing/video-anuncio/audio_soul.py expectativa  # vídeo 2 -> out/trilha-expectativa.wav + out/efeitos-expectativa.wav
python3 marketing/video-anuncio/audio_soul.py coragem      # vídeo 3

# vídeo 1
node marketing/video-anuncio/render.mjs --format v --audio marketing/video-anuncio/out/trilha.wav
# vídeos 2 e 3 (troque v por h para 16:9)
node marketing/video-anuncio/render.mjs --page video-expectativa.html --name beauty-and-self-expectativa --format v --audio marketing/video-anuncio/out/trilha-expectativa.wav
node marketing/video-anuncio/render.mjs --page video-coragem.html --name beauty-and-self-coragem --format v --audio marketing/video-anuncio/out/trilha-coragem.wav

# versão sem áudio (troque o nome do arquivo)
ffmpeg -i marketing/video-anuncio/out/beauty-and-self-coragem-9x16.mp4 -f lavfi -i anullsrc=r=48000:cl=stereo \
  -map 0:v -map 1:a -c:v copy -c:a aac -shortest marketing/video-anuncio/out/beauty-and-self-coragem-9x16-sem-audio.mp4

# quadros soltos para revisão
node marketing/video-anuncio/render.mjs --page video-coragem.html --format v --stills 1,10.5,16
```

Os vídeos 2 e 3 usam o motor comum `assets/engine/` (`shared.js` e `shared.css`); a história de
cada um fica no próprio HTML (textos em `setupTexts`, tempos nas listas de quadros-chave). Para
assistir ao vivo no navegador, sirva a pasta com qualquer servidor estático e abra, por exemplo,
`video-coragem.html?play=1` (ou `&format=h`).
