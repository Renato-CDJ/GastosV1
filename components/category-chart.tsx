"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useExpenses } from "@/lib/expense-context"
import type { ExpenseType } from "@/lib/types"
import { calculateStats, categoryLabels, categoryColors, formatCurrency } from "@/lib/expense-utils"

interface CategoryChartProps {
  type: ExpenseType
  dateRange?: { start: string; end: string }
}

export function CategoryChart({ type, dateRange }: CategoryChartProps) {
  const { getExpensesByType, getExpensesByDateRange } = useExpenses()

  const expenses = dateRange ? getExpensesByDateRange(dateRange.start, dateRange.end, type) : getExpensesByType(type)

  const stats = calculateStats(expenses)

  const chartData = Object.entries(stats.byCategory)
    .filter(([, value]) => value > 0)
    .map(([category, value]) => ({
      name: categoryLabels[category as keyof typeof categoryLabels],
      value: value,
      color: categoryColors[category as keyof typeof categoryColors],
      percentage: (value / stats.total) * 100,
    }))
    .sort((a, b) => b.value - a.value)

  if (chartData.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-800">Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-slate-500 text-sm">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-slate-800">Gastos por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {chartData.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full shadow-md border-2 border-white"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-slate-700">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-500">{item.percentage.toFixed(1)}%</span>
                <span className="font-mono font-semibold text-slate-800">{formatCurrency(item.value)}</span>
              </div>
            </div>
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-500 shadow-sm"
                style={{
                  width: `${item.percentage}%`,
                  background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)`,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
