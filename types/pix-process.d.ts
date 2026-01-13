
import {
  type Nullable,
  type ResponsePattern,
  type ComputedReturnValues,
} from './global'

export interface ContraCorrentePixProcessSetup {
  /**
   * Indica se o navegador tem suporte ao EventSource
   */
  hasEventSource: Ref<Nullable<boolean>>;
}

export interface ContraCorrentePixProcessData {
  /**
   * Detalhes do pedido atual
   */
  order: Nullable<PixOrderData>;
  /**
   * Indica se os dados do pedido ainda estão sendo capturados
   */
  isLoading: boolean;
  /**
   * Indica se o código PIX foi copiado recentemente
   */
  hasCopied: boolean;
  /**
   * Timestamp atual
   */
  now: number;
  /**
   * Interval ID
   */
  nowInterval: Nullable<number>;
  /**
   * Indica se o navegador tem suporte ao EventSource
   */
  // hasEventSource: ShallowRef<Nullable<boolean>>;
}

export interface ContraCorrentePixProcessMethods {
  /**
   * Inicializa o `EventSource` responsável por receber as atualizações do pedido visualizado
   */
  pollOrder: (orderId: string) => void;
  /**
   * Atualiza parcialmente os dados do pedido com as informações recebidas via `EventSource`
   */
  patchOrder: (payload: PixOrderDataPoll) => void;
  /**
   * Captura os dados do pedido
   */
  getOrder: (orderId: string) => Promise<ResponsePattern<PixOrderData>>;
  /**
   * Permite ao usuário copiar o QRCode
   */
  handleCopyQRCode: () => Promise<void>;
  /**
   * Interrompe countdown responsável pela atualização do timer na tela
   */
  clearInterval: () => void;
  /**
   * Renderiza o QRImage na tela para que o usuário possa realizar a leitura
   */
  setQRImage: () => void;
}

export interface ContraCorrentePixOrderComputedDefinition {
  /**
   * Retorna o preço do pedido formatado em BRL
   */
  orderPrice: () => string;
  /**
   * Retornará o tempo restante para efetivação do pagamento
   */
  timmer: () => string;
  /**
   * Informará se o pedido já se encontra pago
   */
  hasPaid: () => boolean;
  /**
   * Informará se o pedido já se encontra expirado
   */
  isExpired: () => boolean;
  /**
   * Retorna o código QR para esse pedido
   */
  getQRCode: () => string;
}

export type ContraCorrentePixOrderComputed = ComputedReturnValues<ContraCorrentePixOrderComputedDefinition>;

export interface ContraCorrentePixProcessWatch {
  /**
   * Assiste as modificações no timmer aguardando pelo momento que seja `00:00:00`
   */
  timmer: (time: string) => void;
}

export type ContraCorrentePixProcessContext = ContraCorrentePixProcessSetup & ContraCorrentePixProcessData & ContraCorrentePixProcessMethods & ContraCorrentePixOrderComputed;

export interface PixOrderData {
  /**
   * Timestamp: indica em que momento esse QR code deixará de ser válido
   */
  due_time: number;
  /**
   * Timestamp: indica em que momento este pedido foi gerado
   */
  created_at: number;
  /**
   * Status atual do pedido
   */
  order_status: 1 | 2 | 3;
  /**
   * Meio de pagamento usado no pedido
   */
  payment_method: PaymentTypes;
  /**
   * Valor total deste pedido
   */
  total: number;
  /**
   * Indica se o pedido está ou não pago
   */
  pago: boolean;
  /**
   * URL do QRImage escaneável
   */
  qrcode: string;
  /**
   * Linha copiável do QRCode de pagamento
   */
  qrcode_text: string;
  /**
   * Indica se o período de pagamento deste pedido passou
   */
  expired: boolean;
}

/**
 * Dados retornados pelo EventSource aberto com o backend
 */
export type PixOrderDataPoll = Pick<PixOrderData, 'pago' | 'expired' | 'total'>;