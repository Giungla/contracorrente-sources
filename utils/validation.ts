import {
  objectSize,
  numberOnly,
  regexTest,
  splitText,
} from './dom'

import {
  EMPTY_STRING,
  SLASH_STRING,
} from './consts'

export const CPF_VERIFIERS_INDEXES = [10, 11]

export function isCPFValid (cpf: string): boolean {
  cpf = numberOnly(cpf)

  const DIGITS_COUNT_IN_CPF = 11

  if (objectSize(cpf) !== DIGITS_COUNT_IN_CPF || regexTest(/^(\d)\1{10}$/, cpf)) return false

  const verifiers = CPF_VERIFIERS_INDEXES.map((verifierDigit, verifierIndex) => {
    const lastIndex = verifierIndex ? 10 : 9;

    const sum = [...cpf.slice(0, lastIndex)]
      .map(Number)
      .reduce((acc, cur, index) => acc + cur * (verifierDigit - index), 0)

    const result = DIGITS_COUNT_IN_CPF - (sum % DIGITS_COUNT_IN_CPF)

    return result > 9
      ? 0
      : result
  })

  return cpf.endsWith(verifiers.join(EMPTY_STRING))
}

export function isDateValid (date: string): boolean {
  const [
    day,
    month,
    fullYear
  ] = splitText(date, SLASH_STRING)

  const parsedDate = new Date(`${fullYear}-${month}-${day}T00:00:00`)

  if (parsedDate.toString() === 'Invalid Date') return false

  const isSameDay   = parsedDate.getUTCDate()      === Number(day)
  const isSameMonth = parsedDate.getUTCMonth() + 1 === Number(month)
  const isSameYear  = parsedDate.getUTCFullYear()  === Number(fullYear)

  return isSameDay && isSameMonth && isSameYear
}

export function isCreditCardExpireDateValid (expireDate: string): boolean {
  const tokens = splitText(expireDate, SLASH_STRING)

  if (objectSize(tokens) !== 2) return false

  const [monthStr, yearStr] = tokens

  const month = parseInt(monthStr, 10)
  const shortYear = parseInt(yearStr, 10)

  if (isNaN(month) || isNaN(shortYear) || month < 1 || month > 12) return false

  const currentDate = new Date()
  const fullYear = 2000 + (shortYear < 100 ? shortYear : 0)

  const expireDateTime = new Date(fullYear, month, 0, 23, 59, 59)

  return expireDateTime > currentDate
}
