
import type {
  IScrollIntoViewArgs,
} from '../global'

import {
  getCookie,
} from './cookie'

import {
  AUTH_COOKIE_NAME
} from './requestResponse'

export const NULL_VALUE = null
export const GENERAL_HIDDEN_CLASS = 'oculto'

export const SCROLL_INTO_VIEW_DEFAULT_ARGS: ScrollIntoViewOptions = {
  block: 'center',
  behavior: 'smooth'
}

export function isArray(value: unknown): value is unknown[];
export function isArray<T>(value: T[] | unknown): value is T[];
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

export function isAuthenticated () {
  const hasAuth = getCookie(AUTH_COOKIE_NAME)

  return !!hasAuth
}

export function querySelector<
  K extends keyof HTMLElementTagNameMap,
  T extends HTMLElementTagNameMap[K] | Element | null = HTMLElementTagNameMap[K] | null
>(
  selector: K | string,
  node: HTMLElement | Document | null = document
): T {
  if (!node) return NULL_VALUE as T

  return node.querySelector(selector as string) as T
}

export function attachEvent <
  T extends HTMLElement | Document,
  K extends T extends HTMLElement
    ? keyof HTMLElementEventMap
    : keyof DocumentEventMap
> (
  node: T | null,
  eventName: K,
  callback: (event: T extends HTMLElement
    ? HTMLElementEventMap[K extends keyof HTMLElementEventMap ? K : never]
    : DocumentEventMap[K extends keyof DocumentEventMap ? K : never]
  ) => void,
  options?: boolean | AddEventListenerOptions
): VoidFunction | void {
  if (!node) return

  node.addEventListener(eventName, callback as EventListener, options)

  return () => node.removeEventListener(eventName, callback as EventListener, options)
}

export function addAttribute (element: ReturnType<typeof querySelector>, qualifiedName: string, value: string): void {
  if (!element) return

  element.setAttribute(qualifiedName, value)
}

export function removeAttribute (element: ReturnType<typeof querySelector>, qualifiedName: string): void {
  if (!element) return

  element.removeAttribute(qualifiedName)
}

export function getAttribute (element: ReturnType<typeof querySelector>, qualifiedName: string): Nullable<string> {
  if (!element) return NULL_VALUE

  return element.getAttribute(qualifiedName)
}

export function hasClass (element: ReturnType<typeof querySelector>, className: string): boolean {
  if (!element) return false

  return element.classList.contains(className)
}

export function addClass (element: ReturnType<typeof querySelector>, ...className: string[]): void {
  if (!element) return

  element.classList.add(...className)
}

export function removeClass (element: ReturnType<typeof querySelector>, ...className: string[]): void {
  if (!element) return

  element.classList.remove(...className)
}

export function toggleClass (element: ReturnType<typeof querySelector>, className: string, force?: boolean): boolean {
  if (!element) return false

  return element.classList.toggle(className, force)
}

export function isPageLoading (status: boolean): boolean {
  return toggleClass(querySelector('[data-wtf-loader]'), GENERAL_HIDDEN_CLASS, !status)
}

export function changeTextContent (element: ReturnType<typeof querySelector>, textContent: string | number | boolean) {
  if (!element) return

  element.textContent = typeof textContent === 'string'
    ? textContent
    : textContent.toString()
}

export function buildURL (path: string, query: Record<string, string> = {}): string {
  const baseURL = new URL(`${location.protocol}//${location.hostname}`)

  const nextPage = new URL(path, baseURL)

  for (const [key, value] of Object.entries(query)) {
    nextPage.searchParams.set(key, value)
  }

  return nextPage.toString()
}

export function stringify <T extends object> (value: T): string {
  return JSON.stringify(value)
}

export function safeParseJson <T = unknown> (value: string | null | undefined): T | null {
  if (typeof value !== 'string') return null

  try {
    return JSON.parse(value) as T
  } catch {
    return NULL_VALUE
  }
}

export function numberOnly (value: string): string {
  return value.replace(/\D+/g, '')
}

export function objectSize <T extends string | any[]> (value: T): number {
  return value.length
}

export function EMAIL_REGEX_VALIDATION (): RegExp {
  return /^(([\p{L}\p{N}!#$%&'*+\/=?^_`{|}~-]+(\.[\p{L}\p{N}!#$%&'*+\/=?^_`{|}~-]+)*)|("[\p{L}\p{N}\s!#$%&'*+\/=?^_`{|}~.-]+"))@(([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,63}|(\[(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\]))$/u
}

export function normalizeText (text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export function focusInput (input: ReturnType<typeof querySelector<'input'>>, options?: FocusOptions) {
  if (!input) return

  input.focus(options)
}

export function scrollIntoView (element: ReturnType<typeof querySelector>, args: IScrollIntoViewArgs) {
  if (!element) return

  element.scrollIntoView(args)
}

export function splitText (value: string, separator: string | RegExp, limit?: number): string[] {
  return value.split(separator, limit)
}

export function isNull (v: any): v is null {
  return v === NULL_VALUE
}
