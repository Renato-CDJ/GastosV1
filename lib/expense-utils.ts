import type { Expense, ExpenseCategory, ExpenseStats, PaymentMethod } from "./types"

export const categoryLabels: Record<ExpenseCategory, string> = {
  alimentacao: "Alimentação",
  transporte: "Transporte",
  moradia: "Moradia",
  saude: "Saúde",
  educacao: "Educação",
  lazer: "Lazer",
  vestuario: "Vestuário",
  servicos: "Serviços",
  outros: "Outros",
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  dinheiro: "Dinheiro",
  debito: "Débito",
  credito: "Crédito",
  pix: "PIX",
  outros: "Outros",
}

export const categoryColors: Record<ExpenseCategory, string> = {
  alimentacao: "hsl(var(--chart-1))",
  transporte: "hsl(var(--chart-2))",
  moradia: "hsl(var(--chart-3))",
  saude: "hsl(var(--chart-4))",
  educacao: "hsl(var(--chart-5))",
  lazer: "hsl(var(--chart-1))",
  vestuario: "hsl(var(--chart-2))",
  servicos: "hsl(var(--chart-3))",
  outros: "hsl(var(--chart-4))",
}

export function calculateStats(expenses: Expense[]): ExpenseStats {
  const stats: ExpenseStats = {
    total: 0,
    byCategory: {} as Record<ExpenseCategory, number>,
    byPaymentMethod: {} as Record<PaymentMethod, number>,
    count: expenses.length,
  }

  expenses.forEach((expense) => {
    stats.total += expense.amount
    stats.byCategory[expense.category] = (stats.byCategory[expense.category] || 0) + expense.amount
    stats.byPaymentMethod[expense.paymentMethod] = (stats.byPaymentMethod[expense.paymentMethod] || 0) + expense.amount
  })

  return stats
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date))
}

export function getMonthName(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date)
}

export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  }
}
