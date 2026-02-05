
export const couponType = ({
  /**
   * Representa os cupons que aplicarão desconto sobre um ISBN específico
   */
  ISBN: 'isbn',
  /**
   * Representa os cupons que aplicarão desconto sobre o frete do pedido
   */
  SHIPPING: 'shipping',
  /**
   * Representa os cupons que aplicarão desconto sobre o subtotal do pedido
   */
  SUBTOTAL: 'subtotal',
}) as const

export type CouponType = typeof couponType

export type CouponTypes = CouponType[keyof CouponType]
