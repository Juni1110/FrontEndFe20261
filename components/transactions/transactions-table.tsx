"use client"

import { useEffect, useState } from 'react'

import {
  getTransactions,
  deleteTransaction as deleteTransactionApi
} from '@/lib/api/transactions'
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { TrendingUp, TrendingDown, Pencil, Trash2, Receipt, AlertTriangle } from 'lucide-react'
import { getCategoryLabel, type Transaction } from '@/types'

export function TransactionsTable() {
const [transactions, setTransactions] = useState<Transaction[]>([])
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }
useEffect(() => {
  loadTransactions()
}, [])

const loadTransactions = async () => {

  try {

    const data = await getTransactions()

    setTransactions(data as Transaction[])

  } catch (error) {

    console.error(error)

  }
}

const totalIncome = transactions
  .filter(t => t.type === 'income')
  .reduce((acc, t) => acc + t.amount, 0)

const totalExpenses = transactions
  .filter(t => t.type === 'expense')
  .reduce((acc, t) => acc + t.amount, 0)

const balance = totalIncome - totalExpenses
const formatDate = (dateString: string) => {
  // Creamos la fecha a partir del string
  const date = new Date(dateString);
  
  // Usamos Intl.DateTimeFormat pero forzamos la zona horaria a UTC
  // para que no reste horas locales.
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC' // <--- ESTA ES LA CLAVE
  }).format(date);
}

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Receipt className="size-6" />
              </EmptyMedia>
              <EmptyTitle>Sin transacciones</EmptyTitle>
              <EmptyDescription>
                Aun no has registrado ninguna transaccion. Comienza agregando un ingreso o gasto.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
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
                      {getCategoryLabel(transaction.category as never)}
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
                onSuccess={async () => {
                  await loadTransactions()
                  setEditingTransaction(null)
                }}
              />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deletingTransaction}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingTransaction(null)
            setDeleteError(null)
          }
        }}
      >
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
                    {getCategoryLabel(deletingTransaction.category as never)} - {formatDate(deletingTransaction.date)}
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
          {deleteError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { setDeletingTransaction(null); setDeleteError(null) }}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={async () => {
                if (!deletingTransaction) return
                setIsDeleting(true)
                setDeleteError(null)
                try {
                  await deleteTransactionApi(deletingTransaction.id)
                  await loadTransactions()
                  setDeletingTransaction(null)
                } catch (error) {
                  setDeleteError(error instanceof Error ? error.message : 'Error al eliminar la transaccion')
                } finally {
                  setIsDeleting(false)
                }
              }}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
