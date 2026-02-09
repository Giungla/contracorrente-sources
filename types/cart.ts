
export const cartOperations = ({
  ADD: 'add',
  DELETE: 'delete',
  INCREASE: 'increase',
  DECREASE: 'decrease',
}) as const

export type CartOperations = typeof cartOperations

export type CartHandleOperations = CartOperations[keyof CartOperations];

export interface CartHandleItem {
  /**
   * Identificador único do SKU
   */
  sku_id: string;
  /**
   * Quantidade de unidades do SKU
   */
  quantity: number;
  /**
   * Identificador único do produto
   */
  reference_id: string;
}

export interface CartHandleParams {
  /**
   * Dados básicos do item
   */
  item: CartHandleItem;
  /**
   * Operação que será realizada
   */
  operation: CartHandleOperations;
}

interface ResponseItem {
  /**
   * Título do produto
   */
  name: string;
  /**
   * Identificador único do produto
   */
  slug: string;
  /**
   * Quantidade de itens no carrinho
   */
  quantity: number;
  /**
   * URL da imagem destacada do produto
   */
  image_url: string;
  /**
   * Preço de venda do produto
   */
  price: number;
  /**
   * Preço de capa do produto
   */
  full_price: number;
}

export interface CartHandleResponse {
  /**
   * Lista dos produtos inclusos no carrinho
   */
  items: ResponseItem[];
  /**
   * Preço de venda do pedido
   */
  order_price: number;
  /**
   * Preço de capa do pedido
   */
  order_full_price: number;
}
