"use client"

import { useState } from 'react'
import { useTransactions } from '@/contexts/transactions-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Empty } from '@/components/ui/empty'
import { Target, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import type { SavingsGoal } from '@/types'

export function SavingsGoalsList() {
  const { savingsGoals, addContribution } = useTransactions()
  const [contributionAmounts, setContributionAmounts] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleContribution = (goal: SavingsGoal) => {
    const amountStr = contributionAmounts[goal.id] || ''
    const amount = parseFloat(amountStr)

    if (goal.status === 'completed') {
      setErrors(prev => ({ ...prev, [goal.id]: 'Esa meta ya fue alcanzada' }))
      return
    }

    if (isNaN(amount) || amount <= 0) {
      setErrors(prev => ({ ...prev, [goal.id]: 'Ingresa un monto valido' }))
      return
    }

    addContribution(goal.id, amount)
    setContributionAmounts(prev => ({ ...prev, [goal.id]: '' }))
    setErrors(prev => ({ ...prev, [goal.id]: '' }))
  }

  const getProgress = (goal: SavingsGoal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
  }

  if (savingsGoals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <Empty
            icon={Target}
            title="Sin metas de ahorro"
            description="Crea tu primera meta de ahorro para comenzar a rastrear tu progreso."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Mis Metas ({savingsGoals.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savingsGoals.map((goal) => {
          const progress = getProgress(goal)
          const isCompleted = goal.status === 'completed'

          return (
            <Card key={goal.id} className={isCompleted ? 'border-green-200 bg-green-50/50' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle2 className="size-5 text-green-600" />
                    ) : (
                      <Target className="size-5 text-primary" />
                    )}
                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isCompleted 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {isCompleted ? 'Completada' : 'En progreso'}
                  </span>
                </div>
                {goal.deadline && (
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Clock className="size-3" />
                    Fecha limite: {formatDate(goal.deadline)}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span className="text-muted-foreground">de {formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>

                {!isCompleted && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Monto a aportar"
                        value={contributionAmounts[goal.id] || ''}
                        onChange={(e) => {
                          setContributionAmounts(prev => ({ ...prev, [goal.id]: e.target.value }))
                          setErrors(prev => ({ ...prev, [goal.id]: '' }))
                        }}
                        className="flex-1"
                      />
                      <Button onClick={() => handleContribution(goal)} size="icon">
                        <Plus className="size-4" />
                      </Button>
                    </div>
                    {errors[goal.id] && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="size-3" />
                        {errors[goal.id]}
                      </p>
                    )}
                  </div>
                )}

                {isCompleted && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="size-4" />
                    Meta alcanzada
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
