
/**
 * WithTheFlow v1.0.0
 * (c) 2024-present
 **/

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
 * @typedef ISingleProduct
 * @property {string} ISBN
 * @property {number} created_at
 * @property {number} full_price
 * @property {number} height
 * @property {number} id
 * @property {string} image
 * @property {number} length
 * @property {number} price
 * @property {string} product_id
 * @property {string} slug
 * @property {string} title
 * @property {number} weight
 * @property {number} width
 */

/**
 * @typedef ICurrentProduct
 * @property {ISingleProduct | null} data
 * @property {boolean}               pending
 * @property {boolean}               fetched
 */

/**
 * @typedef IUser
 * @property {string}  birthday
 * @property {string}  cpf
 * @property {string}  email
 * @property {number}  id
 * @property {string}  name
 * @property {boolean} subscriber
 * @property {boolean} telephone
 */

/**
 * @typedef ICurrentUser
 * @property {IUser | null} data
 * @property {boolean}      pending
 * @property {boolean}      fetched
 */



'use strict';

/**
 * @type {ICurrentProduct}
 */
const CURRENT_PRODUCT = {
  data: null,
  fetched: false,
  pending: false
}

/**
 * @type {ICurrentUser}
 */
const USER = {
  data: null,
  fetched: false,
  pending: false
}

const COOKIE_SEPARATOR = '; '

const SUBSCRIBER_DISCOUNT = 0.3;

const CURRENCY_FORMAT = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency'
})

const CONTRACORRENTE_AUTH_COOKIE_NAME = '__Host-cc-AuthToken'

const GENERAL_HIDDEN_CLASS = 'oculto'

/**
 * @param name {string}
 * @returns    {string | false}
 */
function _getCookie (name) {
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
 * @param selector {keyof HTMLElementTagNameMap | string}
 * @param node     {HTMLElement | Document} - optional
 * @returns        {HTMLElementTagNameMap[keyof HTMLElementTagNameMap] | null}
 */
function querySelector (selector, node = document) {
  return node.querySelector(selector)
}

async function getUser (remainingTries = 3) {
  if (remainingTries < 1 || _getCookie(CONTRACORRENTE_AUTH_COOKIE_NAME) === false) return

  try {
    const response = await fetch('https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': _getCookie(CONTRACORRENTE_AUTH_COOKIE_NAME)
      }
    })

    if (!response.ok) {
      return this.getUser(remainingTries - 1)
    }

    /**
     * @type {IUser}
     */
    const data = await response.json()

    Object.assign(USER, {
      data,
      fetched: true,
      pending: true
    })
  } catch (e) {
    console.log('[WithTheFlow] Falha ao buscar o usuário')

    return this.getUser(remainingTries - 1)
  }
}

/**
 * @param slug {string}
 * @returns    {Promise<void>}
 */
async function searchProduct (slug) {
  try {
    CURRENT_PRODUCT.pending = true

    const response = await fetch('https://xef5-44zo-gegm.b2.xano.io/api:RJyl42La/query_products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        slugs: [slug]
      })
    })

    if (!response.ok) {
      CURRENT_PRODUCT.pending = false

      location.reload()

      return
    }

    /**
     * @type {ISingleProduct[]}
     */
    const data = await response.json()

    Object.assign(CURRENT_PRODUCT, {
      fetched: true,
      pending: false,
      data: data.at(0)
    })
  } catch (e) {
    CURRENT_PRODUCT.pending = false

    location.reload()
  }
}

async function bootstrap () {
  await Promise.allSettled([
    getUser(),
    searchProduct(location.pathname.replace(/\/product\//, ''))
  ])

  const isSubscriber = USER.data.subscriber

  if (!isSubscriber) return

  querySelector('#precoAssinante').textContent = STRING_2_BRL_CURRENCY(CURRENT_PRODUCT.data.full_price * (1 - SUBSCRIBER_DISCOUNT))

  querySelector('#blocoAssinante').classList.toggle('oculto', !isSubscriber)
  querySelector('#linhaAssinante').classList.toggle('oculto', !isSubscriber)

  querySelector('#precoComDesconto').style.textDecoration = 'line-through'
}

bootstrap()
