
import {
  NULL_VALUE,
  GENERAL_HIDDEN_CLASS,
  isArray,
  stringify,
  querySelector,
  changeTextContent,
  addClass,
  toggleClass,
  attachEvent,
  hasClass,
  removeClass,
} from '../utils/dom'

import {
  BRLFormatter,
} from "../utils/mask"

import {
  XANO_BASE_URL,
  CART_SWITCH_CLASS,
  CEP_STORAGE_KEY,
} from '../utils/consts'

import {
  type FloatingCartState,
  type GroupFloatingCartState,
} from '../types/floating-cart'

import {
  postErrorResponse,
  postSuccessResponse,
  buildRequestOptions,
} from '../utils/requestResponse'

import {
  decimalRound
} from '../utils/math'

import {
  cartOperations,
  getCartHandlerPath,
  type ResponseItem,
  type CartOperations,
  type CartHandleResponse,
  type CartHandleOperations,
  type HandleCartOperationsPayload,
  type PriceGroup,
} from '../types/cart'

import {
  type ResponsePattern,
  type FunctionErrorPattern,
  type ResponsePatternCallback,
  type FunctionSucceededPattern,
} from '../types/global'

import {
  HttpMethod,
} from '../types/http'

import {
  SUBSCRIPTION_DISCOUNT,
} from '../types/subscription'

import {
  priceType,
  PriceTypes,
} from '../types/price'

import {
  type DeliveryOption,
} from '../types/single-product-page'

const cart = querySelector<'div'>('#carrinho-flutuante')

if (!cart) {
  throw new Error('Could not find floating cart')
}

const CART_BASE_URL = `${XANO_BASE_URL}/api:b9-USIEf`

// Indica a quantidade máxima de SKUs que podem ser adicionados por carrinho
const MAX_PRODUCT_QUANTITY = 10

const _state: FloatingCartState = {
  cart: NULL_VALUE,
  fetched: NULL_VALUE,
  isPending: false,
  isCartOpened: true,
  shippingPrice: NULL_VALUE,
}

const cartItemTemplate = querySelector('[data-wtf-floating-cart-item]')
const cartItemsWrapper = querySelector('[data-wtf-floating-cart-item-wrapper]')
const cartEmpty = querySelector('[data-wtf-floating-cart-empty-cart]')

// const promoValidElement = querySelector('[data-wtf-promo-valid]')
// const promoInValidElement = querySelector('[data-wtf-promo-invalid]')

const cartTotalElement = querySelector('[data-wtf-floating-cart-total]')

const state = new Proxy(_state, {
  get <K extends keyof GroupFloatingCartState> (
    target: FloatingCartState,
    key: K,
  ) {
    // switch (key) {
    //   case 'getOrderPrice':
    //     return BRLFormatter.format((target.cart?.order_price ?? 0) / 100)
    //   case 'getFullOrderPrice':
    //     return BRLFormatter.format((target.cart?.order_full_price ?? 0) / 100)
    //   default:
    // }
    return Reflect.get(target, key)
  },

  set <K extends keyof FloatingCartState> (
    target: FloatingCartState,
    key: K,
    value: FloatingCartState[K]
  ) {
    const isApplied = Reflect.set(target, key, value)

    switch (key) {
      case 'isCartOpened':
        refreshCartItems()

        break
      case 'cart':
        renderCart()

        handleShippingPrice()

        renderFinalPrices(target.cart as CartHandleResponse, target.cart?.is_subscriber ?? false)

        // handlePromoMessages()
        // localStorage.setItem(STORAGE_KEY_NAME, stringify(value as CartHandleResponse))

        break
      case 'shippingPrice':
        renderFinalPrices(target.cart as CartHandleResponse, target.cart?.is_subscriber ?? false)
    }

    return isApplied
  }
}) as GroupFloatingCartState

// function hasRootKeys (cart: object): cart is CartHandleResponse {
//   const rootKeys: (keyof CartHandleResponse)[] = [
//     'items',
//     'cart_items',
//     'order_price',
//     'order_full_price',
//   ]
//
//   return rootKeys.some(key => !hasOwn(cart, key))
// }

