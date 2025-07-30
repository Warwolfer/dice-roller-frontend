import { ref, watch, Ref } from 'vue'

export function useLocalStorage<T>(key: string, initialValue: T): [Ref<T>, (value: T | ((val: T) => T)) => void] {
  // Get from local storage then parse stored json or return initialValue
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }

  const storedValue = ref<T>(readValue())

  // Function to set value with support for updater functions
  const setValue = (value: T | ((val: T) => T)) => {
    if (typeof window === 'undefined') {
      console.warn(
        `Tried setting localStorage key "${key}" even though environment is not a client`
      )
      return
    }
    try {
      // Allow value to be a function so we have same API as React useState
      const newValue = typeof value === 'function' ? (value as (val: T) => T)(storedValue.value) : value
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(newValue))
      // Save state
      storedValue.value = newValue
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  // Note: setValue already handles localStorage updates, so no watcher needed

  return [storedValue, setValue]
}