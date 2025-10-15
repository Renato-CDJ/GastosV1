"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useExpenses } from "@/lib/expense-context"
import { categoryLabels, formatCurrency } from "@/lib/expense-utils"
import type { ExpenseType } from "@/lib/types"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface InstallmentsPieChartProps {
  type: ExpenseType
}

const CATEGORY_COLORS: Record<string, string> = {
  alimentacao: "#10b981", // green
  transporte: "#3b82f6", // blue
  moradia: "#8b5cf6", // purple
  saude: "#ef4444", // red
  educacao: "#f59e0b", // amber
  lazer: "#ec4899", // pink
  vestuario: "#06b6d4", // cyan
  servicos: "#6366f1", // indigo
  outros: "#64748b", // slate
}

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
)

const ChevronUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
)

export function InstallmentsPieChart({ type }: InstallmentsPieChartProps) {
  const [isVisible, setIsVisible] = useState(true)
  const { getInstallmentsByType } = useExpenses()
  const installments = getInstallmentsByType(type)

  // Group by category
  const categoryData = installments.reduce(
    (acc, inst) => {
      const remaining = inst.installmentAmount * (inst.installmentCount - inst.paidInstallments.length)
      acc[inst.category] = (acc[inst.category] || 0) + remaining
      return acc
    },
    {} as Record<string, number>,
  )

  const chartData = Object.entries(categoryData).map(([category, value]) => ({
    name: categoryLabels[category as keyof typeof categoryLabels] || category,
    value,
    category,
  }))

  if (chartData.length === 0) {
    return null
  }

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-green-50 border-green-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-800">Distribuição por Categoria</CardTitle>
            <p className="text-sm text-slate-600 mt-1">Valores restantes a pagar por categoria</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            {isVisible ? (
              <>
                <ChevronUpIcon />
                <span className="ml-2">Ocultar</span>
              </>
            ) : (
              <>
                <ChevronDownIcon />
                <span className="ml-2">Exibir</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {isVisible && (
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || "#64748b"} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      )}
    </Card>
  )
}