// function hasValidCart (cart: object): cart is CartHandleResponse {
//   if (!hasRootKeys(cart)) return false
//
//   const {
//     items,
//   } = cart
//
//   if (!isArray(items)) return false
//
//   if (objectSize(items) === 0) return true
//
//   const itemKeys: (keyof ResponseItem)[] = [
//     'name',
//     'slug',
//     'sku_id',
//     'quantity',
//     'price',
//     'full_price',
//     'image_url',
//   ]
//
//   return items.every(cartItem => {
//     return itemKeys.every(key => hasOwn(cartItem, key))
//   })
// }

async function refreshCartItems (): Promise<void> {
  if (!state.isCartOpened || state.isPending) return

  // const parsedCart = safeParseJson(localStorage.getItem(STORAGE_KEY_NAME))
  //
  // if (parsedCart && hasValidCart(parsedCart)) {
  //   state.fetched ??= true
  //   state.cart = parsedCart
  //
  //   return
  // } else {
  //   localStorage.removeItem(STORAGE_KEY_NAME)
  // }

  state.isPending = true

  const response = await getCartProducts()

  state.fetched ??= true
  state.isPending = false

  if (!response.succeeded) {
    // TODO: tratar e exibir o erro
    return
  }

  state.cart = response.data
}

async function getCartProducts <T extends CartHandleResponse> (): Promise<ResponsePattern<T>> {
  const defaultErrorMessage = 'Houve uma falha ao buscar o seu carrinho'

  const cartPath = getCartHandlerPath()

  try {
    const response = await fetch(`${CART_BASE_URL}/cart/get/${cartPath}`, {
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
}

async function updateCartProducts <T extends CartHandleResponse> (item: HandleCartOperationsPayload, operation: CartHandleOperations): Promise<ResponsePattern<T>> {
  const defaultErrorMessage = 'Houve uma falha ao buscar o seu carrinho'

  const cartPath = getCartHandlerPath()

  try {
    const response = await fetch(`${CART_BASE_URL}/cart/handle/${cartPath}`, {
      ...buildRequestOptions([], HttpMethod.POST),
      priority: 'high',
      keepalive: true,
      body: stringify({
        item,
        operation,
      }),
    })

    if (!response.ok) {
      const error = await response.json()

      return postErrorResponse.call<
        Response, [string, boolean?, ResponsePatternCallback?], FunctionErrorPattern
      >(response, error?.message ?? defaultErrorMessage)
    }

    const data: T = await response.json()

    return postSuccessResponse.call<
      Response, [T, ResponsePatternCallback?], FunctionSucceededPattern<T>
    >(response, data)
  } catch (e) {
    return postErrorResponse(defaultErrorMessage)
  }
}

async function handleProductChangeQuantity (
  operation: Exclude<CartHandleOperations, CartOperations["ADD"]>,
  payload: Omit<HandleCartOperationsPayload, 'quantity'>,
) {
  if (state.isPending) return

  state.isPending = true

  const response = await updateCartProducts({
    ...payload,
    quantity: 1,
  }, operation)

  state.isPending = false

  if (!response.succeeded) return

  state.cart = response.data
}

async function getCartShippingPrice <T extends DeliveryOption> (cep: string): Promise<ResponsePattern<T>> {
  const defaultErrorMessage = 'Houve uma falha durante a captura do preço de entrega'

  try {
    const response = await fetch(`${CART_BASE_URL}/cart/delivery-price?cep=${cep}`, {
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
}

async function handleShippingPrice (): Promise<void> {
  const shippingCEP = localStorage.getItem(CEP_STORAGE_KEY)

  const cepWrapper = querySelector<'div'>('[data-wtf-floating-cart-shipping-wrapper]')

  if (!shippingCEP) {
    addClass(
      cepWrapper,
      GENERAL_HIDDEN_CLASS,
    )

    return
  }

  const response = await getCartShippingPrice(shippingCEP)

  if (!response.succeeded) {
    addClass(
      cepWrapper,
      GENERAL_HIDDEN_CLASS,
    )

    return
  }

  state.shippingPrice = response.data.pcFinal

  removeClass(
    cepWrapper,
    GENERAL_HIDDEN_CLASS,
  )

  changeTextContent(
    querySelector('[data-wtf-floating-cart-shipping-price]'),
    BRLFormatter.format(decimalRound(state.shippingPrice / 100, 2)),
  )
}

function getLowerPriceTypeWhenHasActiveSubscription (items: Pick<ResponseItem, 'price' | 'full_price'>[]): PriceTypes {
  const finalPrices = items.reduce<PriceGroup>((acc, item) => {
    acc[priceType.PRICE]      += item[priceType.PRICE]
    acc[priceType.FULL_PRICE] += item[priceType.FULL_PRICE] * (1 - SUBSCRIPTION_DISCOUNT)

    return acc
  }, {
    [priceType.PRICE]: 0,
    [priceType.FULL_PRICE]: 0,
  })

  if (finalPrices[priceType.PRICE] === finalPrices[priceType.FULL_PRICE]) {
    return priceType.PRICE
  }

  if (finalPrices[priceType.FULL_PRICE] > finalPrices[priceType.PRICE]) {
    return priceType.PRICE
  }

  return priceType.FULL_PRICE
}

function renderProductPrices (prices: PriceGroup, template: HTMLElement, priceMechanism: false | PriceTypes = false): void {
  const originalPriceElement = querySelector<'div'>('[data-wtf-floating-cart-item-product-price-original]', template)
  const finalPriceElement = querySelector<'div'>('[data-wtf-floating-cart-item-product-price]', template)

  let price = 0
  let full_price = 0

  switch (priceMechanism) {
    case false: // Usuário não é assinante, mecanismo básico de preços será usado
    case priceType.PRICE: // Usuário é assinante, e o preço de venda dos itens é o menor possível
      [price, full_price] = [prices[priceType.PRICE], prices[priceType.FULL_PRICE]]
      break
    // Usuário é assinante, e o preço de capa com desconto percentual é a menor opção possível
    case priceType.FULL_PRICE:
      {
        const discountPercentual = Math.max(1 - SUBSCRIPTION_DISCOUNT, 0);

        [price, full_price] = [
          Math.round(prices[priceType.FULL_PRICE] * discountPercentual),
          prices[priceType.FULL_PRICE],
        ]
      }
  }

  const hasDifferentPrices = price !== full_price

  changeTextContent(
    finalPriceElement,
    BRLFormatter.format(decimalRound(price / 100, 2)),
  )

  if (!hasDifferentPrices) {
    return addClass(
      originalPriceElement,
      GENERAL_HIDDEN_CLASS,
    )
  }

  changeTextContent(
    originalPriceElement,
    BRLFormatter.format(decimalRound(full_price / 100, 2)),
  )
}

function renderFinalPrices (cart: CartHandleResponse, is_subscriber: boolean): false | PriceTypes {
  const _priceType = is_subscriber && getLowerPriceTypeWhenHasActiveSubscription(
    cart.items.map(({ price, full_price }) => ({
      price,
      full_price,
    }))
  )

  let orderPrice = 0

  switch (_priceType) {
    case false: // Usuário não é assinante
    case priceType.PRICE: // Usuário é assinante, preços de venda somados são a melhor oferta
      orderPrice = cart.order_price
      break
    case priceType.FULL_PRICE: // Usuário é assinante, preços de capa com aplicação de desconto são a melhor oferta
      orderPrice = Math.round(cart.order_full_price * (1 - SUBSCRIPTION_DISCOUNT))
  }

  orderPrice += state.shippingPrice ?? 0

  changeTextContent(cartTotalElement, BRLFormatter.format(decimalRound(orderPrice / 100, 2)))

  return _priceType
}

function renderCart (): void {
  const {
    cart: userCart,
  } = state

  if (!userCart) return

  const {
    items,
    cart_items,
    is_subscriber = false,
  } = userCart

  if (!isArray<ResponseItem>(items) || !cartItemTemplate || !cartItemsWrapper) return

  const hasNoItems = cart_items === 0

  toggleClass(cartTotalElement, GENERAL_HIDDEN_CLASS, hasNoItems)
  toggleClass(querySelector('[data-wtf-floating-cart-checkout-button]', cart), GENERAL_HIDDEN_CLASS, hasNoItems)
  toggleClass(querySelector('[data-wtf-floating-cart-total-block]'), GENERAL_HIDDEN_CLASS, hasNoItems)

  if (!toggleClass(cartEmpty, GENERAL_HIDDEN_CLASS, !hasNoItems)) {
    changeTextContent(querySelector('[data-wtf-floating-cart-items-indicator]'), cart_items)

    return cartItemsWrapper.replaceChildren()
  }

  const cartFragment = document.createDocumentFragment()

  const _priceType = renderFinalPrices(userCart, is_subscriber)

  for (const { slug, image_url, quantity, price, full_price, name, sku_id } of items) {
    const template = cartItemTemplate.cloneNode(true) as HTMLElement

    renderProductPrices(
      {
        price,
        full_price,
      },
      template,
      _priceType,
    )

    changeTextContent(querySelector('[data-wtf-floating-cart-item-product-name]', template), name)
    changeTextContent(querySelector('[data-wtf-floating-cart-item-quantity]', template), quantity)

    const productImage = querySelector('[data-wtf-floating-cart-item-image]', template)

    if (productImage) {
      productImage.style.backgroundImage = `url('${image_url}')`
    }

    const changeCartPayload: Omit<HandleCartOperationsPayload, 'quantity'> = {
      sku_id,
      reference_id: slug,
    }

    const productEventMap: [Exclude<CartHandleOperations, CartOperations["ADD"]>, string][] = [
      [cartOperations.DELETE, 'data-wtf-floating-cart-item-remove'],
      [cartOperations.INCREASE, 'data-wtf-floating-cart-item-plus-button'],
      [cartOperations.DECREASE, 'data-wtf-floating-cart-item-minus-button'],
    ]

    for (const [operation, elementTrigger] of productEventMap) {
      const triggerElement = querySelector(`[${elementTrigger}]`, template)

      if (operation === cartOperations.INCREASE && quantity >= MAX_PRODUCT_QUANTITY) {
        addClass(triggerElement, 'onedge')

        continue
      }

      attachEvent(triggerElement, 'click', (e: MouseEvent) => execCartAction.call(e, operation, changeCartPayload))
    }

    cartFragment.appendChild(template)
  }

  changeTextContent(querySelector('[data-wtf-floating-cart-items-indicator]'), cart_items)

  cartItemsWrapper?.replaceChildren(cartFragment)
}

// function handlePromoMessages () {
//   // const { hasFreeShipping } = state
//   const hasFreeShipping = false
//
//   toggleClass(promoValidElement, GENERAL_HIDDEN_CLASS, !hasFreeShipping)
//   toggleClass(promoInValidElement, GENERAL_HIDDEN_CLASS, !hasFreeShipping)
//
//   if (!hasFreeShipping) {
//     return changeTextContent(querySelector('[data-wtf-promo-invalidada-txt]', promoInValidElement), `Adicione mais ${BRLFormatter.format(state.missingForFreeShipping)} e ganhe frete grátis`)
//   }
//
//   return changeTextContent(querySelector('[data-wtf-promo-validada-txt-sem-imagem]', promoValidElement), `Você ganhou frete grátis`)
// }

async function execCartAction (
  this: MouseEvent,
  operation: Exclude<CartHandleOperations, CartOperations["ADD"]>,
  payload: Omit<HandleCartOperationsPayload, 'quantity'>,
) {
  this.preventDefault()
  this.stopPropagation()

  await handleProductChangeQuantity(operation, payload)
}

const cartObserver = new MutationObserver(mutations => {
  // Observer será aplicado em apenas um elemento
  const _cart = mutations[0].target as HTMLElement

  const hasClassInCart = hasClass(_cart, CART_SWITCH_CLASS)

  if (state.isCartOpened === hasClassInCart) return

  state.isCartOpened = hasClassInCart

  window.scrollTo({
    top: 0,
    behavior: 'instant',
  })

  document.body.style.overflow = hasClassInCart
    ? 'hidden'
    : 'unset'
})

cartObserver.observe(cart, {
  attributes: true,
  attributeFilter: [
    'class',
  ],
})

if (!cartItemsWrapper) {
  throw new Error('Product wrapper is missing')
}

document.querySelectorAll<HTMLElement>('[data-wtf-botao-carrinho-flutuante]').forEach(el => {
  attachEvent(el, 'click', () => toggleClass(cart, CART_SWITCH_CLASS), {
    passive: true,
  })
})

// window.addEventListener('storage', function (e) {
//   console.log({
//     key: e.key,
//     STORAGE_KEY_NAME,
//     value: safeParseJson<CartHandleResponse>(e.newValue),
//   })
//   if (e.key !== STORAGE_KEY_NAME) return
//
//   const parsedCart = safeParseJson<CartHandleResponse>(e.newValue)
//
//   if (!parsedCart || !hasValidCart(parsedCart)) return
//
//   state.cart = parsedCart
// })

refreshCartItems().then(() => {
  state.isCartOpened = false

  removeClass(cart, GENERAL_HIDDEN_CLASS)
})
