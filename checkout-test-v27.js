// ==UserScript==
// @name         Checkout Contra Corrente
// @namespace    http://tampermonkey.net/
// @version      2025-03-27
// @description  try to take over the world!
// @author       You
// @match        https://contracorrente-ecomm.webflow.io/checkout*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=webflow.io
// @grant        none
// ==/UserScript==


/**
 *
 * @typedef AbandonmentResponse
 * @property {number} abandoment_id
 */

/**
 * @typedef {'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO' | 'MA' | 'MS' | 'MT' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI' | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO'} BrazilianStates
 */


/**
 * @typedef {'PAC' | 'Sedex' | 'Impresso'} DeliveryOptionLabel
 */

/**
 * @typedef Prices
 * @property {number} sale - preço normal de venda
 * @property {number} coupon - preço normal de venda após a aplicação de um cupom de desconto
 * @property {number} subscription - preço de venda para um assinante (30% off)
 */

/**
 * @typedef ProductResponse
 * @property {number} id - ID do livro no Xano
 * @property {string} product_id - ID do livro no Webflow
 * @property {string} slug - Slug do livro
 * @property {number} width - Largura do livro
 * @property {number} height - Altura do livro
 * @property {number} length - Profundidade do livro
 * @property {number} weight - Peso do livro
 * @property {number} price - Preço de venda do produto
 * @property {number} full_price - Preço do produto sem desconto
 * @property {string} image - URL da thumbnail do produto
 * @property {string} ISBN - Código ISBN deste livro
 * @property {number} created_at - Timestamp do momento da criação do registro
 */

/**
 * @typedef  {object} sProduct
 * @property {HTMLElement} element
 * @property {number}      quantity
 * @property {string}      slug
 */

/**
 * @typedef InstallmentOptionPrice
 * @property {number}  quantity
 * @property {number}  installmentAmount
 * @property {number}  totalAmount
 * @property {boolean} interestFree
 */

const GENERAL_HIDDEN_CLASS = 'oculto'

const AUTH_COOKIE_NAME = '__Host-cc-AuthToken'

const blurEvent = new Event('blur')

const COOKIE_SEPARATOR = '; '

const PIX_TOKEN_NAME = 'pix'
const TICKET_TOKEN_NAME = 'ticket'
const CREDIT_CARD_TOKEN_NAME = 'creditcard'

const DELIVERY_PLACE_SAME_TOKEN = 'same'
const DELIVERY_PLACE_DIFF_TOKEN = 'diff'

const ALLOWED_PAYMENT_METHODS = [
  PIX_TOKEN_NAME,
  TICKET_TOKEN_NAME,
  CREDIT_CARD_TOKEN_NAME
]

const IMPRESSO_TOKEN_NAME = '20133'
const PAC_TOKEN_NAME = '03298'
const SEDEX_TOKEN_NAME = '03220'

const ALLOWED_SHIPPING_METHODS = [
  IMPRESSO_TOKEN_NAME,
  PAC_TOKEN_NAME,
  SEDEX_TOKEN_NAME
]

const COUPON_ISBN_TOKEN = 'isbn'
const COUPON_SHIPPING_TOKEN = 'shipping'
const COUPON_SUBTOTAL_TOKEN = 'subtotal'

const ALLOWED_COUPON_TYPES = [
  COUPON_ISBN_TOKEN,
  COUPON_SHIPPING_TOKEN,
  COUPON_SUBTOTAL_TOKEN
]

const PRICE_TOKEN = 'price'
const FULL_PRICE_TOKEN = 'full_price'

const ADDRESS_BILLING_TYPE = 'billing'
const ADDRESS_SHIPPING_TYPE = COUPON_SHIPPING_TOKEN

const PAYMENT_URL_BASE = 'https://xef5-44zo-gegm.b2.xano.io/api:y0t3fimN'

const statesMap = {
  'AC': 'Acre',
  'AL': 'Alagoas',
  'AP': 'Amapá',
  'AM': 'Amazonas',
  'BA': 'Bahia',
  'CE': 'Ceará',
  'DF': 'Distrito Federal',
  'ES': 'Espírito Santo',
  'GO': 'Goiás',
  'MA': 'Maranhão',
  'MT': 'Mato Grosso',
  'MS': 'Mato Grosso do Sul',
  'MG': 'Minas Gerais',
  'PA': 'Pará',
  'PB': 'Paraíba',
  'PR': 'Paraná',
  'PE': 'Pernambuco',
  'PI': 'Piauí',
  'RJ': 'Rio de Janeiro',
  'RN': 'Rio Grande do Norte',
  'RS': 'Rio Grande do Sul',
  'RO': 'Rondônia',
  'RR': 'Roraima',
  'SC': 'Santa Catarina',
  'SP': 'São Paulo',
  'SE': 'Sergipe',
  'TO': 'Tocantins'
}

const sProductNodes = document.querySelector('[data-ref="sProduct"]')

/**
 * @param text {string}
 */
function keepNumberOnly (text) {
  return text.replace(/\D+/g, '')
}

/**
 * @param arg {any}
 * @returns   {boolean}
 */
function isArray (arg) {
  return Array.isArray(arg)
}

/**
 * @param message {string}
 * @returns       {PostErrorResponse}
 */
function postErrorResponse (message) {
  return {
    message,
    succeeded: false
  }
}

/**
 * @template T
 * @param response {T}
 * @returns        {PostSuccessResponse<T>}
 */
function postSuccessResponse (response) {
  return {
    data: response,
    succeeded: true
  }
}

/**
 * @param name    {string}
 * @param value   {string | number | boolean}
 * @param options {cookieOptions}
 * @returns       {string}
 */
function setCookie (name, value, options = {}) {
  if (typeof name !== 'string' || name.length === 0) {
    throw new Error("'setCookie' should receive a valid cookie name")
  }

  if (!['string', 'number', 'boolean'].includes(typeof value) || value.toString().length === 0) {
    throw new Error("'setCookie' should receive a valid cookie value")
  }

  /** @type {string[]} */
  const cookieOptions = [`${name}=${value}`]

  if (options?.expires && options?.expires instanceof Date) {
    cookieOptions.push(`expires=` + options.expires.toGMTString())
  }

  if (options?.sameSite && typeof options?.sameSite === 'string') {
    cookieOptions.push(`SameSite=${options?.sameSite}`)
  }

  if (options?.path && typeof options.path === 'string') {
    cookieOptions.push(`path=${options?.path}`)
  }

  if (options?.domain && typeof options.domain === 'string') {
    cookieOptions.push(`domain=${options?.path}`)
  }

  if (options?.httpOnly && typeof options.httpOnly === 'boolean') {
    cookieOptions.push(`HttpOnly`)
  }

  if (options?.secure && typeof options.secure === 'boolean') {
    cookieOptions.push('Secure')
  }

  const _buildCookie = cookieOptions.join(COOKIE_SEPARATOR)

  document.cookie = _buildCookie

  return _buildCookie
}

/**
 * @param name {string}
 * @returns    {string | false}
 */
function getCookie (name) {
  const selectedCookie = document.cookie
    .split(COOKIE_SEPARATOR)
    .find(cookie => {
      const { name: cookieName } = splitCookie(cookie)

      return cookieName === name
    })

  return selectedCookie
    ? splitCookie(selectedCookie).value
    : false
}

/**
 * @param cookie {string}
 * @returns      {splitCookieObject}
 */
function splitCookie (cookie) {
  const [name, value] = cookie.split('=')

  return {
    name,
    value
  }
}

/**
 * @param num           {number}
 * @param decimalPlaces {number}
 * @returns             {number}
 */
function naiveRound (num, decimalPlaces = 0) {
  const p = Math.pow(10, decimalPlaces)

  return Math.round(num * p) / p
}

/**
 * @param node      {HTMLElement | Document}
 * @param eventName {string}
 * @param callback  {EventListener | EventListenerObject}
 * @param options=  {boolean | AddEventListenerOptions}
 */
function attachEvent (node, eventName, callback, options) {
  node.addEventListener(eventName, callback, options)
}

/**
 * @param selector {keyof HTMLElementTagNameMap | string}
 * @param node     {HTMLElement | Document} - optional
 * @returns        {HTMLElementTagNameMap[keyof HTMLElementTagNameMap] | null}
 */
function querySelector (selector, node = document) {
  return node.querySelector(selector)
}

/**
 * @param element {HTMLElement}
 * @param args    {boolean | ScrollIntoViewOptions}
 */
function scrollIntoView (element, args) {
  element.scrollIntoView(args)
}

/**
 * @param status {boolean}
 */
function isPageLoading (status) {
  querySelector('body').classList.toggle('noscroll', status)
  querySelector('[data-wtf-loader]').classList.toggle(GENERAL_HIDDEN_CLASS, !status)
}

/**
 * @param text {string}
 * @returns    {string}
 */
