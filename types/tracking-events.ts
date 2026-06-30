
export interface AdvancedMatchingData {
  /**
   * Endereço de e-mail
   */
  em: string;
  /**
   * Número de telefone
   */
  ph?: string;
  /**
   * Primeiro nome
   */
  fn?: string;
  /**
   * Último nome
   */
  ln?: string;
  /**
   * Data de nascimento
   */
  db?: string;
}

export interface PageViewMeta {
  /**
   * ID do dataset da Meta
   */
  app_id: string;
  /**
   * ID do evento de PageView registrado no backend
   */
  event_id: string;
  /**
   * Dados do cliente para correspondência avançada manual
   */
  customer_data?: AdvancedMatchingData;
}

export interface PageViewResponse {
  /**
   * ID do evento enviado para a Meta
   */
  meta: PageViewMeta;
}









export interface InitiateCheckoutContents {
  id: string;
  quantity: number;
  item_price: number;
}

export interface InitiateCheckoutBody {
  value: number;
  currency: string;
  content_type: string;
  contents: InitiateCheckoutContents[];
  contents_ids: string[];
  num_items: number;
}

export interface InitiateCheckoutResponse {
  meta: {
    event_id: string;
    event_body: InitiateCheckoutBody;
  }
}








export interface ViewContentProduct {
  type: 'product';
  payload: {
    sku_id: number;
    reference_id: string;
  }
}

export interface ViewContentLandingPage {
  type: 'landing_page';
  payload: {
    page_title: string;
    page_description: string;
  }
}

export type ViewContentParams = ViewContentProduct | ViewContentLandingPage;

export interface ViewContentResponse {
  meta: {
    event_id: string;
    event_body: Omit<InitiateCheckoutBody, 'num_items'> & {
      content_name: string;
    };
  }
}
