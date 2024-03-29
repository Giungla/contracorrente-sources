
'use strict';

/**
 * WithTheFlow v1.0.0
 * (c) 2024-present
 **/

const COOKIE_SEPARATOR = '; '

const blurEvent = new CustomEvent('blur')

const _USER = {}

const fieldMap = {
  name: '[name="name"]',
  email: '[name="email"]',
  telephone: '[name="telephone"]'
}

const detailsMap = {
  name: 'div[data-wtf-full-name]',
  email: 'div[data-wtf-email]',
  telephone: 'div[data-wtf-phone]',
}

const fieldMapKeys = Reflect.ownKeys(fieldMap)

const USER = new Proxy(_USER, {
  get (target, property) {
    if (property === 'reset') {
      return () => fieldMapKeys.forEach(v => this.set(target, v, Reflect.get(target, v)))
    }
  },

  set (target, property, newValue) {
    if (property === 'name') {
      querySelector('[data-wtf-name-display]').textContent = newValue.split(' ')?.at(0) ?? '-'
    }

    if (fieldMapKeys.includes(property)) {
      Reflect.set(target, property, newValue)

      querySelector(detailsMap[property]).textContent = newValue

      const currentField = document.querySelector(`${fieldMap[property]}`)

      currentField.value = newValue

      currentField.dispatchEvent(blurEvent)

      return true
    }

    return false
  }
})

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
  querySelector('[data-wtf-zip-code]', addressNode).textContent += `: ${cep}`
  querySelector('[data-wtf-address]', addressNode).textContent += `: ${address}, ${number}`
  querySelector('[data-wtf-neighborhood]', addressNode).textContent += `: ${neighborhood}`
  querySelector('[data-wtf-city]', addressNode).textContent += `: ${city}`
  querySelector('[data-wtf-state]', addressNode).textContent += `: ${state}`

  attachEvent(addressNode.querySelector('#btLoginUser'), 'click', async function (e) {
    e.preventDefault()

    const { succeeded, remaining } = await deleteAddress(id)

    if (succeeded) {
      addressNode.parentElement.removeChild(addressNode)

      // querySelector('[data-wtf-addresses-container]').classList('oculto', remaining === 0)

      return
    }

    alert('Falha ao remover o endereço')
  })
}

/**
 *
 * @typedef PatchUserDetails
 * @property {string | null} name
 * @property {string | null} email
 * @property {string | null} telephone
 */

/**
 *
 * @param userDetails {PatchUserDetails}
 * @returns {Promise<{ succeeded: false } | { succeeded: true, data: UserPayload }>}
 */
async function updateUserDetails (userDetails) {
  let response = null

  try {
    response = await fetch('https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/patch_user', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getCookie('__Host-cc-AuthToken')
      },
      body: JSON.stringify(userDetails)
    })
  } catch (e) {
    return {
      succeeded: false
    }
  }

  if (!response.ok) {
    return {
      succeeded: false
    }
  }

  const data = await response.json()

  return {
    data,
    succeeded: true
  }
}

