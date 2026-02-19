
import {
  NULL_VALUE,
  SCROLL_INTO_VIEW_DEFAULT_ARGS,
  trim,
  isNull,
  isArray,
  regexTest,
  splitText,
  stringify,
  numberOnly,
  objectSize,
  attachEvent,
  getAttribute,
  isPageLoading,
  normalizeText,
  scrollIntoView,
  isInputInstance,
  replaceDuplicatedSpaces,
  CPF_REGEX_VALIDATION,
  CEP_REGEX_VALIDATION,
  DATE_REGEX_VALIDATION,
  EMAIL_REGEX_VALIDATION,
  PHONE_REGEX_VALIDATION,
  FULLNAME_REGEX_VALIDATION, focusInput, debounce, buildURL,
} from '../utils/dom'

import {
  postErrorResponse,
  postSuccessResponse,
  buildRequestOptions,
} from '../utils/requestResponse'

import {
  SLASH_STRING,
  EMPTY_STRING,
  statesAcronym,
  XANO_BASE_URL,
  CEP_STORAGE_KEY, STORAGE_KEY_NAME,
} from '../utils/consts'

import {
  type CheckoutAppData,
  type CheckoutAppSetup,
  type CheckoutInitialParams,
  type CheckoutInitialPayload,
  type CheckoutPaymentMethod,
  type GetInstallmentsBody,
  type InstallmentItem,
  type IParsedAddress,
  type IParsedAddressContent,
  type ISingleValidateCheckout,
  type LabeledDeliveryOption,
  type PagSeguroCardEncrypt,
  type PaymentResponseMap,
  type PostOrder,
  type PostOrderCreditCard,
  type RenderedProduct,
  type SearchAddressParams,
} from '../types/checkout.definition'

import {
  BRLFormatter,
  maskCEP,
  maskDate,
  toUpperCase,
  maskCardDate,
  maskCPFNumber,
  maskCardNumber,
  maskPhoneNumber,
} from '../utils/mask'

import {
  type Nullable,
  type ResponsePattern,
  type FunctionErrorPattern,
  type ResponsePatternCallback,
  type FunctionSucceededPattern,
  type BRLString,
} from '../types/global'

import {
  getCartHandlerPath,
} from '../types/cart'

import {
  paymentType,
  type PaymentTypes,
} from '../types/payment'

import {
  pushIf,
  includes,
} from '../utils/array'

import {
  eventMap,
  cleanupDirective,
  buildMaskDirective,
} from '../utils/vue'

import {
  isCPFValid,
  isDateValid,
  isCreditCardExpireDateValid,
} from '../utils/validation'

import {
  deliveryType,
  deliveryCodes,
  getDeliveryCodeName,
  type DeliveryTypes,
  type DeliveryPlace,
  type DeliveryCodes,
} from '../types/delivery'

import {
  HttpMethod,
} from '../types/http'

import {
  addressType,
  AddressTypes,
  type BaseAddress,
} from '../types/address'

import {
  DeliveryOption,
} from '../types/single-product-page'

import {
  BLUR_EVENT,
} from '../utils/events'

import {
  SUBSCRIPTION_DISCOUNT,
} from '../types/subscription'

import {
  decimalRound,
} from '../utils/math'

import {
  priceType,
  type PriceTypes,
} from '../types/price'

import {
  type DirectiveBinding,
  ref,
  createApp,
  shallowRef,
  defineComponent,
} from 'vue'

import {
  type OnCleanup,
} from '@vue/reactivity'

const CHECKOUT_BASE_PATH = `${XANO_BASE_URL}/api:vvvJTKZJ`

const PAGSEGURO_PUBLIC_KEY = getAttribute(document.currentScript, 'data-public-key') ?? 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoZ8+gUNjyc4RndTF0k5TIEFSL8gK6aSOPAdxzdMYGCkCYLAlfINFc6ZYK/yxIUKcZ13Ib00C5xOw0ucAE7xi1Lo+b9Xfxt94VNOS/zWz07vOWpfbThMRcgV4/ZurTULo2qdZ26BXq1fw+5j4GwW/9k44Rt/unyq2Q3FVy7a1MuZvKzwA5lYrt2HJAviKqHZm9YdqVZOCn+SM77903Aewc1XUo+SwTSwxcLE4jbjtJ8nE4cd5L1/hEVMmN5woTagtBHvv2BCTy2xZHrkCdGFAGHK2jPYJk4YkNX6fpSKeQRF49UqhxkGRulwKApspjMB8qrWu0ivHn4SZz5kwZJcKhwIDAQAB'

if (isNull(PAGSEGURO_PUBLIC_KEY)) {
  throw new Error('`Public key was not provided')
}

function paymentMethodObject (method: PaymentTypes, label: string): CheckoutPaymentMethod {
  return {
    method,
    label,
  }
}

function deliveryPlaceObject (token: DeliveryTypes, label: string): DeliveryPlace {
  return {
    token,
    label,
  }
}

function buildFieldValidation (
  field: Nullable<HTMLElement>,
  valid: boolean,
  ignoreIf: boolean = false,
): ISingleValidateCheckout {
  return {
    field,
    valid,
    ...(ignoreIf && ({ ignoreIf })),
  }
}

async function searchAddress <T extends BaseAddress> ({ cep, signal }: SearchAddressParams): Promise<ResponsePattern<T>> {
  const defaultErrorMessage = 'Não foi possível encontrar o endereço'

  try {
    const response = await fetch(`${CHECKOUT_BASE_PATH}/address`, {
      ...buildRequestOptions([], HttpMethod.POST),
      signal,
      priority: 'high',
      body: stringify({
        cep: numberOnly(cep),
      }),
    })

    if (!response.ok) {
      const error = await response.json()

      return postErrorResponse.call<
        Response, [string], FunctionErrorPattern
      >(response, error?.code ?? defaultErrorMessage)
    }

    const address: T = await response.json()

    return postSuccessResponse.call<
      Response, [T, ResponsePatternCallback?], FunctionSucceededPattern<T>
    >(response, address)
  } catch (e) {
    return postErrorResponse(defaultErrorMessage)
  }
}

