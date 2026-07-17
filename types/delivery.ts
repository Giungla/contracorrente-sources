
export const deliveryType = ({
  /**
   * Representa pedidos com endereço de cobrança e entrega iguais
   */
  SAME: 'same',
  /**
   * Representa pedidos com endereços de cobrança e entrega diferentes
   */
  DIFF: 'diff',
}) as const

export type DeliveryType = typeof deliveryType

export type DeliveryTypes = DeliveryType[keyof DeliveryType]

export const deliveryCodes = ({
  /**
   * Código do serviço de entrega impresso  módico
   */
  IMPRESSO: '20133',
  /**
   * Código do serviço de entrega PAC
   */
  PAC: '03298',
  /**
   * Código do serviço de entrega Sedex
   */
  SEDEX: '03220',
}) as const

export const ALLOWED_DELIVERY_METHODS = ([
  deliveryCodes.IMPRESSO,
  deliveryCodes.PAC,
  deliveryCodes.SEDEX,
]) as const

export type DeliveryCode = typeof deliveryCodes

export type DeliveryCodes = DeliveryCode[keyof DeliveryCode]

export interface DeliveryPlace {
  /**
   * Identificador do tipo do endereço de entrega
   */
  token: DeliveryTypes;
  /**
   * Label que será exibido ao usuário
   */
  label: string;
}

export function getDeliveryCodeName (deliveryCode: DeliveryCodes): string {
  switch (deliveryCode) {
    case deliveryCodes.PAC:
      return 'PAC'
    case deliveryCodes.SEDEX:
      return 'Sedex'
    case deliveryCodes.IMPRESSO:
      return 'Impresso'
    default:
      return 'ERROR'
  }
}

export interface CorreiosDeliveryOption {
  /**
   * Preço do serviço de entrega
   */
  pcFinal: number;
  /**
   * Código do serviço dos Correios
   */
  coProduto: DeliveryCodes;
  /**
   * Prazo de entrega em dias
   */
  prazoEntrega: number;
}

export interface UmLivroDeliveryOption {
  /**
   * Código do serviço
   *
   * Composto pelo nome do serviço, código da empresa e código do serviço, separados por -
   *
   *
   * Ex: "correios-1-1", "loggi-18-1"
   */
  code: string;
  /**
   * Nome do serviço
   */
  label: string;
  /**
   * Preço de entrega (inteiro)
   */
  price: number;
  /**
   * Quantidade de dias necessários para a entrega
   */
  delivery_days: number;
}

export type AvailableDeliveryOptions = CorreiosDeliveryOption | UmLivroDeliveryOption;

export interface DeliveryProviderDependents {
  /**
   * Identificador único do produto
   */
  slug: string;
  /**
   * Identificador do SKU
   */
  sku_id: number;
}

export interface DeliveryProvider <T, K> {
  /**
   * Identificador do serviço de entrega
   */
  provider: T;
  /**
   * Informa os produtos que dependem deste meio de entrega
   */
  dependent_items: DeliveryProviderDependents[];
  /**
   * Opções de entrega disponíveis para o provider
   */
  options: K[];
}

export const DELIVERY_PROVIDERS = ({
  UMLIVRO: 'um-livro',
  CORREIOS: 'correios',
}) as const

export type DeliveryProviders = typeof DELIVERY_PROVIDERS

export type DeliveryProvidersKeys = DeliveryProviders[keyof DeliveryProviders]

export type CorreiosDeliveryProvider = DeliveryProvider<
  Extract<DeliveryProvidersKeys, DeliveryProviders['CORREIOS']>,
  CorreiosDeliveryOption
>;

export type UmLivroDeliveryProvider = DeliveryProvider<
  Extract<DeliveryProvidersKeys, DeliveryProviders['UMLIVRO']>,
  UmLivroDeliveryOption
>;

export type AvailableDeliveryProviders = CorreiosDeliveryProvider | UmLivroDeliveryProvider;
