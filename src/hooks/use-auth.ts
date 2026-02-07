'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  username: string
  name: string
  role: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = () => {
      try {
        const userStr = localStorage.getItem('user')
        if (userStr) {
          const userData = JSON.parse(userStr)
          setUser(userData)
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()

    // Escuchar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        loadUser()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const isAdmin = user?.role === 'ADMIN'
  const isLoggedIn = user !== null

  return {
    user,
    isAdmin,
    isLoggedIn,
    isLoading
  }
}
