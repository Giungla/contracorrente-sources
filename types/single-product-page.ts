
import {
  type Nullable,
} from './global'

import {
  type DeliveryCodes,
} from './delivery'
import {PriceTypes} from "./price";

/**
 * Tipos possíveis para um produto
 */
type ProductType = 'phisical' | 'ondemand' | 'amazonproduct' | 'subscription'

export interface User {
  /**
   * Indica se o usuário ou não assinante da editora
   */
  subscriber: boolean;
}

export interface Product {
  /**
   * Slug do produto
   */
  slug: string;
  /**
   * Tipo do produto
   */
  product_type: ProductType;
}

export interface SKU {
  /**
   * Descreve o tipo da variação
   */
  variation_type: string;
  /**
   * ID do SKU
   */
  sku_id: string;
  /**
   * Preço do produto sem desconto
   */
  full_price: number;
  /**
   * Preço do produto com desconto
   */
  price: number;
  /**
   * Quantidade que a variação possui em estoque (limitado a 10)
   */
  inventory: number;
}

export interface SingleProductResponse {
  /**
   * Dados do produto consultado
   */
  product: Product;
  /**
   * Lista dos SKU
   */
  skus: SKU[];
}

export interface DeliveryOption {
  /**
   * Preço de entrega (inteiro)
   */
  pcFinal: number;
  /**
   * Código do produto
   */
  coProduto: DeliveryCodes;
  /**
   * Prazo de entrega em dias
   */
  prazoEntrega: number;
}

export interface ProductState {
  /**
   * Indica o SKU selecionado
   */
  selectedSku: Nullable<string>;
  /**
   * Quantidade de unidades selecionada
   */
  quantity: number;
  /**
   * CEP fornecido pelo usuário para cálculo de frete
   */
  shippingCEP: Nullable<string>;
  /**
   * Indica se o usuário é um assinante
   */
  isSubscriber: boolean;
  /**
   * Retorna os SKUs do produto selecionado
   */
  skus: SKU[];
  /**
   * Indica se a consulta de CEP está em andamento
   */
  isDeliveryLoading: boolean;
  /**
   * Valor do preço de entrega capturado via API
   */
  deliveryPrice: Nullable<number>;
  /**
   * Indica se existe uma operação de manipulação de carrinho em andamento
   */
  isManipulatingCart: boolean;
}

export interface ProductStateDynamic {
  /**
   * Retorna o preço de uma unidade do produto aplicando as regras de preço
   */
  singleItemPrice: number;
  /**
   * Preço com desconto do produto
   */
  price: number;
  /**
   * Preço de capa do produto
   */
  full_price: number;
  /**
   * Preço computado
   * Soma do valor do item multiplicado pela quantidade + eventual valor do frete
   */
  final_price: number;
  /**
   * Indica se o `price` e `full_price` possuem o mesmo valor
   */
  hasSamePrices: boolean;
}

export interface DeliveryInfoParams {
  /**
   * CEP do endereço para onde a simulação será realizada
   */
  cep: string;
  /**
   * Quantidade de itens que serão usados na simulação
   */
  quantity: number;
  /**
   * Identificador do produto que será usado na simulação
   */
  product_slug: string;
}
