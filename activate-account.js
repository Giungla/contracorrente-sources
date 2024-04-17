
'use strict';

/**
 * WithTheFlow v1.0.0
 * (c) 2024-present
 **/

const URLParams = new URLSearchParams(location.search)

if (URLParams.size === 0 || !URLParams.get('activation_code')) {
  location.href = '/sign-up'
}

const GENERAL_HIDDEN_CLASS = 'oculto'

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
 * @typedef ISearchAccountPayload
 * @property {number}  id
 * @property {string}  uuid
 * @property {string}  email
 * @property {boolean} activated
 */

/**
 * @typedef ISearchAccountSuccessPayload
 * @property {false} error
 * @property {ISearchAccountPayload} data
 */

/**
 * @typedef ISearchAccountErrorPayload
 * @property {null} data
 * @property {true} error
 */

/**
 *
 * @param activationHash {string}
 * @returns              {Promise<ISearchAccountSuccessPayload | ISearchAccountErrorPayload>}
 */
async function searchAccount (activationHash) {
  const response = await fetch(`https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/search_account/${activationHash}`)

  if (!response.ok) {
    return {
      data: null,
      error: true
    }
  }

  const data = await response.json()

  return {
    data,
    error: false
  }
}

const bodyElement = querySelector('body')
const generalLoading = querySelector('[data-wtf-loader]')

const activationError = querySelector('[data-wtf-redirect-error-message]')
const activationSuccess = querySelector('[data-wtf-redirect-success-message]')

const confirmActivationAnchor = querySelector('[data-wtf-redirect-button]')

activationError.classList.toggle('oculto', true)
activationSuccess.classList.toggle('oculto', true)

/**
 *
 * @param status {boolean}
 */
function isPageLoading (status) {
  bodyElement.classList.toggle('noscroll', status)
  generalLoading.classList.toggle(GENERAL_HIDDEN_CLASS, !status)
}

attachEvent(confirmActivationAnchor, 'click', async function (e) {
  e.preventDefault()

  isPageLoading(true)

  const { error, data } = await searchAccount(URLParams.get('activation_code'))

  activationError.classList.toggle(GENERAL_HIDDEN_CLASS, !error)
  activationSuccess.classList.toggle(GENERAL_HIDDEN_CLASS, error)

  isPageLoading(false)

  if (error) return

  setTimeout(() => {
    location.href = `/log-in?mail=${data.email}`
  }, 6000)
}, false)

isPageLoading(false)
