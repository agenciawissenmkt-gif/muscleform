/**
 * Dados da loja em um único lugar — é aqui que se muda telefone, textos e redes.
 */
export const site = {
  nome: 'Sonhos de Brincar',
  slogan: 'Costurando sonhos em cada coração',
  descricao:
    'Ateliê de bonecas de pano feitas à mão, uma a uma, com tecidos escolhidos a dedo e muito amor em cada ponto.',
  cidade: 'Curitiba — PR',
  instagram: 'https://www.instagram.com/sonhosdebrincar.atelie',
  instagramUser: '@sonhosdebrincar.atelie',
  email: 'sonhosdebrincar.atelie@gmail.com',
  /** Número exibido no site. */
  whatsappExibicao: '+55 (41) 98500-1824',
  /** Número usado no link wa.me (somente dígitos, com DDI + DDD). */
  whatsappNumero: '5541985001824',
  prazoProducao: '7 a 12 dias úteis',
  frase: 'Feito à mão, feito com amor.',
} as const;

/** Monta um link do WhatsApp já com a mensagem pronta. */
export function linkWhatsApp(mensagem: string): string {
  return `https://wa.me/${site.whatsappNumero}?text=${encodeURIComponent(mensagem)}`;
}

export const CTA_COMPRA = 'Realize seu sonho';