if (!isAuthenticated()) {
  location.href = '/log-in'
} else {
  fetchUser().then(({ data }) => {
    USER.name = data.user.name
    USER.email = data.user.email
    USER.telephone = data.user.telephone

    querySelector('[data-wtf-full-name]').innerText = data.user.name
    querySelector('[data-wtf-full-name]').innerText = data.user.name
    querySelector('[data-wtf-email]').innerText = data.user.email
    querySelector('[data-wtf-email]').innerText = data.user.email
    querySelector('[data-wtf-phone]').innerText = data.user.telephone

    const noAddresses = querySelector('[data-wtf-no-registered-address-error]')
    const noOrders = querySelector('[data-wtf-no-registered-orders-error]')

    const addressTemplate = querySelector('[data-wtf-registered-address]').cloneNode(true)

    const addressContainer = querySelector('[data-wtf-registered-address]').parentElement

    addressContainer.innerHTML = ''

    const hasNoAddresses = addressContainer.classList.toggle('oculto', data.addresses.length === 0)

    noOrders.classList.toggle('oculto', false) // TODO
    noAddresses.classList.toggle('oculto', !hasNoAddresses)

    for (let index = 0, len = data.addresses.length; index < len; index++) {
      const address = data.addresses[index]

      const currentAddressTemplate = addressTemplate.cloneNode(true)

      currentAddressTemplate.setAttribute('data-address-id', address.id)

      currentAddressTemplate.classList.remove('oculto')

      addressContainer.appendChild(currentAddressTemplate)

      feedAddress(currentAddressTemplate, address)
    }

    querySelector('[data-wtf-loader]').classList.add('oculto')
  })

  /**
   *
   * @param v {string}
   * @returns {string}
   */
  function numberOnly (v) {
    return v.replace(/\D+/g, '')
  }

  /**
   *
   * @param phone {string}
   * @returns     {string}
   */
  function phoneMask (phone) {
    const cleanPhone = numberOnly(phone)

    const len = cleanPhone.length

    if (len < 3) {
      return cleanPhone.replace(/^(\d{1,2})$/, '($1')
    }

    if (len <= 6) {
      return cleanPhone.replace(/^(\d{2})(\d{1,4})$/, '($1) $2')
    }

    if (len <= 10) {
      return cleanPhone.replace(/^(\d{2})(\d{4})(\d{1,4})$/, '($1) $2-$3')
    }

    if (len === 11) {
      return cleanPhone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
    }

    return cleanPhone
  }


  /**
   *
   * @returns {boolean}
   */
  function validatePhoneField () {
    const isValidPattern = /^\(\d{2}\)\s\d{4,5}-\d{4}$/g.test(fieldUserPhone.value)

    const isNonRepeatedDigits = /^\((\d)\1\)\s\1{4,5}-\1{4}/.test(fieldUserPhone.value)

    const isValidPhone = isValidPattern && !isNonRepeatedDigits

    fieldUserPhoneError.classList.toggle('oculto', isValidPhone)
    fieldUserPhoneWrapper.classList.toggle('errormessage', !isValidPhone)

    return isValidPhone
  }

  /**
   *
   * @returns {boolean}
   */
  function validateMailField () {
    const isValidMail = fieldUserMail.value.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)

    fieldUserMailError.classList.toggle('oculto', isValidMail)
    fieldUserMailWrapper.classList.toggle('errormessage', !isValidMail)

    return isValidMail !== null
  }

  /**
   *
   * @returns {boolean}
   */
  function validateNameField () {
    const words = fieldUserName.value.split(' ')

    const isValidName = words.length > 1 && words.every(word => word.length > 1)

    fieldUserNameWrapper.classList.toggle('errormessage', !isValidName)
    fieldUserNameError.classList.toggle('oculto', isValidName)

    return isValidName
  }

  const userForm = document.getElementById('wf-form-updateUserData_formElement')
  const userFormBlock = querySelector('[data-wtf-user-form-info-update]')
  const cancelUserUpdate = querySelector('[data-wtf-close-update-user]')

  const toggleUserForm = querySelector('[data-wtf-open-update-user]')

  const fieldUserName = querySelector('[name="name"]')
  const fieldUserNameError = querySelector('[data-wtf-name-error]')
  const fieldUserNameWrapper = querySelector('[data-wtf-name-wrapper]')

  const fieldUserMail = querySelector('[name="email"]')
  const fieldUserMailError = querySelector('[data-wtf-email-error]')
  const fieldUserMailWrapper = querySelector('[data-wtf-email-wrapper]')

  const fieldUserPhone = querySelector('[name="telephone"]')
  const fieldUserPhoneError = querySelector('[data-wtf-phone-error]')
  const fieldUserPhoneWrapper = querySelector('[data-wtf-phone-wrapper]')

  attachEvent(userForm, 'submit', async function (e) {
    e.preventDefault()
    e.stopPropagation()

    if ([validateNameField(), validateMailField(), validatePhoneField()].some(status => !status)) return

    const res = await updateUserDetails({
      name: fieldUserName.value,
      tel: fieldUserPhone.value,
      email: fieldUserMail.value
    })

    if (res.succeeded === false) {
      const generalUserMessage = querySelector('[data-wtf-general-error-message]')

      generalUserMessage.classList.toggle('oculto', false)

      setTimeout(() => {
        generalUserMessage.classList.toggle('oculto', true)
      }, 5000)

      return
    }

    userFormBlock.classList.toggle('oculto', true)
    toggleUserForm.classList.toggle('oculto', false)

    USER.name = res.data.name
    USER.email = res.data.email
    USER.telephone = res.data.telephone

    const generalUserSuccess = querySelector('[data-wtf-user-form-info-update-success]')

    generalUserSuccess.classList.toggle('oculto', false)

    setTimeout(() => {
      generalUserSuccess.classList.toggle('oculto', true)
    }, 5000)
  }, false)

  attachEvent(userForm, 'reset', function (e) {
    e.preventDefault()

    USER.reset()
  }, false)

  attachEvent(toggleUserForm, 'click', function (e) {
    const state = userFormBlock.classList.toggle('oculto')

    toggleUserForm.classList.toggle('oculto', !state)
  }, false)

  attachEvent(cancelUserUpdate, 'click', function (e) {
    const state = userFormBlock.classList.toggle('oculto')

    toggleUserForm.classList.toggle('oculto', !state)
  }, false)

  attachEvent(fieldUserMail, 'input', function (e) {
    fieldUserNameError.classList.toggle('oculto', true)
    fieldUserNameWrapper.classList.toggle('errormessage', false)
  }, false)

  attachEvent(fieldUserName, 'blur', validateNameField, false)

  attachEvent(fieldUserMail, 'input', function (e) {
    fieldUserMailError.classList.toggle('oculto', true)
    fieldUserMailWrapper.classList.toggle('errormessage', false)
  }, false)

  attachEvent(fieldUserMail, 'blur', validateMailField, false)

  attachEvent(fieldUserPhone, 'input', function (e) {
    e.target.value = phoneMask(e.target.value)

    fieldUserPhoneError.classList.toggle('oculto', true)
    fieldUserPhoneWrapper.classList.toggle('errormessage', false)
  }, false)

  attachEvent(fieldUserPhone, 'blur', validatePhoneField, false)
}
