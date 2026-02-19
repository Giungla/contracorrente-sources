
import {
  type DirectiveBinding,
} from 'vue'

import {
  EMPTY_STRING,
} from './consts'

import {
  attachEvent,
} from './dom'

import {
  INPUT_EVENT,
} from './events'

export const eventMap: WeakMap<HTMLElement, ReturnType<typeof attachEvent>> = new WeakMap()

export const cleanupDirective = (el: HTMLInputElement) => {
  const cleanup = eventMap.get(el)

  if (!cleanup) return

  cleanup()

  eventMap.delete(el)
}

export function buildMaskDirective (...mappers: ((value: string) => string)[]) {
  return {
    mounted(el: HTMLInputElement, binding: DirectiveBinding<string, string, keyof HTMLElementEventMap>) {
      const eventType = binding.arg ?? 'input'

      const remover = attachEvent(el, eventType, (event: Event) => {
        if (!event.isTrusted) return

        const target = event.target as HTMLInputElement

        target.value = mappers.reduce((value, callbackFn) => callbackFn(value), target.value ?? EMPTY_STRING)

        el.dispatchEvent(INPUT_EVENT)
      })

      eventMap.set(el, remover)
    },

    unmounted: cleanupDirective,
  }
}