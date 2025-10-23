export type ExpenseCategory =
  | "alimentacao"
  | "transporte"
  | "moradia"
  | "saude"
  | "educacao"
  | "lazer"
  | "vestuario"
  | "servicos"
  | "outros"

export type ExpenseType = "personal"

export type PaymentMethod = "dinheiro" | "debito" | "credito" | "pix" | "outros"

export interface User {
  id: string
  username: string
  displayName: string
  createdAt: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  category: ExpenseCategory
  type: ExpenseType
  paymentMethod: PaymentMethod
  date: string
  createdAt: string
  notes?: string
  userId: string
  isRecurring?: boolean
  isFixed?: boolean
  recurringEndDate?: string // undefined means indefinite
}

export interface CategoryBudget {
  category: ExpenseCategory
  limit: number
  type: ExpenseType
  userId: string
}

export interface Salary {
  amount: number
  type: ExpenseType
  userId: string
}

export interface ExpenseStats {
  total: number
  byCategory: Record<ExpenseCategory, number>
  byPaymentMethod: Record<PaymentMethod, number>
  count: number
}

export interface Installment {
  id: string
  description: string
  totalAmount: number
  installmentCount: number
  currentInstallment: number
  installmentAmount: number
  category: ExpenseCategory
  type: ExpenseType
  paymentMethod: PaymentMethod
  startDate: string
  dueDay: number
  paidInstallments: number[]
  createdAt: string
  notes?: string
  userId: string
  isIndefinite?: boolean
}
