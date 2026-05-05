"use client"

import { useState } from 'react'
import { useTransactions } from '@/contexts/transactions-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Empty } from '@/components/ui/empty'
import { Check, PiggyBank, AlertTriangle, Wallet, TrendingDown } from 'lucide-react'

export function BudgetManager() {
  const { budgets, activeBudget, addBudget, getBudgetSpent } = useTransactions()
  const [limitAmount, setLimitAmount] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const amount = parseFloat(limitAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('El monto limite debe ser mayor a cero')
      return
    }

    if (!startDate || !endDate) {
      setError('Por favor selecciona las fechas de inicio y fin')
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('El rango de fechas no es valido')
      return
    }

    addBudget({
      limitAmount: amount,
      startDate,
      endDate,
    })

    setSuccess(true)
    setLimitAmount('')
    setStartDate('')
    setEndDate('')

    setTimeout(() => {
      setSuccess(false)
    }, 3000)
  }

  const activeBudgetSpent = activeBudget ? getBudgetSpent(activeBudget) : 0
  const activeBudgetRemaining = activeBudget ? activeBudget.limitAmount - activeBudgetSpent : 0
  const activeBudgetProgress = activeBudget 
    ? Math.min((activeBudgetSpent / activeBudget.limitAmount) * 100, 100) 
    : 0
  const isOverBudget = activeBudget && activeBudgetSpent > activeBudget.limitAmount

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
                <PiggyBank className="size-5" />
              </div>
              <div>
                <CardTitle>Nuevo Presupuesto</CardTitle>
                <CardDescription>Define un limite de gastos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="limitAmount">Monto Limite *</Label>
                <Input
                  id="limitAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="startDate">Fecha Inicio *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="endDate">Fecha Fin *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {success && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                  <Check className="size-4" />
                  <span>Presupuesto creado exitosamente</span>
                </div>
              )}

              <Button type="submit" className="w-full">
                Crear Presupuesto
              </Button>
            </form>
          </CardContent>
        </Card>

        {activeBudget ? (
          <Card className={isOverBudget ? 'border-red-200 bg-red-50/50' : 'border-green-200 bg-green-50/50'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center size-10 rounded-lg ${
                    isOverBudget ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {isOverBudget ? <AlertTriangle className="size-5" /> : <Wallet className="size-5" />}
                  </div>
                  <div>
                    <CardTitle className="text-lg">Presupuesto Activo</CardTitle>
                    <CardDescription>
                      {formatDate(activeBudget.startDate)} - {formatDate(activeBudget.endDate)}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {isOverBudget && (
                <div className="flex items-center gap-2 text-red-700 bg-red-100 p-3 rounded-lg">
                  <AlertTriangle className="size-5" />
                  <p className="font-medium">Has excedido tu presupuesto definido</p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progreso de Gastos</span>
                  <span className={`font-medium ${isOverBudget ? 'text-red-600' : ''}`}>
                    {activeBudgetProgress.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={activeBudgetProgress} 
                  className={`h-3 ${isOverBudget ? '[&>div]:bg-red-500' : ''}`} 
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-3 bg-background rounded-lg">
                  <span className="text-xs text-muted-foreground">Presupuesto</span>
                  <span className="font-bold">{formatCurrency(activeBudget.limitAmount)}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-background rounded-lg">
                  <span className="text-xs text-muted-foreground">Gastado</span>
                  <span className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-orange-600'}`}>
                    {formatCurrency(activeBudgetSpent)}
                  </span>
                </div>
                <div className="flex flex-col items-center p-3 bg-background rounded-lg">
                  <span className="text-xs text-muted-foreground">Disponible</span>
                  <span className={`font-bold ${activeBudgetRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(activeBudgetRemaining)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12">
              <Empty
                icon={PiggyBank}
                title="Sin presupuesto activo"
                description="Crea un presupuesto para controlar tus gastos."
              />
            </CardContent>
          </Card>
        )}
      </div>

      {budgets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Presupuestos</CardTitle>
            <CardDescription>{budgets.length} presupuestos creados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {budgets.map((budget) => {
                const spent = getBudgetSpent(budget)
                const isOver = spent > budget.limitAmount
                const isActive = activeBudget?.id === budget.id

                return (
                  <div 
                    key={budget.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isActive ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center size-8 rounded-full ${
                        isOver ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {isOver ? <TrendingDown className="size-4" /> : <Wallet className="size-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{formatCurrency(budget.limitAmount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                          {isActive && <span className="ml-2 text-primary font-medium">(Activo)</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${isOver ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {formatCurrency(spent)} gastado
                      </p>
                      <p className={`text-xs ${
                        budget.limitAmount - spent < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(budget.limitAmount - spent)} restante
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
