"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useExpenses } from "@/lib/expense-context"
import type { ExpenseType } from "@/lib/types"
import { formatCurrency } from "@/lib/expense-utils"

const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
)

const ChevronUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
)

interface MonthlyTrendChartProps {
  type: ExpenseType
}

export function MonthlyTrendChart({ type }: MonthlyTrendChartProps) {
  const [isVisible, setIsVisible] = useState(true)
  const { getExpensesByType } = useExpenses()

  const expenses = getExpensesByType(type)

  // Group expenses by month
  const monthlyData = expenses.reduce(
    (acc, expense) => {
      const date = new Date(expense.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!acc[monthKey]) {
        acc[monthKey] = 0
      }
      acc[monthKey] += expense.amount

      return acc
    },
    {} as Record<string, number>,
  )

  // Convert to array and sort by date
  const chartData = Object.entries(monthlyData)
    .map(([month, value]) => {
      const [year, monthNum] = month.split("-")
      const date = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1)
      return {
        month: date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
        value: value,
        sortKey: month,
      }
    })
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .slice(-6) // Last 6 months

  if (chartData.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-800">Tendência Mensal</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsVisible(!isVisible)} className="hover:bg-slate-100">
            {isVisible ? <ChevronUpIcon /> : <ChevronDownIcon />}
            <span className="ml-2 text-sm">{isVisible ? "Ocultar" : "Exibir"}</span>
          </Button>
        </CardHeader>
        {isVisible && (
          <CardContent className="h-[300px] flex items-center justify-center">
            <p className="text-slate-500 text-sm">Nenhum dado disponível</p>
          </CardContent>
        )}
      </Card>
    )
  }

  const maxValue = Math.max(...chartData.map((d) => d.value))

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-slate-800">Tendência Mensal (Últimos 6 Meses)</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="hover:bg-slate-100 transition-colors"
        >
          {isVisible ? <ChevronUpIcon /> : <ChevronDownIcon />}
          <span className="ml-2 text-sm font-medium">{isVisible ? "Ocultar" : "Exibir"}</span>
        </Button>
      </CardHeader>
      {isVisible && (
        <CardContent>
          <div className="h-[300px] flex items-end justify-between gap-2 px-2">
            {chartData.map((item, index) => {
              const height = (item.value / maxValue) * 100
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-slate-700">{formatCurrency(item.value)}</span>
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg relative group cursor-pointer"
                      style={{ height: `${Math.max(height, 10)}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-t-lg" />
                    </div>
                  </div>
                  <span className="text-xs text-slate-600 font-medium text-center">{item.month}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
