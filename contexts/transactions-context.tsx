"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
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

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [contributions, setContributions] = useState<GoalContribution[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])

  // Transaction functions
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setTransactions(prev => [newTransaction, ...prev])
  }, [])

  const updateTransaction = useCallback((id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    )
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }, [])

  // Savings Goals functions
  const addSavingsGoal = useCallback((goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'status' | 'createdAt'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: crypto.randomUUID(),
      currentAmount: 0,
      status: 'in-progress',
      createdAt: new Date().toISOString(),
    }
    setSavingsGoals(prev => [newGoal, ...prev])
  }, [])

  const addContribution = useCallback((goalId: string, amount: number) => {
    const newContribution: GoalContribution = {
      id: crypto.randomUUID(),
      goalId,
      amount,
      date: new Date().toISOString(),
    }
    setContributions(prev => [newContribution, ...prev])

    setSavingsGoals(prev =>
      prev.map(goal => {
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
    )
  }, [])

  // Budget functions
  const addBudget = useCallback((budget: Omit<Budget, 'id' | 'createdAt'>) => {
    const newBudget: Budget = {
      ...budget,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setBudgets(prev => [newBudget, ...prev])
  }, [])

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

  return (
    <TransactionsContext.Provider
      value={{
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
      }}
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
