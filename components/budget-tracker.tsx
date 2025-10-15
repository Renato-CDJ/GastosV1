"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useExpenses } from "@/lib/expense-context"
import type { ExpenseCategory, ExpenseType } from "@/lib/types"
import { calculateStats, categoryLabels, formatCurrency, getCurrentMonthRange } from "@/lib/expense-utils"
import { useState } from "react"

const PlusIcon = () => (
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
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

const AlertTriangleIcon = () => (
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
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
)

interface BudgetTrackerProps {
  type: ExpenseType
}

export function BudgetTracker({ type }: BudgetTrackerProps) {
  const { budgets, setBudget, getExpensesByDateRange } = useExpenses()
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<ExpenseCategory>("alimentacao")
  const [limit, setLimit] = useState("")

  const currentMonth = getCurrentMonthRange()
  const expenses = getExpensesByDateRange(currentMonth.start, currentMonth.end, type)
  const stats = calculateStats(expenses)

  const typeBudgets = budgets.filter((b) => b.type === type)

  const handleSetBudget = () => {
    setBudget({
      category,
      limit: Number.parseFloat(limit),
      type,
    })
    setLimit("")
    setOpen(false)
  }

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-slate-800">Orçamento por Categoria</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
            >
              <PlusIcon />
              <span className="ml-2">Definir Limite</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-br from-white to-green-50 border-2 border-green-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Definir Limite de Orçamento
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Configure um limite mensal para uma categoria específica
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Categoria</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                  <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Limite Mensal (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="border-green-200 focus:border-green-400 focus:ring-green-400"
                />
              </div>
              <Button
                onClick={handleSetBudget}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                disabled={!limit}
              >
                Salvar Limite
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {typeBudgets.length === 0 ? (
          <p className="text-sm text-slate-600 text-center py-4">
            Nenhum orçamento definido. Clique em "Definir Limite" para começar.
          </p>
        ) : (
          typeBudgets.map((budget) => {
            const spent = stats.byCategory[budget.category] || 0
            const percentage = (spent / budget.limit) * 100
            const isOverBudget = percentage > 100

            return (
              <div key={budget.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{categoryLabels[budget.category]}</span>
                  <div className="flex items-center gap-2">
                    {isOverBudget && (
                      <span className="text-red-600">
                        <AlertTriangleIcon />
                      </span>
                    )}
                    <span className={isOverBudget ? "text-red-600 font-semibold" : "text-slate-600"}>
                      {formatCurrency(spent)} / {formatCurrency(budget.limit)}
                    </span>
                  </div>
                </div>
                <Progress value={Math.min(percentage, 100)} className={isOverBudget ? "bg-red-100" : "bg-green-100"} />
                <p className="text-xs text-slate-500 text-right">{percentage.toFixed(1)}% utilizado</p>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
