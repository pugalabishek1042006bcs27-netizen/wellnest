import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isGuest, setIsGuest] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for guest mode first
    const storedTheme = localStorage.getItem('theme')
    const darkModeEnabled = storedTheme === 'dark'
    setIsDarkMode(darkModeEnabled)
    document.body.classList.toggle('dark-mode', darkModeEnabled)

    const guestMode = sessionStorage.getItem('guestMode')
    if (guestMode === 'true') {
      const guestUser = {
        fullName: sessionStorage.getItem('guestFullName') || 'Guest User',
        email: 'guest@wellnest.local'
      }
      const guestProfile = sessionStorage.getItem('guestProfile')
      
      setUser(guestUser)
      setIsGuest(true)
      if (guestProfile) {
        setProfile(JSON.parse(guestProfile))
      }
      setLoading(false)
      return
    }

    // Otherwise check for regular authenticated user
    const rememberPreference = localStorage.getItem('rememberMe')
    const activeStorage = rememberPreference === 'false' ? sessionStorage : localStorage
    const storedToken = activeStorage.getItem('token')
    const storedUser = {
      fullName: activeStorage.getItem('fullName'),
      email: activeStorage.getItem('email')
    }
    const storedProfile = activeStorage.getItem('profile')

    if (storedToken && storedUser.fullName) {
      setToken(storedToken)
      setUser(storedUser)
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile))
      }
    }
    setLoading(false)
  }, [])

  const login = (userData, rememberMe = true) => {
    const targetStorage = rememberMe ? localStorage : sessionStorage

    // Ensure stale auth data is removed from the non-selected storage.
    localStorage.removeItem('token')
    localStorage.removeItem('fullName')
    localStorage.removeItem('email')
    localStorage.removeItem('profile')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('fullName')
    sessionStorage.removeItem('email')
    sessionStorage.removeItem('profile')
    sessionStorage.removeItem('guestMode')
    sessionStorage.removeItem('guestFullName')
    sessionStorage.removeItem('guestProfile')

    localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false')

    setUser(userData)
    setToken(userData.token)
    setIsGuest(false)
    targetStorage.setItem('token', userData.token)
    targetStorage.setItem('fullName', userData.fullName)
    targetStorage.setItem('email', userData.email)
  }

  const loginAsGuest = (guestName = 'Guest User') => {
    // Clear any existing auth data
    localStorage.removeItem('token')
    localStorage.removeItem('fullName')
    localStorage.removeItem('email')
    localStorage.removeItem('profile')
    localStorage.removeItem('rememberMe')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('fullName')
    sessionStorage.removeItem('email')
    sessionStorage.removeItem('profile')

    // Set up guest mode
    const guestUser = {
      fullName: guestName,
      email: 'guest@wellnest.local'
    }

    sessionStorage.setItem('guestMode', 'true')
    sessionStorage.setItem('guestFullName', guestName)
    
    setUser(guestUser)
    setToken(null)
    setIsGuest(true)
  }

  const updateProfile = (profileData) => {
    setProfile(profileData)
    
    if (isGuest) {
      sessionStorage.setItem('guestProfile', JSON.stringify(profileData))
    } else {
      const rememberPreference = localStorage.getItem('rememberMe')
      const activeStorage = rememberPreference === 'false' ? sessionStorage : localStorage
      activeStorage.setItem('profile', JSON.stringify(profileData))
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setProfile(null)
    setIsGuest(false)
    localStorage.removeItem('token')
    localStorage.removeItem('fullName')
    localStorage.removeItem('email')
    localStorage.removeItem('profile')
    localStorage.removeItem('rememberMe')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('fullName')
    sessionStorage.removeItem('email')
    sessionStorage.removeItem('profile')
    sessionStorage.removeItem('guestMode')
    sessionStorage.removeItem('guestFullName')
    sessionStorage.removeItem('guestProfile')
  }

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const nextValue = !prev
      localStorage.setItem('theme', nextValue ? 'dark' : 'light')
      document.body.classList.toggle('dark-mode', nextValue)
      return nextValue
    })
  }

  const value = {
    user,
    token,
    profile,
    isGuest,
    login,
    loginAsGuest,
    logout,
    updateProfile,
    isDarkMode,
    toggleDarkMode,
    isAuthenticated: !!token || isGuest
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}