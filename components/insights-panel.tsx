"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useExpenses } from "@/lib/expense-context"
import type { ExpenseType } from "@/lib/types"
import { calculateStats, categoryLabels, formatCurrency, getCurrentMonthRange } from "@/lib/expense-utils"

interface InsightsPanelProps {
  type: ExpenseType
}

export function InsightsPanel({ type }: InsightsPanelProps) {
  const { getExpensesByDateRange, budgets } = useExpenses()

  const currentMonth = getCurrentMonthRange()
  const currentExpenses = getExpensesByDateRange(currentMonth.start, currentMonth.end, type)
  const currentStats = calculateStats(currentExpenses)

  // Get previous month
  const prevMonthStart = new Date(currentMonth.start)
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1)
  const prevMonthEnd = new Date(currentMonth.end)
  prevMonthEnd.setMonth(prevMonthEnd.getMonth() - 1)

  const prevExpenses = getExpensesByDateRange(
    prevMonthStart.toISOString().split("T")[0],
    prevMonthEnd.toISOString().split("T")[0],
    type,
  )
  const prevStats = calculateStats(prevExpenses)

  const insights = []

  // Trend comparison
  if (prevStats.total > 0) {
    const change = ((currentStats.total - prevStats.total) / prevStats.total) * 100
    if (Math.abs(change) > 10) {
      insights.push({
        type: change > 0 ? "warning" : "success",
        title: change > 0 ? "Gastos Aumentaram" : "Gastos Diminuíram",
        description: `${Math.abs(change).toFixed(1)}% ${change > 0 ? "acima" : "abaixo"} do mês anterior`,
      })
    }
  }

  // Budget alerts
  const typeBudgets = budgets.filter((b) => b.type === type)
  typeBudgets.forEach((budget) => {
    const spent = currentStats.byCategory[budget.category] || 0
    const percentage = (spent / budget.limit) * 100

    if (percentage > 100) {
      insights.push({
        type: "error",
        title: `Orçamento Excedido: ${categoryLabels[budget.category]}`,
        description: `${formatCurrency(spent - budget.limit)} acima do limite`,
      })
    } else if (percentage > 80) {
      insights.push({
        type: "warning",
        title: `Atenção: ${categoryLabels[budget.category]}`,
        description: `${percentage.toFixed(0)}% do orçamento utilizado`,
      })
    }
  })

  // Top category insight
  const topCategory = Object.entries(currentStats.byCategory).sort(([, a], [, b]) => b - a)[0]
  if (topCategory && currentStats.total > 0) {
    const percentage = (topCategory[1] / currentStats.total) * 100
    if (percentage > 40) {
      insights.push({
        type: "info",
        title: "Categoria Dominante",
        description: `${categoryLabels[topCategory[0] as keyof typeof categoryLabels]} representa ${percentage.toFixed(0)}% dos gastos`,
      })
    }
  }

  if (insights.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-blue-100">
        <CardHeader>
          <CardTitle className="text-slate-800">Insights e Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 text-center py-4">
            Nenhum insight disponível no momento. Continue registrando seus gastos!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-blue-100">
      <CardHeader>
        <CardTitle className="text-slate-800">Insights e Alertas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => {
          return (
            <div
              key={index}
              className={`flex gap-3 p-4 rounded-xl shadow-sm border transition-all hover:shadow-md ${
                insight.type === "error"
                  ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-200"
                  : insight.type === "warning"
                    ? "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200"
                    : insight.type === "success"
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                      : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
              }`}
            >
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  insight.type === "error"
                    ? "bg-gradient-to-br from-red-500 to-rose-600 text-white"
                    : insight.type === "warning"
                      ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white"
                      : insight.type === "success"
                        ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                        : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                }`}
              >
                <span className="text-xl font-bold">
                  {insight.type === "error"
                    ? "!"
                    : insight.type === "warning"
                      ? "⚠"
                      : insight.type === "success"
                        ? "✓"
                        : "ℹ"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-slate-800">{insight.title}</h4>
                  <Badge
                    className={`shrink-0 ${
                      insight.type === "error"
                        ? "bg-red-600 text-white"
                        : insight.type === "warning"
                          ? "bg-orange-600 text-white"
                          : insight.type === "success"
                            ? "bg-green-600 text-white"
                            : "bg-blue-600 text-white"
                    }`}
                  >
                    {insight.type === "error"
                      ? "Crítico"
                      : insight.type === "warning"
                        ? "Atenção"
                        : insight.type === "success"
                          ? "Positivo"
                          : "Info"}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">{insight.description}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
