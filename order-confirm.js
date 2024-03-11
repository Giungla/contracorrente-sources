
function URLParamExist (param) {
  const urlSearchParams = new URLSearchParams(location.search); return !!urlSearchParams.get(param);
}

function discountPercentage (value, discount) {
  return value * (1 - discount / 100)
}

function discountReal (value, discount) {
  return Math.min(value, discount) * -1
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
     *
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

      if (order_items.length > 0) {
        return order_items.map(({ id, image, price, title, quantity }) => ({
          id,
          image,
          title,
          quantity,
          price: STRING_2_BRL_CURRENCY(price),
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
        ? floatFix(order?.shipping_total)
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
      const { order_items } = this

      return order_items.reduce((sum, { quantity, price }) => quantity * price + sum, 0)
    },

    discountl () {
      const { getDiscountPrice } = this

      return STRING_2_BRL_CURRENCY(getDiscountPrice)
    },

    hasDiscount () {
      const { coupon } = this

      return ![null, undefined].includes(coupon) && coupon?.hasOwnProperty('id')
    },

    getDiscountPrice () {
      const { coupon, hasDiscount, getShippingPrice, calcSubtotalFromProducts, order_items } = this

      if (!hasDiscount) return 0

      const isPercentageDiscount = coupon.is_percentage

      switch (coupon.cupom_type) {
        case 'shipping':
          return isPercentageDiscount
            ? getShippingPrice - discountPercentage(getShippingPrice, -coupon.value)
            : discountReal(getShippingPrice, coupon.value)
        case 'subtotal':
          return isPercentageDiscount
            ? calcSubtotalFromProducts - discountPercentage(calcSubtotalFromProducts, -coupon.value)
            : discountReal(calcSubtotalFromProducts, coupon.value)
        case 'isbn':
          const getProductFromISBN = order_items.find(({ ISBN }) => ISBN === coupon.isbn)

          return isPercentageDiscount
            ? getProductFromISBN?.price - discountPercentage(getProductFromISBN?.price, -coupon.value)
            : discountReal(getProductFromISBN?.price, coupon.value)
      }
    }
  }
})

window.addEventListener('load', function () {
  orderConfirmationApp.mount('#order-confirmation-envelope')
}, false)
