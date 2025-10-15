"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useExpenses } from "@/lib/expense-context"
import type { ExpenseType } from "@/lib/types"
import { formatCurrency, getCurrentMonthRange } from "@/lib/expense-utils"
import { useState } from "react"

const EditIcon = () => (
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
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
)

const DollarIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
)

interface SalaryManagerProps {
  type: ExpenseType
}

export function SalaryManager({ type }: SalaryManagerProps) {
  const { salary, setSalary, getExpensesByDateRange } = useExpenses()
  const [open, setOpen] = useState(false)
  const [salaryValue, setSalaryValue] = useState("")

  const currentMonth = getCurrentMonthRange()
  const expenses = getExpensesByDateRange(currentMonth.start, currentMonth.end, type)
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  const currentSalary = salary.find((s) => s.type === type)?.amount || 0
  const remaining = currentSalary - totalExpenses
  const percentage = currentSalary > 0 ? (totalExpenses / currentSalary) * 100 : 0

  const handleSetSalary = () => {
    setSalary({
      amount: Number.parseFloat(salaryValue),
      type,
    })
    setSalaryValue("")
    setOpen(false)
  }

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
            <DollarIcon />
          </div>
          <CardTitle className="text-slate-800">Salário</CardTitle>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
            >
              <EditIcon />
              <span className="ml-2">Gerenciar</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-br from-white to-green-50 border-2 border-green-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Gerenciar Salário
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Defina seu salário mensal para acompanhar seus gastos
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Salário Mensal (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={salaryValue}
                  onChange={(e) => setSalaryValue(e.target.value)}
                  className="border-green-200 focus:border-green-400 focus:ring-green-400 text-lg"
                />
              </div>
              <Button
                onClick={handleSetSalary}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                disabled={!salaryValue}
              >
                Salvar Salário
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentSalary === 0 ? (
          <p className="text-sm text-slate-600 text-center py-4">
            Nenhum salário definido. Clique em "Gerenciar" para começar.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Salário Mensal</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(currentSalary)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total Gasto</span>
                <span className="text-lg font-bold text-orange-600">{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t-2 border-slate-200">
                <span className="text-sm font-semibold text-slate-700">Restante</span>
                <span className={`text-xl font-bold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(remaining)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Utilizado</span>
                <span className={percentage > 100 ? "text-red-600 font-semibold" : "text-slate-600"}>
                  {percentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    percentage > 100
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : percentage > 80
                        ? "bg-gradient-to-r from-orange-500 to-orange-600"
                        : "bg-gradient-to-r from-green-500 to-emerald-600"
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
