"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useExpenses } from "@/lib/expense-context"
import { formatCurrency } from "@/lib/expense-utils"

export function ComparisonChart() {
  const { getExpensesByType } = useExpenses()

  const personalExpenses = getExpensesByType("personal")
  const familyExpenses = getExpensesByType("family")

  // Group by month
  const monthlyData: Record<string, { personal: number; family: number }> = {}

  personalExpenses.forEach((expense) => {
    const date = new Date(expense.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { personal: 0, family: 0 }
    }
    monthlyData[monthKey].personal += expense.amount
  })

  familyExpenses.forEach((expense) => {
    const date = new Date(expense.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { personal: 0, family: 0 }
    }
    monthlyData[monthKey].family += expense.amount
  })

  const chartData = Object.entries(monthlyData)
    .map(([month, data]) => {
      const [year, monthNum] = month.split("-")
      const date = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1)
      return {
        month: date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
        personal: data.personal,
        family: data.family,
        sortKey: month,
      }
    })
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .slice(-6)

  if (chartData.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-50 to-purple-50 border-purple-100">
        <CardHeader>
          <CardTitle className="text-slate-800">Comparação Pessoal vs Familiar</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-slate-600 text-sm">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    )
  }

  const maxValue = Math.max(...chartData.flatMap((d) => [d.personal, d.family]))

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-purple-50 border-purple-100">
      <CardHeader>
        <CardTitle className="text-slate-800">Comparação Pessoal vs Familiar</CardTitle>
        <div className="flex items-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm" />
            <span className="text-sm font-medium text-slate-700">Pessoal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-sm" />
            <span className="text-sm font-medium text-slate-700">Familiar</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-between gap-4 p-4 bg-white/50 rounded-lg">
          {chartData.map((item, index) => {
            const personalHeight = (item.personal / maxValue) * 100
            const familyHeight = (item.family / maxValue) * 100
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center gap-2">
                  <div className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatCurrency(item.personal)}
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500 shadow-lg hover:shadow-xl cursor-pointer"
                      style={{ height: `${Math.max(personalHeight, 5)}%` }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-xs font-semibold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatCurrency(item.family)}
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all hover:from-purple-600 hover:to-purple-500 shadow-lg hover:shadow-xl cursor-pointer"
                      style={{ height: `${Math.max(familyHeight, 5)}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-600 text-center">{item.month}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
