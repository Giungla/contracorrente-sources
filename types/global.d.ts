
type Vue = typeof import('vue')

declare global {
  interface Window {
    Vue: Vue,
  }
}

export type Nullable <T> = null | T;

export interface FunctionSucceededPattern <T = null> {
  data: T;
  succeeded: true;
}

export interface FunctionErrorPattern {
  succeeded: false;
  message: string;
}

export type ResponsePattern <T> = FunctionSucceededPattern<T> | FunctionErrorPattern;

export type ComputedReturnValues <T> = {
  [K in keyof T]: T[K] extends () => infer R ? R : never;
};

export type BrazilianStates = 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO' | 'MA' | 'MS' | 'MT' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI' | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export type DeliveryOptionLabel = 'PAC' | 'Sedex' | 'Impresso';

export interface Prices {
  /**
   * Preço normal de venda
   */
  sale: number;
  /**
   * Preço normal de venda após a aplicação de um cupom de desconto
   */
  coupon: number;
  /**
   * Preço de venda para um assinante (30% off)
   */
  subscription: number;
}

export interface ProductResponse {
  /**
   * ID do livro no Xano
   */
  id: number;
  /**
   * ID do livro no Webflow
   */
  product_id: string;
  /**
   * Slug do livro
   */
  slug: string;
  /**
   * Largura do livro
   */
  width: number;
  /**
   * Altura do livro
   */
  height: number;
  /**
   * Profundidade do livro
   */
  length: number;
  /**
   * Peso do livro
   */
  weight: number;
  /**
   * Preço de venda do livro
   */
  price: number;
  /**
   * Preço do produto sem desconto
   */
  full_price: number;
  /**
   * URL da thumbnail do produto
   */
  image: string;
  /**
   * Código ISBN deste livro
   */
  ISBN: string;
  /**
   * Timestamp do momento de criação do registro
   */
  created_at: number;
}

export interface sProduct {
  element: HTMLElement;
  quantity: number;
  slug: string;
}

export interface InstallmentOptionPrice {
  /**
   * Quantidade de parcelas
   */
  quantity: number;
  /**
   * Valor de cada parcela
   */
  installmentAmount: number;
  /**
   * Valor total cobrado que será usado nesse parcelamento
   */
  totalAmount: number;
  /**
   * Taxa deste parcelamento
   */
  interestFree: boolean;
}

export type ResponsePatternCallback = (...params: any) => void;

export interface PaginateSchema <T> {
  /**
   * Dados retornados na consulta
   */
  items: T[];

  /**
   * Indica o offset usado na consulta
   */
  offset: number;

  /**
   * Indica qual a página retornada na consulta
   */
  curPage: number;

  /**
   * Indica a próxima página a ser consultada, se houver
   */
  nextPage: Nullable<number>;

  /**
   * Indica qual a página anterior a ser consultada, se houver
   */
  prevPage: Nullable<number>;

  /**
   * Quantidade de páginas existentes na consulta enviada
   */
  pageTotal: number;

  /**
   * Indica quantos itens a consulta enviada resultou (apenas uma porção está na página atual)
   */
  itemsTotal: number;

  /**
   * Indica quantos itens retornaram na consulta/página atual
   */
  itemsReceived: number;
}
