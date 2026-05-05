"use client"

import { TransactionForm } from '@/components/transactions/transaction-form'

export default function TransaccionPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Nueva Transaccion</h1>
        <p className="text-muted-foreground mt-1">Registra tus ingresos y gastos</p>
      </div>
      
      <TransactionForm />
    </div>
  )
}
