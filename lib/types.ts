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

export type ExpenseType = "personal" | "family"

export type PaymentMethod = "dinheiro" | "debito" | "credito" | "pix" | "outros"

export type UserRole = "admin" | "user"

export interface UserPermissions {
  canAccessPersonal: boolean
  canAccessFamily: boolean
  canAccessInstallments: boolean
}

export interface User {
  id: string
  username: string
  displayName: string
  createdAt: string
  role: UserRole
  permissions: UserPermissions
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
  userId?: string
}

export interface CategoryBudget {
  category: ExpenseCategory
  limit: number
  type: ExpenseType
  userId?: string
}

export interface Salary {
  amount: number
  type: ExpenseType
  userId?: string
}

export interface FamilyMember {
  id: string
  name: string
  salary: number
  createdAt: string
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
  userId?: string
}
