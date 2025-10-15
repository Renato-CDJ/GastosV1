"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useExpenses } from "@/lib/expense-context"
import type { ExpenseType } from "@/lib/types"
import { calculateStats, formatCurrency } from "@/lib/expense-utils"

const TrendingDownIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
    <polyline points="17 18 23 18 23 12"></polyline>
  </svg>
)

const ReceiptIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"></path>
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
    <path d="M12 18V6"></path>
  </svg>
)

const WalletIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
  </svg>
)

const CreditCardIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
)

interface StatsCardsProps {
  type: ExpenseType
  dateRange?: { start: string; end: string }
}

export function StatsCards({ type, dateRange }: StatsCardsProps) {
  const { getExpensesByType, getExpensesByDateRange } = useExpenses()

  const expenses = dateRange ? getExpensesByDateRange(dateRange.start, dateRange.end, type) : getExpensesByType(type)

  const stats = calculateStats(expenses)

  const topCategory = Object.entries(stats.byCategory).sort(([, a], [, b]) => b - a)[0]
  const topPaymentMethod = Object.entries(stats.byPaymentMethod).sort(([, a], [, b]) => b - a)[0]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-red-700">Total de Gastos</CardTitle>
          <div className="text-red-600">
            <TrendingDownIcon />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-red-700">{formatCurrency(stats.total)}</div>
          <p className="text-xs text-red-600 mt-1">{stats.count} transações</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">Média por Gasto</CardTitle>
          <div className="text-blue-600">
            <ReceiptIcon />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-blue-700">
            {stats.count > 0 ? formatCurrency(stats.total / stats.count) : formatCurrency(0)}
          </div>
          <p className="text-xs text-blue-600 mt-1">Valor médio</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700">Categoria Principal</CardTitle>
          <div className="text-emerald-600">
            <WalletIcon />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            {topCategory ? formatCurrency(topCategory[1]) : formatCurrency(0)}
          </div>
          <p className="text-xs text-emerald-600 mt-1 capitalize">
            {topCategory ? topCategory[0].replace("_", " ") : "Nenhuma"}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-amber-700">Método Mais Usado</CardTitle>
          <div className="text-amber-600">
            <CreditCardIcon />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-amber-700">
            {topPaymentMethod ? formatCurrency(topPaymentMethod[1]) : formatCurrency(0)}
          </div>
          <p className="text-xs text-amber-600 mt-1 capitalize">
            {topPaymentMethod ? topPaymentMethod[0].replace("_", " ") : "Nenhum"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