const CheckoutComponent = defineComponent({
  name: 'CheckoutComponent',

  setup (): CheckoutAppSetup {
    return {
      customerCPF: ref<string>(EMPTY_STRING),
      customerMail: ref<string>(EMPTY_STRING),
      customerPhone: ref<string>(EMPTY_STRING),
      customerBirthDate: ref<string>(EMPTY_STRING),

      customerCreditCardHolder: ref<string>(EMPTY_STRING),
      customerCreditCardNumber: ref<string>(EMPTY_STRING),
      customerCreditCardDate: ref<string>(EMPTY_STRING),
      customerCreditCardCVV: ref<string>(EMPTY_STRING),

      billingCEP: ref<string>(EMPTY_STRING),
      billingAddress: ref<string>(EMPTY_STRING),
      billingNumber: ref<string>(EMPTY_STRING),
      billingComplement: ref<string>(EMPTY_STRING),
      billingNeighborhood: ref<string>(EMPTY_STRING),
      billingCity: ref<string>(EMPTY_STRING),
      billingState: ref<string>(EMPTY_STRING),

      shippingRecipient: ref<string>(EMPTY_STRING),
      shippingCEP: ref<string>(EMPTY_STRING),
      shippingAddress: ref<string>(EMPTY_STRING),
      shippingNumber: ref<string>(EMPTY_STRING),
      shippingComplement: ref<string>(EMPTY_STRING),
      shippingNeighborhood: ref<string>(EMPTY_STRING),
      shippingCity: ref<string>(EMPTY_STRING),
      shippingState: ref<string>(EMPTY_STRING),

      customerMailRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      customerBirthDateRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      customerCPFRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      customerPhoneRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),

      paymentMethodMessageRef: ref<Nullable<HTMLDivElement>>(NULL_VALUE),

      customerCreditCardHolderRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      customerCreditCardNumberRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      customerCreditCardDateRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      customerCreditCardCVVRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),

      billingCEPRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      billingAddressRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      billingNumberRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      billingNeighborhoodRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      billingCityRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      billingStateRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),

      deliveryPlaceMessageRef: ref<Nullable<HTMLDivElement>>(NULL_VALUE),

      shippingRecipientRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      shippingCEPRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      shippingAddressRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      shippingNumberRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      shippingNeighborhoodRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      shippingCityRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      shippingStateRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),

      installmentsMessageRef: ref<Nullable<HTMLDivElement>>(NULL_VALUE),

      shippingMethodMessageRef: ref<Nullable<HTMLDivElement>>(NULL_VALUE),

      generalErrorMessageRef: ref<Nullable<HTMLDivElement>>(NULL_VALUE),

      deliveryBillingAddressErrorMessage: ref<Nullable<string>>(NULL_VALUE),

      deliveryPlaceAddressErrorMessage: ref<Nullable<string>>(NULL_VALUE),

      installment: shallowRef<Nullable<InstallmentItem[]>>(NULL_VALUE),

      errorMessage: ref<Nullable<string>>(NULL_VALUE),

      paymentMethods: shallowRef([
        paymentMethodObject(paymentType.CREDITCARD, 'Cartão de crédito'),
        paymentMethodObject(paymentType.TICKET, 'Boleto'),
        paymentMethodObject(paymentType.PIX, 'PIX'),
      ]),

      deliveryPlaces: shallowRef([
        deliveryPlaceObject(deliveryType.SAME, 'Mesmo endereço de cobrança do cartão'),
        deliveryPlaceObject(deliveryType.DIFF, 'Entregar em um endereço diferente'),
      ]),

      debouncedOrderPrice: NULL_VALUE,
    }
  },

  data (): CheckoutAppData {
    return {
      submitted: false,

      isPagSeguroLoaded: false,

      cart: NULL_VALUE,

      deliveryPlace: NULL_VALUE,

      selectedPaymentMethod: NULL_VALUE,

      selectedShippingMethod: NULL_VALUE,

      selectedInstallmentOption: NULL_VALUE,

      isSubscriber: false,

      visitedFields: [],

      detailedShipping: NULL_VALUE,

      hasPendingPayment: false,

      couponCode: NULL_VALUE,
    }
  },

  /**
   * Ações realizadas após a criação do componente
   */
  created (): void {
    this.getData({
      cep: localStorage.getItem(CEP_STORAGE_KEY),
    }).then(response => {
      if (!response.succeeded) return

      const {
        user,
        cart,
        address,
        detailed_shipping,
      } = response.data

      if (user) {
        this.customerMail      = user.email
        this.customerCPF       = user.cpf ?? EMPTY_STRING
        this.customerPhone     = user.phone ?? EMPTY_STRING
        this.customerBirthDate = user.birthDate ?? EMPTY_STRING
        this.isSubscriber      = user.is_subscriber

        this.shippingRecipient = user.name
      }

      if (address) {
        this.shippingCEP          = maskCEP(address.cep)
        this.shippingAddress      = address.logradouro
        this.shippingNeighborhood = address.bairro
        this.shippingCity         = address.localidade
        this.shippingState        = address.uf
      }

      if (detailed_shipping) {
        this.detailedShipping = detailed_shipping
      }

      this.cart = cart

      /**
       * Watcher adicionado após a consulta inicial, de forma a evitar chamada duplicada ao backend
       * por conta da atribuição de CEP realizada nas linhas acima
       */
      this.$watch('shippingCEP', async (cep: string, oldCEP: string, cleanup: OnCleanup) => {
        if (!regexTest(CEP_REGEX_VALIDATION, cep)) return

        const controller = new AbortController()

        cleanup(() => controller.abort())

        const succeeded = await this.captureAddress(addressType.SHIPPING, cep, oldCEP, controller.signal)

        if (!succeeded) {
          scrollIntoView(this.shippingCEPRef, SCROLL_INTO_VIEW_DEFAULT_ARGS)

          return
        }
      })
    })

    this.debouncedOrderPrice = debounce(() => {
      this.refreshInstallments()
    }, 500)
  },

  methods: {
    /**
     * Captura os dados que serão usados no checkout
     */
    async getData <T extends CheckoutInitialPayload> ({ cep }: CheckoutInitialParams): Promise<ResponsePattern<T>> {
      const defaultErrorMessage = 'Houve uma falha ao inicializar o checkout'

      const fetchURL = new URL(`${CHECKOUT_BASE_PATH}/checkout/${getCartHandlerPath()}`)

      if (cep) {
        fetchURL.searchParams.set('cep', cep)
      }

      try {
        const response = await fetch(fetchURL, {
          ...buildRequestOptions(),
          priority: 'high',
        })

        if (!response.ok) {
          const error = await response.json()

          return postErrorResponse.call<
            Response, [string], FunctionErrorPattern
          >(response, error?.message ?? defaultErrorMessage)
        }

        const data: T = await response.json()

        return postSuccessResponse.call<
          Response, [T, ResponsePatternCallback?], FunctionSucceededPattern<T>
        >(response, data)
      } catch (e) {
        return postErrorResponse(defaultErrorMessage)
      }
    },

    /**
     * Captura os preços e prazos de entrega para os produtos incluídos no carrinho
     */
    async getShippingPriceAndDeadline <T extends DeliveryOption[]> (cep: string): Promise<ResponsePattern<DeliveryOption[]>> {
      const defaultErrorMessage = 'Houve uma falha ao buscar os dados de entrega'

      try {
        const response = await fetch(`${CHECKOUT_BASE_PATH}/get_delivery_price_deadline`, {
          ...buildRequestOptions([], HttpMethod.POST),
          body: stringify({
            cep,
          }),
        })

        if (!response.ok) {
          const error = await response.json()

          return postErrorResponse.call<
            Response, [string], FunctionErrorPattern
          >(response, error?.message ?? defaultErrorMessage)
        }

        const data: T = await response.json()

        return postSuccessResponse.call<
          Response, [T, ResponsePatternCallback?], FunctionSucceededPattern<T>
        >(response, data)
      } catch (e) {
        return postErrorResponse(defaultErrorMessage)
      }
    },

    /**
     * Troca o método de pagamento selecionado
     */
    setSelectedPaymentMethod (paymentMethod: PaymentTypes): void {
      if (this.selectedPaymentMethod === paymentMethod) return

      if (paymentMethod !== paymentType.CREDITCARD) {
        this.clearCreditCardData()
      } else if (!this.isPagSeguroLoaded) {
        this.loadPagSeguroLibrary()
      }

      this.deliveryPlace         = NULL_VALUE
      this.selectedPaymentMethod = paymentMethod
    },

    /**
     * Troca o tipo de `deliveryPlace`
     */
    setDeliveryPlace (deliveryPlace: DeliveryTypes): void {
      if (this.deliveryPlace === deliveryPlace) return

      if (deliveryPlace === deliveryType.SAME && regexTest(CEP_REGEX_VALIDATION, this.billingCEP) && this.isBillingAddressGroupValid) {
        searchAddress({
          cep: numberOnly(this.billingCEP),
        }).then(address => {
          if (address.succeeded) return

          this.deliveryPlaceAddressErrorMessage = address.message
        })
      } else {
        this.deliveryPlaceAddressErrorMessage = NULL_VALUE
      }

      this.deliveryPlace = deliveryPlace
    },

    /**
     * Troca o método de envio selecionado
     */
    setDeliveryMethod (coProduto: DeliveryCodes): void {
      this.selectedShippingMethod = coProduto
    },

    /**
     * Limpa os dados inseridos na seção "Dados do cartão de crédito"
     */
    clearCreditCardData () {
      this.customerCreditCardHolder = EMPTY_STRING
      this.customerCreditCardNumber = EMPTY_STRING
      this.customerCreditCardDate   = EMPTY_STRING
      this.customerCreditCardCVV    = EMPTY_STRING
    },

    /**
     * Indica se o campo verificado já foi incluído na lista de elementos visitados
     */
    isVisitedField (fieldName: string): boolean {
      return includes(this.visitedFields, fieldName)
    },

    /**
     * Marca o campo informado na lista de visitados
     */
    setVisitedField (fieldName: string): number {
      return pushIf(
        this.visitedFields,
        fieldName,
        !this.isVisitedField(fieldName),
      )
    },

    /**
     * Dispara as validações de todos os campos após uma tentativa de envio de pagamento
     */
    triggerValidations (): void {
      const {
        notIgnoredFields,
      } = this

      for (const { field } of notIgnoredFields) {
        if (!isInputInstance(field)) continue

        field.dispatchEvent(BLUR_EVENT)
      }
    },

    /**
     * Inicia o processo de envio de pagamento
     */
    async handlePayment (e: MouseEvent): Promise<void> {
      e.preventDefault()

      const {
        // isDeliveryLoading,
        hasPendingPayment,
        selectedPaymentMethod,
      } = this

      if (hasPendingPayment) return

      this.triggerValidations()

      if (!this.submitted) {
        this.submitted = true

        return this.$nextTick(() => this.handlePayment(e))
      }

      const {
        firstInvalidField,
      } = this

      if (firstInvalidField && firstInvalidField.field) {
        const {
          field,
        } = firstInvalidField

        scrollIntoView(field, SCROLL_INTO_VIEW_DEFAULT_ARGS)

        if (isInputInstance(field)) {
          setTimeout(focusInput, 500, field, {
            preventScroll: false,
          } satisfies FocusOptions)
        }

        return
      }

      this.hasPendingPayment = !isPageLoading(true)

      const response = await this.handlePostPayment(selectedPaymentMethod as PaymentTypes)

      if (!response.succeeded) {
        this.errorMessage = response.message

        this.hasPendingPayment = !isPageLoading(false)

        return this.$nextTick(() => {
          scrollIntoView(this.generalErrorMessageRef, SCROLL_INTO_VIEW_DEFAULT_ARGS)

          setTimeout(() => {
            this.errorMessage = NULL_VALUE
          }, 5000)
        })
      }

      // clearTrackingCookies()

      const path: Record<PaymentTypes, string> = {
        [paymentType.PIX]: 'pix',
        [paymentType.TICKET]: 'confirmacao-do-pedido',
        [paymentType.CREDITCARD]: 'confirmacao-do-pedido',
      }

      const redirectURL: string = path[selectedPaymentMethod as PaymentTypes]

      localStorage.removeItem(STORAGE_KEY_NAME)

      // location.href = buildURL(['/pagamento', redirectURL].join(SLASH_STRING), {
      //   order: response.data.transactionid,
      // })
    },

    /**
     * Envia os dados capturados para realização do pagamento no backend
     */
    async handlePostPayment <T extends PaymentTypes> (paymentMethod: T): Promise<ResponsePattern<PaymentResponseMap[T]>> {
      const defaultErrorMessage = 'Houve uma falhar ao finalizar o seu pedido'

      const {
        couponCode,
        deliveryPlace,
        selectedShippingMethod,

        isCreditCard,
        customerCreditCardHolder,

        shippingRecipient,

        customerCPF,
        customerMail,
        customerPhone,
        customerBirthDate,
      } = this

      try {
        const response = await fetch(`${CHECKOUT_BASE_PATH}/payment/process/${paymentMethod}/${getCartHandlerPath()}`, {
          ...buildRequestOptions([
            // ...getTrackingCookies(),
            // ...getMetaTrackingCookies(),
          ], HttpMethod.POST),
          body: stringify<PostOrder>({
            ...(!isNull(couponCode) && {
              coupon_code: couponCode,
            }),
            ...(!isNull(deliveryPlace) && {
              delivery_place: deliveryPlace,
            }),
            shipping_method: selectedShippingMethod as DeliveryCodes,
            customer: {
              name: isCreditCard
                ? customerCreditCardHolder
                : shippingRecipient,
              cpf: customerCPF,
              email: customerMail,
              phone: customerPhone,
              birthDate: customerBirthDate,
              ...this.getParsedAddresses,
            },
            ...(paymentMethod === paymentType.CREDITCARD && {
              credit_card_info: this.creditCardAdditionalInfo,
            }),
          }),
        })

        if (!response.ok) {
          const error = await response.json()

          return postErrorResponse.call<
            Response, [string], FunctionErrorPattern
          >(response, error?.message ?? defaultErrorMessage)
        }

        const data: PaymentResponseMap[T] = await response.json()

        return postSuccessResponse.call<
          Response, [PaymentResponseMap[T], ResponsePatternCallback?], FunctionSucceededPattern<PaymentResponseMap[T]>
        >(response, data)
      } catch (e) {
        return postErrorResponse(defaultErrorMessage)
      }
    },

    /**
     * Carrega a biblioteca do PagSeguro para gerar token para pedidos via cartão de crédito
     */
    loadPagSeguroLibrary () {
      const script = document.createElement('script')

      script.async = true
      script.src = 'https://assets.pagseguro.com.br/checkout-sdk-js/rc/dist/browser/pagseguro.min.js'
      script.onload = () => {
        this.isPagSeguroLoaded = true
      }

      document.head.appendChild(script)
    },

    /**
     * Captura as opções de parcelamento disponíveis para o valor do carrinho
     */
    async getInstallments <T extends InstallmentItem[]> (): Promise<ResponsePattern<T>> {
      const defaultErrorMessage = 'Falha ao capturar o parcelamento'

      const cartPath = getCartHandlerPath()

      try {
        const response = await fetch(`${CHECKOUT_BASE_PATH}/calculate_fees/${cartPath}`, {
          ...buildRequestOptions([], HttpMethod.POST),
          priority: 'high',
          body: stringify<GetInstallmentsBody>({
            amount: this.getOrderPrice,
            cardbin: numberOnly(this.customerCreditCardNumber).slice(0, 8),
          }),
        })

        if (!response.ok) {
          const error = await response.json()

          return postErrorResponse.call<
            Response, [string], FunctionErrorPattern
          >(response, error?.message ?? defaultErrorMessage)
        }

        const data: T = await response.json()

        return postSuccessResponse.call<
          Response, [T, ResponsePatternCallback?], FunctionSucceededPattern<T>
        >(response, data)
      } catch (e) {
        return postErrorResponse(defaultErrorMessage)
      }
    },

    /**
     * Captura e retorna o endereço do CEP solicitado
     */
    async captureAddress (addressType: AddressTypes, cep: string, oldCep: string, signal?: AbortSignal): Promise<boolean> {
      if (!regexTest(CEP_REGEX_VALIDATION, cep) || cep === oldCep) return false

      const targetField: `${AddressTypes}CEP` = `${addressType}CEP`

      const response = await searchAddress({
        cep,
        signal,
      })

      if (!response.succeeded) {
        this.setVisitedField(targetField)

        this.clearAddress(addressType)

        return false
      }

      this[`${addressType}Address`]      = response.data.logradouro
      this[`${addressType}Neighborhood`] = response.data.bairro
      this[`${addressType}State`]        = response.data.uf
      this[`${addressType}City`]         = response.data.localidade

      return true
    },

    /**
     * Limpa todos os campos do grupo de endereço selecionado
     */
    clearAddress (addressType: AddressTypes) {
      this[`${addressType}CEP`]          = EMPTY_STRING
      this[`${addressType}Address`]      = EMPTY_STRING
      this[`${addressType}Neighborhood`] = EMPTY_STRING
      this[`${addressType}State`]        = EMPTY_STRING
      this[`${addressType}City`]         = EMPTY_STRING
    },

    /**
     * Atualiza os dados de parcelamento
     */
    async refreshInstallments () {
      if (!this.isCreditCard || !this.isCreditCardGroupValid || this.getCreditCardToken.hasErrors) return

      this.installment = NULL_VALUE

      const response = await this.getInstallments()

      if (!response.succeeded) {
        // this.installmentMessage = response.message

        return
      }

      this.installment = response.data
    },

    /**
     * Permite a seleção da quantidade de parcelas usadas no cartão de crédito
     */
    setSelectedInstallmentsCount (installmentsCount: number): void {
      if (this.selectedInstallmentOption === installmentsCount) return

      this.selectedInstallmentOption = installmentsCount
    },
  },

  computed: {
    /**
     * Indica se existe um método de pagamento selecionado
     */
    hasSelectedPaymentMethod (): boolean {
      return !isNull(this.selectedPaymentMethod)
    },

    /**
     * Indica se o método de pagamento selecionado é "Cartão de crédito"
     */
    isCreditCard (): boolean {
      return this.selectedPaymentMethod === paymentType.CREDITCARD
    },

    /**
     * Indica se existe uma seleção para `deliveryPlace`
     */
    hasSelectedDeliveryPlace (): boolean {
      return !isNull(this.deliveryPlace)
    },

    /**
     * Indica se a seleção de `deliveryPlace` é `same`
     */
    isSameAddress (): boolean {
      return this.deliveryPlace === deliveryType.SAME
    },

    /**
     * Indica se a seleção de `deliveryPrice` é `diff`
     */
    isDiffAddress (): boolean {
      return this.deliveryPlace === deliveryType.DIFF
    },

    /**
     * Retorna o valor da parcela selecionada para o cartão de crédito
     */
    installmentPrice (): number {
      const {
        installment,
        selectedInstallmentOption,
      } = this

      if (!installment || !selectedInstallmentOption) return 0

      const selectedInstallment = installment.find(_installment => {
        return _installment.installments === selectedInstallmentOption
      })

      return selectedInstallment?.installment_value ?? 0
    },

    /**
     * Indica se `deliveryPlace` foi definido pelo usuário
     */
    hasSelectedAddress (): boolean {
      return !isNull(this.deliveryPlace)
    },

    /**
     * Lista dos produtos contidos no carrinho transformados para exibição no checkout
     */
    renderedProducts (): RenderedProduct[] {
      const {
        cart,
        betterPriceSystem,
      } = this

      if (!cart) return []

      return cart.items.map<RenderedProduct>(({ quantity, image_url, name, slug, ...rest }) => {
        const price = rest[betterPriceSystem]

        return {
          name,
          slug,
          quantity,
          price: BRLFormatter.format(price / 100),
          final_price: BRLFormatter.format(Math.round(price * quantity) / 100),
          image_style: `background-image: url('${image_url}')`,
        }
      })
    },

    /**
     * Indica se os dados da seção "Dados pessoais" são todos válidos após uma tentativa de submmissão
     */
    isPersonalDataValid (): boolean {
      const {
        submitted,
        customerMailValidation,
        customerBirthDateValidation,
        customerCPFValidation,
        customerPhoneValidation,
      } = this

      return !submitted || [
        customerMailValidation,
        customerBirthDateValidation,
        customerCPFValidation,
        customerPhoneValidation,
      ].every(Boolean)
    },

    /**
     * Realiza e retorna validação para o campo "E-mail'
     */
    customerMailValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.customerMailRef,
        !this.isVisitedField('customerMail') || regexTest(EMAIL_REGEX_VALIDATION, this.customerMail),
      )
    },

    /**
     * Realiza e retorna validação para o campo "Data de nascimento"
     */
    customerBirthDateValidation (): ISingleValidateCheckout {
      const {
        customerBirthDate,
      } = this

      return buildFieldValidation(
        this.customerBirthDateRef,
        !this.isVisitedField('customerBirthDate') || regexTest(DATE_REGEX_VALIDATION, customerBirthDate) && isDateValid(customerBirthDate),
      )
    },

    /**
     * Realiza e retorna a validação para o campo "CPF"
     */
    customerCPFValidation (): ISingleValidateCheckout {
      const {
        customerCPF,
      } = this

      return buildFieldValidation(
        this.customerCPFRef,
        !this.isVisitedField('customerCPF') || regexTest(CPF_REGEX_VALIDATION, customerCPF) && isCPFValid(customerCPF),
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Telefone"
     */
    customerPhoneValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.customerPhoneRef,
        !this.isVisitedField('customerPhone') || regexTest(PHONE_REGEX_VALIDATION, this.customerPhone),
      )
    },

    /**
     * Realiza e retorna a validação para a seleção de métodos de pagamento
     */
    paymentMethodValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.paymentMethodMessageRef,
        this.hasSelectedPaymentMethod,
      )
    },

    /**
     * Indica se os dados da seção "Cartão de crédito" são todos válidos
     */
    isCreditCardGroupValid (): boolean {
      return [
        this.customerCreditCardHolderValidation.valid,
        this.customerCreditCardNumberValidation.valid,
        this.customerCreditCardDateValidation.valid,
        this.customerCreditCardCVVValidation.valid,
      ].every(Boolean)
    },

    /**
     * Realiza e retorna a validação para o campo "Adicione o nome do titular do cartão"
     */
    customerCreditCardHolderValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.customerCreditCardHolderRef,
        !this.isVisitedField('customerCreditCardHolder') || regexTest(FULLNAME_REGEX_VALIDATION, trim(this.customerCreditCardHolder)),
        !this.isCreditCard,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Número do cartão de crédito"
     */
    customerCreditCardNumberValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.customerCreditCardNumberRef,
        !this.isVisitedField('customerCreditCardNumber') || regexTest(/^(\d{4})(\s\d{4}){2}(\s\d{3,4})$/, this.customerCreditCardNumber),
        !this.isCreditCard,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Data de expiração do cartão de crédito"
     */
    customerCreditCardDateValidation (): ISingleValidateCheckout {
      const { customerCreditCardDate } = this

      return buildFieldValidation(
        this.customerCreditCardDateRef,
        !this.isVisitedField('customerCreditCardDate') || regexTest(/^(1[012]|0[1-9])\/\d{2}$/, customerCreditCardDate) && isCreditCardExpireDateValid(customerCreditCardDate),
        !this.isCreditCard,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Código de segurança do cartão de crédito"
     */
    customerCreditCardCVVValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.customerCreditCardCVVRef,
        !this.isVisitedField('customerCreditCardCVV') || regexTest(/^\d{3,4}$/, this.customerCreditCardCVV),
        !this.isCreditCard,
      )
    },

    /**
     * Indica se os dados da seção "Endereço de cobrança" são todos válidos
     */
    isBillingAddressGroupValid (): boolean {
      return isNull(this.deliveryBillingAddressErrorMessage) && [
        this.billingCEPValidation,
        this.billingAddressValidation,
        this.billingNumberValidation,
        this.billingNeighborhoodValidation,
        this.billingCityValidation,
        this.billingStateValidation,
      ].every(validation => validation.valid)
    },

    /**
     * Realiza e retorna a validação para o campo "Adicione o CEP" no endereço de cobrança
     */
    billingCEPValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.billingCEPRef,
        !this.isVisitedField('billingCEP') || regexTest(CEP_REGEX_VALIDATION, this.billingCEP),
        !this.isCreditCard,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Adicione o endereço" no endereço de cobrança
     */
    billingAddressValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.billingAddressRef,
        !this.isVisitedField('billingAddress') || objectSize(this.billingAddress) > 2,
        !this.isCreditCard,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Adicione o número" do endereço de cobrança
     */
    billingNumberValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.billingNumberRef,
        !this.isVisitedField('billingNumber') || objectSize(this.billingNumber) > 0,
        !this.isCreditCard,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Adicione o bairro" do endereço de cobrança
     */
    billingNeighborhoodValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.billingNeighborhoodRef,
        !this.isVisitedField('billingNeighborhood') || objectSize(this.billingNeighborhood) > 0,
        !this.isCreditCard,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Adicione a cidade" do endereço de cobrança
     */
    billingCityValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.billingCityRef,
        !this.isVisitedField('billingCity') || objectSize(this.billingCity) > 2,
        !this.isCreditCard,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Adicione o estado" do endereço de cobrança
     */
    billingStateValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.billingStateRef,
        !this.isVisitedField('billingState') || includes(statesAcronym, this.billingState),
        !this.isCreditCard,
      )
    },

    /**
     * Realiza e retorna a validação para a seleção de `deliveryPlace`
     */
    deliveryPlaceValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.deliveryPlaceMessageRef,
        this.hasSelectedDeliveryPlace && isNull(this.deliveryPlaceAddressErrorMessage),
        !this.isCreditCard,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Destinatário"
     */
    shippingRecipientValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.shippingRecipientRef,
        !this.isVisitedField('shippingRecipient') || regexTest(/^(\w{2,})(\s+(\w+))+$/, normalizeText(this.shippingRecipient)),
        !this.shouldValidateShippingAddress,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Adicione o CEP" do endereço de entrega
     */
    shippingCEPValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.shippingCEPRef,
        !this.isVisitedField('shippingCEP') || regexTest(CEP_REGEX_VALIDATION, this.shippingCEP),
        !this.shouldValidateShippingAddress,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Adicione o endereço" do endereço de entrega
     */
    shippingAddressValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.shippingAddressRef,
        !this.isVisitedField('shippingAddress') || objectSize(this.shippingAddress) > 2,
        !this.shouldValidateShippingAddress,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Adicione o número" do endereço de entrega
     */
    shippingNumberValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.shippingNumberRef,
        !this.isVisitedField('shippingNumber') || objectSize(this.shippingNumber) > 0,
        !this.shouldValidateShippingAddress,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Adicione o bairro" do endereço de entrega
     */
    shippingNeighborhoodValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.shippingNeighborhoodRef,
        !this.isVisitedField('shippingNeighborhood') || objectSize(this.shippingNeighborhood) > 3,
        !this.shouldValidateShippingAddress,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Adicione a cidade" do endereço de entrega
     */
    shippingCityValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.shippingCityRef,
        !this.isVisitedField('shippingCity') || objectSize(this.shippingCity) > 2,
        !this.shouldValidateShippingAddress,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Adicione o estado" do endereço de entrega
     */
    shippingStateValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.shippingStateRef,
        !this.isVisitedField('shippingState') || includes(statesAcronym, this.shippingState),
        !this.shouldValidateShippingAddress,
      )
    },

    /**
     * Realiza e retorna a validação para a seleção das opções de parcelamento
     */
    installmentGroupValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.installmentsMessageRef,
        !isNull(this.selectedInstallmentOption),
        !this.isCreditCard || !this.paymentMethodValidation.valid,
      )
    },

    /**
     * Realiza e retorna a validação
     */
    shippingMethodValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.shippingMethodMessageRef,
        !isNull(this.selectedShippingMethod),
        !this.showShippingMethod,
      )
    },

    /**
     * Indica se o endereço de entrega deve ser validado
     */
    shouldValidateShippingAddress (): boolean {
      return this.isCreditCard
        ? this.hasSelectedDeliveryPlace && !this.isSameAddress
        : true
    },

    /**
     * Retorna os itens que necessitam de validação e não estão sendo ignorados
     */
    notIgnoredFields (): ISingleValidateCheckout[] {
      return [
        this.customerMailValidation,
        this.customerBirthDateValidation,
        this.customerCPFValidation,
        this.customerPhoneValidation,
        this.paymentMethodValidation,
        this.customerCreditCardHolderValidation,
        this.customerCreditCardNumberValidation,
        this.customerCreditCardDateValidation,
        this.customerCreditCardCVVValidation,
        this.billingCEPValidation,
        this.billingAddressValidation,
        this.billingNumberValidation,
        this.billingNeighborhoodValidation,
        this.billingCityValidation,
        this.billingStateValidation,
        this.deliveryPlaceValidation,
        this.shippingRecipientValidation,
        this.shippingCEPValidation,
        this.shippingAddressValidation,
        this.shippingNumberValidation,
        this.shippingNeighborhoodValidation,
        this.shippingCityValidation,
        this.shippingStateValidation,
        this.shippingMethodValidation,
        this.installmentGroupValidation,
      ].filter(({ ignoreIf }) => !ignoreIf)
    },

    /**
     * Retorna o primeiro elemento de `notIgnoredFields` que seja inválido
     */
    firstInvalidField (): Nullable<ISingleValidateCheckout> {
      return this.notIgnoredFields.find(({ valid }) => !valid) ?? NULL_VALUE
    },

    /**
     * Retorna as opções de método de entrega disponíveis para o cliente
     */
    deliveryOptions (): LabeledDeliveryOption[] {
      const {
        detailedShipping,
      } = this

      if (isNull(detailedShipping)) return []

      return detailedShipping.map(({ coProduto, pcFinal, prazoEntrega }) => {
        const optionLabel = coProduto === deliveryCodes.IMPRESSO
          ? 'entre 20 e 40 dias'
          : `${prazoEntrega} dias`

        return {
          coProduto,
          label: [
            getDeliveryCodeName(coProduto),
            BRLFormatter.format(pcFinal / 100),
            optionLabel
          ].join(' | '),
        }
      })
    },

    /**
     * Indica se os dados de método de entrega estão disponíveis
     */
    hasShippingDetails (): boolean {
      return isArray(this.detailedShipping) && objectSize(this.detailedShipping) > 0
    },

    /**
     * Indica se o bloco de seleção de método de entrega será exibido
     */
    showShippingMethod (): boolean {
      const {
        isCreditCard,
        hasShippingDetails,
        selectedPaymentMethod,
        hasSelectedDeliveryPlace,
      } = this

      if (isNull(selectedPaymentMethod)) return false

      return (hasShippingDetails && includes([paymentType.PIX, paymentType.TICKET], selectedPaymentMethod)) || (isCreditCard && hasSelectedDeliveryPlace)
    },

    /**
     * Retorna os endereços que serão enviados na requisição de pagamento
     */
    getParsedAddresses (): IParsedAddressContent {
      const parseState = (acronym: string) => includes(statesAcronym, acronym) ? acronym : EMPTY_STRING

      const parseComplement = (complement: string) => trim(complement).replace(/-+/g, EMPTY_STRING)

      const shippingComplement = parseComplement(this.shippingComplement)

      const shippingaddress = {
        zipPostalCode: numberOnly(this.shippingCEP),
        street: this.shippingAddress,
        number: this.shippingNumber,
        neighbourhood: this.shippingNeighborhood,
        city: this.shippingCity,
        state: parseState(this.shippingState),
        ...(shippingComplement) && {
          complement: shippingComplement,
        }
      } satisfies IParsedAddress

      const billingComplement = parseComplement(this.billingComplement)

      const billingaddress: IParsedAddress = {
        zipPostalCode: numberOnly(this.billingCEP),
        street: this.billingAddress,
        number: this.billingNumber,
        neighbourhood: this.billingNeighborhood,
        city: this.billingCity,
        state: parseState(this.billingState),
        ...(billingComplement && {
          complement: billingComplement,
        }),
      } satisfies IParsedAddress

      if (this.isCreditCard) {
        return {
          billingaddress,
          shippingaddress: this.isDiffAddress
            ? shippingaddress
            : billingaddress,
        }
      }

      return {
        shippingaddress,
      }
    },

    /**
     * Retorna as informações usadas para pagamento via Cartão de crédito
     */
    creditCardAdditionalInfo (): PostOrderCreditCard {
      const {
        installmentPrice,
        getCreditCardToken,
        customerCreditCardHolder,
        selectedInstallmentOption,
      } = this

      return {
        holderName: customerCreditCardHolder,
        creditCardToken: getCreditCardToken.encryptedCard ?? EMPTY_STRING,
        numberOfPayments: selectedInstallmentOption as number,
        installmentValue: installmentPrice,
      }
    },

    /**
     * Retorna os dados encriptados para o cartão de crédito
     */
    getCreditCardToken (): PagSeguroCardEncrypt {
      if (!this.isPagSeguroLoaded) {
        return {
          errors: [],
          hasErrors: false,
          encryptedCard: NULL_VALUE,
        }
      }

      if (!regexTest(/^\d{2}\/\d{2}$/, this.customerCreditCardDate) || objectSize(this.customerCreditCardCVV) < 3) {
        return {
          errors: [],
          hasErrors: false,
          encryptedCard: NULL_VALUE,
        }
      }

      const YEARS_IN_A_MILLENNIUM = 1000

      const {
        customerCreditCardCVV,
        customerCreditCardHolder,
        customerCreditCardNumber,
      } = this

      const [
        month,
        _year,
      ] = splitText(this.customerCreditCardDate, SLASH_STRING)

      const millennium = Math.floor(new Date().getFullYear() / YEARS_IN_A_MILLENNIUM) * YEARS_IN_A_MILLENNIUM

      return window.PagSeguro.encryptCard({
        expMonth: month,
        expYear: (millennium + parseInt(_year)).toString(),
        holder: customerCreditCardHolder,
        securityCode: customerCreditCardCVV,
        number: numberOnly(customerCreditCardNumber),
        publicKey: PAGSEGURO_PUBLIC_KEY,
      })
    },

    /**
     * Indica se a sessão de parcelamento deve ser exibida
     */
    showInstallmentSection (): boolean {
      // return this.isCreditCard && (objectSize(this.installment ?? []) > 0 || !isNull(this.installmentMessage))
      return this.isCreditCard && (objectSize(this.installment ?? []) > 0)
    },

    /**
     * Retorna as opções de parcelamento para exibição em tela
     */
    getParsedInstallments (): InstallmentItem<BRLString>[] {
      const { installment } = this

      if (!installment) return []

      return installment.map(({ installments, installment_value }) => ({
        installments,
        installment_value: BRLFormatter.format(installment_value / 100) as BRLString,
      }))
    },

    /**
     * Indica qual grupo de preços é mais vantajoso para o usuário
     */
    betterPriceSystem (): PriceTypes {
      // TODO
      // const {
      //   cart,
      //   isSubscriber,
      // } = this

      return priceType.PRICE

      // TODO: exibir corretamente os preços para assinante na v2
      // if (!cart) return priceType.PRICE
      //
      // if (isSubscriber) {
      //   return priceType.FULL_PRICE
      // }
      //
      // return priceType.PRICE
    },

    /**
     * Indica se o bloco que exibe o valor de frete será exibido ao usuário
     */
    showDeliveryPrice (): boolean {
      return objectSize(this.deliveryOptions) > 0 && !isNull(this.selectedShippingMethod)
    },

    /**
     * Retorna o subtotal do pedido
     */
    getOrderSubtotal (): number {
      const {
        cart,
        betterPriceSystem,
      } = this

      if (!cart) return 0

      const {
        order_price,
        order_full_price,
      } = cart

      const prices = {
        price: order_price,
        full_price: order_full_price,
      } satisfies Record<PriceTypes, number>

      return prices[betterPriceSystem]
    },

    /**
     * Retorna o valor de `getOrderSubtotal` formatado em BRL
     */
    getOrderSubtotalFormatted (): string {
      return BRLFormatter.format(this.getOrderSubtotal / 100)
    },

    /**
     * Retorna o valor total do pedido
     */
    getOrderPrice (): number {
      const finalPrice = [
        this.getOrderSubtotal,
        this.getShippingPrice,
      ]

      return decimalRound(
        finalPrice.reduce((value, currentPrice) => value + currentPrice, 0),
        2,
      )
    },

    /**
     * Retorna o valor de `getOrderPrice` formatado em BRL
     */
    getOrderPriceFormatted (): string {
      return BRLFormatter.format(this.getOrderPrice / 100)
    },

    /**
     * Retorna o valor do frete para os itens do pedido
     */
    getShippingPrice (): number {
      const {
        detailedShipping,
        selectedShippingMethod,
      } = this

      if (!detailedShipping || !selectedShippingMethod) return 0

      const selectedShippingGroup = detailedShipping.find(shippingProduct => {
        return shippingProduct.coProduto === selectedShippingMethod
      })

      return selectedShippingGroup
        ? selectedShippingGroup.pcFinal
        : 0
    },

    /**
     * Retorna o valor de `getShippingPrice` formatado em BRL
     */
    getShippingPriceFormatted (): string {
      return BRLFormatter.format(this.getShippingPrice / 100)
    },
  },

  watch: {
    /**
     * Observa as modificações realizadas no CEP do endereço de cobrança
     */
    async billingCEP (cep: string, oldCEP: string, cleanup: OnCleanup): Promise<void> {
      if (!regexTest(CEP_REGEX_VALIDATION, cep)) return

      const controller = new AbortController()

      cleanup(() => controller.abort())

      const succeeded = await this.captureAddress(addressType.BILLING, cep, oldCEP, controller.signal)

      if (!succeeded) {
        scrollIntoView(this.billingCEPRef, SCROLL_INTO_VIEW_DEFAULT_ARGS)

        return
      }
    },

    /**
     * Observa as modificações realizadas no CEP do endereço de entrega
     */
    // shippingCEP: Este método foi movido para o hook `created`

    /**
     * Observa as modificações realizadas no valor total do pedido
     */
    getOrderPrice: {
      immediate: true,
      handler: function (): void {
        this.debouncedOrderPrice?.()
      },
    },

    /**
     * Observa as modificações realizadas no token de encriptação gerado pelo PagSeguro
     */
    getCreditCardToken (payload: PagSeguroCardEncrypt, oldPayload: PagSeguroCardEncrypt): void {
      if (payload.hasErrors || payload.hasErrors === oldPayload.hasErrors) return

      this.refreshInstallments()
    },
  },

  directives: {
    /**
     * Pode ser usada com o atributo "v-trim"
     * Remove espaços antes e depois do conteúdo de um campo de texto
     */
    trim: buildMaskDirective(trim),

    /**
     * Pode ser usada com o atributo "v-numbers-only"
     * Remove qualquer caractere não númerico do conteúdo do campo que recebeu o atributo
     */
    numbersOnly: buildMaskDirective(numberOnly),

    /**
     * Pode ser usada com o atributo "v-visited-field"
     * Realiza a inclusão do campo do nome indicado na lista de elementos visitados
     */
    visitedField: {
      mounted (el: HTMLInputElement, { value, instance }: DirectiveBinding<string>) {
        const remover = attachEvent(el, 'blur', () => {
          // TODO: Encontrar maneira de tipar corretamente a instância do componente abaixo
          // @ts-ignore
          instance.setVisitedField(value)

          eventMap.delete(el)
        }, { once: true })

        eventMap.set(el, remover)
      },

      unmounted: cleanupDirective,
    },

    /**
     * Pode ser usada com o atributo "v-mask-date"
     * Realiza a aplicação de uma máscara de data ao campo que recebe o atributo
     */
    maskDate: buildMaskDirective(numberOnly, maskDate),

    /**
     * Pode ser usada com o atributo "v-mask-cpf"
     * Realiza a aplicação de uma máscara para a numeração inserida no campo que recebe o atributo
     */
    maskCpf: buildMaskDirective(numberOnly, maskCPFNumber),

    /**
     * Pode ser usada com o atributo "v-mask-phone"
     * Realiza a aplicação de uma máscara para a numeração inserida no campo que recebe o atributo
     */
    maskPhone: buildMaskDirective(numberOnly, maskPhoneNumber),

    /**
     * Pode ser usada com o atributo "v-uppercase"
     * Realiza a transformação dos caracteres inseridos no campo que recebeu o atributo para maiúsculas
     */
    uppercase: buildMaskDirective(toUpperCase),

    /**
     * Pode ser usada com o atributo "v-normalize"
     * Realiza a limpeza dos dados incluídos no campo que recebeu o atributo
     */
    normalize: buildMaskDirective(normalizeText),

    /**
     * Pode ser usado com o atributo "v-remove-duplicated-spaces"
     * Realiza a remoção de espaços duplicados no campo que recebeu o atributo
     */
    removeDuplicatedSpaces: buildMaskDirective(replaceDuplicatedSpaces),

    /**
     * Pode ser usado com o atributo "v-mask-credit-card-number"
     * Realiza a aplicação de máscara para a numeração inserida no campo que receber o atributo
     */
    maskCreditCardNumber: buildMaskDirective(numberOnly, maskCardNumber),

    /**
     * Pode ser usado com o atributo "v-mask-credit-card-date"
     * Realiza a aplicação de máscara para a numeração inserida no campo que receber o atributo
     */
    maskCreditCardDate: buildMaskDirective(numberOnly, maskCardDate),

    /**
     * Pode ser usado com o atributo "v-mask-cep"
     * Realiza a aplicação de máscara para a numeração inserida no campo que receber o atributo
     */
    maskCep: buildMaskDirective(numberOnly, maskCEP),
  },
})

const checkoutApp = createApp(CheckoutComponent)

checkoutApp.mount('#fechamentodopedido')

window.addEventListener('pageshow', (e) => {
  if (e.persisted) window.location.reload()
})
