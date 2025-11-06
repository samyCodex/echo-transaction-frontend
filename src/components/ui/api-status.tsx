'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

export function ApiStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [apiUrl, setApiUrl] = useState('')

  useEffect(() => {
    const checkApiStatus = async () => {
      const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1/api'
      setApiUrl(url)
      
      try {
        // Simple health check - try to reach the API
        const response = await fetch(`${url}/auth/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          setStatus('connected')
        } else {
          setStatus('disconnected')
        }
      } catch (error) {
        console.log('API Status Check:', error)
        setStatus('disconnected')
      }
    }

    checkApiStatus()
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <div className="flex items-center space-x-2">
        {status === 'checking' && (
          <>
            <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
            <span className="text-gray-600">Checking API...</span>
          </>
        )}
        {status === 'connected' && (
          <>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-green-600">API Connected</span>
          </>
        )}
        {status === 'disconnected' && (
          <>
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-600">API Disconnected</span>
          </>
        )}
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {apiUrl}
      </div>
    </div>
  )
}
