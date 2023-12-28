

const {
  ref,
  createApp,
  watchEffect
} = Vue;

const contraCorrenteVueApp = createApp({
  setup () {
    const sProduct = ref([])

    const customerEmailModel     = ref('')
    const customerPhoneModel     = ref('')
    const customerCPFCNPJModel   = ref('')
    const customerBirthdataModel = ref('')

    const creditCardNumber = ref('')
    const creditCardName = ref('')
    const creditCardCode = ref('')
    const creditCardDate = ref('')

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

    return {
      sProduct,

      customerEmailModel,
      customerPhoneModel,
      customerCPFCNPJModel,
      customerBirthdataModel,

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
    }
  },

  data () {
    return {
      isLoading: false,
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

      xanoProductsAPI: 'https://xef5-44zo-gegm.b2.xano.io/api:RJyl42La/query_products'
    }
  },

  async mounted () {
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
  },

  watch: {
    async shippingCEP (cep, oldCEP) {
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

    async billingCEP (cep, oldCEP) {
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

    creditCardDate (date, oldDate) {
      const cleanDate = date.replace(/\D+/g, '');

      if (cleanDate.length < 3 || date === oldDate) return;

      this.creditCardDate = date.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    }
  },

  methods: {
    runValidations (fieldname) {
      if (this.validationFeedback.includes(fieldname)) return

      this.validationFeedback.push(fieldname)
    },

    handleblur () {
      this.queryCardBrand(this.creditCardNumber)
    },

    handleSelectInstallment (quantity) {
      this.selectedInstallmentOption = quantity
    },

    getInstallments (creditCardBrandName) {
      const { getProductsSubtotal, getShippingPrice } = this

      PagSeguroDirectPayment.getInstallments({
        amount: getProductsSubtotal + getShippingPrice,
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

    getProductsElements () {
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

    getSlugFromProductElement (productNode) {
      const anchorElement = productNode.element.querySelector('[data-slug="true"]')

      return anchorElement.href.split('/').at(-1)
    },

    async queryProducts () {
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

    async queryShippingPrice () {
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

    async querySessionID () {
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

    querySenderHash () {
      const senderHashValue = PagSeguroDirectPayment.getSenderHash();

      if (senderHashValue == null || senderHashValue == '') {
        setTimeout(function () {
          this.querySenderHash();
        }, 2000);
      } else {
        this.senderHash = senderHashValue;
      }
    },

    async handleProcessPayment (e) {
      e.preventDefault()

      if (this.isLoading === true) return;

      if (!this.validationRules) {
        alert('Alguns campos não foram preenchidos corretamente');

        return;
      }

      this.isLoading = true

      if (this.selectedPayment === 'creditcard') {
        await this.postCreditCardPayment()
      } else {
        await this.postPayment()
      }

      this.isLoading = false
    },

    async postPayment () {
      const {
        sProduct,
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
        getShippingPrice
      } = this

      const paymentResponse = await fetch('https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/api_payment_process_boleto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer_name: customerShippingSender.value,
          customer_email: customerMail.value,
          customer_cpf_cnpj: customerCPFCNPJ.value,
          customer_phone: customerPhone.value,
          customer_birthdate: customerBirthdate.value,
          shipping_zip_code: customerShippingCEP.value,
          shipping_address: customerShippingAddress.value,
          shipping_number: customerShippingNumber.value,
          shipping_complement: customerShippingComplement.value,
          shipping_neighborhood: customerShippingNeighborhood.value,
          shipping_city: customerShippingCity.value,
          shipping_state: customerShippingState.value,

          billing_zip_code: customerShippingCEP.value,
          billing_address: customerShippingAddress.value,
          billing_number: customerShippingNumber.value,
          billing_complement: customerShippingComplement.value,
          billing_neighborhood: customerShippingNeighborhood.value,
          billing_city: customerShippingCity.value,
          billing_state: customerShippingState.value,

          amount: +(getProductsSubtotal + getShippingPrice).toFixed(2),
          sender_hash: senderHash,

          products: sProduct.map(({ quantity, slug }) => ({
            quantity, slug
          })),

          shippingMethod: selectedShipping,
          shippingPrice: parseFloat(getShippingPrice.toFixed(2))
        })
      })

      if (!paymentResponse.ok) {
        this.errorMessageOrderValidation = paymentResponse?.message ?? 'Por favor, tente novamente! Não foi possível realizar o pagamento. Se o problema persistir, entre em contato via WhatsApp para obter ajuda.';

        return;
      }

      const paymentData = await paymentResponse.json()

      window.open(paymentData.boletourl, '_blank');

      setTimeout(() => {
        location.href = 'https://contracorrente-ecomm.webflow.io/order-confirmation?order-id=' + paymentData.transactionid;
      }, 1000);
    },

    async postCreditCardPayment () {
      const {
        sProduct,

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
      } = this

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
          amount: installments.installments[brandName].at(0).totalAmount,
          sender_hash: senderHash,

          products: sProduct.map(({ quantity, slug }) => ({
            quantity, slug
          })),

          shippingMethod: selectedShipping,
          shippingPrice: parseFloat(getShippingPrice.toFixed(2))
        })
      })

      if (!paymentResponse.ok) {
        this.errorMessageOrderValidation = paymentResponse?.message ?? 'Por favor, tente novamente! Não foi possível realizar o pagamento. Se o problema persistir, entre em contato via WhatsApp para obter ajuda.';

        return;
      }

      const paymentData = await paymentResponse.json()

      setTimeout(() => {
        location.href = 'https://contracorrente-ecomm.webflow.io/order-confirmation?order-id=' + paymentData?.transactionid;
      }, 1000);
    },

    async searchAddress () {},

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

    queryCardBrand (creditCardNumber) {
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
          console.log(response)
        }
      });
    },

    queryCreditCardNumber ({ creditCardNumber, creditCardCode, creditCardDate }) {
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

    createSessionID ({ key, value }) {
      sessionStorage.setItem(key, value)
    },

    async handleShippingType (shippingCode, evt) {
      if (this.selectedShipping === shippingCode) return

      this.selectedShipping = shippingCode

      evt.currentTarget.classList.toggle('selecionado', shippingCode)

      await this.queryShippingPrice()

      this.queryCardBrand(this.creditCardNumber)
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
  },

  computed: {
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

    displayFinalShippingPrice () {
      const { hasShippingDetails, selectedShipping } = this

      return hasShippingDetails && selectedShipping.length > 0
    },

    hasShippingDetails () {
      const { shippingDetails } = this

      return Object.keys(shippingDetails ?? {}).length > 0
    },

    getProductsSlugs () {
      const { sProduct, getSlugFromProductElement } = this

      return sProduct.length > 0
        ? sProduct.map(getSlugFromProductElement)
        : []
    },

    getProductsSubtotal () {
      const { productsResponse, sProduct } = this

      return productsResponse.reduce((price, product) => {
        const quantity = sProduct?.find(prod => prod.slug === product?.slug)?.quantity ?? 1

        return price + (product?.price ?? 0) * quantity
      }, 0)
    },

    getShippingPrice () {
      const { hasShippingDetails, selectedShipping, shippingDetails } = this

      if (!hasShippingDetails) return 0

      const selectedShippingPrice = shippingDetails?.price?.find(({ coProduto }) => coProduto === selectedShipping)

      if (!selectedShippingPrice || selectedShippingPrice.hasOwnProperty('txErro')) return 0

      return parseFloat((selectedShippingPrice?.pcFinal).replace(/\,+/g, '.')) * this.shippingTax
    },

    shippingPrice () {
      const { getShippingPrice } = this

      return STRING_2_BRL_CURRENCY(getShippingPrice)
    },

    subtotal () {
      const { getProductsSubtotal } = this

      return STRING_2_BRL_CURRENCY(getProductsSubtotal)
    },

    totalOrder () {
      const { getProductsSubtotal, getShippingPrice } = this

      return STRING_2_BRL_CURRENCY(getProductsSubtotal + getShippingPrice)
    },

    deliveryOptions () {
      const { shippingDetails, hasShippingDetails, productsCorreios, pluralize } = this

      if (!hasShippingDetails) {
        return Object
          .entries(productsCorreios)
          .reduce((fakeOptions, [ key, value ]) => {
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

    hasDeliveryData () {
      const { selectedPayment, deliveryPlace } = this

      return selectedPayment === null || ['ticket', 'pix'].includes(selectedPayment) || (selectedPayment === 'creditcard' && deliveryPlace === 'diff')
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
      } = this

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
        return shippingAddressValid && isShippingValid
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
          ? billingAddressValid && isShippingValid && isPaymentCardValid && deliveryPlace !== null
          : shippingAddressValid && billingAddressValid && isShippingValid && isPaymentCardValid && deliveryPlace !== null
      }

      return false
    },

    isValidationRunningForField () {
      const { validationFeedback } = this

      return (fieldname) => validationFeedback.includes(fieldname)
    },

    isEmailValid () {
      const { customerEmailModel, isValidationRunningForField } = this

      return isValidationRunningForField('customerEmail') && customerEmailModel.includes('@') && customerEmailModel.includes('.')
    },

    isPhoneNumberValid () {
      const { customerPhoneModel, isValidationRunningForField } = this

      return isValidationRunningForField('customerPhone') && /\(\d{2}\)\s\d{4,5}\-\d{4}/.test(customerPhoneModel)
    }
  }
});

function validateCard (e) {
  const cleanNumber = e.target.value.replace(/\D+/g, '');

  const groups = Math.ceil(cleanNumber.length / 4);

  e.target.value = Array
    .from({ length: groups })
    .map((_, index) => cleanNumber.substr(index * 4, 4))
    .join(' ');
}

function validaCPF (cpf) {
  if (cpf.length <= 6) {
    this.value = cpf.replace(/(\d{3})(\d{1,3})/, '$1.$2')
  } else if (cpf.length <= 9) {
    this.value = cpf.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
  } else {
    this.value = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4')
  }
}

function validaCNPJ (cnpj) {
  if (cnpj.length <= 12) {
    this.value = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4');
  } else {
    this.value = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
  }
}

function numbersOnly (e) {
  e.target.value = e.target.value.replace(/\D+/g, '');
}

window.addEventListener('load', function () {
  contraCorrenteVueApp.directive('card', {
    mounted (el) {
      el.addEventListener('input', validateCard, false);
      el.addEventListener('blur', validateCard, false);
    },

    beforeUnmount (el) {
      el.removeEventListener('input', validateCard, false);
      el.removeEventListener('blur', validateCard, false);
    }
  });

  contraCorrenteVueApp.directive('date', {
    twoWay: true,

    mounted (el) {
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

    mounted (el) {
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

    mounted (el) {
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

    numberOnly: {
			mounted (el) {
				el.addEventListener('input', numbersOnly);
			},

			beforeUnmount (el) {
				el.removeEventListener('input', numbersOnly);
			}
		}
  });

  contraCorrenteVueApp.mount('#checkout-form-envelope');
}, false);

