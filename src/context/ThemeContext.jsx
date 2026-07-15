import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('diswall_theme') === 'dark'
  })

  useEffect(() => {
    localStorage.setItem('diswall_theme', dark ? 'dark' : 'light')
    document.body.style.background = dark ? '#313338' : '#F7F6FB'
  }, [dark])

  const toggle = () => setDark(prev => !prev)

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}