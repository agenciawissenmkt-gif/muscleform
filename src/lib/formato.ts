/** Formatação de preço e parcelas — usada em toda a loja. */

export function formatarPreco(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Parcelamento sugerido: até 3x sem juros a partir de R$ 150. */
export function parcelamento(valor: number): { vezes: number; valor: number } {
  const vezes = valor >= 150 ? 3 : valor >= 90 ? 2 : 1;
  return { vezes, valor: valor / vezes };
}
