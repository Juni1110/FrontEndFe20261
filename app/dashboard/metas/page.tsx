"use client"

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { SavingsGoalForm } from '@/components/savings/savings-goal-form'
import { SavingsGoalsList } from '@/components/savings/savings-goals-list'

export default function MetasPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return null
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Metas de Ahorro</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SavingsGoalForm />
        </div>
        <div className="lg:col-span-2">
          <SavingsGoalsList />
        </div>
      </div>
    </div>
  )
}
