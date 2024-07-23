
/**
 *
 * @typedef AbandonmentResponse
 * @property {number} abandoment_id
 */

/**
 * @typedef {'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO' | 'MA' | 'MS' | 'MT' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI' | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO'} BrazilianStates
 */

/**
 * @typedef {'03298' | '03220' | '20133'} DeliveryOptionCode
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
 * @typedef {object} AuthSingleAddress
 * @property {string}          id
 * @property {string}          nick
 * @property {string}          cep
 * @property {string}          address
 * @property {string}          number
 * @property {string}          complement
 * @property {string}          neighborhood
 * @property {string}          city
 * @property {BrazilianStates} state
 */

/**
 * @typedef {object} AuthMeAddressItems
 * @property {number}            itemsReceived
 * @property {number}            curPage
 * @property {number | null}     nextPage
 * @property {number | null}     prevPage
 * @property {number}            offset
 * @property {number}            itemsTotal
 * @property {number}            pageTotal
 * @property {AuthSingleAddress} items
 */

/**
 * @typedef {object} AuthMe
 * @property {number}             id
 * @property {string}             name
 * @property {string}             email
 * @property {string}             telephone
 * @property {boolean}            subscriber
 * @property {AuthMeAddressItems} address
 */

/**
 * @typedef InstallmentOptionPrice
 * @property {number}  quantity
 * @property {number}  installmentAmount
 * @property {number}  totalAmount
 * @property {boolean} interestFree
 */

/**
 * @typedef DeliveryOption
 * @property {string}              value
 * @property {string}              deadline
 * @property {DeliveryOptionCode}  code
 * @property {DeliveryOptionLabel} deadline
 */


const GENERAL_HIDDEN_CLASS = 'oculto'

const AUTH_COOKIE_NAME = '__Host-cc-AuthToken'

const blurEvent = new Event('blur')

const COOKIE_SEPARATOR = '; '

const ALLOWED_PAYMENT_METHODS = [
  'pix',
  'creditcard'
]

/**
 *
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
 *
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
 *
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
 *
 * @param node      {HTMLElement | Document}
 * @param eventName {string}
 * @param callback  {EventListener | EventListenerObject}
 * @param options=  {boolean | AddEventListenerOptions}
 */
function attachEvent (node, eventName, callback, options) {
  node.addEventListener(eventName, callback, options)
}

/**
 *
 * @param selector {keyof HTMLElementTagNameMap | string}
 * @param node     {HTMLElement | Document} - optional
 * @returns        {HTMLElementTagNameMap[keyof HTMLElementTagNameMap] | null}
 */
function querySelector (selector, node = document) {
  return node.querySelector(selector)
}

/**
 *
 * @param element {HTMLElement}
 * @param args    {boolean | ScrollIntoViewOptions}
 */
function scrollIntoView (element, args) {
  element.scrollIntoView(args)
}

/**
 *
 * @param status {boolean}
 */
function isPageLoading (status) {
  querySelector('body').classList.toggle('noscroll', status)
  querySelector('[data-wtf-loader]').classList.toggle(GENERAL_HIDDEN_CLASS, !status)
}

