
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

if (isAuthenticated()) {
  location.href = '/area-do-usuario'
} else {
  /**
   *
   * @param autoHide      {boolean}
   * @param autoHideTime= {number}
   */
  function showGeneralError (autoHide, autoHideTime) {
    const generalErrorElement = document.querySelector('[data-wtf-general-error-message]')

    if (!generalErrorElement) return

    generalErrorElement.style.display = 'block'

    if (!autoHide) return

    setTimeout(() => {
      generalErrorElement.style.display = 'none'
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

  /**
   *
   * @param field        {HTMLInputElement}
   * @param regexmatcher {RegExp}
   * @param wrapperField {HTMLElement}
   * @param errorField   {HTMLElement}
   */
  function blurMailField (field, regexmatcher, wrapperField, errorField) {
    const isMalformed = !regexmatcher.test(field.value)

    wrapperField.classList.toggle('errormessage', isMalformed)
    errorField.style.display = isMalformed
      ? 'block'
      : 'none'
  }

  // attachEvent(document, 'DOMContentLoaded', function () {
    const mailField = document.querySelector('#email')
    const mailFieldWrapper = mailField.parentElement
    const recoverForm = mailField.closest('form')

    if (!mailField) {
      throw new Error('[WithTheFlow] Cannot find your e-mail field')
    }

    if (!recoverForm) {
      throw new Error('[WithTheFlow] Cannot find a form wrapping your email field')
    }

    attachEvent(mailField, 'blur', function () {
      blurMailField(mailField, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, mailFieldWrapper, mailFieldWrapper.previousElementSibling)
    })

    attachEvent(recoverForm, 'submit', async function () {
      const response = await sendMagicLink(mailField.value)

      if (response.error === true) {
        return showGeneralError(true, 2000)
      }

      // implementar confirmação de envio
    })

    console.log('[WithTheFlow] Your form is running correctly')
  // })
}
