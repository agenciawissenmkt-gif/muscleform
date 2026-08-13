-- Catálogo inicial do ateliê Sonhos de Brincar.
-- Gerado por scripts/gerar-seed.mjs a partir do catálogo original.
-- Rode depois de supabase/schema.sql.

begin;

-- ------------------------------- categorias -------------------------------
insert into public.categorias (slug, nome, subtitulo, descricao, emoji, capa_spec, ordem, ativo) values ('bonecas-de-pano', 'Bonecas de Pano', 'As clássicas do ateliê', 'Bonecas costuradas à mão, com rostinho bordado, cabelo de lã e vestidinho de algodão. As companheiras de toda a vida.', '🎀', '{"tipo":"menina","pele":"#f7ddc9","cabelo":"#c8703f","cabeloSombra":"#a4562c","penteado":"chiquinhas","vestido":"#f9b4c6","vestidoDetalhe":"#fff1f5","acessorio":"laco","acessorioCor":"#e0708f","meias":"#fff1f5","sardas":true,"coracao":"#e0708f"}'::jsonb, 1, true)
on conflict (slug) do update set nome = excluded.nome, subtitulo = excluded.subtitulo, descricao = excluded.descricao, emoji = excluded.emoji, capa_spec = excluded.capa_spec, ordem = excluded.ordem;
insert into public.categorias (slug, nome, subtitulo, descricao, emoji, capa_spec, ordem, ativo) values ('meninos', 'Bonecos de Pano', 'Para os meninos também', 'Bonecos costurados com o mesmo capricho das bonecas: camisa de botão, bermuda, tênis de cadarço e aquele cabelo que ninguém consegue pentear.', '⚓', '{"tipo":"menina","pele":"#f7ddc9","cabelo":"#c65a22","cabeloSombra":"#a04516","penteado":"cacheado","vestido":"#d92a3f","vestidoDetalhe":"#fdf6ec","acessorio":"nenhum","acessorioCor":"#3c5a80","meias":"#fdf6ec","olhos":"abertos","roupa":"conjunto","calca":"#c9cfd6","sapatos":"#3c5a80","sardas":true}'::jsonb, 2, true)
on conflict (slug) do update set nome = excluded.nome, subtitulo = excluded.subtitulo, descricao = excluded.descricao, emoji = excluded.emoji, capa_spec = excluded.capa_spec, ordem = excluded.ordem;
insert into public.categorias (slug, nome, subtitulo, descricao, emoji, capa_spec, ordem, ativo) values ('bailarinas', 'Bailarinas', 'Tutus de tule e pontinhas', 'Bonecas bailarinas com saia de tule, sapatilhas bordadas e fitinhas de cetim. Um giro de sonho na estante.', '🩰', '{"tipo":"bailarina","pele":"#e6bb98","cabelo":"#3f2a20","cabeloSombra":"#2a1a13","penteado":"coque","vestido":"#ffd0dc","vestidoDetalhe":"#fffafb","acessorio":"coroa","acessorioCor":"#f1c27a","meias":"#ffe3ea","coracao":"#f191ab"}'::jsonb, 3, true)
on conflict (slug) do update set nome = excluded.nome, subtitulo = excluded.subtitulo, descricao = excluded.descricao, emoji = excluded.emoji, capa_spec = excluded.capa_spec, ordem = excluded.ordem;
insert into public.categorias (slug, nome, subtitulo, descricao, emoji, capa_spec, ordem, ativo) values ('ursinhos', 'Ursinhos & Bichinhos', 'Abraço garantido', 'Ursinhos, coelhinhas e amigos de pelúcia macia, com laços de cetim e enchimento antialérgico. Feitos para apertar.', '🧸', '{"tipo":"urso","pele":"#c99a6b","cabelo":"#a97a4e","cabeloSombra":"#8a6039","penteado":"curto","vestido":"#ffe3ea","vestidoDetalhe":"#fffafb","acessorio":"laco","acessorioCor":"#f191ab","meias":"#fdf6ec","coracao":"#e0708f"}'::jsonb, 4, true)
on conflict (slug) do update set nome = excluded.nome, subtitulo = excluded.subtitulo, descricao = excluded.descricao, emoji = excluded.emoji, capa_spec = excluded.capa_spec, ordem = excluded.ordem;
insert into public.categorias (slug, nome, subtitulo, descricao, emoji, capa_spec, ordem, ativo) values ('naninhas', 'Naninhas & Enxoval', 'Para o soninho do bebê', 'Naninhas de plush macio, kits maternidade e enxoval do ateliê. O primeiro amigo de pano do bebê.', '🌙', '{"tipo":"naninha","pele":"#f7ddc9","cabelo":"#e8c27a","cabeloSombra":"#c9a25c","penteado":"curto","vestido":"#e2dcf6","vestidoDetalhe":"#fffafb","acessorio":"nenhum","acessorioCor":"#cdeee0","meias":"#fffafb","coracao":"#f191ab"}'::jsonb, 5, true)
on conflict (slug) do update set nome = excluded.nome, subtitulo = excluded.subtitulo, descricao = excluded.descricao, emoji = excluded.emoji, capa_spec = excluded.capa_spec, ordem = excluded.ordem;
insert into public.categorias (slug, nome, subtitulo, descricao, emoji, capa_spec, ordem, ativo) values ('decoracao', 'Decoração & Lembrancinhas', 'Detalhes que encantam', 'Móbiles, bonequinhas de porta-maternidade, mini bonecas de lembrancinha e enfeites para o quartinho.', '🏡', '{"tipo":"bebe","pele":"#e6bb98","cabelo":"#b5651d","cabeloSombra":"#8f4d13","penteado":"curto","vestido":"#fdf6ec","vestidoDetalhe":"#f9b4c6","acessorio":"flor","acessorioCor":"#f191ab","meias":"#fff1f5","coracao":"#f191ab"}'::jsonb, 6, true)
on conflict (slug) do update set nome = excluded.nome, subtitulo = excluded.subtitulo, descricao = excluded.descricao, emoji = excluded.emoji, capa_spec = excluded.capa_spec, ordem = excluded.ordem;

