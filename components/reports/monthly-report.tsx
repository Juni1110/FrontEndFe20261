"use client"

import { useState } from 'react'
import { useTransactions } from '@/contexts/transactions-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TrendingUp, TrendingDown, Wallet, Target, AlertTriangle, Calendar } from 'lucide-react'
import { getCategoryLabel } from '@/types'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function MonthlyReport() {
  const { getMonthlyData } = useTransactions()
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())

  const monthData = getMonthlyData(selectedYear, selectedMonth)
  const hasData = monthData.transactions.length > 0 || monthData.contributions > 0
  const isNegativeBalance = monthData.balance < 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i)

  // Group transactions by category
  const categoryTotals = monthData.transactions.reduce((acc, t) => {
    const key = `${t.type}-${t.category}`
    if (!acc[key]) {
      acc[key] = { type: t.type, category: t.category, total: 0 }
    }
    acc[key].total += t.amount
    return acc
  }, {} as Record<string, { type: string; category: string; total: number }>)

  const incomeByCategory = Object.values(categoryTotals).filter(c => c.type === 'income')
  const expensesByCategory = Object.values(categoryTotals).filter(c => c.type === 'expense')

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
                <Calendar className="size-5" />
              </div>
              <div>
                <CardTitle>Reporte Mensual</CardTitle>
                <CardDescription>Resumen de movimientos del mes</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedMonth.toString()}
                onValueChange={(val) => setSelectedMonth(parseInt(val))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedYear.toString()}
                onValueChange={(val) => setSelectedYear(parseInt(val))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {!hasData ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center gap-3">
              <div className="flex items-center justify-center size-12 rounded-full bg-muted text-muted-foreground">
                <Calendar className="size-6" />
              </div>
              <div>
                <p className="font-medium">No hay movimientos en este mes</p>
                <p className="text-sm text-muted-foreground">
                  Los datos se mostraran cuando registres transacciones
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-full bg-green-100 text-green-600">
                    <TrendingUp className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ingresos</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(monthData.income)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-full bg-red-100 text-red-600">
                    <TrendingDown className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gastos</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(monthData.expenses)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-full bg-secondary/20 text-secondary">
                    <Target className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Aportes a Metas</p>
                    <p className="text-xl font-bold text-secondary">
                      {formatCurrency(monthData.contributions)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={isNegativeBalance ? 'border-red-200 bg-red-50/50' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center size-10 rounded-full ${
                    isNegativeBalance ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'
                  }`}>
                    {isNegativeBalance ? <AlertTriangle className="size-5" /> : <Wallet className="size-5" />}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Balance Neto</p>
                    <p className={`text-xl font-bold ${
                      isNegativeBalance ? 'text-red-600' : 'text-primary'
                    }`}>
                      {formatCurrency(monthData.balance)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {isNegativeBalance && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-4">
                <div className="flex items-center gap-3 text-red-700">
                  <AlertTriangle className="size-5" />
                  <p className="font-medium">
                    Tus gastos superan tus ingresos este mes. Considera revisar tus gastos.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {incomeByCategory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="size-4 text-green-600" />
                    Ingresos por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    {incomeByCategory
                      .sort((a, b) => b.total - a.total)
                      .map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm">{getCategoryLabel(item.category as never)}</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(item.total)}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {expensesByCategory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingDown className="size-4 text-red-600" />
                    Gastos por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    {expensesByCategory
                      .sort((a, b) => b.total - a.total)
                      .map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm">{getCategoryLabel(item.category as never)}</span>
                          <span className="font-medium text-red-600">
                            {formatCurrency(item.total)}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  )
}
