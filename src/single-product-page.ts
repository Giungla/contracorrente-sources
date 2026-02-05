
import {
  type ResponsePattern,
  type FunctionErrorPattern,
  type ResponsePatternCallback,
  type FunctionSucceededPattern,
} from '../types/global'

import {
  type User,
  type ProductState,
  type DeliveryOption,
  type DeliveryInfoParams,
  type ProductStateDynamic,
  type SingleProductResponse,
  type SKU,
} from '../types/single-product-page'

import {
  HttpMethod,
} from '../types/http'

import {
  EMPTY_STRING,
  SLASH_STRING,
  XANO_BASE_URL,
} from '../utils/consts'

import {
  getCookie,
} from '../utils/cookie'

import {
  BRLFormatter,
  maskCEP,
} from '../utils/mask'

import {
  NULL_VALUE,
  GENERAL_HIDDEN_CLASS,
  CEP_REGEX_VALIDATION,
  buildURL,
  stringify,
  regexTest,
  numberOnly,
  attachEvent,
  toggleClass,
  removeClass,
  querySelector,
  changeTextContent,
  isInputInstance,
  isNull,
  addClass,
  objectSize,
} from '../utils/dom'

import {
  AUTH_COOKIE_NAME,
  postErrorResponse,
  postSuccessResponse,
  buildRequestOptions,
} from '../utils/requestResponse'

import {
  clamp,
} from '../utils/math'

import {
  priceType,
} from '../types/price'

import {
  SUBSCRIPTION_DISCOUNT,
} from '../types/subscription'

const productSlug = location.pathname.split(SLASH_STRING).at(-1)

if (!productSlug) {
  throw new Error('Slug do produto não foi encontrado')
}

const skuSelectorTemplate = querySelector<'a'>('[data-sku-selector]')

if (!skuSelectorTemplate) {
  throw new Error('Impossível realizar a seleção de SKUs')
}

const STRIKETHROUGH_CLASS = 'strikethrough'

const skusContainer = skuSelectorTemplate.parentElement as HTMLDivElement

const skuPrice = querySelector<'div'>('[data-wtf-sku-price]')
const skuFullPrice = querySelector<'div'>('[data-wtf-sku-full-price]')

// Botão "Adicionar CEP" que permite ao usuário visualizar o campo onde vai inserir o CEP
const triggerAddCEP = querySelector<'div'>('[data-wtf-trigger-add-cep]')

// Seção que contém o input responsável pela busca de CEP
const calcShippingContainer = querySelector('#spp-calculo-do-cep')

// Campo responsável pela busca de CEP
const cepField = querySelector<'input'>('#spp-campo-de-cep')

// Elemento responsável pela exibição da mensagem de erro se a consulta de frete falhar
const errorMessageCEP = querySelector<'div'>('#spp-mensagem-de-erro-campo-de-cep')

// Seção onde o valor do frete será exibido
const cepPriceSection = querySelector<'div'>('#spp-custo-do-frete-bloco')

// Elemento onde o valor de frete será renderizado
const shippingCost = querySelector('#spp-custo-do-frete')

// Seção usada para exibir o label e preço para o assinante
const subscriberViewPrice = querySelector<'div'>('[data-wtf-subscriber-view-price]')

// Elemento usado para resetar o CEP usado na simulação de frete
const changeDeliveryCEP = querySelector<'div'>('#spp-custo-do-frete-mudar-cep')

attachEvent(querySelector('[data-wtf-quantity-minus]'), 'click', e => {
  changeQuantity(-1)
})

attachEvent(querySelector('[data-wtf-quantity-plus]'), 'click', e => {
  changeQuantity(1)
})

attachEvent(triggerAddCEP, 'click', e => {
  toggleClass(
    querySelector('[data-wtf-trigger-add-cep-container]'),
    GENERAL_HIDDEN_CLASS,
    true,
  )

  removeClass(calcShippingContainer, GENERAL_HIDDEN_CLASS)
})

