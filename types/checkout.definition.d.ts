
import {
  type Nullable,
} from './global'

import {
  type PaymentTypes,
} from './payment'

import {
  type Ref,
  type ShallowRef,
} from 'vue'

// import {
//   CouponTypes,
// } from './coupon'

import {
  type ResponseItem,
  type CartHandleResponse,
} from './cart'

import {
  DeliveryCodes,
  type DeliveryPlace,
  type DeliveryTypes,
} from './delivery'

import {
  type DeliveryOption,
} from './single-product-page'

import {
  type BaseAddress,
} from './address'

// interface CheckoutCouponData {
//   /**
//    * Código do cupom aplicado
//    */
//   code: Uppercase<string>;
//
//   /**
//    * Valor de desconto aplicado pelo cupom (percentual ou absoluto)
//    */
//   value: number;
//
//   /**
//    * Tipo do cupom aplicado
//    */
//   cupom_type: CouponTypes;
//
//   /**
//    * ID do produto alvo (somente se `cupom_type` for do tipo `isbn`)
//    */
//   products_id: Nullable<number>;
//
//   /**
//    * Indica se o desconto fornecido pelo cupom é percentual
//    */
//   is_percentage: boolean;
// }

export interface CheckoutAppSetup {
  /**
   * CPF do usuário
   */
  customerCPF: Ref<string>;

  /**
   * Endereço de e-mail do usuário
   */
  customerMail: Ref<string>;

  /**
   * Telefone do usuário
   */
  customerPhone: Ref<string>;

  /**
   * Data de aniversário do usuário
   */
  customerBirthDate: Ref<string>;

  /**
   * Nome impresso no cartão de crédito
   */
  customerCreditCardHolder: Ref<string>;

  /**
   * Númeração do cartão de crédito
   */
  customerCreditCardNumber: Ref<string>;

  /**
   * Data de validade do cartão de crédito
   */
  customerCreditCardDate: Ref<string>;

  /**
   * Código de segurança do cartão de crédito
   */
  customerCreditCardCVV: Ref<string>;

  /**
   * CEP do endereço de cobrança
   */
  billingCEP: Ref<string>;

  /**
   * Nome da rua do endereço de cobrança
   */
  billingAddress: Ref<string>;

  /**
   * Número do endereço de cobrança
   */
  billingNumber: Ref<string>;

  /**
   * Complemento do endereço de cobrança
   */
  billingComplement: Ref<string>;

  /**
   * Bairro do endereço de cobrança
   */
  billingNeighborhood: Ref<string>;

  /**
   * Cidade do endereço de cobrança
   */
  billingCity: Ref<string>;

  /**
   * Sigla do estado do endereço de cobrança
   */
  billingState: Ref<string>;

  /**
   * Nome do destinatário do pedido
   */
  shippingRecipient: Ref<string>;

  /**
   * Número do CEP do endereço de entrega
   */
  shippingCEP: Ref<string>;

  /**
   * Nome da rua do endereço de entrega
   */
  shippingAddress: Ref<string>;

  /**
   * Número do endereço de entrega
   */
  shippingNumber: Ref<string>;

  /**
   * Complemento do endereço de entrega
   */
  shippingComplement: Ref<string>;

  /**
   * Bairro do endereço de entrega
   */
  shippingNeighborhood: Ref<string>;

  /**
   * Cidade do endereço de entrega
   */
  shippingCity: Ref<string>;

  /**
   * Sigla do estado do endereço de entrega
   */
  shippingState: Ref<string>;

  /**
   * Referência ao elemento que exibe e captura o endereço de e-mail do usuário
   */
  customerMailRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura a data de nascimento do usuário
   */
  customerBirthDateRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura o CPF do usuário
   */
  customerCPFRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura o telefone do usuário
   */
  customerPhoneRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe a mensagem de erro para a seleção de um método de pagamento
   */
  paymentMethodMessageRef: Ref<Nullable<HTMLDivElement>>;

