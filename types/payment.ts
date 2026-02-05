
export const paymentType = ({
  /**
   * Representa o pagamento por PIX
   */
  PIX: 'pix',
  /**
   * Representa o pagamento por boleto
   */
  TICKET: 'ticket',
  /**
   * Representa o pagamento por cartão de crédito
   */
  CREDITCARD: 'creditcard',
}) as const

export const ALLOWED_PAYMENT_METHODS = ([
  paymentType.PIX,
  paymentType.TICKET,
  paymentType.CREDITCARD,
]) as const

export type PaymentType = typeof paymentType

export type PaymentTypes = PaymentType[keyof typeof paymentType]
