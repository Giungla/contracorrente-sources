
'use strict';

const COOKIE_SEPARATOR = '; '

const GENERAL_HIDDEN_CLASS = 'oculto'

const PASSWORD_MASK = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/g

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

if (isAuthenticated()) {
  location.href = '/area-do-usuario'
} else {
  attachEvent(document, 'DOMContentLoaded', function () {
    // Selecting the elements for email
    const userField   = querySelector('[data-wtf-user]')
    const userFieldWrapper = querySelector('[data-wtf-user-wrapper]')
    const userErrorWrapper = querySelector('[data-wtf-user-error]')

    if (!userField) {
      throw new Error('[WithTheFlow] Cannot find a field with the \'data-wtf-user\' attribute')
    }

    const bodyElement = querySelector('body')
    const generalLoading = querySelector('[data-wtf-loader]')

    // Selecting the elements for password
    const passwordField = querySelector('[data-wtf-password]')
    const passwordFieldWrapper = querySelector('[data-wtf-password-wrapper]')
    const passwordErrorWrapper = querySelector('[data-wtf-password-error]')

    if (!passwordField) {
      throw new Error('[WithTheFlow] Cannot find a field with the \'data-wtf-password\' attribute')
    }

    const generalMessage = querySelector('[data-wtf-general-error-message]')
    const authenticationError = querySelector('[data-wtf-authentication-error-message]')
    const accountInactiveMessage = querySelector('[data-wtf-confirm-email-error-message]')

    const form = userField.closest('form')

    if (!form) {
      throw new Error('[WithTheFlow] Cannot find a form wrapping your fields')
    }

    if (URLParams.get('mail')) {
      userField.value = URLParams.get('mail')

      passwordField.focus()
    } else {
      userField.focus()
    }

    /**
     *
     * @param status {boolean}
     */
    function isPageLoading (status) {
      bodyElement.classList.toggle('noscroll', status)
      generalLoading.classList.toggle(GENERAL_HIDDEN_CLASS, !status)
    }

    /**
     *
     * @param email    {string}
     * @param password {string}
     * @returns        {Promise<void | LoginResponse>}
     */
    async function loginUser (email, password) {
      try {
        const response = await fetch('https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            password
          })
        })

        if (!response.ok) {
          const error = await response.text()

          return {
            error: true,
            data: JSON.parse(error)
          }
        }

        const data = await response.json()

        setCookie('__Host-cc-AuthToken', data.authToken, {
          path: '/',
          secure: true,
          sameSite: 'Strict',
          expires: new Date(Date.now() + 5_184_000_000)
        })

        location.href = '/area-do-usuario'
      } catch (error) {
        return {
          error: true,
          data: {
            code: '',
            traceId: '',
            message: '',
            payload: ''
          }
        }
      }
    }

    /**
     * @returns {boolean}
     */
    function validateMailField () {
      const isValidMail = userField.value.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) !== null

      userFieldWrapper.classList.toggle('errormessage', !isValidMail)
      userErrorWrapper.classList.toggle(GENERAL_HIDDEN_CLASS, isValidMail)

      return isValidMail
    }

    /**
     * @returns {boolean}
     */
    function validatePasswordField () {
      const isValidPassword = PASSWORD_MASK.test(passwordField.value)

      PASSWORD_MASK.lastIndex = 0

      passwordFieldWrapper.classList.toggle('errormessage', !isValidPassword)
      passwordErrorWrapper.classList.toggle(GENERAL_HIDDEN_CLASS, isValidPassword)

      return isValidPassword
    }

    attachEvent(userField, 'blur', validateMailField, {
      passive: true,
      capture: false
    })

    attachEvent(passwordField, 'blur', validatePasswordField, {
      passive: true,
      capture: false
    })

    attachEvent(form, 'submit', async function (e) {
      e.preventDefault()
      e.stopPropagation()

      isPageLoading(true)

      generalMessage.classList.add(GENERAL_HIDDEN_CLASS)
      authenticationError.classList.add(GENERAL_HIDDEN_CLASS)
      accountInactiveMessage.classList.add(GENERAL_HIDDEN_CLASS)

      const { error, data } = await loginUser(userField.value, passwordField.value)

      if (error === true) {
        const isAuthError = authenticationError.classList.toggle(GENERAL_HIDDEN_CLASS, ['username', 'password'].includes(data?.payload?.field))
        const isInactive = data?.payload?.reason === 'ACCOUNT_NOT_ACTIVE'

        if (isAuthError) {
          switch (data?.payload?.field) {
            case "username":
              userField.value = ''
              userField.dispatchEvent(blurEvent)

              break
            case "password":
              passwordField.value = ''
              passwordField.dispatchEvent(blurEvent)
          }
        }

        authenticationError.classList.toggle('oculto', !isAuthError)
        accountInactiveMessage.classList.toggle('oculto', !isInactive)
        generalMessage.classList.toggle('oculto', !(isAuthError && isInactive))

        isPageLoading(false)

        return
      }

      generalMessage.classList.add(GENERAL_HIDDEN_CLASS)
      authenticationError.classList.add(GENERAL_HIDDEN_CLASS)
      accountInactiveMessage.classList.add(GENERAL_HIDDEN_CLASS)

      isPageLoading(false)
    }, false)

    isPageLoading(false)

    console.log('[WithTheFlow] Your form is running correctly')
  })
}

