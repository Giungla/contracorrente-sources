
import {
  type ICookieOptions,
  type ISplitCookieObject,
} from '../types/cookie'

import {
  splitText,
  objectSize,
} from './dom'

export const COOKIE_SEPARATOR = '; '

export function getCookie (name: string): string | false {
  const selectedCookie = splitText(document.cookie, COOKIE_SEPARATOR).find(cookie => {
    const { name: cookieName } = splitCookie(cookie)

    return cookieName === name
  })

  return selectedCookie
    ? splitCookie(selectedCookie).value
    : false
}

export function splitCookie (cookie: string): ISplitCookieObject {
  const [name, ...value] = splitText(cookie, '=')

  return {
    name,
    value: objectSize(value) > 0
      ? decodeURIComponent(value.join('='))
      : false,
  }
}

export function setCookie (name: string, value: string | number | boolean, options: ICookieOptions = {}): string {
  if (objectSize(name) === 0) {
    throw new Error("'setCookie' should receive a valid cookie name")
  }

  if (!['string', 'number', 'boolean'].includes(typeof value) || objectSize(value.toString()) === 0) {
    throw new Error("'setCookie' should receive a valid cookie value")
  }

  const cookieOptions: string[] = [`${name}=${encodeURIComponent(value)}`]

  if (options?.expires && options?.expires instanceof Date) {
    cookieOptions.push(`expires=` + options.expires.toUTCString())
  }

  if (options.maxAge) {
    cookieOptions.push(`maxAge=${options.maxAge}`)
  }

  if (options?.sameSite && typeof options?.sameSite === 'string') {
    cookieOptions.push(`SameSite=${options?.sameSite}`)
  }

  if (options?.path) {
    cookieOptions.push(`path=${options?.path}`)
  }

  if (options?.domain) {
    cookieOptions.push(`domain=${options?.domain}`)
  }

  if (options?.httpOnly) {
    cookieOptions.push(`HttpOnly`)
  }

  if (options?.secure) {
    cookieOptions.push('Secure')
  }

  const _buildCookie = cookieOptions.join(COOKIE_SEPARATOR)

  document.cookie = _buildCookie

  return _buildCookie
}
