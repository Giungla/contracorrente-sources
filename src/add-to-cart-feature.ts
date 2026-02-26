import {
  NULL_VALUE,
  stringify,
  attachEvent,
  getAttribute, changeTextContent, querySelector, addClass, toggleClass,
} from '../utils/dom'

import {
  postErrorResponse,
  postSuccessResponse,
  buildRequestOptions,
} from '../utils/requestResponse'

import {
  XANO_BASE_URL,
} from '../utils/consts'

import {
  type ResponsePattern,
  type FunctionErrorPattern,
  type FunctionSucceededPattern,
} from '../types/global'

import {
  CartHandleResponse,
} from '../types/cart'

import {
  HttpMethod,
} from '../types/http'

const triggers = document.querySelectorAll('[data-wtf-buy-bag]')

if (!triggers.length) {
  throw new Error('No bags found.')
}

function isAnchor (element: Element): element is HTMLAnchorElement {
  return element instanceof HTMLAnchorElement
}

const loadingClass = 'carregando'

for (const trigger of Array.from(triggers)) {
  if (!isAnchor(trigger)) continue

  const slug = getAttribute(trigger, 'href')?.split('/')?.at(-1) ?? NULL_VALUE

  if (!slug) continue

  attachEvent(trigger, 'click', async e => {
    e.preventDefault()
    e.stopPropagation()

    toggleClass(trigger, loadingClass, true)

    const response = await addProductToCart(slug)

    toggleClass(trigger, loadingClass, false)

    if (!response.succeeded) return

    changeTextContent(
      querySelector('[data-wtf-floating-cart-items-indicator]'),
      response.data.cart_items ?? 0,
    )
  })
}

async function addProductToCart <T extends CartHandleResponse> (referenceId: string): Promise<ResponsePattern<T>> {
  const defaultErrorMessage = 'Não foi possível adicionar o produto no seu carrinho'
  console.log('request')

  try {
    const response = await fetch(`${XANO_BASE_URL}/api:e-3cElvY/add/variation`, {
      ...buildRequestOptions([], HttpMethod.POST),
      keepalive: true,
      priority: 'high',
      body: stringify({
        reference_id: referenceId,
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
      Response, [T], FunctionSucceededPattern<T>
    >(response, data)
  } catch (e) {
    return postErrorResponse(defaultErrorMessage)
  }
}
