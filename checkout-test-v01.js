

const GENERAL_HIDDEN_CLASS = 'oculto'

const blurEvent = new Event('blur')

const ALLOWED_PAYMENT_METHODS = [
  'pix',
  'creditcard'
]

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
      installmentCountMessage
    }
  },

  data() {
    return {
      submitted: false,

      isLoading: false,
      savedEmail: false,
      errorMessageOrderValidation: null,

      validationFeedback: [],

      shippingTax: 1,

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
        '20133': 'Impresso',
        '03298': 'PAC',
        '03220': 'Sedex',
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
      ]
    }
  },

  async mounted() {
    this.getProductsElements()

    await this.queryProducts()

    await Promise.allSettled([
      this.queryShippingPrice()
    ])

    this.querySessionID()

    this.querySenderHash()

    watchEffect(() => {
      const { creditCardNumber, creditCardCode, creditCardDate } = this

      if ([creditCardNumber, creditCardCode, creditCardDate].some(param => !param)) return

      this.queryCreditCardNumber({ creditCardNumber, creditCardCode, creditCardDate })
    })

    this.$refs.customerMail.addEventListener('blur', (e) => {
      if (this.savedEmail || !e.target.validity.valid) return

      this.saveCart(e.target.value)
    }, false)

    isPageLoading(false)
  },

  watch: {
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

      this.queryShippingPrice()
    },

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

        this.queryShippingPrice()
      }
    },

    creditCardDate(date, oldDate) {
      const cleanDate = date.replace(/\D+/g, '');

      if (cleanDate.length < 3 || date === oldDate) return;

      this.creditCardDate = date.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    }
  },

  methods: {
    async saveCart (email) {
      await fetch('https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/cart_abandonment', {
        method: 'POST',
        body: JSON.stringify({
          email,
          products: this.productsResponse.map(({ ISBN }) => ISBN)
        }),
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(() => {
        this.savedEmail = true
      });
    },

    /**
     *
     * @param fieldname {string}
     */
    runValidations (fieldname) {
      if (this.validationFeedback.includes(fieldname)) return

      this.validationFeedback.push(fieldname)
    },

    handleblur() {
      this.queryCardBrand(this.creditCardNumber)

      this.runValidations('cardNumber')
    },

    handleSelectInstallment(quantity) {
      this.selectedInstallmentOption = quantity
    },

    getInstallments(creditCardBrandName) {
      const { getProductsSubtotal, getShippingPrice, discount } = this

      PagSeguroDirectPayment.getInstallments({
        amount: getProductsSubtotal + getShippingPrice + discount,
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
          element: nodelist[index],
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
        return
      }

      this.productsResponse = await response.json()
    },

    async queryShippingPrice() {
      const { productsResponse, sProduct } = this

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

    async querySessionID() {
      const { createSessionID } = this

      const response = await fetch(`https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/api_payment_session_id`)

      if (!response.ok) return

      const { response: xanoResponse } = await response.json()

      PagSeguroDirectPayment.setSessionId(xanoResponse.result.sessionId)

      createSessionID({
        value: xanoResponse.result.sessionId,
        key: 'paymentSessionId'
      })
    },

    querySenderHash() {
      const senderHashValue = PagSeguroDirectPayment.getSenderHash();

      if (senderHashValue == null || senderHashValue == '') {
        setTimeout(function () {
          this.querySenderHash();
        }, 2000);
      } else {
        this.senderHash = senderHashValue;
      }
    },

    async handleProcessPayment(e) {
      e.preventDefault()

      this.submitted = true;

      if (this.isLoading === true) return;

      /**
       *
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

      if (this.selectedPayment === 'creditcard') {
        await this.postCreditCardPayment()
      } else {
        await this.postPayment()
      }

      this.isLoading = false
    },

    clearUniqueDash (value) {
      return value.length === 1 && value === '-'
        ? ''
        : value
    },

    // envio de pagamento via boleto
    async postPayment() {
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
        getProductsSubtotal,
        getShippingPrice,
        clearUniqueDash
      } = this

      const paymentResponse = await fetch('https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/api_payment_process_boleto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer_name: clearUniqueDash(customerShippingSender.value),
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

          amount: +(getProductsSubtotal + getShippingPrice).toFixed(2),
          sender_hash: senderHash,

          products: sProduct.map(({ quantity, slug }) => ({
            quantity, slug
          })),

          shippingMethod: clearUniqueDash(selectedShipping),
          shippingPrice: parseFloat(getShippingPrice.toFixed(2)),

          discount: 0,
          discount_code: null,

          ...(Object.keys(cupomData).includes('code') && {
            discount_code: cupomData.code,
            discount: parseFloat((discount * -1).toFixed(2))
          }),

          // ...(cupomData?.cupom_type === 'subtotal' && {
          //   amount: +(getProductsSubtotal + getShippingPrice + discount).toFixed(2)
          // }),

          // ...(cupomData?.cupom_type === 'shipping' && {
          //   shippingPrice: parseFloat(getShippingPrice.toFixed(2)) + discount
          // }),

          // ...(cupomData?.cupom_type === 'isbn' && {
          //   amount: +(getProductsSubtotal + getShippingPrice + discount).toFixed(2)
          // })
        })
      })

      if (!paymentResponse.ok) {
        this.errorMessageOrderValidation = paymentResponse?.message ?? 'Por favor, tente novamente! Não foi possível realizar o pagamento. Se o problema persistir, entre em contato via WhatsApp para obter ajuda.';

        return;
      }

      const paymentData = await paymentResponse.json()

      window.open(paymentData.boletourl, '_blank');

      setTimeout(() => {
        location.href = `${location.protocol}//${location.hostname}/order-confirmation?order-id=${paymentData?.transactionid}`;
      }, 1000);
    },

    // envio de pagamento via cartão
    async postCreditCardPayment() {
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
        customerBillingState
      } = this

      const amount = parseFloat((getShippingPrice + getProductsSubtotal + discount).toFixed(2));

      const paymentResponse = await fetch('https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/api_payment_process_card_V02', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer_name: creditCardName,
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

          card_full_name: creditCardName,
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

          ...(Object.keys(cupomData).includes('code') && {
            discount_code: cupomData.code,
            discount: parseFloat((discount * -1).toFixed(2))
          })
        })
      })

      if (!paymentResponse.ok) {
        this.errorMessageOrderValidation = paymentResponse?.message ?? 'Por favor, tente novamente! Não foi possível realizar o pagamento. Se o problema persistir, entre em contato via WhatsApp para obter ajuda.';

        return;
      }

      const paymentData = await paymentResponse.json()

      setTimeout(() => {
        location.href = `${location.protocol}//${location.hostname}/order-confirmation?order-id=${paymentData?.transactionid}`;
      }, 1000);
    },

    async searchAddress() { },

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
        error: (response) => { }
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
      if (this.selectedShipping === shippingCode) return

      this.selectedShipping = shippingCode

      evt.currentTarget.classList.toggle('selecionado', shippingCode)

      await this.queryShippingPrice()

      this.queryCardBrand(this.creditCardNumber)

      this.coupomSuccessMessage = ''
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
      const { cupomCode } = this

      const response = await fetch(`https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/coupon?coupon_code=${cupomCode.toUpperCase()}`)

      if (!response.ok) {
        this.handleRemoveCoupon()

        this.cupomData = {
          error: true
        }

        this.coupomErrorMessage = 'O cupom informado é inválido!'

        return
      }

      const data = await response.json()

      if (!data.is_active) {
        this.handleRemoveCoupon()

        this.cupomData = {
          error: true
        }

        return
      }

      if (data.min_purchase > this.getProductsSubtotal) {
        this.cupomData = {
          error: true
        }

        this.coupomErrorMessage = 'Cupom requer valor mínimo de '.concat(STRING_2_BRL_CURRENCY(data.min_purchase))

        return
      }

      if (data.cupom_type === 'isbn' && !this.productsResponse.some(({ ISBN }) => ISBN === data.isbn)) {
        this.cupomData = {
          error: true
        }

        this.coupomErrorMessage = 'Este cupom não é válido para o livro selecionado'

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
    },

    async handleRemoveCoupon() {
      this.cupomCode = ''
      this.cupomData = {}

      if (this.selectedPayment === 'creditcard') {
        await this.queryCardBrand(this.creditCardNumber.replace(/\s+/g, ''))
      }
    }
  },

  computed: {
    listInstallments() {
      const { installments, brandName } = this

      if (installments?.installments?.error || !Object.keys(installments?.installments ?? {}).length) return []

      const maxInstallments = installments.installments[brandName].slice(0, 6)

      return maxInstallments.map(installmentOption => {
        return Object.assign(installmentOption, {
          installmentAmount: STRING_2_BRL_CURRENCY(installmentOption.installmentAmount)
        })
      })
    },

    displayFinalShippingPrice() {
      const { hasShippingDetails, selectedShipping } = this

      return hasShippingDetails && selectedShipping.length > 0
    },

    hasShippingDetails() {
      const { shippingDetails } = this

      return Object.keys(shippingDetails ?? {}).length > 0
    },

    getProductsSlugs() {
      const { sProduct, getSlugFromProductElement } = this

      return sProduct.length > 0
        ? sProduct.map(getSlugFromProductElement)
        : []
    },

    getProductsSubtotal() {
      const { productsResponse, sProduct } = this

      return productsResponse.reduce((price, product) => {
        const quantity = sProduct?.find(prod => prod.slug === product?.slug)?.quantity ?? 1

        return price + (product?.price ?? 0) * quantity
      }, 0)
    },

    getShippingPrice() {
      const { hasShippingDetails, selectedShipping, shippingDetails, cupomData, getProductsSubtotal } = this

      if (!hasShippingDetails) return 0

      const selectedShippingPrice = shippingDetails?.price?.find(({ coProduto }) => coProduto === selectedShipping)

      if (!selectedShippingPrice || selectedShippingPrice.hasOwnProperty('txErro')) return 0

      return parseFloat((selectedShippingPrice?.pcFinal).replace(/\,+/g, '.')) * this.shippingTax
    },

    shippingPrice() {
      const { getShippingPrice } = this

      return STRING_2_BRL_CURRENCY(getShippingPrice)
    },

    subtotal () {
      const { getProductsSubtotal } = this

      return STRING_2_BRL_CURRENCY(getProductsSubtotal)
    },

    totalOrder() {
      const { getProductsSubtotal, getShippingPrice, discount } = this

      return STRING_2_BRL_CURRENCY(getProductsSubtotal + getShippingPrice + discount)
    },

    deliveryOptions() {
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

      return Array.from({ length: minLength }, (_, index) => {
        const currentPrice = prices[index]
        const currentDeadline = deadlines[index]

        const _deadline = currentDeadline?.prazoEntrega ?? 0

        return {
          code: currentPrice?.coProduto ?? '#',
          deadline: pluralize({
            count: _deadline,
            one: `${_deadline} dia`,
            many: `${_deadline} dias`,
          }),
          option: productsCorreios[currentPrice?.coProduto] ?? '#####',
          value: STRING_2_BRL_CURRENCY(currentPrice?.pcFinal?.replace(/\,+/g, '.') * this.shippingTax),
        }
      })
    },

    hasDeliveryData() {
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

      const cardNameHolder = creditCardName.split(' ');

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
     *
     * @returns {boolean}
     */
    showPaymentMethodError () {
      const { selectedPayment, submitted } = this

      return submitted && selectedPayment === null
    },

    /**
     *
     * @returns {boolean}
     */
    showDeliveryMethodError () {
      const { submitted, deliveryPlace, selectedPayment } = this

      return submitted && deliveryPlace === null && selectedPayment === 'creditcard'
    },

    /**
     *
     * @returns {boolean}
     */
    showShippingMethodError () {
      const { submitted, selectedShipping } = this

      return submitted && selectedShipping.toString().length === 0
    },

    /**
     *
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
     *
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
          valid: selectedPayment === 'creditcard' && /^(\w{2,})(\s+(\w+))+$/.test(normalizeText(creditCardName.replace(/\s+/g, ' ')).trim())
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
          valid: /^(\w{2,})(\s+(\w{2,}))+$/.test(normalizeText(shippingSender))
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

    isValidationRunningForField() {
      const { validationFeedback } = this

      return (fieldname) => validationFeedback.includes(fieldname)
    },

    isEmailValid() {
      const { customerEmailModel, isValidationRunningForField } = this

      if (isValidationRunningForField('customerEmail')) {
        return customerEmailModel.includes('@') && customerEmailModel.includes('.')
      }

      return true
    },

    isPhoneNumberValid() {
      const { customerPhoneModel, isValidationRunningForField } = this

      if (isValidationRunningForField('customerPhone')) {
        return /\(\d{2}\)\d{4,5}\-\d{4}/.test(customerPhoneModel.replace(/\s+/g, ''))
      }

      return true
    },

    isCPFCNPJValid() {
      const { customerCPFCNPJModel, isValidationRunningForField } = this

      if (isValidationRunningForField('customerCPFCNPJ')) {
        return ((/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(customerCPFCNPJModel) && CPFMathValidator(customerCPFCNPJModel)) || (/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/.test(customerCPFCNPJModel)) && CNPJMathValidator(customerCPFCNPJModel))
      }

      return true
    },

    isBirthdateValid() {
      const { customerBirthdataModel, isValidationRunningForField } = this

      if (isValidationRunningForField('customerBirthdate')) {
        return /^\d{2}\/\d{2}\/\d{4}$/.test(customerBirthdataModel) && isDateValid(customerBirthdataModel)
      }

      return true
    },

    isCardHolder() {
      const { creditCardName, isValidationRunningForField } = this

      if (isValidationRunningForField('cardHolder')) {
        return /^(\w{2,})(\s+(\w{1,}))+$/.test(normalizeText(creditCardName))
      }

      return true
    },

    isCreditCardNumberValid() {
      const { creditCardNumber, isValidationRunningForField } = this

      if (isValidationRunningForField('cardNumber')) {
        return /^(\d{4})(\s\d{4}){3}/.test(creditCardNumber)
      }

      return true
    },

    isCreditCardExpireDateValid() {
      const { creditCardDate, isValidationRunningForField } = this

      if (isValidationRunningForField('cardExpireDate')) {
        return /^\d{2}\/\d{2}$/.test(creditCardDate) && isExpireDateValid(creditCardDate)
      }

      return true
    },

    isCreditCardCVVValid() {
      const { creditCardCode, isValidationRunningForField } = this

      if (isValidationRunningForField('cardCVV')) {
        return String(creditCardCode).length === 3 && /^\d{3}$/.test(String(creditCardCode))
      }

      return true
    },

    isBillingCEPValid () {
      const { billingCEP, isValidationRunningForField } = this

      if (isValidationRunningForField('billingCEP')) {
        return /^\d{5}\-\d{3}$/.test(String(billingCEP))
      }

      return true
    },

    isBillingAddressValid () {
      const { billingAddress, isValidationRunningForField } = this

      if (isValidationRunningForField('billingAddress')) {
        return billingAddress.length > 2
      }

      return true
    },

    isBillingNumberValid() {
      const { billingNumber, isValidationRunningForField } = this

      if (isValidationRunningForField('billingNumber')) {
        return String(billingNumber).length > 0
      }

      return true
    },

    isBillingNeighborhoodValid() {
      const { billingNeighborhood, isValidationRunningForField } = this

      if (isValidationRunningForField('billingNeighborhood')) {
        return billingNeighborhood.length > 0
      }

      return true
    },

    isBillingCityValid() {
      const { billingCity, isValidationRunningForField } = this

      if (isValidationRunningForField('billingCity')) {
        return billingCity.length > 2
      }

      return true
    },

    isBillingStateValid() {
      const { billingState, isValidationRunningForField, statesAcronym } = this

      if (isValidationRunningForField('billingState')) {
        return statesAcronym.includes(billingState)
      }

      return true
    },

    isShippingSenderValid() {
      const { shippingSender, isValidationRunningForField } = this

      if (isValidationRunningForField('shippingSender')) {
        return /^(\w{2,})(\s+(\w{2,}))+$/.test(normalizeText(shippingSender))
      }

      return true
    },

    isShippingCEPValid() {
      const { shippingCEP, isValidationRunningForField } = this

      if (isValidationRunningForField('shippingCEP')) {
        return /^\d{5}\-\d{3}$/.test(shippingCEP)
      }

      return true
    },

    isShippingAddressValid() {
      const { shippingAddress, isValidationRunningForField } = this

      if (isValidationRunningForField('shippingAddress')) {
        return String(shippingAddress).length > 0
      }

      return true
    },

    isShippingNumberValid() {
      const { shippingNumber, isValidationRunningForField } = this

      if (isValidationRunningForField('shippingNumber')) {
        return String(shippingNumber).length > 0
      }

      return true
    },

    isShippingNeighborhoodValid() {
      const { shippingNeighborhood, isValidationRunningForField } = this

      if (isValidationRunningForField('shippingNeighborhood')) {
        return shippingNeighborhood.length > 3
      }

      return true
    },

    isShippingCityValid() {
      const { shippingCity, isValidationRunningForField } = this

      if (isValidationRunningForField('shippingCity')) {
        return shippingCity.length > 2
      }

      return true
    },

    isShippingStateValid() {
      const { shippingState, isValidationRunningForField, statesAcronym } = this

      if (isValidationRunningForField('shippingState')) {
        return statesAcronym.includes(shippingState)
      }

      return true
    },

    hasAppliedCoupon() {
      const { cupomData, invalidCoupon } = this

      return !invalidCoupon && Object.keys(cupomData ?? {}).length > 0
    },

    cupomHasUnsufficientDigits() {
      const { cupomCode } = this

      return cupomCode.length < 5
    },

    invalidCoupon() {
      const { cupomData } = this

      return cupomData.hasOwnProperty('error')
    },

    discount() {
      const {
        productsResponse,
        getShippingPrice,
        getProductsSubtotal
      } = this

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
            ? getProductsSubtotal - discountPercentage(getProductsSubtotal, -value)
            : discountReal(getProductsSubtotal, value)
        case 'isbn':
          const { price } = productsResponse.find(({ ISBN }) => ISBN === isbn)

          return is_percentage
            ? price - discountPercentage(price, -value)
            : discountReal(price, value)
        default:
          return 0
      }
    },

    BRLDiscount() {
      const { discount } = this

      return STRING_2_BRL_CURRENCY(discount)
    }
  }
});

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

function validaCNPJ(cnpj) {
  if (cnpj.length <= 12) {
    this.value = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})$/, '$1.$2.$3/$4');
  } else {
    this.value = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})$/, '$1.$2.$3/$4-$5');
  }
}

function numbersOnly(e) {
  e.target.value = e.target.value.replace(/\D+/g, '');
}

function isValidName(fullname) {
  const names = fullname.split(' ');

  return names.length > 1 && names.every(name => name.length > 1)
}

function isExpireDateValid(expireDate) {
  var tokens = expireDate.split('/');

  if (tokens.length < 2 || tokens.some(function (token) { return token.length < 2; })) return false;

  var month = tokens[0], shortYear = tokens[1];

  var currentDate = new Date();

  var yearFirst2Digits = currentDate.getFullYear().toString().substring(0, 2);

  var date = new Date("".concat(yearFirst2Digits).concat(shortYear + '-').concat(month + '-', "01").concat('T00:00:00'));

  return !isNaN(date) && date.getTime() > currentDate.getTime();
}

function discountPercentage(value, discount) {
  return value * (1 - discount / 100)
}

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