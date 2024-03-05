
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
  // attachEvent(document, 'DOMContentLoaded', function () {
    // Selecting the elements for email
    const userField   = document.querySelector('[data-wtf-user]')
    const userFieldWrapper = document.querySelector('[data-wtf-user-wrapper]')
    const userErrorWrapper = document.querySelector('[data-wtf-user-error]')

    if (!userField) {
      throw new Error('[WithTheFlow] Cannot find a field with the \'data-wtf-user\' attribute')
    }

    // Selecting the elements for password
    const passwordField = document.querySelector('[data-wtf-password]')
    const passwordFieldWrapper = document.querySelector('[data-wtf-password-wrapper]')
    const passwordErrorWrapper = document.querySelector('[data-wtf-password-error]')

    if (!passwordField) {
      throw new Error('[WithTheFlow] Cannot find a field with the \'data-wtf-password\' attribute')
    }

    const form = userField.closest('form')

    if (!form) {
      throw new Error('[WithTheFlow] Cannot find a form wrapping your fields')
    }

    // Function to send login request to the server
    /**
     *
     * @param email {string}
     * @param password {string}
     * @returns {Promise<void>}
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

        const data = await response.json()

        setCookie('__Host-cc-AuthToken', data.authToken, {
          path: '/',
          secure: true,
          sameSite: 'Strict',
          expires: new Date(Date.now() + 31_556_952_000)
        })

        location.href = '/area-do-usuario'
      } catch (error) {
        console.warn('[WithTheFlow] Error during login', error.message)
      }
    }

    /**
     *
     * @param email {string}
     * @return      {boolean}
     */
    function validateEmail (email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      return re.test(String(email).toLowerCase())
    }

    // Function for password validation
    /**
     *
     * @param password {string}
     * @returns        {boolean}
     */
    function validatePassword (password) {
      const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/

      return re.test(password)
    }

  /**
   *
   * @param event {Event}
   */
  function handleFocus (event) {
      const wrapper = event.target === userField
        ? userFieldWrapper
        : passwordFieldWrapper

      wrapper.style.border = '1px solid #e39623'
    }

  /**
   *
   * @param event {Event}
   */
  function handleBlur (event) {
      const isEmailField = event.target === userField

      const wrapper = isEmailField
        ? userFieldWrapper
        : passwordFieldWrapper

      const isValid = isEmailField
        ? validateEmail(userField.value)
        : validatePassword(passwordField.value)

      wrapper.style.border = isValid
        ? '1px solid rgba(233, 233, 233, 0.4)'
        : '1px solid red'

      wrapper.previousElementSibling.style.display = isValid
        ? 'none'
        : 'block'
    }

    const formFields = [
      userField,
      passwordField
    ]

    for (let index = 0, len = formFields.length; index < len; index++) {
      attachEvent(formFields[index], 'focus', handleFocus, {
        passive: true,
        capture: false
      })

      attachEvent(formFields[index], 'blur', handleBlur, {
        passive: true,
        capture: false
      })
    }

    attachEvent(form, 'submit', async function (e) {
      e.preventDefault()
      e.stopPropagation()

      await loginUser(userField.value, passwordField.value)
    }, false)

    console.log('[WithTheFlow] Your form is running correctly')
  // })
}