function normalizeText (text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const {
  ref,
  createApp
} = Vue;

const contraCorrenteVueApp = createApp({
  setup () {
    const sProduct = ref([])

    const customerEmailModel = ref('')
    const customerPhoneModel = ref('')
    const customerCPFCNPJModel = ref('')
    const customerBirthdataModel = ref('')

    const creditCardNumber = ref('')
    const creditCardName = ref('')
    const creditCardCode = ref('')
    const creditCardDate = ref('')

    const customerCardName = ref(null)
    const customerCardCode = ref(null)
    const customerCardDate = ref(null)
    const customerCardNumber = ref(null)

    const creditCardToken = ref('')

    const customerMail = ref('')
    const customerPhone = ref('')
    const customerCPFCNPJ = ref('')
    const customerBirthdate = ref('')

    const customerShippingSender = ref(null)
    const customerShippingCEP = ref(null)
    const customerShippingAddress = ref(null)
    const customerShippingNumber = ref(null)
    const customerShippingComplement = ref(null)
    const customerShippingNeighborhood = ref(null)
    const customerShippingCity = ref(null)
    const customerShippingState = ref(null)

    const customerBillingCEP = ref(null)
    const customerBillingAddress = ref(null)
    const customerBillingNumber = ref(null)
    const customerBillingComplement = ref(null)
    const customerBillingNeighborhood = ref(null)
    const customerBillingCity = ref(null)
    const customerBillingState = ref(null)

    const billingCEP = ref('')
    const billingAddress = ref('')
    const billingNumber = ref('')
    const billingComplement = ref('')
    const billingNeighborhood = ref('')
    const billingCity = ref('')
    const billingState = ref('')

    const shippingCEP = ref('')
    const shippingSender = ref('')
    const shippingAddress = ref('')
    const shippingNumber = ref('')
    const shippingComplement = ref('')
    const shippingNeighborhood = ref('')
    const shippingCity = ref('')
    const shippingState = ref('')

    const cupomCode = ref('')
    const cupomData = ref({})
    const coupomErrorMessage = ref('')
    const coupomSuccessMessage = ref('')

    const shippingMethodMessage = ref(null)
    const shippingAddressMessage = ref(null)
    const installmentCountMessage = ref(null)

    return {
      sProduct,

      customerEmailModel,
      customerPhoneModel,
      customerCPFCNPJModel,
      customerBirthdataModel,

      customerCardName,
      customerCardCode,
      customerCardDate,
      customerCardNumber,

      creditCardNumber,
      creditCardName,
      creditCardCode,
      creditCardDate,
      creditCardToken,

      customerMail,
      customerPhone,
      customerCPFCNPJ,
      customerBirthdate,

      customerShippingSender,
      customerShippingCEP,
      customerShippingAddress,
      customerShippingNumber,
      customerShippingComplement,
      customerShippingNeighborhood,
      customerShippingCity,
      customerShippingState,

      customerBillingCEP,
      customerBillingAddress,
      customerBillingNumber,
      customerBillingComplement,
      customerBillingNeighborhood,
      customerBillingCity,
      customerBillingState,

      billingCEP,
      billingAddress,
      billingNumber,
      billingNeighborhood,
      billingCity,
      billingState,

      shippingCEP,
      shippingSender,
      shippingAddress,
      shippingNumber,
      shippingNeighborhood,
      shippingCity,
      shippingState,

      cupomCode,
      cupomData,
      coupomSuccessMessage,

      shippingMethodMessage,
      shippingAddressMessage,
      installmentCountMessage,

      subscriptionDiscount: 0.3 // means 30 percent
    }
  },

  data () {
    return {
      loadingShipping: false,
      isPagSeguroLoaded: false,

      submitted: false,
      betterSubscriptionDiscount: false,

      isLoading: false,
      savedEmail: false,
      abandonmentID: null,
      errorMessageOrderValidation: null,

      validationFeedback: [],

      shippingTax: 1.15,

      brandName: null,
      senderHash: null,

      deliveryPlace: null,
      deliveryPlaces: [
        {
          token: DELIVERY_PLACE_SAME_TOKEN,
          label: 'Entregar meu pedido no mesmo endereço de cobrança do cartão'
        },
        {
          token: DELIVERY_PLACE_DIFF_TOKEN,
          label: 'Cadastrar um endereço diferente para a entrega do meu pedido'
        }
      ],

      productsCorreios: {
        [IMPRESSO_TOKEN_NAME]: 'Impresso',
        [PAC_TOKEN_NAME]: 'PAC',
        [SEDEX_TOKEN_NAME]: 'Sedex',
      },

      selectedPayment: null,
      availablePayments: [
        {
          method: CREDIT_CARD_TOKEN_NAME,
          label: 'Cartão de crédito'
        },
        {
          method: TICKET_TOKEN_NAME,
          label: 'Boleto'
        },
        // {
        //   method: PIX_TOKEN_NAME,
        //   label: 'PIX'
        // }
      ],
      shippingDetails: [],
      selectedShipping: '',
      productsResponse: [],

      installments: [],
      selectedInstallmentOption: null,

      xanoProductsAPI: 'https://xef5-44zo-gegm.b2.xano.io/api:RJyl42La/query_products',

      statesAcronym: Object.keys(statesMap),

      user: null,

      billingAddressesLoaded: 0,
      shippingAddressesLoaded: 0
    }
  },

  async mounted () {
    this.getProductsElements()

    await Promise.allSettled([
      this.queryProducts(),
      this.getUser(1)
    ])

    if (this.user !== null) {
      this.customerEmailModel = this.user.email
      this.customerPhoneModel = this.user.telephone
      this.customerCPFCNPJModel = this.user.cpf

      const date = this.user.birthday

      if (date !== null && /^(19|20|21)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|1\d|2[0-8])$|^(19|20|21)\d{2}-(0[13-9]|1[0-2])-(29|30)$|^(19|20|21)\d{2}-(0[13578]|1[02])-31$/.test(date)) {
        this.customerBirthdataModel = new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')
      }
    }

    isPageLoading(false)

    await Promise.allSettled([
      this.queryShippingPrice()
    ])

    this.$refs.customerMail.addEventListener('blur', (e) => {
      if (this.savedEmail || !e.target.validity.valid) return

      this.saveCart(e.target.value)
    }, false)
  },

  watch: {
    /**
     * @param isCreditCardPayment {boolean}
     */
    isCreditCardPayment (isCreditCardPayment) {
      if (!isCreditCardPayment || this.isPagSeguroLoaded) return

      this.loadPagSeguroDirectPayment()
    },

    /**
     * @param cep    {string}
     * @param oldCEP {string}
     * @returns      {Promise<boolean | void>}
     */
    async shippingCEP (cep, oldCEP) {
      const cleanCEP = keepNumberOnly(cep)

      if (cleanCEP.length < 8 || cleanCEP === oldCEP) return;

      const addressInfo = await getAddressInfo(cleanCEP)

      this.shippingAddress = addressInfo?.logradouro ?? '';
      this.shippingNeighborhood = addressInfo?.bairro ?? '';
      this.shippingCity = addressInfo?.localidade ?? '';
      this.shippingState = addressInfo?.uf ?? '';

      if (addressInfo.hasOwnProperty('erro')) {
        this.shippingCEP = ''

        return this.customerShippingCEP?.dispatchEvent(blurEvent)
      }

      this.shippingCEP = addressInfo.cep;

      saveCEP(keepNumberOnly(addressInfo.cep))

      await this.queryShippingPrice()
    },

    /**
     * @param cep    {string}
     * @param oldCEP {string}
     * @returns      {Promise<boolean | void>}
     */
    async billingCEP (cep, oldCEP) {
      const cleanCEP = keepNumberOnly(cep);

      if (cleanCEP.length < 8 || cleanCEP === oldCEP) return

      const addressInfo = await getAddressInfo(cleanCEP)

      this.billingAddress = addressInfo?.logradouro ?? ''
      this.billingNeighborhood = addressInfo?.bairro ?? ''
      this.billingCity = addressInfo?.localidade ?? ''
      this.billingState = addressInfo?.uf ?? ''

      if (addressInfo.hasOwnProperty('erro')) {
        this.billingCEP = ''

        return this.customerBillingCEP?.dispatchEvent(blurEvent)
      }

      this.billingCEP = addressInfo.cep

      if (!this.deliveryPlace || this.deliveryPlace === DELIVERY_PLACE_SAME_TOKEN) {
        saveCEP(keepNumberOnly(addressInfo.cep))

        await this.queryShippingPrice()
      }
    },

    /**
     * @param date    {string}
     * @param oldDate {string}
     */
    creditCardDate (date, oldDate) {
      const cleanDate = keepNumberOnly(date)

      if (cleanDate.length < 3 || date === oldDate) return

      this.creditCardDate = date.replace(/(\d{2})(\d{1,2})/, '$1/$2')
    },

    /**
     * @param cardNumber    {string}
     * @param cardOldNumber {string}
     */
    async creditCardNumber (cardNumber, cardOldNumber) {
      const cleanCardNumber = keepNumberOnly(cardNumber).slice(0, 8)
      const cleanCardOldNumber = keepNumberOnly(cardOldNumber).slice(0, 8)

      if (cleanCardNumber.length < 8 || cleanCardNumber === cleanCardOldNumber) return

      await this.captureInstallments()
    },

    totalOrder () {
      if (!this.isCreditCardPayment) return

      this.captureInstallments()
    },

    /**
     * @param deliveryPlace    {DeliveryPlace}
     * @param oldDeliveryPlace {DeliveryPlace}
     */
    deliveryPlace (deliveryPlace, oldDeliveryPlace) {
      if (this.isCreditCardPayment) {
        this.selectedShipping = ''
      }

      if (deliveryPlace === DELIVERY_PLACE_SAME_TOKEN) {
        if (!/^\d{5}-\d{3}$/.test(this.billingCEP)) {
          this.clearShippingDetails()

          return destroyCEP()
        }

        saveCEP(keepNumberOnly(this.billingCEP))
      }

      if (deliveryPlace === DELIVERY_PLACE_DIFF_TOKEN) {
        if (!/^\d{5}-\d{3}$/.test(this.shippingCEP)) {
          this.clearShippingDetails()

          return destroyCEP()
        }

        saveCEP(keepNumberOnly(this.shippingCEP))
      }

      this.queryShippingPrice()
    }
  },

  methods: {
    /**
     * @returns {Promise<void>}
     */
    async captureInstallments () {
      const response = await this.getInstallments()

      this.selectedInstallmentOption = null

      this.installments = response.succeeded
        ? response.data
        : []
    },

    loadPagSeguroDirectPayment () {
      const script = document.createElement('script')

      script.defer = true
      script.type = 'text/javascript'
      script.src = 'https://assets.pagseguro.com.br/checkout-sdk-js/rc/dist/browser/pagseguro.min.js'
      script.onload = () => {
        this.isPagSeguroLoaded = true
      }

      document.head.appendChild(script)
    },

    /**
     * @returns {boolean}
     */
    hasAuthToken () {
      return getCookie(AUTH_COOKIE_NAME) !== false
    },

    /**
     * @param remainingTries {number}
     * @returns              {Promise<boolean>}
     */
    async getUser (remainingTries = 3) {
      if (remainingTries < 1 || getCookie(AUTH_COOKIE_NAME) === false) {
        return false
      }

      try {
        const response = await fetch('https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': getCookie(AUTH_COOKIE_NAME)
          }
        })

        if (!response.ok) {
          return this.getUser(remainingTries - 1)
        }

        /** @type {AuthMe} */
        const data = await response.json()

        this.user = data

        const { itemsReceived, itemsTotal } = data.address

        this.shippingAddressesLoaded = itemsReceived
        this.billingAddressesLoaded  = itemsReceived

        return true
      } catch (e) {
        return false
      }
    },

    /**
     * @param module         {AddressType}
     * @param remainingTries {number}
     * @returns              {Promise<void>}
     */
    async handleSearchAddresses (module, remainingTries = 3) {
      isPageLoading(true)

      if (remainingTries === 0) {
        isPageLoading(false)

        return
      }

      if (this.getAddresses.length > 1) {
        isPageLoading(false)

        return this.updateMaxDisplayingAddresses(module)
      }

      const response = await fetch('https://xef5-44zo-gegm.b2.xano.io/api:pdkGUSNn/user_address?per_page=999&offset=1', {
        method: 'GET',
        headers: {
          'Authorization': getCookie(AUTH_COOKIE_NAME)
        }
      })

      if (!response.ok) {
        return this.handleSearchAddresses(module, remainingTries - 1)
      }

      /** @type {AuthMeAddressItems} */
      const data = await response.json()

      this.user.address = Object.assign(this.user.address, {
        curPage: data.curPage,
        nextPage: data.nextPage,
        items: data.items.concat(this.user.address.items)
      })

      this.updateMaxDisplayingAddresses(module)

      isPageLoading(false)
    },

    /**
     * @param module {AddressType}
     */
    updateMaxDisplayingAddresses (module) {
      switch (module) {
        case ADDRESS_BILLING_TYPE:
          this.billingAddressesLoaded = this.getAddresses.length
          break
        case ADDRESS_SHIPPING_TYPE:
          this.shippingAddressesLoaded = this.getAddresses.length
      }
    },

    /**
     * @param id     {string}
     * @param module {AddressType}
     */
    setBillingUserAddress (id, module) {
      /** @type {UserAddress} */
      const address = this.user?.address?.items?.find(address => address.id === id)

      if (!address) return;

      switch (module) {
        case ADDRESS_BILLING_TYPE:
          this.billingCEP = address.cep
          this.billingAddress = address.address
          this.billingNumber = address.number
          this.billingNeighborhood = address.neighborhood
          this.billingCity = address.city
          this.billingState = address.state

          break
        case ADDRESS_SHIPPING_TYPE:
          this.shippingCEP = address.cep
          this.shippingAddress = address.address
          this.shippingNumber = address.number
          this.shippingNeighborhood = address.neighborhood
          this.shippingCity = address.city
          this.shippingState = address.state
      }
    },

    /**
     * @param email {string}
     * @returns     {Promise<void>}
     */
    async saveCart (email) {
      try {
        const response = await fetch('https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/cart_abandonment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            products: this.productsResponse.map(({ ISBN }) => ISBN)
          })
        })

        if (!response.ok) return

        this.savedEmail = true

        /** @type {AbandonmentResponse} */
        const response_data = await response.json()

        this.abandonmentID = response_data.abandoment_id
      } catch (e) {
      }
    },

    /**
     * @param name           {string}
     * @param remainingTries {number}
     */
    async updateCartName (name, remainingTries = 3) {
      if (remainingTries < 1 || this.abandonmentID === null) return

      try {
        const response = await fetch(`https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/cart_abandonment/${this.abandonmentID}`, {
          method: 'PUT',
          body: JSON.stringify({ name }),
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          await this.updateCartName(name, remainingTries - 1)

          return
        }

        this.abandonmentID = null
      } catch (e) {}
    },

    /**
     * @param fieldname {string}
     */
    runValidations (fieldname) {
      if (this.validationFeedback.includes(fieldname)) return

      this.validationFeedback.push(fieldname)

      if (fieldname === 'cardHolder') {
        this.updateCartName(this.creditCardName)
      }
    },

    handleblur () {
      // this.queryCardBrand(this.creditCardNumber)

      this.runValidations('cardNumber')
    },

    handleSelectInstallment (quantity) {
      this.selectedInstallmentOption = quantity
    },

    // getInstallments (creditCardBrandName, remainingTries = 3) {
    //   if (remainingTries === 0) return
    //
    //   const { getProductsSubtotal, getShippingPrice, discount, totalOrderPrice } = this
    //
    //   PagSeguroDirectPayment.getInstallments({
    //     amount: totalOrderPrice,
    //     maxInstallmentNoInterest: 6, // máximo de parcelas sem juros
    //     brand: creditCardBrandName,
    //     success: response => {
    //       this.installments = response
    //     },
    //     error: response => this.getInstallments(creditCardBrandName, remainingTries - 1)
    //   });
    // },

    getProductsElements () {
      const nodelist = document.querySelectorAll('[data-ref="sProduct"]')

      this.sProduct = Array.from({ length: nodelist.length }, (_, index) => {
        const curNode = nodelist[index]

        return {
          element: curNode,
          slug: this.getSlugFromProductElement({ element: curNode }),
          quantity: parseInt(curNode.querySelector('[data-item-quantity="true"]').textContent)
        }
      })
    },

    getSlugFromProductElement (productNode) {
      const anchorElement = productNode.element.querySelector('[data-slug="true"]')

      return anchorElement.href.split('/').at(-1)
    },

    async queryProducts () {
      try {
        const {
          xanoProductsAPI,
          getProductsSlugs
        } = this

        const response = await fetch(xanoProductsAPI, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            slugs: getProductsSlugs
          })
        })

        if (!response.ok) {
          location.reload()

          return
        }

        this.productsResponse = await response.json()
      } catch (e) {
        location.reload()
      }
    },

    /**
     * @returns {Promise<void>}
     */
    async queryShippingPrice () {
      const response = await this.getShippingPriceAndDeadline()

      if (!response.succeeded) return

      this.shippingDetails = response.data

      // const { sProduct } = this
      //
      // /** @type {ProductResponse[]} */
      // const productsResponse = this.productsResponse
      //
      // if (productsResponse.length === 0 || !hasCEPStoraged()) return null
      //
      // const params = {
      //   accPeso: 0,
      //   accAltura: 0,
      //   accLargura: 0,
      //   accComprimento: 0
      // }
      //
      // for (let i = 0, len = sProduct.length; i < len; i++) {
      //   const { quantity, slug } = sProduct[i]
      //   const {
      //     weight: pesoResponse,
      //     height: alturaResponse,
      //     width: larguraResponse,
      //     length: comprimentoResponse
      //   } = productsResponse?.find(product => product?.slug === slug) ?? {};
      //
      //   const {
      //     peso,
      //     altura,
      //     largura,
      //     comprimento
      //   } = measureProducts({
      //     quantity,
      //     peso: pesoResponse,
      //     altura: alturaResponse,
      //     largura: larguraResponse,
      //     comprimento: comprimentoResponse
      //   });
      //
      //   params.accPeso += peso;
      //   params.accAltura += altura;
      //   params.accLargura += largura;
      //   params.accComprimento += comprimento;
      // }
      //
      // const data = await getPriceAndDeadline({
      //   cepDestino: recoverCEPStorage(),
      //   produtos: {
      //     pesoObjeto: params.accPeso,
      //     alturaObjeto: params.accAltura,
      //     larguraObjeto: params.accLargura,
      //     comprimentoObjeto: params.accComprimento
      //   }
      // })
      //
      // this.shippingDetails = data
    },

    clearShippingDetails () {
      this.shippingDetails = []
      this.selectedShipping = ''
    },

    // async querySessionID () {
    //   const { createSessionID } = this
    //
    //   try {
    //     const response = await fetch(`https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/api_payment_session_id`)
    //
    //     if (!response.ok) return
    //
    //     const { response: xanoResponse } = await response.json()
    //
    //     PagSeguroDirectPayment.setSessionId(xanoResponse.result.sessionId)
    //
    //     createSessionID({
    //       value: xanoResponse.result.sessionId,
    //       key: 'paymentSessionId'
    //     })
    //   } catch (e) {
    //   }
    // },

    // async querySenderHash () {
    //   const senderHashValue = await PagSeguroDirectPayment.getSenderHash();
    //
    //   if (senderHashValue == null || senderHashValue == '') {
    //     setTimeout(function () {
    //       this.querySenderHash();
    //     }, 2000);
    //   } else {
    //     this.senderHash = senderHashValue;
    //   }
    // },

    async handleProcessPayment (e) {
      e.preventDefault()

      this.submitted = true;

      if (this.isLoading === true || this.loadingShipping) return;

      /** @type {EntryValidation[]} */
      const invalidFields = Object
        .values(this.vuelidate)
        .filter(({
          field,
          valid,
          ignoreIf
        }) => ([null, undefined].includes(ignoreIf) || ignoreIf === false) && (field !== null && valid === false))

      if (invalidFields.length) {
        for (let index = 0, length = invalidFields.length; index < length; index++) {
          const {
            ignoreIf,
            valid,
            field
          } = invalidFields.at(index)

          if (valid || field === null) continue;

          field.focus({
            preventScroll: true
          })

          field.blur()
          field.dispatchEvent(blurEvent)

          if (index !== 0) continue;

          setTimeout(() => {
            if (field instanceof HTMLInputElement) {
              field.focus()
            }

            scrollIntoView(field, {
              block: 'center',
              behavior: 'smooth'
            })
          }, 200);
        }

        return
      }

      if (!this.validationRules) return

      this.isLoading = true
      isPageLoading(true)

      /** @type {AsyncProcess<OrderResponse>} */
      const response = await this.paymentProcess(this.selectedPayment)

      if (!response.succeeded) {
        this.errorMessageOrderValidation = response?.message ?? 'Por favor, tente novamente! Não foi possível realizar o pagamento. Se o problema persistir, entre em contato via WhatsApp para obter ajuda.';

        this.isLoading = false

        return isPageLoading(false)
      }

      location.href = `${location.protocol}//${location.hostname}/order-confirmation?order-id=${response.data.transactionid}`;

      // switch (this.selectedPayment) {
      //   case CREDIT_CARD_TOKEN_NAME:
      //     this.paymentProcess()
      //     // this.process?
      //     // await this.postCreditCardPayment()
      //
      //     break
      //   case TICKET_TOKEN_NAME:
      //     // await this.postPayment()
      //
      //     break
      //   case PIX_TOKEN_NAME:
      //   default:
      //     console.warn('[handleProcessPayment] PIX payment was not implemented yet')
      // }
    },

    /**
     * @returns {Promise<AsyncProcess<InstallmentOption[]>>}
     */
    async getInstallments () {
      const defaultErrorMessage = 'Houve uma falha na busca do seu parcelamento'

      try {
        const response = await fetch(`${PAYMENT_URL_BASE}/calculatefees`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: naiveRound(this.totalOrderPrice, 2),
            cardbin: this.creditCardNumber?.replace(/\D+/, '').slice(0, 8)
          })
        })

        if (!response.ok) {
          const error = await response.json()

          return postErrorResponse(error?.message ?? defaultErrorMessage)
        }

        /** @type {InstallmentOption[]} */
        const data = await response.json()

        return postSuccessResponse(data)
      } catch (e) {
        return postErrorResponse(e?.message ?? defaultErrorMessage)
      }
    },

    /**
     * @param paymentMethod {string}
     * @returns             {Promise<ReturnType<typeof postErrorResponse> | ReturnType<typeof postSuccessResponse>>}
     */
    async paymentProcess (paymentMethod) {
      const defaultErrorMessage = 'Por favor, tente novamente! Não foi possível realizar o pagamento. Se o problema persistir, entre em contato via WhatsApp para obter ajuda.'

      /** @type {InstallmentOption[]} */
      const installments = this.installments
      /** @type {null | number} */
      const selectedInstallmentOption = this.selectedInstallmentOption

      try {
        const response = await fetch(`${PAYMENT_URL_BASE}/process/${paymentMethod}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customer: {
              ...this.getCustomerPayload,
              ...this.getParsedAddressesContent
            },
            items: this.parsedItems,
            ...(this.isCreditCardPayment && {
              creditCardInfo: {
                holderName: this.creditCardName,
                creditCardToken: this.getCreditCardToken.encryptedCard,
                numberOfPayments: selectedInstallmentOption,
                installmentValue: installments.find(installment => installment.installments === selectedInstallmentOption).installment_value
              },
              deliveryPlace: this.deliveryPlace
            }),
            shipping_method: this.selectedShipping,
            coupon_code: this.cupomData?.code ?? null,
            user_id: this.user?.id ?? null
          })
        })

        if (!response.ok) {
          const error = await response.json()

          return postErrorResponse(error?.message ?? defaultErrorMessage)
        }

        const data = await response.json()

        return postSuccessResponse(data)
      } catch (error) {
        console.error(`[paymentProcess] [paymentMethod] Error: ${error.message}]`)

        return postErrorResponse(error?.message ?? defaultErrorMessage)
      }
    },

    /**
     * @returns {Promise<AsyncProcess<ShippingService[]>>}
     */
    async getShippingPriceAndDeadline () {
      const defaultErrorMessage = 'Houve uma falha ao buscar os dados de entrega'

      try {
        const response = await fetch(`${PAYMENT_URL_BASE}/price_deadline`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            items: this.parsedItems,
            cep: recoverCEPStorage?.()
          })
        })

        if (!response.ok) {
          const error = await response.json()

          return postErrorResponse(error?.message ?? defaultErrorMessage)
        }

        /** @type {ShippingService[]} */
        const data = await response.json()

        return postSuccessResponse(data)
      } catch (e) {
        return postErrorResponse(e?.message ?? defaultErrorMessage)
      }
    },

    /**
     * @param value {string}
     * @returns     {string}
     */
    clearUniqueDash (value) {
      return value.length === 1 && value === '-'
        ? ''
        : value
    },

    /**
     * @returns {Promise<void>}
     * @description Envio de pagamento via boleto
     */
    async postPayment () {
      const {
        sProduct,
        discount,
        cupomData,
        selectedShipping,
        customerMail,
        customerPhone,
        customerCPFCNPJ,
        customerBirthdate,
        customerShippingSender,
        customerShippingNeighborhood,
        customerShippingCEP,
        customerShippingAddress,
        customerShippingNumber,
        customerShippingComplement,
        customerShippingCity,
        customerShippingState,
        senderHash,
        getShippingPrice,
        clearUniqueDash,

        isSubscriber
      } = this

      const subscriptionDiscount = isSubscriber && !this.discountOverProducts && (discount === 0 || (this.getProductPrices.price + discount) >= this.getSubscriptionBooksPrice)
        ? this.getSubscriptionBooksDiscount * -1
        : 0

      let finalPrice = parseFloat((this.subtotalPrice + subscriptionDiscount + this.getShippingPrice).toFixed(2))

      const paymentBody = {
        customer_name: clearUniqueDash(normalizeText(String(customerShippingSender.value).trim().replace(/\s{2,}/g, ' '))),
        customer_email: clearUniqueDash(customerMail.value),
        customer_cpf_cnpj: clearUniqueDash(customerCPFCNPJ.value),
        customer_phone: clearUniqueDash(customerPhone.value),
        customer_birthdate: clearUniqueDash(customerBirthdate.value),
        shipping_zip_code: clearUniqueDash(customerShippingCEP.value),
        shipping_address: clearUniqueDash(customerShippingAddress.value),
        shipping_number: clearUniqueDash(customerShippingNumber.value),
        shipping_complement: clearUniqueDash(customerShippingComplement.value),
        shipping_neighborhood: clearUniqueDash(customerShippingNeighborhood.value),
        shipping_city: clearUniqueDash(customerShippingCity.value),
        shipping_state: clearUniqueDash(customerShippingState.value),

        billing_zip_code: clearUniqueDash(customerShippingCEP.value),
        billing_address: clearUniqueDash(customerShippingAddress.value),
        billing_number: clearUniqueDash(customerShippingNumber.value),
        billing_complement: clearUniqueDash(customerShippingComplement.value),
        billing_neighborhood: clearUniqueDash(customerShippingNeighborhood.value),
        billing_city: clearUniqueDash(customerShippingCity.value),
        billing_state: clearUniqueDash(customerShippingState.value),

        amount: finalPrice,
        sender_hash: senderHash,

        products: sProduct.map(({ quantity, slug }) => ({
          quantity, slug
        })),

        shippingMethod: clearUniqueDash(selectedShipping),
        shippingPrice: parseFloat(getShippingPrice.toFixed(2)),

        discount: 0,
        discount_code: null,

        ...(this.couponIsAppliableBySubscription && this.hasAppliedCoupon && {
          discount_code: cupomData.code,
          discount: parseFloat((discount * -1).toFixed(2))
        }),

        ...(this.user !== null && {
          user_id: this.user.id,
          subscriber: isSubscriber
        })
      }

      try {
        isPageLoading(true)

        const paymentResponse = await fetch('https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/api_payment_process_boleto', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(paymentBody)
        })

        if (!paymentResponse.ok) {
          this.errorMessageOrderValidation = paymentResponse?.message ?? 'Por favor, tente novamente! Não foi possível realizar o pagamento. Se o problema persistir, entre em contato via WhatsApp para obter ajuda.';

          isPageLoading(false)

          return;
        }

        const paymentData = await paymentResponse.json()

        window.open(paymentData.boletourl, '_blank');

        setTimeout(() => {
          location.href = `${location.protocol}//${location.hostname}/order-confirmation?order-id=${paymentData?.transactionid}`;
        }, 1000);

        isPageLoading(false)
      } catch (e) {
        isPageLoading(false)

        this.errorMessageOrderValidation = 'Por favor, tente novamente! Não foi possível realizar o pagamento. Se o problema persistir, entre em contato via WhatsApp para obter ajuda.';
      }
    },

    /**
     * @returns {Promise<void>}
     * @description Envio de pagamento via cartão
     */
    async postCreditCardPayment () {
      const {
        sProduct,
        discount,
        cupomData,

        selectedShipping,
        selectedInstallmentOption,
        deliveryPlace,
        parseDifferentAddresses,

        brandName,
        senderHash,
        installments,
        creditCardToken,
        creditCardNumber,
        creditCardName,
        creditCardCode,
        creditCardDate,

        shippingMethod,
        totalOrderPrice,
        getShippingPrice,
        getProductsSubtotal,

        customerMail,
        customerPhone,
        customerCPFCNPJ,
        customerBirthdate,

        customerBillingCEP,
        customerBillingAddress,
        customerBillingNumber,
        customerBillingComplement,
        customerBillingNeighborhood,
        customerBillingCity,
        customerBillingState,

        isSubscriber
      } = this

      const amount = parseFloat((totalOrderPrice).toFixed(2));

      try {
        isPageLoading(true)

        const paymentResponse = await fetch('https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/api_payment_process_card_V02', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customer_name: normalizeText(String(creditCardName)).replace(/\s{2,}/g, ' ').trim(),
            customer_email: customerMail.value,
            customer_cpf_cnpj: customerCPFCNPJ.value,
            customer_phone: customerPhone.value,
            customer_birthdate: customerBirthdate.value,

            shipping_zip_code: customerBillingCEP.value,
            shipping_address: customerBillingAddress.value,
            shipping_number: customerBillingNumber.value,
            shipping_complement: customerBillingComplement.value,
            shipping_neighborhood: customerBillingNeighborhood.value,
            shipping_city: customerBillingCity.value,
            shipping_state: customerBillingState.value,

            billing_zip_code: customerBillingCEP.value,
            billing_address: customerBillingAddress.value,
            billing_number: customerBillingNumber.value,
            billing_complement: customerBillingComplement.value,
            billing_neighborhood: customerBillingNeighborhood.value,
            billing_city: customerBillingCity.value,
            billing_state: customerBillingState.value,

            deliveryPlace,

            ...(deliveryPlace === DELIVERY_PLACE_DIFF_TOKEN && parseDifferentAddresses()),

            card_full_name: normalizeText(String(creditCardName)).replace(/\s{2,}/g, ' ').trim(),
            card_token: creditCardToken,
            card_number_of_installments: selectedInstallmentOption,
            card_installments_value: +installments.installments[brandName].find(({ quantity }) => quantity === selectedInstallmentOption).installmentAmount.replace(/[^\d,]+/g, '').replace(/\,+/g, '.'),
            amount,
            sender_hash: senderHash,

            products: sProduct.map(({ quantity, slug }) => ({
              quantity, slug
            })),

            shippingMethod: selectedShipping,
            shippingPrice: parseFloat(getShippingPrice.toFixed(2)),

            discount: 0,
            discount_code: null,

            ...(this.couponIsAppliableBySubscription && this.hasAppliedCoupon && {
              discount_code: cupomData.code,
              discount: parseFloat((discount * -1).toFixed(2))
            }),

            ...(this.user !== null && {
              user_id: this.user.id,
              subscriber: isSubscriber
            })
          })
        })

        if (!paymentResponse.ok) {
          this.errorMessageOrderValidation = paymentResponse?.message ?? 'Por favor, tente novamente! Não foi possível realizar o pagamento. Se o problema persistir, entre em contato via WhatsApp para obter ajuda.';

          isPageLoading(false)

          return;
        }

        const paymentData = await paymentResponse.json()

        setTimeout(() => {
          location.href = `${location.protocol}//${location.hostname}/order-confirmation?order-id=${paymentData?.transactionid}`;
        }, 1000);

        isPageLoading(false)
      } catch (e) {
        this.errorMessageOrderValidation = 'Por favor, tente novamente! Não foi possível realizar o pagamento. Se o problema persistir, entre em contato via WhatsApp para obter ajuda.';

        isPageLoading(false)
      }
    },

    async searchAddress () {
    },

    parseDifferentAddresses () {
      const {
        customerShippingCEP,
        customerShippingAddress,
        customerShippingNumber,
        customerShippingComplement,
        customerShippingNeighborhood,
        customerShippingCity,
        customerShippingState,
      } = this

      return {
        shipping_zip_code: customerShippingCEP.value,
        shipping_address: customerShippingAddress.value,
        shipping_number: customerShippingNumber.value,
        shipping_complement: customerShippingComplement.value,
        shipping_neighborhood: customerShippingNeighborhood.value,
        shipping_city: customerShippingCity.value,
        shipping_state: customerShippingState.value,
      }
    },

    // queryCardBrand (creditCardNumber) {
    //   const { getInstallments } = this
    //
    //   if (!creditCardNumber || creditCardNumber?.length <= 7) return
    //
    //   PagSeguroDirectPayment.getBrand({
    //     cardBin: creditCardNumber?.replace(/\D+/g, ''),
    //     success: (response) => {
    //       if (!response?.brand?.name) return
    //
    //       this.brandName = response.brand.name
    //
    //       getInstallments(response.brand.name)
    //     },
    //     error: (response) => {
    //     }
    //   });
    // },

    // queryCreditCardNumber ({ creditCardNumber, creditCardCode, creditCardDate }) {
    //   const parsedCreditCardDate = String(creditCardDate).replace(/\D+/g, '')
    //   const parsedCreditCardCode = String(creditCardCode).replace(/\D+/g, '')
    //   const parsedCreditCardNumber = String(creditCardNumber).replace(/\D+/g, '')
    //
    //   if (parsedCreditCardNumber.length === 0 || parsedCreditCardCode.length === 0 || parsedCreditCardDate.length === 0) return
    //
    //   PagSeguroDirectPayment.createCardToken({
    //     cvv: parsedCreditCardCode,
    //     cardNumber: parsedCreditCardNumber,
    //
    //     expirationYear: '20' + parsedCreditCardDate.substr(2, 2),
    //     expirationMonth: parsedCreditCardDate.substr(0, 2),
    //
    //     success: (response) => {
    //       this.creditCardToken = response?.card?.token
    //     },
    //
    //     error: (response) => {
    //     }
    //   })
    // },

    createSessionID ({ key, value }) {
      sessionStorage.setItem(key, value)
    },

    async handleShippingType (shippingCode, evt) {
      if (this.selectedShipping === shippingCode || this.loadingShipping) return

      this.loadingShipping = true

      this.selectedShipping = shippingCode

      evt.currentTarget.classList.toggle('selecionado', shippingCode)

      await this.queryShippingPrice()

      //this.queryCardBrand(this.creditCardNumber)
      if (this.isCreditCardPayment) await this.captureInstallments()

      this.coupomSuccessMessage = ''

      this.loadingShipping = false
    },

    pluralize ({ count, one, many }) {
      return count > 1
        ? many
        : one
    },

    handleChangePaymentMethod (method) {
      if (this.selectedPayment === method) return

      this.selectedPayment = method
      this.deliveryPlace = null
    },

    handleDeliveryPlace (token) {
      this.deliveryPlace = token
    },

    /**
     * @returns {Promise<AsyncProcess<CouponData>>}
     */
    async getCoupon () {
      const defaultErrorMessage = 'O cupom informado é inválido'

      try {
        const response = await fetch(`${PAYMENT_URL_BASE}/coupon`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: this.cupomCode,
            items: this.parsedItems,
            user_id: this.user?.id ?? null
          })
        })

        if (!response.ok) {
          const error = await response.json()

          return postErrorResponse(error?.message ?? defaultErrorMessage)
        }

        /** @type {CouponData} */
        const data = await response.json()

        return postSuccessResponse(data)
      } catch (e) {
        return postErrorResponse(e?.message ?? defaultErrorMessage)
      }
    },

    async queryCupom () {
      isPageLoading(true)

      const response = await this.getCoupon()

      if (!response.succeeded) {
        await this.handleRemoveCoupon()

        this.cupomData = {
          error: true
        }
        this.coupomErrorMessage = response.message

        return isPageLoading(false)
      }

      if (response.data.cupom_type === COUPON_SHIPPING_TOKEN && !ALLOWED_SHIPPING_METHODS.includes(this.selectedShipping)) {
        this.coupomSuccessMessage = 'Cupom aplicado com sucesso! Para visualizar o desconto, defina o método de envio.'
      } else {
        this.coupomSuccessMessage = 'Cupom de desconto aplicado com sucesso!'
      }

      this.cupomData = response.data

      // if (this.isCreditCardPayment) {
      //   await this.getInstallments()
      // }

      setTimeout(async () => {
        await this.checkSubscriptionIssue()

        isPageLoading(false)
      }, 50)
    },

    async handleRemoveCoupon () {
      this.cupomCode = ''
      this.cupomData = {}

      // if (!this.isCreditCardPayment) return;
      //
      // await this.getInstallments()
    },

    async checkSubscriptionIssue () {
      const { isSubscriber, getPrices, discountOverProducts, discount } = this

      /**
       * @type {{price: number, full_price: number}}
       */
      const getProductPrices = this.getProductPrices

      /**
       * @type {Prices}
       */
      const prices = this.getPrices

      const isSubscriptionBetter = this.getSubscriptionBooksPrice <= (getProductPrices.price + discount)

      const betterSubscriptionDiscount = isSubscriber && discountOverProducts && isSubscriptionBetter

      if (betterSubscriptionDiscount) {
        await this.handleRemoveCoupon()
      }

      this.betterSubscriptionDiscount = betterSubscriptionDiscount
    }
  },

  computed: {
    /**
     * @returns {CreditCardToken}
     */
    getCreditCardToken () {
      const coupon = this.cupomData

      if (!this.isPagSeguroLoaded) {
        return {
          errors: [],
          hasErrors: false,
          encryptedCard: null
        }
      }

      const [
        month,
        year
      ] = this.creditCardDate.toString().split('/')

      const yearFirst2Digits = new Date().getFullYear().toString().substring(0, 2)

      const {
        errors,
        hasErrors,
        encryptedCard
      } = PagSeguro?.encryptCard?.({
        publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr+ZqgD892U9/HXsa7XqBZUayPquAfh9xx4iwUbTSUAvTlmiXFQNTp0Bvt/5vK2FhMj39qSv1zi2OuBjvW38q1E374nzx6NNBL5JosV0+SDINTlCG0cmigHuBOyWzYmjgca+mtQu4WczCaApNaSuVqgb8u7Bd9GCOL4YJotvV5+81frlSwQXralhwRzGhj/A57CGPgGKiuPT+AOGmykIGEZsSD9RKkyoKIoc0OS8CPIzdBOtTQCIwrLn2FxI83Clcg55W8gkFSOS6rWNbG5qFZWMll6yl02HtunalHmUlRUL66YeGXdMDC2PuRcmZbGO5a/2tbVppW6mfSWG3NPRpgwIDAQAB',
        holder: this.creditCardName,
        number: keepNumberOnly(this.creditCardNumber),
        expMonth: month,
        expYear: yearFirst2Digits + year,
        securityCode: this.creditCardCode
      })

      return {
        errors,
        hasErrors,
        encryptedCard
      }
    },

    /**
     * @returns {ParsedItems[]}
     */
    parsedItems () {
      return this.sProduct.map(({ quantity, slug }) => ({ quantity, slug }))
    },

    /**
     * @returns {boolean}
     */
    isCreditCardPayment () {
      return this.selectedPayment === CREDIT_CARD_TOKEN_NAME
    },

    /**
     * @returns {boolean}
     */
    isSameAddress () {
      return this.deliveryPlace === DELIVERY_PLACE_SAME_TOKEN
    },

    /**
     * @returns {CustomerPayload}
     */
    getCustomerPayload () {
      return {
        email: this.customerEmailModel,
        name: this.shippingSender || this.creditCardName,
        cpf: this.customerCPFCNPJModel,
        phone: this.customerPhoneModel,
        birthDate: this.customerBirthdataModel
      }
    },

    /**
     * @returns {ParsedAddressContent}
     */
    getParsedAddressesContent () {
      /**
       * @param complement {string}
       * @returns          {string}
       */
      const parseComplement = complement => complement.trim().replace(/-+/g, '') || 'N/A'

      /**
       * @param acronym {BrazilianStates}
       * @returns       {string}
       */
      const parseState = acronym => statesMap?.[acronym] ?? ''

      const shippingComplement = this.customerShippingComplement
      const billingComplement = this.customerBillingComplement

      /** @type {ParsedAddress} */
      const shippingaddress = {
        zipPostalCode: this.shippingCEP,
        street: this.shippingAddress,
        number: this.shippingNumber,
        complement: parseComplement(shippingComplement?.value ?? ''),
        neighbourhood: this.shippingNeighborhood,
        city: this.shippingCity,
        state: parseState(this.shippingState)
      }

      /** @type {ParsedAddress} */
      const billingaddress = {
        zipPostalCode: this.billingCEP,
        street: this.billingAddress,
        number: this.billingNumber,
        complement: parseComplement(billingComplement?.value ?? ''),
        neighbourhood: this.billingNeighborhood,
        city: this.billingCity,
        state: parseState(this.billingState)
      }

      if (this.isCreditCardPayment) {
        return {
          billingaddress,
          ...(!this.isSameAddress && {
            shippingaddress
          })
        }
      }

      return {
        shippingaddress
      }
    },

    /**
     * @returns {boolean}
     */
    isSubscriber () {
      /** @type {AuthMe | null} */
      const user = this.user

      return user?.subscriber ?? false
    },

    /**
     * @returns {number}
     */
    getSubscriptionBooksPrice () {
      /** @type {PriceTypes} */
      const booksFullPriceSubtotal = this.getProductPrices

      if (!this.isSubscriber) return booksFullPriceSubtotal?.[PRICE_TOKEN]

      return booksFullPriceSubtotal?.[FULL_PRICE_TOKEN] * (1 - this.subscriptionDiscount)
    },

    /**
     * @returns {number}
     */
    getSubscriptionBooksDiscount () {
      if (!this.isSubscriber) return 0

      /** @type {PriceTypes} */
      const booksFullPriceSubtotal = this.getProductPrices

      return booksFullPriceSubtotal?.[FULL_PRICE_TOKEN] * this.subscriptionDiscount
    },

    /**
     * @returns {boolean}
     */
    couponIsAppliableBySubscription () {
      if (!this.isSubscriber) return true

      if (!this.hasAppliedCoupon) return false

      if (this.cupomData.cupom_type === COUPON_SHIPPING_TOKEN) return true

      return this.getSubscriptionBooksPrice >= (this.getProductPrices.price + this.discount)
    },

    /**
     * @returns {boolean}
     */
    hasAppliedSubscriberDiscount () {
      /** @type {Prices} */
      const prices = this.getPrices

      /** @type {PriceTypes} */
      const getProductsPrices = this.getProductPrices

      return this.isSubscriber && !this.hasAppliedCoupon || this.isSubscriber && this.getSubscriptionBooksPrice <= (getProductsPrices.price + this.discount)
    },

    /**
     * @returns {boolean}
     */
    userHasMoreThanOneAddress () {
      /**
       * @type {AuthMe}
       */
      const user = this.user

      return user !== null && user?.address?.itemsTotal > 1 && user.address.itemsTotal > user.address?.items.length
    },

    /**
     * @returns {boolean}
     */
    canLoadBillingAddresses () {
      return this.user?.address?.itemsTotal > Math.min(this.user?.address?.items?.length ?? 0, this.billingAddressesLoaded)
    },

    /**
     * @returns {boolean}
     */
    canLoadShippingAddresses () {
      return this.user?.address?.itemsTotal > Math.min(this.user?.address?.items?.length ?? 0, this.shippingAddressesLoaded)
    },

    /**
     * @returns {AuthSingleAddress[]}
     */
    getAddresses () {
      return this.user?.address?.items ?? []
    },

    /**
     * @returns {AuthSingleAddress[]}
     */
    getBillingAddresses () {
      return this.getAddresses.slice(0, Math.max(this.billingAddressesLoaded, 1))
    },

    /**
     * @returns {AuthSingleAddress[]}
     */
    getShippingAddresses () {
      return this.getAddresses?.slice(0, Math.max(this.shippingAddressesLoaded, 1))
    },

    /**
     * @returns {boolean}
     */
    showShippingAddressSelector () {
      return this.selectedPayment === CREDIT_CARD_TOKEN_NAME && this.deliveryPlace === DELIVERY_PLACE_DIFF_TOKEN || this.selectedPayment === TICKET_TOKEN_NAME
    },

    /**
     * @returns {ParsedInstalmentOption[]}
     */
    listInstallments () {
      // const { installments, brandName } = this
      //
      // if (installments?.installments?.error || !Object.keys(installments?.installments ?? {}).length) return []
      //
      // const maxInstallments = installments.installments[brandName].slice(0, 6)
      //
      // return maxInstallments.map(installmentOption => {
      //   return Object.assign(installmentOption, {
      //     installmentAmount: STRING_2_BRL_CURRENCY(installmentOption.installmentAmount)
      //   })
      // })

      /** @type {InstallmentOption[]} */
      const installments = this.installments

      return installments.map(({ installments, installment_value }) => ({
        quantity: installments,
        installmentAmount: STRING_2_BRL_CURRENCY(installment_value)
      }))
    },

    /**
     * @returns {boolean}
     */
    displayFinalShippingPrice () {
      const { hasShippingDetails, selectedShipping } = this

      return hasShippingDetails && selectedShipping.length > 0
    },

    /**
     * @returns {boolean}
     */
    hasShippingDetails () {
      const shippingDetails = this.shippingDetails

      return isArray(shippingDetails) && shippingDetails.length > 0
    },

    /**
     * @returns {boolean}
     */
    showShippingMethod () {
      return this.hasShippingDetails && (this.selectedPayment === TICKET_TOKEN_NAME || (this.isCreditCardPayment && this.hasDeliveryPlace))
    },

    /**
     * @returns {boolean}
     */
    hasDeliveryPlace () {
      return this.deliveryPlace !== null
    },

    /**
     * @returns {string[]}
     */
    getProductsSlugs () {
      const { sProduct, getSlugFromProductElement } = this

      return sProduct.length > 0
        ? sProduct.map(getSlugFromProductElement)
        : []
    },

    /**
     * @returns {number}
     */
    getProductsSubtotal () {
      const { sProduct, isSubscriber, getSubscriptionBooksDiscount, discount, discountOverProducts } = this

      /**
       * @type {ProductResponse[]}
       */
      const productsResponse = this.productsResponse

      return productsResponse.reduce((price, product) => {
        const quantity = sProduct?.find(prod => prod.slug === product?.slug)?.quantity ?? 1

        /** @type {number} */
        const whichPrice = isSubscriber && getSubscriptionBooksDiscount >= (discount * -1)
          ? product?.[FULL_PRICE_TOKEN]
          : discountOverProducts
            ? product?.[FULL_PRICE_TOKEN]
            : product?.[PRICE_TOKEN]

        return price + (whichPrice ?? 0) * quantity
      }, 0)
    },

    /**
     * @returns {number}
     */
    getShippingPrice () {
      const { hasShippingDetails, selectedShipping, shippingDetails, cupomData, getProductsSubtotal } = this

      if (!hasShippingDetails) return 0

      /** @type {ShippingService} */
      const selectedShippingPrice = shippingDetails.find(shippingDetail => shippingDetail.coProduto === selectedShipping)

      if (!selectedShippingPrice) return 0

      return selectedShippingPrice?.pcFinal
    },

    /**
     * @returns {string}
     */
    shippingPrice () {
      return STRING_2_BRL_CURRENCY(this.getShippingPrice)
    },

    /**
     * @returns {Prices}
     */
    getPrices () {
      const { getSubscriptionBooksPrice, getProductsSubtotal, discount } = this

      return {
        sale: getProductsSubtotal,
        coupon: getProductsSubtotal + discount,
        subscription: getSubscriptionBooksPrice
      }
    },

    /**
     * @returns {PriceTypes}
     * @description Retorna o somatório de ambos os preços de capa e de venda dos produtos, multiplicados pelas suas respectivas quantidades
     */
    getProductPrices () {
      /** @type {productsResponse[]} */
      const productsResponse = this.productsResponse

      /** @type {sProduct[]} */
      const sProduct = this.sProduct

      /** @type {PriceTypes} */
      const prices = {
        [PRICE_TOKEN]: 0,
        [FULL_PRICE_TOKEN]: 0
      }

      productsResponse.forEach(({ price, full_price, slug }) => {
        const quantity = sProduct.find(singleProduct => singleProduct.slug === slug).quantity

        prices.price += price * quantity;
        prices.full_price += full_price * quantity
      })

      return prices
    },

    /**
     * @returns {number}
     */
    subtotalPrice () {
      // TODO: Revisar
      // const { discount, isSubscriber, getSubscriptionBooksPrice } = this

      /** @type {PriceTypes} */
      const prices = this.getProductPrices

      return this.hasAppliedSubscriberDiscount
        ? prices?.[FULL_PRICE_TOKEN]
        : prices?.[PRICE_TOKEN]
    },

    /**
     * @returns {PriceTypesEnum}
     */
    sProductPriceType () {
      // const { discount, isSubscriber, getSubscriptionBooksPrice } = this
      //
      // /** @type {PriceTypes} */
      // const prices = this.getProductPrices

      return this.hasAppliedSubscriberDiscount
        ? FULL_PRICE_TOKEN
        : PRICE_TOKEN
    },

    /**
     * @returns {string}
     */
    subtotal () {
      const { subtotalPrice } = this

      return STRING_2_BRL_CURRENCY(subtotalPrice)
    },

    /**
     * @returns {number}
     */
    totalOrderPrice () {
      const {
        getProductsSubtotal,
        getShippingPrice,
        discount,
        discountOverProducts,
        getSubscriptionBooksPrice,
        isSubscriber
      } = this

      /** @type {Prices} */
      const prices = this.getPrices

      /** @type {PriceTypes} */
      const productPrices = this.getProductPrices

      if (isSubscriber && this.hasAppliedCoupon) {
        if (this.cupomData?.cupom_type === COUPON_SHIPPING_TOKEN) {
          return getSubscriptionBooksPrice + discount + getShippingPrice
        }

        return getSubscriptionBooksPrice <= productPrices?.[PRICE_TOKEN] + discount
          ? getSubscriptionBooksPrice + getShippingPrice
          : productPrices?.[PRICE_TOKEN] + getShippingPrice + discount
      }

      if (isSubscriber) {
        return getSubscriptionBooksPrice + getShippingPrice
      }

      return productPrices?.[PRICE_TOKEN] + getShippingPrice + discount
    },

    /**
     * @returns {string}
     */
    totalOrder () {
      const { totalOrderPrice } = this

      return STRING_2_BRL_CURRENCY(totalOrderPrice)
    },

    /**
     * @returns {DeliveryOption[]}
     */
    deliveryOptions () {
      /** @type {ShippingService[]} */
      const shippingDetails = this.shippingDetails

      return isArray(shippingDetails) && shippingDetails.length > 0
        ? shippingDetails.map(({ coProduto, pcFinal, prazoEntrega }) => {
            return ({
              code: coProduto,
              option: this.productsCorreios[coProduto],
              value: STRING_2_BRL_CURRENCY(pcFinal),
              deadline: `${prazoEntrega} dia(s)`,
            })
          })
        : []
      // const { shippingDetails, hasShippingDetails, productsCorreios, pluralize } = this
      //
      // if (!hasShippingDetails) {
      //   return Object
      //     .entries(productsCorreios)
      //     .reduce((fakeOptions, [key, value]) => {
      //       return fakeOptions.concat({
      //         code: key,
      //         option: value,
      //         value: 'R$ xx,xx',
      //         deadline: 'x dias',
      //       })
      //     }, [])
      // }
      //
      // const prices = shippingDetails?.price
      // const deadlines = shippingDetails?.deadline
      //
      // const minLength = Math.min(prices?.length, deadlines?.length)
      //
      // return Array
      //   .from({ length: minLength }, (_, index) => {
      //     const currentPrice = prices[index]
      //     const currentDeadline = deadlines[index]
      //
      //     const _deadline = currentDeadline?.prazoEntrega ?? 0
      //
      //     return {
      //       code: currentPrice?.coProduto ?? '#',
      //       deadline: pluralize({
      //         count: _deadline,
      //         one: `${_deadline} dia`,
      //         many: `${_deadline} dias`,
      //       }),
      //       option: productsCorreios[currentPrice?.coProduto] ?? '#####',
      //       value: currentPrice.hasOwnProperty('txErro')
      //         ? null
      //         : STRING_2_BRL_CURRENCY(currentPrice?.pcFinal?.replace(/\,+/g, '.') * this.shippingTax)
      //     }
      //   })
      //   .filter(deliveryOption => deliveryOption.value !== null)
    },

    /**
     * @returns {boolean}
     */
    hasDeliveryData () {
      const { selectedPayment, deliveryPlace } = this

      return selectedPayment === null || [TICKET_TOKEN_NAME, PIX_TOKEN_NAME].includes(selectedPayment) || (selectedPayment === CREDIT_CARD_TOKEN_NAME && deliveryPlace === DELIVERY_PLACE_DIFF_TOKEN)
    },

    validationRules () {
      const {
        deliveryPlace,
        selectedPayment,
        selectedShipping,
        getShippingPrice,

        billingCEP,
        billingAddress,
        billingNumber,
        billingNeighborhood,
        billingCity,
        billingState,

        shippingSender,
        shippingCEP,
        shippingAddress,
        shippingNumber,
        shippingNeighborhood,
        shippingCity,
        shippingState,

        creditCardNumber,
        creditCardName,
        creditCardCode,
        creditCardDate,

        brandName,
        installments,
        selectedInstallmentOption,
        senderHash,

        isEmailValid,
        isCPFCNPJValid,
        isBirthdateValid,
        isPhoneNumberValid
      } = this

      const isBasicDataValid = isEmailValid && isCPFCNPJValid && isBirthdateValid && isPhoneNumberValid

      const shippingAddressValid = (
        keepNumberOnly(shippingCEP).length === 8 &&
        shippingSender.length > 0 &&
        shippingAddress.length > 0 &&
        String(shippingNumber).length > 0 &&
        shippingNeighborhood.length > 0 &&
        shippingCity.length > 0 &&
        shippingState.length === 2
      );

      const isShippingValid = ALLOWED_SHIPPING_METHODS.includes(selectedShipping) && getShippingPrice > 0;

      if (this.selectedPayment === TICKET_TOKEN_NAME) {
        return shippingAddressValid && isShippingValid && isBasicDataValid
      }

      const cardNameHolder = normalizeText(String(creditCardName)).replace(/\s{2,}/g, ' ').trim().split(' ');

      const billingAddressValid = (
        keepNumberOnly(billingCEP).length === 8 &&
        billingAddress.length > 0 &&
        String(billingNumber).length > 0 &&
        billingNeighborhood.length > 0 &&
        billingCity.length > 0 &&
        billingState.length === 2 &&
        creditCardNumber.length > 15 &&
        cardNameHolder.length > 1 &&
        cardNameHolder.every(str => str.length > 0) &&
        creditCardDate.split('/').every(code => code.length === 2) &&
        String(creditCardCode).length === 3
      );

      const isPaymentCardValid = selectedInstallmentOption !== null && this.installments.length > 0 && !this.getCreditCardToken.hasErrors;

      // if (selectedPayment === CREDIT_CARD_TOKEN_NAME) {
      if (this.isCreditCardPayment) {
        return deliveryPlace === DELIVERY_PLACE_SAME_TOKEN
          ? isBasicDataValid && billingAddressValid && isShippingValid && isPaymentCardValid && deliveryPlace !== null
          : isBasicDataValid && shippingAddressValid && billingAddressValid && isShippingValid && isPaymentCardValid && deliveryPlace !== null
      }

      return false
    },

    /**
     * @returns {boolean}
     */
    showPaymentMethodError () {
      const { selectedPayment, submitted } = this

      return submitted && selectedPayment === null
    },

    /**
     * @returns {boolean}
     */
    showDeliveryMethodError () {
      // return submitted && deliveryPlace === null && selectedPayment === CREDIT_CARD_TOKEN_NAME
      return this.submitted && this.deliveryPlace === null && this.isCreditCardPayment
    },

    /**
     * @returns {boolean}
     */
    showShippingMethodError () {
      const { submitted, selectedShipping } = this

      return submitted && selectedShipping.toString().length === 0
    },

    /**
     * @returns {boolean}
     */
    showInstallmentCountError () {
      // return submitted && selectedInstallmentOption === null && selectedPayment === CREDIT_CARD_TOKEN_NAME
      return this.submitted && this.selectedInstallmentOption === null && this.isCreditCardPayment
    },

    /**
     * @typedef EntryValidation
     * @property {boolean}     valid
     * @property {boolean}     [ignoreIf]
     * @property {HTMLElement} field
     */

    /**
     * @typedef Vuelidate
     * @property {EntryValidation} email
     * @property {EntryValidation} phone
     */

    /**
     * @returns {Vuelidate}
     */
    vuelidate () {
      const {
        customerMail,
        customerEmailModel,

        customerPhone,
        customerPhoneModel,

        customerCPFCNPJ,
        customerCPFCNPJModel,

        customerBirthdate,
        customerBirthdataModel,

        selectedPayment,

        creditCardName,
        customerCardName,

        creditCardNumber,
        customerCardNumber,

        creditCardDate,
        customerCardDate,

        creditCardCode,
        customerCardCode,

        billingCEP,
        customerBillingCEP,

        billingAddress,
        customerBillingAddress,

        billingNumber,
        customerBillingNumber,

        billingNeighborhood,
        customerBillingNeighborhood,

        billingCity,
        customerBillingCity,

        statesAcronym,
        billingState,
        customerBillingState,

        shippingSender,
        customerShippingSender,

        shippingCEP,
        customerShippingCEP,

        shippingAddress,
        customerShippingAddress,

        shippingNumber,
        customerShippingNumber,

        shippingNeighborhood,
        customerShippingNeighborhood,

        shippingCity,
        customerShippingCity,

        shippingState,
        customerShippingState,

        selectedShipping,
        productsCorreios,

        deliveryPlace,
        deliveryPlaces,
        listInstallments,
        selectedInstallmentOption,

        shippingMethodMessage,

        shippingAddressMessage,
        installmentCountMessage
      } = this

      return {
        email: {
          field: customerMail,
          valid: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(customerEmailModel)
        },

        phone: {
          field: customerPhone,
          valid: /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(customerPhoneModel)
        },

        cpf: {
          field: customerCPFCNPJ,
          valid: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(customerCPFCNPJModel) && CPFMathValidator(customerCPFCNPJModel)
        },

        birthday: {
          field: customerBirthdate,
          valid: /^\d{2}\/\d{2}\/\d{4}$/.test(customerBirthdataModel) && isDateValid(customerBirthdataModel)
        },

        paymentMethod: {
          field: querySelector('[data-wtf-payment-method-error-message]'),
          valid: selectedPayment !== null && ALLOWED_PAYMENT_METHODS.includes(selectedPayment)
        },

        cardHolder: {
          field: customerCardName,
          // valid: selectedPayment === CREDIT_CARD_TOKEN_NAME && /^(\w{2,})(\s+(\w+))+$/.test(normalizeText(creditCardName).trim().replace(/\s{2,}/g, ' '))
          valid: this.isCreditCardPayment && /^(\w{2,})(\s+(\w+))+$/.test(normalizeText(creditCardName).trim().replace(/\s{2,}/g, ' '))
        },

        cardNumber: {
          field: customerCardNumber,
          // valid: selectedPayment === CREDIT_CARD_TOKEN_NAME && /^(\d{4})(\s\d{4}){3}/.test(creditCardNumber)
          valid: this.isCreditCardPayment && /^(\d{4})(\s\d{4}){3}/.test(creditCardNumber)
        },

        cardValidate: {
          field: customerCardDate,
          // valid: selectedPayment === CREDIT_CARD_TOKEN_NAME && /^\d{2}\/\d{2}$/.test(creditCardDate) && isExpireDateValid(creditCardDate),
          valid: this.isCreditCardPayment && /^\d{2}\/\d{2}$/.test(creditCardDate) && isExpireDateValid(creditCardDate),
        },

        cardCode: {
          field: customerCardCode,
          // valid: selectedPayment === CREDIT_CARD_TOKEN_NAME && String(creditCardCode).length === 3 && /^\d{3}$/.test(String(creditCardCode)),
          valid: this.isCreditCardPayment && String(creditCardCode).length === 3 && /^\d{3}$/.test(String(creditCardCode)),
        },

        billingCEP: {
          field: customerBillingCEP,
          valid: /^\d{5}-\d{3}$/.test(billingCEP.toString())
        },

        billingAddress: {
          field: customerBillingAddress,
          valid: billingAddress.toString().length > 2
        },

        billingNumber: {
          field: customerBillingNumber,
          valid: billingNumber.toString().length > 0
        },

        billingNeighborhood: {
          field: customerBillingNeighborhood,
          valid: billingNeighborhood.toString().length > 0
        },

        billingCity: {
          field: customerBillingCity,
          valid: billingCity.toString().length > 2
        },

        billingState: {
          field: customerBillingState,
          valid: statesAcronym.includes(billingState)
        },

        shippingSender: {
          field: customerShippingSender,
          valid: /^(\w{2,})(\s+(\w+))+$/.test(normalizeText(String(shippingSender).trim().replace(/\s{2,}/g, ' ')))
        },

        shippingCEP: {
          field: customerShippingCEP,
          valid: /^\d{5}-\d{3}$/.test(shippingCEP)
        },

        shippingAddress: {
          field: customerShippingAddress,
          valid: String(shippingAddress).length > 0
        },

        shippingNumber: {
          field: customerShippingNumber,
          valid: String(shippingNumber).length > 0
        },

        shippingNeighborhood: {
          field: customerShippingNeighborhood,
          valid: String(shippingNeighborhood).length > 3
        },

        shippingCity: {
          field: customerShippingCity,
          valid: String(shippingCity).length > 2
        },

        shippingState: {
          field: customerShippingState,
          valid: statesAcronym.includes(shippingState)
        },

        shippingAddressMessage: {
          // ignoreIf: selectedPayment !== CREDIT_CARD_TOKEN_NAME,
          ignoreIf: !this.isCreditCardPayment,
          field: shippingAddressMessage,
          // valid: selectedPayment === CREDIT_CARD_TOKEN_NAME && deliveryPlaces.map(({ token }) => token).includes(deliveryPlace)
          valid: this.isCreditCardPayment && deliveryPlaces.map(({ token }) => token).includes(deliveryPlace)
        },

        shippingMethodMessage: {
          field: shippingMethodMessage,
          valid: Object.keys(productsCorreios).includes(String(selectedShipping))
        },

        installmentMessage: {
          // ignoreIf: selectedPayment !== CREDIT_CARD_TOKEN_NAME,
          ignoreIf: !this.isCreditCardPayment,
          field: installmentCountMessage,
          valid: isArray(listInstallments) && listInstallments.length > 0 && selectedInstallmentOption !== null
        }
      }
    },

    /**
     * @returns {function(string): boolean}
     */
    isValidationRunningForField () {
      const { validationFeedback } = this

      return (fieldname) => validationFeedback.includes(fieldname)
    },

    /**
     * @returns {boolean}
     */
    isEmailValid () {
      const { customerEmailModel, isValidationRunningForField } = this

      if (isValidationRunningForField('customerEmail')) {
        return customerEmailModel.includes('@') && customerEmailModel.includes('.')
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    isPhoneNumberValid () {
      const { customerPhoneModel, isValidationRunningForField } = this

      if (isValidationRunningForField('customerPhone')) {
        return /\(\d{2}\)\d{4,5}\-\d{4}/.test(customerPhoneModel.replace(/\s+/g, ''))
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    isCPFCNPJValid () {
      const { customerCPFCNPJModel, isValidationRunningForField } = this

      if (isValidationRunningForField('customerCPFCNPJ')) {
        return /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(customerCPFCNPJModel) && CPFMathValidator(customerCPFCNPJModel)
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    isBirthdateValid () {
      const { customerBirthdataModel, isValidationRunningForField } = this

      if (isValidationRunningForField('customerBirthdate')) {
        return /^\d{2}\/\d{2}\/\d{4}$/.test(customerBirthdataModel) && isDateValid(customerBirthdataModel)
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    isCardHolder () {
      const { creditCardName, isValidationRunningForField } = this

      if (isValidationRunningForField('cardHolder')) {
        return /^(\w{2,})(\s+(\w+))+$/.test(normalizeText(String(creditCardName).trim().replace(/\s{2,}/g, ' ')))
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    isCreditCardNumberValid () {
      const { creditCardNumber, isValidationRunningForField } = this

      if (isValidationRunningForField('cardNumber')) {
        return /^(\d{4})(\s\d{4}){3}/.test(creditCardNumber)
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    isCreditCardExpireDateValid () {
      const { creditCardDate, isValidationRunningForField } = this

      if (isValidationRunningForField('cardExpireDate')) {
        return /^\d{2}\/\d{2}$/.test(creditCardDate) && isExpireDateValid(creditCardDate)
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    isCreditCardCVVValid () {
      const { creditCardCode, isValidationRunningForField } = this

      if (isValidationRunningForField('cardCVV')) {
        return String(creditCardCode).length === 3 && /^\d{3}$/.test(String(creditCardCode))
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    isBillingCEPValid () {
      const { billingCEP, isValidationRunningForField } = this

      if (isValidationRunningForField('billingCEP')) {
        return /^\d{5}\-\d{3}$/.test(String(billingCEP))
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    isBillingAddressValid () {
      const { billingAddress, isValidationRunningForField } = this

      if (isValidationRunningForField('billingAddress')) {
        return billingAddress.length > 2
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    isBillingNumberValid () {
      const { billingNumber, isValidationRunningForField } = this

      if (isValidationRunningForField('billingNumber')) {
        return String(billingNumber).length > 0
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    isBillingNeighborhoodValid () {
      const { billingNeighborhood, isValidationRunningForField } = this

      if (isValidationRunningForField('billingNeighborhood')) {
        return billingNeighborhood.length > 0
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    isBillingCityValid () {
      const { billingCity, isValidationRunningForField } = this

      if (isValidationRunningForField('billingCity')) {
        return billingCity.length > 2
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    isBillingStateValid () {
      const { billingState, isValidationRunningForField, statesAcronym } = this

      if (isValidationRunningForField('billingState')) {
        return statesAcronym.includes(billingState)
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    isShippingSenderValid () {
      const { shippingSender, isValidationRunningForField } = this

      if (isValidationRunningForField('shippingSender')) {
        return /^(\w{2,})(\s+(\w+))+$/.test(normalizeText(String(shippingSender).trim().replace(/\s{2,}/g, ' ')))
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    isShippingCEPValid () {
      const { shippingCEP, isValidationRunningForField } = this

      if (isValidationRunningForField('shippingCEP')) {
        return /^\d{5}\-\d{3}$/.test(shippingCEP)
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    isShippingAddressValid () {
      const { shippingAddress, isValidationRunningForField } = this

      if (isValidationRunningForField('shippingAddress')) {
        return String(shippingAddress).length > 0
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    isShippingNumberValid () {
      const { shippingNumber, isValidationRunningForField } = this

      if (isValidationRunningForField('shippingNumber')) {
        return String(shippingNumber).length > 0
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    isShippingNeighborhoodValid () {
      const { shippingNeighborhood, isValidationRunningForField } = this

      if (isValidationRunningForField('shippingNeighborhood')) {
        return shippingNeighborhood.length > 3
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    isShippingCityValid () {
      const { shippingCity, isValidationRunningForField } = this

      if (isValidationRunningForField('shippingCity')) {
        return shippingCity.length > 2
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    isShippingStateValid () {
      const { shippingState, isValidationRunningForField, statesAcronym } = this

      if (isValidationRunningForField('shippingState')) {
        return statesAcronym.includes(shippingState)
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    hasAppliedCoupon () {
      const { cupomData, invalidCoupon } = this

      return !invalidCoupon && Object.keys(cupomData ?? {}).length > 0
    },

    /**
     * @returns {boolean}
     */
    cupomHasUnsufficientDigits () {
      const { cupomCode } = this

      return cupomCode.length < 5
    },

    /**
     * @returns {boolean}
     */
    invalidCoupon () {
      const { cupomData } = this

      return cupomData.hasOwnProperty('error')
    },

    /**
     * @returns {boolean}
     */
    discountOverProducts () {
      return this.hasAppliedCoupon && [COUPON_SUBTOTAL_TOKEN, COUPON_ISBN_TOKEN].includes(this.cupomData?.cupom_type)
    },

    /**
     * @returns {number}
     */
    discount () {
      const {
        productsResponse,
        getShippingPrice,
        getProductsSubtotal
      } = this

      /** @type {PriceTypes} */
      const getProductPrices = this.getProductPrices

      const { is_percentage, products_id, value, cupom_type, isbn } = this.cupomData

      // const isGreaterThanMinPurchaseValue = getProductsSubtotal >= min_purchase
      //
      // if (!isGreaterThanMinPurchaseValue) return 0

      switch (cupom_type) {
        case COUPON_SHIPPING_TOKEN:
          return is_percentage
            ? getShippingPrice - discountPercentage(getShippingPrice, -value)
            : discountReal(getShippingPrice, value)
        case COUPON_SUBTOTAL_TOKEN:
          return is_percentage
            ? getProductPrices.price - discountPercentage(getProductPrices.price, -value)
            : discountReal(getProductPrices.price, value)
        case COUPON_ISBN_TOKEN:
          const { price } = productsResponse.find(({ ISBN }) => ISBN === isbn)

          return is_percentage
            ? price - discountPercentage(price, -value)
            : discountReal(price, value)
        default:
          return 0
      }
    },

    /**
     * @returns {string}
     */
    BRLDiscount () {
      const { discount } = this

      return STRING_2_BRL_CURRENCY(discount)
    },

    /**
     * @returns {string}
     */
    BRLDiscountSub () {
      const { getSubscriptionBooksDiscount } = this

      return STRING_2_BRL_CURRENCY(getSubscriptionBooksDiscount * -1)
    }
  }
});

/**
 * @param cpf {string}
 * @returns   {boolean}
 */
function CPFMathValidator (cpf) {
  let Soma = 0
  let Resto = 0

  let strCPF = keepNumberOnly(String(cpf))

  if (strCPF.length !== 11) return false

  if (/(\d)\1{10}/.test(strCPF)) return false

  for (let i = 1; i <= 9; i++) {
    Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
  }

  Resto = (Soma * 10) % 11

  if ((Resto == 10) || (Resto == 11)) Resto = 0

  if (Resto != parseInt(strCPF.substring(9, 10))) return false

  Soma = 0

  for (let i = 1; i <= 10; i++) {
    Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i)
  }

  Resto = (Soma * 10) % 11

  if ((Resto == 10) || (Resto == 11)) Resto = 0

  if (Resto != parseInt(strCPF.substring(10, 11))) return false

  return true
}

/**
 * @param date {string}
 * @returns    {boolean}
 */
function isDateValid (date) {
  const [
    day,
    month,
    fullYear
  ] = date.split('/');

  const dateInstace = new Date(`${fullYear}-${month}-${day}T00:00:00`);

  return !isNaN(dateInstace);
}

function validateCard (el, binding) {
  const cleanNumber = keepNumberOnly(el.value);

  const groups = Math.ceil(cleanNumber.length / 4);

  el.value = Array
    .from({ length: groups })
    .map((_, index) => cleanNumber.substr(index * 4, 4))
    .join(' ');

  binding.instance.creditCardNumber = el.value
}

/**
 *
 * @param cpf {string}
 */
function validaCPF (cpf) {
  if (cpf.length <= 6) {
    this.value = cpf.replace(/^(\d{3})(\d{1,3})/, '$1.$2')
  } else if (cpf.length <= 9) {
    this.value = cpf.replace(/^(\d{3})(\d{3})(\d{1,3})$/, '$1.$2.$3')
  } else {
    this.value = cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, '$1.$2.$3-$4')
  }
}

/**
 * @param e {Event}
 */
function numbersOnly (e) {
  e.target.value = keepNumberOnly(e.target.value);
}

/**
 * @param fullname {string}
 * @returns        {false}
 */
function isValidName (fullname) {
  const names = fullname.split(' ');

  return names.length > 1 && names.every(name => name.length > 1)
}

/**
 * @param expireDate {string}
 * @returns          {boolean}
 */
function isExpireDateValid (expireDate) {
  var tokens = expireDate.split('/');

  if (tokens.length < 2 || tokens.some(function (token) {
    return token.length < 2;
  })) return false;

  var month = tokens[0], shortYear = tokens[1];

  var currentDate = new Date();

  var yearFirst2Digits = currentDate.getFullYear().toString().substring(0, 2);

  var date = new Date("".concat(yearFirst2Digits).concat(shortYear + '-').concat(month + '-', "01").concat('T00:00:00'));

  return !isNaN(date) && date.getTime() > currentDate.getTime();
}

/**
 * @param value    {number}
 * @param discount {number}
 * @returns        {number}
 */
function discountPercentage (value, discount) {
  return value * (1 - discount / 100)
}

/**
 * @param value    {number}
 * @param discount {number}
 * @returns        {number}
 */
function discountReal (value, discount) {
  return Math.abs(discount <= value ? discount : value) * -1
}

contraCorrenteVueApp.directive('card', {
  created (el, binding) {
    el.addEventListener('input', () => validateCard(el, binding), false)
  },

  beforeUnmount (el, binding) {
    el.removeEventListener('input', () => validateCard(el, binding), false)
  }
});

contraCorrenteVueApp.directive('date', {
  twoWay: true,

  created (el) {
    el.addEventListener('input', function () {
      const cleanDate = keepNumberOnly(this.value)

      if (cleanDate.length > 2 && cleanDate.length < 5) {
        this.value = cleanDate.replace(/(\d{2})(\d{1,2})/, '$1/$2')

        return
      } else if (cleanDate.length >= 5) {
        this.value = cleanDate.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3')

        return
      }

      this.value = cleanDate
    })
  }
})

contraCorrenteVueApp.directive('cpf', {
  twoWay: true,

  created (el) {
    el.addEventListener('input', function () {
      const cleanValue = keepNumberOnly(this.value)

      if (cleanValue.length <= 11) {
        validaCPF.call(this, cleanValue)
      }
    })
  }
})

contraCorrenteVueApp.directive('phone', {
  twoWay: true,

  created (el) {
    el.addEventListener('input', function () {
      const cleanValue = keepNumberOnly(this.value)

      if (cleanValue.length <= 6) {
        this.value = cleanValue.replace(/(\d{2})(\d{1,4})/, '($1) $2')
      } else if (cleanValue.length <= 10) {
        this.value = cleanValue.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3')
      } else {
        this.value = cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
      }
    })
  }
})

contraCorrenteVueApp.directive('number-only', {
  twoWay: true,

  created (el) {
    el.addEventListener('input', numbersOnly)
  },

  beforeUnmount (el) {
    el.removeEventListener('input', numbersOnly)
  }
})

contraCorrenteVueApp.directive('upper', {
  twoWay: true,

  created (el) {
    el.addEventListener('input', function (e) {
      this.value = this.value?.toUpperCase() ?? ''
    })
  }
})

isPageLoading(true)

const MO = new MutationObserver(function (mutations, observer) {
  let done = false

  if (!document.querySelector('[data-slug]') || document.querySelector('[data-slug]')?.getAttribute('href') === '#') return

  if (document.readyState === 'complete') {
    done = true
    contraCorrenteVueApp.mount('#checkout-form-envelope')
  } else {
    done = true
    window.addEventListener('load', function () {
      contraCorrenteVueApp.mount('#checkout-form-envelope')
    }, false)
  }

  done && observer.disconnect()
})

MO.observe(document.querySelector('#checkout-form-envelope'), {
  subtree: true,
  attributes: true
})
