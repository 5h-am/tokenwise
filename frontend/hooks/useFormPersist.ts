'use client'

import { useEffect, useState } from 'react'

export function useFormPersist<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    const stored = window.localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : initialValue
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])

  return [state, setState] as const
}
