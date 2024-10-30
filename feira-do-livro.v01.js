
(function () {
  'use strict';

  const GENERAL_HIDDEN_CLASS = 'oculto'

  /**
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
      cookieOptions.push(`domain=${options?.domain}`)
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

  /**
   * @param str {string}
   * @returns   {string}
   */
  function numbersOnly (str) {
    return str.replace(/\D+/g, '')
  }

  /**
   * @param text {string}
   * @returns    {string}
   */
  function normalizeText (text) {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  }

  const form = querySelector('#wf-form-Feira-do-Livro')

  const parent = form.parentElement

  form.remove()

  parent.innerHTML = form.outerHTML

  const feiraForm = querySelector('#wf-form-Feira-do-Livro')

  const loader = querySelector('[data-wtf-loader]')

  const nameField = querySelector('[data-wtf-full-name-promo-registration]')
  const emailField = querySelector('[data-wtf-email-promo-registration]')
  const numberField = querySelector('[data-wtf-whatsapp-promo-registration]')

  const nameError = querySelector('[data-wtf-full-name-promo-registration-error-message]')
  const emailError = querySelector('[data-wtf-email-promo-registration-error-message]')
  const numberError = querySelector('[data-wtf-whatsapp-promo-registration-errorr-message]')

  const errorMessage = querySelector('[data-wtf-redirect-error-message]')
  const successMessage = querySelector('[data-wtf-redirect-success-message]')

  async function postCouponRequirement () {
    try {
      const response = await fetch('https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/events', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: nameField.value,
          email: emailField.value,
          number: numberField.value,
          event: 'feira-do-livro-usp'
        })
      })

      if (!response.ok) {
        return {
          error: true,
          data: JSON.parse(await response.text())
        }
      }

      const data = await response.json()

      return {
        data,
        error: false
      }
    } catch (e) {
      console.error('[FEIRA DO LIVRO]', e)

      return {
        error: true,
        data: JSON.parse(e.responseText)
      }
    }
  }

  attachEvent(feiraForm, 'input', function (e) {
    if (e.target.matches('[data-wtf-full-name-promo-registration]')) {
      nameError.classList.add(GENERAL_HIDDEN_CLASS)
      nameField.parentElement.classList.remove('errormessage')

      return false
    }

    if (e.target.matches('[data-wtf-email-promo-registration]')) {
      emailError.classList.add(GENERAL_HIDDEN_CLASS)
      emailField.parentElement.classList.remove('errormessage')

      return false
    }

    if (e.target.matches('[data-wtf-whatsapp-promo-registration]')) {
      handleNumberMask(e.target)

      numberError.classList.add(GENERAL_HIDDEN_CLASS)
      numberField.parentElement.classList.remove('errormessage')

      return false
    }
  })

  attachEvent(feiraForm, 'focusout', validateFields)

  /**
   * @param element {HTMLInputElement}
   */
  function handleNumberMask (element) {
    const value = numbersOnly(element.value), size = value.length

    if (size > 0 && size < 3) {
      element.value = value.replace(/^(\d{1,2})$/, '($1')

      return
    }

    if (size < 7) {
      element.value = value.replace(/^(\d{2})(\d+)$/, '($1) $2')

      return
    }

    if (size < 11) {
      element.value = value.replace(/^(\d{2})(\d{4})(\d{1,4})$/, '($1) $2-$3')

      return
    }

    element.value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  }

  /**
   * @param e {FocusEvent}
   * @returns {boolean}
   */
  function validateFields (e) {
    if (e.target.matches('[data-wtf-full-name-promo-registration]') && !/^\S+\s+\S+/.test(normalizeText(nameField.value))) {
      nameField.focus({
        preventScroll: false
      })

      nameError.classList.remove(GENERAL_HIDDEN_CLASS)
      nameField.parentElement.classList.add('errormessage')

      return false
    }

    if (e.target.matches('[data-wtf-email-promo-registration]') && !/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(normalizeText(emailField.value))) {
      emailField.focus({
        preventScroll: false
      })

      emailError.classList.remove(GENERAL_HIDDEN_CLASS)
      emailField.parentElement.classList.add('errormessage')

      return false
    }

    if (e.target.matches('[data-wtf-whatsapp-promo-registration]') && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(numberField.value)) {
      numberField.focus({
        preventScroll: false
      })

      numberError.classList.remove(GENERAL_HIDDEN_CLASS)
      numberField.parentElement.classList.add('errormessage')

      return false
    }

    return true
  }

  attachEvent(feiraForm, 'submit', async function (e) {
    e.preventDefault()
    e.stopImmediatePropagation()

    if (!validateFields(e)) return;

    loader.classList.remove(GENERAL_HIDDEN_CLASS)

    const { data, error } = await postCouponRequirement()

    if (!error) {
      feiraForm.reset()
    }

    successMessage.classList.toggle(GENERAL_HIDDEN_CLASS, error)
    errorMessage.classList.toggle(GENERAL_HIDDEN_CLASS, !error)

    setTimeout(() => {
      successMessage.classList.add(GENERAL_HIDDEN_CLASS)
      errorMessage.classList.add(GENERAL_HIDDEN_CLASS)
    }, 5000)

    loader.classList.add(GENERAL_HIDDEN_CLASS)
  })

  querySelector('[type="submit"]', feiraForm).removeAttribute('disabled')

  loader.classList.add(GENERAL_HIDDEN_CLASS)

})()
