# Vídeos de anúncio — Beauty and self

Três anúncios de ~21–22 s do **Beauty and self** (provador virtual de cortes e cores com IA para
salões), cada um sobre uma dor diferente, em 9:16 (Reels, Stories, TikTok, Shorts) e 16:9
(YouTube, tela deitada, TV do salão).

| Vídeo | Dor | Arquivos em `out/` |
| --- | --- | --- |
| 1. **Indecisão** | "Não sei o que eu quero… 😅" | `beauty-and-self-9x16.mp4`, `-16x9.mp4`, `-9x16-sem-audio.mp4`, `-16x9-sem-audio.mp4`, `capa-9x16.jpg`, `capa-16x9.jpg` |
| 2. **Expectativa x Realidade** | "Quero igual a essa! 😍" (foto da internet) | `beauty-and-self-expectativa-9x16.mp4`, `-16x9.mp4`, `-9x16-sem-audio.mp4`, `-16x9-sem-audio.mp4`, `capa-expectativa-*.jpg` |
| 3. **Só as pontinhas** | medo de mudar, anos com o mesmo cabelo | `beauty-and-self-coragem-9x16.mp4`, `-16x9.mp4`, `-9x16-sem-audio.mp4`, `-16x9-sem-audio.mp4`, `capa-coragem-*.jpg` |

H.264 + AAC, 30 fps, áudio em −14 LUFS com pico abaixo de −1 dBTP (padrão de Instagram/YouTube).
As mensagens funcionam também **sem som**: toda a história está escrita na tela.