  /**
   * Referência ao elemento que exibe e captura o nome impresso no cartão de crédito
   */
  customerCreditCardHolderRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura a numeração do cartão de crédito
   */
  customerCreditCardNumberRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura a data de validade do cartão de crédito
   */
  customerCreditCardDateRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura o código de segurança do cartão de crédito
   */
  customerCreditCardCVVRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura o CEP do endereço de cobrança
   */
  billingCEPRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura o nome da rua do endereço de cobrança
   */
  billingAddressRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento qu exibe e captura o número do endereço de cobrança
   */
  billingNumberRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura o bairro do endereço de cobrança
   */
  billingNeighborhoodRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura a cidade do endereço de cobrança
   */
  billingCityRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura a sigla do estado do endereço de cobrança
   */
  billingStateRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe a mensagem de erro para `deliveryPlace`
   */
  deliveryPlaceMessageRef: Ref<Nullable<HTMLDivElement>>;

  /**
   * Referência ao elemento que exibe e captura o nome do destinatário do pedido
   */
  shippingRecipientRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura o CEP do endereço de entrega
   */
  shippingCEPRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura o nome da rua do endereço de entrega
   */
  shippingAddressRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura o número do endereço de entrega
   */
  shippingNumberRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura o bairro do endereço de entrega
   */
  shippingNeighborhoodRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura a cidade do endereço de entrega
   */
  shippingCityRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura a sigla do estado do endereço de entrega
   */
  shippingStateRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe a mensagem de erro para as opções de parcelamento
   */
  installmentsMessageRef: Ref<Nullable<HTMLDivElement>>;

  /**
   * Referência ao elemento que exibe a mensagem de erro para as opções de entrega
   */
  shippingMethodMessageRef: Ref<Nullable<HTMLDivElement>>;

  /**
   * Referência ao elemento que exibe a mensagem de erro global após uma tentativa de pagamento
   */
  generalErrorMessageRef: Ref<Nullable<HTMLDivElement>>;

  /**
   * Mensagem de erro customizada para o endereço de cobrança
   */
  deliveryBillingAddressErrorMessage: Ref<Nullable<string>>;

  /**
   * Mensagem de erro customizada para o seletor de tipos de endereços de entrega
   */
  deliveryPlaceAddressErrorMessage: Ref<Nullable<string>>;

  /**
   * Opções de parcelamento disponíveis para cartão de crédito
   */
  installment: ShallowRef<Nullable<InstallmentItem[]>>;

  /**
   * Mensagem de erro captura após uma tentativa de pagamento
   */
  errorMessage: Ref<Nullable<string>>;

  /**
   * Lista os métodos de pagamento disponíveis
   */
  paymentMethods: ShallowRef<CheckoutPaymentMethod[]>;

  /**
   * Lista os tipos de endereços de entrega disponíveis
   */
  deliveryPlaces: ShallowRef<DeliveryPlace[]>;

  /**
   * Chama o método `refreshInstallments` sob um debouncer
   */
  debouncedOrderPrice: Nullable<VoidFunction>;
}

export interface CheckoutAppData {
  /**
   * Indica se houve uma tentativa de submissão do formulário
   */
  submitted: boolean;

  /**
   * Indica se a biblioteca do PagSeguro já foi carregada
   */
  isPagSeguroLoaded: boolean;

  /**
   * Dados do carrinho obtidos do token de sessão
   */
  cart: Nullable<CartHandleResponse>;

  /**
   * Indica a seleção do usuário para os tipos de endereços de entrega
   */
  deliveryPlace: Nullable<DeliveryTypes>;

  /**
   * Indica o tipo de pagamento selecionado
   */
  selectedPaymentMethod: Nullable<PaymentTypes>;

  /**
   * Indica o método de entrega selecionado pelo usuário
   */
  selectedShippingMethod: Nullable<DeliveryCodes>;

  /**
   * Indica a quantidade de parcelas escolhida
   */
  selectedInstallmentOption: Nullable<number>;

