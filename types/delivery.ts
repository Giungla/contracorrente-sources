
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
