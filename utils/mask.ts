
import {
  type Nullable,
} from '../types/global'

import {
  EMPTY_STRING,
  SLASH_STRING,
} from './consts'

import {
  pushIf,
} from './array'

import {
  objectSize,
} from './dom'

export const BRLFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
})

export function toUpperCase (value: string): string {
  return value.toUpperCase()
}

export function maskCPFNumber (value: string): string {
  return value.replace(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/, (
    _: string,
    g1: Nullable<string>,
    g2: Nullable<string>,
    g3: Nullable<string>,
    g4: Nullable<string>,
  ) => {
    const response: string[] = []

    pushIf(response, `${g1}`, g1)
    pushIf(response, `.${g2}`, g2)
    pushIf(response, `.${g3}`, g3)
    pushIf(response, `-${g4}`, g4)

    return response.join(EMPTY_STRING)
  })
}

export function maskPhoneNumber (value: string): string {
  const replacer = (
    _: string,
    d1: Nullable<string>,
    d2: Nullable<string>,
    d3: Nullable<string>,
  ) => {
    const response: string[] = []

    pushIf(response, `(${d1}`, d1)
    pushIf(response, `) ${d2}`, d2)
    pushIf(response, `-${d3}`, d3)

    return response.join(EMPTY_STRING)
  }

  if (objectSize(value) < 11) {
    return value.replace(/^(\d{0,2})(\d{0,4})(\d{0,4})/, replacer)
  }

  return value.replace(/^(\d{0,2})(\d{0,5})(\d{0,4})/, replacer)
}

export function maskCEP (value: string): string {
  return value.replace(/^(\d{0,5})(\d{0,3})/, (
    _: string,
    g1: Nullable<string>,
    g2: Nullable<string>,
  ) => {
    const response: string[] = []

    for (const group of [g1, g2]) {
      pushIf(response, group, group)
    }

    return response.join('-')
  })
}

export function maskDate (value: string): string {
  return value.replace(/^(\d{0,2})(\d{0,2})(\d{0,4})/, (
    _: string,
    d1: Nullable<string>,
    d2: Nullable<string>,
    d3: Nullable<string>,
  ) => {
    return [d1, d2, d3]
      .filter(Boolean)
      .join(SLASH_STRING)
  })
}

export function maskCardNumber (value: string): string {
  return value.replace(/^(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})/, (
    _: string,
    g1: Nullable<string>,
    g2: Nullable<string>,
    g3: Nullable<string>,
    g4: Nullable<string>,
  ) => {
    const response: string[] = []

    for (const group of [g1, g2, g3, g4]) {
      pushIf(response, group, group)
    }

    return response.join(' ')
  })
}

export function maskCardDate (value: string): string {
  return value.replace(/^(\d{0,2})(\d{0,2})/, (
    _: string,
    g1: Nullable<string>,
    g2: Nullable<string>,
  ) => {
    const response: string[] = []

    for (const group of [g1, g2]) {
      pushIf(response, group, group)
    }

    return response.join(SLASH_STRING)
  })
}