Os arquivos de `out/` têm música livre para anúncio pago (Mixkit) + efeitos sonoros. As versões com
as músicas escolhidas pelo cliente ("Lose Control", "No Role Modelz" e "memories") são geradas só
na máquina, em `out/com-musica-propria/`, e **não vão para o repositório**: o repositório é público e
essas músicas não têm licença (ver [Músicas do cliente](#músicas-do-cliente)).

## Música livre (arquivos de `out/`)

Músicas eletrônicas prontas, de produtores profissionais, da biblioteca da
[Mixkit](https://mixkit.co/free-stock-music/tag/fashion/). Cada uma foi cortada no tempo do vídeo:
o drop cai quando o app aparece e a música termina no logo.

| Vídeo | Música | Estilo | Como foi editada |
| --- | --- | --- | --- |
| 1. Indecisão | "Life is a Dream", Michael Ramir C. | nu-disco / house, 120 BPM | introdução abafada durante a dúvida; drop em 7 s (câmera do app); o acorde final da música entra em 19 s, junto com o nome Beauty and self |
| 2. Expectativa x Realidade | "Swish Swed", Arulo | tech house, 120 BPM | subida de 0 a 6 s; drop em 6 s (app); último compasso da música a partir de 18 s, que para em 20 s junto com o botão |
| 3. Só as pontinhas | "Can't Get You Off My Mind", Michael Ramir C. | future bass, acelerada de 150 para 160 BPM sem mudar o tom | silêncio antes do drop em "…porque tem medo de mudar"; drop em 6 s; os looks trocam na batida; os 2 últimos compassos da música no logo |

**Licença:** [Mixkit Stock Music Free License](https://mixkit.co/license/#musicFree). Uso grátis e
sem crédito obrigatório em posts de redes sociais, **anúncios online** (Instagram, Facebook, TikTok)
e YouTube. Não cobre TV aberta, rádio, CD/DVD e games, e a música não pode ser registrada em
Content ID nem distribuída sozinha (por isso os MP3 originais não ficam no repositório). Se o
YouTube mostrar alguma reivindicação, a Mixkit pede para mandar os dados para team@mixkit.co. Para
passar na TV do salão, use a versão `-sem-audio`.

**Versões `-sem-audio`:** áudio mudo, para colocar outra música direto no editor do
Instagram/TikTok ou na Biblioteca de áudio do YouTube Studio.

## Músicas do cliente

Uma música por vídeo, no melhor trecho de cada uma, editada no tempo das cenas
(`trilha_propria.py`):

| Vídeo | Música | Trecho e edição |
| --- | --- | --- |
| 1. Indecisão | "Lose Control" (The Village Sessions), Teddy Swims | fim da estrofe na dúvida; a banda pausa durante "Criando seu novo visual" e o refrão entra em 11,2 s, junto com "Seu novo visual"; termina suave no logo |
| 2. Expectativa x Realidade | "No Role Modelz", J. Cole | **só trechos instrumentais** (a letra é explícita): a introdução da batida até 6 s e a parte com o grave pesado quando o app abre; o resultado, o "=" e o logo caem no compasso |
| 3. Só as pontinhas | "memories" | acelerada de 77,5 para 80 BPM (mesmo tom) para casar com os cortes; "looking through my memories" entra com as fotos de 2019, 2021 e 2023 e a música cresce no "Faz tudo! 🔥"; a frase com palavrão do começo da faixa fica de fora |

> Essas músicas são comerciais. Dentro do arquivo do vídeo, servem para post orgânico por conta e
> risco de quem publica: o Instagram/TikTok pode silenciar o vídeo e a gravadora pode pedir a
> remoção. Em anúncio pago ou post impulsionado, só com licença da gravadora/editora. O caminho
> seguro em post orgânico é usar a versão `-sem-audio` e colocar a música pela biblioteca do
> próprio Instagram/TikTok.

Para gerar: coloque `lose_control.mp3`, `norole.mp3` e `memories.mp3` em `out/musica/proprias/` (ou
use `--pasta`) e rode `python3 marketing/video-anuncio/trilha_propria.py --mux`.

## Efeitos sonoros

Poucos e baixos, sempre numa ação da tela: balão de mensagem, foto do app, toques no celular,
digitação do "wolf", brilho na revelação, troca de cena, risco no "Só as pontinhas" e o brilho do
logo (`efeitos.py`). Cada efeito fica de 6 a 15 dB abaixo do volume da música naquele momento e
nunca passa dos picos dela, então acompanha a música sem cansar. Os sons são da biblioteca de
efeitos da Mixkit ([Sound Effects Free License](https://mixkit.co/license/#sfxFree), vale para
anúncio, TV e redes sociais); como a licença não permite redistribuir os sons soltos, eles são
baixados para `out/musica/efeitos/` (fora do git).

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
- **A cliente** é a mesma em todos os vídeos (`scripts/harness/images/chanel-longo.png`) e os
  resultados parecem foto (`build_looks.py`): cada corte novo vem de uma foto real com aquele corte
  (`scripts/harness/images/`), alinhada pelo rosto (olhos, nariz, boca e queixo) e com o rosto da
  cliente aplicado em cima, com o tom de pele ajustado; o cabelo é o da foto, sem colagem. As cores
  mudam só os fios (máscara de `public/hair-assets/`), mantendo luz, sombra e textura, inclusive dos
  fios soltos. São simulações do tipo de resultado que o app entrega.

## Como editar e renderizar de novo

Requisitos: Node 18+ com Playwright (Chromium), Python 3 com numpy + Pillow (+
opencv-python-headless para os looks), ffmpeg (com rubberband e soxr, como nas versões comuns).

```bash
# looks da cliente (opcional; os pontos do rosto estão em assets/looks/landmarks.json)
python3 marketing/video-anuncio/build_looks.py

# vídeos (troque v por h para 16:9)
node marketing/video-anuncio/render.mjs --format v
node marketing/video-anuncio/render.mjs --page video-expectativa.html --name beauty-and-self-expectativa --format v
node marketing/video-anuncio/render.mjs --page video-coragem.html --name beauty-and-self-coragem --format v

# trilhas: baixa as músicas e os efeitos da Mixkit (out/musica/), corta no tempo de cada vídeo,
# mixa os efeitos, deixa em −14 LUFS (out/trilha-<video>.wav) e troca o áudio dos MP4 de out/
python3 marketing/video-anuncio/trilha_eletronica.py --mux

# versões com as músicas do cliente -> out/com-musica-propria/ (fora do git)
python3 marketing/video-anuncio/trilha_propria.py --mux

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
