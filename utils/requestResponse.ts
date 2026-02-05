
import {
  type FunctionErrorPattern,
  type FunctionSucceededPattern,
  type ResponsePatternCallback,
} from '../types/global'

import {
  buildURL,
} from './dom'

import {
  getCookie,
  setCookie,
} from './cookie'

import {
  timestampDays,
} from './dates'

import {
  CookieSameSite,
} from '../types/cookie'

import {
  HttpMethod,
  type HttpMethods,
} from '../types/http'

export const UNAUTHENTICATED_RESPONSE_STATUS = 401

export const AUTH_COOKIE_NAME = '__Host-cc-AuthToken'
export const CC_SESSION_COOKIE_NAME = '__Host-Cc-Session-Cookie'
export const CC_SESSION_HEADER_NAME = 'X-Cc-Session'

function handleResponseStatus (response?: Response): void {
  if (!response || response.status !== UNAUTHENTICATED_RESPONSE_STATUS) return

  location.href = buildURL('/log-in', {
    redirect_to: encodeURIComponent(location.pathname + location.search),
  })
}

export function handleSession (response?: Response): void {
  const session = response?.headers.get(CC_SESSION_HEADER_NAME)

  if (!session) return

  setCookie(CC_SESSION_COOKIE_NAME, session, {
    path: '/',
    secure: true,
    sameSite: CookieSameSite.STRICT,
    expires: new Date(Date.now() + timestampDays(14)),
  })
}

export function postErrorResponse (
  message: string,
  skipRedirectIfUnauthenticated?: boolean,
  callback?: ResponsePatternCallback,
): FunctionErrorPattern;
export function postErrorResponse (
  this: Response,
  message: string,
  skipRedirectIfUnauthenticated?: boolean,
  callback?: ResponsePatternCallback,
): FunctionErrorPattern;
export function postErrorResponse (
  this: Response | undefined,
  message: string,
  skipRedirectIfUnauthenticated: boolean = false,
  callback?: ResponsePatternCallback,
): FunctionErrorPattern {
  handleSession(this)

  if (!skipRedirectIfUnauthenticated) {
    handleResponseStatus(this)
  }

  callback?.()

  return {
    message,
    succeeded: false,
  }
}

export function postSuccessResponse <T extends unknown> (
  response: T,
  callback?: ResponsePatternCallback,
): FunctionSucceededPattern<T>;
export function postSuccessResponse <T extends unknown> (
  this: Response,
  response: T,
  callback?: ResponsePatternCallback,
): FunctionSucceededPattern<T>;
export function postSuccessResponse <T extends unknown> (
  this: Response | undefined,
  response: T,
  callback?: ResponsePatternCallback,
): FunctionSucceededPattern<T> {
  handleSession(this)

  callback?.()

  return {
    data: response,
    succeeded: true,
  }
}

export function buildRequestOptions (headers: [string, string][] = [], method: HttpMethods = HttpMethod.GET): Pick<RequestInit, 'method' | 'headers'> {
  const applicationJson = 'application/json'

  const _headers = new Headers({
    'Accept': applicationJson,
    'Content-Type': applicationJson,
  })

  for (const [header, value] of headers) {
    _headers.set(header, value)
  }

  const cookieSession = getCookie(CC_SESSION_COOKIE_NAME)

  if (cookieSession) {
    _headers.set(CC_SESSION_HEADER_NAME, cookieSession)
  }

  const authCookie = getCookie(AUTH_COOKIE_NAME)

  if (authCookie) {
    _headers.set('Authorization', authCookie)
  }

  return {
    method,
    headers: _headers,
  }
}
