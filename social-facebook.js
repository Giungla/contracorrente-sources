
'use strict';

const COOKIE_SEPARATOR = '; '

const GENERAL_HIDDEN_CLASS = 'oculto'

const PASSWORD_MASK = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/g

const SCROLL_INTO_VIEW_DEFAULT_ARGS = {
  block: 'center',
  behavior: 'smooth'
}

const URLParams = new URLSearchParams(location.search)

const blurEvent = new CustomEvent('blur')

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
 * @typedef InvalidCredentials
 * @property {'username' | 'password'} field
 */

/**
 * @typedef InactiveAccount
 * @property {boolean} error
 * @property {string} reason
 */

/**
 * @typedef AuthError
 * @property {string} traceId
 * @property {string} code
 * @property {string} message
 * @property {string | InvalidCredentials | InactiveAccount} payload
 */

/**
 * @typedef LoginResponse
 * @property {boolean | null} error
 * @property {AuthError}      data
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
 * @param node      {HTMLElement | Document}
 * @param eventName {string}
 * @param callback  {EventListener | EventListenerObject}
 * @param options=  {boolean | AddEventListenerOptions}
 */
function attachEvent (node, eventName, callback, options) {
  node.addEventListener(eventName, callback, options)
}

/**
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

if (isAuthenticated()) {
  location.href = '/area-do-usuario'
}

/**
 * @param code {string}
 * @returns    {Promise<boolean | { token: string }>}
 */
async function FacebookContinueOAuth (code) {
  const url = new URL('https://xef5-44zo-gegm.b2.xano.io/api:wOklai2B/oauth/facebook/continue')

  url.searchParams.set('code', code)
  url.searchParams.set('redirect_uri', 'https://contracorrente-ecomm.webflow.io/redirecionamento-fb')

  const currentURL = new URL(location.href)

  const removalKeys = [
    'code'
  ];

  for (let i = 0, len = removalKeys.length; i < len; i++) {
    currentURL.searchParams.delete(removalKeys.at(i))
  }

  history.replaceState(null, '', currentURL.toString())

  try {
    const response = await fetch(url.toString())

    if (!response.ok) {
      return false
    }

    return await response.json()
  } catch (e) {
    return false
  }
}

console.log(URLParams.has('code'), URLParams.get('code'))

if (URLParams.has('code')) {
  FacebookContinueOAuth(URLParams.get('code')).then(res => {
    setCookie('__Host-cc-AuthToken', res.token, {
      path: '/',
      secure: true,
      sameSite: 'Strict',
      expires: new Date(Date.now() + 5_184_000_000)
    })

    location.href = '/area-do-usuario'
  })
}