  /**
   * Indica se o usuário atual é um assinante
   */
  isSubscriber: boolean;

  /**
   * Indica quais campos da aplicação foram visitados
   */
  visitedFields: string[];

  /**
   * Dados de prazo e preço de entrega para os produtos do carrinho
   */
  detailedShipping: Nullable<DeliveryOption[]>;

  /**
   * Indica se existe uma requisição para realização de pagamento pendente
   */
  hasPendingPayment: boolean;

  /**
   * Código do cupom aplicado
   */
  couponCode: Nullable<string>;
}

export interface CheckoutInitialParams {
  /**
   * Envia o número do CEP informado pelo usuário em verificações anteriores no site
   */
  cep: Nullable<string>;
}

export interface CheckoutInitialPayload {
  /**
   * Dados do carrinho obtidos do token da sessão
   */
  cart: CartHandleResponse;
  /**
   * Dados do usuário autenticado
   */
  user: Nullable<User>;
  /**
   * Dados do endereço de entrega informado anteriormente
   */
  address: BaseAddress;
  /**
   * Dados de entrega para o endereço informado anteriormente
   */
  detailed_shipping: DeliveryOption[];
}

export interface User {
  /**
   * Nome do usuário autenticado
   */
  name: string;
  /**
   * Endereço de e-mail do usuário autenticado
   */
  email: string;
  /**
   * CPF do usuário autenticado
   */
  cpf: Nullable<string>;
  /**
   * Telefone do usuário autenticado
   */
  phone: Nullable<string>;
  /**
   * Data de aniversário do usuário autenticado formatada no padrão DD/MM/YYYY
   */
  birthDate: Nullable<string>;
  /**
   * Indica se o usuário autenticado é assinante
   */
  is_subscriber: boolean;
}

export interface RenderedProduct extends Pick<ResponseItem, 'name' | 'slug' | 'quantity'> {
  /**
   * Preço do produto já tratado e formatado em BRL
   */
  price: string;
  /**
   * Preço multiplicado pela quantidade formatado em BRL
   */
  final_price: string;
  /**
   * Regra CSS para exibição das imagens dos produtos
   */
  image_style: string;
}

export interface CheckoutPaymentMethod {
  /**
   * Token que representa o método de pagamento
   */
  method: PaymentTypes;
  /**
   * Label para exibição no frontend
   */
  label: string;
}

export interface ISingleValidateCheckout <T extends Nullable<HTMLElement> = Nullable<HTMLElement>> {
  /**
   * Referência ao campo
   */
  field: T;
  /**
   * Indica se o `value` contido no campo é válido
   */
  valid: boolean;
  /**
   * Indica se o campo será ignorado para validação
   */
  ignoreIf?: boolean;
}

export interface SearchAddressParams {
  /**
   * CEP do endereço (apenas números)
   */
  cep: string;
  /**
   * Signal para controle externo da requisição
   */
  signal?: AbortSignal;
}

export interface LabeledDeliveryOption extends Pick<DeliveryOption, 'coProduto'> {
  /**
   * Indica o tempo até a entrega dos produtos
   */
  label: string;
}

export interface PostOrder {
  /**
   * Código do cupom aplicado
   */
  coupon_code?: string;
  /**
   * Indica se o pedido usará o mesmo endereço para entrega e cobrança ou se serão usados endereços diferentes
   * Necessário somente quando o método de pagamento selecionado for cartão de crédito
   * Nos demais pagamentos, o valor `same` é definido no backend
   */
  delivery_place?: DeliveryTypes;
  /**
   * Método de entrega selecionado
   */
  shipping_method: DeliveryCodes;
  /**
   * Dados do usuário que está realizando o pedido
   */
  customer: PostOrderCustomer & IParsedAddressContent;
}

