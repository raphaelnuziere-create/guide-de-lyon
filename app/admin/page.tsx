'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Rediriger vers le dashboard admin
    router.push('/admin/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Redirection...</h1>
        <p className="text-gray-600">Redirection vers le tableau de bord admin...</p>
      </div>
    </div>
  )
}