
'use strict';

/**
 * WithTheFlow v1.0.0
 * (c) 2024-present
 **/

const COOKIE_SEPARATOR = '; '

const GENERAL_HIDDEN_CLASS = 'oculto'

const SCROLL_INTO_VIEW_DEFAULT_ARGS = {
  block: 'center',
  behavior: 'smooth'
}

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

/**
 *
 * @param element {HTMLElement}
 * @param args    {boolean | ScrollIntoViewOptions}
 */
function scrollIntoView (element, args) {
  element.scrollIntoView(args)
}

function isAuthenticated () {
  const hasAuth = getCookie('__Host-cc-AuthToken')

  return !!hasAuth
}

const bodyElement = querySelector('body')
const generalLoading = querySelector('[data-wtf-loader]')

/**
 *
 * @param status {boolean}
 */
function isPageLoading (status) {
  bodyElement.classList.toggle('noscroll', status)
  generalLoading.classList.toggle(GENERAL_HIDDEN_CLASS, !status)
}

if (isAuthenticated()) {
  location.href = '/area-do-usuario'
} else {
  /**
   *
   * @param autoHide      {boolean}
   * @param autoHideTime= {number}
   */
  function showGeneralError (autoHide, autoHideTime) {
    const generalErrorElement = querySelector('[data-wtf-general-error-message]')

    if (!generalErrorElement) return

    generalErrorElement.classList.remove(GENERAL_HIDDEN_CLASS)

    if (!autoHide) return

    setTimeout(() => {
      generalErrorElement.classList.add(GENERAL_HIDDEN_CLASS)
    }, autoHideTime)
  }

  /**
   * @typedef AsyncOperationResultError
   * @property {true}   error
   * @property {string} reason
   */

  /**
   * @typedef AsyncOperationResultSuccess
   * @property {false}   error
   * @property {object}  data
   */

  /**
   *
   * @param email {string}
   * @returns     {Promise<AsyncOperationResultError | AsyncOperationResultSuccess>}
   */
  async function sendMagicLink (email) {
    const response = await fetch('https://xef5-44zo-gegm.b2.xano.io/api:SJMva2xT/auth/magic-link', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return {
        error: true,
        reason: 'CANNOT_SEND_MAGIC_LINK'
      }
    }

    const data = await response.json()

    return {
      data,
      error: false
    }
  }

  const mailField = querySelector('[data-wtf-email]')
  const mailFieldError = querySelector('[data-wtf-user-error]')
  const mailFieldWrapper = querySelector('[data-wtf-email-wrapper]')

  /**
   *
   * @returns {boolean}
   */
  function blurMailField () {
    const isMailValid = mailField.value.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) !== null

    const isError = mailFieldWrapper.classList.toggle('errormessage', !isMailValid && mailField.value.length > 0)
    mailFieldError.classList.toggle(GENERAL_HIDDEN_CLASS, !isError)

    return isMailValid
  }

  attachEvent(document, 'DOMContentLoaded', function () {
    if (!mailField) {
      throw new Error('[WithTheFlow] Cannot find your e-mail field')
    }

    const recoverForm = mailField.closest('form')

    if (!recoverForm) {
      throw new Error('[WithTheFlow] Cannot find a form wrapping your email field')
    }

    attachEvent(mailField, 'blur', blurMailField, false)

    attachEvent(recoverForm, 'submit', async function (e) {
      e.preventDefault()
      e.stopPropagation()

      isPageLoading(true)

      if (!blurMailField()) {
        isPageLoading(false)

        mailField.dispatchEvent(blurEvent)

        setTimeout(() => {
          scrollIntoView(querySelector('[data-wtf-general-error-message]'), SCROLL_INTO_VIEW_DEFAULT_ARGS)
        }, 500)

        return
      }

      const response = await sendMagicLink(mailField.value)

      if (response.error === true) {
        isPageLoading(false)

        mailField.dispatchEvent(blurEvent)

        setTimeout(() => {
          scrollIntoView(querySelector('[data-wtf-general-error-message]'), SCROLL_INTO_VIEW_DEFAULT_ARGS)
        }, 500)

        return showGeneralError(true, 5000)
      }

      recoverForm.setAttribute('disabled', 'disabled')

      querySelector('[data-wtf-success-message]').classList.remove('oculto')

      isPageLoading(false)
    })

    isPageLoading(false)

    mailField.focus({
      preventScroll: false
    })
  })
}