-- -------------------------------- produtos --------------------------------
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'boneca-lia-dos-lacos', 'Boneca Lia dos Laços', 'bonecas-de-pano', 259.9, null,
  'Maria-chiquinha de lã trigo, laços pink e saia rosa de poá com renda.', 'A Lia é a dona do quarto. Senta no tapete redondo, arruma os ursinhos em fila e diz que a brincadeira só começa quando todo mundo estiver bem sentado. Os cabelos são de lã cor de trigo, presos em duas chiquinhas fartas com laços pink que ela não deixa ninguém tirar. O corpete é de florzinhas miúdas, a saia é rosa de poá com barrado de renda, e nas bochechas tem dois coraçõezinhos bordados — foi a nossa forma de dizer que ela já veio amada de casa.', null,
  '/produtos/lia-dos-lacos.webp', null, 'Lia no quartinho rosa, entre os ursinhos', '45 cm',
  ARRAY['Tecido 100% algodão antialérgico, pré-lavado e hipoalergênico', 'Enchimento de fibra siliconada antialérgica, atóxica e sem cheiro', 'Cabelo de fio de lã costurado fio a fio — não solta pelinho nem fiapo', 'Rostinho todo bordado à mão: sem olhos de plástico, botões ou peças que soltem', 'Costura dupla reforçada — não rasga no puxão nem no abraço apertado']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['chiquinha', 'laços', 'rosa', 'quartinho']::text[],
  true, true, true, '{"tipo":"menina","pele":"#8d5a3c","cabelo":"#e2c391","cabeloSombra":"#c2a071","penteado":"chiquinhas","vestido":"#f7c8d6","vestidoDetalhe":"#fffafb","acessorio":"laco","acessorioCor":"#e0507f","meias":"#fffafb","olhos":"abertos","sapatos":"#f3b7c8"}'::jsonb, 1, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'boneca-chapeuzinho-vermelho', 'Boneca Chapeuzinho Vermelho', 'bonecas-de-pano', 289.9, null,
  'Capinha vermelha de veludo com capuz, avental de renda e cestinha.', 'Todo mundo conhece a história, mas ninguém conta a melhor parte: a Chapeuzinho nunca teve medo. Ela arruma a cestinha, amarra a fita da capa no pescoço e atravessa a floresta cantando, porque sabe que a casa da vovó fica logo depois da curva. A capinha é de veludo vermelho, com capuz de verdade que sobe e desce; por baixo, o vestido é de xadrez vichy e o avental tem barrado de renda inglesa. As tranças são de lã castanha e as bochechas têm dois coraçõezinhos bordados. É a boneca de quem gosta de história antes de dormir — e de quem sempre torceu para o lobo perder.', null,
  '/produtos/chapeuzinho-vermelho.webp', null, 'Chapeuzinho a caminho da casa da vovó', '46 cm',
  ARRAY['Tecido 100% algodão antialérgico, pré-lavado e hipoalergênico', 'Enchimento de fibra siliconada antialérgica, atóxica e sem cheiro', 'Cabelo de fio de lã costurado fio a fio — não solta pelinho nem fiapo', 'Rostinho todo bordado à mão: sem olhos de plástico, botões ou peças que soltem', 'Costura dupla reforçada — não rasga no puxão nem no abraço apertado', 'Capinha de veludo com capuz que veste e tira', 'Avental com barrado de renda inglesa']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['conto de fadas', 'chapeuzinho', 'clássico', 'presente']::text[],
  true, true, false, '{"tipo":"menina","pele":"#f7ddc9","cabelo":"#8a5a34","cabeloSombra":"#6b431f","penteado":"chiquinhas","vestido":"#fffafb","vestidoDetalhe":"#d92a3f","acessorio":"nenhum","acessorioCor":"#d92a3f","meias":"#fffafb","olhos":"abertos","sapatos":"#c0392b","capa":"#d92a3f"}'::jsonb, 2, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'ursinha-flor-de-algodao', 'Ursinha Flor de Algodão', 'ursinhos', 199.9, null,
  'Ursinha branca de plush macio, laço florido e vestidinho de flores.', 'A Flor de Algodão vive dormindo. É acordar, tomar café, e ela já está de olhinhos fechados de novo, encostada na estrela de pano. O plush dela é branco e bem macio, do tipo que a criança encosta o rosto e não larga mais; o laço enorme e o vestidinho são do mesmo tecido de florzinhas, feitos do mesmo retalho no mesmo dia. Os olhinhos e o narizinho são bordados à mão, com aquela carinha de soneca boa. É a companheira certa para a hora de dormir — chega leve, cheirando a tecido novo, pronta para o primeiro abraço.', null,
  '/produtos/ursinha-flor-de-algodao.webp', null, 'Flor de Algodão cochilando entre as mantinhas', '38 cm',
  ARRAY['Plush branco antialérgico, extramacio', 'Enchimento de fibra siliconada atóxica e sem cheiro', 'Vestidinho e laço de algodão floral', 'Olhinhos, focinho e boca bordados à mão — sem peças que soltem', 'Costura dupla reforçada — não rasga no puxão']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['ursinha', 'soninho', 'branco', 'bebê']::text[],
  true, true, false, '{"tipo":"urso","pele":"#fbf6f0","cabelo":"#f3ece2","cabeloSombra":"#ddd2c4","penteado":"curto","vestido":"#f7e7d3","vestidoDetalhe":"#e8a87c","acessorio":"laco","acessorioCor":"#e8b48c","meias":"#fffafb","sapatos":"#f3ece2"}'::jsonb, 3, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'boneco-theo-do-mar', 'Boneco Theo do Mar', 'meninos', 239.9, null,
  'Cachinhos ruivos, camisa florida vermelha e bermuda xadrez de verão.', 'O Theo acorda antes de todo mundo. Enquanto a casa dorme, ele já está de camisa florida vestida meio torta, contando as ondas da janela. Diz que quando crescer vai morar onde a placa aponta "SURF", e que leva junto quem quiser. Os cachinhos dele são de lã encaracolada, feitos anel por anel — por isso ficam despenteados de um jeito que parece que ele acabou de sair da água. A camisa tem botões de verdade e abre; a bermuda é de xadrez levinho, dessas de tarde quente. Quem ganha o Theo ganha um menino que não tem medo de nada e volta sempre para casa antes do jantar.', null,
  '/produtos/theo-do-mar.webp', '/produtos/estudio/theo-do-mar.webp', 'Theo na praia, entre a prancha e a kombi', '42 cm',
  ARRAY['Tecido 100% algodão antialérgico, pré-lavado e hipoalergênico', 'Enchimento de fibra siliconada antialérgica, atóxica e sem cheiro', 'Cabelo de fio de lã costurado fio a fio — não solta pelinho nem fiapo', 'Rostinho todo bordado à mão: sem olhos de plástico, botões ou peças que soltem', 'Costura dupla reforçada — não rasga no puxão nem no abraço apertado']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['menino', 'praia', 'verão', 'ruivo']::text[],
  true, true, false, '{"tipo":"menina","pele":"#f7ddc9","cabelo":"#c65a22","cabeloSombra":"#a04516","penteado":"cacheado","vestido":"#d92a3f","vestidoDetalhe":"#fdf6ec","acessorio":"nenhum","acessorioCor":"#3c5a80","meias":"#fdf6ec","olhos":"abertos","roupa":"conjunto","calca":"#c9cfd6","sapatos":"#3c5a80","sardas":true}'::jsonb, 4, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'boneca-maite-girassol', 'Boneca Maitê Girassol', 'bonecas-de-pano', 249.9, null,
  'Cabelo crespo volumoso, blusa amarela de renda e saia de girassóis.', 'A Maitê tem o cabelo que a avó dela sempre quis: crespo, cheio, do tamanho de um abraço. Cada cachinho é feito à mão, um por um, e por isso a cabecinha dela leva um dia inteiro de trabalho. A saia é de girassol porque a Maitê acha que flor que segue o sol é flor corajosa. A blusinha amarela tem renda e botõezinhos verdes costurados um a um, e o laço do cabelo combina de propósito. Ela foi feita para uma menina se olhar e se reconhecer — e isso, para a gente, é a parte mais bonita do ofício.', null,
  '/produtos/maite-girassol.webp', null, 'Maitê no campo de girassóis', '45 cm',
  ARRAY['Tecido 100% algodão antialérgico, pré-lavado e hipoalergênico', 'Enchimento de fibra siliconada antialérgica, atóxica e sem cheiro', 'Cabelo de fio de lã costurado fio a fio — não solta pelinho nem fiapo', 'Rostinho todo bordado à mão: sem olhos de plástico, botões ou peças que soltem', 'Costura dupla reforçada — não rasga no puxão nem no abraço apertado']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['crespo', 'girassol', 'representatividade']::text[],
  true, true, true, '{"tipo":"menina","pele":"#8d5a3c","cabelo":"#1c1210","cabeloSombra":"#0e0806","penteado":"cacheado","vestido":"#f2c94c","vestidoDetalhe":"#fff6d6","acessorio":"laco","acessorioCor":"#e0c06a","meias":"#fff6d6","olhos":"abertos","sapatos":"#e8b93a"}'::jsonb, 5, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'boneca-marieta-das-cerejas', 'Boneca Marieta das Cerejas', 'bonecas-de-pano', 229.9, null,
  'Tranças ruivas de lã, vestido listrado e bolso com duas cerejinhas.', 'Todo fim de tarde a Marieta pega a cestinha e sobe na escada do pomar. Ela escolhe as cerejas uma por uma, e sempre guarda as duas mais bonitas no bolso do vestido — foi por isso que a gente costurou as cerejinhas ali, de feltro, para elas não caírem nunca. As tranças são de lã grossa, trançadas à mão e amarradas com fitinha. A gola verde tem folhinhas aplicadas e o vestido é listrado como toalha de piquenique. É a boneca de quem gosta de casa de vó, de doce no fogão e de tarde que não acaba.', null,
  '/produtos/marieta-cerejas.webp', null, 'Marieta colhendo cerejas no pomar', '42 cm',
  ARRAY['Tecido 100% algodão antialérgico, pré-lavado e hipoalergênico', 'Enchimento de fibra siliconada antialérgica, atóxica e sem cheiro', 'Cabelo de fio de lã costurado fio a fio — não solta pelinho nem fiapo', 'Rostinho todo bordado à mão: sem olhos de plástico, botões ou peças que soltem', 'Costura dupla reforçada — não rasga no puxão nem no abraço apertado']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['tranças', 'ruiva', 'campo', 'cerejas']::text[],
  true, true, false, '{"tipo":"menina","pele":"#f7ddc9","cabelo":"#d2521a","cabeloSombra":"#a83c10","penteado":"trancas","vestido":"#c98d6b","vestidoDetalhe":"#2f7d44","acessorio":"flor","acessorioCor":"#2f7d44","meias":"#fdf6ec","coracao":"#c62828","olhos":"abertos","sapatos":"#e8dcc0","sardas":true}'::jsonb, 6, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'boneco-bento-do-quartinho', 'Boneco Bento do Quartinho', 'meninos', 234.9, null,
  'Conjunto de veludo azul, bolso listrado e tênis de cadarço.', 'O Bento é o dono do quarto de brincar. Ele levanta o aviãozinho de madeira acima da cabeça, faz barulho de motor com a boca e sai correndo pelo tapete, e todo mundo — o urso, o coelho, o time de blocos — vira passageiro. O conjuntinho dele é de veludo cotelê azul, quentinho, com um bolso de listras na frente para guardar tesouro. O cabelo é de lã em anéis, ruivo, do tipo que fica em pé sozinho. Foi feito para o menino que inventa história antes de dormir e acorda no meio dela.', null,
  '/produtos/bento-quartinho.webp', '/produtos/estudio/bento-quartinho.webp', 'Bento e o aviãozinho de madeira', '42 cm',
  ARRAY['Tecido 100% algodão antialérgico, pré-lavado e hipoalergênico', 'Enchimento de fibra siliconada antialérgica, atóxica e sem cheiro', 'Cabelo de fio de lã costurado fio a fio — não solta pelinho nem fiapo', 'Rostinho todo bordado à mão: sem olhos de plástico, botões ou peças que soltem', 'Costura dupla reforçada — não rasga no puxão nem no abraço apertado']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['menino', 'quartinho', 'veludo', 'ruivo']::text[],
  true, true, false, '{"tipo":"menina","pele":"#f7ddc9","cabelo":"#c65a22","cabeloSombra":"#9c4213","penteado":"cacheado","vestido":"#7fb4e0","vestidoDetalhe":"#dbe7f0","acessorio":"nenhum","acessorioCor":"#5b7fa6","meias":"#fdf6ec","olhos":"abertos","roupa":"conjunto","calca":"#7fb4e0","sapatos":"#8ba3bd"}'::jsonb, 7, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'boneca-manon-de-paris', 'Boneca Manon de Paris', 'bonecas-de-pano', 279.9, null,
  'Casaquinho rosa de lã, boina com pompom e tranças ruivas compridas.', 'A Manon toma chocolate quente sentada na mesinha da calçada e fica olhando a torre lá longe, como quem já viu aquilo mil vezes e ainda acha bonito. O casaquinho dela é de lã rosa, com golinha florida, bolsos de verdade e botões que abrem. A boina tem pompom e fica sempre um pouquinho torta — a gente tentou endireitar, ela não deixou. As tranças ruivas são longas, feitas de lã macia, e vão até a cintura. É a boneca das meninas que gostam de café da manhã demorado e de história contada devagar.', null,
  '/produtos/manon-paris.webp', '/produtos/estudio/manon-paris.webp', 'Manon na calçada do café, em Paris', '44 cm',
  ARRAY['Tecido 100% algodão antialérgico, pré-lavado e hipoalergênico', 'Enchimento de fibra siliconada antialérgica, atóxica e sem cheiro', 'Cabelo de fio de lã costurado fio a fio — não solta pelinho nem fiapo', 'Rostinho todo bordado à mão: sem olhos de plástico, botões ou peças que soltem', 'Costura dupla reforçada — não rasga no puxão nem no abraço apertado']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['paris', 'casaco', 'inverno', 'tranças']::text[],
  true, true, true, '{"tipo":"menina","pele":"#f7ddc9","cabelo":"#d2521a","cabeloSombra":"#a83c10","penteado":"trancas","vestido":"#f7cdd6","vestidoDetalhe":"#fffafb","acessorio":"boina","acessorioCor":"#f7cdd6","meias":"#fffafb","olhos":"abertos","sapatos":"#f2d6dd","sardas":true}'::jsonb, 8, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'boneca-manuela', 'Boneca Manuela', 'bonecas-de-pano', 189.9, 219.9,
  'Vestido rosa de bolinhas, maria-chiquinha ruiva e sardinhas bordadas.', 'A Manuela nasceu numa tarde de chuva no ateliê. O vestidinho de bolinhas foi cortado de um tecido guardado havia anos, esperando a boneca certa. As sardinhas são bordadas uma a uma, e por isso nenhuma Manuela é igual à outra.', null,
  null, null, null, '38 cm',
  ARRAY['Tecido 100% algodão antialérgico, pré-lavado e hipoalergênico', 'Enchimento de fibra siliconada antialérgica, atóxica e sem cheiro', 'Cabelo de fio de lã costurado fio a fio — não solta pelinho nem fiapo', 'Rostinho todo bordado à mão: sem olhos de plástico, botões ou peças que soltem', 'Costura dupla reforçada — não rasga no puxão nem no abraço apertado']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['clássica', 'presente', 'menina']::text[],
  true, false, true, '{"tipo":"menina","pele":"#f7ddc9","cabelo":"#c8703f","cabeloSombra":"#a4562c","penteado":"chiquinhas","vestido":"#f9b4c6","vestidoDetalhe":"#fff1f5","acessorio":"laco","acessorioCor":"#e0708f","meias":"#fff1f5","coracao":"#e0708f","sardas":true}'::jsonb, 9, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'boneca-alice', 'Boneca Alice', 'bonecas-de-pano', 179.9, null,
  'Tranças loiras, avental de linho e um coraçãozinho no peito.', 'A Alice é a boneca do café da tarde: avental de linho, tranças bem feitas e um coração costurado à mão no lado esquerdo, onde ficam as coisas importantes.', null,
  null, null, null, '36 cm',
  ARRAY['Tecido 100% algodão antialérgico, pré-lavado e hipoalergênico', 'Enchimento de fibra siliconada antialérgica, atóxica e sem cheiro', 'Cabelo de fio de lã costurado fio a fio — não solta pelinho nem fiapo', 'Rostinho todo bordado à mão: sem olhos de plástico, botões ou peças que soltem', 'Costura dupla reforçada — não rasga no puxão nem no abraço apertado']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['tranças', 'vintage']::text[],
  true, false, false, '{"tipo":"menina","pele":"#f7ddc9","cabelo":"#e8c27a","cabeloSombra":"#c9a25c","penteado":"trancas","vestido":"#fdf6ec","vestidoDetalhe":"#f9b4c6","acessorio":"flor","acessorioCor":"#f191ab","meias":"#fff1f5","coracao":"#e0708f"}'::jsonb, 10, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'boneca-cecilia', 'Boneca Cecília', 'bonecas-de-pano', 199.9, null,
  'Cachinhos pretos, vestido verde-menta e tiara de flores.', 'Os cachinhos da Cecília levam quase duas horas para ficarem no ponto: fio por fio, enrolado e costurado. O verde-menta do vestido veio de um retalho de camisa antiga — dessas que a gente não tem coragem de jogar fora.', null,
  null, null, null, '38 cm',
  ARRAY['Tecido 100% algodão antialérgico, pré-lavado e hipoalergênico', 'Enchimento de fibra siliconada antialérgica, atóxica e sem cheiro', 'Cabelo de fio de lã costurado fio a fio — não solta pelinho nem fiapo', 'Rostinho todo bordado à mão: sem olhos de plástico, botões ou peças que soltem', 'Costura dupla reforçada — não rasga no puxão nem no abraço apertado']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['cacheada', 'flores']::text[],
  false, true, false, '{"tipo":"menina","pele":"#8d5a3c","cabelo":"#2b1a12","cabeloSombra":"#160c08","penteado":"cacheado","vestido":"#cdeee0","vestidoDetalhe":"#fffafb","acessorio":"tiara","acessorioCor":"#f191ab","meias":"#fff1f5","coracao":"#e0708f"}'::jsonb, 11, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'boneca-helena', 'Boneca Helena', 'bonecas-de-pano', 209.9, null,
  'Cabelo castanho longo, vestido lavanda e laço de cetim.', 'A Helena é a mais sonhadora do ateliê. O lavanda do vestido foi escolhido para combinar com o fim de tarde, e o laço de cetim é amarrado sempre por último, como quem dá um beijo de boa noite.', null,
  null, null, null, '40 cm',
  ARRAY['Tecido 100% algodão antialérgico, pré-lavado e hipoalergênico', 'Enchimento de fibra siliconada antialérgica, atóxica e sem cheiro', 'Cabelo de fio de lã costurado fio a fio — não solta pelinho nem fiapo', 'Rostinho todo bordado à mão: sem olhos de plástico, botões ou peças que soltem', 'Costura dupla reforçada — não rasga no puxão nem no abraço apertado']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['lavanda', 'romântica']::text[],
  false, false, false, '{"tipo":"menina","pele":"#e6bb98","cabelo":"#5a3a26","cabeloSombra":"#3e2718","penteado":"longo","vestido":"#e2dcf6","vestidoDetalhe":"#fffafb","acessorio":"laco","acessorioCor":"#b9a7ea","meias":"#fff1f5","coracao":"#e0708f"}'::jsonb, 12, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'boneca-antonella', 'Boneca Antonella', 'bonecas-de-pano', 169.9, null,
  'Chapeuzinho de palha, vestido creme e bochechas rosadas.', 'A Antonella é a boneca do jardim: chapeuzinho de palha para o sol, vestido creme leve e bochechas coradas de tanto brincar do lado de fora.', null,
  null, null, null, '34 cm',
  ARRAY['Tecido 100% algodão antialérgico, pré-lavado e hipoalergênico', 'Enchimento de fibra siliconada antialérgica, atóxica e sem cheiro', 'Cabelo de fio de lã costurado fio a fio — não solta pelinho nem fiapo', 'Rostinho todo bordado à mão: sem olhos de plástico, botões ou peças que soltem', 'Costura dupla reforçada — não rasga no puxão nem no abraço apertado']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['campo', 'chapéu']::text[],
  false, false, false, '{"tipo":"menina","pele":"#e6bb98","cabelo":"#8a5a34","cabeloSombra":"#6b431f","penteado":"chiquinhas","vestido":"#fdf6ec","vestidoDetalhe":"#cdeee0","acessorio":"chapeu","acessorioCor":"#e6c98a","meias":"#fff1f5","coracao":"#e0708f","sardas":true}'::jsonb, 13, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'boneca-maria-flor', 'Boneca Maria Flor', 'bonecas-de-pano', 194.9, null,
  'Coque alto, vestido rosa antigo e florzinha na lapela.', 'Maria Flor tem o nome das duas avós. O coque alto é preso com um fio invisível e a florzinha da lapela é bordada com linha de seda.', null,
  null, null, null, '37 cm',
  ARRAY['Tecido 100% algodão antialérgico, pré-lavado e hipoalergênico', 'Enchimento de fibra siliconada antialérgica, atóxica e sem cheiro', 'Cabelo de fio de lã costurado fio a fio — não solta pelinho nem fiapo', 'Rostinho todo bordado à mão: sem olhos de plástico, botões ou peças que soltem', 'Costura dupla reforçada — não rasga no puxão nem no abraço apertado']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['coque', 'delicada']::text[],
  true, false, false, '{"tipo":"menina","pele":"#f7ddc9","cabelo":"#3f2a20","cabeloSombra":"#291a12","penteado":"coque","vestido":"#ffd0dc","vestidoDetalhe":"#fdf6ec","acessorio":"flor","acessorioCor":"#e0708f","meias":"#fff1f5","coracao":"#e0708f"}'::jsonb, 14, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'bailarina-aurora', 'Bailarina Aurora', 'bailarinas', 229.9, null,
  'Tutu de tule rosé em três camadas e coroa dourada.', 'A Aurora estreia todo dia às sete da noite, na estante do quarto. O tutu tem três camadas de tule costuradas em franzido manual, e a coroa é bordada com fio metalizado.', null,
  null, null, null, '40 cm',
  ARRAY['Tecido 100% algodão antialérgico, pré-lavado e hipoalergênico', 'Enchimento de fibra siliconada antialérgica, atóxica e sem cheiro', 'Cabelo de fio de lã costurado fio a fio — não solta pelinho nem fiapo', 'Rostinho todo bordado à mão: sem olhos de plástico, botões ou peças que soltem', 'Costura dupla reforçada — não rasga no puxão nem no abraço apertado', 'Tule francês em três camadas', 'Fitas de cetim']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['tutu', 'balé', 'coroa']::text[],
  true, false, true, '{"tipo":"bailarina","pele":"#e6bb98","cabelo":"#3f2a20","cabeloSombra":"#2a1a13","penteado":"coque","vestido":"#ffd0dc","vestidoDetalhe":"#fffafb","acessorio":"coroa","acessorioCor":"#f1c27a","meias":"#ffe3ea","coracao":"#e0708f"}'::jsonb, 15, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'bailarina-giselle', 'Bailarina Giselle', 'bailarinas', 239.9, null,
  'Tutu branco, sapatilhas de fita e coque com tiara de pérolas.', 'A Giselle é a bailarina do primeiro ato: tutu branco, sapatilhas com fitas que sobem pela perninha e uma tiara de pérolas costurada à mão.', null,
  null, null, null, '41 cm',
  ARRAY['Tecido 100% algodão antialérgico, pré-lavado e hipoalergênico', 'Enchimento de fibra siliconada antialérgica, atóxica e sem cheiro', 'Cabelo de fio de lã costurado fio a fio — não solta pelinho nem fiapo', 'Rostinho todo bordado à mão: sem olhos de plástico, botões ou peças que soltem', 'Costura dupla reforçada — não rasga no puxão nem no abraço apertado', 'Tule branco duplo', 'Pérolas costuradas à mão']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['clássico', 'branco']::text[],
  false, true, false, '{"tipo":"bailarina","pele":"#f7ddc9","cabelo":"#e8c27a","cabeloSombra":"#c9a25c","penteado":"coque","vestido":"#fffafb","vestidoDetalhe":"#ffe3ea","acessorio":"tiara","acessorioCor":"#f7e9d7","meias":"#fffafb","coracao":"#e0708f"}'::jsonb, 16, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'bailarina-serena', 'Bailarina Serena', 'bailarinas', 249.9, null,
  'Tutu lavanda, cachinhos e sapatilhas rosa-claro.', 'A Serena dança sem pressa. O lavanda do tutu foi tingido no próprio ateliê para chegar no tom exato do céu antes de escurecer.', null,
  null, null, null, '40 cm',
  ARRAY['Tecido 100% algodão antialérgico, pré-lavado e hipoalergênico', 'Enchimento de fibra siliconada antialérgica, atóxica e sem cheiro', 'Cabelo de fio de lã costurado fio a fio — não solta pelinho nem fiapo', 'Rostinho todo bordado à mão: sem olhos de plástico, botões ou peças que soltem', 'Costura dupla reforçada — não rasga no puxão nem no abraço apertado', 'Tule tingido artesanalmente']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['lavanda', 'cacheada']::text[],
  false, false, false, '{"tipo":"bailarina","pele":"#c58f68","cabelo":"#2b1a12","cabeloSombra":"#170d08","penteado":"cacheado","vestido":"#e2dcf6","vestidoDetalhe":"#fffafb","acessorio":"flor","acessorioCor":"#b9a7ea","meias":"#ffe3ea","coracao":"#e0708f"}'::jsonb, 17, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'bailarina-mel', 'Bailarina Mel', 'bailarinas', 219.9, null,
  'Tutu pêssego, tranças e laço grande nas costas.', 'A Mel é a bailarina do recreio: tranças que voam no giro e um laço enorme amarrado nas costas, do jeito que criança gosta.', null,
  null, null, null, '38 cm',
  ARRAY['Tecido 100% algodão antialérgico, pré-lavado e hipoalergênico', 'Enchimento de fibra siliconada antialérgica, atóxica e sem cheiro', 'Cabelo de fio de lã costurado fio a fio — não solta pelinho nem fiapo', 'Rostinho todo bordado à mão: sem olhos de plástico, botões ou peças que soltem', 'Costura dupla reforçada — não rasga no puxão nem no abraço apertado', 'Tule pêssego', 'Laço de cetim 4 cm']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['tranças', 'pêssego']::text[],
  false, false, false, '{"tipo":"bailarina","pele":"#f7ddc9","cabelo":"#c8703f","cabeloSombra":"#a4562c","penteado":"trancas","vestido":"#ffe0cf","vestidoDetalhe":"#fffafb","acessorio":"laco","acessorioCor":"#f9b4c6","meias":"#fff1f5","coracao":"#e0708f","sardas":true}'::jsonb, 18, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'ursinho-teodoro', 'Ursinho Teodoro', 'ursinhos', 149.9, null,
  'Urso de plush caramelo com laço rosa e patinhas bordadas.', 'O Teodoro é o primeiro amigo de muita gente. Plush caramelo bem macio, laço de cetim rosa e as patinhas bordadas em ponto atrás.', null,
  null, null, null, '30 cm',
  ARRAY['Plush antialérgico', 'Enchimento de fibra siliconada', 'Laço de cetim', 'Olhinhos bordados (seguro para bebês)']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['urso', 'bebê', 'abraço']::text[],
  true, false, false, '{"tipo":"urso","pele":"#c99a6b","cabelo":"#a97a4e","cabeloSombra":"#8a6039","penteado":"curto","vestido":"#ffe3ea","vestidoDetalhe":"#fffafb","acessorio":"laco","acessorioCor":"#f191ab","meias":"#fff1f5","coracao":"#e0708f"}'::jsonb, 19, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'ursinha-lili', 'Ursinha Lili', 'ursinhos', 159.9, null,
  'Ursinha rosa-claro com vestidinho de bolinhas e tiara.', 'A Lili é a irmã caçula do Teodoro. Veste um vestidinho de bolinhas que sai e entra — porque toda ursinha gosta de trocar de roupa.', null,
  null, null, null, '30 cm',
  ARRAY['Plush antialérgico', 'Vestido removível de algodão', 'Enchimento siliconado']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['ursinha', 'rosa']::text[],
  false, false, true, '{"tipo":"urso","pele":"#f2c9d3","cabelo":"#e3a9b8","cabeloSombra":"#c98c9c","penteado":"curto","vestido":"#f9b4c6","vestidoDetalhe":"#fffafb","acessorio":"tiara","acessorioCor":"#e0708f","meias":"#fff1f5","coracao":"#e0708f"}'::jsonb, 20, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'coelha-nina', 'Coelha Nina', 'ursinhos', 164.9, null,
  'Coelhinha de orelhas compridas com vestido menta.', 'As orelhas da Nina têm arame flexível por dentro: dá para deixar em pé, caídas ou dobradinhas para dormir.', null,
  null, null, null, '34 cm (com as orelhas)',
  ARRAY['Plush marfim', 'Orelhas moldáveis', 'Vestido de algodão', 'Enchimento siliconado']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['coelha', 'menta']::text[],
  false, true, false, '{"tipo":"coelha","pele":"#f6ecdf","cabelo":"#e8dccb","cabeloSombra":"#cdbda9","penteado":"curto","vestido":"#cdeee0","vestidoDetalhe":"#fffafb","acessorio":"flor","acessorioCor":"#f191ab","meias":"#fff1f5","coracao":"#e0708f"}'::jsonb, 21, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'ursinho-mel-do-campo', 'Ursinho Mel do Campo', 'ursinhos', 154.9, null,
  'Urso mel com chapeuzinho de palha e coração no peito.', 'Esse aqui vive no pomar. Chapeuzinho de palha, coração de feltro costurado no peito e o cheiro bom de tecido novo.', null,
  null, null, null, '31 cm',
  ARRAY['Plush cor mel', 'Coração de feltro', 'Chapéu de palha costurado']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['urso', 'campo']::text[],
  false, false, false, '{"tipo":"urso","pele":"#d8a86f","cabelo":"#b98a52","cabeloSombra":"#966c3c","penteado":"curto","vestido":"#fdf6ec","vestidoDetalhe":"#cdeee0","acessorio":"chapeu","acessorioCor":"#e6c98a","meias":"#fff1f5","coracao":"#e0708f"}'::jsonb, 22, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'naninha-estrelinha', 'Naninha Estrelinha', 'naninhas', 119.9, null,
  'Naninha de plush lilás com carinha bordada e orelhinhas de segurar.', 'A Estrelinha é a primeira companhia do berço: leve, macia e do tamanho certo para a mãozinha segurar enquanto o soninho chega.', null,
  null, null, null, '32 x 32 cm',
  ARRAY['Plush antialérgico', 'Carinha bordada à mão', 'Sem peças soltas — seguro desde o nascimento']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['bebê', 'berço', 'soninho']::text[],
  true, false, false, '{"tipo":"naninha","pele":"#f7ddc9","cabelo":"#e8c27a","cabeloSombra":"#c9a25c","penteado":"curto","vestido":"#e2dcf6","vestidoDetalhe":"#fffafb","acessorio":"nenhum","acessorioCor":"#cdeee0","meias":"#fff1f5","coracao":"#e0708f"}'::jsonb, 23, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'naninha-nuvem', 'Naninha Nuvem', 'naninhas', 124.9, null,
  'Naninha branca com detalhes rosa e orelhinhas de coelho.', 'Branquinha como nuvem, com duas orelhinhas para o bebê apertar. Passou por lavagem antialérgica antes de sair do ateliê.', null,
  null, null, null, '32 x 32 cm',
  ARRAY['Plush branco antialérgico', 'Detalhes em algodão rosa', 'Carinha bordada à mão']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['bebê', 'coelho']::text[],
  false, false, false, '{"tipo":"naninha","pele":"#fdf3ea","cabelo":"#f6e6da","cabeloSombra":"#e3cfc0","penteado":"curto","vestido":"#fffafb","vestidoDetalhe":"#f9b4c6","acessorio":"nenhum","acessorioCor":"#f9b4c6","meias":"#fff1f5","coracao":"#e0708f"}'::jsonb, 24, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'kit-maternidade-primeiro-sonho', 'Kit Maternidade Primeiro Sonho', 'naninhas', 329.9, 379.9,
  'Naninha + bonequinha de pano + enfeite de porta, na caixa de presente.', 'O kit completo para a chegada: uma naninha, uma bonequinha de pano e o enfeite de porta do quartinho. Sai do ateliê embalado em caixa de presente com laço, pronto para entregar na mão da mãe.', null,
  null, null, null, 'Kit com 3 peças',
  ARRAY['Naninha de plush', 'Bonequinha de pano 28 cm', 'Placa de porta em tecido', 'Caixa de presente']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['kit', 'maternidade', 'presente']::text[],
  false, false, true, '{"tipo":"bebe","pele":"#f7ddc9","cabelo":"#c8703f","cabeloSombra":"#a4562c","penteado":"curto","vestido":"#ffe3ea","vestidoDetalhe":"#fffafb","acessorio":"laco","acessorioCor":"#f191ab","meias":"#fff1f5","coracao":"#e0708f"}'::jsonb, 25, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'mobile-bonequinhas', 'Móbile de Bonequinhas', 'decoracao', 189.9, null,
  'Móbile de berço com quatro bonequinhas e nuvenzinhas de feltro.', 'Quatro bonequinhas girando devagar sobre o berço, penduradas em bastidor forrado de tecido rosa e nuvens de feltro.', null,
  null, null, null, '30 cm de diâmetro',
  ARRAY['Bastidor de madeira forrado', 'Bonequinhas de pano 10 cm', 'Nuvens de feltro']::text[], 'Limpar apenas com pano levemente úmido. Não lavar.', ARRAY['móbile', 'quartinho', 'berço']::text[],
  true, false, false, '{"tipo":"bebe","pele":"#f7ddc9","cabelo":"#c8703f","cabeloSombra":"#a4562c","penteado":"chiquinhas","vestido":"#ffe3ea","vestidoDetalhe":"#fffafb","acessorio":"laco","acessorioCor":"#f9b4c6","meias":"#fff1f5","coracao":"#e0708f"}'::jsonb, 26, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'porta-maternidade-boneca', 'Porta-Maternidade Boneca', 'decoracao', 209.9, null,
  'Enfeite de porta com boneca em relevo e acabamento em renda.', 'A primeira coisa que a visita vê. Boneca em relevo, base forrada de tecido e barrado de renda costurado à mão, para pendurar na porta do quartinho.', null,
  null, null, null, '35 cm',
  ARRAY['Base forrada', 'Boneca em relevo', 'Barrado de renda costurado à mão', 'Fita para pendurar']::text[], 'Limpar apenas com pano levemente úmido. Não lavar.', ARRAY['porta', 'maternidade', 'quartinho']::text[],
  false, false, true, '{"tipo":"bebe","pele":"#e6bb98","cabelo":"#b5651d","cabeloSombra":"#8f4d13","penteado":"curto","vestido":"#fdf6ec","vestidoDetalhe":"#f9b4c6","acessorio":"flor","acessorioCor":"#f191ab","meias":"#fff1f5","coracao":"#e0708f"}'::jsonb, 27, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'mini-bonecas-lembrancinha', 'Mini Bonecas — Lembrancinha', 'decoracao', 39.9, null,
  'Bonequinhas de 12 cm para lembrancinha de festa (pedido mínimo: 10).', 'Pequenas, mas feitas com o mesmo capricho das grandes. Saem do ateliê já ensacadinhas, com a tag do ateliê e laço de cetim.', null,
  null, null, null, '12 cm',
  ARRAY['Algodão', 'Enchimento siliconado', 'Tag do ateliê', 'Saquinho transparente com laço']::text[], 'Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.', ARRAY['lembrancinha', 'festa', 'kit']::text[],
  false, true, false, '{"tipo":"menina","pele":"#f7ddc9","cabelo":"#e8c27a","cabeloSombra":"#c9a25c","penteado":"chiquinhas","vestido":"#f9b4c6","vestidoDetalhe":"#fffafb","acessorio":"laco","acessorioCor":"#e0708f","meias":"#fff1f5","coracao":"#e0708f"}'::jsonb, 28, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;
insert into public.produtos (
  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem, ativo
) values (
  'guirlanda-coracoes', 'Guirlanda de Corações', 'decoracao', 129.9, null,
  'Guirlanda de tecido com corações, rendas e uma bonequinha no centro.', 'Feita com retalhos das bonecas do mês — por isso cada guirlanda carrega um pedacinho de várias histórias.', null,
  null, null, null, '28 cm de diâmetro',
  ARRAY['Corações de algodão', 'Renda de algodão', 'Bonequinha central 10 cm']::text[], 'Limpar apenas com pano levemente úmido. Não lavar.', ARRAY['guirlanda', 'parede', 'retalhos']::text[],
  false, false, false, '{"tipo":"menina","pele":"#c58f68","cabelo":"#4a2c1a","cabeloSombra":"#301a0f","penteado":"coque","vestido":"#ffd0dc","vestidoDetalhe":"#fdf6ec","acessorio":"flor","acessorioCor":"#e0708f","meias":"#fff1f5","coracao":"#e0708f"}'::jsonb, 29, true
)
on conflict (slug) do update set
  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,
  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,
  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,
  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,
  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,
  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;

commit;
