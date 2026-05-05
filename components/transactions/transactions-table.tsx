"use client"

import { useState } from 'react'
import { useTransactions } from '@/contexts/transactions-context'
import { TransactionForm } from './transaction-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Empty } from '@/components/ui/empty'
import { TrendingUp, TrendingDown, Pencil, Trash2, Receipt, AlertTriangle } from 'lucide-react'
import { getCategoryLabel, type Transaction } from '@/types'

export function TransactionsTable() {
  const { transactions, totalIncome, totalExpenses, balance, deleteTransaction } = useTransactions()
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)

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

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <Empty
            icon={Receipt}
            title="Sin transacciones"
            description="Aun no has registrado ninguna transaccion. Comienza agregando un ingreso o gasto."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-full bg-green-100 text-green-600">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Ingresos</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
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
                <p className="text-sm text-muted-foreground">Total Gastos</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center size-10 rounded-full ${balance >= 0 ? 'bg-primary/10 text-primary' : 'bg-red-100 text-red-600'}`}>
                {balance >= 0 ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className={`text-xl font-bold ${balance >= 0 ? 'text-primary' : 'text-red-600'}`}>
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas las Transacciones</CardTitle>
          <CardDescription>{transactions.length} transacciones registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descripcion</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {transaction.type === 'income' ? (
                        <div className="flex items-center justify-center size-8 rounded-full bg-green-100 text-green-600">
                          <TrendingUp className="size-4" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center size-8 rounded-full bg-red-100 text-red-600">
                          <TrendingDown className="size-4" />
                        </div>
                      )}
                      <span className="capitalize">
                        {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-md bg-muted text-sm">
                      {getCategoryLabel(transaction.category)}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {transaction.description || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingTransaction(transaction)}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar transaccion</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingTransaction(transaction)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Eliminar transaccion</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingTransaction} onOpenChange={(open) => !open && setEditingTransaction(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Transaccion</DialogTitle>
            <DialogDescription>
              Modifica los datos de la transaccion seleccionada.
            </DialogDescription>
          </DialogHeader>
          {editingTransaction && (
            <TransactionForm
              editTransaction={editingTransaction}
              onCancel={() => setEditingTransaction(null)}
              onSuccess={() => setEditingTransaction(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingTransaction} onOpenChange={(open) => !open && setDeletingTransaction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Eliminar Transaccion
            </DialogTitle>
            <DialogDescription>
              ¿Estas seguro de eliminar esta transaccion? Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {deletingTransaction && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {deletingTransaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getCategoryLabel(deletingTransaction.category)} - {formatDate(deletingTransaction.date)}
                  </p>
                </div>
                <p className={`text-lg font-bold ${
                  deletingTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(deletingTransaction.amount)}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletingTransaction(null)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (deletingTransaction) {
                  deleteTransaction(deletingTransaction.id)
                  setDeletingTransaction(null)
                }
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
