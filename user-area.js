
'use strict';

/**
 * WithTheFlow v1.0.0
 * (c) 2024-present
 **/

const COOKIE_SEPARATOR = '; '

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
 * @param node      {HTMLElement | Document}
 * @param eventName {string}
 * @param callback  {EventListener | EventListenerObject}
 * @param options=  {boolean | AddEventListenerOptions}
 */
function attachEvent (node, eventName, callback, options) {
  node.addEventListener(eventName, callback, options)
}

function isAuthenticated () {
  const hasAuth = getCookie('__Host-cc-AuthToken')

  return !!hasAuth
}

/**
 * @typedef UserPayload
 * @property {number} id
 * @property {string} email
 * @property {string} name
 * @property {string} telephone
 */

/**
 * @typedef UserAddress
 * @property {string} id
 * @property {string} nick
 * @property {string} address
 * @property {string} number
 * @property {string} cep
 * @property {string} city
 * @property {string} complement
 * @property {string} state
 * @property {string} neighborhood
 */

/**
 * @typedef DeleteAddressResponse
 * @property {number} remaining
 */

/**
 * @typedef DeleteAddressResponseError
 * @property {false} succeeded
 */

/**
 * @typedef DeleteAddressResponseSuccess
 * @property {true}   succeeded
 * @property {number} remaining
 */

/**
 * @typedef UserResponse
 * @property {UserPayload} user
 * @property {UserAddress[]} addresses
 */

/**
 *
 * @returns {Promise<{ data: UserResponse, error: false }|{ error: true }>}
 */
async function fetchUser () {
  const response = await fetch('https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/user_area', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getCookie('__Host-cc-AuthToken')
    }
  })

  if (!response.ok) {
    return {
      error: true
    }
  }

  const data = await response.json()

  return {
    data,
    error: false
  }
}

/**
 *
 * @param addressId {string}
 * @returns {Promise<DeleteAddressResponseError | DeleteAddressResponseSuccess>}
 */
async function deleteAddress (addressId) {
  const response = await fetch(`https://xef5-44zo-gegm.b2.xano.io/api:pdkGUSNn/user_address/${addressId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': getCookie('__Host-cc-AuthToken')
    }
  })

  if (!response.ok) {
    return {
      succeeded: false
    }
  }

  /**
   * @type {DeleteAddressResponse}
   */
  const data = await response.json()

  return {
    succeeded: true,
    remaining: data.remaining
  }
}

/**
 *
 * @param addressNode {HTMLElement}
 * @param addressDetails {UserAddress}
 */
function feedAddress (addressNode, { id, cep, address, neighborhood, city, state, number }) {
  addressNode.querySelector('[data-wtf-zip-code]').textContent += `: ${cep}`
  addressNode.querySelector('[data-wtf-address]').textContent += `: ${address}, ${number}`
  addressNode.querySelector('[data-wtf-neighborhood]').textContent += `: ${neighborhood}`
  addressNode.querySelector('[data-wtf-city]').textContent += `: ${city}`
  addressNode.querySelector('[data-wtf-state]').textContent += `: ${state}`

  attachEvent(addressNode.querySelector('#btLoginUser'), 'click', async function (e) {
    e.preventDefault()

    const { succeeded, remaining } = await deleteAddress(id)

    if (succeeded) {
      addressNode.parentElement.removeChild(addressNode)

      // document.querySelector('[data-wtf-addresses-container]').classList('oculto', remaining === 0)

      return
    }

    alert('Falha ao remover o endereço')
  })
}

if (!isAuthenticated()) {
  location.href = '/log-in'
} else {
  fetchUser().then(({ data }) => {
    document.querySelector('[data-wtf-name]').innerText = data.user.name.split(' ').at(0)
    document.querySelector('[data-wtf-full-name]').innerText = data.user.name
    document.querySelector('[data-wtf-full-name]').innerText = data.user.name
    document.querySelector('[data-wtf-email]').innerText = data.user.email
    document.querySelector('[data-wtf-email]').innerText = data.user.email
    document.querySelector('[data-wtf-phone]').innerText = data.user.telephone

    const addressTemplate = document.querySelector('[data-wtf-registered-address]').cloneNode(true)

    const addressContainer = document.querySelector('[data-wtf-registered-address]').parentElement

    addressContainer.innerHTML = ''

    addressContainer.classList.toggle('oculto', data.addresses.length === 0)

    for (let index = 0, len = data.addresses.length; index < len; index++) {
      const address = data.addresses[index]

      const currentAddressTemplate = addressTemplate.cloneNode(true)

      currentAddressTemplate.setAttribute('data-address-id', address.id)

      currentAddressTemplate.classList.remove('oculto')

      addressContainer.appendChild(currentAddressTemplate)

      feedAddress(currentAddressTemplate, address)
    }

    document.querySelector('[data-wtf-loader]').classList.add('oculto')
  })
}
