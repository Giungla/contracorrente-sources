
function URLParamExist (param) {
  const urlSearchParams = new URLSearchParams(location.search); return !!urlSearchParams.get(param);
}

function discountPercentage (value, discount) {
  return value * (1 - discount / 100)
}

function discountReal (value, discount) {
  return Math.min(value, discount) * -1
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

if (!URLParamExist('order-id')) {
  location.href = 'https://www.editoracontracorrente.com.br/';
}

const { ref, createApp } = Vue;

const orderConfirmationApp = createApp({
  setup() {
    const order = ref({});
    const coupon = ref({});
    const order_items = ref([]);
    const billingAddress = ref({});
    const shippingAddress = ref(null);

    return {
      order,
      coupon,
      order_items,
      billingAddress,
      shippingAddress
    }
  },

  data () {
    return {
      flag: 'BRL',
      cardNumber: '0000 0000 0000 0000',
      year: 23,
      month: 11,
      shippingDeadline: '6 anos'
    }
  },

  async mounted() {
    this.searchOrder()
  },

  methods: {
    async searchOrder () {
      const searchParams = new URLSearchParams(location.search);

      const orderId = searchParams.get('order-id');

      const response = await fetch(`https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/search_order_details?order_id=${orderId}`);

      if (!response.ok) {
        location.reload();

        return;
      }

      const {
        order,
        coupon,
        order_items,
        billing_address,
        shipping_address
      } = await response.json();

      this.order = order;
      this.coupon = coupon;
      this.order_items = order_items;
      this.billingAddress = billing_address;
      this.shippingAddress = shipping_address;
    },

    floatFix (value) {
      return parseFloat(value.toFixed(2))
    }
  },

  computed: {
    /**
     * @returns {boolean}
     */
    asSubscriber () {
      return (this.order?.subscription_discount ?? 0) > 0
    },

    /**
     * @returns {PriceTypesEnum}
     */
    priceType () {
      return this.asSubscriber
        ? 'full_price'
        : 'price'
    },

    email () {
      const { order } = this

      return order.hasOwnProperty('email') ? order.email : '-'
    },

    billing () {
      const { billingAddress } = this

      return {
        number: billingAddress?.number ?? '',
        fullName: billingAddress?.user_name ?? '',
        zipCode: billingAddress?.cep ?? '',
        address: billingAddress?.address ?? '',
        complement: billingAddress?.complement ?? '',
        neighborhood: billingAddress?.neighborhood ?? '',
        city: billingAddress?.city ?? '',
        state: billingAddress?.estate ?? ''
      }
    },

    shipping () {
      const { billingAddress, shippingAddress } = this

      const provider = shippingAddress === 'same'
        ? billingAddress
        : shippingAddress;

      return {
        number: provider?.number ?? '',
        fullName: provider?.user_name ?? '',
        zipCode: provider?.cep ?? '',
        address: provider?.address ?? '',
        complement: provider?.complement ?? '',
        neighborhood: provider?.neighborhood ?? '',
        city: provider?.city ?? '',
        state: provider?.estate ?? ''
      }
    },

    /**
     *
     * @returns {string}
     */
    paymentMethod () {
      const { order } = this

      const methodsName = {
        ticket: 'Não esqueça de efetuar o pagamento, a sua compra foi efetuada com boleto. Clique no botão abaixo para efetuar o pagamento.',
        creditcard: 'Sua compra foi efetuada com cartão de crédito'
      }

      return methodsName[order?.payment_method] ?? '-'
    },

    /**
     * @returns {boolean}
     */
    isTicket () {
      const { order } = this

      return order?.payment_method === 'ticket'
    },

    /**
     * @returns {false | string}
     */
    ticketURL () {
      const { order, isTicket } = this

      const { boletourl } = order

      return isTicket && boletourl
        ? `https://boleto.pagseguro.com.br/${boletourl}.pdf`
        : false
    },

    productList () {
      const { order_items } = this

      const priceKey = this.priceType

      if (order_items.length > 0) {
        return order_items.map(({ id, image, title, quantity, ...rest }) => ({
          id,
          image,
          title,
          quantity,
          price: STRING_2_BRL_CURRENCY(rest[priceKey]),
          htmlImage: `<img src="${image}" alt="${title}" loading="lazy" />`
        }))
      }

      return []
    },

    details () {},

    shippingMethod () {
      const { order } = this

      const deliveryMethod = {
        '03298': 'PAC',
        '03220': 'Sedex',
        '20133': 'Impresso'
      }

      return deliveryMethod[order.shipping_method] ?? '-'
    },

    getShippingPrice () {
      const { order, floatFix } = this

      return order.hasOwnProperty('shipping_total')
        ? naiveRound(order?.shipping_total, 2)
        : 0
    },

    shippingTotal () {
      const { getShippingPrice } = this

      return STRING_2_BRL_CURRENCY(getShippingPrice)
    },

    subTotal () {
      const { calcSubtotalFromProducts, order } = this

      if (order.hasOwnProperty('id')) {
        return STRING_2_BRL_CURRENCY(calcSubtotalFromProducts);
      }

      return 0;
    },

    total () {
      const { order } = this

      return STRING_2_BRL_CURRENCY(order.hasOwnProperty('total') ? order.total : 0)
    },

    calcSubtotalFromProducts () {
      const { order_items, priceType } = this

      return order_items.reduce((sum, product) => product.quantity * product?.[priceType] + sum, 0)
    },

    discountl () {
      const { getDiscountPrice } = this

      return STRING_2_BRL_CURRENCY(getDiscountPrice * -1)
    },

    hasDiscount () {
      const { coupon } = this

      return ![null, undefined].includes(coupon) && coupon?.hasOwnProperty('id')
    },

    /**
     * @returns {number}
     */
    getDiscountPrice () {
      const coupon_discount = this.order?.discount ?? 0
      const subscription_discount = this.order?.subscription_discount ?? 0

      return naiveRound(coupon_discount + subscription_discount, 2)
    }
  }
})

window.addEventListener('load', function () {
  orderConfirmationApp.mount('#order-confirmation-envelope')
}, false)
