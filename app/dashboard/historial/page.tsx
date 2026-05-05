"use client"

import { TransactionsTable } from '@/components/transactions/transactions-table'

export default function HistorialPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Historial</h1>
        <p className="text-muted-foreground mt-1">Revisa todas tus transacciones</p>
      </div>
      
      <TransactionsTable />
    </div>
  )
}
