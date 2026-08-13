/**
 * Gera supabase/seed.sql a partir do catálogo que estava fixo no código.
 * Roda uma vez, na migração para o Supabase:
 *
 *   node scripts/gerar-seed.mjs
 *
 * Depois disso o código não tem mais produtos — a fonte de verdade é o banco.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// roda com: node --experimental-strip-types scripts/gerar-seed.mjs
const { categorias, produtos } = await import(resolve(raiz, 'src/data/produtos.ts'));

const texto = (v) => (v === undefined || v === null ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const bool = (v) => (v ? 'true' : 'false');
const num = (v) => (v === undefined || v === null ? 'null' : String(v));
const lista = (v) =>
  !v || v.length === 0 ? "'{}'" : `ARRAY[${v.map((i) => texto(i)).join(', ')}]::text[]`;
const json = (v) => (v === undefined || v === null ? 'null' : `${texto(JSON.stringify(v))}::jsonb`);

const linhas = [];
linhas.push('-- Catálogo inicial do ateliê Sonhos de Brincar.');
linhas.push('-- Gerado por scripts/gerar-seed.mjs a partir do catálogo original.');
linhas.push('-- Rode depois de supabase/schema.sql.');
linhas.push('');
linhas.push('begin;');
linhas.push('');
linhas.push('-- ------------------------------- categorias -------------------------------');

categorias.forEach((c, i) => {
  linhas.push(
    `insert into public.categorias (slug, nome, subtitulo, descricao, emoji, capa_spec, ordem, ativo) values (` +
      `${texto(c.slug)}, ${texto(c.nome)}, ${texto(c.subtitulo)}, ${texto(c.descricao)}, ${texto(c.emoji)}, ` +
      `${json(c.capa)}, ${i + 1}, true)` +
      `\non conflict (slug) do update set nome = excluded.nome, subtitulo = excluded.subtitulo, ` +
      `descricao = excluded.descricao, emoji = excluded.emoji, capa_spec = excluded.capa_spec, ordem = excluded.ordem;`,
  );
});

linhas.push('');
linhas.push('-- -------------------------------- produtos --------------------------------');

produtos.forEach((p, i) => {
  linhas.push(
    `insert into public.produtos (\n` +
      `  slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,\n` +
      `  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,\n` +
      `  destaque, novidade, mais_vendida, spec_3d, ordem, ativo\n` +
      `) values (\n` +
      `  ${texto(p.slug)}, ${texto(p.nome)}, ${texto(p.categoria)}, ${num(p.preco)}, ${num(p.precoDe)},\n` +
      `  ${texto(p.resumo)}, ${texto(p.historia)}, null,\n` +
      `  ${texto(p.foto)}, ${texto(p.fotoEstudio)}, ${texto(p.legendaFoto)}, ${texto(p.altura)},\n` +
      `  ${lista(p.materiais)}, ${texto(p.cuidados)}, ${lista(p.tags)},\n` +
      `  ${bool(p.destaque)}, ${bool(p.novidade)}, ${bool(p.maisVendida)}, ${json(p.spec)}, ${i + 1}, true\n` +
      `)\non conflict (slug) do update set\n` +
      `  nome = excluded.nome, categoria_slug = excluded.categoria_slug, preco = excluded.preco,\n` +
      `  preco_de = excluded.preco_de, resumo = excluded.resumo, historia = excluded.historia,\n` +
      `  foto = excluded.foto, foto_estudio = excluded.foto_estudio, legenda_foto = excluded.legenda_foto,\n` +
      `  altura = excluded.altura, materiais = excluded.materiais, cuidados = excluded.cuidados,\n` +
      `  tags = excluded.tags, destaque = excluded.destaque, novidade = excluded.novidade,\n` +
      `  mais_vendida = excluded.mais_vendida, spec_3d = excluded.spec_3d, ordem = excluded.ordem;`,
  );
});

linhas.push('');
linhas.push('commit;');
linhas.push('');

mkdirSync(resolve(raiz, 'supabase'), { recursive: true });
writeFileSync(resolve(raiz, 'supabase/seed.sql'), linhas.join('\n'));
console.log(`seed.sql gerado: ${categorias.length} categorias, ${produtos.length} produtos`);