export interface PostOrderCustomer {
  /**
   * Nome do cliente
   */
  name: string;
  /**
   * Endereço de e-mail do cliente
   */
  email: string;
  /**
   * CPF do cliente
   */
  cpf: string;
  /**
   * Telefone do cliente
   */
  phone: string;
  /**
   * Data de nascimento do cliente
   */
  birthDate: string;
}

export interface IParsedAddressContent {
  /**
   * Endereço de cobrança
   */
  billingaddress?: IParsedAddress;
  /**
   * Endereço de entrega
   */
  shippingaddress?: IParsedAddress;
}

export interface IParsedAddress {
  /**
   * Número do CEP do endereço
   */
  zipPostalCode: string;
  /**
   * Nome da rua
   */
  street: string;
  /**
   * Número da residência
   */
  number: string;
  /**
   * Complemento do endereço
   */
  complement?: string;
  /**
   * Nome do bairro
   */
  neighbourhood: string;
  /**
   * Nome da cidade
   */
  city: string;
  /**
   * Sigla do estado
   */
  state: string;
}

export type PaymentResponseMap = {
  /**
   * Resposta devolvida pela API após a realização de um pagamento bem-sucedido via PIX
   */
  pix: PIXOrderResponse;
  /**
   * Resposta devolvida pela API após a realização de um pagamento bem-sucedido via Cartão de crédito
   */
  creditcard: CreditCardOrderResponse;
  /**
   * Resposta devolvida pela API após a realização de um pagamento bem-sucedido via Boleto
   */
  ticket: TicketOrderResponse;
}

export interface OrderResponse {
  succeeded: boolean;
  transactionid: string;
  errorMessage: Nullable<string>;
  paymentstatus: 1 | 2;
}

export type CreditCardOrderResponse = OrderResponse & {
  recurring_card_id: Nullable<string>;
  transaction_charge_id: Nullable<string>;
}

export type PIXOrderResponse = OrderResponse & {
  qrcode: string;
  qrcode_text: string;
}

export type TicketOrderResponse = OrderResponse & {
  /**
   * URL para visualização do boleto gerado para o pedido
   */
  boletourl: string;
  /**
   * Linha digitável - Código de barras
   */
  barcode: string;
}

export interface PostOrderCreditCard {
  /**
   * Nome impresso no cartão de crédito
   */
  holderName: string;
  /**
   * Token obtido para o cartão de crédito
   */
  creditCardToken: string;
  /**
   * Quantidade de parcelas selecionadas
   */
  numberOfPayments: number;
  /**
   * Valor da parcela
   */
  installmentValue: number;
}

export interface PagSeguroCardEncrypt {
  hasErrors: boolean;
  errors: PagSeguroEncryptError[];
  encryptedCard: Nullable<string>;
}

export interface PagSeguro {
  /**
   * Permite gerar um token para transitar os dados do cartão na rede
   * Garantido a segurança dos dados sensíveis no frontend
   */
  encryptCard: (card: PagSeguroEncryptCardDetails) => PagSeguroCardEncrypt;
}

export interface PagSeguroEncryptCardDetails {
  /**
   * Chave pública usada para gerar o token
   */
  publicKey: string;
  /**
   * Nome impresso no cartão
   */
  holder: string;
  /**
   * Númeração do cartão
   */
  number: string;
  /**
   * 2 dígitos do mês de expiração do cartão
   */
  expMonth: string;
  /**
   * 4 dígitos do ano de expiração do cartão
   */
  expYear: string;
  /**
   * 3 ou 4 digitos do código de segurança do cartão
   */
  securityCode: string;
}

export interface InstallmentItem <T = number> {
  /**
   * Quantidade de parcelas
   */
  installments: number;
  /**
   * Valor da parcela
   */
  installment_value: T;
}

export interface GetInstallmentsBody {
  /**
   * Valor que será usado na simulação de parcelamento
   */
  amount: number;
  /**
   * Os 6 ou 8 primeiros dígitos do cartão de crédito
   */
  cardbin: string;
}

declare global {
  interface Window {
    PagSeguro: PagSeguro;
  }
}
