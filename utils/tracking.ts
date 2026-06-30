
import {
  type ResponsePattern,
  type FunctionErrorPattern,
  type ResponsePatternCallback,
  type FunctionSucceededPattern,
} from '../types/global'

import {
  type InitiateCheckoutResponse,
  type PageViewResponse,
  type ViewContentParams,
  type ViewContentResponse,
} from '../types/tracking-events'

import {
  type ICookieOptions,
} from '../types/cookie'

import {
  PIPE_STRING,
  EMPTY_STRING,
  XANO_BASE_URL,
} from './consts'

import {
  postErrorResponse,
  buildRequestOptions,
  postSuccessResponse,
} from './requestResponse'

import {
  setCookie,
  getCookie,
} from './cookie'

import {
  timestampDays,
} from  './dates'

import {
  getCartHandlerPath,
} from '../types/cart'

import {
  splitText,
  stringify,
} from './dom'

import {
  HttpMethod,
} from '../types/http'

export const TRACKING_BASE_URL = `${XANO_BASE_URL}/api:BU42cXGm`

export const metaCookiesName = '_fbc|_fbp'

const keepalive = true
const priority: RequestPriority = 'high'

const parentScriptReference = document.currentScript

export function getMetaTrackingCookies (): [string, string][] {
  return splitText(metaCookiesName, PIPE_STRING).reduce((acc, name) => {
    const cookie = getCookie(name)

    if (!cookie) return acc

    return [
      ...acc,
      [
        name.replace('_', EMPTY_STRING),
        cookie,
      ],
    ]
  }, [] as [string, string][])
}

export function prefixStorageKey (key: string): string {
  return `editora_cc_${key}`
}

function generateFbpRandomPart (): string {
  if ('crypto' in window && crypto.getRandomValues) {
    const array = new Uint32Array(1)

    return crypto.getRandomValues(array)[0].toString()
  }

  return Math.floor(Math.random() * 4294967295).toString()
}

export function loadFacebookEvents () {
  const handleMetaCookies = (loaded: boolean) => {
    if (loaded) return

    const fbpName = '_fbp'
    const fbcName = '_fbc'

    setTimeout(() => {
      const now = Date.now()

      const currentFbp = getCookie(fbpName)

      const cookieOptions = {
        maxAge: 7776E3,
        expires: new Date(Date.now() + timestampDays(90)),
        domain: location.hostname.replace('www.', EMPTY_STRING),
      } satisfies ICookieOptions

      // Aqui o fbp será reescrito com nova validade usando o valor existente ou um novo valor seguindo os padrões da Meta
      setCookie(fbpName, currentFbp || `fb.2.${now}.${generateFbpRandomPart()}`, cookieOptions)

      const searchParams = new URLSearchParams(location.search)

      const fbclid = searchParams.get('fbclid')

      if (fbclid && fbclid.length) {
        setCookie(fbcName, `fb.2.${now}.${fbclid}`, cookieOptions)

        return
      }

      const currentFbc = getCookie(fbcName)

      if (currentFbc) {
        setCookie(fbcName, currentFbc, cookieOptions)
      }
    }, 2000)
  }

  const script = document.createElement('script')

  script.defer = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'

  script.onload  = () => handleMetaCookies(true)
  script.onerror = () => handleMetaCookies(false)

  if (parentScriptReference instanceof HTMLScriptElement) {
    parentScriptReference.insertAdjacentElement('afterend', script)

    return
  }

  document.head.appendChild(script)
}

export async function pageViewTracking <T extends PageViewResponse> (): Promise<ResponsePattern<T>> {
  const defaultErrorMessage = 'Não foi possível registrar o evento'

  try {
    const response = await fetch(`${TRACKING_BASE_URL}/event/page_view/${getCartHandlerPath()}`, {
      ...buildRequestOptions([
        ...getMetaTrackingCookies(),
      ]),
      priority,
      keepalive,
    })

    if (!response.ok) {
      const error = await response.json()

      return postErrorResponse.call<
        Response, [string], FunctionErrorPattern
      >(response, error)
    }

    const data: T = await response.json()

    return postSuccessResponse.call<
      Response, [T, ResponsePatternCallback?], FunctionSucceededPattern<T>
    >(response, data)
  } catch (e) {
    return postErrorResponse(defaultErrorMessage)
  }
}

export async function viewContentTracking <T extends ViewContentResponse> ({ type, payload }: ViewContentParams): Promise<ResponsePattern<T>> {
  const defaultErrorMessage = 'Não foi possível registrar o evento'

  try {
    const response = await fetch(`${TRACKING_BASE_URL}/event/view_content/${type}/${getCartHandlerPath()}`, {
      ...buildRequestOptions([
        ...getMetaTrackingCookies(),
      ], HttpMethod.POST),
      priority,
      keepalive,
      body: stringify({
        product: payload,
      }),
    })

    if (!response.ok) {
      const error = await response.json()

      return postErrorResponse.call<
        Response, [string], FunctionErrorPattern
      >(response, error)
    }

    const data: T = await response.json()

    return postSuccessResponse.call<
      Response, [T, ResponsePatternCallback?], FunctionSucceededPattern<T>
    >(response, data)
  } catch (e) {
    return postErrorResponse(defaultErrorMessage)
  }
}

export async function initiateCheckoutTracking <T extends InitiateCheckoutResponse> (): Promise<ResponsePattern<T>> {
  const defaultErrorMessage = 'Não foi possível registrar o evento'

  try {
    const response = await fetch(`${TRACKING_BASE_URL}/event/initiate_checkout/${getCartHandlerPath()}`, {
      ...buildRequestOptions([
        ...getMetaTrackingCookies(),
      ]),
      priority,
      keepalive,
    })

    if (!response.ok) {
      const error = await response.json()

      return postErrorResponse.call<
        Response, [string], FunctionErrorPattern
      >(response, error)
    }

    const data: T = await response.json()

    return postSuccessResponse.call<
      Response, [T, ResponsePatternCallback?], FunctionSucceededPattern<T>
    >(response, data)
  } catch (e) {
    return postErrorResponse(defaultErrorMessage)
  }
}
