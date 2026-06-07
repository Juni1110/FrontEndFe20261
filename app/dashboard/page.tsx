"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { generateReport } from '@/lib/api/reports'
import { GENERIC_TITULAR_ID } from '@/lib/api/constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet, User, Target } from 'lucide-react'

interface MonthSummary {
  income: number
  expenses: number
  contributions: number
  balance: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<MonthSummary>({ income: 0, expenses: 0, contributions: 0, balance: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const now = new Date()
    generateReport({
      mes: now.getMonth() + 1,
      anho: now.getFullYear(),
      titularId: GENERIC_TITULAR_ID,
    })
      .then((data: any) => {
        setSummary({
          income:        data.ingresosAcumulados      ?? 0,
          expenses:      data.gastosAcumulados        ?? 0,
          contributions: data.aportesMetaAcumulados   ?? 0,
          balance:       data.balanceNeto             ?? 0,
        })
      })
      .catch(() => {
        setSummary({ income: 0, expenses: 0, contributions: 0, balance: 0 })
      })
      .finally(() => setIsLoading(false))
  }, [])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)

  const now = new Date()
  const monthLabel = now.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bienvenido, {user?.name}</h1>
        <p className="text-muted-foreground mt-1">
          Resumen de tus finanzas — {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos del mes</CardTitle>
            <TrendingUp className="size-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {isLoading ? '...' : formatCurrency(summary.income)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gastos del mes</CardTitle>
            <TrendingDown className="size-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {isLoading ? '...' : formatCurrency(summary.expenses)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aportes a Metas</CardTitle>
            <Target className="size-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {isLoading ? '...' : formatCurrency(summary.contributions)}
            </p>
          </CardContent>
        </Card>

        <Card className={!isLoading && summary.balance < 0 ? 'border-red-200 bg-red-50/50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Balance Neto</CardTitle>
            <Wallet className={`size-5 ${summary.balance < 0 ? 'text-red-500' : 'text-primary'}`} />
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${summary.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {isLoading ? '...' : formatCurrency(summary.balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Perfil de Usuario
          </CardTitle>
          <CardDescription>Tu informacion personal</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-lg font-semibold">{user?.name}</p>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
