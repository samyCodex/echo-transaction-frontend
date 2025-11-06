'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@/types/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const userData = localStorage.getItem('user')

    console.log('🔍 useAuth - Checking authentication state')
    console.log('🔍 Token exists:', !!token)
    console.log('🔍 User data exists:', !!userData)
    console.log('🔍 Token value:', token)
    console.log('🔍 User data value:', userData)

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        console.log('✅ Parsed user data:', parsedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('❌ Error parsing user data:', error)
        console.error('❌ Raw user data:', userData)
        logout()
      }
    } else {
      console.log('❌ Missing token or user data - not authenticated')
    }
    
    setIsLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/auth/login')
  }

  const isAuthenticated = !!user

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
  }
}
