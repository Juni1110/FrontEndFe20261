"use client"

import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { useAuth } from './auth-context'
import type { Transaction, SavingsGoal, GoalContribution, Budget } from '@/types'

interface TransactionsContextType {
  // Transactions
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void
  updateTransaction: (id: string, transaction: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void
  deleteTransaction: (id: string) => void
  totalIncome: number
  totalExpenses: number
  balance: number
  getMonthlyData: (year: number, month: number) => {
    income: number
    expenses: number
    contributions: number
    balance: number
    transactions: Transaction[]
  }

  // Savings Goals
  savingsGoals: SavingsGoal[]
  contributions: GoalContribution[]
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'status' | 'createdAt'>) => void
  addContribution: (goalId: string, amount: number) => void
  totalContributions: number

  // Budget
  budgets: Budget[]
  activeBudget: Budget | null
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt'>) => void
  getBudgetSpent: (budget: Budget) => number
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined)

const TRANSACTIONS_STORAGE_KEY = 'finanzas-transactions'
const SAVINGS_STORAGE_KEY = 'finanzas-savings-goals'
const CONTRIBUTIONS_STORAGE_KEY = 'finanzas-goal-contributions'
const BUDGETS_STORAGE_KEY = 'finanzas-budgets'

export function TransactionsProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { user } = useAuth()
  const userId = user?.id ?? 'guest'

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [contributions, setContributions] = useState<GoalContribution[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])

  const loadStoredData = useCallback(() => {
    try {
      const storedTransactions = JSON.parse(localStorage.getItem(`${TRANSACTIONS_STORAGE_KEY}-${userId}`) || '[]') as Transaction[]
      const storedGoals = JSON.parse(localStorage.getItem(`${SAVINGS_STORAGE_KEY}-${userId}`) || '[]') as SavingsGoal[]
      const storedContributions = JSON.parse(localStorage.getItem(`${CONTRIBUTIONS_STORAGE_KEY}-${userId}`) || '[]') as GoalContribution[]
      const storedBudgets = JSON.parse(localStorage.getItem(`${BUDGETS_STORAGE_KEY}-${userId}`) || '[]') as Budget[]

      setTransactions(storedTransactions)
      setSavingsGoals(storedGoals)
      setContributions(storedContributions)
      setBudgets(storedBudgets)
    } catch {
      setTransactions([])
      setSavingsGoals([])
      setContributions([])
      setBudgets([])
    }
  }, [userId])

  useEffect(() => {
    loadStoredData()
  }, [loadStoredData])

  // Transaction functions
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      userId,
    }

    setTransactions(prev => {
      const next = [newTransaction, ...prev]
      localStorage.setItem(`${TRANSACTIONS_STORAGE_KEY}-${userId}`, JSON.stringify(next))
      return next
    })
  }, [userId])

  const updateTransaction = useCallback((id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    setTransactions(prev => {
      const next = prev.map(t => (t.id === id ? { ...t, ...updates, userId: t.userId ?? userId } : t))
      localStorage.setItem(`${TRANSACTIONS_STORAGE_KEY}-${userId}`, JSON.stringify(next))
      return next
    })
  }, [userId])

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => {
      const next = prev.filter(t => t.id !== id)
      localStorage.setItem(`${TRANSACTIONS_STORAGE_KEY}-${userId}`, JSON.stringify(next))
      return next
    })
  }, [userId])

  // Savings Goals functions
  const addSavingsGoal = useCallback((goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'status' | 'createdAt'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: crypto.randomUUID(),
      currentAmount: 0,
      status: 'in-progress',
      createdAt: new Date().toISOString(),
    }
    setSavingsGoals(prev => {
      const next = [newGoal, ...prev]
      localStorage.setItem(`${SAVINGS_STORAGE_KEY}-${userId}`, JSON.stringify(next))
      return next
    })
  }, [userId])

  const addContribution = useCallback((goalId: string, amount: number) => {
    const newContribution: GoalContribution = {
      id: crypto.randomUUID(),
      goalId,
      amount,
      date: new Date().toISOString(),
    }
    setContributions(prev => {
      const next = [newContribution, ...prev]
      localStorage.setItem(`${CONTRIBUTIONS_STORAGE_KEY}-${userId}`, JSON.stringify(next))
      return next
    })

    setSavingsGoals(prev => {
      const next = prev.map(goal => {
        if (goal.id === goalId) {
          const newAmount = goal.currentAmount + amount
          return {
            ...goal,
            currentAmount: newAmount,
            status: newAmount >= goal.targetAmount ? 'completed' : 'in-progress',
          }
        }
        return goal
      })
      localStorage.setItem(`${SAVINGS_STORAGE_KEY}-${userId}`, JSON.stringify(next))
      return next
    })
  }, [userId])

  // Budget functions
  const addBudget = useCallback((budget: Omit<Budget, 'id' | 'createdAt'>) => {
    const newBudget: Budget = {
      ...budget,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setBudgets(prev => {
      const next = [newBudget, ...prev]
      localStorage.setItem(`${BUDGETS_STORAGE_KEY}-${userId}`, JSON.stringify(next))
      return next
    })
  }, [userId])

  const getBudgetSpent = useCallback((budget: Budget) => {
    return transactions
      .filter(t => {
        const txDate = new Date(t.date)
        const start = new Date(budget.startDate)
        const end = new Date(budget.endDate)
        return t.type === 'expense' && txDate >= start && txDate <= end
      })
      .reduce((sum, t) => sum + t.amount, 0)
  }, [transactions])

  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0)

  const balance = totalIncome - totalExpenses

  const getMonthlyData = useCallback((year: number, month: number) => {
    const monthTransactions = transactions.filter(t => {
      const d = new Date(t.date)
      return d.getFullYear() === year && d.getMonth() === month
    })

    const monthContributions = contributions.filter(c => {
      const d = new Date(c.date)
      return d.getFullYear() === year && d.getMonth() === month
    })

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const contributionsTotal = monthContributions.reduce((sum, c) => sum + c.amount, 0)

    return {
      income,
      expenses,
      contributions: contributionsTotal,
      balance: income - expenses - contributionsTotal,
      transactions: monthTransactions,
    }
  }, [transactions, contributions])

  // Active budget (most recent that includes today)
  const activeBudget = budgets.find(b => {
    const today = new Date()
    const start = new Date(b.startDate)
    const end = new Date(b.endDate)
    return today >= start && today <= end
  }) || null

  const value = useMemo(() => ({
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    totalIncome,
    totalExpenses,
    balance,
    getMonthlyData,
    savingsGoals,
    contributions,
    addSavingsGoal,
    addContribution,
    totalContributions,
    budgets,
    activeBudget,
    addBudget,
    getBudgetSpent,
  }), [transactions, addTransaction, updateTransaction, deleteTransaction, totalIncome, totalExpenses, balance, getMonthlyData, savingsGoals, contributions, addSavingsGoal, addContribution, totalContributions, budgets, activeBudget, addBudget, getBudgetSpent])

  return (
    <TransactionsContext.Provider
      value={value}
    >
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionsContext)
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider')
  }
  return context
}
