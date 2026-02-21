
import {
  type Order,
  type OrderPageData, ParsedProduct,
  type ResponseAddress, ResponseShippingAddress,
} from '../types/order-page'

import {
  type Nullable,
  type ResponsePattern,
  type ResponsePatternCallback,
  type FunctionSucceededPattern,
} from '../types/global'

import {
  postErrorResponse,
  postSuccessResponse,
  buildRequestOptions,
} from '../utils/requestResponse'

import {
  NULL_VALUE,
  isNull,
  buildURL,
  isPageLoading,
} from '../utils/dom'

import {
  DASH_STRING,
  SLASH_STRING,
  XANO_BASE_URL,
} from '../utils/consts'

import {
  BRLFormatter, maskCEP,
} from '../utils/mask'

import {
  createApp,
  defineComponent,
} from 'vue'

const REASON_PARAM = 'reason'

const OrderPage = defineComponent({
  name: 'OrderPage',

  data (): OrderPageData {
    return {
      order: NULL_VALUE,
    }
  },

  /**
   * Ações executadas logo após criação do componente
   */
  async created (): Promise<void> {
    const searchParams = new URLSearchParams(location.search)

    const transactionId = searchParams.get('order-id')

    if (!transactionId) {
      location.href = buildURL(SLASH_STRING, {
        [REASON_PARAM]: 'transactionid_not_found',
      })

      return
    }

    const response = await this.getOrder(transactionId)

    if (!response.succeeded) {
      location.href = buildURL(SLASH_STRING, {
        [REASON_PARAM]: 'order_not_found',
      })

      return
    }

    this.order = response.data

    isPageLoading(false)
  },

  methods: {
    /**
     * Captura os dados do pedido indicado
     */
    async getOrder <T extends Order> (orderId: string): Promise<ResponsePattern<T>> {
      const defaultErrorMessage = 'Falha ao capturar o pedido'

      try {
        const response = await fetch(`${XANO_BASE_URL}/api:vvvJTKZJ/order/${orderId}/details`, {
          ...buildRequestOptions(),
          priority: 'high',
        })

        if (!response.ok) {
          const error = await response.json()

          return postErrorResponse.call(response, error?.message ?? defaultErrorMessage)
        }

        const data: T = await response.json()

        return postSuccessResponse.call<
          Response, [T, ResponsePatternCallback?], FunctionSucceededPattern<T>
        >(response, data)
      } catch (e) {
        return postErrorResponse(defaultErrorMessage)
      }
    },
  },

  computed: {
    /**
     * Retorna os dados de endereço de entrega
     */
    shipping (): Nullable<ResponseShippingAddress> {
      const {
        order,
      } = this

      if (isNull(order)) return NULL_VALUE

      const {
        cep,
        ...address
      } = order.shipping_address

      return {
        ...address,
        cep: maskCEP(cep),
        ...(order.shipping?.recipient && {
          user_name: order.shipping?.recipient,
        }),
      }
    },

    /**
     * Retorna os dados de endereço de cobrança
     */
    billing (): Nullable<ResponseAddress> {
      const {
        order,
      } = this

      if (isNull(order)) return NULL_VALUE

      const {
        cep,
        ...address
      } = order.billing_address

      return {
        ...address,
        cep: maskCEP(cep),
      }
    },

    /**
     * Retorna o preço de entrega do pedido
     */
    getOrderShippingPrice (): number {
      return this.order?.shipping.price ?? 0
    },

    /**
     * Retorna o preço de entrega formatado em BRL
     */
    getOrderShippingPriceFormatted (): string {
      return BRLFormatter.format(this.getOrderShippingPrice / 100)
    },

    /**
     * Retorna o valor do subtotal do pedido
     */
    getOrderSubtotalPrice (): number {
      return this.order?.subtotal ?? 0
    },

    /**
     * Retorna o valor do subtotal formatado em BRL
     */
    getOrderSubtotalPriceFormatted (): string {
      return BRLFormatter.format(this.getOrderSubtotalPrice / 100)
    },

    /**
     * Retorna o preço total do pedido
     */
    getOrderPrice (): number {
      return this.order?.total ?? 0
    },

    /**
     * Retorna o preço total do pedido formatado em BRL
     */
    getOrderPriceFormatted (): string {
      return BRLFormatter.format(this.getOrderPrice / 100)
    },

    /**
     * Retorna a lista de produtos adquiridos
     */
    getParsedProducts (): ParsedProduct[] {
      const {
        order,
      } = this

      if (!order) return []

      return order.items.map(({ quantity, unit_amount, title, image_url }) => {
        return {
          title,
          quantity,
          unit_amount: BRLFormatter.format(unit_amount / 100),
          final_price: BRLFormatter.format(Math.round(unit_amount * quantity) / 100),
          image_style: `background-image: url('${image_url}');`,
        }
      })
    },

    /**
     * Indica se o método de pagamento usado foi PIX
     */
    isPIXPayment (): boolean {
      return this.order?.payment_method === 'pix'
    },

    /**
     * Retorna o endereço de e-mail usado no pedido
     */
    email (): string {
      return this.order?.user.email ?? DASH_STRING
    },

    /**
     * Retorna a numeração de CPF do usuário
     */
    cpf (): string {
      return this.order?.user.cpf ?? DASH_STRING
    },

    /**
     * Retorna o telefone de contato usado no pedido
     */
    phone (): string {
      return this.order?.user.phone ?? DASH_STRING
    },

    // hasOrderDiscount (): boolean {
    //   return !isNull(this.order?.discount_code)
    // },

    /**
     * Retorna o valor de frete do pedido
     */
    // getOrderShipping (): number {
    //   const price = this.order?.delivery.quotation_price
    //
    //   return typeof price === 'number'
    //     ? (price / 100)
    //     : 0
    // },

    // getOrderDiscountPriceFormatted (): string {
    //   return BRLFormatter.format(((this.order?.discount ?? 0) / 100) * -1)
    // },

    // hasPriority (): boolean {
    //   return this.order?.delivery.has_priority ?? false
    // },

    // getPriorityFee (): number {
    //   return this.hasPriority
    //     ? (this.order?.delivery.priority_price as number / 100)
    //     : 0
    // },

    // getPriorityFeePriceFormatted (): string {
    //   return BRLFormatter.format(this.getPriorityFee)
    // },

    // hasSubsidy (): boolean {
    //   return this.order?.delivery.has_subsidy ?? false
    // },

    // getDeliverySubsidy (): number {
    //   if (!this.hasSubsidy) return 0
    //
    //   return -1 * Math.min(
    //     this.getOrderShipping,
    //     this.order?.delivery.subsidy_price as number / 100,
    //   )
    // },

    // getDeliverySubsidyPriceFormatted (): string {
    //   return BRLFormatter.format(this.getDeliverySubsidy)
    // },

    // hasFreeShippingByCartPrice (): boolean {
    //   return this.order?.delivery.has_freeship_by_cart_price ?? false
    // },
  },
})

createApp(OrderPage).mount('#orderapp')

window.addEventListener('pageshow', (e: PageTransitionEvent) => {
  if (e.persisted) window.location.reload()
})