/**
 *
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
  createApp,
  watchEffect
} = Vue;

const contraCorrenteVueApp = createApp({
  setup() {
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
    const billingNeighborhood = ref('')
    const billingCity = ref('')
    const billingState = ref('')

    const shippingCEP = ref('')
    const shippingSender = ref('')
    const shippingAddress = ref('')
    const shippingNumber = ref('')
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

  data(){
    return {
      loadingShipping: false,

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
          token: 'same',
          label: 'Entregar meu pedido no mesmo endereço de cobrança do cartão'
        },
        {
          token: 'diff',
          label: 'Cadastrar um endereço diferente para a entrega do meu pedido'
        }
      ],

      productsCorreios: {
        '20133': 'Econômico', // Impresso
        '03298': 'Padrão', // PAC
        '03220': 'Expresso', // Sedex
      },

      selectedPayment: null,
      availablePayments: [
        {
          method: 'creditcard',
          label: 'Cartão de crédito'
        },
        {
          method: 'ticket',
          label: 'Boleto'
        },
        // {
        //   method: 'pix',
        //   label: 'PIX'
        // }
      ],
      shippingDetails: {},
      selectedShipping: '',
      productsResponse: [],

      installments: {},
      selectedInstallmentOption: null,

      xanoProductsAPI: 'https://xef5-44zo-gegm.b2.xano.io/api:RJyl42La/query_products',

      statesAcronym: [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MS', 'MT', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
      ],

      user: null,

      billingAddressesLoaded: 0,
      shippingAddressesLoaded: 0
    }
  },

  async mounted() {
    isPageLoading(true)

    this.getProductsElements()

    await this.queryProducts()

    await Promise.allSettled([
      this.queryShippingPrice(),
      this.querySessionID(),
      this.querySenderHash()
    ])

    await this.getUser()

    watchEffect(() => {
      const { creditCardNumber, creditCardCode, creditCardDate } = this

      if ([creditCardNumber, creditCardCode, creditCardDate].some(param => !param)) return

      this.queryCreditCardNumber({ creditCardNumber, creditCardCode, creditCardDate })
    })

    this.$refs.customerMail.addEventListener('blur', (e) => {
      if (this.savedEmail || !e.target.validity.valid) return

      this.saveCart(e.target.value)
    }, false)

    if (this.user !== null) {
      this.customerEmailModel = this.user.email
      this.customerPhoneModel = this.user.telephone
      this.customerCPFCNPJModel = this.user.cpf
      this.customerBirthdataModel = new Date(`${this.user.birthday}T00:00:00`).toLocaleDateString('pt-BR')
    }

    isPageLoading(false)
  },

  watch: {
    /**
     * @param cep    {string}
     * @param oldCEP {string}
     * @returns      {Promise<void>}
     */
    async shippingCEP(cep, oldCEP) {
      const cleanCEP = cep.replace(/\D+/g, '');

      if (cleanCEP.length < 8 || cleanCEP === oldCEP) return;

      const addressInfo = await getAddressInfo(cleanCEP)

      if (addressInfo.hasOwnProperty('erro')) {
        this.shippingCEP = ''

        this.shippingCity = '';
        this.shippingState = '';
        this.shippingAddress = '';
        this.shippingNeighborhood = '';

        return;
      }

      this.shippingCEP = addressInfo.cep;
      this.shippingAddress = addressInfo.logradouro;
      this.shippingNeighborhood = addressInfo.bairro;
      this.shippingCity = addressInfo.localidade;
      this.shippingState = addressInfo.uf;

      saveCEP(addressInfo.cep.replace(/\D+/g, ''))

      Promise.allSettled([
        this.queryShippingPrice(),
        this.attachCEP2Cart('shipping_cep', addressInfo.cep)
      ])
    },

    /**
     * @param cep    {string}
     * @param oldCEP {string}
     * @returns      {Promise<void>}
     */
    async billingCEP(cep, oldCEP) {
      const cleanCEP = cep.replace(/\D+/g, '');

      if (cleanCEP.length < 8 || cleanCEP === oldCEP) return;

      const addressInfo = await getAddressInfo(cleanCEP)

      if (addressInfo.hasOwnProperty('erro')) {
        this.billingCEP = ''

        this.billingCity = '';
        this.billingState = '';
        this.billingAddress = '';
        this.billingNeighborhood = '';

        return;
      }

      this.billingCEP = addressInfo.cep;
      this.billingAddress = addressInfo.logradouro;
      this.billingNeighborhood = addressInfo.bairro;
      this.billingCity = addressInfo.localidade;
      this.billingState = addressInfo.uf;

      if (!this.deliveryPlace || this.deliveryPlace === 'same') {
        saveCEP(addressInfo.cep.replace(/\D+/g, ''))

        Promise.allSettled([
          this.queryShippingPrice(),
          this.attachCEP2Cart('billing_cep', addressInfo.cep)
        ])
      }
    },

    /**
     * @param date    {string}
     * @param oldDate {string}
     */
    creditCardDate(date, oldDate) {
      const cleanDate = date.replace(/\D+/g, '');

      if (cleanDate.length < 3 || date === oldDate) return;

      this.creditCardDate = date.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    }
  },

  methods: {
    /**
     * @param cep_type  {'billing_cep' | 'shipping_cep'}
     * @param cep_value {string}
     * @returns         {Promise<void>}
     */
    async attachCEP2Cart (cep_type, cep_value) {
      if (!this.abandonmentID) return;

      try {
        await fetch(`https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/cart_abandonment/${this.abandonmentID}`, {
          method: 'PUT',
          body: JSON.stringify({
            [cep_type]: cep_value
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        })
      } catch (e) {}
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
      if (remainingTries < 1) {
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

        this.user = await response.json()

        return true
      } catch (e) {
        return false
      }
    },

    /**
     * @param module         {'billing' | 'shipping'}
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
        return this.handleSearchAddresses(module,remainingTries - 1)
      }

      /**
       * @type {AuthMeAddressItems}
       */
      const data = await response.json()

      this.user.address = Object.assign(this.user.address, {
        curPage: data.curPage,
        nextPage: data.nextPage,
        items: [].concat({
          ...this.user.address.items.at(0)
        }, data.items)
      })

      this.updateMaxDisplayingAddresses(module)

      isPageLoading(false)
    },

    /**
     * @param module {'billing' | 'shipping'}
     */
    updateMaxDisplayingAddresses (module) {
      switch (module) {
        case 'billing':
          this.billingAddressesLoaded = this.getAddresses.length
          break
        case 'shipping':
          this.shippingAddressesLoaded = this.getAddresses.length
      }
    },

    /**
     * @param id     {string}
     * @param module {'billing' | 'shipping'}
     */
    setBillingUserAddress (id, module) {
      /**
       * @type {UserAddress}
       */
      const address = this.user?.address?.items?.find(address => address.id === id)

      if (!address) return;

      switch (module) {
        case 'billing':
          this.billingCEP          = address.cep
          this.billingAddress      = address.address
          this.billingNumber       = address.number
          this.billingNeighborhood = address.neighborhood
          this.billingCity         = address.city
          this.billingState        = address.state

          break
        case 'shipping':
          this.shippingCEP          = address.cep
          this.shippingAddress      = address.address
          this.shippingNumber       = address.number
          this.shippingNeighborhood = address.neighborhood
          this.shippingCity         = address.city
          this.shippingState        = address.state
      }
    },

    async saveCart (email) {
      const response = await fetch('https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/cart_abandonment', {
        method: 'POST',
        body: JSON.stringify({
          email,
          products: this.productsResponse.map(({ ISBN }) => ISBN)
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) return

      this.savedEmail = true

      /**
       * @type {AbandonmentResponse}
       */
      const response_data = await response.json()

      this.abandonmentID = response_data.abandoment_id
    },

    /**
     * @param name {string}
     * @param remainingTries {number}
     */
    async updateCartName (name, remainingTries = 3) {
      if (remainingTries < 1 || this.abandonmentID === null) return

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

    handleblur() {
      this.queryCardBrand(this.creditCardNumber)

      this.runValidations('cardNumber')
    },

    handleSelectInstallment(quantity) {
      this.selectedInstallmentOption = quantity
    },

    getInstallments(creditCardBrandName) {
      const { getProductsSubtotal, getShippingPrice, discount, totalOrderPrice } = this

      PagSeguroDirectPayment.getInstallments({
        amount: totalOrderPrice,
        maxInstallmentNoInterest: 6, // máximo de parcelas sem juros
        brand: creditCardBrandName,
        success: response => {
          this.installments = response
        },
        error: response => {
          this.installments = response
        }
      });
    },

    getProductsElements() {
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

    getSlugFromProductElement(productNode) {
      const anchorElement = productNode.element.querySelector('[data-slug="true"]')

      return anchorElement.href.split('/').at(-1)
    },

    async queryProducts() {
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

    async queryShippingPrice() {
      const { sProduct } = this

      /**
       * @type {ProductResponse[]}
       */
      const productsResponse = this.productsResponse

      if (productsResponse.length === 0 || !hasCEPStoraged()) return null

      const params = {
        accPeso: 0,
        accAltura: 0,
        accLargura: 0,
        accComprimento: 0
      }

      for (let i = 0, len = sProduct.length; i < len; i++) {
        const { quantity, slug } = sProduct[i]
        const {
          weight: pesoResponse,
          height: alturaResponse,
          width: larguraResponse,
          length: comprimentoResponse
        } = productsResponse?.find(product => product?.slug === slug) ?? {};

        const {
          peso,
          altura,
          largura,
          comprimento
        } = measureProducts({
          quantity,
          peso: pesoResponse,
          altura: alturaResponse,
          largura: larguraResponse,
          comprimento: comprimentoResponse
        });

        params.accPeso += peso;
        params.accAltura += altura;
        params.accLargura += largura;
        params.accComprimento += comprimento;
      }

      const data = await getPriceAndDeadline({
        cepDestino: recoverCEPStorage(),
        produtos: {
          pesoObjeto: params.accPeso,
          alturaObjeto: params.accAltura,
          larguraObjeto: params.accLargura,
          comprimentoObjeto: params.accComprimento
        }
      })

      this.shippingDetails = data
    },

    async querySessionID () {
      const { createSessionID } = this

      try {
        const response = await fetch(`https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/api_payment_session_id`)

        if (!response.ok) return

        const { response: xanoResponse } = await response.json()

        PagSeguroDirectPayment.setSessionId(xanoResponse.result.sessionId)

        createSessionID({
          value: xanoResponse.result.sessionId,
          key: 'paymentSessionId'
        })
      } catch (e) {}
    },

    async querySenderHash() {
      const senderHashValue = await PagSeguroDirectPayment.getSenderHash();

      if (senderHashValue == null || senderHashValue == '') {
        setTimeout(function () {
          this.querySenderHash();
        }, 2000);
      } else {
        this.senderHash = senderHashValue;
      }
    },

    /**
     * @param e {MouseEvent}
     * @returns {Promise<void>}
     */
    async handleProcessPayment (e) {
      e.preventDefault()

      this.submitted = true;

      if (this.isLoading === true || this.loadingShipping) return;

      /**
       * @type {EntryValidation[]}
       */
      const invalidFields = Object
        .values(this.vuelidate)
        .filter(({ field, valid, ignoreIf }) => ([null, undefined].includes(ignoreIf) || ignoreIf === false) && (field !== null && valid === false))

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

      if (!this.validationRules) {
        return
      }

      this.isLoading = true
      isPageLoading(true)

      if (this.selectedPayment === 'creditcard') {
        await this.postCreditCardPayment()
      } else {
        await this.postPayment()
      }

      this.isLoading = false
      isPageLoading(false)
    },

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

            ...(deliveryPlace === 'diff' && parseDifferentAddresses()),

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

    async searchAddress() {},

    parseDifferentAddresses() {
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

    queryCardBrand(creditCardNumber) {
      const { getInstallments } = this

      if (!creditCardNumber || creditCardNumber?.length <= 7) return

      PagSeguroDirectPayment.getBrand({
        cardBin: creditCardNumber?.replace(/\D+/g, ''),
        success: (response) => {
          if (!response?.brand?.name) return

          this.brandName = response.brand.name

          getInstallments(response.brand.name)
        },
        error: (response) => {
        }
      });
    },

    queryCreditCardNumber({ creditCardNumber, creditCardCode, creditCardDate }) {
      const parsedCreditCardDate = String(creditCardDate).replace(/\D+/g, '')
      const parsedCreditCardCode = String(creditCardCode).replace(/\D+/g, '')
      const parsedCreditCardNumber = String(creditCardNumber).replace(/\D+/g, '')

      if (parsedCreditCardNumber.length === 0 || parsedCreditCardCode.length === 0 || parsedCreditCardDate.length === 0) return

      PagSeguroDirectPayment.createCardToken({
        cvv: parsedCreditCardCode,
        cardNumber: parsedCreditCardNumber,

        expirationYear: '20' + parsedCreditCardDate.substr(2, 2),
        expirationMonth: parsedCreditCardDate.substr(0, 2),

        success: (response) => {
          this.creditCardToken = response?.card?.token
        },

        error: (response) => {
        }
      })
    },

    createSessionID({ key, value }) {
      sessionStorage.setItem(key, value)
    },

    async handleShippingType(shippingCode, evt) {
      if (this.selectedShipping === shippingCode || this.loadingShipping) return

      this.loadingShipping = true

      this.selectedShipping = shippingCode

      evt.currentTarget.classList.toggle('selecionado', shippingCode)

      await this.queryShippingPrice()

      this.queryCardBrand(this.creditCardNumber)

      this.coupomSuccessMessage = ''

      this.loadingShipping = false
    },

    pluralize({ count, one, many }) {
      return count > 1
        ? many
        : one
    },

    handleChangePaymentMethod(method) {
      if (this.selectedPayment === method) return

      this.selectedPayment = method
      this.deliveryPlace = null
    },

    handleDeliveryPlace(token) {
      this.deliveryPlace = token
    },

    async queryCupom() {
      isPageLoading(true)

      /**
       * @type {{price: number, full_price: number}}
       */
      const getProductPrices = this.getProductPrices

      try {
        const { cupomCode } = this

        const response = await fetch(`https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/coupon?coupon_code=${cupomCode.toUpperCase()}`)

        if (!response.ok) {
          this.handleRemoveCoupon()

          this.cupomData = {
            error: true
          }

          this.coupomErrorMessage = 'O cupom informado é inválido!'

          isPageLoading(false)

          return
        }

        const data = await response.json()

        if (!data.is_active) {
          this.handleRemoveCoupon()

          this.cupomData = {
            error: true
          }

          isPageLoading(false)

          return
        }

        // compara o valor mínimo de compra com o preço "de" dos produtos multiplicados pela respectiva quantidade
        if (data.min_purchase > getProductPrices.price) {
          this.cupomData = {
            error: true
          }

          this.coupomErrorMessage = 'Cupom requer valor mínimo de '.concat(STRING_2_BRL_CURRENCY(data.min_purchase))

          isPageLoading(false)

          return
        }

        /**
         * @type {ProductResponse[]}
         */
        const productsResponse = this.productsResponse

        if (data.cupom_type === 'isbn' && !productsResponse.some(({ ISBN }) => ISBN === data.isbn)) {
          this.cupomData = {
            error: true
          }

          this.coupomErrorMessage = 'Este cupom não é válido para o livro selecionado'

          isPageLoading(false)

          return
        }

        if (data.cupom_type === 'shipping' && this.selectedShipping.length === 0) {
          this.coupomSuccessMessage = 'Cupom aplicado com sucesso! Para visualizar o desconto, defina o método de envio.'
        }

        this.coupomSuccessMessage = 'Cupom de desconto aplicado com sucesso!'

        if (this.selectedPayment === 'creditcard') {
          await this.queryCardBrand(this.creditCardNumber.replace(/\s+/g, ''))
        }

        this.cupomData = data

        setTimeout(async () => {
          await this.checkSubscriptionIssue()

          isPageLoading(false)
        }, 50)
      } catch (e) {
        this.handleRemoveCoupon()

        this.cupomData = {
          error: true
        }

        this.coupomErrorMessage = 'O cupom informado é inválido!'

        isPageLoading(false)
      }
    },

    async handleRemoveCoupon() {
      this.cupomCode = ''
      this.cupomData = {}

      if (this.selectedPayment === 'creditcard') {
        await this.queryCardBrand(this.creditCardNumber.replace(/\s+/g, ''))
      }
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
     * @returns {boolean}
     */
    isSubscriber () {
      /**
       * @type {AuthMe | null}
       */
      const user = this.user

      return user?.subscriber ?? false
    },

    /**
     * @returns {number}
     */
    getSubscriptionBooksPrice () {
      /**
       * @type {{price: number, full_price: number}}
       */
      const booksFullPriceSubtotal = this.getProductPrices

      if (!this.isSubscriber) return booksFullPriceSubtotal.price

      return booksFullPriceSubtotal.full_price * (1 - this.subscriptionDiscount)
    },

    /**
     * @returns {number}
     */
    getSubscriptionBooksDiscount () {
      if (!this.isSubscriber) return 0

      /**
       * @type {{price: number, full_price: number}}
       */
      const booksFullPriceSubtotal = this.getProductPrices

      return booksFullPriceSubtotal.full_price * this.subscriptionDiscount
    },

    /**
     * @returns {boolean}
     */
    couponIsAppliableBySubscription () {
      if (this.isSubscriber) {
        if (!this.hasAppliedCoupon) return false

        if (this.cupomData.cupom_type === 'shipping') return true

        return this.getSubscriptionBooksPrice >= (this.getProductPrices.price + this.discount)
      }

      return true
    },

    /**
     * @returns {boolean}
     */
    hasAppliedSubscriberDiscount () {
      /**
       * @type {Prices}
       */
      const prices = this.getPrices

      /**
       * @type {{price: number, full_price: number}}
       */
      const getProductsPrices = this.getProductPrices

      return this.isSubscriber && this.getSubscriptionBooksPrice <= getProductsPrices.price + this.discount
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
      return this.selectedPayment === 'creditcard' && this.deliveryPlace === 'diff' || this.selectedPayment === 'ticket'
    },

    /**
     * @returns {InstallmentOptionPrice[]}
     */
    listInstallments () {
      const { installments, brandName } = this

      if (installments?.installments?.error || !Object.keys(installments?.installments ?? {}).length) return []

      const maxInstallments = installments.installments[brandName].slice(0, 6)

      return maxInstallments.map(installmentOption => {
        return Object.assign(installmentOption, {
          installmentAmount: STRING_2_BRL_CURRENCY(installmentOption.installmentAmount)
        })
      })
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
      const { shippingDetails } = this

      return Object.keys(shippingDetails ?? {}).length > 0
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

        /**
         * @type {number}
         */
        const whichPrice = isSubscriber && getSubscriptionBooksDiscount >= (discount * -1)
          ? product?.full_price
          : discountOverProducts
              ? product?.full_price
              : product?.price

        return price + (whichPrice ?? 0) * quantity
      }, 0)
    },

    /**
     * @returns {number}
     */
    getShippingPrice () {
      const { hasShippingDetails, selectedShipping, shippingDetails, cupomData, getProductsSubtotal } = this

      if (!hasShippingDetails) return 0

      const selectedShippingPrice = shippingDetails?.price?.find(({ coProduto }) => coProduto === selectedShipping)

      if (!selectedShippingPrice || selectedShippingPrice.hasOwnProperty('txErro')) return 0

      return parseFloat((selectedShippingPrice?.pcFinal).replace(/\,+/g, '.')) * this.shippingTax
    },

    /**
     * @returns {string}
     */
    shippingPrice () {
      const { getShippingPrice } = this

      return STRING_2_BRL_CURRENCY(getShippingPrice)
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
     * @returns {{price: number, full_price: number}}
     * @description Retorna o somatório de ambos os preços de capa e de venda dos produtos, multiplicados pelas suas respectivas quantidades
     */
    getProductPrices () {
      /**
       * @type {productsResponse[]}
       */
      const productsResponse = this.productsResponse

      /**
       * @type {sProduct[]}
       */
      const sProduct = this.sProduct

      const prices = {
        price: 0,
        full_price: 0
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
      const { discount, isSubscriber, getSubscriptionBooksPrice } = this

      /**
       * @type {{price: number, full_price: number}}
       */
      const prices = this.getProductPrices

      return isSubscriber && getSubscriptionBooksPrice <= prices.price + discount
        ? prices.full_price
        : prices.price
    },

    /**
     * @returns {'price' | 'full_price'}
     */
    sProductPriceType () {
      const { discount, isSubscriber, getSubscriptionBooksPrice } = this

      /**
       * @type {{price: number, full_price: number}}
       */
      const prices = this.getProductPrices

      return isSubscriber && getSubscriptionBooksPrice <= prices.price + discount
        ? 'full_price'
        : 'price'
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
      const { getProductsSubtotal, getShippingPrice, discount, discountOverProducts, getSubscriptionBooksPrice, isSubscriber } = this

      /**
       * @type {Prices}
       */
      const prices = this.getPrices

      /**
       * @type {{price: number, full_price: number}}
       */
      const productPrices = this.getProductPrices

      if (isSubscriber && this.hasAppliedCoupon) {
        if (this.cupomData?.cupom_type === 'shipping') {
          return getSubscriptionBooksPrice + discount + getShippingPrice
        }

        return getSubscriptionBooksPrice <= productPrices.price + discount
          ? getSubscriptionBooksPrice + getShippingPrice
          : productPrices.price + getShippingPrice + discount
      }

      if (isSubscriber) {
        return getSubscriptionBooksPrice + getShippingPrice
      }

      return productPrices.price + getShippingPrice + discount
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
      const { shippingDetails, hasShippingDetails, productsCorreios, pluralize } = this

      if (!hasShippingDetails) {
        return Object
          .entries(productsCorreios)
          .reduce((fakeOptions, [key, value]) => {
            return fakeOptions.concat({
              code: key,
              option: value,
              value: 'R$ xx,xx',
              deadline: 'x dias',
            })
          }, [])
      }

      const prices = shippingDetails?.price
      const deadlines = shippingDetails?.deadline

      const minLength = Math.min(prices?.length, deadlines?.length)

      return Array
        .from({ length: minLength }, (_, index) => {
          const currentPrice = prices[index]
          const currentDeadline = deadlines[index]

          const _deadline = currentPrice?.coProduto === '03220'
            ? (currentDeadline?.prazoEntrega ?? 0) + 2
            : currentDeadline?.prazoEntrega ?? 0

          return {
            code: currentPrice?.coProduto ?? '#',
            deadline: pluralize({
              count: _deadline,
              one: `${_deadline} dia`,
              many: `${_deadline} dias`,
            }),
            option: productsCorreios[currentPrice?.coProduto] ?? '#####',
            value: currentPrice.hasOwnProperty('txErro')
              ? null
              : STRING_2_BRL_CURRENCY(currentPrice?.pcFinal?.replace(/\,+/g, '.') * this.shippingTax)
          }
        })
        .filter(deliveryOption => deliveryOption.value !== null)
    },

    /**
     * @returns {boolean}
     */
    hasDeliveryData () {
      const { selectedPayment, deliveryPlace } = this

      return selectedPayment === null || ['ticket', 'pix'].includes(selectedPayment) || (selectedPayment === 'creditcard' && deliveryPlace === 'diff')
    },

    validationRules() {
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
        shippingCEP.replace(/\D+/g, '').length === 8 &&
        shippingSender.length > 0 &&
        shippingAddress.length > 0 &&
        String(shippingNumber).length > 0 &&
        shippingNeighborhood.length > 0 &&
        shippingCity.length > 0 &&
        shippingState.length === 2
      );

      const isShippingValid = selectedShipping.length === 5 && getShippingPrice > 0;

      if (selectedPayment === 'ticket') {
        return shippingAddressValid && isShippingValid && isBasicDataValid
      }

      const cardNameHolder = normalizeText(String(creditCardName)).replace(/\s{2,}/g, ' ').trim().split(' ');

      const billingAddressValid = (
        billingCEP.replace(/\D+/g, '').length === 8 &&
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

      const isPaymentCardValid = brandName?.length > 1 && senderHash?.length > 1 && !installments?.error && Object.keys(installments?.installments ?? {}).length === 1 && selectedInstallmentOption !== null;

      if (selectedPayment === 'creditcard') {
        return deliveryPlace === 'same'
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
      const { submitted, deliveryPlace, selectedPayment } = this

      return submitted && deliveryPlace === null && selectedPayment === 'creditcard'
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
      const { selectedInstallmentOption, submitted, selectedPayment } = this

      return submitted && selectedInstallmentOption === null && selectedPayment === 'creditcard'
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
          valid: ((/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(customerCPFCNPJModel) && CPFMathValidator(customerCPFCNPJModel)) || (/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/.test(customerCPFCNPJModel)) && CNPJMathValidator(customerCPFCNPJModel))
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
          valid: selectedPayment === 'creditcard' && /^(\w{2,})(\s+(\w+))+$/.test(normalizeText(creditCardName).trim().replace(/\s{2,}/g, ' '))
        },

        cardNumber: {
          field: customerCardNumber,
          valid: selectedPayment === 'creditcard' && /^(\d{4})(\s\d{4}){3}/.test(creditCardNumber)
        },

        cardValidate: {
          field: customerCardDate,
          valid: selectedPayment === 'creditcard' && /^\d{2}\/\d{2}$/.test(creditCardDate) && isExpireDateValid(creditCardDate),
        },

        cardCode: {
          field: customerCardCode,
          valid: selectedPayment === 'creditcard' && String(creditCardCode).length === 3 && /^\d{3}$/.test(String(creditCardCode)),
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
          ignoreIf: selectedPayment !== 'creditcard',
          field: shippingAddressMessage,
          valid: selectedPayment === 'creditcard' && deliveryPlaces.map(({ token }) => token).includes(deliveryPlace)
        },

        shippingMethodMessage: {
          field: shippingMethodMessage,
          valid: Object.keys(productsCorreios).includes(String(selectedShipping))
        },

        installmentMessage: {
          ignoreIf: selectedPayment !== 'creditcard',
          field: installmentCountMessage,
          valid: Array.isArray(listInstallments) && listInstallments.length > 0 && selectedInstallmentOption !== null
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
        return ((/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(customerCPFCNPJModel) && CPFMathValidator(customerCPFCNPJModel)) || (/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/.test(customerCPFCNPJModel)) && CNPJMathValidator(customerCPFCNPJModel))
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
      return this.hasAppliedCoupon && ['subtotal', 'isbn'].includes(this.cupomData?.cupom_type)
    },

    /**
     * @returns {number}
     */
    discount() {
      const {
        productsResponse,
        getShippingPrice,
        getProductsSubtotal
      } = this

      /**
       * @type {{price: number, full_price: number}}
       */
      const getProductPrices = this.getProductPrices

      const { is_percentage, min_purchase, products_id, value, cupom_type, isbn } = this.cupomData

      const isGreaterThanMinPurchaseValue = getProductsSubtotal >= min_purchase

      if (!isGreaterThanMinPurchaseValue) return 0

      switch (cupom_type) {
        case 'shipping':
          return is_percentage
            ? getShippingPrice - discountPercentage(getShippingPrice, -value)
            : discountReal(getShippingPrice, value)
        case 'subtotal':
          return is_percentage
            ? getProductPrices.price - discountPercentage(getProductPrices.price, -value)
            : discountReal(getProductPrices.price, value)
        case 'isbn':
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
function CPFMathValidator(cpf) {
  let Soma = 0
  let Resto = 0

  let strCPF = String(cpf).replace(/\D+/g, '')

  if (strCPF.length !== 11) return false

  if ([
    '00000000000',
    '11111111111',
    '22222222222',
    '33333333333',
    '44444444444',
    '55555555555',
    '66666666666',
    '77777777777',
    '88888888888',
    '99999999999',
  ].indexOf(strCPF) !== -1) return false

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
 * @param cnpj {string}
 * @returns    {boolean}
 */
function CNPJMathValidator(cnpj) {
  let b = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  let c = String(cnpj).replace(/[^\d]/g, '')

  if (c.length !== 14) return false

  if (/0{14}/.test(c)) return false

  let n = 0

  for (let i = 0; i < 12; n += c[i] * b[++i]);

  if (c[12] !== String(((n %= 11) < 2) ? 0 : 11 - n)) return false

  n = 0

  for (let i = 0; i <= 12; n += c[i] * b[i++]);

  if (c[13] != String(((n %= 11) < 2) ? 0 : 11 - n)) return false

  return true
}

/**
 * @param date {string}
 * @returns    {boolean}
 */
function isDateValid(date) {
  const [
    day,
    month,
    fullYear
  ] = date.split('/');

  const dateInstace = new Date(`${fullYear}-${month}-${day}T00:00:00`);

  return !isNaN(dateInstace);
}

function validateCard(el, binding) {
  const cleanNumber = el.value.replace(/\D+/g, '');

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
function validaCPF(cpf) {
  if (cpf.length <= 6) {
    this.value = cpf.replace(/^(\d{3})(\d{1,3})/, '$1.$2')
  } else if (cpf.length <= 9) {
    this.value = cpf.replace(/^(\d{3})(\d{3})(\d{1,3})$/, '$1.$2.$3')
  } else {
    this.value = cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, '$1.$2.$3-$4')
  }
}

/**
 * @param cnpj {string}
 */
function validaCNPJ(cnpj) {
  if (cnpj.length <= 12) {
    this.value = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})$/, '$1.$2.$3/$4');
  } else {
    this.value = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})$/, '$1.$2.$3/$4-$5');
  }
}

/**
 * @param e {Event}
 */
function numbersOnly(e) {
  e.target.value = e.target.value.replace(/\D+/g, '');
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
function isExpireDateValid(expireDate) {
  var tokens = expireDate.split('/');

  if (tokens.length < 2 || tokens.some(function (token) { return token.length < 2; })) return false;

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
function discountPercentage(value, discount) {
  return value * (1 - discount / 100)
}

/**
 * @param value    {number}
 * @param discount {number}
 * @returns        {number}
 */
function discountReal(value, discount) {
  return Math.abs(discount <= value ? discount : value) * -1
}

window.addEventListener('load', function () {
  contraCorrenteVueApp.directive('card', {
    created(el, binding) {
      el.addEventListener('input', () => validateCard(el, binding), false);
    },

    beforeUnmount(el, binding) {
      el.removeEventListener('input', () => validateCard(el, binding), false);
    }
  });

  contraCorrenteVueApp.directive('date', {
    twoWay: true,

    created(el) {
      el.addEventListener('input', function () {
        const cleanDate = this.value.replace(/\D+/g, '');

        if (cleanDate.length > 2 && cleanDate.length < 5) {
          this.value = cleanDate.replace(/(\d{2})(\d{1,2})/, '$1/$2');

          return;
        } else if (cleanDate.length >= 5) {
          this.value = cleanDate.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');

          return;
        }

        this.value = cleanDate;
      });
    }
  });

  contraCorrenteVueApp.directive('cpf', {
    twoWay: true,

    created(el) {
      el.addEventListener('input', function () {
        const cleanValue = this.value.replace(/\D+/g, '');

        if (cleanValue.length <= 11) {
          validaCPF.call(this, cleanValue);

          return;
        }

        validaCNPJ.call(this, cleanValue);
      });
    }
  });

  contraCorrenteVueApp.directive('phone', {
    twoWay: true,

    created(el) {
      el.addEventListener('input', function () {
        const cleanValue = this.value.replace(/\D+/g, '');

        if (cleanValue.length <= 6) {
          this.value = cleanValue.replace(/(\d{2})(\d{1,4})/, '($1) $2');
        } else if (cleanValue.length <= 10) {
          this.value = cleanValue.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
        } else {
          this.value = cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
      });
    }
  });

  contraCorrenteVueApp.directive('number-only', {
    twoWay: true,

    created(el) {
      el.addEventListener('input', numbersOnly);
    },

    beforeUnmount(el) {
      el.removeEventListener('input', numbersOnly);
    }
  });

  contraCorrenteVueApp.directive('upper', {
    twoWay: true,

    created(el) {
      el.addEventListener('input', function (e) {
        this.value = this.value?.toUpperCase() ?? ''
      });
    }
  });

  contraCorrenteVueApp.mount('#checkout-form-envelope');
}, false);