attachEvent(cepField, 'input', async e => {
  if (!e.isTrusted) return

  const target = e.target

  if (!isInputInstance(target)) return

  const maskedValue = maskCEP(numberOnly(target.value))

  target.value = maskedValue

  state.shippingCEP = regexTest(CEP_REGEX_VALIDATION, maskedValue)
    ? numberOnly(maskedValue)
    : NULL_VALUE
})

const state = new Proxy<ProductState>({
  selectedSku: NULL_VALUE,
  shippingCEP: NULL_VALUE,
  quantity: 1,
  isSubscriber: false,
  skus: [],
  isDeliveryLoading: false,
  deliveryPrice: NULL_VALUE,
}, {
  get (target: ProductState, key: keyof (ProductState & ProductStateDynamic)) {
    switch (key) {
      case priceType.PRICE:
      case priceType.FULL_PRICE:
        {
          const selectedSku = getSelectedSKU()

          return !selectedSku
            ? 0
            : selectedSku[key] / 100
        }
      case 'singleItemPrice':
        {
          const selectedSku = getSelectedSKU()

          if (!selectedSku) return 0

          const {
            [priceType.PRICE]: price,
            [priceType.FULL_PRICE]: fullPrice,
          } = selectedSku

          const subscriptionFactor = clamp(0, 1, 1 - SUBSCRIPTION_DISCOUNT)

          if (target.isSubscriber) {
            return fullPriceIsOverPrice(fullPrice, price)
              ? price
              : fullPrice * subscriptionFactor
          }

          return price
        }
      case 'final_price':
        {
          const {
            quantity,
            deliveryPrice,
          } = target

          const shippingPrice = deliveryPrice ?? 0

          return (state.singleItemPrice * quantity + shippingPrice) / 100
        }
      case 'hasSamePrices':
        {
          const selectedSku = getSelectedSKU()

          return selectedSku
            ? selectedSku[priceType.PRICE] === selectedSku[priceType.FULL_PRICE]
            : false
        }
    }

    return Reflect.get(target, key)
  },

  set (target: ProductState, key: keyof ProductState & ProductStateDynamic, value: any): boolean {
    const hasApplied = Reflect.set(target, key, value)

    switch (key) {
      case 'selectedSku':
        renderSKUItems()
        renderSelectedSKUPrices()
        renderFinalPrice()
        break
      case 'quantity':
        {
          renderQuantity()
          renderFinalPrice()

          const {
            shippingCEP,
          } = target

          if (!isNull(shippingCEP) && objectSize(shippingCEP) === 8) {
            handleDeliveryInfo()
          }
        }
        break
      case 'shippingCEP':
        handleDeliveryInfo()
        break
      case 'isDeliveryLoading':
        // Exibir/ocultar loader do frete
        break
      case 'deliveryPrice':
        {
          removeClass(cepPriceSection, GENERAL_HIDDEN_CLASS)

          changeTextContent(
            shippingCost,
            BRLFormatter.format(value as number / 100),
          )

          attachEvent(changeDeliveryCEP, 'click', e => {
            if (!e.isTrusted) return

            renderFieldCEP()
          }, { once: true })

          renderFinalPrice()
        }
        break
      case 'isSubscriber':
        renderFinalPrice()
        break
    }

    return hasApplied
  },
}) as ProductState & ProductStateDynamic

async function getUser <T extends User> (): Promise<ResponsePattern<T>> {
  const defaultErrorMessage = 'Houve uma falha ao buscar os dados do usuário'

  try {
    const response = await fetch(`${XANO_BASE_URL}/api:_4BO6C7F/user`, {
      ...buildRequestOptions(),
    })

    if (!response.ok) {
      const error = await response.json()

      return postErrorResponse.call<
        Response, [string, boolean?, ResponsePatternCallback?], FunctionErrorPattern
      >(response, error?.message ?? defaultErrorMessage, true)
    }

    const data: T = await response.json()

    return postSuccessResponse.call<
      Response, [T, ResponsePatternCallback?], FunctionSucceededPattern<T>
    >(response, data)
  } catch (e) {
    return postErrorResponse(defaultErrorMessage)
  }
}

