"use client"

import { useEffect } from 'react'
import { generateReport } from '@/lib/api/reports'
import { GENERIC_TITULAR_ID } from '@/lib/api/constants'
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
const [monthData, setMonthData] = useState<any>({
  income: 0,
  expenses: 0,
  contributions: 0,
  balance: 0,
  transactions: [],
})
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  useEffect(() => {

  loadReport()

}, [selectedMonth, selectedYear])

const loadReport = async () => {

  try {

    const payload = {
      mes: selectedMonth + 1,
      anho: selectedYear,
      titularId: GENERIC_TITULAR_ID,
      titular_id: GENERIC_TITULAR_ID,
    }

    const data = await generateReport(payload)

    setMonthData({
      income: data.ingresos || 0,
      expenses: data.gastos || 0,
      contributions: data.aportes || 0,
      balance: data.balance || 0,
      transactions: data.transacciones || [],
    })

  } catch (error) {

    console.error(error)

  }
}

const hasData =
  monthData.transactions?.length > 0 ||
  monthData.contributions > 0

  const isNegativeBalance = monthData.balance < 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i)

  // Group transactions by category
const categoryTotals = (monthData.transactions || []).reduce(
  (acc: any, t: any) => {

    const type =
      t.tipo === 'INGRESO'
        ? 'income'
        : 'expense'

    const key = `${type}-${t.categoria}`

    if (!acc[key]) {
      acc[key] = {
        type,
        category: t.categoria,
        total: 0
      }
    }

    acc[key].total += t.monto

    return acc

  },
  {}
)

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
                          <span className="text-sm">{item.category}</span>
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
