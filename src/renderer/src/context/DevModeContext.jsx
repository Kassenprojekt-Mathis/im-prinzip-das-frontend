import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const DevModeContext = createContext(false)

export function DevModeProvider({ children }) {
  const [devMode, setDevMode] = useState(false)

  const toggle = useCallback((e) => {
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault()
      setDevMode((prev) => !prev)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', toggle)
    return () => window.removeEventListener('keydown', toggle)
  }, [toggle])

  return <DevModeContext.Provider value={devMode}>{children}</DevModeContext.Provider>
}

export function useDevMode() {
  return useContext(DevModeContext)
}
