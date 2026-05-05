"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTransactions } from '@/contexts/transactions-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Check } from 'lucide-react'
import { 
  INCOME_CATEGORIES, 
  EXPENSE_CATEGORIES, 
  type Transaction, 
  type TransactionCategory 
} from '@/types'

interface TransactionFormProps {
  editTransaction?: Transaction
  onCancel?: () => void
  onSuccess?: () => void
}

export function TransactionForm({ editTransaction, onCancel, onSuccess }: TransactionFormProps) {
  const router = useRouter()
  const { addTransaction, updateTransaction } = useTransactions()
  const [type, setType] = useState<'income' | 'expense'>(editTransaction?.type || 'income')
  const [amount, setAmount] = useState(editTransaction?.amount?.toString() || '')
  const [category, setCategory] = useState<TransactionCategory | ''>(editTransaction?.category || '')
  const [description, setDescription] = useState(editTransaction?.description || '')
  const [date, setDate] = useState(editTransaction?.date || new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const isEditing = !!editTransaction

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type)
      setAmount(editTransaction.amount.toString())
      setCategory(editTransaction.category)
      setDescription(editTransaction.description)
      setDate(editTransaction.date)
    }
  }, [editTransaction])

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType)
    setCategory('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const amountNumber = parseFloat(amount)
    if (isNaN(amountNumber) || amountNumber <= 0) {
      setError('Por favor ingresa un monto valido mayor a cero')
      return
    }

    if (!category) {
      setError('Por favor selecciona una categoria')
      return
    }

    if (!date) {
      setError('Por favor selecciona una fecha')
      return
    }

    if (isEditing && editTransaction) {
      updateTransaction(editTransaction.id, {
        amount: amountNumber,
        type,
        category: category as TransactionCategory,
        description: description.trim(),
        date,
      })
      onSuccess?.()
    } else {
      addTransaction({
        amount: amountNumber,
        type,
        category: category as TransactionCategory,
        description: description.trim(),
        date,
      })

      setSuccess(true)
      setAmount('')
      setCategory('')
      setDescription('')
      setDate(new Date().toISOString().split('T')[0])

      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Transaccion' : 'Nueva Transaccion'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Modifica los datos de la transaccion' : 'Registra un ingreso o gasto'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label>Tipo de Transaccion</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all",
                  type === 'income'
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-border hover:border-green-300"
                )}
              >
                <TrendingUp className="size-5" />
                <span className="font-medium">Ingreso</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all",
                  type === 'expense'
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-border hover:border-red-300"
                )}
              >
                <TrendingDown className="size-5" />
                <span className="font-medium">Gasto</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Monto *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select value={category} onValueChange={(val) => setCategory(val as TransactionCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Fecha *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descripcion (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Describe la transaccion..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {success && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              <Check className="size-4" />
              <span>Transaccion guardada exitosamente</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              {isEditing ? 'Guardar Cambios' : 'Ingresar Transaccion'}
            </Button>
            {isEditing ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            ) : (
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push('/dashboard/historial')}
              >
                Ver Historial
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
