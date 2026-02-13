
import {
  AUTH_COOKIE_NAME,
} from '../utils/requestResponse'

import {
  getCookie,
} from '../utils/cookie'

export const cartOperations = ({
  ADD: 'add',
  DELETE: 'delete',
  INCREASE: 'increase',
  DECREASE: 'decrease',
}) as const

export type CartOperations = typeof cartOperations

export type CartHandleOperations = CartOperations[keyof CartOperations];

export const handleCartTypes = ({
  USER: 'user',
  GUEST: 'guest',
}) as const

export type HandleCartType = typeof handleCartTypes

export type HandleCartTypes = HandleCartType[keyof HandleCartType]

export function getCartHandlerPath (): HandleCartTypes {
  return getCookie(AUTH_COOKIE_NAME) !== false
    ? handleCartTypes.USER
    : handleCartTypes.GUEST
}

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

export interface ResponseItem {
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
  /**
   * Identificador do SKU
   */
  sku_id: string;
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
  /**
   * Quantidade de unidades que o cliente possui no carrinho
   */
  cart_items: number;
  /**
   * Indica se o usuário é um assinante da editora
   */
  is_subscriber?: boolean;
}

export interface HandleCartOperationsPayload extends Pick<ResponseItem, 'quantity' | 'sku_id'> {
  /**
   * Referência do produto (slug)
   */
  reference_id: string;
}

export type PriceGroup = Pick<ResponseItem, 'price' | 'full_price'>;