async function getProduct <T extends SingleProductResponse> (slug: string): Promise<ResponsePattern<T>> {
  const defaultErrorMessage = 'Houve uma falha ao buscar os dados do usuário'

  try {
    const response = await fetch(`${XANO_BASE_URL}/api:_4BO6C7F/product/${slug}`, {
      ...buildRequestOptions(),
    })

    if (!response.ok) {
      const error = await response.json()

      return postErrorResponse.call<
        Response, [string, boolean?, ResponsePatternCallback?], FunctionErrorPattern
      >(response, error?.message ?? defaultErrorMessage, true)
    }

    const data: T = await response.json()

    return postSuccessResponse.call<
      Response, [T, ResponsePatternCallback?], FunctionSucceededPattern<T>
    >(response, data)
  } catch (e) {
    return postErrorResponse(defaultErrorMessage)
  }
}

async function getDeliveryInfo <T extends DeliveryOption> (payload: DeliveryInfoParams): Promise<ResponsePattern<T>> {
  const defaultErrorMessage = 'Houve uma falha ao buscar os dados de entrega'

  state.isDeliveryLoading = true

  try {
    const response = await fetch(`${XANO_BASE_URL}/api:_4BO6C7F/delivery-price`, {
      ...buildRequestOptions([], HttpMethod.POST),
      body: stringify<DeliveryInfoParams>(payload),
    })

    if (!response.ok) {
      const error = await response.json()

      return postErrorResponse.call<
        Response, [string, boolean?, ResponsePatternCallback?], FunctionErrorPattern
      >(response, error?.message ?? defaultErrorMessage, true)
    }

    const data: T = await response.json()

    return postSuccessResponse.call<
      Response, [T, ResponsePatternCallback?], FunctionSucceededPattern<T>
    >(response, data)
  } catch (e) {
    return postErrorResponse(defaultErrorMessage)
  } finally {
    state.isDeliveryLoading = false
  }
}

/**
 * Indica se o preço de capa mesmo após aplicação do desconto de assinante é superior ao preço de venda
 * Nessa situação, usuários assinantes usarão o preço de venda como os usuários comuns
 */
function fullPriceIsOverPrice (fullPrice: number, price: number): boolean {
  const subscriptionFactor = clamp(0, 1, 1 - SUBSCRIPTION_DISCOUNT)

  return fullPrice * subscriptionFactor >= price
}

function changeQuantity (value: 1 | -1) {
  navigator.vibrate?.([200, 80, 200, 80, 300])
  if (state.isDeliveryLoading) {
    navigator.vibrate?.([200, 80, 200, 80, 300])

    return
  }

  const sku = getSelectedSKU()

  if (!sku) {
    throw new Error('SKU was not specified')
  }

  const newQuantity = clamp(1, 10, clamp(1, state.quantity + value, sku.inventory))

  if (newQuantity === state.quantity) return

  state.quantity = newQuantity
}

function handleIncomingUser (user: ResponsePattern<User>): void {
  if (!user.succeeded) return

  state.isSubscriber = user.data.subscriber
}

function handleIncomingProduct (product: ResponsePattern<SingleProductResponse>): void {
  if (!product.succeeded) {
    location.href = buildURL('/', {
      reason: 'product_not_founded',
    })

    return
  }

  state.skus        = product.data.skus
  state.selectedSku = product.data.skus.at(0)?.sku_id ?? NULL_VALUE
}

function renderSKUItems () {
  const fragment = document.createDocumentFragment()

  for (const sku of state.skus) {
    // @ts-ignore
    const skuAnchor = skuSelectorTemplate.cloneNode(true) as HTMLAnchorElement

    const isSelected = sku.sku_id === state.selectedSku

    changeTextContent(skuAnchor, sku.variation_type)

    toggleClass(skuAnchor, 'selecionado', isSelected)

    attachEvent(skuAnchor, 'click', e => {
      e.preventDefault()
      e.stopPropagation()

      if (isSelected) return

      state.selectedSku = sku.sku_id
      if (state.quantity !== 1) state.quantity = 1
    })

    fragment.appendChild(skuAnchor)
  }

  skusContainer.replaceChildren(fragment)
}

