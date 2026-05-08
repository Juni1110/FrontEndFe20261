"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

import {
  type Transaction,
} from '@/types'

import { getCategories } from '@/lib/api/categories'

import {
  createTransaction as createTransactionApi,
  updateTransaction as updateTransactionApi
} from '@/lib/api/transactions'

interface TransactionFormProps {
  editTransaction?: Transaction
  onCancel?: () => void
  onSuccess?: () => void
}

export function TransactionForm({
  editTransaction,
  onCancel,
  onSuccess
}: TransactionFormProps) {

  const router = useRouter()

  const [type, setType] = useState<'income' | 'expense'>(
    editTransaction?.type || 'income'
  )

  const [amount, setAmount] = useState(
    editTransaction?.amount?.toString() || ''
  )

  const [category, setCategory] = useState('')

  const [description, setDescription] = useState(
    editTransaction?.description || ''
  )

  const [date, setDate] = useState(
    editTransaction?.date || new Date().toISOString().split('T')[0]
  )

  const [categories, setCategories] = useState<any[]>([])

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const isEditing = !!editTransaction

  useEffect(() => {

    if (editTransaction) {

      setType(editTransaction.type)
      setAmount(editTransaction.amount.toString())
      setDescription(editTransaction.description)
      setDate(editTransaction.date)

    }

  }, [editTransaction])

  useEffect(() => {

    loadCategories()

  }, [])

  const loadCategories = async () => {

    try {

      const data = await getCategories()

      console.log(data)

      setCategories(data)

    } catch (error) {

      console.error(error)

    }
  }

  const handleTypeChange = (newType: 'income' | 'expense') => {

    setType(newType)
    setCategory('')

  }

  const handleSubmit = async (e: React.FormEvent) => {

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

    try {

      const payload = {
        descripcion: description.trim(),
        monto: amountNumber,
        tipo: type === 'income' ? 'INGRESO' : 'GASTO',
        categoriaId: category,
        fecha: date,
      }

      console.log(payload)

      if (isEditing && editTransaction) {

        await updateTransactionApi(editTransaction.id, payload)

        onSuccess?.()

      } else {

        await createTransactionApi(payload)

        setSuccess(true)

        setAmount('')
        setCategory('')
        setDescription('')
        setDate(new Date().toISOString().split('T')[0])

        setTimeout(() => {

          setSuccess(false)

        }, 3000)

        onSuccess?.()
      }

    } catch (err) {

      console.error(err)

      setError('Error al guardar la transacción')

    }
  }

  return (
    <Card className="w-full max-w-lg">

      <CardHeader>

        <CardTitle>
          {isEditing ? 'Editar Transaccion' : 'Nueva Transaccion'}
        </CardTitle>

        <CardDescription>
          {isEditing
            ? 'Modifica los datos de la transaccion'
            : 'Registra un ingreso o gasto'}
        </CardDescription>

      </CardHeader>

      <CardContent>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >

          <div className="flex flex-col gap-2">

            <Label>Tipo de Transaccion</Label>

            <div className="flex gap-3">

              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={cn(
                  "flex-1 py-3 border-2 rounded-md flex items-center justify-center gap-2",
                  type === 'income'
                    ? "border-green-500"
                    : "border-border"
                )}
              >
                <TrendingUp className="size-4" />
                Ingreso
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={cn(
                  "flex-1 py-3 border-2 rounded-md flex items-center justify-center gap-2",
                  type === 'expense'
                    ? "border-red-500"
                    : "border-border"
                )}
              >
                <TrendingDown className="size-4" />
                Gasto
              </button>

            </div>

          </div>

          <div className="flex flex-col gap-2">

            <Label>Monto</Label>

            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />

          </div>

          <div className="flex flex-col gap-2">

            <Label>Categoria</Label>

            <Select
                value={category}
                onValueChange={setCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoria" />
                </SelectTrigger>

                <SelectContent>
                    {categories.map((category, index) => (
                      <SelectItem
                        key={index}
                        value={category.nombre}
                      >
                        {category.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
              </Select>
          </div>

          <div className="flex flex-col gap-2">

            <Label>Fecha</Label>

            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

          </div>

          <div className="flex flex-col gap-2">

            <Label>Descripcion</Label>

            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe la transaccion"
            />

          </div>

          {error && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}

          {success && (
            <p className="text-green-500 text-sm">
              Guardado correctamente
            </p>
          )}

          <Button type="submit">

            {isEditing
              ? 'Guardar Cambios'
              : 'Ingresar Transaccion'}

          </Button>

        </form>

      </CardContent>

    </Card>
  )
}