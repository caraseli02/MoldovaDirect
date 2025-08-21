export const useTheme = () => {
  const theme = useState<'light' | 'dark'>('theme', () => 'light')
  
  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    
    if (process.client) {
      localStorage.setItem('theme', newTheme)
      updateThemeClass(newTheme)
    }
  }
  
  const toggleTheme = () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }
  
  const updateThemeClass = (newTheme: 'light' | 'dark') => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  const initTheme = () => {
    if (process.client) {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light')
      theme.value = initialTheme
      updateThemeClass(initialTheme)
      
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          const newTheme = e.matches ? 'dark' : 'light'
          theme.value = newTheme
          updateThemeClass(newTheme)
        }
      })
    }
  }
  
  return {
    theme: readonly(theme),
    setTheme,
    toggleTheme,
    initTheme
  }
}