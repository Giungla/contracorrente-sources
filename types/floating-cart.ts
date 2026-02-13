
import {
  type Nullable,
} from './global'

import {
  type CartHandleResponse,
} from './cart'

export interface FloatingCartState {
  /**
   * Indica se já houve uma busca pelos dados do carrinho
   */
  fetched: Nullable<boolean>;
  /**
   * Indica se existe uma busca em andamento pelos itens do carrinho
   */
  isPending: boolean;
  /**
   * Indica o estado de visibilidade do carrinho
   */
  isCartOpened: boolean;
  /**
   * Dados devolvidos pela API
   */
  cart: Nullable<CartHandleResponse>;
  /**
   * Indica se o usuário é um assinante da editora
   */
  isSubscriber: boolean;
}

export interface FloatingCartStateHandler {
  /**
   * Valor total do preço de venda dos produtos formatados em BRL
   */
  getOrderPrice: string;
  /**
   * Valor total do preço de capa dos produtos formatados em BRL
   */
  getFullOrderPrice: string;
  /**
   * Quanto ainda falta para conseguir frete grátis
   */
  missingForFreeShipping: number;
}

export type GroupFloatingCartState = FloatingCartState & FloatingCartStateHandler;
