
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
 * @param text {string}
 * @returns    {string}
 */
function normalizeText (text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isAuthenticated () {
  const hasAuth = getCookie('__Host-cc-AuthToken')

  return !!hasAuth
}

/**
 *
 * @param element {HTMLElement}
 * @param args    {boolean | ScrollIntoViewOptions}
 */
function scrollIntoView (element, args) {
  element.scrollIntoView(args)
}

/**
 * @typedef UserDetails
 * @property {string}  name
 * @property {string}  email
 * @property {string}  birthday
 * @property {string}  password
 * @property {string}  telephone
 * @property {boolean} consent
 * @property {boolean} optin
 */

/**
 * @typedef SignUpResponse
 * @property {string} authToken
 * @property {number} maxAge
 */

/**
 * @typedef SignUpErrorResponse
 * @property {string} authToken
 * @property {number} maxAge
 */

/**
 * @typedef SignUpErrorPayload
 * @property {string} reason
 */

/**
 * @typedef SignUpError
 * @property {string}             traceId
 * @property {string}             code
 * @property {string}             message - optional
 * @property {SignUpErrorPayload} payload
 */

/**
 * @typedef SignUpSuccess
 * @property {false} error
 */

/**
 *
 * @param userDetails {UserDetails}
 * @returns {Promise<SignUpError | SignUpSuccess>}
 */
async function postUserInfo (userDetails) {
  const {
    name,
    email,
    password,
    birthday,
    telephone,
    consent,
    optin,
    cpf_cnpj
  } = userDetails

  try {
    const response = await fetch('https://xef5-44zo-gegm.b2.xano.io/api:0FEmfXD_/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        password,
        birthday,
        telephone,
        consent,
        optin,
        cpf_cnpj
      })
    })

    if (!response.ok) {
      const responseText = await response.text()

      return {
        error: true,
        data: JSON.parse(responseText)
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

const CPF_MASK = /^(\d{3})(\d{3})(\d{3})(\d{2})$/
const CNPJ_MASK = /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/
const PASSWORD_MASK = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/g

const CPF_MASK_REPLACER = '$1.$2.$3-$4'
const CNPJ_MASK_REPLACER = '$1.$2.$3/$4-$5'

if (isAuthenticated()) {
  location.href = '/area-do-usuario'
} else {
  attachEvent(document, 'DOMContentLoaded', function () {
    const signupForm = querySelector('[data-wtf-signup-form]')
    const generalLoading = querySelector('[data-wtf-loader]')

    const bodyElement = querySelector('body')
    const generalErrorMessage = querySelector('[data-wtf-signup-general-error-message]')
    const accountExistsMessage = querySelector('[data-wtf-signup-already-registered-error-message]')
    const successfullyCreatedAccountMessage = querySelector('[data-wtf-signup-general-success-message]')

    const nameField = querySelector('[data-wtf-name]')
    const nameFieldError = querySelector('[data-wtf-name-error]')
    const nameFieldWrapper = querySelector('[data-wtf-name-wrapper]')

    const mailField = querySelector('[data-wtf-email]')
    const mailFieldError = querySelector('[data-wtf-email-error]')
    const mailFieldWrapper = querySelector('[data-wtf-email-wrapper]')

    const birthDayField = querySelector('[data-wtf-birthday]')
    const birthDayFieldError = querySelector('[data-wtf-birthday-error]')
    const birthDayFieldWrapper = querySelector('[data-wtf-birthday-wrapper]')

    const CPF_CNPJField = querySelector('[data-wtf-cpf-cnpj]')
    const CPF_CNPJFieldError = querySelector('[data-wtf-cpf-cnpj-error]')
    const CPF_CNPJFieldWrapper = querySelector('[data-wtf-cpf-cnpj-wrapper]')

    const phoneField = querySelector('[data-wtf-phone]')
    const phoneFieldError = querySelector('[data-wtf-phone-error]')
    const phoneFieldWrapper = querySelector('[data-wtf-phone-wrapper]')

    const passwordField = querySelector('[data-wtf-password]')
    const passwordFieldError = querySelector('[data-wtf-password-error]')
    const passwordFieldWrapper = querySelector('[data-wtf-password-wrapper]')

    const confirmPasswordField = querySelector('[data-wtf-confirm-password]')
    const confirmPasswordFieldError = querySelector('[data-wtf-confirm-passwod-error]')
    const confirmPasswordFieldWrapper = querySelector('[data-wtf-confirm-password-wraper]')

    const consentField = querySelector('input[data-wtf-consent-terms-and-conditions]')
    const consentFieldError = querySelector('[data-wtf-terms-and-conditions-error]')
    const consentFieldWrapper = querySelector('[data-wtf-consent-terms-and-conditions-wrapper]')

    const optinField = querySelector('input[data-wtf-optin]')

    const form = querySelector('#wf-form-signup')

    if (!form) {
      throw new Error('[WithTheFlow] Cannot find your form')
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
     * @param cpf {string}
     * @returns   {boolean}
     */
    function validateCPF (cpf){
      cpf = cpf.replace(/\D+/g, '')

      if (cpf.toString().length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

      let result = true

      const validationIndexes = [9, 10]

      validationIndexes.forEach(function(j){
        let soma = 0, r

        cpf
          .split('')
          .splice(0, j)
          .forEach(function(e, i){
            soma += parseInt(e) * ((j + 2) - (i + 1))
          })

        r = soma % 11

        r = (r < 2)
          ? 0
          : 11 - r

        if (r !== parseInt(cpf.substring(j, j + 1))) result = false
      })

      return result
    }

    /**
     *
     * @param cnpj {string}
     * @returns    {boolean}
     */
    function validateCNPJ (cnpj) {
      cnpj = cnpj.replace(/\D+/g, '');

      if (cnpj === '' || cnpj.length !== 14 || /(\d)\1{13}/g.test(cnpj)) return false

      let soma = 0;
      let tamanho = cnpj.length - 2
      let pos = tamanho - 7
      let numeros = cnpj.substring(0, tamanho)
      const digitos = cnpj.substring(tamanho)

      for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--

        if (pos < 2) pos = 9
      }

      let resultado = soma % 11 < 2
        ? 0
        : 11 - soma % 11

      if (resultado !== parseInt(digitos.charAt(0))) return false

      tamanho = tamanho + 1

      numeros = cnpj.substring(0, tamanho)

      soma = 0

      pos = tamanho - 7

      for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--

        if (pos < 2) pos = 9
      }

      resultado = soma % 11 < 2
        ? 0
        : 11 - soma % 11

      return resultado === parseInt(digitos.charAt(1))
    }

    function validateNameField () {
      const isValidName = /^(\w{2,})(\s+(\w+))+$/.test(normalizeText(nameField.value).trim().replace(/\s{2,}/g, ' '))

      const isError = nameFieldWrapper.classList.toggle('errormessage', !isValidName && nameField.value.length > 0)
      nameFieldError.classList.toggle(GENERAL_HIDDEN_CLASS, !isError)

      return [isValidName, 'wtfName']
    }

    /**
     *
     * @returns {[boolean, string]}
     */
    function validateMailField () {
      const isValidMail = mailField.value.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)

      const isError = mailFieldWrapper.classList.toggle('errormessage', !isValidMail && mailField.value.length > 0)
      mailFieldError.classList.toggle(GENERAL_HIDDEN_CLASS, !isError)

      return [isValidMail, 'wtfEmail']
    }

    /**
     *
     * @returns {[boolean, string]}
     */
    function validateCPFCNPJField () {
      const cleanValue = CPF_CNPJField.value.replace(/\D+/g, '')

      let isValid = false

      if (cleanValue.length < 12) {
        isValid = CPF_MASK.test(cleanValue) && validateCPF(cleanValue)
      } else {
        isValid = CNPJ_MASK.test(cleanValue) && validateCNPJ(cleanValue)
      }

      const isError =  CPF_CNPJFieldWrapper.classList.toggle('errormessage', !isValid && CPF_CNPJField.value.length > 0)
      CPF_CNPJFieldError.classList.toggle(GENERAL_HIDDEN_CLASS, !isError)

      return [isValid, 'wtfCpfCnpj']
    }

    /**
     *
     * @returns {[boolean, string]}
     */
    function validateBirthdayField () {
      const date = birthDayField.value

      const isRightPattern = /^(\d{2})\/(\d{2})\/(\d{4})$/g.test(date)

      const [day, month, year] = date.split('/')

      const getTimeFromDate = new Date(`${year}-${month}-${day}T00:00:00`).getTime()

      const isValidDate = isRightPattern && !isNaN(getTimeFromDate) && Date.now() > getTimeFromDate

      const isError = birthDayFieldWrapper.classList.toggle('errormessage', !isValidDate && birthDayField.value.length > 0)
      birthDayFieldError.classList.toggle(GENERAL_HIDDEN_CLASS, !isError)

      return [isValidDate, 'wtfBirthday']
    }

    /**
     *
     * @returns {[boolean, string]}
     */
    function validatePhoneField () {
      const isValidPattern = /^\(\d{2}\)\s\d{4,5}-\d{4}$/g.test(phoneField.value)

      const isNonRepeatedDigits = /^\((\d)\1\)\s\1{4,5}-\1{4}/.test(phoneField.value)

      const isValidPhone = isValidPattern && !isNonRepeatedDigits

      const isError = phoneFieldWrapper.classList.toggle('errormessage', !isValidPhone && phoneField.value.length > 0)
      phoneFieldError.classList.toggle(GENERAL_HIDDEN_CLASS, !isError)

      return [isValidPhone, 'wtfPhone']
    }

    function validatePasswordField () {
      const isValidPassword = PASSWORD_MASK.test(passwordField.value)

      PASSWORD_MASK.lastIndex = 0

      const isError = passwordFieldWrapper.classList.toggle('errormessage', !isValidPassword && passwordField.value.length > 0)
      passwordFieldError.classList.toggle(GENERAL_HIDDEN_CLASS, !isError)

      confirmPasswordField.value.length > 0 && validateConfirmPasswordField()

      return [isValidPassword, 'wtfPassword']
    }

    /**
     *
     * @returns {[boolean, string]}
     */
    function validateConfirmPasswordField () {
      const isValidPassword = passwordField.value === confirmPasswordField.value

      PASSWORD_MASK.lastIndex = 0

      const isError = confirmPasswordFieldWrapper.classList.toggle('errormessage', !isValidPassword && confirmPasswordField.value.length > 0)
      confirmPasswordFieldError.classList.toggle(GENERAL_HIDDEN_CLASS, !isError)

      return [isValidPassword, 'wtfConfirmPassword']
    }

    function validateConsentField () {
      const isValidConsent = consentField.checked

      consentFieldWrapper.classList.toggle('errormessage', !isValidConsent)
      consentFieldError.classList.toggle(GENERAL_HIDDEN_CLASS, isValidConsent)

      return [isValidConsent, 'wtfConsentTermsAndConditions']
    }

    attachEvent(nameField, 'blur', validateNameField)
    attachEvent(mailField, 'blur', validateMailField)
    attachEvent(CPF_CNPJField, 'blur', validateCPFCNPJField)
    attachEvent(birthDayField, 'blur', validateBirthdayField)
    attachEvent(phoneField, 'blur', validatePhoneField)
    attachEvent(passwordField, 'blur', validatePasswordField)
    attachEvent(confirmPasswordField, 'blur', validateConfirmPasswordField)

    attachEvent(CPF_CNPJField, 'input', function (e) {
      let value = e.target.value.replace(/\D+/g, '')

      const len = value.length

      if (len < 7) {
        value = value.replace(/^(\d{3})(\d{1,3})/g, '$1.$2')
      } else if (len < 10) {
        value = value.replace(/(\d{3})(\d{3})(\d{1,3})/g, '$1.$2.$3')
      } else if (len < 12) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/g, CPF_MASK_REPLACER)
      } else if (len < 13) {
        value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})$/, '$1.$2.$3/$4')
      } else {
        value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})$/, CNPJ_MASK_REPLACER)
      }

      e.target.value = value
    })

    attachEvent(birthDayField, 'input', function (e) {
      let value = e.target.value.replace(/\D+/g, '')

      const len = value.length

      if (len > 2 && len < 5) {
        value = value.replace(/^(\d{2})(\d{1,2})$/g, '$1/$2')
      } else if (len >= 5) {
        value = value.replace(/^(\d{2})(\d{2})(\d{1,4})$/g, '$1/$2/$3')
      }

      e.target.value = value
    })

    attachEvent(phoneField, 'input', function (e) {
      let value = e.target.value.replace(/\D+/g, '')

      const len = value.length

      if (len < 3) {
        value = value.replace(/^(\d{1,2})$/, '($1')
      } else if (len <= 6) {
        value = value.replace(/^(\d{2})(\d{1,4})$/, '($1) $2')
      } else if (len <= 10) {
        value = value.replace(/^(\d{2})(\d{4})(\d{1,4})$/, '($1) $2-$3')
      } else if (len === 11) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
      }

      e.target.value = value
    })

    attachEvent(form, 'submit', async function (e) {
      isPageLoading(true)

      e.preventDefault()
      e.stopPropagation()

      const validateFields = [
        validateNameField,
        validateMailField,
        validateCPFCNPJField,
        validateBirthdayField,
        validatePhoneField,
        validatePasswordField,
        validateConfirmPasswordField,
        validateConsentField
      ]

      let cancelRequest = false

      for (let index = 0, len = validateFields.length; index < len; index++) {
        const validator = validateFields[index]

        const [ isValid ] = validator?.()

        if (!isValid && !cancelRequest) cancelRequest = true
      }

      if (cancelRequest) {
        generalErrorMessage.classList.remove(GENERAL_HIDDEN_CLASS)

        isPageLoading(false)

        setTimeout(() => {
          scrollIntoView(generalErrorMessage, SCROLL_INTO_VIEW_DEFAULT_ARGS)
        }, 500)

        return
      }

      const response = await postUserInfo({
        name: nameField.value,
        email: mailField.value,
        password: passwordField.value,
        birthday: birthDayField.value.split('/').reverse().join('-'),
        telephone: phoneField.value,
        consent: consentField.checked,
        optin: optinField.checked,
        cpf_cnpj: CPF_CNPJField.value
      })

      if (response.error && response?.data?.payload?.reason === 'ACCOUNT_EXISTS') {
        accountExistsMessage.classList.remove(GENERAL_HIDDEN_CLASS)
        generalErrorMessage.classList.add(GENERAL_HIDDEN_CLASS)

        isPageLoading(false)

        scrollIntoView(accountExistsMessage, SCROLL_INTO_VIEW_DEFAULT_ARGS)

        return
      }

      if (response.error) {
        accountExistsMessage.classList.add(GENERAL_HIDDEN_CLASS)
        generalErrorMessage.classList.remove(GENERAL_HIDDEN_CLASS)

        isPageLoading(false)

        scrollIntoView(generalErrorMessage, SCROLL_INTO_VIEW_DEFAULT_ARGS)

        return
      }

      accountExistsMessage.classList.add(GENERAL_HIDDEN_CLASS)

      signupForm.classList.toggle(GENERAL_HIDDEN_CLASS, !response.error)
      generalErrorMessage.classList.toggle(GENERAL_HIDDEN_CLASS, !response.error)
      successfullyCreatedAccountMessage.classList.toggle(GENERAL_HIDDEN_CLASS, response.error)

      isPageLoading(false)

      scrollIntoView(successfullyCreatedAccountMessage, SCROLL_INTO_VIEW_DEFAULT_ARGS)
    })

    isPageLoading(false)

    nameField.focus({
      preventScroll: false
    })
  })
}
