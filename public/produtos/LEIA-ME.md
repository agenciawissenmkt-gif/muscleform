# Fotos das bonecas

As fotos originais do ateliê já estão aqui, sem nenhuma alteração:

| Arquivo                  | Boneca                     |
| ------------------------ | -------------------------- |
| `theo-do-mar.webp`       | Boneco Theo do Mar         |
| `maite-girassol.webp`    | Boneca Maitê Girassol      |
| `marieta-cerejas.webp`   | Boneca Marieta das Cerejas |
| `bento-quartinho.webp`   | Boneco Bento do Quartinho  |
| `manon-paris.webp`       | Boneca Manon de Paris      |

## Para adicionar uma boneca nova

1. Coloque a foto nesta pasta (`.webp`, `.jpg` ou `.png` — quadrada fica perfeita,
   entre 1000 e 1600 pixels de largura é o ideal).
2. Em `src/data/produtos.ts`, aponte o campo `foto` do produto para ela:
   `foto: '/produtos/nome-do-arquivo.webp'`

Se a foto não estiver aqui, o site mostra a ilustração 3D da boneca no lugar —
nunca aparece imagem quebrada.
