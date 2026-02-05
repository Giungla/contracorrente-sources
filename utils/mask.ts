import {
  type Nullable,
} from '../types/global'

import {
  EMPTY_STRING,
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

export function maskCPFNumber (value: string): string {
  return value.replace(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/, (
    _: string,
    g1: Nullable<string>,
    g2: Nullable<string>,
    g3: Nullable<string>,
    g4: Nullable<string>,
  ) => {
    const response: string[] = []

    pushIf(g1, response, `${g1}`)
    pushIf(g2, response, `.${g2}`)
    pushIf(g3, response, `.${g3}`)
    pushIf(g4, response, `-${g4}`)

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

    pushIf(d1, response, `(${d1}`)
    pushIf(d2, response, `) ${d2}`)
    pushIf(d3, response, `-${d3}`)

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
      pushIf(group, response, group)
    }

    return response.join('-')
  })
}
