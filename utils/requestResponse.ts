
import type {
  HttpMethod,
  FunctionErrorPattern,
  FunctionSucceededPattern,
} from '../types/global'

import {
  buildURL,
  getCookie,
  setCookie,
  timestampDays
} from "./index"

export const UNAUTHENTICATED_RESPONSE_STATUS = 401

export const AUTH_COOKIE_NAME = '__Host-cc-AuthToken'
export const CC_SESSION_COOKIE_NAME = '__Host-Cc-Session-Cookie'
export const CC_SESSION_HEADER_NAME = 'X-Cc-Session'

export const GET = 'GET'
export const HEAD = 'HEAD'
export const POST = 'POST'
export const PUT = 'PUT'
export const PATCH = 'PATCH'
export const DELETE = 'DELETE'

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
    sameSite: 'Strict',
    expires: new Date(Date.now() + timestampDays(14)),
  })
}

export function postErrorResponse (this: Response | undefined, message: string, skipRedirectIfUnauthenticated: boolean = false): FunctionErrorPattern {
  // handleSession(this)
  //
  // if (!skipRedirectIfUnauthenticated) {
  //   handleResponseStatus(this)
  // }

  return {
    message,
    succeeded: false
  }
}

export function postSuccessResponse <T> (this: Response | undefined, response: T): FunctionSucceededPattern<T> {
  // handleSession(this)

  return {
    data: response,
    succeeded: true
  }
}

export function buildRequestOptions (headers: [string, string][] = [], method: HttpMethod = GET): Pick<RequestInit, 'method' | 'headers'> {
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
