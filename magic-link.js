
'use strict';

/**
 * WithTheFlow v1.0.0
 * (c) 2024-present
 **/

const COOKIE_SEPARATOR = '; '

const CONTRACORRENTE_AUTH_COOKIE_NAME = '__Host-cc-AuthToken'

/**
 * @typedef  {Object}                    cookieOptions
 * @property {Date}                      expires  - optional
 * @property {boolean}                   secure   - optional
 * @property {'None' | 'Lax' | 'Strict'} sameSite - optional
 * @property {string}                    path     - optional
 * @property {string}                    domain   - optional
 * @property {boolean}                   httpOnly - optional
 */

/**
 * @typedef  {Object} splitCookieObject
 * @property {string} name
 * @property {string} value
 */

/**
 *
 * @param name    {string}
 * @param value   {string | number | boolean}
 * @param options {cookieOptions}
 * @returns       {string}
 */
function setCookie (name, value, options = {}) {
  if (typeof name !== 'string' || name.length === 0) {
    throw new Error("'setCookie' should receive a valid cookie name")
  }

  if (!['string', 'number', 'boolean'].includes(typeof value) || value.toString().length === 0) {
    throw new Error("'setCookie' should receive a valid cookie value")
  }

  /** @type {string[]} */
  const cookieOptions = [`${name}=${value}`]

  if (options?.expires && options?.expires instanceof Date) {
    cookieOptions.push(`expires=` + options.expires.toGMTString())
  }

  if (options?.sameSite && typeof options?.sameSite === 'string') {
    cookieOptions.push(`SameSite=${options?.sameSite}`)
  }

  if (options?.path && typeof options.path === 'string') {
    cookieOptions.push(`path=${options?.path}`)
  }

  if (options?.domain && typeof options.domain === 'string') {
    cookieOptions.push(`domain=${options?.path}`)
  }

  if (options?.httpOnly && typeof options.httpOnly === 'boolean') {
    cookieOptions.push(`HttpOnly`)
  }

  if (options?.secure && typeof options.secure === 'boolean') {
    cookieOptions.push('Secure')
  }

  const _buildCookie = cookieOptions.join(COOKIE_SEPARATOR)

  document.cookie = _buildCookie

  return _buildCookie
}

/**
 *
 * @param name {string}
 * @returns    {string | false}
 */
function getCookie (name) {
  const selectedCookie = document.cookie
    .split(COOKIE_SEPARATOR)
    .find(cookie => {
      const { name: cookieName } = splitCookie(cookie)

      return cookieName === name
    })

  return selectedCookie
    ? splitCookie(selectedCookie).value
    : false
}

/**
 *
 * @param name {string}
 */
function deleteCookie (name) {
  setCookie(name, '=', {
    expires: new Date(0)
  })
}

/**
 *
 * @param cookie {string}
 * @returns      {splitCookieObject}
 */
function splitCookie (cookie) {
  const [name, value] = cookie.split('=')

  return {
    name,
    value
  }
}

/**
 *
 * @param selector {keyof HTMLElementTagNameMap | string}
 * @param node     {HTMLElement | Document} - optional
 * @returns        {HTMLElementTagNameMap[keyof HTMLElementTagNameMap] | null}
 */
function querySelector (selector, node = document) {
  return node.querySelector(selector)
}

function isAuthenticated () {
  const hasAuth = getCookie('__Host-cc-AuthToken')

  return !!hasAuth
}

/**
 *
 * @param magic_token {string}
 * @returns           {Promise<string | boolean>}
 */
async function validateMagicLink (magic_token) {
  const response = await fetch('https://xef5-44zo-gegm.b2.xano.io/api:SJMva2xT/auth/magic-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ magic_token })
  })

  if (!response.ok) {
    return false
  }

  const token = await response.json()

  return token
}

function handleMagicLinkError () {
  querySelector('.areadousuario_errormessagemagiclink_envelope').classList.remove('oculto')

  setTimeout(() => {
    location.href = '/reset-password'
  }, 6000)
}

if (isAuthenticated()) {
  deleteCookie(CONTRACORRENTE_AUTH_COOKIE_NAME)
}

const urlSearch = new URLSearchParams(location.search)

if (!urlSearch.get('token')) {
  handleMagicLinkError()
} else {
  validateMagicLink(urlSearch.get('token'))
    .then(auth_token => {
      if (auth_token === false) {
        handleMagicLinkError()

        return
      }

      setCookie(CONTRACORRENTE_AUTH_COOKIE_NAME, auth_token, {
        path: '/',
        secure: true,
        sameSite: 'Strict',
        expires: new Date(Date.now() + 5_184_000_000)
      })

      location.href = '/area-do-usuario'
    })
    .catch(err => {
      handleMagicLinkError()
    })
}
