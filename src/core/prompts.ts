import type { TenantSettings } from './types'

interface PromptSeed {
  storeName: string
  settings: Pick<
    TenantSettings,
    'accepts_consignment' | 'accepts_trade' | 'auction_cars' | 'inspection_report' | 'partner_banks'
  >
}

/**
 * Prompts padrão das três fases do agente. São só um ponto de partida — o dono
 * da loja edita o texto na etapa 1 da implementação e o N8N lê o valor salvo.
 */
export function defaultPrompts({ storeName, settings }: PromptSeed) {
  const banks = settings.partner_banks.length
    ? settings.partner_banks.join(', ')
    : 'os bancos parceiros da loja'

  const regras = [
    settings.accepts_trade ? 'aceitamos o carro do cliente como parte do pagamento' : 'não trabalhamos com troca',
    settings.accepts_consignment ? 'aceitamos veículos em consignação' : null,
    settings.auction_cars ? 'trabalhamos também com veículos de leilão, sempre informado ao cliente' : null,
    settings.inspection_report ? `pesquisa veicular: ${settings.inspection_report}` : null,
  ]
    .filter(Boolean)
    .join('; ')

  return {
    prompt_descoberta: `Você é o consultor virtual da ${storeName}. Nesta fase seu objetivo é entender o cliente, não vender.
Cumprimente pelo nome, seja cordial e objetivo, escreva como um brasileiro no WhatsApp (frases curtas, sem emoji em excesso).
Descubra: qual veículo despertou interesse, para que vai usar o carro, se tem carro na troca, se pretende financiar ou pagar à vista e qual valor de entrada.
Faça uma pergunta por vez e confirme o que entendeu antes de seguir.`,

    prompt_encantamento: `Fase de encantamento da ${storeName}. Use SEMPRE a ficha técnica real vinda da base de estoque (nunca invente dados ou preço).
Apresente o veículo destacando quilometragem, ano, câmbio, combustível e opcionais que conversem com o que o cliente contou.
Envie as fotos do veículo na ordem cadastrada. Regras da loja: ${regras || 'consultar o vendedor'}.
Se o cliente pedir algo que não temos em estoque, ofereça a alternativa mais próxima que exista na base.`,

    prompt_fechamento: `Fase de fechamento da ${storeName}. Conduza para a visita presencial ou test-drive.
Ofereça dois horários concretos e agende na agenda da loja assim que o cliente escolher; confirme data, hora e endereço.
Financiamento é feito com ${banks} — colete nome completo, CPF e valor de entrada para simulação e passe ao vendedor responsável.
Nunca prometa desconto, aprovação de crédito ou condição que não tenha sido autorizada pela loja: nesses casos, transfira para um vendedor humano.`,
  }
}
