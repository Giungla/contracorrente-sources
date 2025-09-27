
export const EMPTY_STRING = ''
export const XANO_BASE_URL = 'https://xef5-44zo-gegm.b2.xano.io'

export {
  COOKIE_SEPARATOR,
  setCookie,
  getCookie,
  splitCookie,
} from './cookie'

export {
  GET,
  PUT,
  HEAD,
  POST,
  PATCH,
  DELETE,
  AUTH_COOKIE_NAME,
  TALHO_SESSION_COOKIE_NAME,
  TALHO_SESSION_HEADER_NAME,
  postErrorResponse,
  postSuccessResponse,
  buildRequestOptions,
} from './requestResponse'

export {
  timestampDays,
  SECONDS_IN_A_DAY,
} from './dates'

export {
  BRLFormatter,
} from './mask'

export {
  NULL_VALUE,
  GENERAL_HIDDEN_CLASS,
  SCROLL_INTO_VIEW_DEFAULT_ARGS,
  splitText,
  isArray,
  hasClass,
  addClass,
  removeClass,
  toggleClass,
  changeTextContent,
  addAttribute,
  removeAttribute,
  getAttribute,
  attachEvent,
  querySelector,
  isPageLoading,
  scrollIntoView,
  buildURL,
  stringify,
  normalizeText,
  safeParseJson,
  numberOnly,
  objectSize,
  focusInput,
  isNull,
  isAuthenticated,
  EMAIL_REGEX_VALIDATION,
} from './dom'

export {
  clamp,
  decimalRound,
} from './math'

export {
  statesMap,
  statesValues,
  statesAcronym,
} from './consts'
