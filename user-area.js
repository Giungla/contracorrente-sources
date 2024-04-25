
'use strict';

/**
 * WithTheFlow v1.0.0
 * (c) 2024-present
 **/

const CURRENCY_FORMAT = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency'
})

const CONTRACORRENTE_AUTH_COOKIE_NAME = '__Host-cc-AuthToken'

const GENERAL_HIDDEN_CLASS = 'oculto'

const COOKIE_SEPARATOR = '; '

const statesAcronymRE = /^AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MS|MT|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO$/

const blurEvent = new CustomEvent('blur')

const abortController = new AbortController()
const signal = abortController.signal

const _USER = {}
const _ADDRESSES = {
  list: []
}

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

const ADDRESSES = new Proxy(_ADDRESSES, {
  /**
   *
   * @param target   {Object}
   * @param property {string | symbol | number}
   * @param address  {UserAddress}
   * @returns        {boolean}
   */
  set (target, property, address) {
    switch (property) {
      case 'register':
        target.list.push(address)

        const currentAddressTemplate = addressTemplate.cloneNode(true)

        currentAddressTemplate.setAttribute('data-address-id', address.id)

        currentAddressTemplate.classList.remove('oculto')

        addressContainer.appendChild(currentAddressTemplate)

        feedAddress(currentAddressTemplate, address)

        const hasAddresses = target.list.length > 0

        noAddresses.classList.toggle('oculto', hasAddresses)

        return true
      case 'remove':
        isPageLoading(true)

        try {
          deleteAddress(address.id).then(() => {
            addressContainer.removeChild(querySelector(`[data-address-id="${address.id}"]`))

            target.list.splice(target.list.findIndex(({ id }) => id === address.id), 1)

            const isWarnHide = noAddresses.classList.toggle('oculto', target.list.length > 0)

            addressContainer.classList.toggle('oculto', !isWarnHide)

            isPageLoading(false)
          })
        } catch (e) {
          isPageLoading(false)
        }

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
 * @param name {string}
 */
function deleteCookie (name) {
  setCookie(name, '=', {
    path: '/',
    secure: true,
    sameSite: 'Strict',
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

/**
 *
 * @param status {boolean}
 */
function isPageLoading (status) {
  querySelector('body').classList.toggle('noscroll', status)
  querySelector('[data-wtf-loader]').classList.toggle(GENERAL_HIDDEN_CLASS, !status)
}

function isAuthenticated () {
  const hasAuth = getCookie(CONTRACORRENTE_AUTH_COOKIE_NAME)

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
 * @typedef BookDetails
 * @property {number} id
 * @property {string} name
 */

/**
 * @typedef SingleOrder
 * @property {number}        id
 * @property {number}        total
 * @property {null | string} boletourl
 * @property {number}        created_at
 * @property {string}        shipping_tracking
 * @property {string}        transaction_id
 * @property {BookDetails[]} order_items
 * @property {boolean}       pago
 */

/**
 * @typedef UserResponse
 * @property {UserPayload}   user
 * @property {UserAddress[]} addresses
 * @property {SingleOrder[]}   orders
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
      'Authorization': getCookie(CONTRACORRENTE_AUTH_COOKIE_NAME)
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
      'Authorization': getCookie(CONTRACORRENTE_AUTH_COOKIE_NAME)
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
function feedAddress (addressNode, { id, nick, cep, address, neighborhood, city, state, number }) {
  querySelector('[data-wtf-address-tag]', addressNode).textContent += `: ${nick}`
  querySelector('[data-wtf-zip-code]', addressNode).textContent += `: ${cep}`
  querySelector('[data-wtf-address]', addressNode).textContent += `: ${address}, ${number}`
  querySelector('[data-wtf-neighborhood]', addressNode).textContent += `: ${neighborhood}`
  querySelector('[data-wtf-city]', addressNode).textContent += `: ${city}`
  querySelector('[data-wtf-state]', addressNode).textContent += `: ${state}`

  attachEvent(addressNode.querySelector('#btLoginUser'), 'click', function () {
    ADDRESSES.remove = { id }
  })
}

/**
 *
 * @param user_orders {SingleOrder[]}
 */
function feedUserOrders (user_orders) {
  const hasOders = user_orders.length > 0

  const noOrdersWarning = querySelector('[data-wtf-no-registered-orders-error]')

  noOrdersWarning.classList.toggle('oculto', hasOders)

  const orderGroup = querySelector('[data-wtf-order]')

  orderGroup.classList.toggle('oculto', !hasOders)

  if (!hasOders) {
    orderGroup.innerHTML = ''

    return
  }

  const orderTemplate = querySelector('[data-wtf-order-template]').cloneNode(true)

  orderGroup.innerHTML = ''

  for (const order of user_orders) {
    const currentOrder = orderTemplate.cloneNode(true)

    querySelector('[data-wtf-order-id]', currentOrder).textContent += ': ' + order.transaction_id
    querySelector('[data-wtf-order-total]', currentOrder).textContent += ': ' + CURRENCY_FORMAT.format(order.total)
    querySelector('[data-wtf-order-date]', currentOrder).textContent += ': ' + new Date(order.created_at).toLocaleDateString('pt-BR')
    querySelector('[data-wtf-order-payment-status]', currentOrder).textContent += ': ' + (order.pago ? 'Pago' : 'Em aberto')

    const orderDetails = querySelector('[data-wtf-open-order]', currentOrder)

    orderDetails.setAttribute('target', '_blank')
    orderDetails.setAttribute('href', `${location.protocol}//${location.hostname}/order-confirmation?order-id=${order.transaction_id}`)

    const booksGroup = querySelector('[data-wtf-order-items-list]', currentOrder)
    const bookTemplate = querySelector('li', booksGroup).cloneNode(true)
    booksGroup.innerHTML = ''

    feedOrderItems(order.order_items, booksGroup, bookTemplate)

    orderGroup.appendChild(currentOrder)
  }
}


/**
 *
 * @param products      {BookDetails[]}
 * @param parentNode    {HTMLUListElement}
 * @param orderTemplate {HTMLLIElement}
 */
function feedOrderItems (products, parentNode, orderTemplate) {
  for (const book of products) {
    const currentOrder = orderTemplate.cloneNode(true)

    currentOrder.textContent = book.name
    currentOrder.setAttribute('data-book-id', book.id)

    parentNode.appendChild(currentOrder)
  }
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
        'Authorization': getCookie(CONTRACORRENTE_AUTH_COOKIE_NAME)
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

const noAddresses = querySelector('[data-wtf-no-registered-address-error]')
const noOrders = querySelector('[data-wtf-no-registered-orders-error]')

const addressTemplate = querySelector('[data-wtf-registered-address]').cloneNode(true)

const toggleAddressForm = querySelector('[data-wtf-add-address]')
const addressContainer = querySelector('[data-wtf-registered-address]').parentElement

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

    addressContainer.innerHTML = ''

    const hasNoAddresses = addressContainer.classList.toggle('oculto', data.addresses.length === 0)

    noOrders.classList.toggle('oculto', false) // TODO
    noAddresses.classList.toggle('oculto', !hasNoAddresses)

    for (let index = 0, len = data.addresses.length; index < len; index++) {
      ADDRESSES.register = data.addresses[index]
    }

    feedUserOrders(data.orders)

    isPageLoading(false)
    console.log('false')
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

  /**
   *
   * users variables
   */

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

  const logout = querySelector('[data-wtf-logout]')

  attachEvent(logout, 'click', function (e) {
    e.preventDefault()
    e.stopPropagation()

    deleteCookie(CONTRACORRENTE_AUTH_COOKIE_NAME)

    location.href = e.currentTarget.href
  }, false)

  /**
   * start user form listeners
   */
  attachEvent(userForm, 'submit', async function (e) {
    e.preventDefault()
    e.stopPropagation()

    isPageLoading(true)

    if ([validateNameField(), validateMailField(), validatePhoneField()].some(status => !status)) {
      isPageLoading(false)

      return
    }

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

      isPageLoading(false)

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

    isPageLoading(false)
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

  /**
   * validation addresses functions
   */

  /**
   *
   * @typedef VIACEPPayload
   * @property {string} cep
   * @property {string} logradouro
   * @property {string} complemento
   * @property {string} bairro
   * @property {string} localidade
   * @property {string} uf
   * @property {string} ibge
   * @property {string} gia
   * @property {string} ddd
   * @property {string} siafi
   */

  /**
   *
   * @param cep    {string}
   * @param signal {AbortSignal}
   * @returns {Promise< { error: true } | { error: false, data: VIACEPPayload } >}
   */
  async function getAddressDetails (cep, signal = null) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
        signal,
        method: 'GET'
      })

      const data = await response.json()

      return {
        data,
        error: Reflect.has(data,  'erro')
      }
    } catch (e) {
      return {
        error: true
      }
    }
  }

  /**
   * @typedef RegisterAddressBody
   * @property {string} nick
   * @property {string} cep
   * @property {string} address
   * @property {string} number
   * @property {string} complement
   * @property {string} neighborhood
   * @property {string} city
   * @property {string} state
   */

  /**
   *
   * @param address {RegisterAddressBody}
   * @returns       {Promise<{ error: true } | { error: false, data: RegisterAddressBody }>}
   */
  async function registerAddress (address) {
    try {
      const response = await fetch('https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/register_address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getCookie(CONTRACORRENTE_AUTH_COOKIE_NAME)
        },
        body: JSON.stringify(address)
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
    } catch (e) {
      return {
        error: true
      }
    }
  }

  /**
   *
   * @param cep {string}
   * @returns   {string}
   */
  function maskCEP (cep) {
    const cleanCEP = numberOnly(cep)

    const len = cleanCEP.length

    if (len < 6) {
      return cleanCEP
    }

    return cleanCEP.replace(/^(\d{5})(\d{1,3})$/, '$1-$2')
  }

  function validateAddressNick () {
    const isNickValid = fieldAddressNick.value.length > 2

    fieldAddressNickError.classList.toggle('oculto', isNickValid)
    fieldAddressNickWrapper.classList.toggle('errormessage', !isNickValid)

    return isNickValid
  }

  /**
   *
   * @returns {boolean}
   */
  function validateAddressCEP () {
    const isCEPValid = /^\d{5}\-\d{3}$/.test(fieldAddressCEP.value) && !/^(\d)\1{4}\-\1{3}$/.test(fieldAddressCEP.value)

    fieldAddressCEPError.classList.toggle('oculto', isCEPValid)
    fieldAddressCEPWrapper.classList.toggle('errormessage', !isCEPValid)

    return isCEPValid
  }

  /**
   * @returns {boolean}
   */
  function validateAddressName () {
    const isNameValid = fieldAddressName.value.length > 2

    fieldAddressNameError.classList.toggle('oculto', isNameValid)
    fieldAddressNameWrapper.classList.toggle('errormessage', !isNameValid)

    return isNameValid
  }

  /**
   *
   * @returns {boolean}
   */
  function validateAddressNumber () {
    const isNumberValid = fieldAddressNumber.value.length > 0

    fieldAddressNumberError.classList.toggle('oculto', isNumberValid)
    fieldAddressNumberWrapper.classList.toggle('errormessage', !isNumberValid)

    return isNumberValid
  }

  /**
   * @returns {boolean}
   */
  function validateAddressNeighborhood () {
    const isValidNeighborhood = fieldAddressNeighborhood.value.length > 0

    fieldAddressNeighborhoodError.classList.toggle('oculto', isValidNeighborhood)
    fieldAddressNeighborhoodWrapper.classList.toggle('errormessage', !isValidNeighborhood)

    return isValidNeighborhood
  }

  /**
   *
   * @returns {boolean}
   */
  function validateAddressCity () {
    const isCityValid = fieldAddressCity.value.length > 2

    fieldAddressCityError.classList.toggle('oculto', isCityValid)
    fieldAddressCityWrapper.classList.toggle('errormessage', !isCityValid)

    return isCityValid
  }

  /**
   * @returns {boolean}
   */
  function validateAddressState () {
    const isStateValid = statesAcronymRE.test(fieldAddressState.value)

    fieldAddressStateError.classList.toggle('oculto', isStateValid)
    fieldAddressStateWrapper.classList.toggle('errormessage', !isStateValid)

    return isStateValid
  }

  /**
   * addresses variables
   */
  const addressFormBlock = querySelector('[data-wtf-address-form]')
  // TODO
  // corrigir valor da query abaixo
  const addressForm = querySelector('#wf-form-addAddressData_formElement')

  const fieldAddressNick = querySelector('[data-wtf-tag-new]')
  const fieldAddressNickError = querySelector('[data-wtf-tag-new-error]')
  const fieldAddressNickWrapper = querySelector('[data-wtf-tag-new-wrapper]')

  const fieldAddressCEP = querySelector('[data-wtf-zipcode-new]')
  const fieldAddressCEPError = querySelector('[data-wtf-zipcode-new-error]')
  const fieldAddressCEPWrapper = querySelector('[data-wtf-zipcode-new-wrapper]')

  const fieldAddressName = querySelector('[data-wtf-address-new]')
  const fieldAddressNameError = querySelector('[data-wtf-address-new-error]')
  const fieldAddressNameWrapper = querySelector('[data-wtf-address-new-wrapper]')

  const fieldAddressComplement = querySelector('[data-wtf-complement-new]')

  const fieldAddressNumber = querySelector('[data-wtf-number-new]')
  const fieldAddressNumberError = querySelector('[data-wtf-number-new-error]')
  const fieldAddressNumberWrapper = querySelector('[data-wtf-number-new-wrapper]')

  const fieldAddressNeighborhood = querySelector('[data-wtf-neighborhood-new]')
  const fieldAddressNeighborhoodError = querySelector('[data-wtf-neighborhood-new-error]')
  const fieldAddressNeighborhoodWrapper = querySelector('[data-wtf-neighborhood-new-wrapper]')

  const fieldAddressCity = querySelector('[data-wtf-city-new]')
  const fieldAddressCityError = querySelector('[data-wtf-city-new-error]')
  const fieldAddressCityWrapper = querySelector('[data-wtf-city-new-error]')

  const fieldAddressState = querySelector('[data-wtf-state-new]')
  const fieldAddressStateError = querySelector('[data-wtf-state-new-error]')
  const fieldAddressStateWrapper = querySelector('[data-wtf-state-new-wrapper]')


  /**
   * start addresses form listeners
   */

  attachEvent(toggleAddressForm, 'click', function (e) {
    const isControllerHidden = toggleAddressForm.classList.toggle('oculto')

    addressFormBlock.classList.toggle('oculto', !isControllerHidden)
  }, false)

  attachEvent(addressForm, 'submit', async function (e) {
    e.preventDefault()
    e.stopPropagation()

    isPageLoading(true)

    const isFormAddressValid = [
      validateAddressNick(),
      validateAddressCEP(),
      validateAddressNumber(),
      validateAddressNeighborhood(),
      validateAddressCity(),
      validateAddressState()
    ].every(valid => valid)

    if (!isFormAddressValid) {
      isPageLoading(false)

      return
    }

    const response = await registerAddress({
      cep: fieldAddressCEP.value,
      tag: fieldAddressNick.value,
      city: fieldAddressCity.value,
      state: fieldAddressState.value,
      address: fieldAddressName.value,
      number: fieldAddressNumber.value,
      complement: fieldAddressComplement.value,
      neighborhood: fieldAddressNeighborhood.value
    })

    // TODO
    // Adicionar blocos de erro
    if (response.error) {
      isPageLoading(false)

      return
    }

    ADDRESSES.register = response.data

    addressFormBlock.classList.add('oculto')
    addressContainer.classList.remove('oculto')
    toggleAddressForm.classList.remove('oculto')

    addressForm.reset()

    isPageLoading(false)
  }, false)

  attachEvent(addressForm, 'reset', function () {
    toggleAddressForm.classList.toggle('oculto', false)

    addressFormBlock.classList.toggle('oculto', true)
  }, false)

  attachEvent(fieldAddressNick, 'blur', validateAddressNick, false)

  attachEvent(fieldAddressCEP, 'input', async function () {
    fieldAddressCEP.value = maskCEP(fieldAddressCEP.value)

    const cep = numberOnly(fieldAddressCEP.value)

    if (cep.length < 8) return

    const { error, data } = await getAddressDetails(cep, signal)

    if (error) {
      fieldAddressCEP.value = ''
      fieldAddressName.value = ''
      fieldAddressNeighborhood.value = ''
      fieldAddressCity.value = ''
      fieldAddressState.value = '';

      return
    }

    fieldAddressName.value = data.logradouro
    fieldAddressNeighborhood.value = data.bairro
    fieldAddressCity.value = data.localidade
    fieldAddressState.value = data.uf;

    [
      fieldAddressName,
      fieldAddressCity,
      fieldAddressState,
      fieldAddressNeighborhood
    ].forEach(f => {
      f.dispatchEvent(blurEvent)
    })

    fieldAddressNumber.focus({
      preventScroll: false
    })
  }, false)

  attachEvent(fieldAddressCEP, 'blur', validateAddressCEP, false)

  attachEvent(fieldAddressName, 'blur', validateAddressName, false)

  attachEvent(fieldAddressNumber, 'blur', validateAddressNumber, false)

  attachEvent(fieldAddressNeighborhood, 'blur', validateAddressNeighborhood, false)

  attachEvent(fieldAddressCity, 'blur', validateAddressCity, false)

  attachEvent(fieldAddressState, 'blur', validateAddressState, false)
}
