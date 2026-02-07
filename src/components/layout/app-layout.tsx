'use client'

import { Sidebar } from './sidebar'
import { Header } from './header'
import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    try {
      const userData = JSON.parse(userStr)
      setUser(userData)
    } catch (error) {
      router.push('/login')
    }
  }, [router])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header userName={user.name} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
