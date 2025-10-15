"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useExpenses } from "@/lib/expense-context"
import type { ExpenseType } from "@/lib/types"
import { calculateStats, paymentMethodLabels, formatCurrency } from "@/lib/expense-utils"

interface PaymentMethodChartProps {
  type: ExpenseType
  dateRange?: { start: string; end: string }
}

const paymentColors = {
  dinheiro: "#10b981",
  "cartao-credito": "#3b82f6",
  "cartao-debito": "#8b5cf6",
  pix: "#06b6d4",
  outros: "#6b7280",
}

export function PaymentMethodChart({ type, dateRange }: PaymentMethodChartProps) {
  const { getExpensesByType, getExpensesByDateRange } = useExpenses()

  const expenses = dateRange ? getExpensesByDateRange(dateRange.start, dateRange.end, type) : getExpensesByType(type)

  const stats = calculateStats(expenses)

  const chartData = Object.entries(stats.byPaymentMethod)
    .filter(([, value]) => value > 0)
    .map(([method, value]) => ({
      name: paymentMethodLabels[method as keyof typeof paymentMethodLabels],
      value: value,
      color: paymentColors[method as keyof typeof paymentColors] || paymentColors.outros,
    }))
    .sort((a, b) => b.value - a.value)

  if (chartData.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-800">Gastos por Método de Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-slate-500 text-sm">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    )
  }

  const maxValue = Math.max(...chartData.map((d) => d.value))

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-slate-800">Gastos por Método de Pagamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {chartData.map((item, index) => {
          const percentage = (item.value / maxValue) * 100
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{item.name}</span>
                <span className="font-mono font-semibold text-slate-800">{formatCurrency(item.value)}</span>
              </div>
              <div className="relative h-10 bg-slate-200 rounded-lg overflow-hidden shadow-inner">
                <div
                  className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500 shadow-md"
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)`,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-end px-3">
                  <span className="text-xs font-semibold text-white drop-shadow-md">
                    {((item.value / stats.total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
