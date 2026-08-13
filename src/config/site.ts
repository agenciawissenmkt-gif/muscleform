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
  whatsappExibicao: '+55 41 9509-6228',
  /** Número usado no link wa.me (somente dígitos, com DDI + DDD). */
  whatsappNumero: '554195096228',
  prazoProducao: '7 a 12 dias úteis',
  frase: 'Feito à mão, feito com amor.',
  /**
   * Quem representa o ateliê — aparece no rodapé.
   * O documento fica aqui porque a lei do comércio eletrônico (Decreto 7.962/2013)
   * pede a identificação de quem vende, visível no site.
   */
  agencia: {
    /** Nome fantasia, como a agência é conhecida. */
    nome: 'Agência Wissen',
    /** Razão social, como está registrada. */
    razaoSocial: 'W F Zyla Santos Promoções de Venda',
    socio: 'William Fernando Zyla Santos',
    cpf: '031.923.869-59',
  },
} as const;

/** Monta um link do WhatsApp já com a mensagem pronta. */
export function linkWhatsApp(mensagem: string): string {
  return `https://wa.me/${site.whatsappNumero}?text=${encodeURIComponent(mensagem)}`;
}

export const CTA_COMPRA = 'Realize seu sonho';
