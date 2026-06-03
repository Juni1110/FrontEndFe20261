export interface User {
  id: string
  name: string
  email: string
}

export type TransactionCategory = 
  | 'salario'
  | 'freelance'
  | 'inversiones'
  | 'otros_ingresos'
  | 'alimentacion'
  | 'transporte'
  | 'vivienda'
  | 'entretenimiento'
  | 'salud'
  | 'educacion'
  | 'otros_gastos'

export interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  category: string
  description: string
  date: string
  createdAt?: string
  title?: string
  owner?: string
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  status: 'in-progress' | 'completed'
  createdAt: string
}

export interface GoalContribution {
  id: string
  goalId: string
  amount: number
  date: string
}

export interface Budget {
  id: string
  limitAmount: number
  startDate: string
  endDate: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const INCOME_CATEGORIES: { value: TransactionCategory; label: string }[] = [
  { value: 'salario', label: 'Salario' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'inversiones', label: 'Inversiones' },
  { value: 'otros_ingresos', label: 'Otros Ingresos' },
]

export const EXPENSE_CATEGORIES: { value: TransactionCategory; label: string }[] = [
  { value: 'alimentacion', label: 'Alimentacion' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'vivienda', label: 'Vivienda' },
  { value: 'entretenimiento', label: 'Entretenimiento' },
  { value: 'salud', label: 'Salud' },
  { value: 'educacion', label: 'Educacion' },
  { value: 'otros_gastos', label: 'Otros Gastos' },
]

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]

export function getCategoryLabel(category: TransactionCategory): string {
  const found = ALL_CATEGORIES.find(c => c.value === category)
  return found?.label || category
}
