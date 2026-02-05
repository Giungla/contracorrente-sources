
export const priceType = ({
  /**
   * Representa o preço de um produto com desconto
   */
  PRICE: 'price',
  /**
   * Representa o preço de um produto sem desconto
   */
  FULL_PRICE: 'full_price',
}) as const

export type PriceType = typeof priceType

export type PriceTypes = PriceType[keyof PriceType]