function renderSelectedSKUPrices () {
  const {
    price,
    full_price,
    isSubscriber,
    hasSamePrices,
    singleItemPrice,
  } = state

  changeTextContent(skuPrice, BRLFormatter.format(price))
  changeTextContent(skuFullPrice, BRLFormatter.format(hasSamePrices ? 0 : full_price))

  const fullPriceIsOverPriceValue = fullPriceIsOverPrice(full_price, price)

  // Exibe ou oculta a view "Preço de capa"
  const isFullPriceHided = toggleClass(
    querySelector('[data-wtf-full-price-view]'),
    GENERAL_HIDDEN_CLASS,
    isSubscriber && hasSamePrices,
  )

  // Aplica uma linha no preço com desconto, quando o usuário for assinante
  // E o preço de capa com desconto é maior que o preço de venda
  toggleClass(
    skuPrice,
    STRIKETHROUGH_CLASS,
    isSubscriber && fullPriceIsOverPriceValue,
  )

  // Exibe ou oculta a view "Preço do produto" quando for assinante e o preço de capa
  // Com o desconto aplicado não superar o preço de venda
  toggleClass(
    querySelector('[data-wtf-price-view]'),
    GENERAL_HIDDEN_CLASS,
    isSubscriber && (!hasSamePrices || fullPriceIsOverPriceValue),
  )

  // Marca o preço com desconto como obsoleto
  // Quando for assinante e a seção "Preço de capa" estiver oculta
  toggleClass(
    skuPrice,
    STRIKETHROUGH_CLASS,
    isSubscriber && isFullPriceHided,
  )

  // Exibe ou oculta a view "Preço para assinante"
  toggleClass(
    querySelector('[data-wtf-subscriber-view-price]'),
    GENERAL_HIDDEN_CLASS,
    !isSubscriber,
  )

  // Imprime o preço do produto para o assinante
  changeTextContent(
    querySelector('[data-wtf-sku-subscriber-price]'),
    BRLFormatter.format(singleItemPrice / 100),
  )
}

function renderQuantity () {
  changeTextContent(
    querySelector<'div'>('[data-wtf-quantity-value]'),
    state.quantity,
  )
}

function renderFinalPrice (): void {
  changeTextContent(
    querySelector('[data-wtf-sku-final-price]'),
    BRLFormatter.format(state.final_price),
  )
}

function renderFieldCEP () {
  if (cepField) {
    cepField.value    = EMPTY_STRING
  }

  state.shippingCEP = NULL_VALUE

  addClass(errorMessageCEP, GENERAL_HIDDEN_CLASS)
  removeClass(calcShippingContainer, GENERAL_HIDDEN_CLASS)

  addClass(cepPriceSection, GENERAL_HIDDEN_CLASS)

  changeTextContent(
    shippingCost,
    BRLFormatter.format(0),
  )
}

function getSelectedSKU (): SKU | undefined {
  const {
    skus,
    selectedSku,
  } = state

  return skus.find(sku => selectedSku === sku.sku_id)
}

async function handleDeliveryInfo () {
  if (state.isDeliveryLoading) return

  const {
    quantity,
    shippingCEP,
  } = state

  if (isNull(shippingCEP) || !productSlug) {
    throw new Error('Invalid parameters provided to `getDeliveryInfo` function')
  }

  const deliveryInfo = await getDeliveryInfo({
    quantity,
    cep: shippingCEP,
    product_slug: productSlug,
  })

  addClass(calcShippingContainer, GENERAL_HIDDEN_CLASS)

  if (!deliveryInfo.succeeded) {
    changeTextContent(
      errorMessageCEP,
      deliveryInfo.message,
    )

    removeClass(errorMessageCEP, GENERAL_HIDDEN_CLASS)

    return
  }

  state.deliveryPrice = deliveryInfo.data.pcFinal
}

const requestList = [
  getProduct(productSlug).then(handleIncomingProduct),
]

if (getCookie(AUTH_COOKIE_NAME)) {
  requestList.push(getUser().then(handleIncomingUser))
}

Promise.allSettled(requestList)

window.addEventListener('pageshow', (e: PageTransitionEvent) => {
  if (e.persisted) location.reload()
})
