"use client"

import { useState } from 'react'
import { createSavingGoal } from '@/lib/api/saving-goals'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Target } from 'lucide-react'

export function SavingsGoalForm() {

  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {

  e.preventDefault()

  setError('')
  setSuccess(false)

  if (!name.trim()) {
    setError('Por favor ingresa un nombre para la meta')
    return
  }

  const amount = parseFloat(targetAmount)

  if (isNaN(amount) || amount <= 0) {
    setError('El monto objetivo debe ser mayor a cero')
    return
  }

  if (deadline) {

    const deadlineDate = new Date(deadline)

    const today = new Date()

    today.setHours(0, 0, 0, 0)

    if (deadlineDate < today) {
      setError('La fecha limite debe ser una fecha futura')
      return
    }
  }

  try {

    const payload = {
      nombre: name.trim(),
      montoObjetivo: amount,
      fechaLimite: deadline || null,
      montoActual: 0
    }

    await createSavingGoal(payload)

    setSuccess(true)

    setName('')
    setTargetAmount('')
    setDeadline('')

    setTimeout(() => {
      setSuccess(false)
    }, 3000)

  } catch (error) {

    console.error(error)

    setError('Error creando meta')
  }
}
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
            <Target className="size-5" />
          </div>
          <div>
            <CardTitle>Nueva Meta de Ahorro</CardTitle>
            <CardDescription>Define tu objetivo financiero</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nombre de la Meta *</Label>
            <Input
              id="name"
              placeholder="Ej: Vacaciones, Fondo de emergencia..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="targetAmount">Monto Objetivo *</Label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="deadline">Fecha Limite (opcional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {success && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              <Check className="size-4" />
              <span>Meta creada exitosamente</span>
            </div>
          )}

          <Button type="submit" className="w-full">
            Crear Meta
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
