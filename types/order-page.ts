
import {
  type Nullable,
} from './global'

export interface OrderSchema {
  /**
   * ID do pedido
   */
  id: number;
  /**
   * Valor do subtotal do pedido
   */
  subtotal: number;
  /**
   * Valor total do pedido
   */
  total: number;
  /**
   * Método de pagamento utilizado
   */
  payment_method: 'pix' | 'ticket' | 'creditcard';
}

export interface OrderUserSchema {
  /**
   * Numeração de CPF usada no pedido
   */
  cpf: string;
  /**
   * Endereço de e-mail do cliente
   */
  email: string;
  /**
   * Telefone do cliente
   */
  phone: string;
  /**
   * Data de nascimento do cliente
   */
  birthdate: string;
}

export interface OrderAddressSchema {
  /**
   * Número do CEP
   */
  cep: string;
  /**
   * Nome da rua
   */
  street: string;
  /**
   * Número do endereço
   */
  number: string;
  /**
   * Complemento do endereço
   */
  complement: string;
  /**
   * Bairro do endereço
   */
  neighborhood: string;
  /**
   * Cidade do endereço
   */
  city: string;
  /**
   * Sigla do estado do endereço
   */
  uf: string;
  /**
   * Indica se o endereço foi usado como endereço de cobrança
   */
  is_billing: boolean;
  /**
   * Indica se o endereço foi usado como endereço de entrega
   */
  is_shipping: boolean;
}

export interface V2Product {
  /**
   * Identificador do produto
   */
  slug: string;
  /**
   * URL da imagem do produto
   */
  image_url: string;
}

export interface OrderItemSchema extends V2Product {
  /**
   * ID do pedido
   */
  id: number;
  /**
   * Indica a variação do pedido
   */
  variation_type: string;
  /**
   * Quantidade de unidades adquiridas
   */
  quantity: number;
  /**
   * Preço de venda do produto
   */
  unit_amount: number;
  /**
   * Nome do produto
   */
  title: string;
}

export interface OrderShipping {
  /**
   * Preço da entrega dos produtos
   */
  price: number;
  /**
   * Código do serviço de entrega usado
   */
  delivery_code: '20133' | '03298' | '03220';
  /**
   * Nome da pessoa designada para receber a entrega
   */
  recipient: string;
}

export type ResponseUser = Omit<OrderUserSchema, 'birthdate'>;

export type ResponseAddress = Omit<OrderAddressSchema, 'is_billing' | 'is_shipping'>;

export type ResponseShippingAddress = ResponseAddress & {
  /**
   * Retorna o nome da pessoa designada para entrega
   */
  user_name?: string;
};

export interface Order extends Omit<OrderSchema, 'id'> {
  user: ResponseUser;
  items: OrderItemSchema[];
  shipping: OrderShipping;
  billing_address: ResponseAddress;
  shipping_address: ResponseAddress;
}

export interface OrderPageData {
  /**
   * Os dados do pedido
   */
  order: Nullable<Order>;
}

export interface ParsedProduct {
  /**
   * Nome do produto
   */
  title: string;
  /**
   * Quantidade de itens adquiridos
   */
  quantity: number;
  /**
   * Valor unitário cobrado pelo item
   */
  unit_amount: string;
  /**
   * Valor multiplicado pela quantidade
   */
  final_price: string;
  /**
   * URL da imagem de capa dp produto
   */
  image_style: string;
}
